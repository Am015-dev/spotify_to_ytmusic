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
//   a curse behind the door hits at once ............................ kick3, doorcurse
//   no monster behind the door: loot a card or look for trouble ..... trouble (do), loot (do)
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
  deal(0,['elf','gargantuan','hexlvl','bucket','swash','fizz','rod']);   // the Lizards come later: you hear them when you listen at the door (turn 2)
  deal(1,['elf','dwarf','halfling','mixed','rascal','gooey','antler','kneecaps']);
  deal(2,['dwarf','dwarf','elf','double','stompy','cudgel','pole','sandwich']);
  P(1).lvl=3;P(2).lvl=3;P(1).lv='normal';P(2).lv='normal'}
// the treasure you draw for beating the Lizards: first draw (Backstabber's Shiv), then the Treasure Pile (3 more cards at once: Sour Drink, Snooze Syrup, Jerkin)
function tutStackTreasure(){const take=key=>{const i=G.tr.findIndex(id=>G.C[id]===key);return i>=0?G.tr.splice(i,1)[0]:null};
  const order=['jerkin','snooze','sour','pile','shiv'].map(take).filter(x=>x!=null);   // pushed last = drawn first: shiv (first draw), pile, sour, snooze, jerkin
  for(const id of order)G.tr.push(id)}
