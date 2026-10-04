// ===================== Short Fuse: shared GX kit (Menu, reference, recap, results, offline) =====================
// Loaded last (after ui.js and phone.js). Undo: every committed action in this game reveals information to the crew
// (a cut, a token, a card), so the rules allow no take-back after Snip; until then "Start again" / Cancel undo the choice.
const GAME_ID='shortfuse';
const SF_ACH=[
 {id:'first',name:'First shift',how:'Finish a job.',test:r=>true},
 {id:'guide',name:'Training wheels off',how:'Finish the guided first game.',test:r=>r.mode==='guided'},
 {id:'defuse',name:'Wire whisperer',how:'Defuse a job.',test:r=>r.won},
 {id:'clean',name:'Steady hands',how:'Defuse a job without a single miss.',test:(r,s,x)=>r.won&&x.extra&&x.extra.miss===0},
 {id:'field',name:'Field ready',how:'Defuse job 8, the last training job.',test:(r,s,x)=>r.won&&x.extra&&x.extra.job===8},
 {id:'ten',name:'Ten jobs down',how:'Defuse 10 different jobs.',test:(r,s,x)=>x.extra&&x.extra.defused>=10},
 {id:'timed',name:'Beat the clock',how:'Defuse a timed job.',test:(r,s,x)=>r.won&&x.extra&&x.extra.timed},
 {id:'box5',name:'Final season',how:'Defuse a job from box 5 (jobs 55 to 66).',test:(r,s,x)=>r.won&&x.extra&&x.extra.job>=55},
 {id:'last',name:'The last bunker',how:'Defuse job 66.',test:(r,s,x)=>r.won&&x.extra&&x.extra.job===66},
 {id:'hot',name:'Pass the pliers',how:'Finish a hot-seat job.',test:r=>r.mode==='hot'}];
// ---- Menu: the same sections as every game, with Short Fuse's own rows
const SPEEDS={slow:.5,normal:1,fast:2};
function sfSpeed(){UI.speed=lsGet('sf_vfast',false)?5:(SPEEDS[GX.pref('ai')]||1)}
function sfAnim(){try{SFKit.setSpeed(GX.reduced()||GX.pref('anim')==='off'?1000:({slow:.6,normal:1,fast:2})[GX.pref('anim')]||1)}catch(e){}}
function sb(a,label,extra){const b=document.createElement('button');b.type='button';b.className='gx-sb';b.dataset.a=a;b.textContent=label;if(extra)for(const k in extra)b.setAttribute(k,extra[k]);return b}
function kitSettings(){GX.settings({id:'setd',title:'Menu',
  game:S=>{
    if(isClient())S.appendChild(GX.row('Online',[sb('netleave','Leave the online game')]));
    else{const live=G&&!G.over&&UI.started;S.appendChild(GX.row('This job',[live?sb('pause',UI.pause?'Resume':'Pause'):null,live?sb('restart','Restart this job'):null,sb('newgame','Mission board')]));
}
  },
  sound:S=>{S.appendChild(GX.row('Sound effects',GX.onoff(SND.on,()=>{toggleSound()},'Sound effects')));S.appendChild(GX.row('Music',GX.onoff(SND.music,()=>{toggleMusic()},'Music')))},
  speed:S=>{S.appendChild(GX.row('Very fast crew',GX.onoff(!!lsGet('sf_vfast',false),v=>{lsSet('sf_vfast',v);sfSpeed()},'Very fast crew'),'For watching the computer crew play'))},
  help:S=>{
    const gxb=(id,t)=>{const b=document.createElement('button');b.type='button';b.className='gx-sb';b.dataset.gx=id;b.textContent=t;return b};
    S.appendChild(GX.row('Read',[sb('rulesopen','How to play'),sb('refopen','Cards'),gxb('logd','Log'),gxb('credd','Credits')]));
    S.appendChild(GX.row('Suggested move',GX.onoff(!!UI.help,v=>{UI.help=v;saveSettings();refresh()},'Suggested move'),'A good move and why, on every turn of yours (a digital aid, not part of the rules)'));
    S.appendChild(GX.row('Lesson tips',GX.onoff(!!UI.coach,v=>{UI.coach=v;if(v&&!UI.tut)UI.tut={done:{}};saveSettings();refresh()},'Lesson tips'),'Coach cards in the early jobs'));
  },
  graphics:S=>{const g=gfxState();const on3=window.SFKit&&SFKit._K&&SFKit._K.on;
    if(on3)S.appendChild(GX.row('Graphics',GX.seg([['auto','Auto'],['high','High'],['medium','Medium'],['low','Low']],g.pref,v=>setGfx(v),'Graphics level'),g.pref==='auto'?'Now '+g.active+'. Auto picks Low on a software graphics driver.':''));
    else S.appendChild(GX.row('Graphics','2D board','This browser has no WebGL'))},
  about:{name:'Short Fuse',version:'preview',text:'An original co-operative deduction game with a cartoon demolition crew. Names, card text and pictures are our own and drawn in code. Fonts: Lilita One and Nunito (SIL OFL). 3D: three.js (MIT). Online: Trystero (MIT). Sounds and music: CC0 (see Credits).'}})}
