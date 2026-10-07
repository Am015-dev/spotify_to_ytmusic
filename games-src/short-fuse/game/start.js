// ===================== start.js: the start screen, story chapters, starting a job, boot =====================
// ---------- the start screen: one big Play button, the story, a job stepper ----------
function defaultSetup(){const s=lsGet('sf_setup',null);const d={job:1,np:3,seats:['human','ai','ai','ai','ai'],lv:'normal',chars:[],names:DEFNAMES.slice()};if(s)Object.assign(d,s,{names:(s.names||DEFNAMES).slice()});fixSetup(d);return d}
function fixSetup(s){s=s||UI.setup;if(!MISSIONS[s.job])s.job=1;const M=MISSIONS[s.job];if(!M.pl.includes(s.np))s.np=M.pl.find(x=>x>=s.np)||M.pl[M.pl.length-1];const ok=allowedChars(s.job,s.np);s.chars=s.chars||[];for(let i=0;i<5;i++)if(s.chars[i]&&!ok.includes(s.chars[i]))s.chars[i]='';return s}
function preset(v){const s=UI.setup;if(v==='solo')s.seats=['human','ai','ai','ai','ai'];if(v==='hot')s.seats=['human','human','human','human','human'];if(v==='watch')s.seats=['ai','ai','ai','ai','ai'];s.picked=v;renderStart()}
function seatMode(s){const k=s.seats.slice(0,s.np).filter(x=>x==='human').length;return k===0?'watch':k===1?'solo':'hot'}
function showStart(){if(isClient()){hideStart();return}clearTimeout(UI.aiT);UI.aiT=null;UI.setup=UI.setup||defaultSetup();sndLoop('hum',true);musicStop(.8);$('#start').hidden=false;renderStart();sndLoop('clock_loop',false)}
function hideStart(){$('#start').hidden=true;sndLoop('hum',false)}
function campLine(){try{if(typeof GXC==='undefined'||!window.CAMPAIGN)return '';const p=GXC.progress(),ch=window.CAMPAIGN.chapters,n=ch.filter(c=>p.ch[c.id]&&p.ch[c.id].beaten).length;return n?n+' of '+ch.length:'10 chapters'}catch(e){return ''}}
function renderStart(){const s=UI.setup,n=s.job,M=MISSIONS[n],c=jobProg();const saved=savedGame();const nh=s.seats.slice(0,s.np).filter(x=>x==='human').length;const onl=isHost(),nOnl=onl?Math.min(s.np,NET.peers.length||1):0;
  let jobs='';for(const [a,b,label] of BOXES){jobs+=`<div class="box">${esc(label)}</div><div class="jobs">`;for(let k=a;k<=b;k++){const j=c.jobs[k];
      jobs+=`<button class="jt${j&&j.w?' done':''}${k===n?' sel':''}" data-a="job" data-n="${k}" aria-pressed="${k===n}" title="${esc(MISSIONS[k].nm)}"><b>${k}</b><span>${esc(MISSIONS[k].nm)}</span>${j&&j.w?'<i>✓</i>':''}${MISSIONS[k].audio||hasRule(k,'timer')?'<i class="t">⏱</i>':''}</button>`}jobs+='</div>'}
  const seatsTxt=nh===0?'Watch':nh===1?'You + computers':nh+' players, one phone';
  $('#start').innerHTML=`<div class="st-head"><svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">${ICO.bomb}</svg><h1>Short Fuse</h1><span style="flex:1"></span>${G&&!G.over?'<button class="btn small" data-a="closestart">Back</button>':''}</div>
  <div class="st-body"><div class="st-main">
   <button class="big go" data-a="start">${ico('play')}${onl?'Start online ('+nOnl+')':nh===0?'Watch':'Play'}</button>
   <button class="big blue" data-a="story">${ico('map')}Story<small>${esc(campLine())}</small></button>
   ${saved?`<button class="big" data-a="resume">${ico('fwd')}Continue<small>Job ${saved.G.mission}</small></button>`:''}
   <div class="jobrow"><button class="btn" data-a="jobprev" aria-label="Previous job">${ico('back')}</button><div class="jobcur"><b>${n}</b><span>${esc(M.nm)}</span>${MISSIONS[n].audio||hasRule(n,'timer')?'<i class="t">⏱</i>':''}</div><button class="btn" data-a="jobnext" aria-label="Next job">${ico('fwd')}</button></div>
   <div class="seg" role="group" aria-label="Crew size">${[2,3,4,5].map(k=>`<button class="btn small${s.np===k?' on':''}" data-a="np" data-v="${k}" ${M.pl.includes(k)?'':'disabled'}>${k}</button>`).join('')}</div>
   <div class="seg" role="group" aria-label="Computer level">${['easy','normal','hard'].map(l=>`<button class="btn small${s.lv===l?' on':''}" data-a="lv" data-v="${l}">${LV_NAME[l]}</button>`).join('')}</div>
   <details class="more"${UI.moreOpen||NET.on?' open':''}><summary>More</summary>
    <div class="seg"><button class="btn small${seatMode(s)==='solo'?' on':''}" data-a="preset" data-v="solo">${ico('user')}Solo</button><button class="btn small${seatMode(s)==='hot'?' on':''}" data-a="preset" data-v="hot">${ico('four')}One phone</button><button class="btn small${seatMode(s)==='watch'?' on':''}" data-a="preset" data-v="watch">${ico('eye')}Watch</button></div>
    ${onlineBlock()}<h2>${ico('map')} All jobs</h2>${jobs}</details>
  </div></div>`;paintIcons($('#start'))}
