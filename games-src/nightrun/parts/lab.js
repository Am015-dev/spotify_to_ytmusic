/* ---------- LAB: its own stage (title > LAB, settings > OPEN LAB, or ?lab=1) ----------
   The LAB is a real run with G.lab set: no waves, no district clock, no boss timer, no chest or pit stop, god mode on. What appears is decided by the panel at the bottom:
   BOSS (gallery: pick any boss and its district, replay the intro, lock a phase, force an attack pattern, hold any pose of its sprite sheet, hit flash, death + respawn),
   FOES (one enemy at a time), ITEMS (pickups and power-ups), CHEATS (the old test switches: stages, difficulty, god mode, Neon, garage).
   The panel is a DOM overlay (#labP); nothing of it lives in the normal game loop, and the canvas keeps drawing the real game underneath. */
const LAB_B=[
  {n:'ADLER',art:'sek-adler',o:{k:0,nm:'SEK-ADLER'},home:0},
  {n:'KRAKE',art:'flusskrake',o:{k:1,nm:'FLUSSKRAKE'},home:1},
  {n:'ICE',art:'zentral-ice',o:{k:2,nm:'ZENTRAL-ICE'},home:2},
  {n:'KRONOS',art:'kronos',o:{k:3,nm:'KRONOS'},home:3},
  {n:'TRESOR',art:'tresor-wart',o:{k:5,nm:'TRESOR-WART',r:38,pats:['laser','fan5','ring','laser'],lbl:'T',mini:true},home:0},
  {n:'BRÜCKE',art:'bruecken-waechter',o:{mini:true,...MINIS[0]},home:1},
  {n:'SCHRANKE',art:'schranken-wart',o:{mini:true,...MINIS[1]},home:2},
  {n:'MESSE',art:'messe-waechter',o:{k:4,nm:'MESSE-WÄCHTER',r:42,pats:['fan7','ring','spiral','fan9'],lbl:'M',mini:true},home:3},
  {n:'HOPLITE',art:'hoplite',o:{mini:true,...MINIS[2]},home:4},
  {n:'TALOS',art:'talos',o:{k:6,nm:'TALOS'},home:4}];
