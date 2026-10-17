// ===================== tutor.js: the staged tutorial (shell/gx-tutor.js): a fixed little job that teaches every rule by doing it once =====================
// RULES CHECKLIST (read from the rules drawer RULES_HTML, the glossary, hlp.js rules cards and rules-test.js), and the step that teaches each one:
//   goal: cut every wire on every stand, together, before the fuse runs out ........ goal, win
//   your stand is face up to you, sorted low to high; the crew's wires are hidden ... mine, crew
//   the fuse: a miss burns a step, none left = boom; a red wire = boom ............... fuse, red
//   opening info token on one of your own wires; tokens are clues for everyone ....... token, tokens2
//   one action per turn, foreman first, then clockwise; teammates play the same ...... hit, crew1, crew2
//   dual cut: point at a crewmate's wire + name a number YOU hold; a hit cuts both .. point, name, hit
//   a miss: the fuse burns, a token shows the wire's true number, your wire stays hidden wrong1, wrong2, wrongres
//   using sort order and tokens as clues (teammates use the token the miss revealed) . crew2
//   validation token on the track when all four of a number are cut ................. crew2
//   solo cut: you hold every wire left of a number (all four, or the last two) ...... solo (and Plum does one in crew1)
//   equipment unlocks when two of its number are cut, then works once ................ hit (unlock), gear (use)
//   personal tool: the Twin Probe, once per job ....................................... probe
//   yellow wires: a yellow matches only a yellow, you must hold one to say "yellow" .. yellow1, yellow2
//   red wires: never point at one; a hand of only reds is revealed for you ............ red, win
// The staged job (never saved): three players (you = Amber, the foreman, then Teal, then Plum), 15 wires: blue 1-3 (four each), yellows 1.1 and 2.1, red 2.5.
//   You   : Y 2 2 2 R 3        Teal: 1 1 2 3        Plum: 1 1 Y 3 3      fuse 3 steps, one gear card (Rewind, unlocked by two 2s)
//   T1 you hit Teal's token-2 · T2 Teal hits your token-3 · T3 Plum solo-cuts his 3s · T4 you miss on Plum's 2nd wire (token 1) · T5 Teal uses that token ·
//   T6 Plum hits Teal's last 1 · T7 you use Rewind and cut the last yellow · T8 you solo your 2s, your red is revealed for you, defused.
// The computer never moves by itself in here: the steps that say "the crew plays" run its scripted moves (tutMove) and wait for them.
const TUT_GAME='short-fuse';
const TUT={eqv:null,mission:false};
const tutOn=()=>typeof GXT!=='undefined'&&GXT.active()&&!!UI.tut;
const tutBtn=cls=>typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:firstTime(),cls:cls,launch:tutStart});
function firstTime(){return !lsGet('sf_played',0)}
const tq=sel=>()=>{const e=document.querySelector(sel);return e&&e.getBoundingClientRect().width?e:null};
// ---------------------------------------------------------------- the fixed layout (wire ids: blue v = (v-1)*4+j, red v.5 = 48+v-1, yellow v.1 = 59+v-1)
const TUT_STANDS=[[59,4,5,6,49,8],[0,1,7,9],[2,3,60,10,11]];
const tutIdx=(si,id)=>G.st[si].w.findIndex(x=>x.id===id);
const tutEl=(si,id)=>()=>{if(!G)return null;const k=tutIdx(si,id);const sl=k>=0&&G.st[si].w[k];const e=sl&&tileEl(sl.u);return e&&e.getBoundingClientRect().width?e:null};
const myTwoK=()=>G.st[0].w.findIndex(x=>!x.cut&&cv(x.id)===2);
const tutMyTurn=()=>!!G&&!G.over&&G.phase==='turn'&&G.actor===0&&G.step==='act'&&!G.q&&!!(UI.V&&UI.V.legal);
const tutSelTo=(si,id)=>!!UI.sel&&UI.sel.mode==='dual'&&UI.sel.tg.length===1&&UI.sel.tg[0].st===si&&UI.sel.tg[0].k===tutIdx(si,id);
function tutRebuild(){const M=MISSIONS[67];
  G.q=null;G.ag=[];G.agI=0;G.log=[];G.logN=0;G.uid=0;G.captain=0;G.pos=[0,1,2];G.phase='setup';G.step=null;G.turn=0;G.round=0;G.hist=[];G.ann=[];G.marks=[];G.valid=[];G.fin={};G.over=null;G.winText='';G.tfx={};
  G.st=TUT_STANDS.map((ids,i)=>({i,pos:i,w:ids.slice().sort((a,b)=>sv(a)-sv(b)||a-b).map(newSlot),side:[]}));
  G.tot={1:4,2:4,3:4,Y:2};G.tokSup=clone(INFO_TOKENS);G.gone=[];G.box=[];G.aside=[];G.pile=[];G.markers={red:[2.5],redQ:0,redN:1,yel:[1.1,2.1],yelQ:0,yelN:2};
  G.eq=[{id:'eq6',st:'locked',down:0,cover:null,perm:0}];G.eqPool=[];G.eqDeck=[];G.eqOut=[];G.dial=3;G.stats={dual:0,dualOk:0,solo:0,miss:0,eqUse:0,turns:0};G.idle=0;
  lg('Training run: you, Teal and Plum. You are the foreman.','big');
  infoSetup(M);later('beginPlay');flow()}
