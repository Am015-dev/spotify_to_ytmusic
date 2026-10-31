// PURPOSE: stages 1-6 play named waves with one idea each, a breather between, a rising curve to the finale
// FLAG: none (always on)
// TEST: waves-test.js
/* ---------- waves.js (W151, owner 22 Oct 2026 on a phone: "stages extremely boring, a swarm of enemies, no logic"). Always on (the RET.waves flag and ?waves=0 are gone; W293 removed this stale note).
   Story stages 1-6 (the first impression) no longer stream the director's shuffled patterns. Each stage plays the wave table WV.T (design: nightrun/WAVES.md):
   - 4-5 named waves, ONE idea each, announced in the top chip ("WAVE 2/5 · CHARGE LANES · sidestep the dash");
   - at most 8 enemies on screen; wave foes fly to a slot and stay (strafe, hold, charge and come back) until killed or the wave's time is up, then they
     retreat the way they came (right edge: no leak, no hull cost);
   - a breather of WV.REST seconds with an empty field between waves (density.js curtains paused), the next wave starts on a bar downbeat;
   - the last wave is the stage's finale (a leader wave: kill the leader and its escort flees); stage 5 ends in its mini-boss as before;
   - a kill stage's goal is WV.KG of the foes in the table (the bot clears it), the waves loop from wave 2 ("ENCORE") until the stage ends.
   Other spawners (director, zoo, fleet, set pieces) are muted on these stages; bosses, mini-boss summons and their children are never touched.
   Stats for the test: WV.log. ---------- */