const LAB_D=['BANK','MAIN','OSTEND','MESSE','ATHEN'];
const LAB_PATS=['fan5','fan7','fan9','ring','spiral','laser','summon'];
const LAB_POSE=[['IDLE 1',0,0],['IDLE 2',0,1],['IDLE 3',0,2],['IDLE 4',0,3],['WIND-UP',1,0],['CHARGE',1,1],['FIRE',1,2],['RECOVER',1,3]];
const LAB={tab:'boss',bi:0,di:0,phase:0,pat:null,pose:null,hp:true,auto:true,kill:false,god0:null,starting:false,min:false,note:'',noteT:0,items:[]};
labEl=document.createElement('div');labEl.id='labP';labEl.hidden=true;stage.appendChild(labEl);
{const st=document.createElement('style');st.textContent=`
#labP{position:absolute;left:0;right:0;bottom:0;z-index:4;max-height:min(46%,264px);overflow:hidden;display:flex;flex-direction:column;background:#07040f;border-top:1px solid #3a2b5c;font-family:var(--mono);color:var(--ink);touch-action:pan-y}
#labP .lbar{display:flex;align-items:center;gap:6px;padding:4px 8px;flex:0 0 auto;min-width:0}
#labP .ltabs{display:flex;gap:4px;flex:0 0 auto}
#labP .linfo{flex:1 1 0;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;color:var(--amber);text-align:right}
#labP .lbody{min-height:0;overflow-y:auto;overflow-x:hidden;padding:2px 8px 8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:6px 16px;touch-action:pan-y;-webkit-overflow-scrolling:touch}
#labP.min .lbody{display:none}
#labP .ls{min-width:0}
#labP .lt{display:block;font-size:11px;letter-spacing:.12em;color:var(--dim);margin:0 0 2px}
#labP .lr{display:flex;flex-wrap:wrap;gap:4px;align-items:flex-start}
#labP .lr.sc{flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;padding-bottom:3px;touch-action:pan-x}
#labP .lc{min-height:36px;min-width:36px;padding:0 10px;font:700 12px var(--mono);letter-spacing:.04em;color:var(--ink);background:#140c26;border:1px solid #3a2b5c;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;gap:5px;flex:0 0 auto;white-space:nowrap;cursor:pointer}
html.touch #labP .lc{min-height:40px}
#labP .lc.on{background:var(--cyan);color:var(--void);border-color:var(--cyan)}
#labP .lc.tab{min-height:34px}
#labP .lc.x{border-color:var(--pink);color:var(--pink)}
#labP .lc.hot{background:var(--pink);border-color:var(--pink);color:var(--void)}
#labP .lc:disabled{opacity:.35;cursor:default}
#labP .lc.lb{flex-direction:column;gap:1px;padding:3px 5px;min-height:58px;font-size:11px}
#labP .lc.lb img{width:34px;height:34px;object-fit:cover;border-radius:4px;display:block}
#labP .lc.ps{flex-direction:column;gap:1px;padding:3px 4px;min-height:58px;font-size:11px;min-width:52px}
#labP .lc.ps i{display:block;height:36px;background-repeat:no-repeat;background-color:#0a0612;border-radius:3px;image-rendering:auto}
#labP .lc .db{width:1.5em;height:1.5em}
@media (max-width:620px){#labP .lbar{flex-wrap:wrap}#labP .linfo{order:9;flex:1 1 100%;text-align:left;min-height:15px}}
`;document.head.appendChild(st);}
const lel=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;};
const LABS=[];
/* a chip: fn runs on click; on/dis are polled by labSync so the state always matches the game */
function lchip(host,label,fn,o){o=o||{};const b=lel('button','lc'+(o.cls?' '+o.cls:''));b.type='button';if(o.html)b.innerHTML=o.html;else b.textContent=label;if(o.aria)b.setAttribute('aria-label',o.aria);
  b.addEventListener('click',()=>{fn(b);labSync();});host.append(b);LABS.push({b,o,label});return b;}
function lsec(body,title,cls){const s=lel('div','ls'),t=lel('span','lt',title),r=lel('div','lr'+(cls?' '+cls:''));s.append(t,r);body.append(s);return r;}
function labNote(t){LAB.note=t;LAB.noteT=2.4;labInfo();}
function labInfo(){const el=$('labInfo');if(!el)return;let s=LAB.note&&LAB.noteT>0?LAB.note:'';
  if(!s&&G&&G.lab){const e=G.boss;if(LAB.tab==='boss')s=e?`${e.nm} · PHASE ${e.ph}${LAB.pat?' · '+LAB.pat:''}${e.x>bossX()?' · ENTERS':e.fireT>0?' · FIRE':e.arm?' · WIND-UP':''}`:'NO BOSS · tap one';else s=`${G.en.length} foes · ${G.pk.length} items`;}
  if(el.textContent!==s)el.textContent=s;}
function labSync(){const live=running&&G&&G.lab;for(const {b,o} of LABS){const on=o.on?!!o.on():false;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');
    if(o.text)b.textContent=o.text(on);b.disabled=o.dis?!!o.dis(live):false;}
  for(const t of ['boss','foes','items','cheats']){const b=$('labTab_'+t);if(b)b.classList.toggle('on',LAB.tab===t);}labInfo();}
/* ----- bosses ----- */
const labBoss=()=>G&&G.lab&&G.boss&&!G.boss.dead?G.boss:null;
function labSpawn(){if(!running||!G||!G.lab)return;const B=LAB_B[LAB.bi];G.en=[];G.eb=[];G.pb=[];G.boss=null;G.bossDone=false;G.transT=-1;G.force=false;G.delayed=[];
  if(G.di!==LAB.di)enterDistrict(LAB.di);
  LAB.kill=false;const o=B.o,D2=o.mini?null:DISTRICTS.find(d=>d.boss===o.k);const e=spawnBoss(D2?{...o,sub:D2.bossSub}:o);
  e.lists0=e.lists;e.mb0=e.minBar;labApply();labPoseRow();labSync();}
