/* ---------- Nightrun Story: 12 stages in 3 acts, stage select, stars, Hard toggle for Endless ---------- */
const ALL=/[?&]all=1/.test(location.search);             // ?all=1 opens every stage (test link); a long press on the title does the same and is remembered
let HARD=HARDS.includes(SET.diff);DF=DIFFS[SET.diff]||DIFFS.normal;   // difficulty lives in the settings (Easy / Normal / Hard); the title button cycles it
const sSave=(()=>{const o=load('mnr_story',{})||{};return{stars:o.stars||{},snap:o.snap||{},all:!!o.all,v30:!!o.v30,v40:!!o.v40};})();
const sPersist=()=>save('mnr_story',sSave);
/* ===== THE TUNING TABLE: the whole difficulty curve lives here (check it with games-src/nightrun/story-sim.js, RUNS=12) =====
   LV[n-1] is the level of stage n. It drives bullet speed, enemy HP, extra waves, elite share, heal drops and boss HP (ST.setLevel).
   Stages 1-40 climb +0.2 per stage at the start and +0.3 at the end; a mini-boss or boss sits +0.2 above its neighbours and
   the next stage never drops below it (the biggest step is 0.5, into a boss). 41-45 are the optional challenge stages: the level of their district's mini-boss + 0.2.
   HULL: starting hull (7 for the first eight stages, 6 to stage 26, 5 after; challenges 6).
   lenK: level change per bar of stage length against 89 bars (66 bars +0.46, 125 bars -0.72), so a stage's length does not decide its difficulty.
   DM: per-difficulty multipliers: lv = added to the stage level, hp = enemy and boss HP. (Bullet speed, density and fire rate per difficulty live in DIFFS, b.js.) */
const LV=[1.6, 1.8, 2.0, 2.2, 2.61, 2.62, 2.83, 3.24, 3.26, 3.47, 3.7, 3.92, 4.34, 4.37, 4.6, 5.04, 5.07, 5.31, 5.55, 5.8, 6.24, 6.29, 6.54, 7.0, 7.05, 7.31, 7.57, 7.84, 8.3, 8.37, 8.64, 9.12, 9.19, 9.47, 9.75, 10.04, 10.53, 10.61, 10.91, 11.4, 2.81, 4.54, 6.44, 8.5, 10.73];
const HULL=[7, 7, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6];
const TUNE={lenK:.02,d0:.85,dd:.125,dens0:1.15,densd:.035,xd:.12,xs:2,bsd:.085,eh:.24,el0:2,eld:.07,hd:.09,hull:HULL,lv:LV,bossHp:1.2,bossHpd:.12,miniHp:1.4,miniHpd:.12,
  dm:{easy:{lv:-.8,hp:.9},normal:{lv:0,hp:1},hard:{lv:.3,hp:1.1},vhard:{lv:.5,hp:1.2},legend:{lv:.8,hp:1.3}}};
const dmOf=()=>TUNE.dm[SET.diff]||TUNE.dm.normal;
const BOSS_SUB={4:'Bridge sentinel, twin cannon',5:'Gate warden, laser rig'};
/* 40 story stages, eight per city: a run through, a hunt, a gimmick stage, a new twist, the city's mini-boss, a hard convoy (squad leaders), a pre-boss test and the boss.
   Then 5 optional CHALLENGE stages (one per city, opened by that city's mini-boss): no-hit, speed or perfect-beat. Levels (LV above) rise along the whole list.
   Row: [name, intro (8 words max), goal {k,v}, PERFECT target (for a 46-bar stage), waves, mini-boss] */
