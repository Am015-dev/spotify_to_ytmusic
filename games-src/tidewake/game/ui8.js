// ===================== part 8: shared GX kit (settings, reference, take-back, recap, results, offline) =====================
const GAME_ID='tidewake';
// ---- achievements (stored by the shelf; shown in Stats & achievements on the home page)
const ACH=[
 {id:'first',name:'Maiden voyage',how:'Finish a game.',test:r=>true},
 {id:'guide',name:'Chart reader',how:'Finish the guided first game.',test:r=>r.mode==='guided'},
 {id:'win',name:'Last junk afloat',how:'Beat the computer captains.',test:r=>r.won&&(r.mode==='vs'||r.mode==='guided')},
 {id:'hard',name:'Storm-tested',how:'Beat three or more hard computer captains.',test:(r,s,x)=>r.won&&r.mode==='vs'&&x.extra&&x.extra.hard>=3},
 {id:'eight',name:'Eight sails',how:'Win a game with eight captains.',test:r=>r.won&&r.np>=8},
 {id:'solo',name:'Outlasted the deep',how:'Win a solo game.',test:(r,s,x)=>r.won&&x.extra&&x.extra.variant==='solo'},
 {id:'easysolo',name:'Calm hands',how:'Win an easy solo game.',test:(r,s,x)=>r.won&&x.extra&&x.extra.variant==='easysolo'},
 {id:'perils',name:'Deepwater survivor',how:'Win with all four expansion pieces on.',test:(r,s,x)=>r.won&&x.extra&&x.extra.exp>=4},
 {id:'teams',name:'Fleet captain',how:'Win a teams game.',test:(r,s,x)=>r.won&&x.extra&&x.extra.variant==='teams'},
 {id:'hot',name:'Shared helm',how:'Finish a hot-seat game.',test:r=>r.mode==='hot'}];
