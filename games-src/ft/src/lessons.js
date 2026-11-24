// ---------- Learn to play = scenario lessons (GXST, shell/gx-scenario-tutor.js). Owner, 24 Nov: tutorials must be SCENARIO GAMES ----------
// They REPLACE the floating tour (tour.js) and the commission bubble (commui.js). Each lesson stacks a tiny real position on the
// commission board (comm.js commNew builds it), ONE goal, ONE highlighted tile; you play real moves and learn from the result.
// Only you move (no rival turn): the round ends after your turn, so every lesson is one turn long. Test: ../lessons-test.js.
// Board (rows A-E, 6 columns, index = row*6 + col):  O b H S b O / b S H S B b / B S O H S O / b B S b O H / O b H B S b
//   RULE -> LESSON: lift, drop one per tile, last lands on its colour ... move | take every one of that colour ... take
//   Masons earn coins per blue tile around ... masons | Traders bring goods, sell different kinds together ... sell
//   Hamlet raises a palace ... palace | Shadows remove a rival's Advisor ... shadow | Shrine: 2 Sages summon a djinn ... djinn
const LS={on:false,c0:0,hl:null};
const lsMe=()=>G.pl[0];
const lsT=i=>()=>tileEl(i);
const lsAct=()=>document.querySelector('#acts button:not([disabled])')||document.querySelector('#acts');
const lsEnded=()=>!!(G&&G.act&&G.act.tile!=null);
const lsWhere=()=>G&&G.act?tileCoord(G.act.tile):'';
function lsStage(sp){LS.on=true;try{GX.close()}catch(e){}clearTimeout(aiTimer);aiTimer=null;clearTimeout(UI.autoT);UI.autoT=0;UI.modal=null;UI.fx.length=0;UI.fxSeen=0;
  try{guideEnd()}catch(e){}try{coachEnd()}catch(e){}try{GXH.hide()}catch(e){}resetScene();
  commNew(-1,Object.assign({me:{camels:8,coins:10},rivalSet:{camels:8,coins:10}},sp));G.comm=null;G.lsn=sp.id;G.log=[];LS.c0=lsMe().coins;
  UI.snap=null;document.body.classList.add('lesson');refresh();render();try{fit()}catch(e){}setTimeout(()=>{try{fit()}catch(e){}},60);schedule()}
