// ---------- the staged tutorial (shell/gx-tutor.js, GX-KIT.md section 10): a short fixed valley that teaches every rule by doing it once ----------
// Never saved. Fixed tile order (newGame o.stack), scripted computer, 11 tiles: you play the odd turns, the computer the even ones.
// Rules checklist (rules drawer, hlp.js rules cards) and the step that teaches each:
//   goal, most points wins ................. goal, winner
//   draw a tile, turn it ................... turn
//   lay it so every edge matches ........... place1 (road to road), place3 (town to town)
//   follower on a road ..................... fig_road        follower on a town ...... fig_town
//   follower on a priory ................... fig_priory      follower in a field (farmer) fig_farmer
//   or skip the follower ................... skip (and place5, where the skip is done for you)
//   one owner only per road/town/field ..... computer
//   what the computer does ................. computer
//   finished road scores, follower goes home  road_done      finished town scores 2 a tile ... town_done
//   priory ringed by eight tiles scores 9 .. place4, place5, place6, priory_done
//   end: open features score 1 a tile, farmers 3 per finished town, most points wins ... final, winner
//   seven followers ........................ fig_road        River, Taverns, Merchants .... end card (the lightbulb explains them)
const TUT_GAME='rampart-and-vine';
// turn n: [tile, x, y, rotation, follower {ty, side?} or null]
const TUT_TURNS=[
 [29,1,0,0,{ty:'R'}],[28,1,1,3,{ty:'R',side:1}],[1,-1,0,3,{ty:'M'}],[31,2,1,0,null],[21,0,-1,2,{ty:'C'}],[21,-1,-1,0,null],
 [21,-2,-1,0,{ty:'F'}],[29,-2,0,0,null],[29,-2,1,1,null],[9,-1,1,2,null],[21,0,1,3,null]];
const tutOn=()=>typeof GXT!=='undefined'&&GXT.active()&&!!UI.tut;
const tutFirst=()=>{try{return !!UI.first&&!(typeof GXT!=='undefined'&&GXT.status(TUT_GAME).seen)}catch(e){return false}};
const tutBtn=cls=>typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:tutFirst(),cls:cls,launch:tutStart});
const tutT=n=>TUT_TURNS[n-1];
// the segment of the tile just placed that holds this turn's follower
function tutSeg(k,ty,side){const T=G.tiles[k];if(!T)return -1;return TSEG[T.t].findIndex(s=>s.ty===ty&&(side==null||(s.e&&s.e.includes((side-T.r+4)%4))))}
const tutSegOf=n=>{const f=tutT(n)[4];return f?tutSeg(G.cur.k,f.ty,f.side):-1};
// ---------------------------------------------------------------- the computer plays the script
(function(){const o=aiMove;aiMove=function(s){
  if(UI.tut&&G&&!G.over){if(UI.tutHold)return null;const m=tutAIMove();if(m&&isLegal(m,s))return m}
  return o(s)}})();
function tutAIMove(){const e=tutT(G.turn);if(!e)return null;
  if(G.step==='place')return {act:'place',x:e[1],y:e[2],r:e[3]};
  if(G.step==='fig'){if(!e[4])return {act:'skip'};const l=tutSegOf(G.turn);return l<0?{act:'skip'}:{act:'fig',k:'f',l}}
  return null}
// turn 9 needs no follower: the game skips it (a move of the game, not a tap)
function onMoveDone(m,s,before){if(!UI.tut||m.act!=='place'||s!==0||!G||G.turn!==9)return;
  setTimeout(()=>{if(!G||!UI.tut||G.turn!==9||G.step!=='fig'||!myTurn('fig'))return;UI.tutAuto=1;try{performMove({act:'skip'},sideToAct())}finally{UI.tutAuto=0}},450)}
// the input handlers (bf.js) ask here before they act; false = this is not what the step asks
function tutGate(a){if(!UI.tut||UI.tutAuto||typeof GXT==='undefined'||!GXT.active())return true;return GXT.act(Object.assign({type:'tap'},a))}
// ---------------------------------------------------------------- targets
function tutRot(r){if(UI.rot===r)return true;if(myTurn('place')&&UI.rots.includes(r))hlpTurnTo(r);return UI.rot===r}
const tutGlow=n=>()=>{const e=tutT(n),x=e[1],y=e[2];let g=hGlow(x,y);
  if(!g&&G&&G.turn===n&&myTurn('place')){cancelAnimationFrame(UI.tween);UI.tw=false;setView(viewFor({c:Math.max(MINC,UI.view.s*100),cx:x+.5,cy:y+.5},measure()));g=hGlow(x,y)}
  return g};
