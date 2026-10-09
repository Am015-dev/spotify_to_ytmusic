/* ---------- the director: every district lasts as long as its song; the waves follow the song ----------
   * A district is the length of its song in bars (SONGM). The boss comes in the last 32 bars and cannot fall before its armour is spent (31 bars),
     so district + boss together are never shorter than the song. If the boss needs longer the song simply loops.
   * Phrases: every 8 bars a new THEME (ranks, flankers, turret lines, swarm, elites, hazards, rush, breather). Inside a phrase patterns enter on beats 1 and 3 of a bar;
     how many depends on the loudness of that bar in the decoded song (loud = dense), the position in the cycle, the loop and the player's upgrades (soft).
   * No dead air: a screen with no enemy for one bar gets the next pattern at once; a mini-boss comes about every 64 bars.
   * Loops add mutators (hailstorm, minefield, turbo, tide, flank rush, elite guard), not only more hit points.
   * Fair: every shot is armed one beat before (b.js), nothing spawns within SPAWN_R of the ship, flankers and rain are announced by a marker for one beat. */
const SPAWN_R=210;
const TUNE2={loopD:.9,hpD:.35,hpK:1.8,densK:.5,dK:.1,bsK:.08,loopFan:1.5,loopSpd:.1,slope:.2,quad:.014,lenK:.5,stDk:.4,stHeal:3,stFree:99,stHpK:1.1,stDensK:.35};   // difficulty numbers of the director (tune with f-sim.js; __mnr.TUNE2 is live)
const UPS={d:1,hp:1,dens:1,bs:1,u:0,soft:0};             // soft scaling of the enemies with the player's upgrade level
const UP_W={fr:.05,dc:.03,mg:.01,sh:.06,lp:.02,wd:.02,hm:.05,ck:.02,db:.04,sb:.05,nx:0,dm:.09,cr:.03,hl:0,mh:.05,dr:.08,rv:.06,
  sc:.07,rg:.04,pc:.06,cl:.06,bt:.05,rc:.04,og:.07,as:.05,bd:.08,sm:0,ni:0,sw:.07,ec:.02,lk:0};
const TP_W={dmg:.07,rof:.05,shd:.06,rgn:.04,hul:.06,dsh:.04,mag:.005,ckp:.01,pwd:.01,crt:.04,drn:.09,rev:.06,nmn:0,ovc:.03,tdl:.04,prc:.05,nint:0};
function upsCalc(){let u=0;try{for(const id in SH.got)u+=(UP_W[id]||.03)*SH.got[id];for(const d of TP_DEF)u+=(TP_W[d.id]||.03)*TP.l(d.id);}catch(e){}
  const soft=1-Math.exp(-u/1.4);UPS.u=u;UPS.soft=soft;UPS.hp=1+(ST.on?TUNE2.stHpK:TUNE2.hpK)*soft;UPS.dens=1+(ST.on?TUNE2.stDensK:TUNE2.densK)*soft;UPS.d=1+TUNE2.dK*soft;UPS.bs=1+TUNE2.bsK*soft;}
const MUTS=[{id:'hail',n:'HAILSTORM',t:'Slow rain from above'},{id:'mine',n:'MINEFIELD',t:'Mines drift in'},{id:'turbo',n:'TURBO',t:'Faster shots'},
  {id:'tide',n:'TIDE',t:'Swarms every phrase'},{id:'rush',n:'FLANK RUSH',t:'Flankers every bar'},{id:'guard',n:'ELITE GUARD',t:'More elites'}];
const MINIS=[{k:4,nm:'BRÜCKEN-WÄCHTER',r:40,pats:['fan5','ring','fan7','spiral'],lbl:'B',sub:'Bridge sentinel, twin cannon'},
  {k:5,nm:'SCHRANKEN-WART',r:38,pats:['laser','fan7','ring','laser'],lbl:'S',sub:'Gate warden, laser rig'},
  {k:7,nm:'HOPLITE',r:40,pats:['fan5','ring','fan7','spiral'],lbl:'H',sub:'Shield wall, spear rig'}];