// ---- small DOM helpers for the kit panels
function kb(a,label,o){const b=document.createElement('button');b.type='button';b.className='gx-sb';if(a)b.dataset.a=a;b.textContent=label;o=o||{};for(const k in o){if(k==='disabled'){if(o[k])b.disabled=true}else b.setAttribute(k,o[k])}return b}
// ---- speed: the shared "Animations" choice drives the replay speed; "Very fast turns" keeps the old x5 option
const TW_SPEED={slow:.6,normal:1.4,fast:2.5,off:2.5};
function twRate(){const a=GX.pref('anim');if(UI.legacy&&UI.legacy.speed)return +UI.legacy.speed;let v=UI.guided?1:(TW_SPEED[a]||1.4);if(UI.turbo&&!UI.guided)v*=2;return v}
function twSetRate(v){UI.speed=UI.spSet=v;try{TWKit.setSpeed(v)}catch(e){}}
function twSpeed(){const a=GX.pref('anim');ANIM=a==='off'||GX.reduced()||(UI.legacy&&UI.legacy.anim===false)?0:1;twSetRate(twRate());AIDELAY=GX.aiDelay(500)}
// a new game only re-reads the rate (guided games replay at the calm speed); a speed set by hand (tests) is kept
function twGameSpeed(){if(UI.spSet==null||UI.speed===UI.spSet)twSetRate(twRate())}
// ---- settings: the same sections as every game; Tidewake adds its own rows
function kitSettings(){
  GX.settings({id:'setd',title:'Menu',
    game:S=>{
      if(isClient())S.appendChild(GX.row('Online',[kb('netleave','Leave the online game')]));
      else{const r=[];if(G&&UI.started)r.push(kb('restart','Restart this setup'));r.push(kb('tonew','New game…'));S.appendChild(GX.row('This game',r));}
      if(!NET.on&&G&&UI.started&&humans().length===1)S.appendChild(GX.row('Take back',kb('rewind','Take back my last move',{disabled:!GX.undo.can()}),'Puts the board back to just before your last move (also Ctrl+Z)'));
    },
    sound:S=>{S.appendChild(GX.row('Sound effects',GX.onoff(SND.on,()=>toggleSound(),'Sound effects')));S.appendChild(GX.row('Music',GX.onoff(SND.music,()=>toggleMusic(),'Music')))},
    speed:S=>{S.appendChild(GX.row('Very fast turns',GX.onoff(!!UI.turbo,v=>{UI.turbo=v;UI.legacy=null;saveSettings();twSpeed()},'Very fast turns'),'Doubles the speed of every replay (not in the guided game)'));
      S.appendChild(GX.row('Wake cards',GX.seg([['auto','Close by themselves'],['tap','Wait for my tap']],UI.wakeTap?'tap':'auto',v=>{UI.wakeTap=v==='tap';saveSettings()},'Wake cards'),'On phones: a calm roll that does not touch you closes after 2 seconds'))},
    help:S=>{S.appendChild(GX.row('Read',[kb(null,'How to play',{'data-gx':'rulesd'}),kb(null,'Pieces',{'data-gx':'gx-refd'}),kb(null,'Sound credits',{'data-gx':'credd'})]));
      S.appendChild(GX.row('Guide',GX.seg([['full','Full lessons'],['light','Warnings only']],UI.guide,v=>{UI.guide=v;saveSettings();saveAll();if(G&&UI.started)render()},'Guide'),'Lessons appear one at a time as things happen'))},
    graphics:S=>{const g=(()=>{try{return TWKit.getQuality()}catch(e){return {pref:'auto',active:'2d'}}})();const on3=!!(TWKit._K&&TWKit._K.on);
      if(!on3){S.appendChild(GX.row('Graphics','2D chart',"This device has no 3D graphics, so the flat chart is used"));return}
      S.appendChild(GX.row('Graphics',GX.seg([['auto','Auto'],['high','High'],['medium','Medium'],['low','Low']],g.pref,v=>{try{TWKit.setQuality(v);if(window.PerfHUD)PerfHUD.hitch()}catch(x){}},'Graphics'),'Now: '+g.active+'. Auto steps down by itself if frames drop'))},
    about:{name:'Tidewake',version:'preview',text:'A tile-laying survival game for 1 to 8 captains. Names, texts, board and ship art are our own; the board is drawn in code. Sounds and music are CC0 recordings; three.js is MIT licensed.'}});
}
// ---- component reference (tiles, leviathans, expansion pieces, board)
const TW_EX={gate:`<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="#6d3fd0" stroke="#e3b24b" stroke-width="4"/><circle cx="24" cy="24" r="7" fill="#c9b3ff"/></svg>`,wave:`<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#1e4aa0"/><path d="M6 30q6-10 12 0t12 0t12 0M6 20q6-10 12 0t12 0t12 0" fill="none" stroke="#ffe9a8" stroke-width="4" stroke-linecap="round"/></svg>`,mael:`<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#14606b"/><path d="M24 24m0-4a4 4 0 1 1-4 4a9 9 0 1 1 9 9a14 14 0 1 1-14-14" fill="none" stroke="#bff" stroke-width="3" stroke-linecap="round"/></svg>`,cannon:`<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#3a3f46"/><rect x="8" y="18" width="26" height="10" rx="5" fill="#14171a" transform="rotate(-18 24 24)"/><circle cx="18" cy="34" r="6" fill="#7a5a14"/><circle cx="38" cy="16" r="3" fill="#ffb347"/></svg>`};
const TW_MARK={start:`<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#14606b"/><path d="M4 44h40" stroke="#e3b24b" stroke-width="5"/><circle cx="16" cy="38" r="5" fill="#e3b24b"/><circle cx="32" cy="38" r="5" fill="#e3b24b"/><text x="24" y="22" text-anchor="middle" font-size="16" font-weight="700" fill="#ffe9a8" font-family="Georgia,serif">3</text></svg>`,
 route:`<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#14606b"/><path d="M8 42C8 24 40 26 40 8" fill="none" stroke="#e3b24b" stroke-width="5" stroke-linecap="round"/><path d="M40 8v-4l6 3z" fill="#fff"/></svg>`,
 frame:`<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#0f4f5b"/><rect x="8" y="8" width="32" height="32" rx="4" fill="none" stroke="#5fe1d6" stroke-width="4"/></svg>`};
