// ===================== part 11: the tutorial (shell/gx-tutor.js): a staged one-round game that teaches every rule by doing it once =====================
// RULES CHECKLIST (from the rules drawer, RULES_HTML, and the reference list) and the step that teaches each one:
//   goal: tile the palace wall, most points wins ............................ goal
//   5 kilns of 4 tiles; take from one kiln or the middle ..................... kilns
//   take EVERY tile of one colour from a kiln ................................ take1
//   the rest of the kiln slides to the middle ................................ slide, olive1
//   pattern rows: row n holds n tiles of ONE colour; put all tiles on one row  take1b, take2b
//   a colour already on that wall row blocks the row; full rows do not glow ... take2b, last2
//   take from the middle; the first to do so takes the Sun token ............. middle, sun
//   overflow falls to the floor; floor spaces cost -1 -1 -2 -2 -2 -3 -3 ....... middle2, floor, floorpen
//   rows that are not full keep their tiles for later ........................ olive2, tiling, last2
//   the round ends when every kiln and the middle are empty .................. tiling
//   each full row sends ONE tile to the wall, the rest is discarded .......... tiling
//   scoring: alone = 1; otherwise row line + column line ...................... chain0, chain1, chain2
//   the Sun token holder starts next round (it also costs a floor space) ..... sun
//   the game ends after the round in which a wall row is complete ............ bonus
//   end bonuses: row +2, column +7, all five of a colour +10; most points wins; ties: more rows  bonus, final
//   (variants - unmarked mosaic, prism tiles - are in the lightbulb's rules cards)
// The staged game: you (Coral, seat 0) and Olive (seat 1, scripted) in the last round of a game. Your mosaic already holds 12 tiles, so ONE round teaches
// the whole scoring cycle, including all three end bonuses. Tiles are placed by hand below (never saved, never counted as a real game).
const TUT_GAME='sunglaze';
const TUT={at:null,res:null,coach:true,part:'A'};
const tutOn=()=>!!UI.tut&&typeof GXT!=='undefined'&&GXT.active();
const firstTime=()=>{try{return !localStorage.getItem('sgz_guided')&&!localStorage.getItem('sgz_offer')&&!GXT.status(TUT_GAME).seen}catch(e){return true}};
const tutBtn=(cls,sub)=>typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:firstTime(),cls:cls,launch:tutLaunch,sub:sub});
const tutWait=(cond,ms)=>new Promise(res=>{const t0=Date.now();(function f(){let ok=false;try{ok=cond()}catch(e){}if(ok||Date.now()-t0>(ms||20000))res();else setTimeout(f,60)})()});
// the board waits here (inside the animation queue) until the step that explains this moment is dismissed
function tutPause(name){return new Promise(res=>{if(!UI.tut||!tutOn()){res();return}TUT.at=name;TUT.res=res})}
function tutRelease(){const r=TUT.res;TUT.at=null;TUT.res=null;if(r)r()}
// ---------------------------------------------------------------- the staged game
const TUT_K=[[2,2,1,0],[4,4,3,3],[0,0,0,1],[2,2,2,2],[4,4,4,4]];      // the five kilns: Garnet Garnet Saffron Cobalt | Frost Frost Obsidian Obsidian | Cobalt x3 Saffron | Garnet x4 | Frost x4
const TUT_O_B=[[1,3,1],[2,0,3],[4,4,4],[-1,1,2]];
const TUT_KA=[[3,3,1,0],[2,2,4,4],[0,0,0,1],[],[]];                  // part A (a real round 1 from empty boards): Obsidian x2 Saffron Cobalt | Garnet x2 Frost x2 | Cobalt x3 Saffron | two kilns stay empty
const TUT_O_A=[[1,2,1],[2,0,2],[-1,0,0]];                              // Olive in part A: Garnet x2 -> row 2, Cobalt x3 -> row 3, the last Cobalt -> row 1
const TUT_O=()=>TUT.part==='A'?TUT_O_A:TUT_O_B;                       // Olive's four takes: [source, glaze, rack index]
function tutBuild(){if(TUT.part==='A')return tutBuildA();UI.sel=null;UI.tgt=null;UI.adv=null;UI.hover=null;UI.fx.length=0;UI.fxSeen=0;UI.recap=[];UI.modal=null;UI.lastHuman=null;UI.guideNote='';
  const _r=refresh;refresh=function(){};
  try{newGame({np:2,seats:['human','ai'],lv:['normal','easy'],names:['Coral','Olive'],mode:'x'})}finally{refresh=_r}
  const take=c=>{const k=G.bag.indexOf(c);if(k<0)throw Error('tutor: the sack has no tile '+c);G.bag.splice(k,1)};
  for(const a of G.fac)G.bag.push(...a);
  G.fac=TUT_K.map(a=>{a.forEach(take);return a.slice()});
  const put=(p,r,c,v)=>{take(v);P(p).wall[r][c]=v};
  for(let c=0;c<4;c++)put(0,0,c,WALLC(0,c));                           // your top row: four of five
  for(let r=1;r<5;r++)put(0,r,4,WALLC(r,4));                           // the last column: four of five
  for(const [r,c] of [[1,0],[2,1],[3,2],[4,3]])put(0,r,c,4);           // four of the five Frost tiles
  for(let r=0;r<3;r++)put(1,r,WALLCOL(0,r),0);                         // Olive: three Cobalt, two Saffron
  for(let r=0;r<2;r++)put(1,r,WALLCOL(1,r),1);
  P(0).score=21;P(1).score=12;G.round=4;G.first=0;G.cur=0;G.markerIn='ctr';G.log=[];G.logN=0;G.turn=0;
  UI.fx.length=0;UI.fxSeen=0;BF.gk='';BF.q.length=0;BF.seen={};
  try{resetScene()}catch(e){}
  TUT.t0=Date.now();refresh()}
