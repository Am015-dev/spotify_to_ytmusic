// ===================== the tutorial (shell/gx-tutor.js): a staged one-round game that teaches every rule by doing it once =====================
// The staged game is tutdata.js: a fixed bazaar, a fixed goods row, the computer scripted (tutAIMove), one round, never saved (G.tut).
// Rules this tutorial teaches, and the step that covers each (the checklist from the game's rules text and card list):
//   goal and points .......... goal, score, end            coins are points ........ bid1, sell2, score
//   turn-order track ......... bid1, bid2, order            two markers each ........ bid2
//   lift and drop ............ lift, drop, dropA           never straight back ..... drop
//   last person on its colour  drop, dropB, dropC           take the colour, claim .. traders
//   Traders and goods ........ traders                     Stall (3 coins) ......... buy
//   sets, selling, Mystics ... sell1, sell2, buy, masons   Masons and blue tiles ... masons
//   Hamlet and palace ........ palace                      Advisors (+10) .......... advisors
//   Sages, Shrine, djinn ..... sages                       Oasis and palm .......... advisors, others
//   Grand Bazaar ............. others                      Shadows ................. shadows
//   what the computer does ... order, sages, advisors      how the game ends ....... end
// Each step spotlights one thing; only that thing answers; the step moves on only when the game reports that exact action (GXT.act).
const TUT_GAME='sands-of-qamar';
const tutOn=()=>typeof GXT!=='undefined'&&GXT.active()&&!!(G&&G.tut);
let _tutHold=false;
const tutHeld=()=>!!(G&&G.tut&&_tutHold&&G.phase==='turn');   // the computer waits at the start of its first turn until the "Turn order" step is done
function firstTime(){try{if(typeof GXT==='undefined'||GXT.status(TUT_GAME).seen)return false;if(FING.n>0)return false;if(localStorage.getItem(SAVE))return false}catch(e){}return true}
const tutBtn=cls=>typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:firstTime(),cls:cls,launch:tutStart});
function tutMenuFill(){const el=document.getElementById('gxtmenu');if(el)el.innerHTML=tutBtn('btn')}
// first-time players who tap Play are offered the tutorial once
function tutOffer(next){if(typeof GXT==='undefined'||online())return false;let seen='1';try{seen=localStorage.getItem('soq_tutoffer')}catch(e){}
  if(seen||!firstTime())return false;try{localStorage.setItem('soq_tutoffer','1')}catch(e){}UI.offerNext=next;UI.modal='offer';render();return true}
