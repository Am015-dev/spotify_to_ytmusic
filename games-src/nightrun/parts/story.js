/* ---------- Nightrun Story: 12 stages in 3 acts, stage select, stars, Hard toggle for Endless ---------- */
const ALL=/[?&]all=1/.test(location.search);             // ?all=1 opens every stage (test link); a long press on the title does the same and is remembered
let HARD=HARDS.includes(SET.diff);DF=DIFFS[SET.diff]||DIFFS.normal;   // difficulty lives in the settings (Easy / Normal / Hard); the title button cycles it
const sSave=(()=>{const o=load('mnr_story',{})||{};return{stars:o.stars||{},snap:o.snap||{},all:!!o.all,v30:!!o.v30};})();
const sPersist=()=>save('mnr_story',sSave);
// difficulty knobs in one place (tuned with the bot in games-src/nightrun/story-sim.js)
const TUNE={d0:.85,dd:.125,dens0:1.15,densd:.055,xd:.12,xs:2,bsd:.085,eh:.24,el0:2,eld:.07,hd:.09,hull:Array.from({length:30},(_,i)=>i<20?6:5),lv:Array.from({length:30},(_,i)=>+(2.4+i*.3+(i>=20?.35:0)).toFixed(2)),bossHp:1.2,bossHpd:.12,miniHp:1.4,miniHpd:.12};
const BOSS_SUB={4:'Bridge sentinel, twin cannon',5:'Gate warden, laser rig'};
/* 30 stages, six per city: a run through, a hunt, a gimmick stage, the city's mini-boss, a hard convoy (squad leaders) and the boss. Levels (TUNE.lv) rise along the whole list. */
const CITYS=[
 {di:0,st:[
  ['FIRST RUN','Deliver the data. Stay alive.',{k:'survive',v:46},46,['droneLine','droneV','droneSine']],
  ['PATROL','Drones on patrol. Shoot on the beat.',{k:'kill',v:170},35,['droneLine','droneSine','chargers','droneV']],
  ['ZEIL','Shop windows and swarms.',{k:'score',v:150000},30,['droneSine','droneV','chargers','turret']],
  ['TRESOR-WART','The vault has a keeper.',{k:'mini'},24,['droneLine','turret','chargers'],{k:5,nm:'TRESOR-WART',r:38,pats:['laser','fan5','ring','laser'],lbl:'T'}],
  ['KONVOI','A squad leader. Kill it first.',{k:'kill',v:210},30,['droneV','droneSine','chargers','turret','gunship']],
  ['SEK-ADLER','Police interceptor on your tail.',{k:'boss'},19,['droneLine','droneV','turret','chargers']]]},
 {di:1,st:[
  ['RIVER ROAD','Follow the river. Chain PERFECTs.',{k:'score',v:180000},29,['droneSine','chargers','droneV','turret']],
  ['EISERNER STEG','Narrow bridge, tight lanes.',{k:'survive',v:46},30,['droneSine','chargers','gate','turret']],
  ['BRIDGE GUARD','Something guards the old bridge.',{k:'mini'},24,['droneSine','chargers','turret'],{k:4,nm:'BRÜCKEN-WÄCHTER',r:40,pats:['fan5','ring','fan7','spiral'],lbl:'B'}],
  ['ROEMER','Old town, new guns.',{k:'kill',v:240},32,['droneV','chargers','turret','gunship']],
  ['FLOTTE','Patrol boats with a leader.',{k:'survive',v:46},28,['droneSine','droneV','gunship','chargers','turret']],
  ['FLUSSKRAKE','The river fights back.',{k:'boss'},22,['droneSine','chargers','turret','gunship']]]},
 {di:2,st:[
  ['GATE RUN','Laser gates ahead. Dash through.',{k:'survive',v:46},30,['gate','droneLine','turret','gate','chargers']],
  ['FREIGHT YARD','Rails, gates and chargers.',{k:'kill',v:230},30,['gate','chargers','turret','droneSine']],
  ['GATE KEEPER','The gates have a keeper.',{k:'mini'},22,['gate','turret','chargers'],{k:5,nm:'SCHRANKEN-WART',r:38,pats:['laser','fan7','ring','laser'],lbl:'S'}],
  ['FIREWALL','Gates and gunships together.',{k:'score',v:500000},26,['gate','gunship','turret','droneSine']],
  ['CORDON','The last cordon. Leaders hold the line.',{k:'survive',v:46},26,['gate','droneV','gunship','turret','chargers']],
  ['ZENTRAL-ICE','Break the bank firewall.',{k:'boss'},22,['gate','turret','droneSine','gunship']]]},
 {di:3,st:[
  ['TRADE FAIR','Elite guards everywhere. Stay sharp.',{k:'kill',v:230},34,['droneV','chargers','turret','gunship','droneSine']],
  ['RUSH HOUR','Rack up score. Do not get hit.',{k:'score',v:800000},22,['droneV','droneSine','turret','chargers','gate','gunship']],
  ['HAMMERING MAN','The hammer keeps the beat.',{k:'survive',v:46},26,['droneV','turret','gunship','gate','chargers']],
  ['MESSE-WÄCHTER','The fair has a guardian.',{k:'mini'},22,['droneV','turret','chargers','gunship'],{k:4,nm:'MESSE-WÄCHTER',r:42,pats:['fan7','ring','spiral','fan9'],lbl:'M'}],
  ['BOARDROOM','Everything shoots. Leaders everywhere.',{k:'kill',v:260},30,['gate','gunship','turret','chargers','droneSine','droneV']],
  ['KRONOS','End the corporation. Last delivery.',{k:'boss'},20,['gate','gunship','turret','chargers','droneSine']]]},
 {di:4,st:[
  ['PLAKA NIGHTS','Rooftops and kiosks. Hold the block.',{k:'survive',v:46},30,['phalanx','droneSine','chargers','turret']],
  ['HARBOUR WATCH','Piraeus is closed. Dash the pillars.',{k:'score',v:900000},26,['pillars','wedge','turret','phalanx','gunship']],
  ['LYCABETTUS','Climb the hill under fire.',{k:'kill',v:250},28,['phalanx','wedge','turret','droneSine','gunship']],
  ['HOPLITE','The shield wall walks.',{k:'mini'},24,['phalanx','wedge','turret'],{k:7,nm:'HOPLITE',r:40,pats:['fan5','ring','fan7','spiral'],lbl:'H'}],
  ['AGORA','Phalanx and leaders. No gaps.',{k:'survive',v:46},26,['phalanx','wedge','pillars','gunship','turret']],
  ['TALOS','Bronze guardian of the harbour.',{k:'boss'},20,['phalanx','wedge','pillars','gunship','turret']]]}];