const LESSONS=[
 {id:'move',title:'Lift and drop',par:3,
  rule:'Lift every person on a tile. Drop one per tile (up, down, left or right), never straight back. The last one lands on its own colour.',
  goal:'Your goal: end your move on the Trader at C4.',
  people:{13:'ta',15:'t',8:'a'},
  setup(){lsStage(this)},target:()=>G&&G.move?tileEl(14):tileEl(13),
  success:()=>lsEnded()&&G.act.tile===15,
  fail:()=>lsEnded()&&G.act.tile!==15?`You ended on ${lsWhere()}. Drop the Advisor first and keep the Trader for last: the last one lands on its own colour.`:false,
  hints:['Lift the two people at C2. The Trader must be the last one dropped.',{say:'Lift C2, drop the Advisor on C3, then the Trader on C4.',target:()=>G&&G.move?tileEl(14):tileEl(13)}],
  debrief:'The last person landed on a tile of its own colour, so your move ended there and the Traders were yours.',
  solve:[{act:'start',tile:13},{act:'step',tile:14,c:'vizier'},{act:'step',tile:15,c:'merchant'}],
  wrong:[{act:'start',tile:13},{act:'step',tile:7,c:'merchant'},{act:'step',tile:8,c:'vizier'}]},
 {id:'take',title:'Take them all',par:4,
  rule:'You take every person of the last colour on the tile where you end, not just the one you dropped.',
  goal:'Your goal: hold 3 Advisors.',
  people:{26:'ea',28:'aa',14:'a'},
  setup(){lsStage(this)},target:()=>G&&G.move?tileEl(27):tileEl(26),
  success:()=>lsMe().vz>=3,
  fail:()=>G.act&&G.act.tribeDone&&lsMe().vz<3?`You hold ${lsMe().vz}. End on the tile where two Advisors already wait: you take all three.`:false,
  hints:['Where do two Advisors already stand? End your move there.',{say:'Lift E3, drop the Sage on E4, the Advisor on E5, then Take.',target:()=>G&&G.move?tileEl(27):tileEl(26)}],
  debrief:'Two Advisors waited at E5; your one joined them and you took all three. Advisors score 1 each.',
  solve:[{act:'start',tile:26},{act:'step',tile:27,c:'elder'},{act:'step',tile:28,c:'vizier'},{act:'tribe'}],
  wrong:[{act:'start',tile:26},{act:'step',tile:20,c:'elder'},{act:'step',tile:14,c:'vizier'},{act:'tribe'}]},
 {id:'masons',title:'Masons earn coins',par:3,
  rule:'Masons earn coins: the number of Masons you take times the blue tiles (Hamlets and Shrines) around the tile.',
  goal:'Your goal: earn 15 coins or more with Masons.',
  people:{13:'m',14:'mm',12:'m'},
  setup(){lsStage(this)},target:()=>G&&G.move?tileEl(14):tileEl(13),
  success:()=>lsMe().coins-LS.c0>=15,
  fail:()=>G.act&&G.act.tribeDone&&lsMe().coins-LS.c0<15?`You earned ${lsMe().coins-LS.c0}. Join the two Masons in the middle (C3): more Masons, more blue tiles around.`:false,
  hints:['More Masons and more blue tiles around both multiply the coins.',{say:'Lift C2, drop on C3 beside the two Masons, then Take.',target:()=>G&&G.move?tileEl(14):tileEl(13)}],
  debrief:'Three Masons times the blue tiles around C3: Masons pay best where Hamlets and Shrines crowd together.',
  solve:[{act:'start',tile:13},{act:'step',tile:14,c:'builder'},{act:'tribe'}],
  wrong:[{act:'start',tile:13},{act:'step',tile:12,c:'builder'},{act:'tribe'}]},
 {id:'sell',title:'Sell a set',par:5,
  rule:'Traders bring goods from the market row. Different goods sold together are worth much more: 1, 3, 7, 13, 21 coins.',
  goal:'Your goal: sell 4 different goods at once (13 coins).',
  people:{4:'t',5:'t'},market:['silk','wheat','fish','fish','spice'],me:{camels:8,coins:10},
  setup(){lsStage(this);lsMe().res=['fish','pottery'];render()},
  target:()=>G&&G.step&&G.step!=='move'?lsAct():tileEl(4),
  success:()=>lsMe().coins-LS.c0>=13,
  fail:()=>{const p=lsMe();return p.res.length<4&&G.act&&G.act.tileDone&&p.coins-LS.c0<13?`You sold for ${p.coins-LS.c0}. Keep all four kinds and sell them in one go: 4 different goods pay 13.`:false},
  hints:['Your Traders bring 2 goods. With Fish and Pottery that is 4 kinds.',{say:'Lift A5, drop on A6, Take, plant the palm, then Sell all four.',target:()=>G&&G.step&&G.step!=='move'?lsAct():tileEl(4)}],
  debrief:'Fish, Pottery, Silk and Wheat sold together paid 13; sold one by one they pay 4.',
  solve:[{act:'start',tile:4},{act:'step',tile:5,c:'merchant'},{act:'tribe'},{act:'tile',place:5},{act:'sell',kinds:['fish','pottery','silk','wheat']}],
  wrong:[{act:'start',tile:4},{act:'step',tile:5,c:'merchant'},{act:'tribe'},{act:'tile',place:5},{act:'sell',kinds:['fish']}]},
 {id:'palace',title:'Raise a palace',par:3,
  rule:'Every tile does something when your move ends there. A Hamlet raises a palace (5 points to whoever holds the tile); an Oasis grows a palm.',
  goal:'Your goal: raise a palace.',
  people:{1:'a',2:'a',0:'a'},
  setup(){lsStage(this)},target:()=>G&&G.step==='tile'?lsAct():tileEl(1),
  success:()=>G.board[2].pal>0,
  fail:()=>lsEnded()&&G.act.tile!==2?`You ended on ${lsWhere()}. Only a Hamlet (A3) raises a palace.`:false,
  hints:['Which tile is a Hamlet? End your move there.',{say:'Lift A2, drop on the Hamlet A3, Take, then raise the palace.',target:()=>G&&G.step==='tile'?lsAct():tileEl(1)}],
  debrief:'Your move ended on a Hamlet, so you raised a palace on land you now hold.',
  solve:[{act:'start',tile:1},{act:'step',tile:2,c:'vizier'},{act:'tribe'},{act:'tile',place:2}],
  wrong:[{act:'start',tile:1},{act:'step',tile:0,c:'vizier'},{act:'tribe'}]},
 {id:'shadow',title:'Shadows strike',par:3,
  rule:'Shadows remove one person within reach (as far as the Shadows you took) or one Advisor or Sage a rival holds.',
  goal:'Your goal: remove one of Farid\'s Advisors.',
  people:{22:'s',23:'s',17:'e'},rivalSet:{camels:8,coins:10,vz:1},
  setup(){lsStage(this)},target:()=>G&&G.step==='tribe'?lsAct():tileEl(22),
  success:()=>G.pl[1].vz===0,
  fail:()=>G.act&&G.act.tribeDone&&G.pl[1].vz>0?'Your Shadows took someone from the board. Farid still holds his Advisor, and it still scores for him.':false,
  hints:['Shadows can reach a rival\'s own Advisors, not only people on the board.',{say:'Lift D5, drop on D6, then choose Farid\'s Advisor.',target:()=>G&&G.step==='tribe'?lsAct():tileEl(22)}],
  debrief:'Your Shadows took Farid\'s Advisor. Breaking a rival\'s Advisor lead can swing 10 points.',
  solve:[{act:'start',tile:22},{act:'step',tile:23,c:'assassin'},{act:'tribe',kill:{pl:1,c:'vizier',fk:0}}],
  wrong:[{act:'start',tile:22},{act:'step',tile:23,c:'assassin'},{act:'tribe',kill:{tile:17,c:'elder',fk:0}}]},
 {id:'djinn',title:'Summon a djinn',par:3,
  rule:'End on a Shrine and pay 2 Sages (or 1 Sage and 1 Mystic) to summon a djinn: it scores points and gives a power.',
  goal:'Your goal: summon a djinn.',
  people:{8:'t',9:'t'},me:{camels:8,coins:10,el:2},
  setup(){lsStage(this)},target:()=>G&&G.step==='tile'?lsAct():tileEl(8),
  success:()=>lsMe().dj.length>0,
  fail:()=>G.act&&G.act.tileDone&&!lsMe().dj.length?'You skipped the Shrine. Pay your 2 Sages there to summon a djinn.':false,
  hints:['B4 is a Shrine. You already hold 2 Sages.',{say:'Lift B3, drop on B4, Take, then summon a djinn.',target:()=>G&&G.step==='tile'?lsAct():tileEl(8)}],
  debrief:'Two Sages paid for a djinn. Djinns score points and each gives a power for the rest of the game.',
  solve:[{act:'start',tile:8},{act:'step',tile:9,c:'merchant'},{act:'tribe'},'dj'],
  wrong:[{act:'start',tile:8},{act:'step',tile:9,c:'merchant'},{act:'tribe'},{act:'tile',skip:1}]}];
