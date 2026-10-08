// ===== Tutorial (shell/gx-tutor.js): a staged, never-saved mini-game that teaches every rule by doing it once. See shell/GX-KIT.md section 10. =====
// Three monsters (you, Squidrik, Shroomhulk). The dice are scripted (TUT.script, one list of faces per throw, in the order the throws happen) and
// the two computers roll once and never buy, so each rule appears on cue, the same way every time. Nothing of this game is saved.
//
// THE RULES THIS TEACHES (read from rulesHTML(), the dice legend, HLP_RULES and rules-test.js). Each line names the step that does it:
//   goal: 20 stars, or last monster standing ........ goal, finish
//   a turn: roll six dice, keep some, roll the rest,
//     up to three rolls, any time you may stop ...... keep, roll1, third, energy, roll2, done1 (and done2: stopping after one roll)
//   numbers: three of a kind scores that many stars,
//     a pair scores nothing, extra dice add 1 ....... third (the pair note), score1
//   energy: 1 each, spent on power cards ............. energy, score1, shop, buy
//   claws: from Downtown they hit every rival,
//     from outside they hit the monster in Downtown .. done2, score2, done3, score3
//   hearts: heal 1 each, never inside the city ....... done2, score2 (wasted in Downtown), done3, score3 (heals outside)
//   Downtown: empty -> you move in for +1 stars, starting a turn there pays +2,
//     everyone outside hits you ...................... score1, bonus, rivals
//   yielding: when hit in Downtown you may leave, the
//     attacker moves in (or stay for the +2) ......... stay, yield
//   power cards: buy with energy (tap to read, tap again
//     to buy), PERMANENT/ONE-SHOT/SAVE FOR LATER types,
//     sweep the three for sale for 2 energy ......... shop, buy, sweep
//   what the computers do: roll, keep, resolve, buy,
//     then the next monster ......................... rivals, yield
//   how the game ends: 20 stars or last standing ..... finish
// (Evolutions, Brainjack and the other expansions are options the player switches on; the lightbulb and the rules drawer explain them.)
const TUT_GAME='crown-city-smash';
const TUT={script:[],hold:false,feed:false,frame:null,ends:0};
const tutOn=()=>typeof GXT!=='undefined'&&GXT.active()&&!!(G&&G.tut);
const tutBtn=cls=>typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:tutFirst(),cls:cls,launch:tutStart});
// the intro card of a first game offers it once more (a Play tap sets the 'played' flag first, so this reads the first-game flag instead)
const tutOffer=()=>{try{return !!(typeof GXT!=='undefined'&&G&&!G.tut&&UI.firstGame&&!GXT.status(TUT_GAME).seen)}catch(e){return false}};
const tutMini=()=>typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:true,cls:'btn tutmini',launch:tutStart,sub:false});
function tutFirst(){try{return !localStorage.getItem(TOUR)&&!GXT.status(TUT_GAME).seen}catch(e){return false}}
// ---------------------------------------------------------------- the staged game
// Dice throws in order. A frame is the list of faces for the dice thrown (the whole six at the start of a turn, the unkept ones on a reroll).
const TUT_SCRIPT=[
  ['3','3','E','H','C','1'],  // you: two 3s to keep
  ['3','E','E','2'],          // reroll of dice 2-5: a third 3 and two energy
  ['E'],                      // the last reroll: one more energy
  ['C','C','1','2','2','H'],  // Squidrik: two claws, no triple
  ['1','2','3','H','H','3'],  // Shroomhulk: nothing scores
  ['C','C','H','E','E','1'],  // you in Downtown: claws, a heart that cannot heal, two energy
  ['C','C','C','1','2','H'],  // Squidrik: three claws
  ['1','2','3','H','H','3'],  // Shroomhulk: nothing scores
  ['H','C','C','3','3','E']]; // you outside: a heart that heals, claws that hit Downtown