function labApply(){const e=labBoss();if(!e)return;
  e.lists=LAB.pat?[[LAB.pat],[LAB.pat],[LAB.pat]]:e.lists0;if(LAB.pat){e.pi=0;e.pc=-2;e.cnt=0;e.arm=false;}
  e.labPose=LAB.pose;}
function labPhase(n){LAB.phase=n;const e=labBoss();if(!e||!n)return;e.bt=n===1?0:(n===2?e.p2:e.p3)*4-1;}   // the next beat moves the boss into that phase (banner, repair drop and all)
NR.on('beat',()=>{const e=labBoss();if(!e||!LAB.phase)return;const n=LAB.phase,lo=n===1?0:(n===2?e.p2:e.p3)*4,hi=n===1?e.p2*4-1:n===2?e.p3*4-1:1e9;e.bt=Math.min(Math.max(e.bt,lo-1),hi-1);});   // a locked phase stays locked
NR.on('tick',dt=>{if(!G||!G.lab)return;if(LAB.noteT>0)LAB.noteT-=dt;const e=labBoss();
  if(e&&LAB.hp&&!LAB.kill){e.hp=e.max;e.minBar=1e9;}else if(e&&e.minBar>=1e9&&e.mb0!=null)e.minBar=e.mb0;                    // HP LOCK: the boss cannot fall while you study it
  if(e&&e.labPose!==LAB.pose)e.labPose=LAB.pose;
  if((G.frameLab=(G.frameLab||0)+1)%12===0)labInfo();});
{const _bd=bossDown;bossDown=function(e){_bd(e);if(!G.lab)return;G.transT=-1;G.bossDone=false;LAB.kill=false;G.boss=null;       // death played: back to the gallery, no pit stop
    if(LAB.auto)G.delayed.push({t:3.6,f:labSpawn});labSync();};}
function labDeath(){const e=labBoss();if(!e||e.x>bossX())return;LAB.kill=true;e.floor=0;e.minBar=0;e.hp=0;}
function labPoseRow(){const host=$('labPoseR');if(!host)return;host.textContent='';const B=LAB_B[LAB.bi],A=UIK.boss[B.art];
  const auto=lchip(host,'AUTO',()=>{LAB.pose=null;labApply();},{on:()=>!LAB.pose});
  if(!A)return;const k=36/A.ch,sh=ART.bm['anim-boss-'+B.art],rows=A.atk?2:1;
  for(const [nm,row,col] of LAB_POSE){if(row>=rows||col>=(row?4:A.idle||4))continue;
    const b=lchip(host,nm,()=>{LAB.pose=[row,col];labApply();},{on:()=>!!LAB.pose&&LAB.pose[0]===row&&LAB.pose[1]===col,cls:'ps',html:`<i style="width:${Math.round(A.cw*k)}px;background-image:url(media/anim-boss-${B.art}.webp);background-size:${Math.round(A.cw*4*k)}px ${Math.round(A.ch*rows*k)}px;background-position:-${Math.round(col*A.cw*k)}px -${Math.round(row*A.ch*k)}px"></i>${nm}`,aria:'Pose '+nm});}}
