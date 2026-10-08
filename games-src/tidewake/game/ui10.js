// ===================== part 10: the tutorial (shell/gx-tutor.js): a staged game that teaches every rule by doing it once =====================
// The staged game is src/tutscript.js: you (Vermilion) against Cobalt, fixed seed, fixed leviathans, hands, pile, dice and a scripted computer; never saved.
// Each step spotlights one thing; only that thing answers; the step moves on only when the page reports that exact action (GXT.act). The rule checklist
// (what each step teaches) is at the top of src/tutscript.js. Story opens through it as "Chapter 0" the first time; the menu replays it any time.
const TUT_GAME='tidewake';
const TUTP={pause:false};                                         // true = the computer waits (a step wants you to read what just happened)
function tutOn(){return typeof GXT!=='undefined'&&GXT.active()&&!!UI.tut}
function firstTime(){try{return !localStorage.getItem('tw_played')&&!localStorage.getItem('tw_offered')}catch(e){return true}}
function tutBtn(cls){return typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:firstTime(),cls:cls,launch:tutStart})}
// ---------------------------------------------------------------- where each step points
const tq=sel=>()=>{const e=document.querySelector(sel);return e&&!e.closest('[hidden]')&&e.getBoundingClientRect().width?e:null};
const tfirst=(...sels)=>()=>{for(const s of sels){const e=document.querySelector(s);if(e&&!e.closest('[hidden]')&&e.getBoundingClientRect().width)return e}return null};
// pieces on the board (a junk, the wave): the phone layout hides their name tags, so spotlight the square where they are, projected onto the screen
function tutProj(w,sz){try{const p=hproj(w[0],w[1],.3);return p?{left:p.x-sz/2,top:p.y-sz/2,width:sz,height:sz}:null}catch(e){return null}}
const tutShipRect=i=>()=>{try{const sp=shipPos(G.ships[i]);if(!sp)return null;return tutProj(sp.port!=null?pw(sp.c,sp.r,sp.port):sqW(sp.c,sp.r),56)}catch(e){return null}};
const tutWaveRect=()=>{try{return G.wave?tutProj(sqW(G.wave.x,G.wave.y),64):null}catch(e){return null}};
// the gold mark you start from: where the game itself draws it (the same projection as the board's pips)
function tutPipRect(){try{const d=sideToAct();const t=TS.myStart;const o=startInfo(d).find(q=>q.m.x===t.x&&q.m.y===t.y&&q.m.e===t.e);if(!o)return null;const p=hproj(o.w[0],o.w[1]);
  return p?{left:p.x-24,top:p.y-24,width:48,height:48}:null}catch(e){return null}}
const TQ={tile:t=>tfirst('#ppop .ph-t[data-t="'+t+'"]','#ps .pt[data-t="'+t+'"]','#pin .hc[data-t="'+t+'"]'),
  turn:tfirst('#ppop [data-a=rot][data-d="1"]','#ps [data-a=rot][data-d="1"]','#pin [data-a=rot][data-d="1"]'),
  place:tfirst('#ppop [data-a=place]:not([disabled])','#ps [data-a=place]:not([disabled])','#pin [data-a=place]:not([disabled])'),
  q:i=>tfirst('#pc [data-a=q][data-i="'+i+'"]','#main [data-a=q][data-i="'+i+'"]'),
  mph:tfirst('#pc .mph','#res .mph')};