function junkSVG(){return `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#14606b"/>${[0,1,2,3].map(i=>`<path d="M${7+i*9} 30l4-14 4 14z" fill="${COL[i].sail}" stroke="#fff" stroke-width="1"/>`).join('')}<path d="M5 32h38l-4 6H9z" fill="#5a3a1e"/></svg>`}
function diceSVG(){return `<svg viewBox="0 0 48 48"><rect x="3" y="12" width="20" height="20" rx="4" fill="#e3b24b"/><rect x="25" y="16" width="20" height="20" rx="4" fill="#3c7bd0"/><circle cx="9" cy="18" r="2" fill="#14232b"/><circle cx="17" cy="26" r="2" fill="#14232b"/><circle cx="35" cy="26" r="2" fill="#fff"/></svg>`}
function refPic(it,big){const p=it.pic||{},px=big?168:52;
  try{if(p.cur!=null)return TWKit.cardURL(BASE_PATHS[p.cur],{uid:(big?'rb':'rs')+p.cur,size:px});if(p.lev!=null)return TWKit.leviathanURL(levArrows(p.lev),{uid:(big?'lb':'ls')+p.lev,size:px})}catch(e){return null}
  if(p.ex)return TW_EX[p.ex];if(p.mark)return TW_MARK[p.mark];if(p.junk)return junkSVG();if(p.dice)return diceSVG();return null}
function refInGame(it){if(!G)return true;const id=it.id,E=G.exp||{};
  if(id==='gate')return !!E.rift;if(id==='wave')return !!E.wave;if(id==='mael')return !!E.maelstrom;if(id==='cannon')return !!E.cannon;
  if(/^lev/.test(id))return !G.noMon;return true}
function kitReference(){GX.reference(TWRef.sections({BASE_PATHS,EXTRA_TYPES,LEV,SHIP_NAMES:COL.map(c=>c.name)}),{title:'Tiles & pieces',label:'Pieces',picture:refPic,inGame:refInGame,before:'[data-gx="setd"]',search:'Search tiles, leviathans, pieces'})}
// ---- take-back: a snapshot before each move of the only human in a local game (the old "Rewind to my last move", now any time)
function kitUndo(){GX.undo.config({get:()=>G,owner:()=>0,online:()=>NET.on,max:20,
  set:g=>{UI.gen++;clearTimeout(UI.tm);kitReset();G=g;UI.sel=null;UI.hint=false;UI.busy=false;UI.pause=false;UI.overSeen=0;UI.resultDone=false;UI.sunk=[];UI.marks=[];UI.sunkSeen={};UI.mph=null;UI.lastKey='';UI.qKey=null;UI.curTurn=null;UI.res=null;UI.holder=humans().length===1?humans()[0]:-1;UI.rcN=G.logN;GX.recap.mark(UI.holder);
    kitSync();SND.mood='calm';try{sndLoop('sea_loop',true);if(SND.gesture)musicStart()}catch(e){}saveAll();render();schedule()},
  onChange:can=>{if(GX.open==='setd')GX.renderSettings()}})}
// ---- "since your turn" strip: new log lines are pushed when a replay has finished (render), marked when a human decides
function kitRecap(){GX.recap.attach('#dockbody',{before:true,title:'Since your turn'})}
function recapReset(){GX.recap.clear();const hs=NET.on?(NET.mySeat>=0?[NET.mySeat]:[]):humans();GX.recap.seats(hs.length?hs:[0]);UI.rcN=G?G.logN:0;UI.rcFrom=null}
function recapSync(){if(!G||UI.busy)return;if(UI.rcN==null||UI.rcN>G.logN)UI.rcN=G.logN;
  if(G.logN>UI.rcN){const ls=G.log.filter(l=>l.i>UI.rcN).reverse().map(l=>l.t);UI.rcN=G.logN;const from=UI.rcFrom;UI.rcFrom=null;GX.recap.push(ls,from==null?-1:from)}
  const v=viewSeat();if(v>=0)GX.recap.view(v)}
