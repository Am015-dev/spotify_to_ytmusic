// ===================== part 10: the tutorial = a GUIDED FIRST GAME ("The Lantern Race") =====================
// A fixed short game against Cobalt (src/tutscript.js: fixed seed, piles, dice and Cobalt's moves), run through the shared tutor kit (gx-tutor.js).
// Every step = ONE sentence of 12 words or fewer + ONE highlighted thing to tap. Only the highlight takes input. Every base rule appears in order,
// on the board, when it happens; nothing is left for "later". After the last step: "Play a real game" (or chapter 1 when opened from Story).
// The step list is TUT_STEPS (ids = TUT_RULES, checked by tutor-test.js). Cobalt only moves while no step is shown (TUTG.freeze holds him and the answer timer).
const TUT_GAME='tidewake';
const OSK={on:false,cur:null};function oskPlace(){}            // the old coached game's bubble (ui7.js still asks for it)
const TUTG={on:false,tap:null,hold:false,prologue:false,tmr:0,seen:[]};
window.TW_TUT=TUTG;                                                 // tests read .seen (step ids shown, in order)
function tutOn(){return !!UI.tut&&TUTG.on}
function firstTime(){try{return !localStorage.getItem('tw_played')&&!localStorage.getItem('tw_offered')}catch(e){return true}}
function tutBtn(cls){return typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:firstTime(),cls:cls,launch:tutStart})}
function tutHold(k){return k==='mph'&&TUTG.on&&TUTG.hold}
// ---------------------------------------------------------------- what the steps point at
function tvis(sel){let off=null;for(const e of document.querySelectorAll(sel)){if(e.closest('[hidden]'))continue;const r=e.getBoundingClientRect();if(r.width>2&&r.height>2){if(r.bottom>0&&r.top<innerHeight)return e;off=off||e}}
  // a control scrolled out of the phone's bottom panel: bring it back into view
  if(off){try{off.scrollIntoView({block:'nearest'})}catch(x){}const r=off.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)return off}return null}