const CITYS=[
 {di:0,st:[
  ['FIRST RUN','Deliver the data. Stay alive.',{k:'survive',v:46},46,['droneLine','droneV','droneSine']],
  ['PATROL','Drones on patrol. Shoot on the beat.',{k:'kill',v:170},35,['droneLine','droneSine','chargers','droneV']],
  ['ZEIL','Shop windows and swarms.',{k:'score',v:150000},30,['droneSine','droneV','chargers','turret']],
  ['HAUPTWACHE','Guard post. Pick your lane.',{k:'survive',v:46},40,['droneLine','droneSine','droneV','chargers']],
  ['TRESOR-WART','The vault has a keeper.',{k:'mini'},24,['droneLine','turret','chargers'],{k:5,nm:'TRESOR-WART',r:38,pats:['laser','fan5','ring','laser'],lbl:'T'}],
  ['KONVOI','A squad leader. Kill it first.',{k:'kill',v:210},30,['droneV','droneSine','chargers','turret','gunship']],
  ['TAUNUS TOWER','Climb the glass. Chain PERFECTs.',{k:'score',v:220000},28,['droneV','droneSine','chargers','turret','gunship']],
  ['SEK-ADLER','Police interceptor on your tail.',{k:'boss'},19,['droneLine','droneV','turret','chargers']]]},
 {di:1,st:[
  ['RIVER ROAD','Follow the river. Chain PERFECTs.',{k:'score',v:180000},29,['droneSine','chargers','droneV','turret']],
  ['EISERNER STEG','Narrow bridge, tight lanes.',{k:'survive',v:46},30,['droneSine','chargers','gate','turret']],
  ['ROEMER','Old town, new guns.',{k:'kill',v:240},32,['droneV','chargers','turret','gunship']],
  ['FAEHRE','Ferry crossing. Hunt the patrol.',{k:'kill',v:200},30,['droneSine','droneV','chargers','turret']],
  ['BRIDGE GUARD','Something guards the old bridge.',{k:'mini'},24,['droneSine','chargers','turret'],{k:4,nm:'BRÜCKEN-WÄCHTER',r:40,pats:['fan5','ring','fan7','spiral'],lbl:'B'}],
  ['FLOTTE','Patrol boats with a leader.',{k:'survive',v:46},28,['droneSine','droneV','gunship','chargers','turret']],
  ['HAFENKRAN','Cranes swing. Score big.',{k:'score',v:380000},26,['droneSine','chargers','turret','gunship','gate']],
  ['FLUSSKRAKE','The river fights back.',{k:'boss'},22,['droneSine','chargers','turret','gunship']]]},
 {di:2,st:[
  ['GATE RUN','Laser gates ahead. Dash through.',{k:'survive',v:46},30,['gate','droneLine','turret','gate','chargers']],
  ['FREIGHT YARD','Rails, gates and chargers.',{k:'kill',v:230},30,['gate','chargers','turret','droneSine']],
  ['FIREWALL','Gates and gunships together.',{k:'score',v:500000},26,['gate','gunship','turret','droneSine']],
  ['SIGNAL BOX','Signals fail. Read the gates.',{k:'survive',v:46},28,['gate','droneLine','chargers','turret']],
  ['GATE KEEPER','The gates have a keeper.',{k:'mini'},22,['gate','turret','chargers'],{k:5,nm:'SCHRANKEN-WART',r:38,pats:['laser','fan7','ring','laser'],lbl:'S'}],
  ['CORDON','The last cordon. Leaders hold the line.',{k:'survive',v:46},26,['gate','droneV','gunship','turret','chargers']],
  ['LOADING DOCK','Crates, cranes and gunships.',{k:'kill',v:240},26,['gate','chargers','gunship','turret','droneV']],
  ['ZENTRAL-ICE','Break the bank firewall.',{k:'boss'},22,['gate','turret','droneSine','gunship']]]},
 {di:3,st:[
  ['TRADE FAIR','Elite guards everywhere. Stay sharp.',{k:'kill',v:230},34,['droneV','chargers','turret','gunship','droneSine']],
  ['RUSH HOUR','Rack up score. Do not get hit.',{k:'score',v:800000},22,['droneV','droneSine','turret','chargers','gate','gunship']],
  ['HAMMERING MAN','The hammer keeps the beat.',{k:'survive',v:46},26,['droneV','turret','gunship','gate','chargers']],
  ['EXPO HALL','Stalls, lights and snipers.',{k:'survive',v:46},26,['droneV','turret','gate','chargers','droneSine']],
  ['MESSE-WÄCHTER','The fair has a guardian.',{k:'mini'},22,['droneV','turret','chargers','gunship'],{k:4,nm:'MESSE-WÄCHTER',r:42,pats:['fan7','ring','spiral','fan9'],lbl:'M'}],
  ['BOARDROOM','Everything shoots. Leaders everywhere.',{k:'kill',v:205},30,['gate','gunship','turret','chargers','droneSine','droneV']],
  ['SKYLINE','Top floor. Do not get hit.',{k:'score',v:650000},22,['droneV','gunship','turret','gate','chargers']],
  ['KRONOS','End the corporation. Last delivery.',{k:'boss'},20,['gate','gunship','turret','chargers','droneSine']]]},
 {di:4,st:[
  ['PLAKA NIGHTS','Rooftops and kiosks. Hold the block.',{k:'survive',v:46},30,['phalanx','droneSine','chargers','turret']],
  ['HARBOUR WATCH','Piraeus is closed. Dash the pillars.',{k:'score',v:900000},26,['pillars','wedge','turret','phalanx','gunship']],
  ['LYCABETTUS','Climb the hill under fire.',{k:'kill',v:215},28,['phalanx','wedge','turret','droneSine','gunship']],
  ['ACROPOLIS','March up the sacred rock.',{k:'survive',v:46},26,['phalanx','wedge','turret','droneSine']],
  ['HOPLITE','The shield wall walks.',{k:'mini'},24,['phalanx','wedge','turret'],{k:7,nm:'HOPLITE',r:40,pats:['fan5','ring','fan7','spiral'],lbl:'H'}],
  ['AGORA','Phalanx and leaders. No gaps.',{k:'survive',v:46},26,['phalanx','wedge','pillars','gunship','turret']],
  ['OLIVE ROAD','The last road to the sea.',{k:'kill',v:190},26,['phalanx','wedge','pillars','gunship','turret']],
  ['TALOS','Bronze guardian of the harbour.',{k:'boss'},20,['phalanx','wedge','pillars','gunship','turret']]]}];