const STAGES=[];
CITYS.forEach((c,ci)=>c.st.forEach((r,k)=>{const n=STAGES.length+1,d={n,di:c.di,name:r[0],intro:r[1],goal:r[2],perf:r[3],waves:r[4],act:ci};
  if(r[2].k==='boss'||r[2].k==='mini')d.lead=r[2].k==='boss'?24:30;if(r[5])d.mini=r[5];d.song=c.di===4?(n%2?'athina':'athina2'):['stage1','stage2','stage3'][(n-1)%3];d.kit=Math.min(24,n-1);STAGES.push(d);}));
/* the story grew from 16 to 30 stages: progress saved under the old numbers moves to the same stage by name (once) */
if(!sSave.v30){const old=['FIRST RUN','PATROL','SEK-ADLER','RIVER ROAD','BRIDGE GUARD','FLUSSKRAKE','GATE RUN','GATE KEEPER','ZENTRAL-ICE','TRADE FAIR','RUSH HOUR','KRONOS','PLAKA NIGHTS','HARBOUR WATCH','HOPLITE','TALOS'],mv=k=>{const i=STAGES.findIndex(x=>x.name===old[k-1]);return i<0?null:i+1;},st={},sn={};
  for(const k in sSave.stars){const m=mv(+k);if(m)st[m]=sSave.stars[k];}for(const k in sSave.snap){const m=mv(+k);if(m)sn[m]=sSave.snap[k];}
  sSave.stars=st;sSave.snap=sn;sSave.v30=1;sPersist();}