const TUT_BUY=['cosmic','plated','kiosk'], TUT_NEXT=['kidfan','train','sun','mend'];   // cards for sale; then (popped in this order) what a refill and the sweep deal
(function(){
  // the dice: only the real throws read the script (the computer's look-ahead calls faceOf too and must stay random)
  const _fo=faceOf;faceOf=function(d){if(TUT.feed&&TUT.frame&&TUT.frame.length)return TUT.frame.shift();return _fo(d)};
  const wrap=f=>function(){if(!(G&&G.tut))return f.apply(this,arguments);TUT.frame=TUT.script.shift()||null;TUT.feed=true;try{return f.apply(this,arguments)}finally{TUT.feed=false;TUT.frame=null}};
  const _sr=startRoll;startRoll=function(p){const r=wrap(_sr).apply(this,arguments);if(G&&G.tut&&!p.human)G.rolls=0;return r};
  const _rr=reroll;reroll=wrap(_rr);
  // the computers: they never yield on their own (you do) and wait while a step holds them
  const _ay=aiYield;aiYield=function(){if(G&&G.tut)return false;return _ay.apply(this,arguments)};
  const _sc=schedule;schedule=function(){if(tutOn()&&TUT.hold)return;return _sc.apply(this,arguments)};
  const _as=aiStep;aiStep=function(){if(tutOn()&&TUT.hold)return;return _as.apply(this,arguments)};
  // nothing is saved, and the shop shows no suggestion (the first tap on a card only reads it)
  const _sv=save;save=function(){if(G&&G.tut)return;return _sv.apply(this,arguments)};
  const _sg=suggestCard;suggestCard=function(p){if(G&&G.tut)return -1;return _sg.apply(this,arguments)};
  // the board's ghost finger and the help kit's bubbles stay quiet: the tutorial is the only teacher
  const _bf=bfFinger;bfFinger=function(){if(tutOn()){const f=document.getElementById('bfinger');if(f)f.classList.remove('on');return}return _bf.apply(this,arguments)};
  // the staged table is built inside newGame, before the first turn
  const _cs=campSetup;campSetup=function(){const r=_cs.apply(this,arguments);if(UI.tutNext)tutTable();return r};
})();
function tutTable(){UI.tutNext=false;G.tut=1;G.mode='solo';
  [0,1,3].forEach((m,i)=>{const p=G.pl[i];p.m=m;p.human=i===0;p.lvl='easy';p.hp=10;p.vp=0;p.en=0;p.edeck=shuffle(evoDeckOf(m))});
  const all=TUT_BUY.concat(TUT_NEXT);G.deck=G.deck.concat(G.market,G.disc).filter(c=>!all.includes(c));G.market=TUT_BUY.slice();G.disc=[];
  G.deck.push(...TUT_NEXT.slice().reverse());G.ncards=cardTotal();G.log=[];lg(-1,'Tutorial: a short staged game.');
  TUT.script=TUT_SCRIPT.map(f=>f.slice());TUT.hold=false;TUT.ends=0}