// a curse for your third door (Rotten Luck: lose a level), and a harmless door card for the computer heroes' second round
function tutTopCurse(){for(const k of ['hexlvl','hexgoose','hexgust'])if(tutTop(k))return true;return false}
function tutTopSafe(){const i=G.door.findIndex(id=>{const c=cd(id);return c.t!=='monster'&&c.t!=='curse'&&c.sp!=='divine'});if(i<0)return false;G.door.push(G.door.splice(i,1)[0]);return true}
function tutTop(key){const i=G.door.findIndex(id=>G.C[id]===key);if(i<0)return false;const id=G.door.splice(i,1)[0];G.door.push(id);return true}
// the die: find a generator state whose next d6 is v (rnd() adds 0x6D2B79F5 to G.rng first)
function tutRoll(v){for(let r=1;r<5000;r++){let t=r+0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);if(1+Math.floor(((t^t>>>14)>>>0)/4294967296*6)===v){G.rng=r;return true}}return false}
// ---------------------------------------------------------------- the computer heroes are scripted, so every rule appears on cue
function tutAI(s){if(!tutOn()||!G||s===0)return null;const vm=validMoves(s),p=P(s);const by=a=>vm.find(m=>m.act===a);
  if(G.q){if(G.q.kind==='help')return {act:'opt',opt:s===1?'yes':'no'};return null}
  switch(G.phase){
    case 'setup':{const pl=vm.find(m=>(m.act==='play'||m.act==='equip')&&m.card!=null&&(cd(m.card).t==='item'||(cd(m.card).t==='race'&&!p.race.length))&&!(cd(m.card).t==='item'&&cd(m.card).req&&!!equipWhy(p,m.card)));return pl||by('ready')}
    case 'window':return by('pass');
    case 'main':if(G.turn>3)tutTopSafe();else if(s===1)tutTop('imp');else tutTop('double');return by('kick');
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
function tcard(key){const e=tcardEl(key);if(!tvis(e))return null;let r=e.getBoundingClientRect();if(r.left<4||r.right>innerWidth-4){try{dkReveal(e)}catch(x){}r=e.getBoundingClientRect()}
  for(const c of document.querySelectorAll('.hcue')){const q=c.getBoundingClientRect();if(q.width&&q.right>r.left+2&&q.left<r.right-2&&q.bottom>r.top&&q.top<r.bottom)c.style.display='none'}   // the hand's scroll cue never sits on the card a step points at
  return hslice(e)}
const tclear=()=>!document.getElementById('bfrev')&&!BF.kicking&&UI.pass==null&&!GX.open&&document.getElementById('modal').hidden&&!BF.drag;
const tmine=()=>!!G&&!G.winner&&sideToAct()===0&&!G.q&&tclear();
const nowStr=()=>{const cb=G.cb;return cb?[sideStr(cb),monStr(cb)]:[0,0]};
const tpick=key=>()=>myId(key);
// asking for help is possible right now (no rival window pending); the Help step waits for it, the next step reopens the ask mode if a race closed it
const tcanAsk=()=>sideToAct()===0&&validMoves(0).some(m=>m.act==='ask');
function tAskOpen(){if(BF.ask||!G.cb||G.cb.help>=0||!tcanAsk()||!tclear())return;BF.pick=null;BF.ask=true;try{bfMark()}catch(e){}}
// ---------------------------------------------------------------- the steps
function tutSteps(){
  return [
 {id:'goal',title:'Race to level 10',say:'First hero to level 10 wins. The last level needs a monster.',target:tq('.bfbig','.mine .top'),wait:null,
   ready:()=>G.phase==='setup'&&tmine()&&!!document.querySelector('.bfbig')},
 {id:'elf',title:'Play your race',say:'Tap your Elf, then your hero. Races give powers.',target:tq('.bfbig'),also:()=>tcard('elf'),pick:tpick('elf'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='elf'},from:()=>tcard('elf'),ready:()=>G.phase==='setup'&&tmine()&&BF.pick==null&&!!tcard('elf')&&!!document.querySelector('.bfbig')},
 {id:'powers',title:'Races and classes',say:'Elves run away better. Classes give other powers.',target:tq('.mine .gear'),wait:null,
   ready:()=>G.phase==='setup'&&tmine()&&P(0).race.length>0},
 {id:'bucket',title:'Wear an item',say:()=>'Tap the Bucket, then your hero. Worn items add strength.',target:tq('.bfbig'),also:()=>tcard('bucket'),pick:tpick('bucket'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='bucket'},from:()=>tcard('bucket'),ready:()=>G.phase==='setup'&&tmine()&&BF.pick==null&&!!tcard('bucket')&&!!document.querySelector('.bfbig')},
 {id:'ready',title:'Ready!',say:'Everyone gears up before the first door. Tap Ready.',target:tq(mv('ready')),
   wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='ready'},ready:()=>G.phase==='setup'&&tmine()&&P(0).eq.some(e=>e.on)&&BF.pick==null},
 {id:'sellbtn',title:'Sell for a level',say:'Sell 1,000 gold of items for one level. Tap Sell.',target:tq('#prompt [data-a="sellmode"]'),
   wait:{type:'tap',match:a=>a.what==='sellmode'},ready:()=>G.phase==='main'&&G.active===0&&tmine()&&!UI.sell},
 {id:'sellpick',title:'Pick what to sell',say:()=>'Tap the Rod: it is worth '+cd(myId('rod')).g.toLocaleString('en')+' gold.',target:()=>tcard('rod'),
   wait:{type:'tap',match:a=>a.what==='sellpick'&&kdef(a.id)==='rod'},ready:()=>tmine()&&!!UI.sell&&!!tcard('rod')},
 {id:'sellconfirm',title:'Cash it in',say:'Over 1,000 gold. Tap Sell for a free level.',target:tq('.sellbar .btn.primary'),
   wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='sell'},ready:()=>tmine()&&!!UI.sell&&UI.sell.length>0&&!!tq('.sellbar .btn.primary:not([disabled])')()},
 {id:'kick',title:'Kick open the door',say:'Tap the door to kick it open.',target:tq('.bfdoor'),wait:{type:'tap',match:a=>a.what==='kick'},
   ready:()=>G.phase==='main'&&G.active===0&&tmine()&&P(0).lvl>=2&&!!document.querySelector('.bfdoor')&&(tutTop('hatmuncher'),true)},
 {id:'potion',title:'Strength vs level',say:()=>{const [a,b]=nowStr();return 'Its level '+b+', your strength '+a+'. Tap potion, then your side.'},target:tq('.arena .score.hero'),also:()=>[tcard('fizz'),tq('.arena .sline')()].filter(Boolean),pick:tpick('fizz'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='fizz'&&a.z==='fh'},from:()=>tcard('fizz'),
   ready:()=>!!G.cb&&G.cb.stage==='act'&&G.cb.who===0&&tmine()&&!document.getElementById('bfrev')&&BF.pick==null&&!!tcard('fizz')&&!!document.querySelector('.arena .score.hero')},
 {id:'run',title:'Too strong: run!',say:()=>{const [a,b]=nowStr();let n=5;try{n=runOdds(P(0),G.cb).rows[0].need}catch(e){}return a+' against '+b+': you lose. Tap Run. '+n+'+ escapes'+(isRace(P(0),'elf')?' (elf +1).':'.')},target:tq('.fbtns .runb'),
   wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='run'},ready:()=>!!G.cb&&G.cb.stage==='act'&&G.cb.who===0&&tmine()&&!document.getElementById('bfrev')&&G.cb.os.length>0&&!!document.querySelector('.fbtns .runb')},
 {id:'bad',title:'Caught! Bad Stuff',say:()=>'You rolled '+(G.lastRoll?G.lastRoll.v:1)+': caught! Its Bad Stuff ate your hat.',target:tq('.mine .gear','.mine .top'),wait:null,
   ready:()=>G.phase==='post'&&!G.cb&&!!G.out&&!G.out.won&&tclear()},
 {id:'end1',title:'End your turn',say:'Nothing more to do. Tap End turn.',target:tq(mv('end')),wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='end'},
   ready:()=>G.phase==='post'&&tmine()},
 {id:'curse',title:'Curse a rival',say:'Anyone may curse anyone. Tap Rotten Luck, then Morwen.',target:tchip(1),also:()=>tcard('hexlvl'),pick:tpick('hexlvl'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='hexlvl'&&a.z==='p1'},from:()=>tcard('hexlvl'),
   ready:()=>G.phase==='window'&&G.active===1&&tmine()&&BF.pick==null&&!!tcard('hexlvl')&&!!tchip(1)()},
 {id:'meddle',title:'Meddle in her fight',say:'Anyone may meddle in fights. Tap Gargantuan, then her monster.',target:tq('.arena .row.mons .mon'),also:()=>tcard('gargantuan'),pick:tpick('gargantuan'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='gargantuan'},from:()=>tcard('gargantuan'),
   ready:()=>!!G.cb&&G.cb.who===1&&G.cb.stage==='others'&&tmine()&&BF.pick==null&&!!tcard('gargantuan')&&!!document.querySelector('.arena .row.mons .mon')},
 {id:'rivals',title:'The computer plays too',say:'Morwen and Grub play by the same rules as you.',target:tq('#phopps','#app .opps'),wait:null,
   ready:()=>G.active===2&&!G.winner},
 {id:'listen',title:'Listen at the door',say:'Each turn starts with a free door card. Tap your new card.',target:()=>tcard('lizards'),
   wait:{type:'tap',match:a=>a.what==='card'&&kdef(a.id)==='lizards'},ready:()=>G.phase==='main'&&G.active===0&&G.turn>1&&tmine()&&!!tcard('lizards')&&tclear()},
 {id:'kick2',title:'Your turn again',say:'Your turn. Kick the door again.',target:tq('.bfdoor'),wait:{type:'tap',match:a=>a.what==='kick'},
   ready:()=>G.phase==='main'&&G.active===0&&G.turn>1&&tmine()&&!!document.querySelector('.bfdoor')&&(tutTop('halfling'),true)},
 {id:'trouble',title:'Look for trouble',say:'No monster? Fight one from your hand. Tap Lizards, then the door.',target:tq('.arena'),also:()=>tcard('lizards'),pick:tpick('lizards'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='lizards'},from:()=>tcard('lizards'),
   ready:()=>G.phase==='after'&&tmine()&&BF.pick==null&&!!tcard('lizards')},
 {id:'help',title:'Ask for help',say:()=>{const [a,b]=nowStr();return 'Lizards '+b+', you '+a+': too strong. Tap Help.'},target:tq('.fbtns .helpb'),
   wait:{type:'tap',match:a=>a.what==='askmenu'},ready:()=>!!G.cb&&G.cb.stage==='act'&&G.cb.who===0&&G.cb.help<0&&tmine()&&tcanAsk()&&!!document.querySelector('.fbtns .helpb')},
 {id:'who',title:'Pick a helper',say:'Helpers want a treasure share. Elves help for a level. Tap Morwen.',target:()=>{tAskOpen();return tchip(1)()},
   wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='ask'&&a.m.tgt===1},ready:()=>{tAskOpen();return !!BF.ask&&!!tchip(1)()}},
 {id:'fight',title:'Fight!',say:()=>{const [a,b]=nowStr();return 'Together '+a+' against '+b+'. Ties go to the monster. Tap Fight!'},target:tstable('.fbtns .fightb'),
   wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='fight'},ready:()=>!!G.cb&&G.cb.stage==='act'&&G.cb.help===1&&tmine()&&!!document.querySelector('.fbtns .fightb')},
 {id:'win',title:'Victory!',say:'You won: +1 level and its treasure. Tap End turn.',target:tq(mv('end')),
   wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='end'},ready:()=>G.phase==='post'&&!G.cb&&!!G.out&&G.out.won&&tmine()},
 {id:'charity',title:'Too many cards',say:'Keep 5 cards; give extras to the lowest. Tap Halfling, then Morwen.',target:tchip(1),also:()=>tcard('halfling'),pick:tpick('halfling'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='halfling'&&a.z==='p1'},from:()=>tcard('halfling'),
   ready:()=>G.phase==='charity'&&tmine()&&BF.pick==null&&!!tcard('halfling')&&!!tchip(1)()},
 {id:'kick3',title:'One more door',say:'Kick again. A door can hide a curse too.',target:tq('.bfdoor'),wait:{type:'tap',match:a=>a.what==='kick'},
   ready:()=>G.phase==='main'&&G.active===0&&G.turn>4&&tmine()&&!!document.querySelector('.bfdoor')&&(tutTopCurse(),true)},
 {id:'doorcurse',title:'Cursed!',say:'A curse from the door hits you at once.',target:tq('.mine .top'),wait:null,
   ready:()=>G.phase==='after'&&G.active===0&&tmine()},
 {id:'loot',title:'Loot the room',say:'No fight this turn, so loot the room. Tap Loot.',target:tq(mv('loot')),
   wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='loot'},ready:()=>G.phase==='after'&&G.active===0&&tmine()&&!!tq(mv('loot'))()},
 {id:'finale',onEnter:()=>{UI.pause=true},title:'You know the rules',say:()=>'First to level 10 wins. You are level '+P(0).lvl+'. Go win!',target:tq('.mine .top'),wait:null,
   ready:()=>!G.winner&&(G.active!==0||tclear())}
  ]}
