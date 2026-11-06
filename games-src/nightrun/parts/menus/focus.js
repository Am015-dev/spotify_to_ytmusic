// PURPOSE: FOCUS MODE: the title offers FLIGHT, ON FOOT, SETTINGS only (LAB with ?lab=1); the music is parts/music/library.js
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
  /* LAB is the developer sandbox: shown only with ?lab=1 (buyers never see it) */
  r2.append(mk('focSet','SETTINGS','dim',click('setBtn')));if(RET.lab)r2.append(mk('focLab','LAB','dim',click('labBtn')));box.append(r2);
  titleEl.querySelector('.in').querySelector('h1').after(box);
  /* result / pause screens: relabel and add TITLE where the stage result had none */
  const tb=mk('focTitle','TITLE','dim',()=>{const b=$('menuBtn');if(b)b.click();});$('srRetry').after(tb);
  const txt=(el,t)=>{if(el&&el.textContent!==t)el.textContent=t;};
  const fix=()=>{txt($('againBtn'),'RETRY');txt($('srRetry'),'RETRY');txt($('restartBtn'),'RETRY');txt($('menuBtn'),'TITLE');txt($('quitBtn'),'TITLE');txt($('fCity'),'TITLE');txt($('fQuit'),'TITLE');txt($('fAgain'),'RETRY');};
  new MutationObserver(fix).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});fix();
  },0);
  /* music: since 6 Nov 2026 the whole library plays (parts/music/library.js): the one-song-per-mode rule of 23 Oct is gone, a stage plays its own song, a boss its own, the title the menu song */
}