// ---------------------------------------------------------------- where each step points
// a target that sits below the fold (the desktop dock scrolls) is scrolled into view first
const tvis=e=>{if(!e)return null;const r=e.getBoundingClientRect();if(!r.width)return null;if((r.top<0||r.bottom>innerHeight)&&r.height<innerHeight-20){try{e.scrollIntoView({block:'center',inline:'nearest'})}catch(x){}}return e};
const tq=sel=>()=>tvis(document.querySelector(sel));
const tfirst=(...sels)=>()=>{for(const s of sels){const e=tvis(document.querySelector(s));if(e)return e}return null};
const tDie=k=>tq(`#dice .die[data-die="${k}"]`);
const tChips=tfirst('#pchips','.gx-board');
const tMe=tfirst('#pchips .pchip[data-pm="0"]','.gx-board');
const tRoll=tq('#pacts [data-act="reroll"]'), tDone=tq('#pacts [data-act="resolve"]'), tEnd=tq('#pacts [data-act="end"]'), tSweep=tq('#pacts [data-act="sweep"]');
const tShop=k=>tfirst(`#pshop [data-shop="${k}"]`,`#buymini [data-card="${k}"]`);
const tOpt=o=>tq(`#choice [data-opt="${o}"]`);
const tFly=()=>!!(document.querySelector('.gx-dock[data-bf="resolving"]')||[...document.querySelectorAll('#dice .die')].some(e=>e.classList.contains('bfroll')||(e.getAnimations&&e.getAnimations().some(a=>a.playState==='running'&&a.effect&&a.effect.getComputedTiming().iterations!==Infinity)))||(typeof BF!=='undefined'&&BF.spin&&bfNow()<BF.spin.end)||(typeof BF!=='undefined'&&BF.cap&&bfNow()<BF.until));
const tBusy=()=>!!UI.busy||tFly();
const tChoice=re=>!!(UI.choice&&re.test(UI.choice.title)&&document.querySelector('#choice:not(.hidden) [data-opt]')&&!tFly());
const myTurn=()=>!!(G&&!G.winner&&G.active===0&&G.pl[0].human&&!UI.choice&&!UI.intro);
const myRoll=()=>myTurn()&&G.phase==='roll'&&G.dice.length===6&&!tBusy();
const myBuy=()=>myTurn()&&G.phase==='buy'&&!tBusy();
const isAct=a=>x=>x.what==='act'&&x.act===a;
const isDie=(f,n)=>x=>x.what==='die'&&x.f===f&&!x.kept&&(n==null||x.k===n);
const nm=i=>mname(P(i));
function tutSteps(){
  const phone=phOn();
  const S=[
 {id:'goal',title:'Your goal',say:'Smash your way to 20 ★. The last monster standing wins too.',target:tChips,wait:null,ready:()=>myRoll()&&G.rolls===2&&!G.dice.some(d=>d.k)},
 {id:'keep',title:'Keep your 3s',say:'Dice you tap stay put when you roll again. Tap both 3s.',target:tDie(0),also:tDie(1),wait:{type:'tap',times:2,match:isDie('3')},
   ready:()=>myRoll()&&G.rolls===2&&G.dice.filter(d=>d.k).length<2},
 {id:'roll1',title:'Roll the rest',say:'You roll up to three times. Tap Roll to throw the other dice.',target:tRoll,wait:{type:'tap',match:isAct('reroll')},
   ready:()=>myRoll()&&G.rolls===2&&G.dice[0].k&&G.dice[1].k},
 {id:'third',title:'Three of a kind',say:'Two 3s score nothing. Three score 3 ★. Tap the new 3.',target:tDie(2),wait:{type:'tap',match:isDie('3',2)},
   ready:()=>myRoll()&&G.rolls===1&&G.dice[2].f==='3'&&!G.dice[2].k},
 {id:'energy',title:'Keep the energy',say:'Each ⚡ gives 1 energy to spend on power cards. Keep both.',target:tDie(3),also:tDie(4),wait:{type:'tap',times:2,match:isDie('E')},
   ready:()=>myRoll()&&G.rolls===1&&G.dice[2].k&&G.dice.filter(d=>d.k&&d.f==='E').length<2},
 {id:'roll2',title:'Last roll',say:'One roll left. Throw the last die.',target:tRoll,wait:{type:'tap',match:isAct('reroll')},
   ready:()=>myRoll()&&G.rolls===1&&G.dice.filter(d=>d.k).length===5},
 {id:'done1',title:'Use your dice',say:'No rolls left. Tap Done to use your dice.',target:tDone,wait:{type:'tap',match:isAct('resolve')},
   ready:()=>myRoll()&&G.rolls===0},
 {id:'score1',title:'Stars and energy',say:()=>'Three 3s score 3 ★, three ⚡ give 3 energy. Downtown was empty, so you moved in: +1 ★. You have '+P(0).vp+' ★.',target:tMe,wait:null,
   ready:()=>myBuy()&&inCity(0)},
  ];
  if(phone)S.push({id:'shop',title:'Power cards',say:()=>'Spend energy on power cards. Tap '+CARDS[base(G.market[0])].n+' to read it.',target:tShop(0),wait:{type:'tap',match:x=>x.what==='shopsel'&&x.k===0},
    ready:()=>myBuy()&&G.market[0]===TUT_BUY[0]&&P(0).en>=3});
  S.push(
 {id:'buy',title:'Buy it',say:()=>(phone?'Tap it again to buy it for ':'Buy it for ')+costOf(P(0),G.market[0])+' ⚡. A PERMANENT card stays with you all game.',target:tShop(0),wait:{type:'tap',match:x=>(x.what==='shopbuy'||x.what==='card')&&x.k===0},
   ready:()=>myBuy()&&G.market[0]===TUT_BUY[0]&&P(0).en>=3&&(!phone||BF.sel===0)},
 {id:'end1',title:'End your turn',say:'Saved energy carries over. Tap Done to end your turn.',target:tEnd,wait:{type:'tap',match:isAct('end')},
   ready:()=>myBuy()&&P(0).cards.includes('cosmic')},
 {id:'rivals',title:'Rivals play too',say:()=>nm(1)+' rolls like you. Its claws hit the monster in Downtown: you. Computers keep, roll and buy too.',
   target:tfirst('#dice','#pchips .pchip[data-pm="1"]','#pchips'),wait:null,onNext:()=>tutRelease(),
   ready:()=>!tBusy()&&G.active===1&&G.phase==='roll'&&G.dice.length===6&&!UI.choice},
 {id:'stay',title:'Stay or yield?',say:()=>'Hit in Downtown? Stay to earn 2 ★ next turn, or yield and run. Tap Stay.',target:tOpt('stay'),wait:{type:'tap',match:x=>x.what==='opt'&&x.opt==='stay'},
   ready:()=>tChoice(/^Stay or yield/)},
 {id:'bonus',title:'Downtown pays',say:()=>'You started in Downtown: +2 ★. You have '+P(0).vp+' ★. But hearts cannot heal you there.',target:tMe,wait:null,
   ready:()=>myRoll()&&inCity(0)&&G.rolls===2},
 {id:'done2',title:'Claws hit everyone',say:'From Downtown your claws hit every rival. You may stop rolling any time. Tap Done.',target:tDone,wait:{type:'tap',match:isAct('resolve')},
   ready:()=>myRoll()&&inCity(0)&&G.rolls===2},
 {id:'score2',title:'Smash!',say:()=>'Two claws hit both rivals. Two ⚡ gained. The heart did nothing: no healing in Downtown.',target:tChips,wait:null,
   ready:()=>myBuy()&&inCity(0)},
 {id:'sweep',title:'New cards',say:'Not happy with the cards? Pay 2 ⚡ to swap all three for new ones.',target:tSweep,wait:{type:'tap',match:isAct('sweep')},
   ready:()=>myBuy()&&P(0).en>=2},
 {id:'end2',title:'End your turn',say:'Tap Done to end your turn.',target:tEnd,wait:{type:'tap',match:isAct('end')},
   ready:()=>myBuy()&&!G.market.includes(TUT_BUY[1])},
 {id:'yield',title:'Yield the city',say:()=>nm(1)+' hit you again. Yield to leave Downtown: it moves in, but you stop taking hits. Tap Yield.',target:tOpt('yield'),wait:{type:'tap',match:x=>x.what==='opt'&&x.opt==='yield'},
   ready:()=>tChoice(/^Stay or yield/)},
 {id:'done3',title:'Outside the city',say:'Outside, hearts heal you and claws hit whoever holds Downtown. Tap Done.',target:tDone,wait:{type:'tap',match:isAct('resolve')},
   ready:()=>myRoll()&&!inCity(0)&&G.rolls===2},
 {id:'score3',title:'Heal and hit',say:()=>'A heart healed you: '+Math.max(0,P(0).hp)+' ♥. Your claws hit '+nm(1)+' in Downtown.',target:tChips,wait:null,
   ready:()=>myBuy()&&!inCity(0)},
 {id:'finish',title:'How it ends',say:'The first monster to 20 ★ wins, or the last one standing. Now play a real game!',target:tChips,wait:null,ready:()=>myBuy()});
  return S}