const layReady=()=>{try{return hlpPhase()==='lay'&&!UI.busy}catch(e){return false}};
// keep a given tile turned a given way selected (the lay screen otherwise starts on the safest tile)
function tutSel(t,r){if(!UI.sel||UI.sel.t!==t||UI.sel.r!==r||UI.sel.s!==0){UI.sel={t,r,s:0};UI.rots=[];UI.rots[t]=r;render()}return !!UI.sel&&UI.sel.t===t&&UI.sel.r===r}
const placeOn=()=>!!TQ.place();
const doomOpt=h=>{try{return G.q.opts.findIndex(o=>o.h===h)}catch(e){return -1}};
const waveLine=()=>{try{const l=G.log.map(x=>x.t).find(t=>/Rogue Wave \(rolled \d, needed \d\)/.test(t));const m=l&&l.match(/rolled (\d), needed (\d)/);return m?{r:m[1],n:m[2]}:null}catch(e){return null}};
const dismissMph=()=>{PH.mphHide=UI.mph;try{phAfter();phStrip()}catch(e){}};
function tutSteps(){return [
 {id:'goal',title:'Last junk afloat',say:'Steer your junk with current tiles. Stay afloat longer than every rival. Leviathans and the chart\'s edge sink you.',target:tq('#board'),wait:null,
   ready:()=>!!G&&UI.started&&G.phase==='setup'&&sideToAct()===0&&!UI.busy},
 {id:'mark',title:'Pick a start mark',say:'Tap the glowing gold mark at the bottom. Your junk starts there.',target:tutPipRect,
   wait:{type:'tap',match:a=>a.what==='sq'&&a.x===TS.myStart.x&&a.y===TS.myStart.y},ready:()=>G.phase==='setup'&&!PH.pop&&sideToAct()===0&&!UI.busy&&!!tutPipRect()},
 {id:'mark2',title:'Set sail here',say:'Tap the glowing button to confirm this mark.',target:tq('#ppop [data-a=startmark][data-e="'+TS.myStart.e+'"]'),
   wait:{type:'tap',match:a=>a.what==='startmark'&&a.x===TS.myStart.x&&a.y===TS.myStart.y&&a.e===TS.myStart.e},ready:()=>PH.pop==='start'&&!!tq('#ppop [data-a=startmark][data-e="'+TS.myStart.e+'"]')()},
 {id:'stir',title:'Roll the dice',say:'Two dice are added. A 6, 7 or 8 wakes the leviathans: each moves a square or turns.',target:TQ.mph,wait:null,hold:c=>c==='mph',onNext:dismissMph,
   ready:()=>G.turn===2&&!UI.busy&&!!UI.mph&&UI.mph.wake&&!UI.mph.roll&&!!PH.cur&&PH.cur.kind==='mph'&&!!TQ.mph()},
 {id:'pick',title:'Pick a tile',say:'Tap the glowing tile in your hand to pick it.',target:TQ.tile(0),wait:{type:'tap',match:a=>a.what==='card'&&a.t===0},
   ready:()=>G.turn===2&&layReady()&&(UI.sel&&UI.sel.t===2&&UI.sel.r===0||tutSel(2,0))},
 {id:'turn',title:'Turn the tile',say:'A red cross: this tile sails off the chart and sinks you. Tap Turn.',target:TQ.turn,also:TQ.tile(0),wait:{type:'tap',match:a=>a.what==='rot'&&a.d===1},
   ready:()=>G.turn===2&&layReady()&&!!UI.sel&&UI.sel.t===0&&UI.sel.r===0},
 {id:'place',title:'Lay it',say:'Green check: safe. Tap Place. Your junk sails along the new line.',target:TQ.place,wait:{type:'tap',match:a=>a.what==='place'},pauseAfter:true,
   ready:()=>G.turn===2&&layReady()&&!!UI.sel&&UI.sel.t===0&&UI.sel.r===1&&placeOn()},
 {id:'sail',title:'Your junk sails',say:'It followed the line to the end. Then you draw back up to three tiles.',target:tutShipRect(0),wait:null,onNext:()=>{TUTP.pause=false;schedule()},
   ready:()=>G.turn===3&&TUTP.pause&&!UI.busy&&!!tutShipRect(0)()},
 {id:'rivals',title:'Mind other junks',say:'Cobalt sails too. Never end on another junk\'s wake: two junks on one wake both sink.',target:tutShipRect(1),wait:null,
   ready:()=>G.turn===4&&layReady()&&!!tutShipRect(1)()},
 {id:'chain',title:'Join another tile',say:'This tile links to Cobalt\'s current. Tap Place: your junk sails across both.',target:TQ.place,wait:{type:'tap',match:a=>a.what==='place'},
   ready:()=>G.turn===4&&layReady()&&tutSel(0,0)&&placeOn()},
 {id:'keep',title:'A Deck Cannon',say:'You drew a Deck Cannon. Keep it: later it destroys a leviathan about to sink you.',target:TQ.q(0),wait:{type:'tap',match:a=>a.what==='q'&&a.h==='cKeep'},
   ready:()=>!!G.q&&G.q.kind==='cannonDraw'&&!UI.busy&&!!PH.cur&&PH.cur.kind==='q'&&!!TQ.q(0)()},
 {id:'wave',title:'Rogue Wave',say:()=>{const w=waveLine();return w?'A Rogue Wave sweeps your row. You rolled '+w.r+'; it needs '+w.n+'+ or you capsize. You ride it.':'A Rogue Wave sweeps this row. Roll its strength or capsize.'},
   target:tutWaveRect,wait:null,ready:()=>G.turn===6&&!!G.wave&&!UI.busy&&sideToAct()===0&&!!tutWaveRect()},
 {id:'place3',title:'Lay a tile',say:'Lay this tile. Your path crosses the wave\'s row again, so you roll once more.',target:TQ.place,wait:{type:'tap',match:a=>a.what==='place'},
   ready:()=>G.turn===6&&layReady()&&tutSel(0,0)&&placeOn()},
 {id:'cannon',title:'Fire the cannon!',say:()=>levName(4)+' blocks your junk and would sink it. Fire your Deck Cannon.',target:()=>TQ.q(doomOpt('dCannon'))(),wait:{type:'tap',match:a=>a.what==='q'&&a.h==='dCannon'},
   ready:()=>!!G.q&&G.q.kind==='doom'&&doomOpt('dCannon')>=0&&!UI.busy&&!!PH.cur&&PH.cur.kind==='q'&&!!TQ.q(doomOpt('dCannon'))()},
 {id:'place4',title:'Keep sailing',say:'The leviathan is gone. Lay a tile to carry on.',target:TQ.place,wait:{type:'tap',match:a=>a.what==='place'},
   ready:()=>G.turn===8&&layReady()&&tutSel(0,2)&&placeOn()},
 {id:'sunk',title:'Leviathans sink junks',say:()=>levName(7)+' swam onto Cobalt\'s current: tile destroyed, junk sunk. Tap Continue.',target:tfirst('#pc [data-a=sunkok]','#cards [data-a=sunkok]'),wait:{type:'tap',match:a=>a.what==='sunkok'},
   ready:()=>!!G.over&&!UI.busy&&!!PH.cur&&PH.cur.kind==='sunk'},
 {id:'win',title:'Last junk afloat',say:'Only your junk is left, so you win. Real games add more captains, tiles and leviathans.',target:tq('#board'),wait:null,
   ready:()=>!!G.over&&!UI.busy&&!UI.sunk.length&&!!PH.cur&&PH.cur.kind==='over'}
]}
// ---------------------------------------------------------------- the staged game
function tutNewGame(){
  try{GX.close()}catch(e){}
  UI.tut=1;TS.on=true;TUT=tutDice;TUTP.pause=false;
  if(!UI.tutSpeed0){UI.tutSpeed0=UI.speed||1}UI.speed=Math.max(UI.tutSpeed0,2);try{TWKit.setSpeed(UI.speed)}catch(e){}
  const s=defaultSetup();s.mode='me';s.np=2;s.variant=null;s.noMon=false;s.exp={rift:0,wave:0,maelstrom:0,cannon:0};
  s.seats[0]={h:true,lv:'normal',col:0};s.seats[1]={h:false,lv:'easy',col:3};
  startGame(s,{tutorial:true,seed:TS.seed,first:1});
  UI.guide='light';UI.confirm=null;UI.seen={};UI.trig={};UI.camp=null;try{GXH.hide()}catch(e){}
  render()}