/* optional challenge stages: ch = nohit (the first hull hit ends it) | speed (reach the kills before the clock: tb = share of the stage) | perfect (finish with the PERFECT target);
   req = the stage that opens it (the city's mini-boss); s3 = the score for its third star */
const CHALL=[
 {di:0,req:5, name:'GLASS LANE',  intro:'One hit ends it. Stay clean.',  ch:'nohit',  goal:{k:'survive',v:46}, perf:30,s3:300000, waves:['droneLine','droneSine','droneV','chargers','turret']},
 {di:1,req:13,name:'FERRY SPRINT',intro:'Beat the clock. Kill fast.',     ch:'speed',  goal:{k:'kill',v:130},    perf:24,s3:250000, waves:['droneSine','droneV','chargers','turret','gunship'],tb:1.05},
 {di:2,req:21,name:'RAIL RHYTHM', intro:'Land PERFECTs. Hold the beat.',  ch:'perfect',goal:{k:'survive',v:46}, perf:28,s3:450000, waves:['gate','droneLine','chargers','turret','droneSine']},
 {di:3,req:29,name:'FAIR DASH',   intro:'Beat the clock. Kill fast.',     ch:'speed',  goal:{k:'kill',v:120},    perf:22,s3:600000, waves:['droneV','chargers','turret','gunship','gate'],tb:1.05},
 {di:4,req:37,name:'MARBLE LANE', intro:'One hit ends it. Stay clean.',  ch:'nohit',  goal:{k:'survive',v:46}, perf:26,s3:800000, waves:['phalanx','wedge','turret','droneSine','gunship']}];
