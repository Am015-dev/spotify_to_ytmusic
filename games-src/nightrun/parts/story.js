/* ---------- Nightrun Story: 12 stages in 3 acts, stage select, stars, Hard toggle for Endless ---------- */
const ALL=/[?&]all=1/.test(location.search);             // ?all=1 opens every stage (test link); a long press on the title does the same and is remembered
let HARD=SET.diff==='hard';DF=DIFFS[SET.diff]||DIFFS.normal;   // difficulty lives in the settings (Easy / Normal / Hard); the title button cycles it
const sSave=(()=>{const o=load('mnr_story',{})||{};return{stars:o.stars||{},snap:o.snap||{},all:!!o.all};})();
const sPersist=()=>save('mnr_story',sSave);
// difficulty knobs in one place (tuned with the bot in games-src/nightrun/story-sim.js)
const TUNE={d0:.8,dd:.11,dens0:1.15,densd:.055,xd:.12,xs:2,bsd:.07,eh:.2,el0:2,eld:.07,hd:.09,hull:[6,6,6,6,6,6,6,6,5,5,5,5],lv:[2.2,3.3,3.7,3.8,4.6,5.2,5.4,6.4,8.2,8.2,9,9.8],bossHp:1.2,bossHpd:.12,miniHp:1.4,miniHpd:.12};
const BOSS_SUB={4:'Bridge sentinel, twin cannon',5:'Gate warden, laser rig'};
const STAGES=[
  {n:1, di:0,name:'FIRST RUN',     intro:'Deliver the data. Stay alive.',     goal:{k:'survive',v:46},perf:46,waves:['droneLine','droneV','droneSine']},
  {n:2, di:0,name:'PATROL',        intro:'Drones on patrol. Shoot on the beat.',goal:{k:'kill',v:170},   perf:35,waves:['droneLine','droneSine','chargers','droneV']},
  {n:3, di:0,name:'SEK-ADLER',     intro:'Police interceptor on your tail.',  goal:{k:'boss'},lead:22,   perf:19,waves:['droneLine','droneV','turret','chargers']},
  {n:4, di:1,name:'RIVER ROAD',    intro:'Follow the river. Chain PERFECTs.', goal:{k:'score',v:180000},   perf:29,waves:['droneSine','chargers','droneV','turret']},
  {n:5, di:1,name:'BRIDGE GUARD',  intro:'Something guards the old bridge.',  goal:{k:'mini'},lead:24,   perf:24,waves:['droneSine','chargers','turret'],
     mini:{k:4,nm:'BRÜCKEN-WÄCHTER',r:40,pats:['fan5','ring','fan7','spiral'],lbl:'B'}},
  {n:6, di:1,name:'FLUSSKRAKE',    intro:'The river fights back.',            goal:{k:'boss'},lead:28,   perf:22,waves:['droneSine','chargers','turret','gunship']},
  {n:7, di:2,name:'GATE RUN',      intro:'Laser gates ahead. Dash through.',  goal:{k:'survive',v:46},perf:30,waves:['gate','droneLine','turret','gate','chargers']},
  {n:8, di:2,name:'GATE KEEPER',   intro:'The gates have a keeper.',          goal:{k:'mini'},lead:34,   perf:22,waves:['gate','turret','chargers'],
     mini:{k:5,nm:'SCHRANKEN-WART',r:38,pats:['laser','fan7','ring','laser'],lbl:'S'}},
  {n:9, di:2,name:'ZENTRAL-ICE',   intro:'Break the bank firewall.',          goal:{k:'boss'},lead:30,   perf:22,waves:['gate','turret','droneSine','gunship']},
  {n:10,di:3,name:'TRADE FAIR',    intro:'Elite guards everywhere. Stay sharp.',goal:{k:'kill',v:230},     perf:34,waves:['droneV','chargers','turret','gunship','droneSine']},
  {n:11,di:3,name:'RUSH HOUR',     intro:'Rack up score. Do not get hit.',    goal:{k:'score',v:800000},   perf:22,waves:['droneV','droneSine','turret','chargers','gate','gunship']},
  {n:12,di:3,name:'KRONOS',        intro:'End the corporation. Last delivery.',goal:{k:'boss'},lead:28,   perf:20,waves:['gate','gunship','turret','chargers','droneSine']}];