// leave the staged game: nothing of it was saved, the dice are real again and the board goes quiet behind the menu
function tutLeave(){TS.on=false;TUT=null;UI.tut=0;TUTP.pause=false;clearTimeout(UI.tm);UI.gen++;UI.started=false;UI.busy=false;UI.pause=false;UI.sel=null;UI.sunk=[];UI.marks=[];UI.mph=null;
  if(UI.tutSpeed0){UI.speed=UI.tutSpeed0;UI.tutSpeed0=0;try{TWKit.setSpeed(UI.speed)}catch(e){}}
  try{GXH.hide()}catch(e){}try{kitReset()}catch(e){}try{PH.pop=null;PH.pd=null;PH.cur=null;phAfter()}catch(e){}}
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a finished player goes straight to the chapter map
function storyOpen(){if(typeof GXC==='undefined')return;
  if(typeof GXT!=='undefined'&&!NET.on&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else campOpen()}
function tutStart(o){if(typeof GXT==='undefined'||NET.on)return;o=o&&o.prologue?o:null;const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  const story=!!(window.CAMPAIGN&&typeof GXC!=='undefined');
  GXT.start({game:TUT_GAME,steps:tutSteps(),story,
    endTitle:'You know the rules',endText:o?'Start, tiles, sailing, leviathans, the wave, the cannon. Now the Story begins.':'Start, tiles, sailing, leviathans, the wave, the cannon. The lightbulb explains the Rift Gate and the Maelstrom.',
    endButtons:o&&first?[{id:'chapter',label:'Start chapter 1'}]:null,
    setup:tutNewGame,
    onDone:r=>{tutLeave();const c=r&&r.choice;showStart();
      if(c==='chapter'&&first)GXC.play(first.id);
      else if(c==='story'&&story)campOpen()},
    onExit:()=>{tutLeave();showStart()}})}
// a first-time player tapping Play is offered the tutorial once; true = the offer is showing (the real game starts from "Just play")
function tutOffer(go){if(typeof GXT==='undefined'||NET.on||!firstTime()||GXT.status(TUT_GAME).seen)return false;
  try{localStorage.setItem('tw_offered','1')}catch(e){}
  const d=document.createElement('div');d.className='gxt-end';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','New here?');
  d.innerHTML='<div class="gxt-endc"><div class="gxt-et">New here?</div><div class="gxt-ex">Learn the rules by doing them, one tap at a time.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-tutoffer="learn">New here? Learn in 5 minutes</button><button type="button" class="gxt-b" data-tutoffer="play">Just play</button></div></div>';
  document.body.appendChild(d);
  d.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tutoffer]');if(!b)return;e.stopPropagation();d.remove();if(b.dataset.tutoffer==='learn')tutStart();else go()});
  return true}