const STAGES=[];
CITYS.forEach((c,ci)=>c.st.forEach((r,k)=>{const n=STAGES.length+1,d={n,di:c.di,name:r[0],intro:r[1],goal:r[2],perf:r[3],waves:r[4],act:ci,pos:k};
  if(r[2].k==='boss'||r[2].k==='mini')d.lead=r[2].k==='boss'?24:30;if(r[5])d.mini=r[5];d.song=c.di===4?(n%2?'athina':'athina2'):n<=8?['stage1','stage2'][(n-1)%2]:['stage1','stage2','stage3'][(n-1)%3];d.kit=Math.min(24,n-1);STAGES.push(d);}));
const MAIN=STAGES.length;                                  // 40 story stages; the challenge stages come after them
CHALL.forEach((c,i)=>{const n=STAGES.length+1;STAGES.push({n,di:c.di,name:c.name,intro:c.intro,goal:c.goal,perf:c.perf,waves:c.waves,act:c.di,pos:8+i,ch:c.ch,from:c.req,s3:c.s3,tb:c.tb||0,song:c.di===4?(n%2?'athina':'athina2'):['stage1','stage2','stage3'][(n-1)%3],kit:Math.min(24,c.req-1)});});
/* the story grew from 16 to 30 and then to 40 stages: progress saved under the old numbers moves to the same stage by name (once) */
if(!sSave.v40){const OLD16=['FIRST RUN','PATROL','SEK-ADLER','RIVER ROAD','BRIDGE GUARD','FLUSSKRAKE','GATE RUN','GATE KEEPER','ZENTRAL-ICE','TRADE FAIR','RUSH HOUR','KRONOS','PLAKA NIGHTS','HARBOUR WATCH','HOPLITE','TALOS'],
  OLD30=['FIRST RUN','PATROL','ZEIL','TRESOR-WART','KONVOI','SEK-ADLER','RIVER ROAD','EISERNER STEG','BRIDGE GUARD','ROEMER','FLOTTE','FLUSSKRAKE','GATE RUN','FREIGHT YARD','GATE KEEPER','FIREWALL','CORDON','ZENTRAL-ICE','TRADE FAIR','RUSH HOUR','HAMMERING MAN','MESSE-WÄCHTER','BOARDROOM','KRONOS','PLAKA NIGHTS','HARBOUR WATCH','LYCABETTUS','HOPLITE','AGORA','TALOS'],
  old=sSave.v30?OLD30:OLD16,mv=k=>{const i=STAGES.findIndex(x=>x.name===old[k-1]);return i<0?null:i+1;},st={},sn={};
  for(const k in sSave.stars){const m=mv(+k);if(m)st[m]=sSave.stars[k];}for(const k in sSave.snap){const m=mv(+k);if(m)sn[m]=sSave.snap[k];}
  sSave.stars=st;sSave.snap=sn;sSave.v30=1;sSave.v40=1;sPersist();}
