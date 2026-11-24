// ===================== part 11: scenario lessons (replaces the old dimming guided game) =====================
// Owner rule (24 Nov): a tutorial is a set of short GAMES. Each lesson stacks a tiny real position on the real board with ONE goal;
// you make real moves and learn the rule from the consequence. Engine: shell/gx-scenario-tutor.js (docs shell/GXST.md).
// The rival's picks are scripted while a lesson runs, and a lesson game is never saved over your real game (refresh() checks __lessons).
// RULE -> LESSON (every rule in rules-html.js has a lesson):
//   take every tile of one colour from a kiln, the rest slide to the middle ......... take
//   a rack holds ONE colour and a fixed number of tiles; extra tiles fall to the floor . racks
//   a rack is shut if its wall row already has that colour ............................ blocked
//   take from the middle: first one takes the Sun token (a floor space), starts next ... sun
//   only a FULL rack sends one tile to the wall; the rest go to the shard box; others keep .. tiling
//   a set tile scores its row and column runs (alone = 1) ................................ chain
//   floor costs 1,1,2,2,2,3,3 at round end; a score never drops below 0; tiles you cannot place go there ... floor
//   a full wall row ends the game; bonuses: row +2, column +7, colour +10 ............... end
//   most points wins; a tie goes to the most full rows; kilns refill; short real game ..... game
// Proved by shell/gxst-test.js style test: azul/game/lessons-test.js (every lesson solved by real taps, a wrong move fails, Retry works).
const LSN={on:0,coach:false,gxh:false,ri:0,opp:null,n:0};
const lsnLive=()=>!!window.__lessons&&!!G&&!!window.GXST&&!!GXST.active();
// ---- entry points the rest of the game calls (they replace the old guided-game button, story prologue and offer)
function tutBtn(cls,sub){return `<button type="button" class="${cls} gxt-menu" data-lessons="1" data-help><b>Lessons</b>${sub===false?'':'<span>Learn by playing short games</span>'}</button>`}
function tutOn(){return false}
function tutOffer(){return false}
function storyOpen(){if(typeof campOpen==='function')campOpen()}
function tutStart(){lsnOpen()}
function lsnOpen(){try{GX.close()}catch(e){}BF.menu=false;lsnEnter();if(window.GXST)GXST.picker()}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-lessons]');if(!b)return;e.preventDefault();e.stopPropagation();lsnOpen()},true);
// ---- lessons own the screen: the board-first table on any size, tips off, never saved over the real game
function lsnEnter(){if(window.__lessons)return;window.__lessons=1;LSN.coach=UI.coach;try{LSN.gxh=GXH.enabled()}catch(e){}
  UI.coach=false;try{GXH.setEnabled(false);GXH.hide()}catch(e){}
  document.documentElement.classList.add('sg-tut');window.__tutPh=1;phApply();bfApply()}
function lsnLeave(){if(!window.__lessons)return;window.__lessons=0;clearTimeout(aiTimer);aiTimer=null;UI.coach=LSN.coach;try{GXH.setEnabled(LSN.gxh)}catch(e){}
  try{bfSpeedUp()}catch(e){}BF.q.length=0;BF.gk='';BF.disp=null;BF.resHide=false;BF.menu=false;BF.peek=null;G=null;
  document.documentElement.classList.remove('sg-tut');window.__tutPh=0;phApply();bfApply();try{resetScene()}catch(e){}openStart()}