const WARN=[];                                           // spawn markers: shown for one beat before something enters from an edge or falls
const DIR={
  sb:72,stage:'stage1',bossBar:40,bar:-1,theme:null,thName:'',acc:0,idle:0,emptyB:0,ldt:0,q:[],mut:[],bsK:1,spd:1,nextMini:64,minis:0,lastTheme:'',log:{spawns:[],themes:[],mini:0,minD:1e9,maxEmptyBars:0,emptyRun:0},
  reset(){this.q=[];this.nextMini=64;this.minis=0;this.lastTheme='';this.log={spawns:[],themes:[],mini:0,minD:1e9,maxEmptyBars:0,emptyRun:0};WARN.length=0;G.rb=0;upsCalc();},
  tag(){return'';},
  tierv(){return ST.on?clamp((ST.lvl-2)*.5,0,5):G.pos+G.loop*5+(G.dprog||0);},
  plan(stage,bossBars){this.stage=stage;this.sb=songBars(stage);this.bossBar=Math.max(24,this.sb-(bossBars||BOSS_BARS));this.bar=-1;this.theme=null;this.acc=.6;this.idle=9;this.emptyB=0;this.q=[];WARN.length=0;G.dbar=0;this.ldt=0;},
  begin(i){this.plan(stageFor(i,false));
    // mutators: loop 1 has one, loop 2 two, loop 3+ three; they rotate so every district has its own
    this.mut=[];const n=Math.min(3,G.loop);for(let k=0;k<n;k++){const m=MUTS[(posOf(i)*2+G.loop*3+k*2)%MUTS.length];if(!this.mut.includes(m.id))this.mut.push(m.id);}
    this.bsK=this.has('turbo')?1.12:1;
    if(this.mut.length&&G.live)G.note={t:6,txt:'Mutator: '+this.mut.map(id=>MUTS.find(m=>m.id===id).n).join(' · ')};},
  has(id){return this.mut.includes(id);},
  frac(){if(G.boss||G.bossDone)return 1;if(ST.on)return ST.frac();return clamp(G.dbar/Math.max(1,this.bossBar),0,1);},
  nonBoss(){let n=0;for(const e of G.en)if(e.type!=='boss'&&e.hp>0)n++;return n;},
  // ---- clock: bars of the district (G.dt is seconds; a test that sets it back to 0 sets the bar clock back too) ----
  tick(dt){if(G.dt<this.ldt-1e-6){G.dbar=0;}this.ldt=G.dt;if(!SH.active)G.dbar+=dt/(4*BT.spb);
    G.dprog=ST.on?0:clamp(G.dbar/Math.max(1,this.bossBar),0,1);
    if(ST.on||G.boss||G.bossDone)return;
    const force=G.force||G.dt>1e8;
    if(force||G.dbar>=this.bossBar){if(force||this.nonBoss()===0||G.dbar>this.bossBar+2){G.force=false;spawnBoss();}}},
  // ---- the beat: patterns enter on beats 1 and 3 of a bar; things scheduled with later() run on their beat ----
  later(beats,f){this.q.push({b:G.bc+Math.max(0,beats),f});},
  beat(i){
    for(let k=this.q.length-1;k>=0;k--){const x=this.q[k];if(G.bc>=x.b){this.q.splice(k,1);try{x.f();}catch(e){}}}
    const nb=this.nonBoss();if(nb===0&&!G.boss&&!G.bossDone&&(ST.on||G.dbar<this.bossBar-.5)){this.emptyB++;this.log.emptyRun=this.emptyB/4;this.log.maxEmptyBars=Math.max(this.log.maxEmptyBars,this.log.emptyRun);}else{this.emptyB=0;this.log.emptyRun=0;}
    if(G.boss&&!G.boss.mini)return;
    if(G.bossDone||SH.active)return;
    const bb=((i%4)+4)%4;
    if(!ST.on&&G.dbar>=this.bossBar)return;                // the boss is about to come: no new waves
    if(ST.on&&ST.spawned)return;
    if(G.boss)return;                                      // a mini-boss summons its own
    if(bb===0)this.barLine(i);
    else if(bb===2&&this.acc>=1.4){this.acc-=1;this.spawnOne();}
    else if(this.emptyB>=4&&nb===0){this.spawnOne(true);this.emptyB=0;}           // dead air: nothing on screen for a whole bar
  },
  barLine(i){const bar=Math.max(0,Math.round(ST.on?G.dbar:G.dbar));G.rb++;
    if(bar<=this.bar&&this.bar>=0&&!ST.on)return;this.bar=bar;
    const ph=Math.floor(bar/8);if(this.theme==null||ph!==this.phr){this.phr=ph;this.pickTheme(bar);}
    // mini-boss about every 64 bars of play, never in the first 10 bars of a district or right before the boss
    if(!ST.on&&G.rb>=this.nextMini&&bar>=10&&bar<this.bossBar-12){this.nextMini+=64;this.spawnMini();return;}
    const E=this.energy(bar),dn=(DF.dn||1),t=this.tierv();
    let n=(.95+TUNE2.slope*t+TUNE2.quad*t*t)*(.42+1.15*E)*dn*UPS.dens*Math.pow(66/Math.max(40,this.sb),TUNE2.lenK)*(ST.on?ST.dk:1);   // a long song (4 minutes) is calmer per bar than a short one: the district is about equally hard in total
    if(this.thName==='breath')n*=.6;
    if(bar<2&&!G.loop&&!G.pos)n*=.7;                                           // the first bars of a run: a gentle start
    this.acc+=n;this.idle=this.idle+1;
    let made=0;
    while(this.acc>=1&&made<4){this.acc-=1;if(made===0)this.spawnOne();else{const k=made;this.later(k===1?2:k,()=>this.spawnOne());}made++;}
    if(!made&&this.idle>=2){this.spawnOne();made=1;}                          // never two bars without something coming
    if(made)this.idle=0;
    if(this.has('rush')&&E>.45)this.later(2,()=>PATS.flankPair.f());
    if(this.has('tide')&&(bar&7)===4)this.later(0,()=>PATS.swarm.f());
    if(this.has('mine')&&(bar&7)===2)this.later(0,()=>PATS.mines.f());
    if(this.has('hail')&&bar%2===0)this.rain(2+Math.min(3,G.loop));
  },
  energy(bar){const st=ST.on?ST.def.song:this.stage;const e=songEnergy(st,bar);return Math.pow(e,1.25);},
  // ---- themes ----
  pickTheme(bar){const E=(()=>{let s=0;for(let k=0;k<8;k++)s+=this.energy(bar+k);return s/8;})(),t=this.tierv();
    const T={ranks:1.2,flank:t>=.6?1:.2,turrets:t>=.4?.9:.3,swarm:t>=1?(E>.55?1:.4):.1,elite:t>=2?(E>.65?1.1:.3):0,hazard:t>=1.2?(E>.5?1:.5):0,rush:t>=.8?(E>.6?1:.3):0,breath:E<.5?2.4:E<.62?.6:0};
    // the district's own colour
    const D=DISTRICTS[G.di];if(D.name==='OSTEND'||D.name==='ATHINA')T.hazard*=1.8;if(D.name==='MAINUFER')T.flank*=1.4;if(D.name==='MESSE'||D.name==='BANKENVIERTEL'||D.name==='BANKENVIERTEL')T.turrets*=1.3;
    if(ST.on){const w=new Set(ST.def.waves);T.ranks=1;if(!w.has('turret'))T.turrets*=.3;if(!w.has('gate')&&!w.has('pillars'))T.hazard=0;if(!w.has('gunship'))T.elite*=.4;if(!w.has('chargers')&&!w.has('wedge'))T.rush*=.3;
      T.flank*=ST.lvl>=3.5?1:0;T.swarm*=ST.lvl>=5?1:0;T.elite*=ST.lvl>=7?1:0;}
    if(this.lastTheme)T[this.lastTheme]=(T[this.lastTheme]||0)*.12;
    const ks=Object.keys(T).filter(k=>T[k]>0);let tot=0;for(const k of ks)tot+=T[k];let r=GR()*tot,pick=ks[0];for(const k of ks){r-=T[k];if(r<=0){pick=k;break;}}
    this.theme=pick;this.thName=pick;this.lastTheme=pick;this.thBar=bar;if(this.log.themes.length<80)this.log.themes.push([bar,pick,+E.toFixed(2)]);},
  // ---- spawning ----
  pool(){const th=this.thName,t=this.tierv(),ok=ST.on?new Set(ST.def.waves):null,out=[];
    for(const k in PATS){const p=PATS[k];if(p.th.indexOf(th)<0)continue;if(p.t>t+.01)continue;if(ok&&!ok.has(k)&&!(p.free&&ST.lvl>=TUNE2.stFree))continue;out.push(p);}
    return out.length?out:[PATS.droneLine];},
  spawnOne(fill){const P_=this.pool();let tot=0;for(const p of P_)tot+=p.w;let r=GR()*tot,pk=P_[0];for(const p of P_){r-=p.w;if(r<=0){pk=p;break;}}
    if(fill){const small=P_.filter(p=>p.n<=6);if(small.length)pk=small[Math.floor(GR()*small.length)];}
    pk.f();if(this.log.spawns.length<400)this.log.spawns.push([+G.dbar.toFixed(1),pk.id]);NR.emit('pattern',{id:pk.id});},
  spawnMini(){const k=[4,5,7][(G.pos+this.minis)%3],m=MINIS.find(x=>x.k===k)||MINIS[0];this.minis++;this.log.mini++;
    spawnBoss({mini:true,k:m.k,nm:m.nm,sub:m.sub,r:m.r,pats:m.pats,lbl:m.lbl,score:3000,col:DISTRICTS[G.di].a});},
  miniDown(){this.acc=Math.max(this.acc,1.2);},
  // ---- safety: nothing appears within SPAWN_R of the ship (it slides further out of the screen instead) ----
  safe(e){if(e.type==='boss'||!P)return;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);
    if(d<SPAWN_R){const need=Math.sqrt(Math.max(0,SPAWN_R*SPAWN_R-dy*dy));e.x=P.x+need+8;}
    const d2=Math.hypot(e.x-P.x,e.y-P.y);if(d2<this.log.minD)this.log.minD=d2;if(NR.watch)NR.watch.spawns.push({type:e.type,d:d2,t:G.t});},
  // ---- hailstorm: markers at the top for one beat, then slow bullets fall; never in the column the ship is in ----
  rain(n){const xs=[];for(let k=0;k<n;k++){let x=gr(160,W-60),tries=0;while((Math.abs(x-P.x)<90||xs.some(q=>Math.abs(q-x)<110))&&tries++<20)x=gr(160,W-60);xs.push(x);}
    for(const x of xs)WARN.push({x,y:12,b:G.bc,kind:'rain'});
    this.later(1,()=>{for(const x of xs){const w=WARN.findIndex(q=>q.x===x&&q.kind==='rain');if(w>=0)WARN.splice(w,1);if(G.dead||Math.abs(x-P.x)<70)continue;
      eb.src={arm:true};for(let k=0;k<3;k++)eb(x,-10-k*34,Math.PI/2,150,'#ffa02d',5);eb.src=null;}});},
  // ---- flankers: a marker on the edge for one beat, then they curl in toward the middle ----
  flank(n,both){const sides=[];for(let k=0;k<n;k++)sides.push(both?(k%2?1:-1):(GR()<.5?-1:1));
    sides.forEach((side,k)=>{const x=gr(520,W-70),y=side<0?10:H-10,ty=gr(H*.3,H*.7);const w={x,y,b:G.bc,kind:'flank',side};WARN.push(w);
      this.later(1+(k>>1),()=>{const wi=WARN.indexOf(w);if(wi>=0)WARN.splice(wi,1);if(G.dead)return;
        en('flank',{x,y:side<0?-22:H+22,ty,side,t:0,bf:fireIn(gx(1.2,2.2))});});});},
  moveFlank(e,dt,d){const vy=190*(e.hurry||1);if(e.side&&Math.abs(e.ty-e.y)>6&&!e.settled){e.y+=Math.sign(e.ty-e.y)*Math.min(Math.abs(e.ty-e.y),vy*dt);e.x-=(80+8*d)*dt;if(Math.abs(e.ty-e.y)<=6){e.settled=1;e.by=e.ty;}}
    else{e.x-=(150+10*d)*dt;e.y=(e.by||e.y)+Math.sin(e.t*2.2)*22;}},
  moveSwarm(e,dt,d){e.x-=(200+10*d)*dt;e.y=e.by+Math.sin(e.t*3.2+(e.ph||0))*(e.amp||50);},
  moveMine(e,dt,d){e.x-=(62+4*d)*dt;e.y=e.by+Math.sin(e.t*.9+(e.ph||0))*14;},
  drawWarn(t){if(!WARN.length)return;ctx.save();for(const w of WARN){const k=clamp((G.bp-w.b),0,1),a=.35+.65*(SET.reduce?1:Math.floor(t*14)%2?.7:1);
    ctx.globalAlpha=a;ctx.strokeStyle='#ff7080';ctx.fillStyle='#ff304055';ctx.lineWidth=2.5;
    if(w.kind==='rain'){ctx.beginPath();ctx.moveTo(w.x-12,6);ctx.lineTo(w.x,26+8*k);ctx.lineTo(w.x+12,6);ctx.stroke();ctx.fillRect(w.x-1.5,28,3,H*.1*(1-k));}
    else{const dy=w.side<0?1:-1,y=w.side<0?8:H-8;ctx.beginPath();ctx.moveTo(w.x-14,y);ctx.lineTo(w.x,y+dy*(18+8*k));ctx.lineTo(w.x+14,y);ctx.closePath();ctx.fill();ctx.stroke();}}
    ctx.restore();}
};
/* ---------- the pattern library: id, themes it belongs to, the tier it opens at, weight, size ---------- */
const FY=(a,b)=>gr(a,Math.max(a+1,b));
const PATS={};
const pat=(id,th,t,w,n,f,o)=>{PATS[id]=Object.assign({id,th,t,w,n,f,always:0,free:0},o||{});WAVES[id]=f;};
pat('droneLine',['ranks','breath','rush'],0,1.2,5,()=>{const y=FY(80,H-150);for(let i=0;i<5;i++)en('drone',{x:W+30+i*55,y,amp:0});return 2.6;},{always:1});
pat('droneSine',['ranks','breath','flank'],0,1.2,6,()=>{const y=FY(130,H-170);for(let i=0;i<6;i++)en('drone',{x:W+30+i*46,y,amp:70,ph:i*.6});return 3;},{always:1});
pat('droneV',['ranks','swarm','elite'],0,1,5,()=>{const y=FY(150,H-190);for(let i=-2;i<=2;i++)en('drone',{x:W+30+Math.abs(i)*50,y:y+i*46,amp:0});return 3;},{always:1});
pat('turret',['turrets','hazard'],0,.8,2,()=>{en('turret',{y:FY(90,H-160),stop:gr(690,820)});if(DIR.tierv()>1)en('turret',{y:FY(90,H-160),stop:gr(690,820),x:W+120});return 3.8;},{always:1});
pat('chargers',['rush','elite','flank'],0,1,3,()=>{for(let i=0;i<3;i++)en('charger',{x:W+30+i*110,y:FY(60,H-110)});return 2.6;},{always:1});
pat('gunship',['elite','hazard'],1,.7,1,()=>{en('gunship',{x:W+90,y:FY(160,H-220)});return 5.5;},{always:1});
pat('gate',['hazard'],0,1,1,()=>{en('gate',{x:W+30,gy:FY(150,H-200),gap:130});return 3.8;},{always:1});
pat('phalanx',['ranks','elite'],1,.9,9,WAVES.phalanx,{free:0});
pat('wedge',['rush','elite'],1,.9,5,WAVES.wedge,{free:0});
pat('pillars',['hazard'],1.5,.9,2,WAVES.pillars,{free:0});
pat('flankPair',['flank','rush'],.4,1.1,2,()=>{DIR.flank(2,true);return 2;},{free:1});
pat('pincer',['flank'],1.4,.8,4,()=>{DIR.flank(4,true);return 3;},{free:1});
pat('turretLine',['turrets'],.6,1.2,3,()=>{const x=gr(760,860),ys=[H*.2,H*.5,H*.8].map(y=>y+gr(-26,26));ys.forEach((y,k)=>en('turret',{y,stop:x+k*14,x:W+60+k*110,bf:fireIn(1+k)}));return 4;},{free:1});
pat('turretPair',['turrets','hazard'],0,.8,2,()=>{const x=gr(740,840);[H*.3,H*.7].forEach((y,k)=>en('turret',{y:y+gr(-30,30),stop:x,x:W+60+k*140,bf:fireIn(1+k*2)}));return 4;},{free:1});
pat('swarm',['swarm'],.8,1.2,12,()=>{const y=FY(120,H-170),amp=gr(40,80);for(let i=0;i<12;i++)en('swarm',{x:W+30+i*38,y,by:y,amp,ph:i*.55});return 3;},{free:1});
pat('swarmRing',['swarm'],1.6,.8,10,()=>{const y=FY(180,H-230);for(let i=0;i<10;i++){const a=i/10*6.283;en('swarm',{x:W+60+Math.cos(a)*50,y:y+Math.sin(a)*50,by:y+Math.sin(a)*50,amp:0,ph:0});}return 3;},{free:1});
pat('eliteV',['elite'],1.8,.9,5,()=>{const y=FY(150,H-190);for(let i=-2;i<=2;i++){const e=en('drone',{x:W+30+Math.abs(i)*50,y:y+i*46,amp:0});if(!e.el){e.el=1;e.hp*=2;e.max=e.hp;e.r=Math.round(e.r*1.25);e.score*=2;}}return 3;},{free:1});
pat('convoy',['elite','hazard'],2.2,.8,5,()=>{const y=FY(170,H-230);en('gunship',{x:W+90,y});for(let i=0;i<4;i++)en('drone',{x:W+140+i*40,y:y+(i%2?-70:70),amp:0});return 5;},{free:1});
pat('mines',['hazard','swarm'],1.2,.9,4,()=>{const g=gr(140,H-200);for(let i=0;i<4;i++){const y=(g+i*120)%(H-90)+45;en('mine',{x:W+30+i*70,y,by:y,ph:i});}return 4;},{free:1});
pat('snake',['ranks','flank'],.2,1,8,()=>{const y=FY(150,H-190);for(let i=0;i<7;i++)en('drone',{x:W+30+i*48,y,amp:55,ph:i*.9});return 3.4;},{free:1});
/* ---------- looks of the new enemy kinds (the rest is in draw.js) ---------- */
{const de=drawEnemy;drawEnemy=function(e,t){
  if(e.type!=='flank'&&e.type!=='swarm'&&e.type!=='mine'){de(e,t);return;}
  const D=DISTRICTS[G.di],fl=e.flash>0;ctx.save();ctx.translate(e.x,e.y);
  if(e.arm){const k=PHF;ctx.save();ctx.globalCompositeOperation='lighter';G_(0,0,e.r*(1.7+1.3*k),'#ff3050',.22+.55*k);ctx.restore();
    ctx.strokeStyle='#ff7080';ctx.globalAlpha=.35+.65*k;ctx.lineWidth=2+2*k;ctx.beginPath();ctx.arc(0,0,e.r+4+16*(1-k),0,7);ctx.stroke();ctx.globalAlpha=1;}
  if(e.el){ctx.strokeStyle='#ffd23d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,e.r+4,0,7);ctx.stroke();}
  if(e.type==='flank'){const fa=(e.side&&!e.settled)?Math.atan2(-e.side*190,-80):Math.PI;if(ART.dflash('spr-en-flank',e.r*3.4,0,Math.sin(t*5+eb_(e))*1,fa-Math.PI,fl)){ctx.restore();return;}}
  else if(e.type==='swarm'){if(ART.dflash('spr-en-swarm',e.r*2.8,0,Math.sin(t*7+eb_(e))*.8,0,fl)){ctx.restore();return;}}
  else if(ART.dflash('spr-en-mine',e.r*2.5,0,0,t*.6+e.ph,fl)){ctx.globalCompositeOperation='lighter';const p=.5+.5*Math.sin(t*5+e.ph);G_(0,0,e.r*(.9+.4*p),'#ffa02d',.25+.2*p);ctx.globalCompositeOperation='source-over';hpBar(-14,-e.r-9,28,e.hp/e.max);ctx.restore();return;}
  if(e.type==='flank'){ctx.rotate((e.side&&!e.settled)?Math.atan2(-e.side*190,-80):Math.PI);ctx.fillStyle=fl?'#fff':'#0e1a2a';ctx.strokeStyle='#19e3ff';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(-9,-12);ctx.lineTo(-4,0);ctx.lineTo(-9,12);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.globalCompositeOperation='lighter';G_(-6,0,11,'#19e3ff',.7);ctx.globalCompositeOperation='source-over';}
  else if(e.type==='swarm'){ctx.fillStyle=fl?'#fff':'#1a0e24';ctx.strokeStyle='#ff5acf';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(4,-6);ctx.lineTo(9,0);ctx.lineTo(4,6);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.globalCompositeOperation='lighter';G_(-3,0,7,'#ff5acf',.6);ctx.globalCompositeOperation='source-over';}
  else{const p=.5+.5*Math.sin(t*5+e.ph);ctx.fillStyle=fl?'#fff':'#1a1208';ctx.strokeStyle='#ffa02d';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<8;i++){const q=i*Math.PI/4,rr=i%2?e.r*.6:e.r;ctx.lineTo(Math.cos(q)*rr,Math.sin(q)*rr);}ctx.closePath();ctx.fill();ctx.stroke();
    ctx.globalCompositeOperation='lighter';G_(0,0,e.r*(1.1+.5*p),'#ffa02d',.4+.3*p);ctx.globalCompositeOperation='source-over';
    hpBar(-14,-e.r-9,28,e.hp/e.max);}
  ctx.restore();};
 const dp=drawPickups;drawPickups=function(t){dp(t);DIR.drawWarn(t);};}
NR.on('runStart',()=>{upsCalc();});