// ---------------------------------------------------------------- start, leave, hooks
function tutRelease(){TUT.hold=false;try{schedule()}catch(e){}}
function tutStart(o){if(typeof GXT==='undefined')return;const pro=!!(o&&o.prologue),first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  GXT.start({game:TUT_GAME,steps:tutSteps(),story:!!(window.CAMPAIGN&&typeof GXC!=='undefined'),
    endTitle:'You know the rules',endText:pro?'Roll, keep, smash, hold Downtown, buy cards. Now the Story begins.':'Roll, keep, smash, hold Downtown, buy cards. Time for a real game.',
    endButtons:pro&&first?[{id:'chapter',label:'Start chapter 1'}]:null,
    setup:tutSetup,
    onDone:r=>{tutLeave();const c=r&&r.choice;
      if(c==='chapter'&&first)GXC.play(first.id);
      else if(c==='story'&&typeof GXC!=='undefined')GXC.open();
      else{const b=document.querySelector('[data-start="solo"]');if(b)b.click()}},
    onExit:()=>{tutLeave();if(pro&&typeof GXC!=='undefined')GXC.open()}})}   // skipping the Chapter 0 prologue goes on to the chapter map, and Story does not ask again
function tutSetup(){document.documentElement.classList.add('gxt-on');try{GXH.hide()}catch(e){}
  try{if(GX.open)GX.close()}catch(e){}
  try{if(typeof GXC!=='undefined'&&GXC.close)GXC.close()}catch(e){}
  clearTimeout(UI.statsT);UI.info=false;UI.choice=null;UI.stats=false;UI.intro=false;UI.coach=-1;UI.adv=false;UI.paused=false;UI.pending=false;UI.busy=false;UI.camp=null;UI.campNext=false;UI.tutNext=true;TUT.hints=UI.hints;UI.hints=false;
  const sv={n:UI.n,mon:UI.mon,xp:UI.xp,evo:UI.evo,ex:UI.ex,lvl:UI.lvl};
  UI.n=3;UI.mon=0;UI.xp='base';UI.evo=false;UI.ex={};UI.lvl='easy';
  try{newGame('solo',3,0)}finally{Object.assign(UI,sv)}
  UI.intro=false;if(G){G.tut=1}render()}