// called from act() for a human decision made on this device
function recapMine(seat){recapSync();UI.rcFrom=seat;GX.recap.mark(seat)}
// ---- results, statistics, achievements (once per game over)
function kitResult(){if(!G||!G.over||UI.resultDone)return;UI.resultDone=true;UI.earned=null;
  const hs=NET.on?(NET.mySeat>=0?[NET.mySeat]:[]):humans();if(!hs.length)return; // watching computers: not your game
  const me=NET.on?NET.mySeat:hs.length===1?hs[0]:-1;const w=G.over.win||[];
  const mode=NET.on?'online':UI.guided?'guided':hs.length>1?'hot':(G.variant==='solo'||G.variant==='easysolo')?'solo':'vs';
  const seats=G.seats.map((s,i)=>({name:nm(i),ai:s.human?null:(s.lv||'normal'),me:i===me}));
  const lv=G.seats.filter(s=>!s.human).map(s=>s.lv);const top=lv.includes('hard')?'hard':lv.includes('normal')?'normal':lv.length?'easy':null;
  const E=G.exp||{};const exp=['rift','wave','maelstrom','cannon'].filter(k=>E[k]).length;
  try{const r=GNS.result({game:GAME_ID,mode,level:mode==='solo'?G.variant:top,seats,winner:w.length?w:-1,turns:G.turn,ms:UI.t0?Date.now()-UI.t0:0,
      extra:{variant:G.variant||'std',exp,hard:lv.filter(x=>x==='hard').length,afloat:G.ships.filter(s=>s.alive).length}});
    if(r&&r.earned.length){UI.earned=r.earned.map(a=>a.name);GX.buzz([30,60,30])}}catch(e){}}
function earnedHTML(){return UI.earned&&UI.earned.length?`<p class="achv">New achievement${UI.earned.length>1?'s':''}: ${UI.earned.map(esc).join(', ')}</p>`:''}
// ---- a new game or a loaded one: fresh take-back, recap and clock
function kitNewGame(){GX.undo.clear();recapReset();UI.t0=Date.now();UI.resultDone=false;UI.earned=null;twGameSpeed()}
// ---- boot (called at the end of boot() in part 5)
function kitBoot(){
  const st=lsGet('tw_set',{});UI.turbo=!!st.turbo;UI.wakeTap=!!st.wakeTap;
  // settings saved before the shared menu (speed 0.5-5, animations on/off) keep working until the player picks a new speed
  if(st.speed!=null||st.anim!=null)UI.legacy={speed:st.speed,anim:st.anim};
  kitReference();kitSettings();kitUndo();kitRecap(); // reference first: its bar button is only added while no other [data-gx=gx-refd] exists
  GNS.achievements(GAME_ID,ACH);twSpeed();
  GX.onPref(k=>{if(k==='anim'&&UI.legacy){UI.legacy=null;saveSettings()}if(k==='ai'||k==='anim'||k==='reduce'||typeof k==='object')twSpeed();if(k==='master'||typeof k==='object')sndMaster();if((k==='cb'||k==='text')&&G&&UI.started){OV.sig='';render()}});
  sndMaster();GX.offline({sw:'../sw.js',scope:'../'})}
// the code-made sounds (used when a sample is missing) follow the shared master volume too
function sndMaster(){try{SND.vol=.7*(+GX.pref('master'));if(SND.master)SND.master.gain.value=SND.on?SND.vol:0}catch(e){}}
document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('[data-a]');if(!t||t.disabled)return;const a=t.dataset.a;
  if(a==='refitem'){phClose&&phClose();GX.refOpen(t.dataset.id)}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!GX.open&&GX.undo.can()&&G&&UI.started){e.preventDefault();rewindLast()}});
