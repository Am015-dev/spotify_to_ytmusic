// ===================== part 11: the guided first game (W501) =====================
// Owner rule (Nov 2026): a guided first game that teaches EVERY core rule in order, one short sentence (12 words or fewer) and ONE highlighted
// tap per step, then a real game. No "learn later" lists. Built on the shared step kit (shell/gx-tutor.js): a spotlight, one bubble, only the
// glowing thing takes the tap. The board is staged (the last round of a game) so scoring, the game end and the bonuses all happen for real.
// The rival's four moves are scripted so every lesson comes up in the same order every time. Proved by game/tutor-e2e.js (walks it by touch).
const TUT_GAME='sunglaze';
const TUT={at:null,res:null,coach:true,pro:null,rv:0,want:null};
const tutOn=()=>!!UI.tut;
const firstTime=()=>{try{return !localStorage.getItem('sgz_guided')&&!localStorage.getItem('sgz_offer')&&!GXT.status(TUT_GAME).seen}catch(e){return true}};
const tutBtn=(cls,sub)=>typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:firstTime(),cls:cls,launch:tutLaunch,sub:sub});
const tutWait=(cond,ms)=>new Promise(res=>{const t0=Date.now();(function f(){let ok=false;try{ok=cond()}catch(e){}if(ok||Date.now()-t0>(ms||20000))res();else setTimeout(f,60)})()});

// the five kilns: red red yellow blue / snowflake x4 / red x4 / blue blue blue yellow / blue yellow yellow snowflake
const TUT_K=[[2,2,1,0],[4,4,4,4],[2,2,2,2],[0,0,0,1],[0,1,1,4]];
// Tamsin's four scripted takes (seat 1), played after the steps that name them
const TUT_RIVAL=[{act:'take',src:1,c:4,j:0,line:3},{act:'take',src:3,c:0,j:0,line:4},{act:'take',src:4,c:0,j:0,line:4},{act:'take',src:-1,c:0,j:0,line:4}];
function tutBuild(){UI.sel=null;UI.tgt=null;UI.adv=null;UI.hover=null;UI.fx.length=0;UI.fxSeen=0;UI.recap=[];UI.modal=null;UI.lastHuman=null;UI.guideNote='';
  const _r=refresh;refresh=function(){};
  try{newGame({np:2,seats:['human','ai'],lv:['normal','easy'],names:['Coral','Tamsin'],mode:'x'})}finally{refresh=_r}
  const take=c=>{const k=G.bag.indexOf(c);if(k<0)throw Error('tutor: the sack has no tile '+c);G.bag.splice(k,1)};
  for(const a of G.fac)G.bag.push(...a);
  G.fac=TUT_K.map(a=>{a.forEach(take);return a.slice()});
  const put=(p,r,c,v)=>{take(v);P(p).wall[r][c]=v};
  for(let c=0;c<4;c++)put(0,0,c,WALLC(0,c));                           // your top row: four of five
  for(let r=1;r<5;r++)put(0,r,4,WALLC(r,4));                           // the last column: four of five
  for(const [r,c] of [[1,0],[2,1],[3,2],[4,3]])put(0,r,c,4);           // four of the five snowflake (Frost) tiles
  for(let r=0;r<3;r++)put(1,r,WALLCOL(0,r),0);                         // Tamsin: three blue, two yellow
  for(let r=0;r<2;r++)put(1,r,WALLCOL(1,r),1);
  P(0).score=21;P(1).score=12;G.round=4;G.first=0;G.cur=0;G.markerIn='ctr';G.log=[];G.logN=0;G.turn=0;
  UI.fx.length=0;UI.fxSeen=0;BF.gk='';BF.q.length=0;BF.seen={};
  try{resetScene()}catch(e){}
  TUT.t0=Date.now();refresh()}