// ---- component reference (every wire, token, card and job, with counts)
function kitReference(){GX.reference(sfRefSections(),{title:'Wires, tokens and cards',label:'Cards',picture:sfRefPic,before:'[data-gx="setd"]',
  inGame:it=>{if(!G)return true;const p=it.pic||{};if(p.s==='Jobs')return parseInt(p.n,10)===G.mission;if(p.s==='Equipment cards')return G.eq.some(e=>EQUIP[e.id]&&EQUIP[e.id].n===p.n);if(p.s==='Crew cards')return G.seats.some(q=>{const c=SP(q.i).ch;return c&&CHARS[c]&&CHARS[c].n===p.n});return true}})}
// ---- "since your last turn" strip: every move lands in the summaries of the other people at the table
function recapSeats(){GX.recap.clear();const hs=NET.on?[NET.mySeat]:humans();GX.recap.seats(hs.length?hs:[0])}
{const _am=applyMove;applyMove=function(m,seat){const n0=G?G.logN:0;const r=_am.apply(this,arguments);
  try{if(r&&r.success&&G){const lines=G.log.filter(l=>l.i>n0&&l.c!=='turn').map(l=>nice(l.t,UI.V));GX.recap.push(lines,seat)}}catch(e){}return r}}
{const _act=act;act=function(m,seat){const s=seat==null?viewer():seat;const r=_act.apply(this,arguments);try{if(r&&r.success)GX.recap.mark(s)}catch(e){}return r}}
{const _sj=startJob;startJob=function(){UI.resDone=0;UI.earned=null;UI.t0=Date.now();const r=_sj.apply(this,arguments);try{recapSeats()}catch(e){}return r}}
{const _rs=resumeSaved;resumeSaved=function(){UI.resDone=0;UI.earned=null;UI.t0=UI.t0||Date.now();const r=_rs.apply(this,arguments);try{recapSeats()}catch(e){}return r}}
{const _rf=refresh;refresh=function(){_rf.apply(this,arguments);try{if(G&&G.over&&!UI.resDone)kitResult();GX.recap.view(viewer());const sv=!!savedGame();if(sv!==UI.svFlag){UI.svFlag=sv;GNS.saved(GAME_ID,sv)}}catch(e){}}}
// the old settings drawer is gone: the kit's Menu replaces it (re-drawing it on every refresh would reset its sliders)
renderSettings=function(){};
// ---- results, statistics, achievements
function kitResult(){UI.resDone=1;const hs=NET.on?(NET.mySeat>=0?[NET.mySeat]:[]):humans();if(!hs.length)return;
  const mode=NET.on?'online':UI.lastSetup&&UI.lastSetup.tutorial?'guided':hs.length>1?'hot':'vs';
  if(mode==='guided')lsSet('sf_guided_done',true);
  const me=hs.length===1?hs[0]:-1,win=!!G.over.win,c=camp(),defused=Object.keys(c.jobs).filter(k=>c.jobs[k].w).length;
  try{const r=GNS.result({game:GAME_ID,mode,won:win&&mode!=='hot'?true:false,winner:win?G.seats.map(q=>q.i):-1,
      seats:G.seats.map(q=>({name:q.nm,ai:q.human?null:(UI.lastSetup&&UI.lastSetup.lv)||'normal',me:q.i===me})),turns:G.turn,ms:UI.t0?Date.now()-UI.t0:0,level:UI.lastSetup&&UI.lastSetup.lv,
      extra:{job:G.mission,miss:(G.stats||{}).miss||0,left:G.dial,timed:!!UI.rt,defused}});
    if(r&&r.earned.length){UI.earned=r.earned.map(a=>a.name);GX.buzz([30,60,30]);const el=$('#main');if(el){el._h=null}renderDock(UI.V||view())}}catch(e){}}
{const _ov=overHTML;overHTML=function(V){let h=_ov.apply(this,arguments);if(UI.earned&&UI.earned.length)h=h.replace('<div class="statgrid">',`<p class="earned"><b>New achievement${UI.earned.length>1?'s':''}:</b> ${UI.earned.map(esc).join(' · ')}</p><div class="statgrid">`);return h}}
// ---- clicks for the Menu rows
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
  if(a==='refopen'){GX.close();GX.show('gx-refd')}else if(a==='rulesopen'){GX.close();GX.show('rulesd')}
  else if(a==='pause'&&GX.open==='setd')setTimeout(()=>GX.renderSettings(),0)});
// ---- boot: after ui.js's boot (it runs on DOMContentLoaded or at once)
function kitBoot(){if(kitBoot.done)return;kitBoot.done=1;
  const old=lsGet('sf_set',{});if(old.speed===5&&lsGet('sf_vfast',null)==null)lsSet('sf_vfast',true);
  kitSettings();kitReference();GX.recap.attach('#dockbody',{before:true,title:'Since your turn'});
  GNS.achievements(GAME_ID,SF_ACH);sfSpeed();sfAnim();GX.applyPrefs();
  GX.onPref(k=>{if(k==='ai'||typeof k==='object')sfSpeed();if(k==='anim'||k==='reduce'||typeof k==='object')sfAnim()});
  GX.offline({sw:'../sw.js',scope:'../'})}
window.addEventListener('resize',()=>{clearTimeout(kitBoot.rz);kitBoot.rz=setTimeout(()=>{const st=$('#start');if(st&&!st.hidden&&!isClient()&&!(document.activeElement&&st.contains(document.activeElement)&&/INPUT|SELECT/.test(document.activeElement.tagName)))renderStart()},120)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',kitBoot);else kitBoot();