// ---------------------------------------------------------------- the kit hooks
function tutSetup(){try{GX.close()}catch(e){}
  TUTG=true;clearTimeout(aiTimer);aiTimer=null;UI.pass=null;UI.lastSeat=-1;UI.menu=null;UI.zoom=null;UI.sell=null;UI.cmp=null;UI.pause=false;
  BF.pick=null;BF.ask=null;BF.kicking=false;UI.spd0=UI.speed;UI.speed=Math.max(1.5,UI.speed||1);
  const lvl0=UI.lvl,n0=UI.n,nm0=UI.names;UI.lvl='normal';UI.names=null;DEFSEED=TUT_SEED;
  try{newGame('F',3)}finally{UI.lvl=lvl0;UI.n=n0;UI.names=nm0;DEFSEED=null}
  G.tut=1;G.learn=false;G.rng=TUT_SEED;
  G.active=G.first=0;G.setupOrd=[0,1,2];G.setupI=0;G.log=[];G.ln=0;lg(-1,'The tutorial dungeon opens: you, Morwen and Grub.');
  tutDeal();tutStackTreasure();tutTop('hatmuncher');G.tutListen='lizards';{const i=G.door.findIndex(id=>G.C[id]==='lizards');if(i>=0)G.door.unshift(G.door.splice(i,1)[0])}   // the Lizards wait at the bottom of the door deck until you listen
  UI.hints=false;render()}