function tutBuildA(){UI.sel=null;UI.tgt=null;UI.adv=null;UI.hover=null;UI.fx.length=0;UI.fxSeen=0;UI.recap=[];UI.modal=null;UI.lastHuman=null;UI.guideNote='';
  const _r=refresh;refresh=function(){};
  try{newGame({np:2,seats:['human','ai'],lv:['normal','easy'],names:['Coral','Olive'],mode:'x'})}finally{refresh=_r}
  const take=c=>{const k=G.bag.indexOf(c);if(k<0)throw Error('tutor: the sack has no tile '+c);G.bag.splice(k,1)};
  for(const a of G.fac)G.bag.push(...a);
  G.fac=TUT_KA.map(a=>{a.forEach(take);return a.slice()});
  P(0).score=0;P(1).score=0;G.round=1;G.first=0;G.cur=0;G.markerIn='ctr';G.log=[];G.logN=0;G.turn=0;
  UI.fx.length=0;UI.fxSeen=0;BF.gk='';BF.q.length=0;BF.seen={};
  try{resetScene()}catch(e){}
  TUT.t0=Date.now();refresh()}
function tutOlive(n){const t=TUT_O()[n];const m=t&&sideToAct()===1?validMoves(1).find(x=>x.src===t[0]&&x.c===t[1]&&x.line===t[2]&&!x.j):null;if(m)go(m);else console.error('tutor: Olive has no move '+n)}
// ---------------------------------------------------------------- where each step points
const tq=sel=>()=>{const e=document.querySelector(sel);return e&&e.getBoundingClientRect().width?e:null};
const tIdle=()=>!!G&&!G.over&&!bfHold()&&!BF.menu&&BF.peek==null&&!UI.modal;
const tYou=()=>tIdle()&&sideToAct()===0;
const tTile=(src,c)=>()=>{const a=src<0?G.ctr:G.fac[src];const k=a?a.indexOf(c):-1;return k<0?null:bfEl((src<0?'c':'f'+src)+'_'+k)};
const tRack=r=>()=>bfQ(r<5?`[data-bfrow="${r}"] .bf-rack`:'.bf-fl');
const tSel=(src,c)=>!!UI.sel&&UI.sel.src===src&&UI.sel.c===c&&!!bfQ('.bf-row.ok');
const tWall=(r,c)=>()=>bfSlot(`w0_${r}_${c}`);
function tutSteps(){return TUT.part==='A'?tutStepsA():tutStepsB()}
function tutStepsA(){return [
  // CHAPTER 1: your first turn (a real round 1, empty boards)  |  CHAPTER 2: the middle, the floor, scoring a round
 {id:'a_goal',title:'This is a real game',say:'Set tiles onto your wall (the grid) to score. When the game ends, the most points wins.',target:tq('.bf-me'),wait:null,ready:()=>tYou()&&G.turn===0&&Date.now()-TUT.t0>2000},
 {id:'a_kilns',title:'Kilns hold tiles',say:'Each round, every kiln is filled with four tiles. Today three are loaded. Take from one kiln or the middle.',target:tq('.bf-table'),wait:null,ready:()=>tYou()&&G.turn===0},
 {id:'a_take',title:'Take one colour',say:'Tap an Obsidian tile (black). You take every Obsidian on that kiln.',target:tTile(0,3),
   wait:{type:'tap',match:a=>a.what==='pick'&&a.src===0&&a.c===3},ready:()=>tYou()&&G.turn===0&&!UI.sel},
 {id:'a_place',title:'Place them on a row',say:'Row 2 holds two tiles of one colour. Tap it to place your two Obsidians.',target:tRack(1),
   wait:{type:'tap',match:a=>a.what==='go'&&a.line===1},ready:()=>tYou()&&tSel(0,3)},
 {id:'a_slide',title:'Leftovers slide',say:'The other tiles slid to the middle. Anyone may take from the middle later.',target:tq('.bf-pool'),wait:null,ready:()=>tIdle()&&G.turn===1},
 {id:'a_olive1',title:'Olive takes a kiln',say:'Olive took both Garnets. The two Frost tiles slid to the middle too.',target:tq('.bf-pool'),wait:null,
   ai:()=>tutWait(()=>tIdle()&&sideToAct()===1).then(()=>tutOlive(0)),ready:()=>tYou()&&G.turn===2},
 {id:'a_middle',title:'Take from the middle',say:'Tap a Frost in the middle. The first player to take there also gets the Sun token.',target:tTile(-1,4),
   wait:{type:'tap',match:a=>a.what==='pick'&&a.src===-1&&a.c===4},ready:()=>tYou()&&G.turn===2&&!UI.sel},
 {id:'a_overflow',title:'Too many tiles',say:'Tap row 1. It holds one tile, so the second Frost falls to the floor.',target:tRack(0),
   wait:{type:'tap',match:a=>a.what==='go'&&a.line===0},ready:()=>tYou()&&tSel(-1,4)},
 {id:'a_floor',title:'The floor costs points',say:'Floor spaces cost −1, −1, −2, −2, −2, −3, −3 points when the round ends.',target:tq('.bf-floor'),wait:null,ready:()=>tIdle()&&G.turn===3},
 {id:'a_sun',title:'The Sun token',say:'The Sun token took the first floor space. It costs 1 point, but you start the next round.',target:()=>bfSlot('x0_0'),wait:null,ready:()=>tIdle()&&G.turn===3},
 {id:'a_olive2',title:'Olive takes again',say:'Olive took three Cobalt and filled row 3. The leftover Saffron slid to the middle.',target:tq('.bf-pool'),wait:null,
   ai:()=>tutWait(()=>tIdle()&&sideToAct()===1).then(()=>tutOlive(1)),ready:()=>tYou()&&G.turn===4},
 {id:'a_keep',title:'Take two Saffron',say:'Tap a Saffron in the middle. You take both.',target:tTile(-1,1),
   wait:{type:'tap',match:a=>a.what==='pick'&&a.src===-1&&a.c===1},ready:()=>tYou()&&G.turn===4&&!UI.sel},
 {id:'a_keep2',title:'A row can wait',say:'Row 4 holds four, so two tiles only fill it halfway. They stay there for the next round.',target:tRack(3),
   wait:{type:'tap',match:a=>a.what==='go'&&a.line===3},ready:()=>tYou()&&tSel(-1,1)},
 {id:'a_tiling',title:'The round is over',say:'Olive took the last tile. Kilns and middle are empty, so each full row sends one tile to the wall.',target:tq('.bf-me'),wait:null,
   ai:()=>tutWait(()=>tIdle()&&sideToAct()===1).then(()=>tutOlive(2)),onNext:tutRelease,ready:()=>TUT.at==='tiling'},
 {id:'a_wall0',title:'Alone scores one',say:'This Frost touches no other tile, so it scores 1 point. Rows fill from the top down.',target:tWall(0,4),wait:null,onNext:tutRelease,ready:()=>TUT.at==='wall0'},
 {id:'a_wall1',title:'Touching tiles score',say:'This Obsidian touches the Frost above it: a line of two tiles scores 2 points.',target:tWall(1,4),also:tWall(0,4),wait:null,onNext:tutRelease,ready:()=>TUT.at==='wall1'},
 {id:'a_pen',title:'Pay for the floor',say:'The Frost and the Sun token cost −1 and −1. Your round: 1 + 2 − 2 = 1 point.',target:tq('.bf-floor'),wait:null,onNext:tutRelease,ready:()=>TUT.at==='floor'},
 {id:'a_end',title:'Round one is scored',say:'Next rounds repeat this. Row 4 keeps its two tiles. Next: bigger chains, end bonuses and winning.',target:tq('.bf-me'),wait:null,onNext:tutRelease,ready:()=>TUT.at==='r1end'}
]}
function tutStepsB(){return [
 {id:'goal',title:'Tile the palace wall',say:'Set tiles onto your wall to score points. When the game ends, the most points wins.',target:tq('.bf-me'),wait:null,ready:()=>tYou()&&G.turn===0&&Date.now()-TUT.t0>2000},
 {id:'kilns',title:'Five kilns',say:'Each kiln holds four tiles. On your turn you take tiles from one kiln, or from the middle.',target:tq('.bf-table'),wait:null,ready:()=>tYou()&&G.turn===0},
 {id:'take1',title:'Take a colour',say:'Tap a Garnet tile. You take every Garnet on that kiln.',target:tTile(0,2),
   wait:{type:'tap',match:a=>a.what==='pick'&&a.src===0&&a.c===2},ready:()=>tYou()&&G.turn===0&&!UI.sel},
 {id:'take1b',title:'Fill a pattern row',say:'The second row holds two tiles of one colour. Tap it to place your two Garnets.',target:tRack(1),
   wait:{type:'tap',match:a=>a.what==='go'&&a.line===1},ready:()=>tYou()&&tSel(0,2)},
 {id:'slide',title:'Leftovers slide',say:'The other tiles slid into the middle. Anyone can take them from there.',target:tq('.bf-pool'),wait:null,ready:()=>tIdle()&&G.turn===1},
 {id:'olive1',title:'Olive takes a kiln',say:'Olive took both Obsidians. The two Frost tiles from that kiln slid to the middle.',target:tq('.bf-pool'),wait:null,
   ai:()=>tutWait(()=>tIdle()&&sideToAct()===1).then(()=>tutOlive(0)),ready:()=>tYou()&&G.turn===2},
 {id:'middle',title:'Take from the middle',say:'Tap a Frost in the middle. The first to take there also gets the Sun token.',target:tTile(-1,4),
   wait:{type:'tap',match:a=>a.what==='pick'&&a.src===-1&&a.c===4},ready:()=>tYou()&&G.turn===2&&!UI.sel},
 {id:'middle2',title:'Too many tiles',say:'Tap the top row. It holds one tile, so the second Frost falls to the floor.',target:tRack(0),
   wait:{type:'tap',match:a=>a.what==='go'&&a.line===0},ready:()=>tYou()&&tSel(-1,4)},
 {id:'floor',title:'The floor',say:'Extra tiles land on the floor. Each space costs points at round end: −1, −1, −2, −2…',target:tq('.bf-floor'),wait:null,ready:()=>tIdle()&&G.turn===3},
 {id:'sun',title:'The Sun token',say:'The Sun token sits on your floor: one penalty, but you start the next round.',target:()=>bfSlot('x0_0'),wait:null,ready:()=>tIdle()&&G.turn===3},
 {id:'olive2',title:'Olive takes again',say:'Olive took the three Cobalt. The leftover Saffron slid to the middle.',target:tq('.bf-pool'),wait:null,
   ai:()=>tutWait(()=>tIdle()&&sideToAct()===1).then(()=>tutOlive(1)),ready:()=>tYou()&&G.turn===4},
 {id:'take2',title:'Take four',say:'Tap a Garnet in the fourth kiln. All four are yours in one take.',target:tTile(3,2),
   wait:{type:'tap',match:a=>a.what==='pick'&&a.src===3&&a.c===2},ready:()=>tYou()&&G.turn===4&&!UI.sel},
 {id:'take2b',title:'A perfect fit',say:'The fourth row holds exactly four tiles. Tap it. Rows 1 and 3 already have Garnet on the wall.',target:tRack(3),
   wait:{type:'tap',match:a=>a.what==='go'&&a.line===3},ready:()=>tYou()&&tSel(3,2)},
 {id:'olive3',title:'Olive takes again',say:'Olive took four Frost. All kilns are empty now. Only the middle still has tiles.',target:tq('.bf-pool'),wait:null,
   ai:()=>tutWait(()=>tIdle()&&sideToAct()===1).then(()=>tutOlive(2)),ready:()=>tYou()&&G.turn===6},
 {id:'last',title:'Last pick',say:'Tap the single Cobalt in the middle.',target:tTile(-1,0),
   wait:{type:'tap',match:a=>a.what==='pick'&&a.src===-1&&a.c===0},ready:()=>tYou()&&G.turn===6&&!UI.sel},
 {id:'last2',title:'Only some rows glow',say:'Rows 1 and 5 already have Cobalt on the wall; rows 2 and 4 are full. Tap the third row.',target:tRack(2),
   wait:{type:'tap',match:a=>a.what==='go'&&a.line===2},ready:()=>tYou()&&tSel(-1,0)},
 {id:'tiling',title:'Round over',say:'Kilns and middle are empty. Each full row sends one tile to your wall; the third row waits.',target:tq('.bf-me'),wait:null,
   ai:()=>tutWait(()=>tIdle()&&sideToAct()===1).then(()=>tutOlive(3)),onNext:tutRelease,ready:()=>TUT.at==='tiling'},
 {id:'chain0',title:'Frost scores ten',say:'Frost completes a row of five and a column of five: 5 + 5 = 10 points.',target:tWall(0,4),wait:null,onNext:tutRelease,ready:()=>TUT.at==='wall0'},
 {id:'chain1',title:'Touching tiles',say:'This Garnet touches a line of two across and two down: 2 + 2 = 4 points.',target:tWall(1,3),wait:null,onNext:tutRelease,ready:()=>TUT.at==='wall1'},
 {id:'chain2',title:'Alone scores one',say:'This Garnet touches nothing, so it scores 1 point. The other three Garnets are discarded.',target:tWall(3,0),wait:null,onNext:tutRelease,ready:()=>TUT.at==='wall3'},
 {id:'floorpen',title:'Pay for the floor',say:'Now the floor: the Frost and the Sun token cost −1 and −1. Your score drops by 2.',target:tq('.bf-floor'),wait:null,onNext:tutRelease,ready:()=>TUT.at==='floor'},
 {id:'bonus',title:'The game ends',say:'A full wall row ends the game. Bonuses: row +2, column +7, whole colour +10. You earn all three!',target:tq('.bf-me'),wait:null,onNext:tutRelease,ready:()=>TUT.at==='bonus'},
 {id:'final',title:'Most points wins',say:()=>`You finish with ${P(0).score} points to Olive's ${P(1).score}. A tie goes to the most full rows.`,target:tq('.bf-me'),wait:null,onNext:tutRelease,ready:()=>TUT.at==='final'}
]}
// ---------------------------------------------------------------- start, leave, story
function tutSetup(){try{GX.close()}catch(e){}try{GXH.hide()}catch(e){}
  clearTimeout(aiTimer);aiTimer=null;TUT.at=null;TUT.res=null;TUT.coach=UI.coach;UI.coach=false;UI.tut=1;UI.pause=false;
  const m=document.getElementById('modal');if(m){m.hidden=true;m.innerHTML='';m.dataset.h=''}
  window.__tutPh=1;phApply();bfApply();                                  // the board-first table, on any screen
  tutBuild()}