// ---- title card: the long setup form now sits behind "Change the setup" (audit: the start screen was a form)
function setupLine(s){const solo=s.variant==='solo'||s.variant==='easysolo';const n=solo?1:teamN(s);const mode=modeOf(s);const seats=s.seats.slice(0,n);
  const ai=seats.filter(x=>!x.h),lv=[...new Set(ai.map(x=>x.lv))];const ex=['rift','wave','maelstrom','cannon'].filter(k=>s.exp[k]).length;
  const who=solo?(mode==='watch'?'A computer captain sails alone':'You sail alone'):mode==='me'?`You vs ${ai.length} computer captain${ai.length>1?'s':''} (${lv.join(', ')})`:mode==='hot'?`${n} captains on this device${ai.length?', '+ai.length+' of them computers':''}`:`${n} computer captains (you watch)`;
  const v={solo:'Solo',easysolo:'Easy solo',teams:'Teams'}[s.variant]||'Standard';
  return `${who} · ${v}${s.noMon?' · calm seas':''} · ${ex?ex+' expansion piece'+(ex>1?'s':''):'no expansions'}`}
function titleHTML(){const s=UI.setup=UI.setup||defaultSetup();const cont=savedGame();
  return `<div class="stin ttl"><h1><svg class="ico" viewBox="0 0 24 24" style="width:44px;height:44px;stroke:#e3b24b"><path d="M3 17c3 2 6 2 9 0s6-2 9 0M12 3v11M12 4l6 7h-6M12 6l-5 6h5"/></svg>Tidewake</h1><p class="tag">Lay currents, steer your junk, outlast the leviathans.</p>
  <div class="stcard tmenu">
   ${cont?'<button class="btn pri big" data-a="cont">Continue saved game</button>':''}
   <button class="btn${cont?'':' pri'} big" data-a="guided">Guided first game<small>One idea at a time, against an easy computer</small></button>
   <button class="btn big" data-a="start" id="quickgo">Play<small>${esc(setupLine(s))}</small></button>
   ${onlineBlock()}
   <div class="row"><button class="btn" data-a="cfg" id="cfgbtn">Change the setup…</button><button class="btn" data-gx="rulesd">How to play</button><button class="btn" data-gx="gx-refd">Pieces</button><button class="btn" data-gx="setd">Menu</button></div>
  </div></div>`}
document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('[data-a]');if(!t||t.disabled)return;const a=t.dataset.a;
  if(a==='cfg'){UI.cfgOpen=true;renderStart();const st=$('#start');if(st)st.scrollTop=0}
  else if(a==='cfgback'){UI.cfgOpen=false;renderStart()}
  else if(a==='tonl'){UI.cfgOpen=true;UI.onl=true;renderStart();const o=$('#onl');if(o){o.open=true;try{o.scrollIntoView({block:'start'})}catch(e){}}}});
// ---- phones: a captains strip under the controls (the bottom half of a tall phone was empty)
function phCrewHTML(){if(!G||!UI.started||G.phase==='over'&&false)return '';const now=UI.busy&&UI.curTurn!=null?UI.curTurn:sideToAct();const me=viewSeat();
  const ord=G.order.concat(G.seats.map((_,i)=>i).filter(i=>G.order.indexOf(i)<0));
  return `<div class="ps-crew" aria-label="Captains">${ord.map(i=>{const s=G.ships[i];return `<span class="pc-c${i===now&&!G.over?' now':''}${s.alive?'':' out'}">${dot(i)}<b>${i===me?'You':esc(nm(i))}</b><small>${s.alive?G.hands[i].length+' tile'+(G.hands[i].length===1?'':'s'):'sunk'}</small></span>`}).join('')}</div>`}