const ACTN=['ACT I','ACT II','ACT III','ACT IV','ACT V'];
const stLen=s=>songBars(s.song);                          // stage length in bars = its song
const stK=s=>stLen(s)/46;                                 // the old goals were made for 46 bars: they scale with the length
const stKill=s=>Math.round(s.goal.v*stK(s)/10)*10,stScore=s=>Math.round(s.goal.v*stK(s)/5000)*5000,stPerf=s=>Math.round(s.perf*stK(s));
const goalTxt=s=>{const g=s.goal;return g.k==='survive'?'SURVIVE '+stLen(s)+' BARS':g.k==='kill'?'KILL '+stKill(s):g.k==='score'?'SCORE '+(stScore(s)/1000)+'K':g.k==='mini'?'MINI-BOSS':'BOSS';};
const KIT=['fr','sh','mg','wd','fr','hm','ck','dc','sh','hm','wd','ck','fr','sh','mg','wd','hm','ck','dc','sh','hm','wd','ck','fr','sh','mg','wd','hm','ck','dc'];   // what a player who jumped straight to a stage gets (about what a normal run would have bought)

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
    $('srStars').innerHTML=row(1,'Stage clear')+row(st[1],this.pn+' PERFECT · you '+G.perf)+row(st[2],'No hull lost')+medalHTML(Math.max(0,Math.min(2,st[0]+st[1]+st[2]-1)));
    $('srScore').textContent=G.score.toLocaleString('de-DE');
    $('srNext').hidden=n>=STAGES.length;$('srNext').textContent='NEXT STAGE';
    resEl.hidden=false;overlayReady=false;syncUI();AU.menuMusic();setTimeout(()=>{overlayReady=true;if(!resEl.hidden)($('srNext').hidden?$('srRetry'):$('srNext')).focus();},500);G.over=true;},
  totalStars(){let t=0;for(const k in sSave.stars)t+=sSave.stars[k]|0;return t;}};
const unlocked=n=>n===1||ALL||sSave.all||(sSave.stars[n-1]|0)>=1||Object.keys(sSave.stars).some(k=>+k>=n&&(sSave.stars[k]|0)>=1);   // a later stage cleared (older saves) opens the ones before it

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
  window.diffDraw=()=>{hb.innerHTML=(()=>{try{return diffBadge(SET.diff);}catch(e){return '';}})()+(SET.diff==='vhard'?'VERY HARD':SET.diff).toUpperCase();hb.classList.toggle('on',HARDS.includes(SET.diff));};diffDraw();
  hb.addEventListener('click',()=>{const o=['easy','normal','hard','vhard','legend'];setVal('diff',o[(o.indexOf(SET.diff)+1)%5]);});
  sb.addEventListener('click',openStages);
  // hidden: hold the title for a second to unlock every stage
  const h1=titleEl.querySelector('h1');let lp=0;h1.style.touchAction='none';
  h1.addEventListener('pointerdown',()=>{clearTimeout(lp);lp=setTimeout(()=>{sSave.all=true;sPersist();$('bestT').textContent='All stages unlocked';},1100);});
  for(const ev of['pointerup','pointercancel','pointerleave'])h1.addEventListener(ev,()=>clearTimeout(lp));
  h1.addEventListener('contextmenu',e=>e.preventDefault());}
// extra button on the stage-failed screen
{const b=document.createElement('button');b.className='go dim';b.id='stBtn2';b.type='button';b.textContent='STAGES';b.hidden=true;$('againBtn').after(b);b.addEventListener('click',openStages);}
}