for(const s of STAGES){s.song=['stage1','stage2','stage3'][(s.n-1)%3];s.act=Math.floor((s.n-1)/4);}
const ACTN=['ACT I','ACT II','ACT III'];
const stLen=s=>songBars(s.song);                          // stage length in bars = its song
const stK=s=>stLen(s)/46;                                 // the old goals were made for 46 bars: they scale with the length
const stKill=s=>Math.round(s.goal.v*stK(s)/10)*10,stScore=s=>Math.round(s.goal.v*stK(s)/5000)*5000,stPerf=s=>Math.round(s.perf*stK(s));
const goalTxt=s=>{const g=s.goal;return g.k==='survive'?'SURVIVE '+stLen(s)+' BARS':g.k==='kill'?'KILL '+stKill(s):g.k==='score'?'SCORE '+(stScore(s)/1000)+'K':g.k==='mini'?'MINI-BOSS':'BOSS';};
const KIT=['fr','sh','mg','wd','fr','hm','ck','dc','sh','hm','wd','ck'];   // what a player who jumped straight to a stage gets (about what a normal run would have bought)

const ST={on:false,n:1,def:STAGES[0],lvl:0,len:66,lead:30,kv:170,sv:180000,pn:20,dk:1,d:1,d0:1,dens:1,x:0,bs:1,eh:1,el:0,heal:1,hp0:5,hits:0,over:false,spawned:false,fin:false,cT:0,stars:[1,0,0],
  setLevel(n){this.n=n;this.def=STAGES[n-1];const L=this.lvl=TUNE.lv[n-1];
    this.d0=TUNE.d0+TUNE.dd*L;this.d=this.d0*.8;this.dens=Math.max(.5,TUNE.dens0-TUNE.densd*L);this.x=Math.max(0,Math.min(2,(L-TUNE.xs)*TUNE.xd));this.bs=1+TUNE.bsd*L;this.eh=1+TUNE.eh*L;
    this.el=L<TUNE.el0?0:Math.min(.6,TUNE.eld*(L-TUNE.el0+1));this.heal=Math.max(.15,1-TUNE.hd*L);this.hp0=TUNE.hull[n-1];
    this.hits=0;this.over=false;this.spawned=false;this.fin=false;this.pre=false;this.cT=0;
    const df=this.def;this.len=stLen(df);this.kv=stKill(df);this.sv=stScore(df);this.pn=stPerf(df);   // stage = song length; boss in its last 32 bars (mini-boss: 14)
    this.lead=df.goal.k==='boss'?Math.max(20,this.len-BOSS_BARS):df.goal.k==='mini'?Math.max(20,this.len-MINI_BARS):0;
    this.dk=TUNE2.stDk;},
  kit(n){const k=Math.floor((n-1)*.8),got={};for(let i=0;i<k;i++){const id=KIT[i];got[id]=(got[id]||0)+1;}return got;},
  snapFor(n){const sn=sSave.snap[n];return sn?Object.assign({},sn):this.kit(n);},
  // the new run has just been created: put this stage's district, hull and upgrades in place
  begin(){const D=DISTRICTS[this.def.di];G.di=this.def.di;G.pos=posOf(G.di);G.dt=0;G.d0=G.bc;DIR.plan(this.def.song);G.boss=null;G.bossDone=false;G.waveT=2.4;G.waveWait=false;G.preload=true;bgFor(G.di);AU.root=D.root;AU.boss=false;
    P.max=Math.max(5,this.hp0);P.hp=this.hp0;banner(this.n+' · '+this.def.name,this.def.intro,false,3.4);},
  carry(){const got=this.snapFor(this.n);for(const id in got)for(let i=0;i<got[id];i++)SH.add(id);},
  frac(){const g=this.def.goal,tf=G.dbar/this.len;let f=0;
    if(g.k==='survive')f=tf;else if(g.k==='kill')f=Math.min(G.kills/this.kv,tf);else if(g.k==='score')f=Math.min(G.score/this.sv,tf);else f=G.boss||this.spawned?1:G.dbar/this.lead;
    return clamp(f,0,1);},
  label(){const g=this.def.goal;
    if(g.k==='survive')return Math.min(this.len,Math.floor(G.dbar))+' / '+this.len+' BARS';
    if(g.k==='kill')return Math.min(this.kv,G.kills)+' / '+this.kv+' KILLS';
    if(g.k==='score')return 'SCORE '+Math.min(this.sv,G.score).toLocaleString('de-DE')+' / '+this.sv.toLocaleString('de-DE');
    return G.boss?(g.k==='mini'?'MINI-BOSS':'BOSS'):this.over?'CLEAR':'→ '+(g.k==='mini'?this.def.mini.nm:DISTRICTS[this.def.di].bossName);},
  bossHp(){const k=this.def.goal.k==='mini'?this.def.mini.k:DISTRICTS[this.def.di].boss;
    return this.def.goal.k==='mini'?Math.round(300*(TUNE.miniHp+TUNE.miniHpd*this.lvl)*(HARD?1:1)):Math.round((340+110*Math.min(k,4))*(TUNE.bossHp+TUNE.bossHpd*this.lvl));},
  tick(dt){
    if(this.over){this.cT-=dt;if(this.cT<=0&&!this.fin){this.fin=true;if(this.n>=STAGES.length||!SH.live)this.finish();else SH.pit(()=>this.finish());}return;}
    if(G.dead)return;
    const g=this.def.goal;G.dt+=dt;DIR.tick(dt);const prog=clamp(G.dbar/this.len,0,1),up=G.dbar>=this.len-.5;this.d=this.d0*(.8+.3*prog);   // the ramp runs over the whole stage
    if(!this.pre&&G.t>5&&(g.k==='boss'||g.k==='mini')){this.pre=true;const k=DISTRICTS[this.def.di].boss,sg=g.k==='boss'?bossSong(k,false):null;if(sg)loadTrack(sg);}
    if(g.k==='survive'){if(up)this.clear();}
    else if(g.k==='kill'){if(G.kills>=this.kv&&up)this.clear();}
    else if(g.k==='score'){if(G.score>=this.sv&&up)this.clear();}
    else if(!this.spawned&&G.dbar>=this.lead&&(DIR.nonBoss()<=1||G.dbar>=this.lead+2)){this.spawned=true;
      if(g.k==='mini'){const m=this.def.mini;spawnBoss({mini:true,k:m.k,nm:m.nm,sub:BOSS_SUB[m.k],r:m.r,pats:m.pats,lbl:m.lbl,hp:this.bossHp(),score:3000,col:DISTRICTS[this.def.di].a});}
      else spawnBoss({hp:this.bossHp()});}},
  bossDown(e,pts){banner('STAGE CLEAR',(e.nm||'')+' down · +'+pts,false,3);this.clear(true);},
  clear(boss){if(this.over||G.dead)return;this.over=true;this.cT=boss?3.4:2.6;G.waveWait=false;G.eb=[];
    for(const e of G.en)if(e.type!=='boss')e.hp=0;
    this.stars=[1,G.perf>=this.pn?1:0,this.hits===0?1:0];
    if(!boss)banner('STAGE CLEAR',this.def.name,false,2.6);
    G.flash=Math.max(G.flash,.3*FX());AU.sfx('up');AU.intense(false);NR.emit('stageClear',{n:this.n});},
  fail(){running=false;NR.emit('runEnd',{story:this.n,score:G.score,di:G.di,kills:G.kills});
    $('overEyebrow').textContent='Stage '+this.n+' failed';$('oScore').textContent=G.score.toLocaleString('de-DE');$('oDist').textContent=this.n+' · '+this.def.name;$('oPerf').textContent=G.perf;
    const b=sSave.stars[this.n]||0;$('oBest').innerHTML=this.def.goal.k==='boss'||this.def.goal.k==='mini'?'Goal <strong>'+goalTxt(this.def)+'</strong>':'Goal <strong>'+goalTxt(this.def)+'</strong> · '+this.label();
    $('stBtn2').hidden=false;
    overEl.hidden=false;overlayReady=false;syncUI();AU.menuMusic();setTimeout(()=>{overlayReady=true;if(!overEl.hidden)$('againBtn').focus();},600);
    G.over=true;},
  finish(){running=false;const n=this.n,st=this.stars,sum=st[0]+st[1]+st[2];
    if(sum>(sSave.stars[n]||0))sSave.stars[n]=sum;
    if(n<STAGES.length){const got={};for(const id in SH.got)got[id]=SH.got[id];sSave.snap[n+1]=got;}
    sPersist();NR.emit('runEnd',{story:n,cleared:true,score:G.score,di:G.di,kills:G.kills});
    const s=this.def;$('srEye').textContent=n>=STAGES.length?'Story complete':ACTN[s.act]+' · Stage '+n+' clear';$('srTitle').textContent=s.name;
    const row=(ok,t)=>`<div class="sr${ok?' ok':''}"><span class="sg">${ok?'★':'☆'}</span> ${t}</div>`;
    $('srStars').innerHTML=row(1,'Stage clear')+row(st[1],this.pn+' PERFECT · you '+G.perf)+row(st[2],'No hull lost');
    $('srScore').textContent=G.score.toLocaleString('de-DE');
    $('srNext').hidden=n>=STAGES.length;$('srNext').textContent='NEXT STAGE';
    resEl.hidden=false;overlayReady=false;syncUI();AU.menuMusic();setTimeout(()=>{overlayReady=true;if(!resEl.hidden)($('srNext').hidden?$('srRetry'):$('srNext')).focus();},500);G.over=true;},
  totalStars(){let t=0;for(const k in sSave.stars)t+=sSave.stars[k]|0;return t;}};
