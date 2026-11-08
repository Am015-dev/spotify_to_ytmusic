// ===================== the first game is COACHED (owner, 22 Oct: no forced tap-tap tutorial) =====================
// A real two-player game from turn 1 on a stacked bazaar (tutdata.js), the computer plays normally, every legal move is allowed.
// Old Hadiya (coach.js) explains each rule just in time, one bubble at a time, never blocking a tap. Nothing is saved.
// This file: the menu entry, the first-time offer, start and leave. The rules list and the coach itself: coach.js.
const TUT_GAME='sands-of-qamar';
const tutOn=()=>false;                 // no spotlight tutorial any more
const tutHeld=()=>false;
function firstTime(){try{if(typeof GXT==='undefined'||GXT.status(TUT_GAME).seen)return false;if(FING.n>0)return false;if(localStorage.getItem(SAVE))return false}catch(e){}return true}
const tutBtn=cls=>{if(typeof GXT==='undefined')return '';let done=false;try{done=GXT.isDone(TUT_GAME)}catch(e){}const first=firstTime();
  return `<button type="button" class="${cls} gxt-menu ${first?'gxt-first':''}" data-ui="tutgo" data-coach-entry><b>${done?'Coached game ✓':'New here? Learn by playing'}</b><span>${done?'Play it again with Hadiya':'A short real game, rules explained as you play'}</span></button>`};
function tutMenuFill(){const el=document.getElementById('gxtmenu');if(el)el.innerHTML=tutBtn('btn')}
function tutOffer(next){if(typeof GXT==='undefined'||online())return false;let seen='1';try{seen=localStorage.getItem('soq_tutoffer')}catch(e){}
  if(seen||!firstTime())return false;try{localStorage.setItem('soq_tutoffer','1')}catch(e){}UI.offerNext=next;UI.modal='offer';render();return true}
function offerHtml(){return `<div class="mbox"><h2>New here?</h2><p class="lede">Play one short coached game. Hadiya explains each rule when it matters. About 8 minutes.</p><div class="acts big"><button class="btn go big" data-ui="tutgo">▶ Play a coached game</button><button class="btn big" data-ui="tutplay">Just play</button></div></div>`}
function storyOpen(){if(typeof GXC==='undefined')return;if(typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else GXC.open()}
function tutStart(o){UI.coachStory=!!(o&&o.prologue);try{GX.close()}catch(e){}clearTimeout(aiTimer);aiTimer=null;clearTimeout(UI.autoT);UI.autoT=0;UI.modal=null;UI.fx.length=0;UI.fxSeen=0;resetScene();tutNew();UI.snap=null;coachBegin();refresh()}
function tutLeave(){clearTimeout(aiTimer);aiTimer=null;clearTimeout(UI.autoT);UI.autoT=0;coachEnd();G=null;resetScene();UI.modal=null;UI.fx.length=0;UI.fxSeen=0;try{GXH.hide()}catch(e){}try{const f=$('#finger');if(f)f.hidden=true}catch(e){}render()}