function tutNew(){
  if(!MISSIONS[67]){MISSIONS[67]=Object.assign({},MISSIONS[1],{n:67,nm:'Training run',text:'A tiny practice bomb: 15 wires, three crew, one gear card.',pl:[3],blue:3,red:null,yel:null,eq:{n:0},rules:[],info:'std',tok:'num',audio:false,timer:null});BRIEFS[67]='A tiny practice bomb. Learn every rule here.';TUT.mission=true}
  if(TUT.eqv==null){TUT.eqv=EQUIP.eq6.v;EQUIP.eq6.v=2}
  UI.tut=true;UI.tutTok=(UI.tutTok||0)+1;
  try{GX.close()}catch(e){}hideStart();try{GXH.hide()}catch(e){}
  kitReset();clearTimeout(UI.aiT);UI.aiT=null;UI.rt=false;UI.started=false;UI.sel=null;UI.prev=null;UI.holder=-1;UI.offSeat=null;UI.campDone=0;UI.campShown=0;UI.wwk=null;UI.pause=false;UI.camp=null;UI.brief=null;UI.aiNotBefore=0;UI.lastPrompt=null;UI.ghost={info:0,turn:0};
  UI.started=true;
  newGame({np:3,mission:67,seats:['human','ai','ai'],level:'easy',names:DEFNAMES.slice(0,3),realtime:false,captain:0,seed:7});
  tutRebuild();UI.holder=0;UI.prev=snap();refresh()}
// leave the staged game: nothing of it is saved, and the board goes quiet behind the menu
function tutLeave(){UI.tut=false;UI.tutTok=(UI.tutTok||0)+1;clearTimeout(UI.aiT);UI.aiT=null;UI.started=false;UI.sel=null;UI.V=null;
  if(TUT.eqv!=null){EQUIP.eq6.v=TUT.eqv;TUT.eqv=null}
  if(TUT.mission){delete MISSIONS[67];delete BRIEFS[67];TUT.mission=false}
  G=null;try{GXH.hide()}catch(e){}
  for(const id of ['ghost']){const e=document.getElementById(id);if(e)e.remove()}
  for(const id of ['over','cover']){const e=document.getElementById(id);if(e){e.hidden=true;e._s=''}}
  for(const id of ['crew','mine','gear','tray','fuse','track','cutc','clk']){const e=document.getElementById(id);if(e){e._s=null;e.innerHTML=''}}}