const ACTN=['ACT I','ACT II','ACT III','ACT IV','ACT V'];
const stLen=s=>{const b=songBars(s.song);return s.ch?Math.round(b*.6):b;};   // stage length in bars = its song (a challenge is 60% of it)
const stK=s=>stLen(s)/46;                                 // the old goals were made for 46 bars: they scale with the length
const stKill=s=>Math.round(s.goal.v*stK(s)/10)*10,stScore=s=>Math.round(s.goal.v*stK(s)/5000)*5000,stPerf=s=>Math.round(s.perf*stK(s));
const stS3=s=>Math.round(s.s3*stK(s)/5000)*5000;
const goalTxt=s=>{const g=s.goal;return s.ch==='nohit'?'NO HIT · '+stLen(s)+' BARS':s.ch==='perfect'?'PERFECT '+stPerf(s)+' · '+stLen(s)+' BARS':s.ch==='speed'?'KILL '+stKill(s)+' IN '+Math.round(stLen(s)*s.tb)+' BARS':g.k==='survive'?'SURVIVE '+stLen(s)+' BARS':g.k==='kill'?'KILL '+stKill(s):g.k==='score'?'SCORE '+(stScore(s)/1000)+'K':g.k==='mini'?'MINI-BOSS':'BOSS';};
/* the three stars of a stage: [clear, PERFECT target, no hull lost (challenges: a score)] as plain lines */
const starTxt=s=>[s.ch?'Clear the challenge':'Clear the stage',(s.ch==='perfect'?Math.round(stPerf(s)*1.4):stPerf(s))+' PERFECT hits',s.ch?'Score '+(stS3(s)/1000)+'K':'No hull lost'];
const KIT=['fr','sh','mg','wd','fr','hm','ck','dc','sh','hm','wd','ck','fr','sh','mg','wd','hm','ck','dc','sh','hm','wd','ck','fr','sh','mg','wd','hm','ck','dc','fr','sh','mg','wd','hm','ck','dc','sh','hm','wd','ck','fr','sh','mg','wd'];   // what a player who jumped straight to a stage gets (about what a normal run would have bought)