// the one highlighted target: a class on the real element (no overlay, never steals a tap)
function lsMark(){const s=window.GXST&&GXST.state();const on=s&&s.open&&s.phase==='play';const a=on?GXST.active():null;let el=null;try{el=a&&a.target?a.target():null}catch(e){}
  if(LS.hl&&LS.hl!==el)LS.hl.classList.remove('ls-target');if(el)el.classList.add('ls-target');LS.hl=el;
  const w=document.querySelector('.gxst-card'),r=s&&s.open?lsSlot():null;if(w&&r&&Math.abs(w.getBoundingClientRect().top-r.top)>2)window.dispatchEvent(new Event('resize'))}   // the board row moved (goods, legend): re-seat the card in its strip
function lsInit(){if(!window.GXST||LS.init)return;LS.init=1;
  GXST.init({game:'sands',scenarios:LESSONS,storageKey:'soq_lessons',keepClear:['.ls-target','.ls-target','.ls-target','.ls-target','#acts','.gx-bar','#seats','#line','#mkt','#mine','#grid'],   // the target is listed 4 times: covering it costs 4x any other area
    settled:()=>!aiTimer,goalAlways:true,phoneSlot:lsSlot});
  const q=document.querySelector('.gxst-q');if(q)q.classList.add('nar-hide');   // phone bar holds at most 5 buttons; Learn to play (menu) and the card reopen the lessons
  setInterval(lsMark,250)}