// ---------------------------------------------------------------- targets on the board-first table
const tq=s=>typeof bfQ==='function'?bfQ(s):null;
const tKiln=(src,c)=>()=>{const a=src<0?G.ctr:G.fac[src];const k=a?a.indexOf(c):-1;return k<0?null:tq(`[data-k="${src<0?'c':'f'+src}_${k}"]`)};
const tRack=r=>()=>tq(`[data-bfrow="${r}"] .bf-rack`);
const tRow=r=>()=>tq(`[data-bfrow="${r}"]`);
const tCell=(r,c)=>()=>tq(`[data-s="w0_${r}_${c}"]`);
const myTurn=()=>!!G&&!G.over&&G.phase==='offer'&&sideToAct()===0&&!BF.busy&&!BF.q.length;
const rivalTurn=()=>!!G&&!G.over&&G.phase==='offer'&&sideToAct()===1&&!BF.busy&&!BF.q.length;
const atBeat=n=>()=>TUT.at===n;
// one step = one sentence + one tap. kind: 'pick' (a tile), 'move' (a rack), 'look' (tap the glowing thing to go on); at = a round-end beat it holds
function tutSteps(){
  const S=(id,say,o)=>Object.assign({id,say},o);
  const pick=(src,c)=>({target:tKiln(src,c),ready:myTurn,wait:{type:'tap',match:a=>a.k==='pick'&&a.src===src&&a.c===c}});
  const move=line=>({target:tRack(line),ready:()=>myTurn()&&!!UI.sel,wait:{type:'tap',match:a=>a.k==='move'&&a.line===line}});
  const look=(target,ready,o)=>Object.assign({target,ready,look:1,wait:{type:'tap',match:a=>a.k==='look'}},o||{});
  const rival=n=>({onDone:()=>tutRival(TUT_RIVAL[n])});
  const beat=(n,target,o)=>look(target,atBeat(n),Object.assign({at:n},o||{}));
  return [
    S('goal','Fill one row of your wall to end the game.',look(()=>tq('[data-bfrow="0"] .bf-wall'),myTurn)),
    S('take','Kilns hold four tiles. Tap red: you take every red.',pick(0,2)),
    S('rows','Rack 2 holds two tiles of one colour. Tap it.',move(1)),
    S('slide','The leftover tiles slid to the middle. Tap the middle.',Object.assign(look(()=>tq('[data-bfsrc="-1"]'),rivalTurn),rival(0))),
    S('rival','Tamsin took four snowflakes. Now tap a red in kiln 3.',pick(2,2)),
    S('blocked','Rack 3 is shut: its wall row has red. Tap rack 4.',Object.assign(move(3),rival(1))),
    S('middle','Tap a yellow in the middle. First one there gets the Sun.',pick(-1,1)),
    S('sun','Tap rack 3. The Sun token goes on your floor.',move(2)),
    S('keep','Rack 3 is not full. It keeps its tiles for later.',Object.assign(look(tRack(2),rivalTurn),rival(2))),
    S('again','Tamsin’s leftovers joined the middle. Tap the two yellows.',pick(-1,1)),
    S('overflow','Rack 3 has one space. The extra yellow falls to the floor.',move(2)),
    S('floor','Floor tiles cost points: −1, −1, −2, −2, −2, −3, −3.',Object.assign(look(()=>tq('.bf-fl'),rivalTurn),rival(3))),
    S('last','Tap the snowflake in the middle. It fits rack 1.',pick(-1,4)),
    S('roundend','Tap rack 1. When all tiles are gone, the round ends.',move(0)),
    S('tiling','Each full rack moves one tile to its wall spot.',beat('tiling',tRow(0),{hold:1})),
    S('chain','Touching tiles score: 5 across + 5 down = 10 points.',beat('wall0',tCell(0,4))),
    S('alone','A tile touching nothing scores just 1 point.',beat('wall3',tCell(3,0))),
    S('floorpen','Your floor costs 2 points. Scores never go below 0.',beat('floor',()=>tq('.bf-fl'))),
    S('gameend','Your top row is full, so the game ends now.',beat('bonus',tRow(0),{keep:1})),
    S('bonus','Bonus: full row +2, full column +7, all five snowflakes +10.',beat('bonus',()=>tq('.bf-me'))),
    S('win','Most points wins. A tie goes to the most full rows.',beat('final',()=>tq('.bf-me'))),
  ]}
// the rules the guided game teaches, in order (one step each); tutor-e2e.js checks every one is shown by touch
const TUT_RULES=['goal','take','rows','slide','rival','blocked','middle','sun','keep','again','overflow','floor','last','roundend','tiling','chain','alone','floorpen','gameend','bonus','win'];
window.__tutSeen=[];

// Tamsin's scripted move: waits for her turn and a still board, then plays it through the normal move path (animated like any rival move)
function tutRival(m){tutWait(()=>!tutOn()||rivalTurn(),20000).then(()=>{if(!tutOn()||!rivalTurn())return;TUT.rv=1;try{go(m)}finally{TUT.rv=0}})}

// ---------------------------------------------------------------- round-end beats: the animation queue waits here until the step's tap
function tutPause(name,x){return new Promise(res=>{
  if(!UI.tut||typeof GXT==='undefined'||!GXT.active()){res();return}
  if(/^wall\d$/.test(name)&&(!x||x.p!==0)){res();return}
  const want=(GXT.current()||{}).at;if(want!==name){res();return}
  TUT.at=name;TUT.res=()=>{TUT.at=null;TUT.res=null;res()}})}