function labBuildBoss(body){
  const r1=lsec(body,'BOSS','sc');LAB_B.forEach((B,i)=>lchip(r1,B.n,()=>{LAB.bi=i;LAB.di=B.home;LAB.phase=0;LAB.pat=null;LAB.pose=null;labSpawn();},{cls:'lb',html:`<img src="media/boss-${B.art}.webp" alt="" decoding="async">${B.n}`,on:()=>LAB.bi===i,aria:'Boss '+B.n}));
  const r2=lsec(body,'DISTRICT');LAB_D.forEach((n,i)=>lchip(r2,n,()=>{LAB.di=i;labSpawn();},{on:()=>LAB.di===i}));
  lchip(r2,'▶ INTRO',()=>{labSpawn();labNote('intro');},{cls:'hot',aria:'Play the intro'});
  const r3=lsec(body,'PHASE');lchip(r3,'AUTO',()=>{LAB.phase=0;},{on:()=>!LAB.phase});[1,2,3].forEach(n=>lchip(r3,'PHASE '+n,()=>labPhase(n),{on:()=>LAB.phase===n}));
  const r4=lsec(body,'ATTACK');lchip(r4,'AUTO',()=>{LAB.pat=null;labApply();},{on:()=>!LAB.pat});LAB_PATS.forEach(p=>lchip(r4,p.toUpperCase(),()=>{LAB.pat=p;labApply();},{on:()=>LAB.pat===p}));
  const r5=lsec(body,'POSE','sc');r5.id='labPoseR';
  const r6=lsec(body,'ACTION');
  lchip(r6,'HIT',()=>{const e=labBoss();if(e)e.flash=.3;},{dis:()=>!labBoss()});
  lchip(r6,'DEATH',()=>labDeath(),{cls:'x',dis:()=>!labBoss()});
  lchip(r6,'RESPAWN',()=>labSpawn());
  lchip(r6,'HP LOCK',()=>{LAB.hp=!LAB.hp;},{on:()=>LAB.hp});
  lchip(r6,'AUTO RESPAWN',()=>{LAB.auto=!LAB.auto;},{on:()=>LAB.auto});
  lchip(r6,'CLEAR SHOTS',()=>{G.eb=[];const e=labBoss();if(e)e.lasers=[];});}
/* ----- foes and items ----- */
const labFoe=(f)=>()=>{if(!running||!G.lab)return;G.en=G.en.filter(e=>e.type==='boss');G.eb=[];const y=H/2;f(y);labNote('spawned');};
function labBuildFoes(body){const r=lsec(body,'ENEMY (one at a time)');
  const F=[['DRONE',y=>en('drone',{x:W-90,y,amp:0})],['SINE DRONE',y=>en('drone',{x:W-90,y,amp:70,ph:0})],['TURRET',y=>en('turret',{x:W-90,y,stop:W-250})],['CHARGER',y=>en('charger',{x:W-90,y})],
    ['GUNSHIP',y=>en('gunship',{x:W-90,y})],['GATE',y=>en('gate',{x:W-90,gy:y,gap:130})],['FLANK',y=>en('flank',{x:W-260,y:-22,ty:y,side:-1,t:0})],
    ['SWARM',y=>{for(let i=0;i<8;i++)en('swarm',{x:W-60+i*34,y,by:y,amp:50,ph:i*.55});}],['MINE',y=>en('mine',{x:W-90,y,by:y,ph:0})],
    ['ELITE',y=>{const e=en('drone',{x:W-90,y,amp:0});e.el=1;e.hp=e.max=e.hp*2;e.r=Math.round(e.r*1.25);}],
    ['LEADER',y=>{const e=en('drone',{x:W-90,y,amp:0});e.ldr=1;e.lc=0;e.r=Math.round(e.r*1.35);e.hp=Math.round(e.hp*3.5);e.max=e.hp;}]];
  for(const [n,f] of F)lchip(r,n,labFoe(f));
  const a=lsec(body,'ACTION');lchip(a,'KILL ALL',()=>{for(const e of G.en)if(e.type!=='boss')e.hp=0;G.eb=[];});lchip(a,'CLEAR SHOTS',()=>{G.eb=[];});lchip(a,'FULL HULL',()=>{P.hp=P.max;});lchip(a,'+3 EMP',()=>{P.emp=Math.min(9,P.emp+3);});}