// leave the staged game: nothing of it was saved, the board goes quiet behind the menu
function tutLeave(){document.documentElement.classList.remove('gxt-on');if(TUT.hints!==undefined){UI.hints=TUT.hints;TUT.hints=undefined}TUT.hold=false;TUT.script=[];clearTimeout(UI.statsT);UI.pending=false;UI.busy=false;UI.choice=null;UI.intro=false;
  try{GXH.hide()}catch(e){}try{const f=document.getElementById('bfinger');if(f)f.classList.remove('on')}catch(e){}
  G=null;UI.info=true;try{if(typeof BF!=='undefined')BF.sel=-1}catch(e){}render();tutMenus()}
function tutMenus(){const s=document.getElementById('gxtset');if(s)s.innerHTML=tutBtn('btn mrow');
  document.querySelectorAll('[data-gxt-slot]').forEach(e=>{e.innerHTML=tutBtn(e.dataset.gxtSlot||'btn')})}
// Story starts with the tutorial (Chapter 0) the first time; afterwards it opens the chapter map
function storyOpen(){if(typeof GXC==='undefined')return;
  if(typeof GXT!=='undefined'&&!GXT.status(TUT_GAME).seen)tutStart({prologue:true});else GXC.open()}
// the game tells the kit what the player does, before it is applied
(function(){const _ga=gameAct;gameAct=function(ds,seat){
  if(tutOn()&&!UI._tutIn){let a=null;
    if(ds.opt!==undefined)a={type:'tap',what:'opt',opt:ds.opt};
    else if(ds.die!==undefined&&G.dice[+ds.die])a={type:'tap',what:'die',k:+ds.die,f:G.dice[+ds.die].f,kept:!!G.dice[+ds.die].k};
    else if(ds.card!==undefined)a={type:'tap',what:'card',k:+ds.card};
    else if(ds.act)a={type:'tap',what:'act',act:ds.act};
    if(a){if(!GXT.act(a))return;if(a.what==='act'&&a.act==='end'&&G.phase==='buy'){if(!TUT.ends)TUT.hold=true;TUT.ends=(TUT.ends||0)+1}}}
  return _ga.apply(this,arguments)}})();
(function(){const _bt=bfTapCard;bfTapCard=function(k,el){
  if(tutOn()&&!UI._tutIn){const p=cur();if(!phShopOK())return;
    const what=!canBuy(p,k)?'shopno':(BF.sel>=0?BF.sel:suggestCard(p))!==k?'shopsel':'shopbuy';
    if(!GXT.act({type:'tap',what,k}))return;
    UI._tutIn=1;try{return _bt.apply(this,arguments)}finally{UI._tutIn=0}}
  return _bt.apply(this,arguments)}})();
tutMenus();