if(RET.gold===undefined)RET.gold=!/[?&]gold=0/.test(location.search);   // W293 the push-or-hold bounty (default ON; ?gold=0 = off for the before/after tests)
const WV=window.WV={
  /* W293 GOLD (design: nightrun/DESIGN-DECISION-W247.md, measured change in BALANCE-W293.md): every squad starts a bounty clock of GT0+GT1*k s (k = its foes).
     Kill the whole squad before the clock runs out, at least half of it hit up close (reward.js' close-range bonus, e._rwC), = GOLD: +1 weapon level for the stage
     (the 'up' pickup at the last kill) and the squad's points paid GPK times again. A foe that leaves, a clock at 0 or a squad shot from afar loses the bounty
     (no hull cost). The stage is cut in GN fifths (by bar); each fifth pays one GOLD, so the player picks WHICH squad to push (result line: GOLD n/5, best kept).
     The risk: a wave gun foe (turret, gunship, shielder) answers a ship inside FR px with a flak ring: a red ring tells it FT s ahead,
     two rings of FN bullets (FS and .7 FS px/s, offset half a step) from the foe, so a bullet needs >= FT s + travel to reach the ship (MINSHOT's one second to react holds); DASH and EMP answer it.
     Measured (W293): the close bonus alone never shortened a clear, and inside the 190 px no-fire floor pushing cost nothing. */
  GT0:1.5,GT1:1,GN:5,GPK:2,CLOSE:.5,FR:170,FT:.6,FN:16,FS:190,FCD:1.0,
  GHP:1,PH:1,PFR:1.3,PFC:.6,   /* W314 (BALANCE-W314.md): a GOLD made with DASH ready also repairs GHP hull; at hull <= PH every foe of a live bounty squad answers a close ship with flak (range x PFR, cooldown x PFC) */
  REST:3.5,SCK:650,TMAX:22,CAP:8,KG:.72,ENTER:300,
  /* the wave table: stage -> waves; a wave = [name, what to do, foes, opts]; a foe = [type, slot x (share of W), slot y (share of H), move, side]
     move: 'hold' strafe on the slot | 'sine' weave up and down | 'dash' charger: hold, aim at the ship's line, dash, come back from the right | 'sit' turret
     side: 'r' enters from the right edge (default) | 't' / 'b' from the top / bottom edge (world y) | opts: {lead:i} foe i leads, its death sends the rest home */
  T:{
    1:[['FIRST CONTACT','shoot the drones',[['drone',.62,.3,'hold'],['drone',.62,.7,'hold'],['drone',.72,.5,'hold'],['drone',.55,.5,'hold']]],
       ['TWIN COLUMNS','clear one side, then the other',[['drone',.58,.18,'sine'],['drone',.68,.18,'sine'],['drone',.78,.18,'sine'],['drone',.58,.82,'sine'],['drone',.68,.82,'sine'],['drone',.78,.82,'sine']]],
       ['CHARGERS','they aim at your line: sidestep the dash',[['charger',.7,.25,'dash'],['charger',.75,.5,'dash'],['charger',.7,.75,'dash'],['drone',.6,.5,'hold']]],
       ['GUN TURRET','it parks and fires: kill it first',[['turret',.72,.5,'sit'],['drone',.6,.25,'hold'],['drone',.6,.75,'hold'],['drone',.68,.38,'hold'],['drone',.68,.62,'hold']]],
       ['THE WALL','a turret behind a line of drones',[['turret',.76,.5,'sit'],['drone',.6,.15,'hold'],['drone',.6,.32,'hold'],['drone',.6,.5,'hold'],['drone',.6,.68,'hold'],['drone',.6,.85,'hold'],['charger',.7,.3,'dash']],{lead:0}]],
    2:[['PATROL V','five drones in a V',[['drone',.56,.5,'hold'],['drone',.63,.37,'hold'],['drone',.63,.63,'hold'],['drone',.7,.24,'hold'],['drone',.7,.76,'hold']]],
       ['CHARGE LANES','four chargers: sidestep each dash',[['charger',.7,.2,'dash','t'],['charger',.74,.4,'dash'],['charger',.74,.6,'dash'],['charger',.7,.8,'dash','b']]],
       ['SNAKE','six drones weave: aim ahead of them',[['drone',.55,.5,'sine'],['drone',.6,.5,'sine'],['drone',.65,.5,'sine'],['drone',.7,.5,'sine'],['drone',.75,.5,'sine'],['drone',.8,.5,'sine']]],
       ['FLANKERS','they come from the top and bottom',[['flank',.6,.25,'hold','t'],['flank',.6,.75,'hold','b'],['flank',.7,.2,'hold','t'],['flank',.7,.8,'hold','b'],['drone',.75,.5,'hold']]],
       ['PATROL LEADER','kill the gold leader: the patrol flees',[['turret',.74,.5,'sit'],['charger',.68,.25,'dash'],['charger',.68,.75,'dash'],['drone',.6,.35,'hold'],['drone',.6,.65,'hold'],['drone',.56,.5,'hold']],{lead:0}]],
    3:[['WINDOW GUNNER','a turret parks: take it out',[['turret',.72,.5,'sit'],['drone',.6,.3,'hold'],['drone',.6,.7,'hold'],['drone',.66,.5,'hold']]],
       ['SWARM','eight small fliers: sweep them for a chain',[['swarm',.55,.3,'sine'],['swarm',.6,.3,'sine'],['swarm',.65,.3,'sine'],['swarm',.7,.3,'sine'],['swarm',.55,.7,'sine'],['swarm',.6,.7,'sine'],['swarm',.65,.7,'sine'],['swarm',.7,.7,'sine']]],
       ['RUSH','five chargers in turn: keep moving',[['charger',.72,.15,'dash'],['charger',.76,.33,'dash'],['charger',.72,.5,'dash'],['charger',.76,.67,'dash'],['charger',.72,.85,'dash']]],
       ['CROSSFIRE','turrets top and bottom, drones between',[['turret',.7,.12,'sit','t'],['turret',.7,.88,'sit','b'],['drone',.6,.4,'sine'],['drone',.6,.6,'sine'],['drone',.66,.5,'hold']]],
       ['SHOP GUARD','kill the gold turret: the guard runs',[['turret',.76,.3,'sit'],['turret',.76,.7,'sit'],['charger',.66,.35,'dash'],['charger',.66,.65,'dash'],['drone',.58,.5,'hold']],{lead:0}]],
    4:[['GUARD POST','two turrets cover the drones',[['turret',.74,.3,'sit'],['turret',.74,.7,'sit'],['drone',.6,.4,'hold'],['drone',.6,.6,'hold'],['drone',.66,.5,'hold']]],
       ['SHIELD ESCORT','the shield faces you: hit it from the side',[['shielder',.68,.5,'hold'],['drone',.6,.3,'hold'],['drone',.6,.7,'hold'],['drone',.74,.3,'hold'],['drone',.74,.7,'hold']]],
       ['MINE LANE','mines drift: pick your lane',[['mine',.62,.2,'sine'],['mine',.66,.42,'sine'],['mine',.62,.64,'sine'],['mine',.66,.86,'sine'],['drone',.74,.3,'hold'],['drone',.74,.7,'hold']]],
       ['PINCER','chargers from both sides',[['charger',.66,.15,'dash','t'],['charger',.66,.85,'dash','b'],['charger',.74,.3,'dash','t'],['charger',.74,.7,'dash','b'],['drone',.6,.5,'hold']]],
       ['HAUPTWACHE','the guard captain and the shield wall',[['shielder',.7,.5,'hold'],['turret',.76,.22,'sit'],['turret',.76,.78,'sit'],['charger',.64,.3,'dash'],['charger',.64,.7,'dash'],['drone',.58,.5,'hold']],{lead:0}]],
    5:[['VAULT DRONES','five drones guard the door',[['drone',.58,.3,'sine'],['drone',.58,.7,'sine'],['drone',.66,.4,'hold'],['drone',.66,.6,'hold'],['drone',.74,.5,'hold']]],
       ['TURRET AND RUSH','a turret parks, two chargers cover it',[['turret',.74,.5,'sit'],['charger',.66,.3,'dash'],['charger',.66,.7,'dash'],['drone',.6,.5,'hold']]],
       ['SHIELD ESCORT','go round the shield',[['shielder',.66,.35,'hold'],['shielder',.66,.65,'hold'],['drone',.74,.5,'hold'],['drone',.58,.5,'hold']]],
       ['ALARM','five chargers: sidestep, then the keeper comes',[['charger',.7,.15,'dash','t'],['charger',.74,.33,'dash'],['charger',.7,.5,'dash'],['charger',.74,.67,'dash'],['charger',.7,.85,'dash','b']]]],
    6:[['SCOUTS','a V of scouts',[['drone',.56,.5,'hold'],['drone',.63,.37,'hold'],['drone',.63,.63,'hold'],['drone',.7,.24,'hold'],['drone',.7,.76,'hold']]],
       ['GUNSHIP LINE','two gunships hold a line: break it',[['gunship',.74,.3,'hold'],['gunship',.74,.7,'hold'],['drone',.62,.5,'hold']]],
       ['SIDE CHARGE','chargers from the sides: sidestep',[['charger',.66,.15,'dash','t'],['charger',.66,.85,'dash','b'],['charger',.72,.3,'dash','t'],['charger',.72,.7,'dash','b']]],
       ['SHIELD ESCORT','two shields: hit them from the side',[['shielder',.66,.35,'hold'],['shielder',.66,.65,'hold'],['drone',.58,.5,'sine'],['drone',.74,.5,'hold'],['drone',.74,.2,'hold']]],
       ['KONVOI','the squad leader: kill it first, the escort flees',[['gunship',.74,.5,'hold'],['drone',.62,.3,'hold'],['drone',.62,.7,'hold'],['turret',.72,.15,'sit','t'],['turret',.72,.85,'sit','b'],['charger',.66,.5,'dash']],{lead:0}]]},
  st:{i:-1,nx:0,phase:'off',t:0,rest:0,foes:[],q:[],loop:0,lead:null,n:0},
  log:{waves:[],maxOn:0,culled:0,ann:[]},
  on(){return ST.on&&ST.n>=1&&ST.n<=6&&!ST.ch&&!G.lab&&!G.tut&&!!this.T[ST.n];},
  total(n){let k=0;for(const w of this.T[n]||[])k+=w[2].length*(w[3]&&w[3].rep||(w[3]&&w[3].lead!=null?1:n===5?3:2));return k;},
  bossy(){const k=ST.def.goal.k;return(k==='mini'||k==='boss')&&(ST.spawned||G.dbar>=ST.lead-1.5);},
  reset(){this.st={i:-1,nx:0,phase:'rest',t:0,rest:2,foes:[],q:[],loop:0,lead:null,n:this.on()?ST.n:0};this.log={waves:[],maxOn:0,culled:0,ann:[],gold:0,sqs:[]};this.bt={n:0,m:0,list:[],cur:null,live:null,now:null,claim:{}};this.own=0;try{this.goal();}catch(e){}},
  alive(){return this.st.foes.filter(e=>!e.dead&&e.hp>0);},
  /* ---- spawn one foe of the table ---- */
  spawn(f,wi){const[type,fx,fy,mv,side]=f,sx=Math.min(fx*W,window.HB&&HB.on()?HB.maxX(22):W-62),sy=fy*H;
    const ent=side==='t'?{x:sx,y:-34}:side==='b'?{x:sx,y:H+34}:{x:W+40,y:sy};this.own++;let e;
    const n0=G.en.length;try{e=ZOO.T[type]&&type!=='zdrn'?ZOO.mk(type,{x:ent.x,y:ent.y}):en(type,{x:ent.x,y:ent.y,amp:0,stop:sx,zt:1});}finally{this.own--;}
    for(const x of G.en.slice(n0))if(x!==e&&!x.wv&&x.type!=='boss'){x.wvX=1;this.log.culled++;}   // a variant pack's extra escorts: the table is the whole wave
    if(!e)return;if(!ZOO.T[type])e.zt=0;e.fp=null;e.x=ent.x;e.y=ent.y;e.wv={sx,sy,mv,ph:GR()*6.28,st:'in',t:0,wi,dash:0};if(type==='gate')e.gy=sy;
    const r=G.rings[G.rings.length-1];if(r&&r.x===W-14&&side&&side!=='r'){r.x=sx;r.y=side==='t'?8:H-8;}
    if(this.cur){const q=this.cur;e.bq=q;q.sp++;if(q.t0==null)q.t0=G.t;}
    this.st.foes.push(e);},
  /* ---- a wave starts: chip in the top band, foes enter one after another ---- */
  start(){const S=this.st,L=this.T[ST.n];S.i++;let wi,enc=false;
    if(S.nx>=L.length||S.nx===L.length-1&&this.left()>36&&L.length>2){enc=true;wi=1+(S.loop++%(L.length-2));}   // time to spare before the finale (or after it): one more of the middle waves
    else wi=S.nx++;
    S.wi=wi;const w=L[wi];S.phase='wave';S.t=0;S.foes=[];S.lead=null;
    const nm=enc?'MORE · '+w[0]:'WAVE '+(wi+1)+'/'+L.length+' · '+w[0];banner(nm,w[1],false,2.4);if(G.banner){G.banner.sm=1;G.banner.wv=1;}
    this.log.ann.push({i:S.i,nm,t:+G.t.toFixed(2),chip:!!(G.banner&&G.banner.sm)});
    this.log.waves.push({i:S.i,wi,nm:w[0],t0:+G.t.toFixed(2),bar:+G.dbar.toFixed(1),n:w[2].length,roles:[...new Set(w[2].map(f=>f[0]))],t1:null,killed:0,fled:0});
    S.rep=this.rep(w);S.sq=1;this.squad(w,0);NR.emit('wave',{n:ST.n,i:S.i,nm:w[0]});},
  left(){const k=ST.def.goal.k,end=k==='mini'||k==='boss'?ST.lead:ST.len;return Math.max(0,(end-G.dbar)*4*BT.spb);},   // seconds until the boss or the end of the song
  per(){const L=this.T[ST.n],k=Math.max(1,L.length-this.st.nx);return this.left()/k;},   // seconds per wave still to play
  rep(w){if(w[3]&&w[3].rep)return w[3].rep;if(w[3]&&w[3].lead!=null)return 1;const k=ST.def.goal.k;return this.per()>(k==='mini'||k==='boss'?30:21)?3:2;},
  squad(w,t0){const bq=this.bopen(w[2].length);w[2].forEach((f,k)=>this.st.q.push({at:t0+k*.28,f,k,bq,lead:w[3]&&w[3].lead===k&&this.st.sq===1}));},   // W293: each squad carries its bounty clock
  /* ---- W293 the bounty: open one per squad (WV.squad here, SL.beat on the slice stages); settled in bty() every frame ---- */
  gold(){return!!RET.gold&&this.on();},
  seg(){const k=ST.def.goal.k,end=k==='mini'||k==='boss'?ST.lead:ST.len;return clamp(Math.floor(this.GN*G.dbar/Math.max(1,end)),0,this.GN-1);},
  bopen(k){if(!this.gold()||!this.bt)return null;const sg=this.seg(),q={id:this.bt.m++,k,sg,pay:!this.bt.claim[sg],sp:0,t0:null,s0:G.score,T:this.GT0+this.GT1*k,end:0,gold:0,dead:0,fled:0};this.bt.list.push(q);return q;},
  chip(a,b,t,toast){const c=G.banner;if(c&&c.t>0&&!c.gd)return;   // never over another chip (wave names, announcements, boss)
    if(c&&c.gd&&c.t>0){if(!toast&&c.hold>G.t)return;c.a=a;c.b=b;c.t=toast?t:Math.max(c.t,t);c.m=Math.max(c.m,c.t+.25);if(toast)c.hold=G.t+t;return;}   // refresh in place: CALM fades in over m-t
    G.banner={t,m:t+.25,a,b,warn:false,sm:1,wv:1,gd:1,hold:toast?G.t+t:0};},
  bty(){const B=this.bt;if(!B)return;B.live=null;B.now=null;
    for(const q of B.list){if(q.end||q.t0==null)continue;let alive=0,fled=0,last=null;if(q.pay&&B.claim[q.sg])q.pay=0;
      if(!q.pay){let on=0;for(const e of this.st.foes)if(e.bq===q&&e.hp>0&&!e.dead&&!(e.wv&&e.wv.st==='out')&&!(e.sl&&e.sl.out))on++;if(!on&&q.sp>=q.k||G.t-q.t0>40)q.end=1;else if(!B.now||q.t0<B.now.t0)B.now=q;continue;}   // a squad of a fifth already paid: no clock
      if(!B.now||q.t0<B.now.t0)B.now=q;
      let near=0;for(const e of this.st.foes)if(e.bq===q){if(e.hp<=0){last=e;if(e._rwC)near++;continue;}if(e.dead||e.wv&&e.wv.st==='out'||e.sl&&e.sl.out)fled++;else alive++;}
      const age=G.t-q.t0,full=q.sp>=q.k;
      if(fled||age>q.T||this.bossy()){q.end=1;q.fled=fled;this.log.sqs.push({id:q.id,k:q.k,t:+age.toFixed(2),gold:0,why:fled?'fled':age>q.T?'time':'boss'});if(!this.bossy()&&G.banner&&G.banner.gd)this.chip('GOLD LOST',B.n+'/'+this.GN,.9,1);continue;}
      if(full&&!alive&&near<q.k*this.CLOSE){q.end=1;this.log.sqs.push({id:q.id,k:q.k,t:+age.toFixed(2),gold:0,why:'far',near});if(G.banner&&G.banner.gd)this.chip('GOLD LOST','too far: kill them up close · '+B.n+'/'+this.GN,1,1);continue;}
      if(full&&!alive){q.end=1;q.gold=1;B.n++;B.claim[q.sg]=1;this.log.gold=B.n;this.log.sqs.push({id:q.id,k:q.k,t:+age.toFixed(2),gold:1,why:'gold'});const x=last?last.x:W*.6,y=last?last.y:H/2;
        G.pk.push({t:'up',x,y,vx:-40,vy:0,bob:0,gold:1});G.score+=Math.max(0,Math.round((G.score-q.s0)*this.GPK));try{AU.sfx('up');}catch(e){}const rp=this.GHP&&P.dashCd<=0&&P.hp<P.max;if(rp)P.hp=Math.min(P.max,P.hp+this.GHP);q.rp=rp?1:0;this.chip('GOLD '+B.n+'/'+this.GN,rp?'+1 weapon level · +1 hull (DASH was ready)':P.dashCd>0?'+1 weapon level · no repair: DASH was spent':'+1 weapon level',1.2,1);NR.emit('gold',{n:B.n,id:q.id});continue;}
      if(!B.live||q.t0<B.live.t0)B.live=q;
}
    const mad=!!B.live&&P.hp<=this.PH;   // W314 the punisher: a ship on its last hull pushing a bounty squad meets flak from every foe of it
    for(const e of this.st.foes){if(!e.bq||e.hp<=0||e.dead||!(/turret|gunship|shielder/.test(e.type)||mad&&e.bq===B.live)||e.wv&&e.wv.st!=='on'||e.sl&&e.sl.out)continue;   // the flak ring: told FT s ahead, then FN bullets
      if(e._ft){if(G.t-e._ft>=this.FT){e._ft=0;e._fc=G.t+this.FCD*(mad?this.PFC:1);const o=eb.src,n0=G.eb.length;eb.src=e;const a0=GR()*6.28;for(let i=0;i<this.FN;i++){eb(e.x,e.y,a0+i*6.2832/this.FN,this.FS);eb(e.x,e.y,a0+(i+.5)*6.2832/this.FN,this.FS*.7);}eb.src=o;for(let i=n0;i<G.eb.length;i++)G.eb[i].fl=1;this.log.flak=(this.log.flak|0)+1;}}
      else if(!(e._fc>G.t)&&Math.hypot(P.x-e.x,P.y-e.y)<this.FR*(mad?this.PFR:1)){e._ft=G.t;G.rings.push({x:e.x,y:e.y,l:this.FT,m:this.FT,c:'#ff3d6a'});}}
    const q=B.live;if(q){const s=Math.max(0,q.T-(G.t-q.t0));this.chip('GOLD '+Math.ceil(s)+'s',mad?'last hull: the whole squad fires back':'fly in close, kill the squad · '+B.n+'/'+this.GN,.4);}},
  best(n){try{return(JSON.parse(localStorage.getItem('mnr_wvgold')||'{}')[n]|0);}catch(e){return 0;}},
  keep(n,v){try{const o=JSON.parse(localStorage.getItem('mnr_wvgold')||'{}');if(v>(o[n]|0)){o[n]=v;localStorage.setItem('mnr_wvgold',JSON.stringify(o));}}catch(e){}},
  end(){const S=this.st,lw=this.log.waves[this.log.waves.length-1];if(lw){lw.t1=+G.t.toFixed(2);if(this.bt)lw.gold=this.bt.n;}S.phase='rest';S.rest=clamp(this.REST+(this.per()-17)*.25,this.REST,5);S.q=[];},
  flee(){for(const e of this.alive())if(e.wv.st!=='out'){e.wv.st='out';e.aimL=0;}},
  /* ---- every frame (after the enemy loop in b.js): positions of the wave foes, the wave clock ---- */
  tick(dt){if(!this.on()||!running||G.dead||ST.over||!G.en)return;const S=this.st;if(S.n!==ST.n)this.reset();
    for(const e of G.en)if(e.wvX){e.dead=1;}
    if(G.en.some(e=>e.wvX)){G.en=G.en.filter(e=>!e.wvX);}
    let on=0;for(const e of G.en)if(e.type!=='boss'&&e.hp>0&&!e.dead)on+=1;this.log.maxOn=Math.max(this.log.maxOn,on);
    for(const e of S.foes){if(e.dead||e.hp<=0||!e.wv)continue;const v=e.wv;v.t+=dt;if(e.fp)e.fp=null;
      const to=(x,y,sp)=>{const dx=x-e.x,dy=y-e.y,d=Math.hypot(dx,dy),s=Math.min(d,sp*dt);if(d>0){e.x+=dx/d*s;e.y+=dy/d*s;}return d<4;};
      if(v.st==='out'){e.x+=320*dt;if(e.x>W+50){e.dead=1;const lw=this.log.waves[this.log.waves.length-1];if(lw)lw.fled++;}continue;}
      if(v.st==='in'){if(to(v.sx,v.sy,this.ENTER)){v.st='on';v.t=0;}e.by=e.y;continue;}
      if(v.mv==='dash'){   // hold 1.4 s, aim .7 s (red line on the ship's height), dash left, come back from the right edge
        if(v.t<1.4){e.y=v.sy+Math.sin(G.t*2+v.ph)*14;e.x=v.sx;}
        else if(v.t<2.1){e.aimL=1;e.y+=(P.y-e.y)*Math.min(1,dt*4);v.ay=e.y;}
        else{e.aimL=0;e.x-=560*dt;e.y=v.ay;if(e.x<26){e.x=W+40;e.y=v.sy;v.st='in';v.dash++;}}}
      else if(v.mv==='sine'){e.x=v.sx+Math.sin(G.t*.9+v.ph)*16;e.y=clamp(v.sy+Math.sin(G.t*1.6+v.sx*.01)*H*.12,40,H-40);}
      else if(v.mv==='sit'){e.x=v.sx;e.y=v.sy+Math.sin(G.t*.7+v.ph)*8;}
      else{e.x=v.sx+Math.sin(G.t*1.1+v.ph)*10;e.y=clamp(v.sy+Math.sin(G.t*1.3+v.ph)*34,40,H-40);}
      e.by=e.y;if(e.type==='turret')e.t=Math.min(e.t,6);if(e.type==='gunship')e.t=Math.min(e.t,12);}
    if(this.gold())this.bty();
    if(this.bossy()){if(S.phase!=='boss'){S.phase='boss';S.q=[];this.flee();}return;}
    if(S.phase==='wave'){S.t+=dt;
      for(let k=S.q.length-1;k>=0;k--){const q=S.q[k];if(S.t>=q.at){S.q.splice(k,1);this.cur=q.bq||null;this.spawn(q.f,S.wi);this.cur=null;if(q.lead){const e=S.foes[S.foes.length-1];if(e){S.lead=e;e.ldr=1;e.el=1;e.hp=Math.round(e.hp*1.6);e.max=e.hp;}}}}
      if(S.lead&&(S.lead.dead||S.lead.hp<=0)){S.lead=null;this.flee();floater(W*.55,H*.5,'LEADER DOWN: THEY RUN','#ffd23d');}
      const left=this.alive().length;
      const w=this.T[ST.n][S.wi];
      if(S.sq<S.rep&&!S.q.length&&left+w[2].length<=this.CAP&&left<=2&&S.t<this.TMAX){S.sq++;this.squad(w,S.t+.4);const lw=this.log.waves[this.log.waves.length-1];if(lw)lw.sq=S.sq;}   // the same idea again: a second squad when the first is nearly down
      if(S.t>=this.TMAX&&!S.q.length)this.flee();
      if(!S.q.length&&left===0&&(S.sq>=S.rep||S.t>=this.TMAX))this.end();}
    else if(S.phase==='rest'){S.rest-=dt;}},
  /* ---- the beat: a wave starts on a bar downbeat after its breather ---- */
  beat(i){const S=this.st;if(S.phase==='rest'&&S.rest<=0&&((i%4)+4)%4===0&&!ST.over&&!this.bossy())this.start();},
  goal(){if(!this.on())return;const g=ST.def.goal;if(g.k==='kill')ST.kv=Math.max(8,Math.round(this.KG*this.total(ST.n)));if(g.k==='score')ST.sv=Math.round(this.KG*this.total(ST.n)*this.SCK/500)*500;}};
{
  { const b0=DIR.beat;DIR.beat=function(i){
      if(!WV.on()||(G.boss&&G.boss.mini))return b0.call(this,i);
      for(let k=this.q.length-1;k>=0;k--){const x=this.q[k];if(G.bc>=x.b){this.q.splice(k,1);try{x.f();}catch(e){}}}
      if(G.boss||G.bossDone||SH.active)return;
      if(window.DENS&&WV.st.phase==='wave')DENS.beat();
      WV.beat(i);}; }
  HOOK['DIR.spawnOne'](so=>function(){if(WV.on()&&!WV.own)return;return so.apply(this,arguments);});   // outermost: the director, zoo, fleet and set pieces are muted on wave stages
  { const es=LEAK.es;LEAK.es=function(e){if(e.wv&&WV.on())return 0;return es.call(this,e);}; }   // wave foes are moved by WV.tick only
  if(window.PAC){const el=PAC.eligible;PAC.eligible=function(e){return!e.wv&&el.call(this,e);};}
  { const sl=ST.setLevel;ST.setLevel=function(n){const r=sl.apply(this,arguments);try{WV.goal();}catch(e){}return r;}; }
  NR.on('spawn',e=>{if(!WV.on()||WV.own||!e||e.type==='boss'||e.mini||G.boss||e.type==='zdrn')return;if(e.wv)return;e.wvX=1;WV.log.culled++;});   // anything else that spawns on a wave stage is taken off before it is drawn
  NR.on('kill',o=>{const e=o&&o.e;if(e&&e.wv){const lw=WV.log.waves[WV.log.waves.length-1];if(lw)lw.killed++;}});
  NR.on('runStart',()=>WV.reset());
  { const rr=RET.resultRow;RET.resultRow=function(){const r=rr.apply(this,arguments);const B=WV.bt;if(!RET.gold||!B||!ST.on||WV.st.n!==ST.n||!ST.n)return r;WV.keep(ST.n,B.n);const b=WV.best(ST.n);   // W293: GOLD n/5 on the stage result, best kept
      return r+`<div class="sr${B.n?' ok':''}" id="srGold"><span class="sg">◆</span> GOLD ${B.n}/${WV.GN}${b>B.n?' · best '+b+'/'+WV.GN:B.n&&b===B.n?' · best':''}</div>`;}; }
  NR.on('tick',dt=>WV.tick(dt));
}