function tcell(x,y){const a=hproj(x-3,y-3),b=hproj(x-2,y-2);if(!a||!b)return null;const l=Math.min(a.x,b.x),t=Math.min(a.y,b.y);return {left:l,top:t,width:Math.abs(b.x-a.x),height:Math.abs(b.y-a.y)}}
function tmon(id){const m=G&&monById(id);return m?tcell(m.x,m.y):null}
function tship(i){const s=G&&G.ships[i];return s&&s.x!=null?tcell(s.x,s.y):null}
function ttile(i){return tvis(`[data-a=card][data-t="${i}"],[data-ph=pcard][data-t="${i}"]`)}
function trot(){return tvis('[data-a=rot][data-d="1"]')}
function tplace(){return tvis('[data-a=place]:not([disabled])')}
function tmph(){const m=tvis('#pc .mph,#res .mph');const w=m&&m.closest('#pc .pc-in');return w&&w.querySelector('[data-ph=dismiss]')?w:m}   // on a phone the card AND its Continue: either tap counts
function tqbtn(h){if(!G||!G.q)return null;const i=G.q.opts.findIndex(o=>o.h===h);return i<0?null:tvis(`[data-a=q][data-i="${i}"]`)||[...document.querySelectorAll('[data-a=q]')].filter(e=>!e.closest('[hidden]'))[i]||null}
function tcalm(){return !!G&&UI.started&&!UI.busy}
function tmine(turn){return tcalm()&&G.turn===turn&&G.cur===TS.me&&G.step==='act'&&!G.q}
function tsel(t,r){UI.sel={t:t,r:r||0,s:0};render()}
// ---------------------------------------------------------------- the steps (say: 12 words or fewer; tap: tap the highlight to go on)
// run: Cobalt and the sea may move while this step waits; hold: keep the roll card up until it is tapped
const TUT_RULES=['goal','order','mark','reloc','roll','wake','levmove','six','hand','edge','turn','never','place','sail','calm','draw','chain','push','keep','collide','wave','waveroll','blocked','cannon','offboard','min3','turn2','turn2b','place2','levsink','swap','win'];
function tutSteps(){const ph=!!PH.on;const S=[
  {id:'goal',say:'Last junk afloat wins. Tap the sea chart to begin.',target:()=>document.getElementById('board'),tap:1,ready:()=>!!G&&UI.started&&G.phase==='setup'},
  {id:'order',say:'Cobalt chose his start first. Every junk starts before any tile.',target:()=>tship(TS.co),tap:1,run:1,ready:()=>tcalm()&&G.ships[TS.co].x!=null&&sideToAct()===TS.me},
  ph?{id:'mark',say:'Tap this gold mark on the edge to start there.',target:()=>{const p=hproj(TS.myStart.x-2.5,TS.myStart.y-2.5+.5);return p?{x:p.x,y:p.y}:null},until:()=>PH.pop==='start'||G.ships[TS.me].x!=null,ready:()=>tcalm()&&sideToAct()===TS.me}:null,
  {id:ph?'mark2':'mark',say:'Tap this mark. Your junk starts here.',target:()=>tvis(`[data-a=startmark][data-x="${TS.myStart.x}"][data-y="${TS.myStart.y}"][data-e="${TS.myStart.e}"]`),until:()=>G.ships[TS.me].x!=null,ready:()=>tcalm()&&sideToAct()===TS.me},
  {id:'reloc',say:'A leviathan on your start square? Move to another free mark.',target:()=>tship(TS.me),tap:1,ready:()=>tcalm()&&G.ships[TS.me].x!=null},
  {id:'roll',say:'Every turn starts with a roll of two dice.',target:tmph,tap:1,run:1,hold:1,ready:()=>tcalm()&&G.turn===2&&!!tmph()},
  {id:'wake',say:'6, 7 or 8 wakes the leviathans. Any other total: calm.',target:tmph,tap:1,hold:1,ready:()=>!!tmph(),done:tmphHide},
  {id:'levmove',say:'Each leviathan rolled one die: one square, or a quarter turn.',target:()=>tmon(0),tap:1,ready:()=>tmine(2)},
  {id:'six',say:'A 6 on its die raises a new leviathan instead.',target:()=>tmon(5),tap:1,ready:()=>tmine(2)},
  {id:'hand',say:'These are your three tiles. This one would sink you.',target:()=>ttile(0),tap:1,ready:()=>tmine(2),enter:()=>tsel(0,0)},
  {id:'edge',say:'Its line runs to the chart edge. Off the edge, you sink.',target:()=>tcell(TS.myStart.x,TS.myStart.y),tap:1,ready:()=>tmine(2)},
  {id:'turn',say:'Tap Turn to spin the tile a quarter.',target:trot,until:()=>UI.sel&&UI.sel.t===0&&UI.sel.r===1,ready:()=>tmine(2)},
  {id:'never',say:'Also never into a loop, a leviathan or a rival\'s path.',target:()=>ttile(0),tap:1,ready:()=>tmine(2)&&UI.sel&&UI.sel.r===1},
  {id:'place',say:'Tap Place. The tile goes on the square at your bow.',target:tplace,until:()=>G.turn>2,ready:()=>tmine(2)&&UI.sel&&UI.sel.r===1},
  {id:'sail',say:'Your junk sailed along that line to its open end.',target:()=>tship(TS.me),tap:1,ready:()=>tcalm()&&G.turn===3&&G.ships[TS.me].y===4},
  {id:'calm',say:'Cobalt laid a tile. Now you rolled a 3: calm, nothing moved.',target:()=>tmon(7),tap:1,run:1,ready:()=>tmine(4)},
  {id:'draw',say:'After each turn you draw back up to three tiles.',target:()=>ttile(2),tap:1,ready:()=>tmine(4),enter:()=>tsel(0,0)},
  {id:'chain',say:'This tile meets Cobalt\'s tile. Tap Place: you sail through both.',target:tplace,until:()=>G.turn>4||(G.q&&G.q.kind==='cannonDraw'),ready:()=>tmine(4)&&UI.sel&&UI.sel.t===0&&UI.sel.r===0},
  {id:'push',say:'Lay a tile at any junk\'s line end, and it sails too.',target:()=>tship(TS.co),tap:1,ready:()=>tcalm()&&G.q&&G.q.kind==='cannonDraw'},
  {id:'keep',title:'Add-on: Deck Cannon',say:'You drew a Deck Cannon. Keep it for a leviathan.',target:()=>tqbtn('cKeep'),until:()=>!G.q,ready:()=>tcalm()&&G.q&&G.q.kind==='cannonDraw'},
  {id:'collide',say:'Two junks on one line, same way, both sink.',target:()=>tship(TS.co),tap:1,ready:()=>tcalm()&&G.turn===5&&G.cur===TS.co},
  {id:'wave',title:'Add-on: Rogue Wave',say:'A Rogue Wave! It sweeps its whole row each round.',target:()=>G.wave?tcell(G.wave.x,G.wave.y):null,tap:1,run:1,ready:()=>tmine(6)&&!!G.wave},
  {id:'waveroll',title:'Add-on: Rogue Wave',say:'In its row, roll its strength or capsize. Tap Place.',target:tplace,until:()=>G.turn>6,ready:()=>tmine(6),enter:()=>tsel(0,0)},
  {id:'blocked',say:'A leviathan swam in front of your bow. That sinks you!',target:()=>tmon(4),tap:1,run:1,ready:()=>tcalm()&&G.turn===8&&G.q&&G.q.kind==='doom'},
  {id:'cannon',title:'Add-on: Deck Cannon',say:'Tap Fire. Your Deck Cannon blasts it away.',target:()=>tqbtn('dCannon'),until:()=>!G.q&&!monById(4),ready:()=>tcalm()&&G.q&&G.q.kind==='doom'},
  {id:'offboard',say:'A leviathan pushed off the chart is gone for good.',target:()=>tmon(0),tap:1,ready:()=>tmine(8)},
  {id:'min3',say:'Fewer than three leviathans? The next turn adds new ones.',target:()=>tmon(7),tap:1,ready:()=>tmine(8)},
  {id:'turn2',say:'This tile needs two quarter turns. Tap Turn.',target:trot,until:()=>UI.sel&&UI.sel.r===1,ready:()=>tmine(8),enter:()=>tsel(0,0)},
  {id:'turn2b',say:'Tap Turn once more.',target:trot,until:()=>UI.sel&&UI.sel.r===2,ready:()=>tmine(8)&&UI.sel&&UI.sel.r===1},
  {id:'place2',say:'Tap Place.',target:tplace,until:()=>G.turn>8,ready:()=>tmine(8)&&UI.sel&&UI.sel.r===2},
  {id:'levsink',say:'A leviathan swam onto Cobalt\'s tile. He sinks with it!',target:()=>tvis('#pc [data-a=sunkok],#cards [data-a=sunkok]'),until:()=>!(UI.sunk&&UI.sunk.length),run:1,ready:()=>tcalm()&&!!G.over&&!!tvis('#pc [data-a=sunkok],#cards [data-a=sunkok]')},
  {id:'swap',say:'Sink rivals with your tile, and swap tiles with their hands.',target:()=>tship(TS.me)||document.getElementById('board'),tap:1,ready:()=>tcalm()&&!!G.over&&!(UI.sunk&&UI.sunk.length)},
  {id:'win',say:'Yours is the last junk afloat. You win the lantern!',target:()=>document.getElementById('board'),tap:1,ready:()=>tcalm()&&!!G.over}
 ].filter(Boolean);
 return S.map(s=>({id:s.id,say:s.say,title:s.title,target:s.target,ready:s.ready,pad:4,
   wait:{type:'event',match:()=>s.tap?TUTG.tap===s.id:!!(s.until&&s.until())},
   onEnter:()=>{TUTG.tap=null;TUTG.cur=s;TUTG.hold=!!s.hold;TUTG.freeze=!s.run;if(s.run)schedule();try{s.enter&&s.enter()}catch(e){console.error(e)}},
   onDone:()=>{TUTG.seen.push(s.id);TUTG.cur=null;TUTG.hold=false;try{s.done&&s.done()}catch(e){console.error(e)}TUTG.freeze=false;schedule();render()}}))}