function labBuildItems(body){const r=lsec(body,'PICKUP (drifts to the ship)');
  const drop=(t,k)=>()=>{if(!running||!G.lab)return;G.pk=G.pk.filter(p=>false);const p={t,x:W-220,y:H/2,vx:-60,vy:0,bob:0};if(k)p.k=k;G.pk.push(p);labNote('dropped');};
  [['SHARD','shard'],['HULL','hp'],['UPGRADE','up'],['EMP','emp']].forEach(([n,t])=>lchip(r,n,drop(t)));
  const r2=lsec(body,'POWER-UP (pickup)');Object.keys(PWK).forEach(k=>lchip(r2,PWK[k].n,drop('pw',k)));
  const r3=lsec(body,'POWER-UP (switch on now)');Object.keys(PWK).forEach(k=>lchip(r3,PWK[k].n,()=>{if(running&&G.lab)PW.give(k,true);}));}
/* ----- cheats: the old test switches ----- */
function labBuildCheats(body){
  const tg=(host,label,fn,onFn,textFn)=>lchip(host,label,fn,{on:onFn,text:textFn});
  const s=lsec(body,'STORY');tg(s,'OPEN ALL STAGES',()=>{sSave.all=!sSave.all;sPersist();},()=>sSave.all,on=>on?'ALL STAGES OPEN: ON':'OPEN ALL STAGES');lchip(s,'RESET STORY',()=>{sSave.stars={};sSave.snap={};sSave.all=false;sPersist();});
  const d=lsec(body,'DIFFICULTY');[['easy','Easy'],['normal','Normal'],['hard','Hard'],['vhard','Very hard'],['legend','Legend']].forEach(([k,n])=>lchip(d,n,()=>{SET.diff=k;saveSet();DF=DIFFS[k];HARD=HARDS.includes(k);diffDraw();},{on:()=>SET.diff===k,html:diffBadge(k)+' '+n}));
  const p=lsec(body,'PLAYER');
  tg(p,'GOD MODE',()=>{godMode=!godMode;},()=>godMode,on=>on?'GOD MODE: ON':'GOD MODE');
  tg(p,'FPS COUNTER',()=>{SET.fpsc=!SET.fpsc;saveSet();$('fpsEl').hidden=!FPSOK();},()=>!!SET.fpsc,on=>on?'FPS COUNTER: ON':'FPS COUNTER');
  tg(p,'BOSS CHEST',()=>{save('mnr_chest',CHEST_ON()?0:1);},()=>CHEST_ON(),on=>on?'BOSS CHEST: ON':'BOSS CHEST: OFF');
  const n=lsec(body,'NEON');lchip(n,'+1,000',()=>{GA.bank+=1000;gsave();garageDirty=true;});lchip(n,'+10,000',()=>{GA.bank+=10000;gsave();garageDirty=true;});lchip(n,'SET 0',()=>{GA.bank=0;gsave();garageDirty=true;});
  const g=lsec(body,'GARAGE');
  lchip(g,'UNLOCK + MAX EVERYTHING',()=>{for(const s of SHIPS)if(s.p)GA.own['ship_'+s.id]=true;for(const c of CREW)GA.own[c.id]=true;for(const h of THEMES)if(h.p)GA.own['th_'+h.id]=true;for(const d of TP_DEF){GA.tune[d.id]=d.max;}tsave();gsave();SH.recalc();garageDirty=true;});
  lchip(g,'EQUIP BEST',()=>{GA.eq={};for(const d of TP_DEF.slice().sort((a,b)=>b.pri-a.pri).slice(0,eqSlots()))if(TP.raw(d.id))GA.eq[d.id]=true;eqsave();SH.recalc();});
  lchip(g,'EQUIP ALL (TEST)',()=>{for(const d of TP_DEF)if(TP.raw(d.id))GA.eq[d.id]=true;eqsave();SH.recalc();});
  lchip(g,'RESET GARAGE',()=>{GA.own={};GA.tune={};GA.eq={};GA.bank=0;GA.ship='std';GA.queue=[];qsave();tsave();eqsave();gsave();SH.recalc();garageDirty=true;});}