document.addEventListener('toggle',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('more'))UI.moreOpen=e.target.open},true);
function savedGame(){try{const s=JSON.parse(localStorage.getItem(SAVE)||'null');return s&&s.G&&!s.G.over?s:null}catch(e){return null}}
function realtimeJob(n){const M=MISSIONS[n];return !!(M.audio||hasRule(n,'timer'))}
function startJob(s){if(isClient())return;s=Object.assign({},s);s.names=(s.names||DEFNAMES).slice();let plan=null;
  if(isHost()){plan=netPlan(s);if(plan.err){NET.err=plan.err;UI.netOpen=true;netRender();return}NET.err='';s.np=plan.np;s.seats=plan.seats;s.names=plan.names;fixSetup(s)}
  if(!plan&&!s.camp)lsSet('sf_setup',{job:s.job,np:s.np,seats:s.seats,lv:s.lv,chars:s.chars,names:s.names});UI.lastSetup=s.camp?UI.lastSetup:s;
  const seats=s.seats.slice(0,s.np);const chars={};let any=0;for(let i=0;i<s.np;i++)if(s.chars&&s.chars[i]){chars[i]=s.chars[i];any=1}
  UI.rt=realtimeJob(s.job);UI.started=false;clearTimeout(UI.aiT);UI.aiT=null;UI.sel=null;UI.prev=null;UI.holder=-1;UI.offSeat=null;UI.campDone=0;UI.campShown=0;UI.wwk=null;UI.pause=false;
  UI.camp=s.camp||null;UI.brief=(NET.on||isHost()||s.camp)?null:{n:s.job};UI.aiNotBefore=0;UI.lastPrompt=null;
  UI.ghost=lsGet('sf_ghost',{info:1,turn:1});if(s.camp&&s.camp.hints&&!lsGet('sf_ghost_'+s.camp.id,0)){lsSet('sf_ghost_'+s.camp.id,1);UI.ghost={info:1,turn:1}}if(s.camp&&!s.camp.hints)UI.ghost={info:0,turn:0};
  if(typeof GXH!=='undefined'){UI.ghost={info:0,turn:0};if(s.camp&&s.camp.hints)GXH.setEnabled(true)}
  const o={np:s.np,mission:s.job,seats,level:s.lv,names:s.names.slice(0,s.np),realtime:UI.rt};if(any){try{const ch=[];for(let i=0;i<s.np;i++)ch[i]=chars[i]||null;o.chars=ch}catch(e){}}
  if(s.captain!=null&&s.captain<s.np)o.captain=s.captain;if(s.seed!=null)o.seed=s.seed;if(s.twist)o.twist=s.twist;if(s.lvs)o.lv=s.lvs;
  kitReset();UI.started=true;hideStart();NET.starting=true;try{try{newGame(o)}catch(e){try{delete o.chars;newGame(o)}catch(e2){console.error(e2);UI.started=false;showStart();return}}
  if(plan)netBound(plan)}finally{NET.starting=false}
  if(humans().length===1&&!NET.on)UI.holder=humans()[0];
  UI.prev=snap();try{if(window.PerfHUD)PerfHUD.hitch()}catch(e){}if(SND.gesture)musicStart();else SND.wantMusic=1;refresh()}
function resumeSaved(){const s=savedGame();if(!s)return;kitReset();G=s.G;UI.holder=s.ui.holder;UI.rt=!!s.ui.rt;UI.brief=null;UI.started=true;UI.prev=snap();UI.sel=null;UI.campDone=0;UI.campShown=0;UI.camp=null;UI.ghost={info:0,turn:0};hideStart();if(SND.gesture)musicStart();refresh()}
function renderIdle(){const say=document.getElementById('say');if(say)say.textContent='Waiting for the host';for(const id of ['crew','mine','gear','tray','fuse','track','cutc','clk']){const e=document.getElementById(id);if(e){e._s=null;e.innerHTML=''}}const ov=document.getElementById('over');if(ov)ov.hidden=true}
// ---------- story chapters (the shared campaign kit) ----------
function campMetrics(G){const st=G.stats||{};return {won:!!(G.over&&G.over.win),misses:st.miss||0,left:G.dial!=null?G.dial:0,turns:G.turn,solos:st.solo||0,eqUsed:st.eqUse||0}}
function campStart(def){const np=def.setup.players||3;const lv=def.setup.level||'normal';const seats=['human'];for(let i=1;i<np;i++)seats.push('ai');
  const s={job:def.setup.mission,np,seats,lv,names:DEFNAMES.slice(),chars:[],camp:def,twist:def.twist&&def.twist.id?{id:def.twist.id,param:def.twist.param||1}:null};
  if(def.twist&&def.twist.id==='green-hand'){const l=[];for(let i=0;i<np;i++)l[i]=lv;if(np>1)l[np-1]='easy';s.lvs=l}
  startJob(s)}