const tutFig=n=>()=>{const l=tutSegOf(n);return (UI.figs||[]).find(b=>b.isConnected&&b._m.k==='f'&&b._m.l===l)||null};
function tutCells(keys){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const k of keys){const e=UI.tl[k];if(!e)return null;const r=e.getBoundingClientRect();if(!r.width)return null;x0=Math.min(x0,r.left);y0=Math.min(y0,r.top);x1=Math.max(x1,r.right);y1=Math.max(y1,r.bottom)}
  return {left:x0,top:y0,width:x1-x0,height:y1-y0}}
const tutCellsFn=keys=>()=>tutCells(keys);
const tutMp=p=>()=>Object.values(UI.mp).find(e=>e.isConnected&&e.style.getPropertyValue('--c')===PCOL[p])||null;
const tutP=(n,st)=>!!G&&G.turn===n&&myTurn(st);
const tutAfter=(n,pts)=>!!G&&G.turn===n&&G.step==='place'&&G.cur.p===1&&P(0).score===pts;
// ---------------------------------------------------------------- the steps
function tutSteps(){
  const placeW=n=>({type:'tap',match:a=>a.what==='place'&&a.x===tutT(n)[1]&&a.y===tutT(n)[2]});
  const figW=n=>({type:'tap',match:a=>a.what==='fig'&&a.k==='f'&&a.l===tutSegOf(n)});
  const hold=()=>{UI.tutHold=true},release=()=>{UI.tutHold=false;schedAI()};
  const RING=['-2,-1','-1,-1','0,-1','-2,0','-1,0','0,0','-2,1','-1,1','0,1'];
  return [
 {id:'goal',title:'Build the valley',say:'This is where your valley starts. Add tiles, claim roads and towns with followers. Most points wins.',target:()=>UI.tl['0,0'],wait:null,
   ready:()=>tutP(1,'place')&&!!UI.tl['0,0']},
 {id:'turn',title:'Turn your tile',say:'This is your tile. Tap it to turn it. Glowing squares show where it fits.',target:()=>document.querySelector('#htile'),
   onEnter:()=>{const R=UI.rots,i=R.indexOf(0);if(i>=0)tutRot(R[(i-1+R.length)%R.length])},
   wait:{type:'tap',match:a=>a.what==='rotate'},ready:()=>tutP(1,'place')&&!!document.querySelector('#htile')},
 {id:'place1',title:'Match the edges',say:'Road meets road: edges must match. Tap the glowing square to lay your tile.',target:tutGlow(1),wait:placeW(1),ready:()=>tutP(1,'place')&&tutRot(0)},
 {id:'fig_road',title:'Claim the road',say:'Tap the glowing circle to put a follower on the road. You start with seven.',target:tutFig(1),wait:figW(1),ready:()=>tutP(1,'fig')},
 {id:'computer',title:'The computer plays',say:'It lays a tile and may claim. A road, town or field with a follower is taken.',target:()=>UI.tl['1,1'],also:tutMp(1),wait:null,ready:()=>tutP(3,'place')&&!!tutMp(1)()},
 {id:'place2',title:'End the road',say:'This tile closes your road on the left. Tap the glowing square.',target:tutGlow(3),wait:placeW(3),ready:()=>tutP(3,'place')&&tutRot(3)},
 {id:'fig_priory',title:'Claim the priory',say:'A priory scores 9 when eight tiles surround it. Tap the circle to claim it.',target:tutFig(3),wait:figW(3),ready:()=>tutP(3,'fig')},
 {id:'road_done',title:'Road finished',say:'A finished road scores 1 point per tile: 4 for you. Your follower comes home.',target:tutCellsFn(['0,0','1,0','1,1','-1,0']),wait:null,
   onEnter:hold,onNext:release,hold:true,ready:()=>tutAfter(4,4)},
 {id:'place3',title:'Make a town',say:'Town meets town. This edge closes the town above. Tap the glowing square.',target:tutGlow(5),wait:placeW(5),ready:()=>tutP(5,'place')&&tutRot(2)},
 {id:'fig_town',title:'Claim the town',say:'Claim it before it closes. A finished town scores 2 per tile.',target:tutFig(5),wait:figW(5),ready:()=>tutP(5,'fig')},
 {id:'town_done',title:'Town finished',say:'Two tiles at 2 points each: 4 more. The follower is back.',target:tutCellsFn(['0,0','0,-1']),wait:null,
   onEnter:hold,onNext:release,hold:true,ready:()=>tutAfter(6,8)},
 {id:'place4',title:'Fill the ring',say:'A priory needs all eight neighbours. This is the fourth. Tap the glowing square.',target:tutGlow(7),wait:placeW(7),ready:()=>tutP(7,'place')&&tutRot(0)},
 {id:'fig_farmer',title:'Send a farmer',say:'A follower in a field is a farmer. At game end it scores 3 per finished town beside it.',target:tutFig(7),wait:figW(7),ready:()=>tutP(7,'fig')},
 {id:'place5',title:'Keep building',say:'Six of eight neighbours are down. No follower needed here.',target:tutGlow(9),wait:placeW(9),ready:()=>tutP(9,'place')&&tutRot(1)},
 {id:'place6',title:'The last tile',say:'This completes the ring around your priory. Tap the glowing square.',target:tutGlow(11),wait:placeW(11),ready:()=>tutP(11,'place')&&tutRot(3)},
 {id:'skip',title:'Or skip',say:'Nothing to claim here. Tap Skip to end your turn.',target:()=>document.querySelector('#hskip'),wait:{type:'tap',match:a=>a.what==='skip'},ready:()=>tutP(11,'fig')},
 {id:'priory_done',title:'Priory scored',say:'Eight tiles around it: 9 points! Your follower comes home.',target:tutCellsFn(RING),wait:null,onEnter:()=>{UI.user=false;refit(true)},ready:()=>!!G&&G.over&&P(0).sc.priory===9},
 {id:'final',title:'Final scoring',say:'Valley full! Your farmer scores 3 for the finished town. Unfinished roads and towns score 1 per tile.',target:tutCellsFn(['-2,-1']),also:tutCellsFn(['0,-1']),wait:null,
   onEnter:()=>tutFinalPops(),ready:()=>!!G&&G.over},
 {id:'winner',title:'Most points wins',say:()=>'You win '+P(0).score+' to '+P(1).score+'! Real games have more tiles, and more rivals if you like.',target:()=>document.querySelector('#seats'),wait:null,ready:()=>!!G&&G.over}
  ]}