const unlocked=n=>n===1||ALL||sSave.all||(sSave.stars[n-1]|0)>=1;

function startStory(n){if(running)return;AU.unlock();pressed={};titleEl.hidden=true;overEl.hidden=true;pauseEl.hidden=true;setEl.hidden=true;selEl.hidden=true;resEl.hidden=true;$('stBtn2').hidden=true;
  ST.setLevel(n);ST.on=true;newGame(false);ST.begin();G.live=true;running=true;paused=false;AU.resume();NR.music.rate=1;AU.startStage(ST.def.song);AU.intense(false);
  NR.emit('runStart',{daily:false,story:n});ST.carry();FPS.n=0;FPS.t=0;FPS.slow=0;FPS.worst=0;syncUI();}

let selEl,resEl;
const lockI='<svg class="lk" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10V8a6 6 0 1112 0v2h1v12H5V10zm2 0h8V8a4 4 0 10-8 0z" fill="currentColor" fill-rule="evenodd"/></svg>';
const stMsg=t=>{$('stMsg').textContent=t;clearTimeout(stMsg.h);stMsg.h=setTimeout(()=>{$('stMsg').textContent='';},1800);};
function stDraw(){$('stStars').textContent='★ '+ST.totalStars()+' / '+STAGES.length*3;const box=$('stRows');box.innerHTML='';box.classList.toggle('many',ACTN.length>3);
  for(let a=0;a<ACTN.length;a++){const row=document.createElement('div');row.className='arow';row.innerHTML='<div class="alab">'+ACTN[a]+'</div>';
    for(const s of STAGES.filter(x=>x.act===a)){const ok=unlocked(s.n),k=sSave.stars[s.n]|0,D=DISTRICTS[s.di],b=document.createElement('button');b.type='button';
      b.className='card'+(ok?'':' lock');b.dataset.id='s'+s.n;b.dataset.n=s.n;b.style.setProperty('--c',D.a);
      b.innerHTML=`<div class="hd"><span class="no">${s.n}</span>${ok?`<span class="stars">${'★'.repeat(k)}${'☆'.repeat(3-k)}</span>`:lockI}</div><div class="nm">${s.name}</div><div class="gl"><span class="ac">${ACTN[s.act]} · </span>${goalTxt(s)}</div>`;
      b.addEventListener('click',()=>{if(!unlocked(s.n)){stMsg('Clear stage '+(s.n-1)+' first');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');return;}startStory(s.n);});
      row.appendChild(b);}
    box.appendChild(row);}}
function openStages(){ST.on=false;titleEl.hidden=true;overEl.hidden=true;resEl.hidden=true;pauseEl.hidden=true;selEl.hidden=false;stDraw();}
function closeStages(){selEl.hidden=true;titleEl.hidden=false;showBest();}

function storyUI(){
/* ----- styles ----- */
{const st=document.createElement('style');st.textContent=`
#stsel .rows{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:calc(var(--u)*1.4)}
#stsel .arow{flex:1 1 0;min-height:0;display:flex;gap:calc(var(--u)*1.4);align-items:stretch}
#stsel .alab{flex:0 0 auto;writing-mode:vertical-rl;transform:rotate(180deg);align-self:center;font-family:var(--mono);letter-spacing:.2em;color:var(--dim);font-size:clamp(9px,calc(var(--u)*3),13px);white-space:nowrap}
#stsel .card{gap:calc(var(--u)*.6);padding:calc(var(--u)*.8);justify-content:space-between}
#stsel .card .hd{display:flex;align-items:baseline;justify-content:space-between;width:100%;gap:4px}
#stsel .card .no{font-weight:700;font-size:clamp(16px,calc(var(--u)*8),34px);line-height:1;color:var(--c)}
#stsel .card .stars{font-size:clamp(9px,calc(var(--u)*3.4),15px);letter-spacing:0;color:#ffe14d;white-space:nowrap}
#stsel .card .nm{font-weight:700;font-size:clamp(9px,calc(var(--u)*3.2),14px);line-height:1.05;color:var(--ink);text-align:left;width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
#stsel .card .gl{font-family:var(--mono);font-size:clamp(8px,calc(var(--u)*2.8),12px);color:var(--dim);text-align:left;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#stsel .card.lock{opacity:.5;border-style:dashed}
#stsel .card.lock .no{color:var(--dim)}
#stsel .card svg.lk{height:clamp(10px,calc(var(--u)*4),18px);width:auto;aspect-ratio:1;color:var(--dim)}
@container (max-height:300px){#stsel .card .nm{display:none}}
#stsel .card .gl .ac{display:none}
@container (max-aspect-ratio:1/1){
 #stsel .rows{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:minmax(0,1fr)}
 #stsel .arow{display:contents}
 #stsel .alab{display:none}
 #stsel .card{flex-direction:column;align-items:flex-start;justify-content:space-between;text-align:left;gap:calc(var(--u)*.6);padding:calc(var(--u)*1.4)}
 #stsel .card .gl .ac{display:inline;color:var(--c)}
 #stsel .card .nm{display:block}
 #stsel .card .no{font-size:clamp(18px,calc(var(--u)*7),34px)}
}
#stsel .rows.many .card{padding:calc(var(--u)*.7) calc(var(--u)*1.2);gap:0;justify-content:center}
#stsel .rows.many .card .no{font-size:clamp(13px,calc(var(--u)*4.4),22px)}
#stsel .rows.many .card .nm{font-size:clamp(9px,calc(var(--u)*2.7),13px)}
#stsel .rows.many .card .gl{font-size:clamp(8px,calc(var(--u)*2.3),11px)}
#stres .sr{font-family:var(--mono);font-size:clamp(13px,min(2vw,3.4vh),19px);color:var(--dim)}
#stres .sr.ok{color:var(--ink)}#stres .sr .sg{color:#ffe14d;font-size:1.25em}
#hardBtn.on{background:#ff3040;color:#fff}
`;document.head.appendChild(st);}

/* ----- stage select ----- */
selEl=document.createElement('div');selEl.id='stsel';selEl.className='ov solid pg';selEl.hidden=true;
selEl.innerHTML='<div class="top"><span class="ttl">STORY</span><span class="neon" id="stStars" style="color:#ffe14d"></span><span class="sp"></span><button class="go alt" id="stBack" type="button" style="padding:.3em 1.1em">BACK</button></div>'
  +'<div class="rows" id="stRows"></div><div class="msg" id="stMsg"></div>';
stage.appendChild(selEl);
$('stBack').addEventListener('click',closeStages);
addEventListener('keydown',e=>{if(!selEl.hidden&&e.code==='Escape')closeStages();});

/* ----- stage result ----- */
resEl=document.createElement('div');resEl.id='stres';resEl.className='ov solid';resEl.hidden=true;
resEl.innerHTML='<div class="in"><div class="eyebrow" id="srEye">Stage clear</div><h1 id="srTitle">STAGE</h1><div id="srStars"></div>'
  +'<div class="stat">Score <strong id="srScore">0</strong></div>'
  +'<div class="row"><button class="go" id="srNext" type="button">NEXT STAGE</button><button class="go dim" id="srRetry" type="button">RETRY</button><button class="go dim" id="srMenu" type="button">STAGES</button></div></div>';
stage.appendChild(resEl);
$('srNext').addEventListener('click',()=>startStory(Math.min(STAGES.length,ST.n+1)));
$('srRetry').addEventListener('click',()=>startStory(ST.n));
$('srMenu').addEventListener('click',openStages);

/* ----- title: STORY button, Hard toggle, hidden unlock-all ----- */
{const sb=document.createElement('button');sb.className='go';sb.id='storyBtn';sb.type='button';sb.textContent='STORY';
  const row=$('startBtn').parentNode,row1=document.createElement('div');row1.className='row';row.before(row1);row1.append(sb,$('startBtn'));
  $('startBtn').textContent='ENDLESS';$('startBtn').classList.add('alt');$('dailyBtn').classList.remove('alt');$('dailyBtn').classList.add('dim');
  const hb=document.createElement('button');hb.className='go dim';hb.id='diffBtn';hb.type='button';row1.append(hb);
  window.diffDraw=()=>{hb.textContent=SET.diff.toUpperCase();hb.classList.toggle('on',SET.diff==='hard');};diffDraw();
  hb.addEventListener('click',()=>{const o=['easy','normal','hard'];setVal('diff',o[(o.indexOf(SET.diff)+1)%3]);});
  sb.addEventListener('click',openStages);
  // hidden: hold the title for a second to unlock every stage
  const h1=titleEl.querySelector('h1');let lp=0;h1.style.touchAction='none';
  h1.addEventListener('pointerdown',()=>{clearTimeout(lp);lp=setTimeout(()=>{sSave.all=true;sPersist();$('bestT').textContent='All stages unlocked';},1100);});
  for(const ev of['pointerup','pointercancel','pointerleave'])h1.addEventListener(ev,()=>clearTimeout(lp));
  h1.addEventListener('contextmenu',e=>e.preventDefault());}
// extra button on the stage-failed screen
{const b=document.createElement('button');b.className='go dim';b.id='stBtn2';b.type='button';b.textContent='STAGES';b.hidden=true;$('againBtn').after(b);b.addEventListener('click',openStages);}
}