function tutHold(c){if(typeof GXT==='undefined'||!GXT.active())return false;const st=GXT.current();return !!(st&&st.hold&&st.hold(c))}
// ---------------------------------------------------------------- the page tells the kit what the player does (before it is applied)
// the computer waits while a step reads out what just happened
{const _sc=schedule;schedule=function(){if(UI.tut&&TUTP.pause)return;return _sc.apply(this,arguments)}}
// taps on the board (a start mark, a square)
{const o=phPick;phPick=function(p){
  if(tutOn()){let sq=null;if(p&&(p.kind==='square'||p.kind==='start'))sq=[p.c,p.r];else if(p&&p.kind==='ship'){const S=G.ships[+String(p.id).slice(1)];if(S&&S.x!=null)sq=[S.x,S.y]}
    if(!GXT.act({type:'tap',what:'sq',x:sq?sq[0]:-1,y:sq?sq[1]:-1}))return}
  return o.apply(this,arguments)}}
// taps on the game's own buttons (tiles, Turn, Place, pop-up and question buttons, Continue)
document.addEventListener('click',e=>{if(!tutOn())return;const t=e.target&&e.target.closest&&e.target.closest('[data-a],[data-ph]');if(!t||t.disabled||t.closest('[data-help]'))return;
  const D=t.dataset;let a;
  if(D.a==='startmark')a={what:'startmark',x:+D.x,y:+D.y,e:+D.e};
  else if(D.a==='card')a={what:'card',t:+D.t};
  else if(D.a==='rot')a={what:'rot',d:+D.d};
  else if(D.a==='place')a={what:'place'};
  else if(D.a==='q'){const o=G&&G.q&&G.q.opts[+D.i];a={what:'q',i:+D.i,h:o&&o.h}}
  else if(D.a==='sunkok')a={what:'sunkok'};
  else if(D.ph==='dismiss')a={what:'dismiss'};
  else a={what:'other',a:D.a||D.ph};
  const st=GXT.current();const pause=!!(st&&st.pauseAfter);
  if(!GXT.act(Object.assign({type:'tap'},a))){e.stopPropagation();e.preventDefault();return}
  if(pause)TUTP.pause=true},true);