function offerHtml(){return `<div class="mbox"><h2>New here?</h2><p class="lede">Learn the rules by playing one short round. About 5 minutes.</p><div class="acts big"><button class="btn go big" data-ui="tutgo">▶ Learn in 5 minutes</button><button class="btn big" data-ui="tutplay">Just play</button></div></div>`}
// ---------------------------------------------------------------- where each step points
const tq=sel=>()=>{const e=document.querySelector(sel);return e&&e.getBoundingClientRect().width?e:null};
const tTile=i=>()=>{const e=tileEl(i);return e&&e.getBoundingClientRect().width?e:null};
const tSeat=i=>()=>{const e=seatEl(i);return e&&e.getBoundingClientRect().width?e:null};
const tAct=test=>()=>{for(const b of document.querySelectorAll('#acts [data-mv]')){try{if(b.getBoundingClientRect().width&&test(JSON.parse(b.dataset.mv)))return b}catch(e){}}return null};
const tChip=()=>{for(const b of document.querySelectorAll('#mine .gchip'))if(!b.classList.contains('on')&&b.getBoundingClientRect().width)return b;return null};
const tChz=c=>()=>{for(const b of document.querySelectorAll('#chz .chb'))if(b.querySelector('[data-c="'+c+'"]')&&b.getBoundingClientRect().width)return b;return null};
const cnt=()=>(GXT.state().count||0);
const mineNow=()=>!!G&&!G.over&&!G.q&&!UI.modal&&sideToAct()===0;
const myTurn=n=>mineNow()&&G.phase==='turn'&&G.turnIdx===n;
const bidNow=n=>mineNow()&&G.phase==='bid'&&G.bids.length===n;
const idle=n=>myTurn(n)&&G.step==='move'&&!G.move;             // your turn has not started: the computer's turn before it is finished
const isMv=(a,f)=>a.what==='move'&&!!a.m&&f(a.m);
const dropsDone=()=>G.move?G.move.drops.length:0;
const spotBtn=s=>tAct(m=>m.act==='bid'&&m.spot===s&&!m.fk);
const bluesAround=i=>AROUND(i).filter(j=>G.board[j].blue&&!G.board[j].block);
function tutSteps(){
  const T1=TUT_ME.t1,T2=TUT_ME.t2,B=TUT_ME.bid;
  const p1=()=>T1.path[Math.min(2,dropsDone())];
  const p2=()=>T2.path[Math.min(2,dropsDone())];
  return [
 {id:'goal',title:'Win on points',say:'Most points at the end wins. Coins, tribes, land, goods and djinns all count.',target:tq('#seats'),wait:null,ready:()=>bidNow(0)},
 {id:'tribes',title:'Five tribes',say:'Every tile holds three people. Each colour is a tribe with its own power.',target:tTile(5),also:()=>[tTile(11)(),tTile(24)()],wait:null,ready:()=>bidNow(0)},
 {id:'bid1',title:'Bid for turn order',say:'Dearer spots play earlier, and coins are points. Tap the 5-coin spot.',target:spotBtn(B[0]),
   wait:{type:'tap',match:a=>isMv(a,m=>m.act==='bid'&&m.spot===B[0])},ready:()=>bidNow(0)&&!!spotBtn(B[0])()},
 {id:'bid2',title:'Your second marker',say:'With two players you each have two markers. Tap the free 0-coin spot.',target:spotBtn(B[1]),
   wait:{type:'tap',match:a=>isMv(a,m=>m.act==='bid'&&m.spot===B[1])},ready:()=>bidNow(2)&&!!spotBtn(B[1])()},
 {id:'order',title:'Turn order',say:'Dearer spots play first: Teal, you, Teal, you. Equal price: later bidder first. Watch Teal go.',target:tSeat(1),also:()=>tSeat(0)(),wait:null,
   onEnter:()=>{_tutHold=true},onNext:()=>{_tutHold=false;schedule()},ready:()=>!!G&&!G.over&&G.phase==='turn'&&G.turnIdx===0&&G.step==='move'&&!G.move&&sideToAct()===1},
 {id:'sages',title:"Teal's turn",say:'Teal took 4 Sages (2 points each), claimed the Shrine, and paid 2 Sages for a djinn.',target:tTile(8),also:()=>tSeat(1)(),wait:null,ready:()=>idle(1)},
 {id:'lift',title:'Lift a tile',say:'Your turn! Tap this tile to lift everyone on it.',target:tTile(T1.start),
   wait:{type:'tap',match:a=>isMv(a,m=>m.act==='start'&&m.tile===T1.start)},ready:()=>idle(1)},
 {id:'drop',title:'Drop one per tile',say:()=>dropsDone()<2?'Drop one person on the glowing tile. Move up, down, left or right; never straight back.':'The last person must land on a tile with their own colour: Traders.',
   target:()=>tTile(p1())(),wait:{type:'tap',times:3,match:a=>isMv(a,m=>m.act==='step'&&m.tile===p1())},ready:()=>myTurn(1)&&!!G.move&&dropsDone()===cnt()},
 {id:'traders',title:'Traders and camels',say:'You took all 4 Traders: 4 goods cards. The tile is empty, so your camel claims it.',target:tTile(T1.path[2]),also:()=>tSeat(0)(),wait:null,
   ready:()=>myTurn(1)&&G.step==='tile'&&G.board[T1.path[2]].camel===0},
 {id:'buy',title:'Stall: buy a good',say:'Pay 3 coins for one of the first 3 goods. Take the Mystic: it never scores, but boosts Masons.',target:tq('.mcard[data-mk="0"]'),
   wait:{type:'tap',match:a=>isMv(a,m=>m.act==='tile'&&m.take&&m.take[0]===0)},ready:()=>myTurn(1)&&G.step==='tile'&&G.market[0]==='fakir'&&UI.pickMk.includes(0)&&!!tq('.mcard[data-mk="0"]')()},
 {id:'sell1',title:'Sell a set',say:'Goods in a set must all differ. Tap your 4 goods to put them in one set.',target:tChip,
   wait:{type:'tap',times:4,match:a=>a.what==='sell'},ready:()=>myTurn(1)&&G.step==='sell'&&UI.sellSel.length===cnt()&&!!tChip()},
 {id:'sell2',title:'Cash them in',say:'A set of 4 different goods pays 13 coins. Bigger sets pay far more. Tap Sell.',target:tAct(m=>m.act==='sell'),
   wait:{type:'tap',match:a=>isMv(a,m=>m.act==='sell')},ready:()=>myTurn(1)&&G.step==='sell'&&UI.sellSel.length===4&&!!tAct(m=>m.act==='sell')()},
 {id:'advisors',title:'Advisors and palms',say:'Teal took 4 Advisors and planted a palm. Advisors: 1 point each, plus 10 for every rival with fewer.',target:tTile(2),also:()=>tSeat(1)(),wait:null,ready:()=>idle(3)},
 {id:'lift2',title:'Last turn',say:'Lift this tile: two Advisors and a Mason.',target:tTile(T2.start),
   wait:{type:'tap',match:a=>isMv(a,m=>m.act==='start'&&m.tile===T2.start)},ready:()=>idle(3)},
 {id:'dropA',title:'Choose who to drop',say:'Tap this tile, then pick which person stays here.',target:tTile(T2.path[0][0]),
   wait:{type:'tap',match:a=>a.what==='tile'&&a.i===T2.path[0][0]},ready:()=>myTurn(3)&&!!G.move&&dropsDone()===0&&!UI.chz},
 {id:'dropB',title:'Leave an Advisor',say:'Tap the yellow Advisor. Your last person, the Mason, must land on a Mason tile.',target:tChz(T2.path[0][1]),
   wait:{type:'tap',match:a=>isMv(a,m=>m.act==='step'&&m.tile===T2.path[0][0]&&m.c===T2.path[0][1])},ready:()=>myTurn(3)&&!!UI.chz&&!!tChz(T2.path[0][1])()},
 {id:'dropC',title:'Keep walking',say:()=>dropsDone()<2?'Drop the other Advisor on the next tile.':'The Mason lands on a Mason tile. All 4 Masons are yours.',
   target:()=>tTile(p2()[0])(),wait:{type:'tap',times:2,match:a=>isMv(a,m=>m.act==='step'&&m.tile===p2()[0]&&m.c===p2()[1])},ready:()=>myTurn(3)&&!!G.move&&dropsDone()===1+cnt()&&!UI.chz},
 {id:'masons',title:'Masons earn coins',say:()=>'Each Mason earns 1 coin per blue tile around: '+bluesAround(T2.path[2][0]).length+' tiles. Spend your Mystic for a 5th Mason.',
   target:tAct(m=>m.act==='tribe'&&m.fk===1),also:()=>bluesAround(T2.path[2][0]).filter(i=>i!==T2.path[2][0]).map(i=>tTile(i)()),
   wait:{type:'tap',match:a=>isMv(a,m=>m.act==='tribe'&&m.fk===1)},ready:()=>myTurn(3)&&G.step==='tribe'&&!!tAct(m=>m.act==='tribe'&&m.fk===1)()},
 {id:'palace',title:'Hamlet: a palace',say:'A Hamlet adds a palace: 5 more points for whoever holds the tile. Your camel holds it.',target:tTile(T2.path[2][0]),wait:null,
   ready:()=>G.board[T2.path[2][0]].pal>0&&G.board[T2.path[2][0]].camel===0},
 {id:'score',title:'Counting points',say:()=>{const s=G.over?G.over.scores:[];const a=s.find(x=>x.p===0),b=s.find(x=>x.p===1);return 'Final count: you '+(a?a.s.total:0)+', Teal '+(b?b.s.total:0)+'. Coins, tiles, palaces, palms, Sages, Advisors, djinns and goods all score.'},
   target:tq('#seats'),wait:null,ready:()=>!!G.over},
 {id:'others',title:'More tiles',say:'Grand Bazaar: 6 coins for 2 goods. Oasis: a palm tree, worth 3. Shrine: summon a djinn.',target:tTile(26),also:()=>[tTile(2)(),tTile(8)()],wait:null,ready:()=>!!G.over},
 {id:'shadows',title:'Shadows',say:"Red Shadows remove any person within that many steps, or a rival's Advisor or Sage.",target:tTile(13),wait:null,ready:()=>!!G.over},
 {id:'end',title:'How it ends',say:'A real game ends when someone places their last camel. Most points wins. You are ready!',target:tq('#seats'),wait:null,ready:()=>!!G.over}
  ]}