function tutRelease(){const r=TUT.res;TUT.at=null;TUT.res=null;if(r)r()}
function cgRound(){}   // (the old coached game spoke at each new round; the guided game has no free bubbles)

// ---------------------------------------------------------------- input: the board calls the kit BEFORE acting; a wrong tap is refused
(function(){const o=pickSel;pickSel=function(s){if(tutOn()&&GXT.active()&&s&&!GXT.act({type:'tap',k:'pick',src:s.src,c:s.c}))return;return o.apply(this,arguments)}})();
(function(){const o=go;go=function(m){if(tutOn()&&GXT.active()&&!TUT.rv&&m&&m.act==='take'&&sideToAct()===0&&!GXT.act({type:'tap',k:'move',line:m.line,src:m.src,c:m.c}))return;return o.apply(this,arguments)}})();
// 'look' steps: a tap on the glowing thing goes on (and never reaches the board, so nothing else happens)
document.addEventListener('click',e=>{if(!tutOn()||typeof GXT==='undefined'||!GXT.active())return;const st=GXT.current();if(!st||!st.look)return;
  if(e.target&&e.target.closest&&e.target.closest('.gxt-skip,.gxt-end,.gxt-bub'))return;
  let el=null;try{el=st.target()}catch(er){}if(!el)return;const r=el.getBoundingClientRect();const x=e.clientX,y=e.clientY;
  if(x<r.left-10||x>r.right+10||y<r.top-10||y>r.bottom+10)return;
  e.preventDefault();e.stopPropagation();const keep=st.keep;
  if(GXT.act({type:'tap',k:'look'})&&st.at&&!keep)setTimeout(tutRelease,0)},true);

// ---------------------------------------------------------------- start, leave, story
function tutSetup(){try{GX.close()}catch(e){}try{GXH.hide()}catch(e){}
  clearTimeout(aiTimer);aiTimer=null;TUT.at=null;TUT.res=null;TUT.coach=UI.coach;UI.coach=false;UI.tut=1;UI.cg=0;UI.pause=false;window.__tutSeen=[];
  const m=document.getElementById('modal');if(m){m.hidden=true;m.innerHTML='';m.dataset.h=''}
  window.__tutPh=1;phApply();bfApply();                                  // the board-first table, on any screen
  tutBuild()}
function tutLeave(){tutRelease();UI.tut=0;UI.cg=0;UI.coach=TUT.coach;UI.sel=null;UI.tgt=null;UI.adv=null;clearTimeout(aiTimer);aiTimer=null;
  try{if(GXT.running())GXT.stop()}catch(e){}
  try{bfSpeedUp()}catch(e){}BF.q.length=0;BF.gk='';BF.disp=null;BF.resHide=false;BF.menu=false;BF.peek=null;G=null;
  try{GXH.hide()}catch(e){}window.__tutPh=0;phApply();bfApply();try{resetScene()}catch(e){}}
// the real game that follows: you against an easy computer, a fresh deal
function tutRealGame(){tutLeave();try{localStorage.setItem('sgz_guided','1')}catch(e){}UI.setup.np=2;UI.setup.seats=['human','ai'];UI.setup.lv=['easy','easy'];beginGame();UI.modal=null;refresh();try{schedule()}catch(e){}}
function tutStart(o){if(typeof GXT==='undefined')return;TUT.pro=o&&o.prologue?o:null;const pro=TUT.pro;const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  const steps=tutSteps().map(s=>{const e=s.onEnter;return Object.assign(s,{onEnter:()=>{if(window.__tutSeen.indexOf(s.id)<0)window.__tutSeen.push(s.id);if(e)e()}})});
  const btns=pro?[first?{id:'chapter',label:'Start chapter 1'}:null,{id:'map',label:'Story map'},{id:'play',label:'Play a real game'}].filter(Boolean):[{id:'play',label:'Play a real game'}];
  GXT.start({game:TUT_GAME,setup:tutSetup,steps,endTitle:'You know the rules',endText:'Now a real game against the computer.',endButtons:btns,
    onDone:r=>{const c=r&&r.choice;if(c==='chapter'&&first){tutLeave();openStart();GXC.play(first.id)}else if(c==='map'&&typeof campOpen==='function'){tutLeave();campOpen()}else tutRealGame()},
    onExit:()=>{const p=TUT.pro;tutLeave();if(p&&typeof campOpen==='function')campOpen();else openStart()}})}
function tutLaunch(){tutStart()}
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a finished player goes straight to the chapter map
function storyOpen(){if(typeof GXC==='undefined')return;if(typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else campOpen()}
// first-time players tapping Begin: the title's Learn to play button replaces the old pop-up (one cover before the first move)
function tutOffer(){return false}