// ---------------------------------------------------------------- the scripted crew
const tutWait=ms=>new Promise(r=>setTimeout(r,ms/Math.max(1,UI.speed||1)));
function tutMove(seat){
  if(G.q&&G.q.who===seat){if(G.q.kind!=='infoStd')return {a:'q',i:0};
    const want=seat===1?7:10;                                  // Teal shows her 2, Plum shows a 3
    const i=G.q.opts.findIndex(o=>{const f=findU(o.d.u);return f&&G.st[f.s].w[f.k].id===want});return {a:'q',i:Math.max(0,i)}}
  const T=G.turn;
  if(seat===1&&T===2)return {a:'dual',st:0,ks:[tutIdx(0,8)],v:3};                    // Teal uses your token: your 3
  if(seat===2&&T===3)return {a:'solo',v:3};                                           // Plum holds both 3s left
  if(seat===1&&T===5)return {a:'dual',st:2,ks:[tutIdx(2,3)],v:1};                     // Teal uses the token your miss put on Plum's wire
  if(seat===2&&T===6)return {a:'dual',st:1,ks:[tutIdx(1,1)],v:1};                     // Plum finishes the 1s
  return null}
const tutAlive=tok=>!!G&&UI.tut&&UI.tutTok===tok;
async function tutAct(seat,tok){const m=tutMove(seat);if(!m||!tutAlive(tok))return false;
  if(m.a==='dual'){try{announce(m,seat)}catch(e){}await tutWait(700)}else await tutWait(400);
  if(!tutAlive(tok))return false;
  const err=legal(m,seat);if(err){console.warn('tutor move rejected: '+err+' '+JSON.stringify(m));return false}
  applyMove(m,seat);await tutWait(1000);return true}
