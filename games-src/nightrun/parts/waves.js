// PURPOSE: stages 1-6 play named waves with one idea each, a breather between, a rising curve to the finale
// FLAG: waves (?waves=0)
// TEST: waves-test.js
/* ---------- waves.js (W151, owner 22 Oct 2026 on a phone: "stages extremely boring, a swarm of enemies, no logic"). Flag RET.waves, default ON; ?waves=0 = the director as before.
   Story stages 1-6 (the first impression) no longer stream the director's shuffled patterns. Each stage plays the wave table WV.T (design: nightrun/WAVES.md):
   - 4-5 named waves, ONE idea each, announced in the top chip ("WAVE 2/5 · CHARGE LANES · sidestep the dash");
   - at most 8 enemies on screen; wave foes fly to a slot and stay (strafe, hold, charge and come back) until killed or the wave's time is up, then they
     retreat the way they came (right edge: no leak, no hull cost);
   - a breather of WV.REST seconds with an empty field between waves (density.js curtains paused), the next wave starts on a bar downbeat;
   - the last wave is the stage's finale (a leader wave: kill the leader and its escort flees); stage 5 ends in its mini-boss as before;
   - a kill stage's goal is WV.KG of the foes in the table (the bot clears it), the waves loop from wave 2 ("ENCORE") until the stage ends.
   Other spawners (director, zoo, fleet, set pieces) are muted on these stages; bosses, mini-boss summons and their children are never touched.
   Stats for the test: WV.log. ---------- */
if(RET.waves===undefined)RET.waves=!/[?&]waves=0/.test(location.search);
const WV=window.WV={
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
  on(){return!!RET.waves&&ST.on&&ST.n>=1&&ST.n<=6&&!ST.ch&&!G.lab&&!G.tut&&!!this.T[ST.n];},
  total(n){let k=0;for(const w of this.T[n]||[])k+=w[2].length*(w[3]&&w[3].rep||(w[3]&&w[3].lead!=null?1:n===5?3:2));return k;},
  bossy(){const k=ST.def.goal.k;return(k==='mini'||k==='boss')&&(ST.spawned||G.dbar>=ST.lead-1.5);},
  reset(){this.st={i:-1,nx:0,phase:'rest',t:0,rest:2,foes:[],q:[],loop:0,lead:null,n:this.on()?ST.n:0};this.log={waves:[],maxOn:0,culled:0,ann:[]};this.own=0;try{this.goal();}catch(e){}},
  alive(){return this.st.foes.filter(e=>!e.dead&&e.hp>0);},
  /* ---- spawn one foe of the table ---- */
  spawn(f,wi){const[type,fx,fy,mv,side]=f,sx=Math.min(fx*W,window.HB&&HB.on()?HB.maxX(22):W-62),sy=fy*H;
    const ent=side==='t'?{x:sx,y:-34}:side==='b'?{x:sx,y:H+34}:{x:W+40,y:sy};this.own++;let e;
    const n0=G.en.length;try{e=ZOO.T[type]&&type!=='zdrn'?ZOO.mk(type,{x:ent.x,y:ent.y}):en(type,{x:ent.x,y:ent.y,amp:0,stop:sx,zt:1});}finally{this.own--;}
    for(const x of G.en.slice(n0))if(x!==e&&!x.wv&&x.type!=='boss'){x.wvX=1;this.log.culled++;}   // a variant pack's extra escorts: the table is the whole wave
    if(!e)return;if(!ZOO.T[type])e.zt=0;e.fp=null;e.x=ent.x;e.y=ent.y;e.wv={sx,sy,mv,ph:GR()*6.28,st:'in',t:0,wi,dash:0};if(type==='gate')e.gy=sy;
    const r=G.rings[G.rings.length-1];if(r&&r.x===W-14&&side&&side!=='r'){r.x=sx;r.y=side==='t'?8:H-8;}
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
  squad(w,t0){w[2].forEach((f,k)=>this.st.q.push({at:t0+k*.28,f,k,lead:w[3]&&w[3].lead===k&&this.st.sq===1}));},
  end(){const S=this.st,lw=this.log.waves[this.log.waves.length-1];if(lw)lw.t1=+G.t.toFixed(2);S.phase='rest';S.rest=clamp(this.REST+(this.per()-17)*.25,this.REST,5);S.q=[];},
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
    if(this.bossy()){if(S.phase!=='boss'){S.phase='boss';S.q=[];this.flee();}return;}
    if(S.phase==='wave'){S.t+=dt;
      for(let k=S.q.length-1;k>=0;k--){const q=S.q[k];if(S.t>=q.at){S.q.splice(k,1);this.spawn(q.f,S.wi);if(q.lead){const e=S.foes[S.foes.length-1];if(e){S.lead=e;e.ldr=1;e.el=1;e.hp=Math.round(e.hp*1.6);e.max=e.hp;}}}}
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
if(RET.waves){
  { const b0=DIR.beat;DIR.beat=function(i){
      if(!WV.on()||(G.boss&&G.boss.mini))return b0.call(this,i);
      for(let k=this.q.length-1;k>=0;k--){const x=this.q[k];if(G.bc>=x.b){this.q.splice(k,1);try{x.f();}catch(e){}}}
      if(G.boss||G.bossDone||SH.active)return;
      if(window.DENS&&WV.st.phase==='wave')DENS.beat();
      WV.beat(i);}; }
  { const so=DIR.spawnOne;DIR.spawnOne=function(){if(WV.on()&&!WV.own)return;return so.apply(this,arguments);}; }   // outermost: the director, zoo, fleet and set pieces are muted on wave stages
  { const es=LEAK.es;LEAK.es=function(e){if(e.wv&&WV.on())return 0;return es.call(this,e);}; }   // wave foes are moved by WV.tick only
  if(window.PAC){const el=PAC.eligible;PAC.eligible=function(e){return!e.wv&&el.call(this,e);};}
  { const sl=ST.setLevel;ST.setLevel=function(n){const r=sl.apply(this,arguments);try{WV.goal();}catch(e){}return r;}; }
  NR.on('spawn',e=>{if(!WV.on()||WV.own||!e||e.type==='boss'||e.mini||G.boss||e.type==='zdrn')return;if(e.wv)return;e.wvX=1;WV.log.culled++;});   // anything else that spawns on a wave stage is taken off before it is drawn
  NR.on('kill',o=>{const e=o&&o.e;if(e&&e.wv){const lw=WV.log.waves[WV.log.waves.length-1];if(lw)lw.killed++;}});
  NR.on('runStart',()=>WV.reset());
  NR.on('tick',dt=>WV.tick(dt));
}
