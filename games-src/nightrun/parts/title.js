/* ---------- B25 title diet + CONTINUE, B26 type floor (POLISH.md). Flags RET.title and RET.type (ret.js); flags off = the old title.
   Title: one big PLAY / CONTINUE, ENDLESS + DAILY, GARAGE + MENU, and the daily/weekly status chip (#retTt, drawn by ret.js).
   MENU (#mnMore) holds the old buttons, same ids: storyBtn (stage map), wkBtn (weekly run), labBtn, wpBtn, ckB (checklist), tutBtn (Flight School),
   setBtn (settings), diffBtn (difficulty) and the controls legend. Heat and Arcade/Classic stay on the stage plate; ONE MORE RUN stays on the run-end screens. ---------- */
if(RET.type){const st=document.createElement('style');st.textContent=`
#title .eyebrow,#title .stat,#title .keys,#retTt,#titleRow2 .go,#title .lede{font-size:max(14px,var(--tf,14px))}
#title .keys b,#title .keys span{font-size:14px}
#retTt button{min-height:44px}
#stsel .ban small,#stsel .ban span{font-size:14px}
#stsel .nd .stars,#stsel .nd .nm{font-size:14px}
#stDet .dh,#stDet .gl,#stDet .rl,#stDet .stl,#stDet .tip,#stDet .lkn,#stDet .hmu,#stDet .heat,#stDet .heat b{font-size:14px}
#stDet .arc button{min-height:44px;font-size:14px}#stDet .arc button small{font-size:14px}
#stDet .heat button{min-height:44px}
@media (min-width:900px){#title .lede,#title .stat,#retTt,#mnMore .keys,#stDet .gl,#stDet .stl,#stDet .tip,#stDet .rl,#stDet .lkn{font-size:16px}}
`;document.head.appendChild(st);}
if(RET.title)setTimeout(()=>{
  const T=titleEl,inn=T.querySelector('.in'),keys=inn.querySelector('.keys'),chip=$('retTt'),old=[...inn.querySelectorAll('.row')];
  const st=document.createElement('style');st.textContent=`
#ttMain{width:100%;max-width:min(94%,440px);display:flex;flex-direction:column;gap:10px}
#ttMain .row{flex-wrap:nowrap;gap:10px}#ttMain .row .go{flex:1 1 0;min-width:0;padding-left:calc(2.1em + .12em)!important;padding-right:2.1em!important;white-space:nowrap}#ttMain #playBtn{padding-left:1.9em!important;padding-right:1.9em!important}#retTt{text-align:left!important;margin:.8em 0 0!important}
#playBtn{width:100%;min-height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:clamp(20px,min(5.4vw,3.8vh),28px)}
#playBtn small,#dailyBtn small{display:block;font-family:var(--mono);font-size:14px;font-weight:600;letter-spacing:.02em;line-height:1.15;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#dailyBtn small{font-size:14px}
#mnMore{position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;align-items:center;gap:10px;padding:14px 5%;overflow-y:auto;background:#05030c}
#mnMore[hidden]{display:none}
#mnMore h2{margin:0;font-family:var(--display);font-size:22px;letter-spacing:.14em;color:var(--ink)}
#mnMore .mg{width:100%;max-width:440px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
#mnMore .mg .go{width:100%;min-height:48px;padding:.4em .5em;font-size:14px;letter-spacing:.06em}
#mnMore .mg .wide{grid-column:1/-1}
#mnMore .keys{width:100%;max-width:440px;margin:4px 0}
#mnMore .back{width:100%;max-width:440px;min-height:48px}
@media (max-height:600px){#title .eyebrow{display:none}#title .lede{display:none}#ttMain{gap:6px}#playBtn{min-height:56px}}
`;document.head.appendChild(st);
  /* main block */
  const main=document.createElement('div');main.id='ttMain';
  const play=document.createElement('button');play.type='button';play.className='go';play.id='playBtn';
  const r2=document.createElement('div'),r3=document.createElement('div');r2.className=r3.className='row';
  const menu=document.createElement('button');menu.type='button';menu.className='go dim';menu.id='moreBtn';menu.textContent='MENU';
  $('startBtn').textContent='ENDLESS';$('startBtn').classList.add('alt');$('dailyBtn').classList.add('dim');
  r2.append($('startBtn'),$('dailyBtn'));r3.append($('gaBtn'),menu);main.append(play,r2,r3);
  (chip||$('bestT')).after(main);
  /* the menu sheet */
  const mn=document.createElement('div');mn.id='mnMore';mn.hidden=true;mn.setAttribute('role','dialog');mn.setAttribute('aria-label','Menu');
  const h2=document.createElement('h2');h2.textContent='MENU';const grid=document.createElement('div');grid.className='mg';
  const wk=document.createElement('button');wk.type='button';wk.className='go alt';wk.id='wkBtn';wk.textContent='WEEKLY RUN';
  wk.addEventListener('click',()=>{if(running)return;RET.wkPending=true;start(true);});
  const sb=$('storyBtn'),ck=inn.querySelector('.ckB');
  sb.textContent='STAGE MAP';
  const seq=[sb,wk,$('wpBtn'),$('labBtn'),ck,$('tutBtn'),$('setBtn'),$('diffBtn')];
  for(const b of seq)if(b){grid.append(b);}
  if(window.diffDraw)diffDraw();
  const back=document.createElement('button');back.type='button';back.className='go back';back.id='mnBack';back.textContent='BACK';
  mn.append(h2,grid);if(keys)mn.append(keys);mn.append(back);T.appendChild(mn);
  for(const r of old){if(!r.children.length)r.remove();}
  const open=()=>{mn.hidden=false;draw();const f=sb;if(f)f.focus();},shut=()=>{mn.hidden=true;menu.focus&&menu.focus();};
  menu.addEventListener('click',open);back.addEventListener('click',shut);
  mn.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(b&&b.id!=='diffBtn'&&b.id!=='mnBack')mn.hidden=true;},true);   // every door closes the menu; the difficulty button only cycles
  addEventListener('keydown',e=>{if(!mn.hidden&&e.code==='Escape'&&!(window.setEl&&!setEl.hidden)){shut();e.stopImmediatePropagation();e.preventDefault();}},true);
  /* the label of the big button follows the save: next unbeaten stage, last Arcade/Classic choice, Heat */
  function draw(){
    const n=mapCurrent(),s=STAGES[n-1];if(!s)return;
    const fresh=!Object.keys(sSave.stars).some(k=>(sSave.stars[k]|0)>0),h=window.HEAT?HEAT.lv(n):0;
    play.innerHTML=(fresh?'PLAY':'CONTINUE')+'<small>Stage '+n+' · '+s.name+(s.ch?'':' · '+(ARC.active()?'ARCADE':'CLASSIC'))+(h?' · HEAT '+h:'')+'</small>';
    const d=window.DY&&RET.daily?DY.status():null;
    $('dailyBtn').innerHTML='DAILY'+(d?'<small>'+(d.claimed?'streak '+d.streak+' ✓':'+'+d.reward+' Neon')+'</small>':'');}
  RET.titleDraw=draw;draw();
  play.addEventListener('click',()=>{if(running)return;startStory(mapCurrent());});
  RET.menuOpen=open;RET.menuShut=shut;
  if(window.RET&&RET.dailyShow)RET.dailyShow();
},0);