const ST={on:false,n:1,def:STAGES[0],lvl:0,len:66,lead:30,kv:170,sv:180000,pn:20,dk:1,d:1,d0:1,dens:1,x:0,bs:1,eh:1,el:0,heal:1,hp0:5,hits:0,over:false,spawned:false,fin:false,cT:0,stars:[1,0,0],
  setLevel(n){this.n=n;this.def=STAGES[n-1];const L=this.lvl=TUNE.lv[n-1]+dmOf().lv+TUNE.lenK*(89-stLen(this.def));   // a long stage (a long song) gives more chances to be hit: its level is eased, a short one tightened
    this.d0=TUNE.d0+TUNE.dd*L;this.d=this.d0*.8;this.dens=Math.max(.5,TUNE.dens0-TUNE.densd*L);this.x=Math.max(0,Math.min(2,(L-TUNE.xs)*TUNE.xd));this.bs=1+TUNE.bsd*L;this.eh=(1+TUNE.eh*L)*dmOf().hp;
    this.el=L<TUNE.el0?0:Math.min(.6,TUNE.eld*(L-TUNE.el0+1));this.heal=Math.max(.15,1-TUNE.hd*L);this.hp0=TUNE.hull[n-1];
    this.hits=0;this.over=false;this.spawned=false;this.fin=false;this.pre=false;this.cT=0;
    const df=this.def;this.len=stLen(df);this.kv=stKill(df);this.sv=stScore(df);this.pn=stPerf(df);   // stage = song length; boss in its last 32 bars (mini-boss: 14)
    this.lead=df.goal.k==='boss'?Math.max(20,this.len-BOSS_BARS):df.goal.k==='mini'?Math.max(20,this.len-MINI_BARS):0;
    this.dk=TUNE2.stDk;
    this.ch=df.ch||'';this.s3=df.ch?stS3(df):0;this.tb=df.ch==='speed'?Math.round(this.len*df.tb):0;this.why='';},
  kit(n){const k=Math.floor((n-1)*.8),got={};for(let i=0;i<k;i++){const id=KIT[i];got[id]=(got[id]||0)+1;}return got;},
  snapFor(n){const f=STAGES[n-1].from||n,sn=sSave.snap[f];return sn?Object.assign({},sn):this.kit(f);},   // a challenge starts with what you had when you reached the stage that opens it
  // the new run has just been created: put this stage's district, hull and upgrades in place
  begin(){const D=DISTRICTS[this.def.di];G.di=this.def.di;G.pos=posOf(G.di);G.dt=0;G.d0=G.bc;DIR.plan(this.def.song);G.boss=null;G.bossDone=false;G.waveT=2.4;G.waveWait=false;G.preload=true;bgFor(G.di);AU.root=D.root;AU.boss=false;
    P.max=Math.max(5,this.hp0);P.hp=this.hp0;banner(this.n+' · '+this.def.name,this.def.intro,false,3.4);},
  carry(){const got=this.snapFor(this.n);for(const id in got)for(let i=0;i<got[id];i++)SH.add(id);},
  frac(){const g=this.def.goal,tf=G.dbar/this.len;let f=0;
    if(this.ch==='speed')f=Math.min(1,G.kills/this.kv);else if(g.k==='survive')f=tf;else if(g.k==='kill')f=Math.min(G.kills/this.kv,tf);else if(g.k==='score')f=Math.min(G.score/this.sv,tf);else f=G.boss||this.spawned?1:G.dbar/this.lead;
    return clamp(f,0,1);},
  label(){const g=this.def.goal;
    if(this.ch==='speed')return Math.min(this.kv,G.kills)+' / '+this.kv+' KILLS · '+Math.max(0,this.tb-Math.floor(G.dbar))+' BARS';
    if(this.ch==='perfect')return 'PERFECT '+Math.min(this.pn,G.perf)+' / '+this.pn;
    if(this.ch==='nohit')return 'NO HIT · '+Math.min(this.len,Math.floor(G.dbar))+' / '+this.len+' BARS';
    if(g.k==='survive')return Math.min(this.len,Math.floor(G.dbar))+' / '+this.len+' BARS';
    if(g.k==='kill')return Math.min(this.kv,G.kills)+' / '+this.kv+' KILLS';
    if(g.k==='score')return 'SCORE '+Math.min(this.sv,G.score).toLocaleString('de-DE')+' / '+this.sv.toLocaleString('de-DE');
    return G.boss?(g.k==='mini'?'MINI-BOSS':'BOSS'):this.over?'CLEAR':'→ '+(g.k==='mini'?UIK.pname(this.def.mini.nm,this.def.mini.k):UIK.pname(DISTRICTS[this.def.di].bossName,DISTRICTS[this.def.di].boss));},
  bossHp(){const k=this.def.goal.k==='mini'?this.def.mini.k:DISTRICTS[this.def.di].boss;
    return this.def.goal.k==='mini'?Math.round(300*(TUNE.miniHp+TUNE.miniHpd*this.lvl)*(HARD?1:1)):Math.round((340+110*Math.min(k,4))*(TUNE.bossHp+TUNE.bossHpd*this.lvl));},
  tick(dt){
    if(this.over){this.cT-=dt;if(this.cT<=0&&!this.fin){this.fin=true;if(this.n>=MAIN||this.ch||!SH.live)this.finish();else SH.pit(()=>this.finish());}return;}
    if(G.dead)return;
    const g=this.def.goal;G.dt+=dt;DIR.tick(dt);const prog=clamp(G.dbar/this.len,0,1),up=G.dbar>=this.len-.5;this.d=this.d0*(.8+.3*prog);   // the ramp runs over the whole stage
    if(!this.pre&&G.t>5&&(g.k==='boss'||g.k==='mini')){this.pre=true;const k=DISTRICTS[this.def.di].boss,sg=g.k==='boss'?bossSong(k,false):null;if(sg)loadTrack(sg);}
    if(this.ch==='nohit'&&this.hits>0){this.why='Hit. No-hit run over';this.fail();return;}
    if(this.ch==='speed'){if(G.kills>=this.kv)this.clear();else if(G.dbar>=this.tb){this.why='Out of time';this.fail();}return;}
    if(this.ch==='perfect'&&up){if(G.perf>=this.pn)this.clear();else{this.why='Short of the PERFECT target';this.fail();}return;}
    if(g.k==='survive'){if(up)this.clear();}
    else if(g.k==='kill'){if(G.kills>=this.kv&&up)this.clear();}
    else if(g.k==='score'){if(G.score>=this.sv&&up)this.clear();}
    else if(!this.spawned&&G.dbar>=this.lead&&(DIR.nonBoss()<=1||G.dbar>=this.lead+2)){this.spawned=true;
      if(g.k==='mini'){const m=this.def.mini;spawnBoss({mini:true,k:m.k,nm:m.nm,sub:BOSS_SUB[m.k],r:m.r,pats:m.pats,lbl:m.lbl,hp:this.bossHp(),score:3000,col:DISTRICTS[this.def.di].a});}
      else spawnBoss({hp:this.bossHp()});}},
  bossDown(e,pts){banner('STAGE CLEAR',(e.nm||'')+' down · +'+pts,false,3);this.clear(true);},
  clear(boss){if(this.over||G.dead)return;this.over=true;this.cT=boss?3.4:2.6;G.waveWait=false;G.eb=[];
    for(const e of G.en)if(e.type!=='boss')e.hp=0;
    this.stars=[1,G.perf>=(this.ch==='perfect'?Math.round(this.pn*1.4):this.pn)?1:0,this.ch?(G.score>=this.s3?1:0):(this.hits===0?1:0)];
    if(!boss)banner('STAGE CLEAR',this.def.name,false,2.6);
    G.flash=Math.max(G.flash,.3*FX());AU.sfx('up');AU.intense(false);NR.emit('stageClear',{n:this.n});},
  fail(){running=false;NR.emit('runEnd',{story:this.n,score:G.score,di:G.di,kills:G.kills});
    $('overEyebrow').textContent=this.why||('Stage '+this.n+' failed');$('oScore').textContent=G.score.toLocaleString('de-DE');$('oDist').textContent=this.n+' · '+this.def.name;$('oPerf').textContent=G.perf;
    const b=sSave.stars[this.n]||0;$('oBest').innerHTML=this.def.goal.k==='boss'||this.def.goal.k==='mini'?'Goal <strong>'+goalTxt(this.def)+'</strong>':'Goal <strong>'+goalTxt(this.def)+'</strong> · '+this.label();
    $('stBtn2').hidden=false;
    overEl.hidden=false;overlayReady=false;syncUI();AU.menuMusic();setTimeout(()=>{overlayReady=true;if(!overEl.hidden)$('againBtn').focus();},600);
    G.over=true;},
  finish(){running=false;const n=this.n,st=this.stars,sum=st[0]+st[1]+st[2];
    if(sum>(sSave.stars[n]||0))sSave.stars[n]=sum;
    if(n<MAIN){const got={};for(const id in SH.got)got[id]=SH.got[id];sSave.snap[n+1]=got;}
    sPersist();NR.emit('runEnd',{story:n,cleared:true,score:G.score,di:G.di,kills:G.kills});
    const s=this.def;$('srEye').textContent=n===MAIN?'Story complete':s.ch?'Challenge clear':ACTN[s.act]+' · Stage '+n+' clear';$('srTitle').textContent=s.name;
    const row=(ok,t)=>`<div class="sr${ok?' ok':''}"><span class="sg">${ok?'★':'☆'}</span> ${t}</div>`;
    $('srStars').innerHTML=row(1,'Stage clear')+row(st[1],(this.ch==='perfect'?Math.round(this.pn*1.4):this.pn)+' PERFECT · you '+G.perf)+row(st[2],s.ch?'Score '+(this.s3/1000)+'K · you '+Math.round(G.score/1000)+'K':'No hull lost')+medalHTML(Math.max(0,Math.min(2,st[0]+st[1]+st[2]-1)));
    $('srScore').textContent=G.score.toLocaleString('de-DE');
    $('srNext').hidden=n>=MAIN;$('srNext').textContent='NEXT STAGE';
    resEl.hidden=false;overlayReady=false;syncUI();AU.menuMusic();setTimeout(()=>{overlayReady=true;if(!resEl.hidden)($('srNext').hidden?$('srRetry'):$('srNext')).focus();},500);G.over=true;},
  totalStars(){let t=0;for(const k in sSave.stars)t+=sSave.stars[k]|0;return t;}};