// between steps the game's own Continue / Skip buttons stay live holes in the tutor layer (a visible button never eats taps)
function tutLive(){return [...document.querySelectorAll('#pc [data-ph=dismiss],[data-a=skip]')].filter(e=>!e.closest('[hidden]')&&e.offsetWidth>0)}
function tmphHide(){try{PH.mphHide=UI.mph;phAfter()}catch(e){}}
// a tap on the highlight of a "tap" step: swallowed (the game never sees it) and counted
function tutTapIn(e){const s=TUTG.on&&TUTG.cur;if(!s||!s.tap||typeof GXT==='undefined')return false;const st=GXT.state();if(!st.shown||st.id!==s.id)return false;
  let r=null;try{const t=s.target();r=t&&t.getBoundingClientRect?t.getBoundingClientRect():t&&t.left!=null?t:t&&t.x!=null?{left:t.x-22,top:t.y-22,width:44,height:44}:null}catch(x){}
  if(!r)return false;const p=e.changedTouches?e.changedTouches[0]:e;const x=p.clientX,y=p.clientY;return x>=r.left-4&&x<=r.left+r.width+4&&y>=r.top-4&&y<=r.top+r.height+4}
for(const ev of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click'])window.addEventListener(ev,e=>{if(!tutTapIn(e))return;e.stopPropagation();if(e.cancelable&&ev!=='touchstart')e.preventDefault();
  if(ev==='pointerup'||ev==='click'){const s=TUTG.cur;if(s&&TUTG.tap!==s.id){TUTG.tap=s.id;GXT.act({type:'event',k:'tap'})}}},true);