// ---------------------------------------------------------------- start, leave, Story prologue
function storyOpen(){if(typeof GXC==='undefined')return;if(typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else GXC.open()}
function tutStart(o){if(typeof GXT==='undefined')return;o=o&&o.prologue?o:null;const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  GXT.start({game:TUT_GAME,steps:tutSteps(),story:!!(window.CAMPAIGN&&typeof GXC!=='undefined'),
    endTitle:'You know the rules',endText:o?'Bid, walk, take a tribe, claim land, sell goods. Now the Story begins.':'Bid, walk, take a tribe, claim land, sell goods. Djinns, Shadows and more: the lightbulb explains them.',
    endButtons:o&&first?[{id:'chapter',label:'Start chapter 1'}]:null,
    setup:()=>{try{GX.close()}catch(e){}tutQuiet();UI.modal=null;UI.fx.length=0;UI.fxSeen=0;resetScene();tutNew();UI.snap=null;refresh()},
    onDone:r=>{tutLeave();const c=r&&r.choice;
      if(c==='chapter'&&first&&typeof GXC!=='undefined')GXC.play(first.id);
      else if(c==='story'&&typeof GXC!=='undefined')GXC.open();
      else{UI.modal='start';render()}},
    onExit:()=>{tutLeave();UI.modal='start';render()}})}
function tutQuiet(){clearTimeout(aiTimer);aiTimer=null;clearTimeout(UI.autoT);UI.autoT=0;_tutHold=false}
// leave the staged game: nothing of it is saved, the board goes quiet behind the menu
function tutLeave(){tutQuiet();G=null;resetScene();UI.modal=null;UI.fx.length=0;UI.fxSeen=0;try{GXH.hide()}catch(e){}try{const f=$('#finger');if(f)f.hidden=true}catch(e){}render()}
// ---------------------------------------------------------------- the game tells the kit what the player does (before it is applied)
(function(){const o=go;go=function(m){
  if(tutOn()&&!UI._tutIn){const s=sideToAct();if(s>=0&&P(s).human&&!GXT.act({type:'tap',what:'move',m}))return}
  return o(m)}})();
(function(){const o=onTile;onTile=function(i){
  if(tutOn()&&!UI._tutIn){const p=me();
    if(p&&G.step==='move'&&G.move&&!UI.pendDj&&!UI.pendItem&&!UI.chz){const n=validMoves(p.i).filter(m=>m.act==='step'&&m.tile===i).length;if(n>1&&!GXT.act({type:'tap',what:'tile',i}))return}}
  return o(i)}})();
document.addEventListener('click',e=>{if(!tutOn())return;const b=e.target.closest&&e.target.closest('[data-sell]');
  if(b&&!GXT.act({type:'tap',what:'sell',k:b.dataset.sell})){e.stopImmediatePropagation();e.preventDefault()}},true);