// ---------------------------------------------------------------- start, leave
function tutSetup(){try{GXC.close()}catch(e){}closeMenu();UI.camp=null;UI.tut=true;UI.tutHold=false;UI.tutAuto=0;
  beginGame({np:2,seats:['human','ai'],lv:['normal','normal'],ex:{},seed:7,stack:TUT_TURNS.map(t=>t[0])})}
// leave the staged game: nothing of it was saved, and the board goes quiet behind the menu
function tutLeave(){UI.tut=false;UI.tutHold=false;UI.tutAuto=0;UI.aiT&&clearTimeout(UI.aiT);UI.aiT=0;UI.endShown=false;G=null;UI.lastOpts=null;
  try{resetUI()}catch(e){}for(const e of document.querySelectorAll('#world .glow'))e.remove();try{GXH.hide()}catch(e){}UI.lastOpts=setupOpts();const g=$('#ghost');if(g)g.remove()}
function tutStart(o){if(typeof GXT==='undefined')return;const pro=!!(o&&o.prologue),first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  GXT.start({game:TUT_GAME,steps:tutSteps(),story:!!(window.CAMPAIGN&&typeof GXC!=='undefined'),setup:tutSetup,
    endTitle:'You know the rules',
    endText:pro?'Tiles, followers, roads, towns, priories, farmers. Now the story begins.':'Tiles, followers, roads, towns, priories, farmers. The lightbulb explains River, Taverns and Merchants.',
    endButtons:pro&&first?[{id:'chapter',label:'Start chapter 1'}]:null,
    onDone:r=>{const c=r&&r.choice;tutLeave();
      if(c==='chapter'&&first)GXC.play(first.id);else if(c==='story')campOpen();else showStart()},
    onExit:()=>{tutLeave();showStart()}})}
// Story starts with the tutorial (Chapter 0) until it has been finished once
function storyOpen(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;
  if(typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else GXC.open()}
// first-time players who tap Play are offered the tutorial once
function tutOffer(){return !UI.offered&&tutFirst()}
function showOffer(){UI.offered=true;
  $('#modal').innerHTML=`<div class="scrim"><div class="card" role="dialog" aria-label="New here"><h2>New here?</h2><p class="sub">Learn the rules in 5 minutes, one tap at a time.</p><button class="btn big" data-a="learn">Learn in 5 minutes</button><button class="btn alt" data-a="go">Play now</button></div></div>`;
  const m=$('#modal');m.querySelector('[data-a=learn]').onclick=()=>tutStart();m.querySelector('[data-a=go]').onclick=()=>beginGame()}