const unlocked=n=>{const f=STAGES[n-1]&&STAGES[n-1].from;if(f)return ALL||sSave.all||(sSave.stars[f]|0)>=1;return n===1||ALL||sSave.all||(sSave.stars[n-1]|0)>=1||Object.keys(sSave.stars).some(k=>+k>=n&&+k<=MAIN&&(sSave.stars[k]|0)>=1);};   // a later stage cleared (older saves) opens the ones before it

function startStory(n){if(running)return;AU.unlock();pressed={};titleEl.hidden=true;overEl.hidden=true;pauseEl.hidden=true;setEl.hidden=true;selEl.hidden=true;resEl.hidden=true;$('stBtn2').hidden=true;
  ST.setLevel(n);ST.on=true;newGame(false);ST.begin();G.live=true;running=true;paused=false;AU.resume();NR.music.rate=1;AU.startStage(ST.def.song);AU.intense(false);
  NR.emit('runStart',{daily:false,story:n});ST.carry();FPS.n=0;FPS.t=0;FPS.slow=0;FPS.worst=0;syncUI();}

let selEl,resEl;
const lockI='<svg class="lk" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10V8a6 6 0 1112 0v2h1v12H5V10zm2 0h8V8a4 4 0 10-8 0z" fill="currentColor" fill-rule="evenodd"/></svg>';
const stMsg=t=>{$('stMsg').textContent=t;clearTimeout(stMsg.h);stMsg.h=setTimeout(()=>{$('stMsg').textContent='';},1800);};