function campOver(){if(!UI.camp||typeof GXC==='undefined'||!GXC.active())return;setTimeout(()=>{if(!G||!G.over)return;UI.campShown=1;try{document.getElementById('over').hidden=true}catch(e){}try{GXC.finish(G)}catch(e){console.error(e)}},ANIM?2200:0)}
function campInit(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;
  GXC.init({game:'short-fuse',data:window.CAMPAIGN,startChapter:campStart,isWon:G=>!!(G&&G.over&&G.over.win),metrics:campMetrics,
    onExit:()=>{UI.camp=null;showStart()},scores:g=>[g.seats.length?g.st.reduce((a,s)=>a+s.w.filter(x=>x.cut).length,0):0],seats:g=>g.seats.map((q,i)=>({name:i===0?'You':q.nm,me:i===0,ai:q.human?undefined:q.lv}))})}
// ---------- clicks on buttons that carry data-a ----------
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a;const V=UI.V;
  if(netClick(a))return;
  switch(a){
  case 'take':UI.holder=+b.dataset.seat;UI.sel=null;sfx('click');refresh();return;
  case 'pause':togglePause();return;
  case 'xray':UI.xray=!UI.xray;refresh();return;
  case 'briefok':UI.brief=null;sfx('click');refresh();return;
  case 'next':startJob(Object.assign({},UI.lastSetup,{job:G.mission+1,captain:(G.captain+1)%G.np}));return;
  case 'again':if(UI.camp){return}startJob(Object.assign({},UI.lastSetup,{captain:G.captain}));return;
  case 'board':showStart();return;
  case 'snd':toggleSound();renderSettings();return;
  case 'mus':toggleMusic();renderSettings();return;
  case 'speed':UI.speed=+b.dataset.v;saveSettings();renderSettings();return;
  case 'newgame':GX.close();showStart();return;
  case 'restart':GX.close();if(UI.camp){const d=UI.camp;campStart(d)}else if(UI.lastSetup)startJob(UI.lastSetup);return;
  case 'job':UI.setup.job=+b.dataset.n;fixSetup();renderStart();sfx('select');return;
  case 'jobprev':UI.setup.job=Math.max(1,UI.setup.job-1);fixSetup();renderStart();sfx('select');return;
  case 'jobnext':UI.setup.job=Math.min(66,UI.setup.job+1);fixSetup();renderStart();sfx('select');return;
  case 'np':UI.setup.np=+b.dataset.v;fixSetup();renderStart();return;
  case 'lv':UI.setup.lv=b.dataset.v;renderStart();return;
  case 'preset':preset(b.dataset.v);return;
  case 'story':if(typeof GXC!=='undefined'&&window.CAMPAIGN){GXC.open()}return;
  case 'start':startJob(UI.setup);return;
  case 'resume':resumeSaved();return;
  case 'closestart':if(G){hideStart()}return;
  }});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&UI.sel&&!GX.open){UI.sel=null;refresh()}});
// ---------- boot ----------
function boot(){GX.init({key:'sf'});paintIcons();loadSettings();
  GX.onShow=id=>{sfx('open');if(id==='rulesd')$('#rulesbody').innerHTML=RULES_HTML+GLOSS_HTML+'<h3>Credits</h3><p>Names, card text and art are original. <button class="btn small" data-gx="credd">Full credits</button></p>';if(id==='refd')renderRef();if(id==='setd')renderSettings();if(G)renderOpenDrawer();else if(id==='logd'||id==='missiond'||id==='geard')$('#'+id+' .gx-drawer-body').innerHTML='<p>Start a job first.</p>'};
  GX.onClose=()=>sfx('close');
  setInterval(clockTick,250);setInterval(()=>{if(G&&UI.started&&timedJob()&&!G.over){const p=document.querySelector('#timerpill span');if(p&&UI.V){const c=clockLeft(knowledge(Math.max(0,UI.V.seat)));if(c){p.textContent=fmt(c.left)+(UI.pause?' ⏸':'');const cl=p.parentNode;if(cl)cl.classList.toggle('low',c.real<30)}}}},1000);
  campInit();netInit();showStart();if(UI.netOpen)netRender()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