// the crew plays until it is the human's turn again
async function tutCrew(){const tok=UI.tutTok;for(let n=0;n<8&&tutAlive(tok)&&!G.over;n++){const s=sideToAct();if(s<0||isHuman(s))break;if(!await tutAct(s,tok))break}}
// ---------------------------------------------------------------- the steps
const tutCalm=()=>!document.querySelector('#tb .snap,#tb .buzz,#tb.shake,#fuse .burn,#fuse .phew');   // the cut / miss animation is over: the spotlight does not move
const hitTxt=()=>{const t=G.st[1].w[tutIdx(1,7)];return t&&t.cut};
function tutSteps(){return [
 {id:'goal',title:'The goal',say:()=>'Cut all '+G.st.reduce((a,s)=>a+s.w.length,0)+' wires before the fuse burns out. The whole crew wins or loses together.',target:tq('#cutc'),wait:null,ready:()=>!!G&&!!G.q},
 {id:'mine',title:'Your wires',say:'These wires are yours. Only you see the numbers. Every stand is sorted, lowest on the left.',target:tq('#mine'),wait:null},
 {id:'crew',title:'Their wires',say:'Teal and Plum hold the rest. You see only their backs, and they never see yours.',target:tq('#crew'),wait:null},
 {id:'fuse',title:'The fuse',say:'A wrong cut burns one step. When none is left, or a red wire is cut, the bomb explodes.',target:tq('#fuse'),wait:null},
 {id:'token',title:'Show a wire',say:'Everyone starts by showing one wire. Tap your 3: a token tells the crew its number.',target:tutEl(0,8),
   wait:{type:'tap',match:a=>a.what==='tile'&&a.own&&a.id===8},ready:()=>!!G&&!!G.q&&G.q.who===0&&G.q.kind==='infoStd'},
 {id:'tokens2',title:'Their tokens',say:'Teal and Plum each showed a wire too. Tokens are clues the whole crew can use.',target:tq('#crew'),wait:null,ai:tutCrew,ready:()=>!!G&&tutMyTurn()},
 {id:'point',title:'Point at a wire',say:'Your turn. Teal\'s token says 2. Tap that wire to point at it.',target:tutEl(1,7),
   wait:{type:'tap',match:a=>a.what==='tile'&&!a.own&&a.id===7},ready:()=>tutMyTurn()&&!UI.sel},
 {id:'name',title:'Name a number',say:'Now say a number you hold. Tap one of your 2s. If Teal has a 2, you both cut.',target:()=>{const k=myTwoK();return k>=0?tileEl(G.st[0].w[k].u):null},
   wait:{type:'tap',match:a=>a.what==='tile'&&a.own&&cv(a.id)===2&&a.k===myTwoK()},ready:()=>tutMyTurn()&&tutSelTo(1,7)},
 {id:'hit',title:'A hit!',say:'Match! Both 2s are cut and Rewind unlocked. One cut per turn, then it passes clockwise.',target:tq('#gear .eqk'),wait:null,ready:()=>hitTxt()&&!G.over&&tutCalm()},
 {id:'crew1',title:'Crew turns',say:'Teal used your token to cut your 3. Plum held every 3 left, so he cut them alone.',target:tq('#crew'),wait:null,ai:tutCrew,ready:()=>tutMyTurn()},
 {id:'wrong1',title:'A wrong guess',say:'Let\'s guess wrong on purpose. Plum\'s wires are hidden: tap his second wire.',target:tutEl(2,3),
   wait:{type:'tap',match:a=>a.what==='tile'&&!a.own&&a.id===3},ready:()=>tutMyTurn()&&!UI.sel},
 {id:'wrong2',title:'Name a number',say:'Say 2. It is really a 1, so this will miss.',target:()=>{const k=myTwoK();return k>=0?tileEl(G.st[0].w[k].u):null},
   wait:{type:'tap',match:a=>a.what==='tile'&&a.own&&cv(a.id)===2&&a.k===myTwoK()},ready:()=>tutMyTurn()&&tutSelTo(2,3)},
 {id:'wrongres',title:'A miss',say:()=>{const t=G.st[2].w[tutIdx(2,3)].tok[0];return 'Wrong! The fuse burned one step, and a token shows the true number: a '+(t?t.v:1)+'.'},
   target:tutEl(2,3),also:tq('#fuse'),wait:null,ready:()=>!!G&&G.dial===2&&G.st[2].w[tutIdx(2,3)].tok.length>0&&tutCalm()},
 {id:'crew2',title:'Using clues',say:'Teal used that token to cut a 1. Plum cut the last 1. Fully cut numbers get a green check.',target:tq('#track'),wait:null,ai:tutCrew,ready:()=>tutMyTurn()},
 {id:'probe',title:'Your Twin Probe',say:'Once per job, point at two wires and name one number. It hits if either wire matches.',target:tq('#mine .chip'),wait:null,ready:()=>tutMyTurn()&&!!document.querySelector('#mine .chip')},
 {id:'gear',title:'Use equipment',say:'Rewind is unlocked. Tap it to turn the fuse back one step. Gear works once.',target:tq('#gear .eqk.glow'),
   wait:{type:'tap',match:a=>a.what==='eq'&&a.id==='eq6'},ready:()=>tutMyTurn()&&!!document.querySelector('#gear .eqk.glow')},
 {id:'yellow1',title:'Yellow wires',say:'Every yellow is just "yellow". You hold one. Plum\'s last wire must be the other: tap it.',target:tutEl(2,60),
   wait:{type:'tap',match:a=>a.what==='tile'&&!a.own&&a.id===60},ready:()=>tutMyTurn()&&!UI.sel&&G.dial===3},
 {id:'yellow2',title:'Say yellow',say:'Name your yellow wire. A yellow can only be matched with another yellow.',target:tutEl(0,59),
   wait:{type:'tap',match:a=>a.what==='tile'&&a.own&&a.id===59},ready:()=>tutMyTurn()&&tutSelTo(2,60)},
 {id:'red',title:'Red wires',say:'Never point at red: the bomb explodes. If red is all you have left, it reveals itself.',target:tutEl(0,49),wait:null,ready:()=>tutMyTurn()&&!!G.st[2].w[tutIdx(2,60)].cut},
 {id:'solo',title:'Solo cut',say:'You hold every 2 left, so cut them alone. Tap one: both are cut, with no risk.',target:()=>{const k=myTwoK();return k>=0?tileEl(G.st[0].w[k].u):null},
   wait:{type:'tap',match:a=>a.what==='tile'&&a.own&&cv(a.id)===2&&a.k===myTwoK()},ready:()=>tutMyTurn()},
 {id:'win',title:'Defused!',say:'Every wire is cut: defused! Your last red was revealed for you. Win together, or lose together.',target:tq('#cutc'),wait:null,ready:()=>!!G&&!!G.over&&G.over.win}
]}
// ---------------------------------------------------------------- the kit hooks
function storyOpen(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;
  if(typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else GXC.open()}
function tutStart(o){if(typeof GXT==='undefined')return;const pro=!!(o&&o.prologue);o=pro?o:null;const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  try{const d=document.getElementById('offer');if(d)d.remove()}catch(e){}
  GXT.start({game:TUT_GAME,steps:tutSteps(),story:!!(window.CAMPAIGN&&typeof GXC!=='undefined'),
    endTitle:'You know the rules',endText:o?'Point, name, tokens, the fuse, gear, yellow, red. Now the Story begins.':'Point, name, tokens, the fuse, gear, yellow, red. Real jobs add twists: the lightbulb explains them.',
    endButtons:o&&first?[{id:'chapter',label:'Start chapter 1'}]:null,
    setup:tutNew,
    onDone:r=>{tutLeave();const c=r&&r.choice;
      if(c==='chapter'&&first){showStart();GXC.play(first.id)}
      else if(c==='story'&&typeof GXC!=='undefined'){showStart();GXC.open()}
      else showStart()},
    onExit:()=>{tutLeave();showStart();if(pro&&typeof GXC!=='undefined')GXC.open()}})}   // skipping the Story prologue opens the chapter map
// the first time a player taps Play, offer the tutorial once
function tutOffer(){if(typeof GXT==='undefined'||!firstTime()||GXT.isDone(TUT_GAME)||lsGet('sf_offered',0)||GXT.status(TUT_GAME).open)return false;
  lsSet('sf_offered',1);const d=document.createElement('div');d.id='offer';d.className='gxt-end';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','New here?');
  d.innerHTML='<div class="gxt-endc"><div class="gxt-et">New here?</div><div class="gxt-ex">Learn every rule in about 5 minutes, one tap at a time.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-a="offeryes">Learn in 5 minutes</button><button type="button" class="gxt-b" data-a="offerno">Just play</button></div></div>';
  document.body.appendChild(d);return true}
// ---------------------------------------------------------------- the game tells the kit what the player does (before it is applied)
(function(){const o=tapTile;tapTile=function(si,k){
  if(tutOn()){const V=UI.V;const own=!!V&&V.seat>=0&&ownerOf(si)===V.seat;const sl=G.st[si]&&G.st[si].w[k];
    if(!sl||!GXT.act({type:'tap',what:'tile',si,k,own,id:sl.id}))return}
  return o(si,k)}})();
(function(){const o=eqTap;eqTap=function(id){if(tutOn()&&!GXT.act({type:'tap',what:'eq',id}))return;return o(id)}})();
(function(){const o=chipTap;chipTap=function(n){if(tutOn()&&!GXT.act({type:'tap',what:'chip',n}))return;return o(n)}})();
(function(){const o=plateTap;plateTap=function(s){if(tutOn()&&!GXT.act({type:'tap',what:'plate',s}))return;return o(s)}})();
// the computer never moves by itself in the staged job, nothing is saved, no result is recorded, and the win/lose card is the kit's end card
(function(){const o=schedule;schedule=function(){if(UI.tut)return;return o()}})();
(function(){const o=saveNow;saveNow=function(){if(UI.tut)return;return o()}})();
(function(){const o=recordResult;recordResult=function(){if(UI.tut)return;return o()}})();
(function(){const o=renderOverlays;renderOverlays=function(V){o(V);if(UI.tut){const ov=document.getElementById('over');if(ov)ov.hidden=true}}})();
// while the crew waits for its scripted move the status line says whose turn it is (the real "is thinking" would be a lie)
(function(){const o=sayText;sayText=function(V){const t=o(V);if(UI.tut&&G&&!G.over&&/ is thinking$| is choosing$/.test(t)){const s=decider();if(s>=0)return nm(s)+"'s turn"}return t}})();
