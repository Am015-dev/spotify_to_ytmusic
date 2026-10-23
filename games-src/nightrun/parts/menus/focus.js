// PURPOSE: FOCUS MODE: the title offers FLIGHT, ON FOOT, SETTINGS, LAB only; flight stage 1 and the street play one song each
// FLAG: focus (?focus=0 = the whole game as before)
// TEST: qa/focus-test.js
/* ---------- FOCUS (owner, 23 Oct 2026: "all levels are horrible, focus on one on-foot level and one stage, all music is mixed, on foot is shit, all game is very boring").
   While RET.focus is on: the title shows four big buttons (FLIGHT = story stage 1, ON FOOT = the street level, SETTINGS, LAB); every other door is hidden, not removed
   (story map, endless, daily/weekly, hangar, achievements ...: the old buttons stay in the DOM so every id and hook keeps working). Result and pause screens offer RETRY and TITLE
   (the pause screen also keeps RESUME). Music: ONE song per mode. Flight stage 1 plays the stage-1 song from start to end (no boss song, no music-pack cue, no stinger, no duck, no menu song
   between runs); the street keeps street1 (street3.js). The title is silent unless the Lab SOUND page has a title pick. A Lab pick for the stage-1 song / street / title wins (SND.songFor). ---------- */
if(RET.focus===undefined)RET.focus=!/[?&]focus=0/.test(location.search);
if(RET.focus){
  document.documentElement.classList.add('focus');
  const st=document.createElement('style');st.textContent=`
html.focus #title .in>*:not(.eyebrow):not(h1):not(#focusBox){display:none!important}
html.focus #title .lede{display:none!important}
#focusBox{width:100%;max-width:min(94%,440px);display:flex;flex-direction:column;gap:12px;margin-top:8px}
#focusBox .go{width:100%;min-height:64px;font-size:clamp(20px,min(5.4vw,3.8vh),28px)}
#focusBox .fr2{display:flex;gap:10px}#focusBox .fr2 .go{flex:1 1 0;min-height:52px;font-size:18px}
html.focus #srNext,html.focus #srMenu,html.focus #stBtn2,html.focus #pSetBtn,html.focus #fFly,html.focus #fCp{display:none!important}
`;document.head.appendChild(st);
  setTimeout(()=>{   // the title and result nodes exist after the parts have run
  const mk=(id,txt,cls,fn)=>{const b=document.createElement('button');b.type='button';b.id=id;b.className='go'+(cls?' '+cls:'');b.textContent=txt;b.addEventListener('click',fn);return b;};
  const box=document.createElement('div');box.id='focusBox';
  const r2=document.createElement('div');r2.className='fr2';
  const click=id=>()=>{const b=$(id);if(b)b.click();};
  box.append(mk('focFlight','FLIGHT','',()=>{if(running)return;startStory(1);}),
    mk('focFoot','ON FOOT','alt',()=>{if(running||!window.FOOT)return;FOOT.ui=1;FOOT.start(FOOT.main||'street1');}));
  r2.append(mk('focSet','SETTINGS','dim',click('setBtn')),mk('focLab','LAB','dim',click('labBtn')));box.append(r2);
  titleEl.querySelector('.in').querySelector('h1').after(box);
  /* result / pause screens: relabel and add TITLE where the stage result had none */
  const tb=mk('focTitle','TITLE','dim',()=>{const b=$('menuBtn');if(b)b.click();});$('srRetry').after(tb);
  const txt=(el,t)=>{if(el&&el.textContent!==t)el.textContent=t;};
  const fix=()=>{txt($('againBtn'),'RETRY');txt($('srRetry'),'RETRY');txt($('restartBtn'),'RETRY');txt($('menuBtn'),'TITLE');txt($('quitBtn'),'TITLE');txt($('fCity'),'TITLE');txt($('fQuit'),'TITLE');txt($('fAgain'),'RETRY');};
  new MutationObserver(fix).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});fix();
  },0);
  /* ----- music: one song per mode ----- */
  const inFlight=()=>RET.focus&&ST.on&&ST.n===1&&!(window.FOOT&&FOOT.on);
  const pick=p=>{try{const m=window.SND&&SND.cfg&&SND.cfg.music&&SND.cfg.music[p];return m&&SND.songs().includes(m)?m:null;}catch(e){return null;}};
  {const s0=AU.startStage;AU.startStage=function(stage,at){
    if(inFlight()){const w=ST.def.song;if(stage!==w)arguments[0]=stage=w;}   // boss, fever, district and menu songs all map to the stage song: a stage that wants the playing song keeps it
    else if(stage==='menu'&&!(window.FOOT&&FOOT.on)&&!pick('title'))return;   // the title is silent
    return s0.apply(this,arguments);};}
  {const w0=AU.switchTo;AU.switchTo=function(stage){if(inFlight())return;return w0.apply(this,arguments);};}
  for(const f of ['sting','duckMusic']){const o=AU[f];if(o)AU[f]=function(){return inFlight()?false:o.apply(this,arguments);};}
  {const m0=AU.menuMusic;AU.menuMusic=function(){if(inFlight())return;return m0.apply(this,arguments);};}
  {const MP=RET.MP;if(MP&&MP.foot){const f0=MP.foot;MP.foot=function(){return inFlight()?undefined:f0.apply(this,arguments);};}}
}