// the "until" steps finish when the game reaches their state (polled)
// while a step is on screen nothing else moves (Cobalt, the 25 s answer timer); a "run" step lets the game go on until its moment comes
setInterval(()=>{try{const s=TUTG.on&&TUTG.cur;if(!s||typeof GXT==='undefined')return;const sh=GXT.state().shown;
  {const want=sh?TUTG.base:Math.max(TUTG.base||1,2);if(want&&UI.speed!==want){UI.speed=want;try{TWKit.setSpeed(want)}catch(x){}}}
  if(sh&&!TUTG.freeze){TUTG.freeze=true}else if(!sh&&s.run&&TUTG.freeze){TUTG.freeze=false;schedule()}
  if(TUTG.freeze&&UI.qKey)UI.qT0=Date.now()
  if(sh&&!s.tap&&s.until&&s.until())GXT.act({type:'event',k:'poll'})}catch(e){}},150);
// ---------------------------------------------------------------- start / leave
function tutStart(o){if(NET.on||typeof GXT==='undefined')return;const pro=!!(o&&o.prologue);TUTG.prologue=pro;TUTG.seen=[];
  try{GX.close()}catch(e){}try{localStorage.setItem('tw_offered','1')}catch(e){}
  tutBegin();
  const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  GXT.start({game:TUT_GAME,story:false,steps:tutSteps(),live:tutLive,
    endTitle:'You know the rules',endText:'Now a real game against a computer. Add-ons (Rogue Wave, Deck Cannon) are off; switch them on in Setup.',
    endButtons:pro&&first?[{id:'chapter',label:'Start chapter 1'},{id:'menu',label:'Menu'}]:[{id:'play',label:'Play a real game'},{id:'menu',label:'Menu'}],
    onDone:r=>{const c=r&&r.choice;tutLeave();try{GXT.markDone(TUT_GAME)}catch(e){}
      if(c==='chapter'&&first){showStart();GXC.play(first.id)}else if(c==='play'){const s=defaultSetup();s.mode='me';s.np=2;s.variant=null;s.noMon=false;s.exp={rift:0,wave:0,maelstrom:0,cannon:0};s.seats[0].h=true;s.seats[1].h=false;startGame(s)}else showStart()},
    onExit:()=>{tutLeave();showStart()}})}