function storyUI(){
/* ----- styles ----- */
{const st=document.createElement('style');st.textContent=`
#stres .sr{font-family:var(--mono);font-size:clamp(13px,min(2vw,3.4vh),19px);color:var(--dim)}
#stres .sr.ok{color:var(--ink)}#stres .sr .sg{color:#ffe14d;font-size:1.25em}
#hardBtn.on{background:#ff3040;color:#fff}
`;document.head.appendChild(st);}

/* ----- stage select ----- */
selEl=document.createElement('div');selEl.id='stsel';selEl.className='ov solid pg';selEl.hidden=true;
selEl.innerHTML='<div class="top"><span class="ttl">STORY</span><span class="neon" id="stStars" style="color:#ffe14d"></span><span class="sp"></span><button class="go alt" id="stBack" type="button" style="padding:.3em 1.1em">BACK</button></div>'
  +'<div class="rows" id="stRows"></div><div class="msg" id="stMsg"></div>';
stage.appendChild(selEl);
{const dt=document.createElement('div');dt.id='stDet';dt.hidden=true;selEl.appendChild(dt);}
$('stBack').addEventListener('click',closeStages);
addEventListener('keydown',e=>{if(!selEl.hidden&&e.code==='Escape')closeStages();});

/* ----- stage result ----- */
resEl=document.createElement('div');resEl.id='stres';resEl.className='ov solid';resEl.hidden=true;
resEl.innerHTML='<div class="in"><div class="eyebrow" id="srEye">Stage clear</div><h1 id="srTitle">STAGE</h1><div id="srStars"></div>'
  +'<div class="stat">Score <strong id="srScore">0</strong></div>'
  +'<div class="row"><button class="go" id="srNext" type="button">NEXT STAGE</button><button class="go dim" id="srRetry" type="button">RETRY</button><button class="go dim" id="srMenu" type="button">STAGES</button></div></div>';
stage.appendChild(resEl);
$('srNext').addEventListener('click',()=>startStory(Math.min(MAIN,ST.n+1)));
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