/* ----- the panel ----- */
let labBodyEl=null;
function labShow(tab){LAB.tab=tab;LABS.length=0;labEl.textContent='';
  const bar=lel('div','lbar'),tabs=lel('div','ltabs');
  for(const [t,n] of [['boss','BOSS'],['foes','FOES'],['items','ITEMS'],['cheats','CHEATS']]){const b=lchip(tabs,n,()=>labShow(t),{cls:'tab'});b.id='labTab_'+t;}
  const info=lel('div','linfo');info.id='labInfo';info.setAttribute('role','status');
  const fold=lchip(bar,'▾',()=>{LAB.min=!LAB.min;labEl.classList.toggle('min',LAB.min);fold.textContent=LAB.min?'▴':'▾';},{aria:'Fold the panel'});
  const ex=lchip(bar,'EXIT',()=>labExit(),{cls:'x',aria:'Leave the LAB'});
  bar.prepend(tabs);bar.insertBefore(info,fold);
  labBodyEl=lel('div','lbody');labEl.append(bar,labBodyEl);
  ({boss:labBuildBoss,foes:labBuildFoes,items:labBuildItems,cheats:labBuildCheats})[tab](labBodyEl);
  if(tab==='boss')labPoseRow();labSync();}
/* ----- entering and leaving ----- */
function startLab(bi){if(running)return;AU.unlock();pressed={};titleEl.hidden=true;overEl.hidden=true;pauseEl.hidden=true;setEl.hidden=true;selEl.hidden=true;
  for(const n of ART.bossN){ART.load('spr-boss-'+n);ART.load('boss-'+n);ART.load('anim-boss-'+n);}                  // every boss, sheet and portrait is fetched now: the gallery never shows a half-loaded boss
  if(bi!=null){LAB.bi=bi;LAB.di=LAB_B[bi].home;}
  LAB.god0=godMode;LAB.starting=true;newGame(false);LAB.starting=false;G.lab=true;G.live=true;running=true;paused=false;godMode=true;AU.resume();NR.music.rate=1;
  AU.startStage(stageFor(LAB.di,false));NR.emit('runStart',{lab:true});FPS.n=0;FPS.t=0;FPS.slow=0;FPS.worst=0;
  P.hp=P.max;labEl.hidden=false;labEl.classList.toggle('min',LAB.min);labShow(LAB.tab);syncUI();enterDistrict(LAB.di);labSpawn();labShow(LAB.tab);}
function labExit(){if(running&&G&&G.lab)quitToTitle();}
{const _ng=newGame;newGame=function(d){if(LAB.god0!=null&&!LAB.starting){godMode=LAB.god0;LAB.god0=null;}return _ng.apply(this,arguments);};}   // whatever way the LAB ends, god mode goes back to what it was
NR.on('runEnd',()=>{if(G&&G.lab){labEl.hidden=true;if(LAB.god0!=null){godMode=LAB.god0;LAB.god0=null;}}});
{const _su=syncUI;syncUI=function(){_su();if(G&&G.lab&&running)$('touch').hidden=true;labEl.hidden=!(running&&G&&G.lab);};}   // on a phone the LAB panel takes the place of the touch buttons; the ship follows the finger on the playfield
setTimeout(()=>{
  const tb=document.createElement('button');tb.className='go dim';tb.id='labBtn';tb.type='button';tb.textContent='LAB';$('setBtn').after(tb);tb.addEventListener('click',()=>startLab());
  const sb=document.createElement('button');sb.className='go dim';sb.id='labBtnS';sb.type='button';sb.textContent='OPEN LAB';sb.addEventListener('click',()=>{if(running)return;closeSettings();startLab();});
  const body=$('setBody');if(body)body.append(sb);
  const _os=openSettings;openSettings=function(from){_os(from);sb.hidden=from==='pause'||running;};
  {const bq=(location.search.match(/[?&]boss=([a-z-]+)/)||[])[1],bi=bq?LAB_B.findIndex(B=>B.art===bq):-1;   // ?boss=<id> (e.g. ?boss=talos): the LAB opens on that boss
    if(bi>=0)setTimeout(()=>startLab(bi),300);else if(/[?&]lab=1/.test(location.search))setTimeout(()=>startLab(),300);}},0);
