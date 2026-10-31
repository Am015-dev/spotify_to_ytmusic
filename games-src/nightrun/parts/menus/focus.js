// PURPOSE: FOCUS MODE: the title offers FLIGHT, ON FOOT, SETTINGS, LAB only; flight stage 1 and the street play one song each
// FLAG: focus (?focus=0 = the whole game as before)
// TEST: qa/focus-test.js
/* ---------- FOCUS (owner, 23 Oct 2026: "all levels are horrible, focus on one on-foot level and one stage, all music is mixed, on foot is shit, all game is very boring").
   While RET.focus is on: the title shows four big buttons (FLIGHT = the first story stage not yet cleared (stage row below replays earlier ones), ON FOOT = the street level, SETTINGS, LAB); every other door is hidden, not removed
   (story map, endless, daily/weekly, hangar, achievements ...: the old buttons stay in the DOM so every id and hook keeps working). Result screens offer NEXT STAGE (until the last), RETRY and TITLE; the pause screen offers RETRY and TITLE
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
#focusBox .fr2{display:flex;gap:10px}
#focusBox .stl{font-size:.55em;letter-spacing:.12em;opacity:.85;margin-left:.6em}
#focusBox .strow[hidden]{display:none}#focusBox .strow{display:flex;gap:6px;overflow-x:auto;padding:2px 0}#focusBox .strow .go{width:auto;flex:0 0 auto;min-width:44px;min-height:44px;padding:0 10px;font-size:16px}#focusBox .strow .go.cur{outline:2px solid #ffe14d}#focusBox .fr2 .go{flex:1 1 0;min-height:52px;font-size:18px}
html.focus #pausem .row>#quitBtn{grid-column:auto}   /* RETRY and TITLE share one row under RESUME (the hidden SETTINGS button made TITLE span the full width and RETRY sit alone) */
html.focus #srMenu,html.focus #stBtn2,html.focus #pSetBtn,html.focus #fFly,html.focus #fCp{display:none!important}
`;document.head.appendChild(st);
  setTimeout(()=>{   // the title and result nodes exist after the parts have run
  const mk=(id,txt,cls,fn)=>{const b=document.createElement('button');b.type='button';b.id=id;b.className='go'+(cls?' '+cls:'');b.textContent=txt;b.addEventListener('click',fn);return b;};
  const box=document.createElement('div');box.id='focusBox';
  const r2=document.createElement('div');r2.className='fr2';
  const click=id=>()=>{const b=$(id);if(b)b.click();};
  /* progression: FLIGHT continues at the first stage not yet cleared (saved in mnr_story by story.js), the stage row replays any unlocked one */
  const hi=()=>{let h=0;for(let n=1;n<=MAIN;n++)if((sSave.stars[n]|0)>0)h=n;return h;};
  const nxt=()=>{const h=hi();let n=Math.min(MAIN,h+1);while(n>1&&!unlocked(n))n--;return n;};
  const fl=mk('focFlight','FLIGHT','',()=>{if(running)return;startStory(nxt());});
  const lbl=document.createElement('span');lbl.className='stl';lbl.id='focStage';fl.append(lbl);
  const row=document.createElement('div');row.className='strow';row.id='focStages';
  const sync=()=>{const n=nxt();lbl.textContent='Stage '+n;row.textContent='';row.hidden=n<2;
    for(let i=1;i<=n;i++){const b=mk('focS'+i,String(i),'dim'+(i===n?' cur':''),()=>{if(running)return;startStory(i);});b.setAttribute('aria-label','Stage '+i);row.append(b);}};
  new MutationObserver(sync).observe(titleEl,{attributes:true,attributeFilter:['hidden']});sync();
  box.append(fl,row,
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