function tutLeave(){TUTG=false;UI.pause=false;clearTimeout(aiTimer);aiTimer=null;if(UI.spd0!=null){UI.speed=UI.spd0;UI.spd0=null}BF.pick=null;BF.ask=null;
  try{GXH.hide()}catch(e){}G=null;UI.info=true;UI.menu=null;UI.zoom=null;UI.sell=null;UI.pass=null;DEFSEED=null;render()}
function tutStart(o){if(typeof GXT==='undefined')return;o=o&&o.prologue?o:null;const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  GXT.start({game:TUT_GAME,steps:tutSteps(),story:!!(window.CAMPAIGN&&typeof GXC!=='undefined'),
    endTitle:'You know the rules',endText:o?'Gear up, listen, kick, fight, run, help, curse, loot, sell, charity. Now the Story begins.':'Gear up, listen, kick, fight, run, help, curse, loot, sell, charity. Now play a real game.',
    endButtons:o&&first?[{id:'chapter',label:'Start chapter 1'}]:null,
    setup:tutSetup,
    onDone:r=>{const c=r&&r.choice;tutLeave();
      if(c==='chapter'&&first)GXC.play(first.id);
      else if(c==='story'&&typeof campOpen==='function')campOpen();
      else{const m=UI.mode&&UI.mode!=='ai'&&UI.mode!=='net'?UI.mode:'F';UI.pass=null;UI.lastSeat=-1;newGame(m,UI.n||DEFN);if(G){G.learn=false;render()}}},   // Play a real game: straight into one on your Quick game settings
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
// while the tutorial dims the screen, controls under a dim cell cannot be tapped (the cell takes the tap and shakes the bubble):
// mark them inert too, so nothing reports them as "covered"; the spotlit target keeps its taps
(function(){const SEL='button,[role=button],a[href],[data-act],[data-mv],.btn';let was=false;
  function tick(){try{const on=!!document.querySelector('.gxt-cell');
    if(on||was){document.querySelectorAll('.dk-tutoff').forEach(e=>e.classList.remove('dk-tutoff'));was=false}
    if(on){const hit=[];for(const e of document.querySelectorAll(SEL)){if(e.closest('.gxt-top,.gxt-bub,[data-help]'))continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
        const t=document.elementFromPoint(Math.max(1,Math.min(innerWidth-1,r.left+r.width/2)),Math.max(1,Math.min(innerHeight-1,r.top+r.height/2)));if(t&&t.classList&&t.classList.contains('gxt-cell'))hit.push(e)}
      hit.forEach(e=>e.classList.add('dk-tutoff'));was=true}}catch(e){}setTimeout(tick,120)}
  setTimeout(tick,120)})();