function tutLeave(){tutRelease();UI.tut=0;UI.coach=TUT.coach;UI.sel=null;UI.tgt=null;UI.adv=null;clearTimeout(aiTimer);aiTimer=null;
  try{bfSpeedUp()}catch(e){}BF.q.length=0;BF.gk='';BF.disp=null;BF.resHide=false;BF.menu=false;BF.peek=null;G=null;
  try{GXH.hide()}catch(e){}window.__tutPh=0;phApply();bfApply();try{resetScene()}catch(e){}}
function tutStart(o){if(typeof GXT==='undefined')return;const pro=o&&o.prologue?o:null;TUT.part=o&&o.part==='B'?'B':'A';const A=TUT.part==='A';const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  GXT.start({game:TUT_GAME,steps:tutSteps(),story:!!(window.CAMPAIGN&&typeof GXC!=='undefined'),
    endTitle:A?'Chapters 1-2 done':'You know the rules',
    endText:A?'You took, placed and scored a real round. Chapters 3-4: bigger chains, end bonuses and winning.':(pro?'Take, place, tile, score, bonuses. Now the Story begins.':'Take, place, tile, score, bonuses. The lightbulb helps in real games.'),
    endButtons:A?(pro?[{id:'partB',label:'Next: chains and the end'}]:[{id:'partB',label:'Next: chains and the end'},{id:'play',label:'Just play'}]):(pro&&first?[{id:'chapter',label:'Start chapter 1'}]:null),
    setup:tutSetup,
    onDone:r=>{const c=r&&r.choice;
      if(c==='partB'){tutLeave();tutStart({part:'B',prologue:pro});return}
      tutLeave();
      if(c==='chapter'&&first){openStart();GXC.play(first.id)}
      else if(c==='story'&&typeof GXC!=='undefined')campOpen();
      else openStart()},
    onExit:()=>{tutLeave();openStart()}})}