(function(){
  if(!window.GXST)return;
  const until=(f,ms)=>new Promise(r=>{const t0=Date.now();(function w(){let ok=false;try{ok=f()}catch(e){}if(ok||Date.now()-t0>ms)r(ok);else setTimeout(w,60)})()});
  const me=()=>P(0),rv=()=>P(1);
  const wallN=p=>p.wall.reduce((n,r)=>n+r.filter(v=>v>=0).length,0);
  const have=(p,c)=>p.lines.reduce((n,L)=>n+L.filter(t=>t===c).length,0)+p.floor.filter(t=>t===c).length;
  const tile=(src,c)=>()=>{const a=src<0?G.ctr:G.fac[src];const k=a?a.indexOf(c):-1;if(k<0)return null;const e=bfQ(`[data-k="${src<0?'c':'f'+src}_${k}"]`);return e&&(e.querySelector('svg')||e)};
  // multi-step take: ring the tile first, then (once picked, UI.sel set) the rack
  const tr=(t,r)=>()=>UI.sel?r():t();
  const rack=r=>()=>bfQ(`[data-bfrow="${r}"] .bf-rack`);
  const later=()=>G.round>1||!!G.over;       // the round has been played out and the walls were tiled
  // a small deal from named tiles; every tile is still counted once (the rest stay in the sack), so the engine's invariants hold
  // sp: {fac:[5 kilns], ctr, me:{lines,wall:[[r,c]],floor,score}, rv:{...}, opp:[scripted rival picks {c,src?,line?}], round}
  function stack(sp){
    lsnEnter();clearTimeout(aiTimer);aiTimer=null;
    return until(()=>!BF.busy,5000).then(()=>{
      const m=document.getElementById('modal');if(m){m.hidden=true;m.innerHTML='';m.dataset.h=''}
      try{GX.close()}catch(e){}try{GXH.hide()}catch(e){}
      UI.sel=null;UI.tgt=null;UI.adv=null;UI.hover=null;UI.fx.length=0;UI.fxSeen=0;UI.recap=[];UI.modal=null;UI.lastHuman=null;UI.guideNote='';UI.pause=false;UI.cmp=null;
      setSeed(7);const _r=refresh;refresh=function(){};
      try{newGame({np:2,seats:['human','ai'],lv:['normal','easy'],names:['Coral','Tamsin'],mode:'x'})}finally{refresh=_r}
      const take=c=>{const k=G.bag.indexOf(c);if(k<0)throw Error('lessons: the sack has no tile '+c);G.bag.splice(k,1);return c};
      for(const a of G.fac)G.bag.push(...a);
      G.fac=[0,1,2,3,4].map(i=>(sp.fac[i]||[]).map(take));G.ctr=(sp.ctr||[]).map(take);
      [sp.me||{},sp.rv||{}].forEach((o,i)=>{const p=P(i);(o.lines||[]).forEach((L,r)=>{p.lines[r]=L.map(take)});(o.wall||[]).forEach(w=>{p.wall[w[0]][w[1]]=take(WALLC(w[0],w[1]))});
        p.floor=(o.floor||[]).map(take);p.score=o.score||0;p.last=null});
      G.round=sp.round||1;G.first=0;G.cur=0;G.markerIn='ctr';G.phase='offer';G.turn=0;G.log=[];G.logN=0;
      LSN.opp=sp.opp||null;LSN.ri=0;LSN.n=0;BF.resHide=false;
      UI.fx.length=0;UI.fxSeen=0;BF.gk='';BF.q.length=0;BF.seen={};try{resetScene()}catch(e){}
      refresh();
      return until(()=>G&&sideToAct()===0&&!BF.busy&&bfQ('.bf-table [data-k]'),9000).then(()=>new Promise(r=>setTimeout(r,500)));
    });
  }
  // the top row, last column and four snowflakes of a nearly finished wall (rows/columns/colours all one tile short)
  const LATE=[[0,0],[0,1],[0,2],[0,3],[1,4],[2,4],[3,4],[4,4],[1,0],[2,1],[3,2],[4,3]];
  const lessons=[
    {id:'take',title:'Take a colour',par:1,rule:'Take every tile of one colour from one kiln. The rest slide to the middle.',
      goal:'Take three red tiles in one turn.',
      setup:()=>stack({fac:[[2,2,2,0],[2,3,1,4],[0,0,1,3],[4,4,3,1],[3,3,1,0]],opp:[{c:3}]}),
      success:()=>have(me(),2)>=3,
      fail:()=>{const l=me().last;if(!l)return false;return l.c===2?'That kiln had one red. Kiln 1 has three: you take every tile of a colour.':'That was not red. Look for the kiln with the most red.'},
      hints:['Which kiln holds the most red? You take all of them at once.',{say:'Tap a red in kiln 1, then any rack.',target:tr(tile(0,2),rack(4))}],
      debrief:'Three reds in one turn. The blue slid to the middle.'},
    {id:'racks',title:'Fill a rack',par:1,rule:'A rack holds one colour and a set number of tiles. Extra tiles fall to the floor.',
      goal:'Fill a rack with the four blue. Spill nothing.',
      setup:()=>stack({fac:[[0,0,0,0],[2,2,3,3],[1,4,4,2],[3,1,1,4],[2,3,0,1]],me:{lines:[[],[],[],[],[1,1]]},opp:[{c:2}]}),
      success:()=>me().lines.some((L,r)=>L.length===cap(r)&&L[0]===0)&&!me().floor.length,
      fail:()=>{const l=me().last;if(!l)return false;if(me().floor.length)return 'Rack '+(l.line+1)+' holds '+cap(l.line)+'. The extra '+me().floor.length+' fell to the floor and cost points.';return l.c===0?false:'Take the four blue tiles in kiln 1.'},
      hints:['Rack 5 is yellow, so blue cannot join it. Which rack holds exactly four?',{say:'Take the blue, then tap rack 4: it holds four.',target:tr(tile(0,0),rack(3))}],
      debrief:'Four blue fill rack 4 exactly. Nothing spilled.'},
    {id:'blocked',title:'Shut racks',par:1,rule:'A rack is shut for a colour its wall row already has. Pick an open rack.',
      goal:'Take the three yellow. Lose none to the floor.',
      setup:()=>stack({fac:[[1,1,1,0],[2,2,3,4],[3,3,0,4],[2,4,4,0],[2,3,0,3]],me:{wall:[[2,3]]},opp:[{c:2}]}),
      success:()=>have(me(),1)>=3&&!me().floor.length,
      fail:()=>{const l=me().last;if(!l)return false;if(me().floor.length)return 'Yellow fell to the floor. Rack 3 is shut: its wall row already has yellow. Racks 4 and 5 are open.';return l.c===1?false:'Take the three yellow tiles in kiln 1.'},
      hints:['Look at the wall. Which row already has a yellow tile?',{say:'Rack 3 is shut. Rack 4 holds the three yellow.',target:tr(tile(0,1),rack(3))}],
      debrief:'Yellow is already on wall row 3, so rack 3 stays shut.'},
    {id:'sun',title:'The Sun token',par:1,rule:'The first to take from the middle gets the Sun token. It costs a floor space, and you start next round.',
      goal:'Start next round. Win the Sun token first.',
      setup:()=>stack({fac:[[0,1,3,4],[3,3,0,1],[4,0,1,3],[1,1,4,0],[3,4,0,1]],ctr:[2,2,3],opp:[{src:-1,c:2}]}),
      success:()=>!!me().last&&me().last.src<0&&me().floor.includes(SUN),
      fail:()=>{const l=rv().last;return l&&l.src<0&&!me().floor.includes(SUN)?'Tamsin took from the middle first. She holds the Sun token and starts next round.':false},
      hints:['The Sun token starts in the middle of the table.',{say:'Take the red from the middle, then a rack.',target:tr(tile(-1,2),rack(3))}],
      debrief:'The Sun token is on your floor: -1 now, but you start next round.'},
    {id:'tiling',title:'Full racks',par:1,rule:'At round end each full rack sends one tile to the wall. The rest go to the shard box. Other racks keep theirs.',
      goal:'Put a tile on your wall this round.',
      setup:()=>stack({fac:[[2],[3]],me:{lines:[[],[],[2,2],[3,3],[]]},opp:[{c:3}]}),
      success:()=>later()&&wallN(me())>0,
      fail:()=>later()&&!wallN(me())?'No rack was full, so nothing reached the wall. Rack 3 needed one more red.':false,
      hints:['Only a full rack sends a tile to the wall. Which rack is one short?',{say:'Take the red: it fills rack 3.',target:tr(tile(0,2),rack(2))}],
      debrief:'Rack 3 was full, so a red tile moved to the wall. Rack 4 kept its tiles.'},
    {id:'chain',title:'Score a row',par:1,rule:'A new wall tile scores the row and column it joins. A tile on its own scores 1.',
      goal:'Score 4 points from your wall this round.',
      setup:()=>stack({fac:[[0],[4]],me:{wall:[[2,0],[2,1],[2,3]],lines:[[],[],[0,0],[],[4,4,4,4]]},opp:[{c:4}]}),
      success:()=>later()&&me().score>=4,
      fail:()=>later()&&me().score<4?'That tile touched nothing: 1 point. A tile that joins a row of three scores four.':false,
      hints:['One rack is one tile short and sits beside a row of three.',{say:'Take the blue: it fills rack 3 and joins your row.',target:tr(tile(0,0),rack(2))}],
      debrief:'The tile joined three more across: 4 points.'},
    {id:'floor',title:'The floor',par:1,rule:'Floor tiles cost 1, 1, 2, 2, 2, 3, 3 at round end. A score never drops below 0.',
      goal:'Finish the round with at least 4 points.',
      setup:()=>stack({fac:[[0,0,0,0],[2]],me:{score:6,floor:[3,3]},opp:[{c:2}]}),
      success:()=>later()&&me().score>=4,
      fail:()=>{if(!later())return false;const R=G.rsum&&G.rsum[0];return 'Your floor held '+(R?R.nb:'?')+' tiles and cost '+(R?-R.pen:'?')+'. You finished on '+me().score+(me().score===0?'. A score never drops below 0.':'.')},
      hints:['Two tiles are on your floor already. Every new floor tile costs more.',{say:'Take the blue, then tap rack 4: it holds four.',target:tr(tile(0,0),rack(3))}],
      debrief:'Two floor tiles cost 2. Each extra floor tile costs more.'},
    {id:'end',title:'End the game',par:1,rule:'A full wall row ends the game. Bonus: row +2, column +7, each colour with all five tiles +10.',
      goal:'End the game with a row, a column and all five snowflakes.',
      setup:()=>stack({fac:[[4],[0]],me:{wall:LATE,score:21},rv:{wall:[[0,0],[1,1],[2,2]],score:12},opp:[{c:0}]}),
      success:()=>!!G.over&&me().st.rows>0&&me().st.cols>0&&me().st.colours>0,
      fail:()=>later()&&!G.over?'No row was finished, so the game goes on. The snowflake on rack 1 would have ended it.':false,
      hints:['Your top row, last column and snowflakes are each one tile short.',{say:'Take the snowflake and tap rack 1.',target:tr(tile(0,4),rack(0))}],
      debrief:'Row +2, column +7, snowflakes +10 on top of the tile points.'},
    {id:'game',title:'A short game',par:99,rule:'Most points wins. A tie goes to the most full rows.',
      goal:'Finish the game ahead of Tamsin.',
      setup:()=>stack({fac:[[2,2,1,0],[4,4,4,4],[2,2,2,2],[0,0,0,1],[0,1,1,4]],me:{wall:LATE,score:21},rv:{wall:[[0,0],[1,1],[2,2],[0,1],[1,2]],score:12}}),
      success:()=>!!G.over&&G.over.win.indexOf(0)>=0,
      fail:()=>G.over&&G.over.win.indexOf(0)<0?'Tamsin finished ahead, '+rv().score+' to '+me().score+'. Mind the floor and score from your wall.':false,
      hints:['One snowflake fills rack 1 and finishes your top row.',{say:'Take the lone snowflake in kiln 5, then rack 1.',target:tr(tile(4,4),rack(0))}],
      debrief:'You finished ahead. Row, column and colour bonuses won it.'}
  ];
  const go=()=>{
    if(!(typeof newGame==='function'&&typeof BF!=='undefined'&&typeof bfQ==='function'&&typeof openStart==='function'&&typeof aiMove==='function')){setTimeout(go,200);return}
    // the rival plays the lesson's script (first scripted pick that is legal), else its own easy play; my takes are counted for par
    const oam=aiMove;aiMove=function(seat){
      if(lsnLive()&&seat===1&&LSN.opp){const sc=LSN.opp[LSN.ri++]||LSN.opp[LSN.opp.length-1],mv=validMoves(1).filter(m=>m.c===sc.c&&(sc.src==null||m.src===sc.src)&&m.j===0);
        const best=mv.find(m=>m.line<5)||mv[0];if(best)return best}
      return oam.apply(this,arguments)};
    const odt=doTake;doTake=function(m,seat){if(lsnLive()&&seat===0)LSN.n++;return odt.apply(this,arguments)};
    lessons.forEach(s=>{s.moves=()=>LSN.n});
    addEventListener('gxst',e=>{if(e.detail&&e.detail.type==='close')lsnLeave()});
    GXST.init({game:'sunglaze',scenarios:lessons,keepClear:['.bf-table','.bf-me','[data-bf="menu"]','[data-gx="rulesd"]'],
      settled:()=>{if(!G||BF.busy||BF.q.length)return false;if(G.over){if(!BF.resHide&&bfQ('.bf-ov')){BF.resHide=true;bfDraw()}return true}return sideToAct()===0}});
  };
  setTimeout(go,300);
})();