// the card lives in a free rect, never over board, HUD or bubbles. Phone: the board shrinks (board.css body.lesson) and the card takes the strip
// between the board and the next row under it. PC (land): right of the board, under the market and the claims legend, above your goods / actions.
function lsSlot(){const s=GXST.state();if(!s||s.phase==='picker')return null;const v=sel=>{const e=document.querySelector(sel),r=e&&e.getBoundingClientRect();return r&&r.width>2&&r.height>2?r:null};
  const g=v('#gw');if(!g)return null;let r;
  if(document.documentElement.classList.contains('land')){const top=Math.max(...['#mkt','#cleg','#line','#seats'].map(v).filter(Boolean).map(q=>q.bottom))+6,bot=Math.min(...['#mine','#acts'].map(v).filter(Boolean).map(q=>q.top),innerHeight)-6;
    r={left:Math.max(g.right,(v('#grid')||g).right)+6,top,right:innerWidth-6,bottom:bot}}
  else{let n=document.querySelector('#gw').nextElementSibling;while(n&&!(n.getBoundingClientRect().height>2))n=n.nextElementSibling;
    r={left:4,top:Math.max(g.bottom,(v('#grid')||g).bottom)+4,right:innerWidth-4,bottom:(n?n.getBoundingClientRect().top:innerHeight)-4}}
  return r.right-r.left>200&&r.bottom-r.top>90?r:null}
function lsOpen(){lsInit();if(window.GXST)GXST.picker()}
window.addEventListener('gxst',e=>{if(e.detail.type==='close'){LS.on=false;document.body.classList.remove('lesson');lsMark();try{fit()}catch(x){}}});
document.addEventListener('DOMContentLoaded',()=>{try{lsInit()}catch(e){}});
// ?lesson=menu | <id>[&step=n|win]: open the picker, or a lesson after n moves of its scripted solution (contact sheets, screenshots)
document.addEventListener('DOMContentLoaded',()=>{let q;try{q=new URLSearchParams(location.search)}catch(e){return}const id=q.get('lesson');if(!id)return;
  setTimeout(async()=>{lsOpen();if(id==='menu')return;GXST.start(id);const L=LESSONS.find(x=>x.id===id);if(!L)return;const st=q.get('step');
    const n=st==='win'?L.solve.length:Math.min(+st||0,L.solve.length);const w=ms=>new Promise(r=>setTimeout(r,ms));await w(200);
    for(let k=0;k<n;k++){const m=L.solve[k]==='dj'?validMoves(0).find(x=>x.act==='tile'&&x.dj):L.solve[k];try{go(m)}catch(e){}await w(150)}},300)});