// the menu's Tutorial button: first time = chapters 1-2; once finished, pick a chapter group
function tutLaunch(){if(typeof GXT==='undefined')return;if(!GXT.isDone(TUT_GAME)){tutStart();return}
  const d=document.createElement('div');d.className='gxt-end';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','Tutorial chapters');
  d.innerHTML='<div class="gxt-endc"><div class="gxt-et">Tutorial chapters</div><div class="gxt-ex">Replay any part. Each is a short real game with a guide.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-ch="A">Chapters 1-2: your first round</button><button type="button" class="gxt-b" data-ch="B">Chapters 3-4: chains, bonuses, the end</button><button type="button" class="gxt-b" data-ch="x">Close</button></div></div>';
  d.addEventListener('click',e=>{const b=e.target.closest('[data-ch]');if(!b)return;d.remove();if(b.dataset.ch!=='x')tutStart({part:b.dataset.ch})});
  document.body.appendChild(d)}
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a finished player goes straight to the chapter map
function storyOpen(){if(typeof GXC==='undefined')return;if(typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else campOpen()}
// first-time players tapping Begin are offered the tutorial once
function tutOffer(){if(typeof GXT==='undefined'||UI.tut||NET.on||!firstTime())return false;
  try{localStorage.setItem('sgz_offer','1')}catch(e){}
  const d=document.createElement('div');d.className='gxt-end';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','New here?');
  d.innerHTML='<div class="gxt-endc"><div class="gxt-et">New here?</div><div class="gxt-ex">Learn the rules in about five minutes, one tap at a time.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-offer="learn">Learn in 5 minutes</button><button type="button" class="gxt-b" data-offer="play">Just play</button></div></div>';
  d.addEventListener('click',e=>{const b=e.target.closest('[data-offer]');if(!b)return;d.remove();if(b.dataset.offer==='learn')tutStart();else beginGame()});
  document.body.appendChild(d);return true}
// ---------------------------------------------------------------- the game tells the kit what the player does (before it is applied)
(function(){const o=pickSel;pickSel=function(s){
  if(tutOn()&&!GXT.act({type:'tap',what:'pick',src:s.src,c:s.c}))return;
  return o.apply(this,arguments)}})();
(function(){const o=go;go=function(m){
  if(tutOn()){const s=sideToAct();if(s>=0&&P(s)&&P(s).human&&!GXT.act({type:'tap',what:'go',src:m.src,c:m.c,line:m.line}))return}
  return o.apply(this,arguments)}})();