function tutBegin(){const s=defaultSetup();s.mode='me';s.np=2;s.variant=null;s.noMon=false;s.exp={rift:0,wave:1,maelstrom:0,cannon:1};
  s.seats[0]={h:true,lv:'normal',col:0};s.seats[1]={h:false,lv:'easy',col:3};
  TUTG.base=UI.speed||1;TS.on=true;TUT=tutDice;UI.tut=1;TUTG.on=true;TUTG.starting=1;try{setSeed(TS.seed);setAiSeed(3)}catch(e){}
  try{startGame(s,{tutorial:true,first:TS.co,seed:TS.seed,names:['Vermilion','Cobalt']})}finally{TUTG.starting=0}
  TUTG.freeze=true;UI.guide='light';UI.confirm=null;try{GXH.hide()}catch(e){}render()}
function tutLeave(){if(TUTG.base){UI.speed=TUTG.base;try{TWKit.setSpeed(UI.speed)}catch(x){}TUTG.base=0}TUTG.on=false;TUTG.cur=null;TUTG.hold=false;TS.on=false;TUT=null;UI.tut=0;TUTG.freeze=false;clearTimeout(UI.tm);UI.gen++;UI.started=false;UI.busy=false;UI.sel=null;UI.sunk=[];UI.mph=null;
  try{GXH.hide()}catch(e){}try{kitReset()}catch(e){}try{PH.pop=null;PH.pd=null;PH.cur=null;phAfter()}catch(e){}}
// Story is preceded by the guided game (the prologue) until it has been finished once
function storyOpen(){if(typeof GXC==='undefined')return;if(typeof GXT!=='undefined'&&!NET.on&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else campOpen()}
// a first-time player tapping Play is offered the guided game once
function tutOffer(go){if(typeof GXT==='undefined'||NET.on||!firstTime()||GXT.status(TUT_GAME).seen)return false;
  try{localStorage.setItem('tw_offered','1')}catch(e){}
  const d=document.createElement('div');d.className='gxt-end';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','New here?');
  d.innerHTML='<div class="gxt-endc"><div class="gxt-et">New here?</div><div class="gxt-ex">Learn by playing one short game, one tap at a time.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-tutoffer="learn">Learn to play</button><button type="button" class="gxt-b" data-tutoffer="play">Just play</button></div></div>';
  document.body.appendChild(d);
  d.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tutoffer]');if(!b)return;e.stopPropagation();d.remove();if(b.dataset.tutoffer==='learn')tutStart();else go()});
  return true}
// the freeze: Cobalt waits while a step is on screen
{const _sc=schedule;schedule=function(){if(TUTG.on&&TUTG.freeze){clearTimeout(UI.tm);return}return _sc.apply(this,arguments)}
 const _aa=aiAct;aiAct=function(){if(TUTG.on&&TUTG.freeze)return;return _aa.apply(this,arguments)}}
// leaving the guided game any other way (Menu > New game, Story, the title) switches it off
{const _sg=startGame;startGame=function(s,o){if(TUTG.on&&!TUTG.starting){try{GXT.stop()}catch(e){}tutLeave()}return _sg.apply(this,arguments)}
 const _ss=showStart;showStart=function(){if(TUTG.on){try{GXT.stop()}catch(e){}tutLeave()}return _ss.apply(this,arguments)}}
