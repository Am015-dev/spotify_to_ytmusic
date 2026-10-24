// PURPOSE: story stage 1 stops being boring: foes act at once, a rising script to a peak at ~85% of the waves, two decisions (bounty chase, EMP now or later), then a mini-boss
// FLAG: stage1fun (?stage1fun=0 = the S1 slice script, 36 bars, no boss)
// TEST: qa/simhunt.js (STAGES=1-1 SEEDS=50 ENDLESS=0; URLX=&stage1fun=0 for the old stage)
/* ---------- stage1fun.js (W160, 23 Oct 2026; owner: "focus on one stage ... all game is very boring", "the enemies are sleeping", "the test bot clears stages 1-3 at 100%").
   Rides on slice.js (who enters when) and alive.js (how foes move and shoot). This layer only, on Normal story stage 1:
   - GOAL: the stage becomes waves then a mini-boss (goal 'mini', boss at bar LEAD = ~120 s, fight ~30 s): about 2.5 min in all;
   - SCRIPT: a new bar script, a charger in the very first group, varied shapes (V, wall, pincer, column, cross-fire), a breather at bars 15-16 and 30,
     the cap of live foes and the bullet speed rise by bar (CAPS/BKS), so the pressure climbs to the PEAK (bars 37-45) and then the boss;
   - DECISION 1 (bar 18) BOUNTY: the gold courier sits in the top corner between two shooters for 6 s: fly into the fans for +1000 and a repair, or stay safe;
   - DECISION 2 (bar 31) SWARM: announced: three shooters at once; the ship starts with one EMP charge: burn it on the swarm or keep it for the peak;
   - HULL: the stage starts with HULL points (was 7: the test bot ended at 7 of 7).
   Stats for simhunt: S1F.log {dec, emp:[bar of each EMP], peak}. ---------- */
if(RET.stage1fun===undefined)RET.stage1fun=!/[?&]stage1fun=0/.test(location.search);
const S1F=window.S1F={
  LEAD:47,HULL:4,BHP:110,TMIN:22,MINBAR:8,
  CAPS:[[0,4],[7,5],[17,6],[24,6],[31,7],[37,8]],BKS:[[0,1.1],[21,1.16],[37,1.32]],FNS:[[0,0],[37,1]],CDS:[[0,.4],[13,.36],[21,.32],[31,.28],[37,.19]],CHS:[[0,1],[21,2],[37,3]],
  MINI:{k:5,nm:'TRESOR-WART',r:38,pats:['fan5','ring','fan5'],lbl:'T'},
  T:{g:[[1,[['P',.6,.5],['P',.64,.36],['P',.64,.64],['C',.72,.2]]],                                   // V + a charger from the first beat
       [3,[['P',.62,.2],['P',.62,.4],['P',.62,.6],['P',.62,.8]]],                                     // wall
       [5,[['C',.72,.25],['C',.72,.75],['P',.6,.5]]],                                                 // pincer
       [7,[['S',.74,.5],['P',.6,.25],['P',.6,.75]]],                                                  // the first shooter
       [9,[['P',.58,.15],['P',.6,.32],['P',.62,.5],['P',.6,.68],['P',.58,.85]]],                      // column sweep
       [11,[['S',.76,.25],['C',.7,.7],['P',.6,.45]]],
       [13,[['T',.76,.5],['P',.62,.3]]],                                                              // first tank
       [17,[['P',.62,.4],['P',.62,.6]]],
       [18,[['S',.72,.5],['B',.86,.13,'t'],['S',.74,.84]],{dec:'bounty',ann:['BOUNTY','a gold courier in the corner, two guns cover it: worth the risk?']}],
       [21,[['C',.72,.25],['C',.74,.5],['C',.72,.75],['P',.6,.35],['P',.6,.65]]],                     // charge wave
       [24,[['S',.76,.3],['S',.76,.7],['P',.6,.2],['P',.62,.5],['P',.6,.8]]],                         // cross-fire
       [27,[['T',.76,.4],['C',.72,.8],['P',.6,.2],['P',.6,.6]]],
       [31,[['S',.76,.2],['S',.78,.5],['S',.76,.8],['P',.6,.35],['P',.6,.65]],{dec:'emp',ann:['SWARM','three guns at once: an EMP wipes every bullet. Now, or keep it?']}],
       [34,[['P',.58,.2],['P',.62,.35],['P',.66,.5],['P',.62,.65],['P',.58,.8]]],
       [37,[['T',.76,.3],['S',.76,.75],['C',.7,.5],['P',.6,.2],['P',.6,.6]],{dec:'peak',ann:['FINAL PUSH','everything they have left']}],
       [39,[['P',.58,.15],['P',.6,.32],['P',.62,.5],['P',.6,.68],['P',.58,.85]]],
       [40,[['S',.76,.25],['S',.76,.75],['C',.7,.4],['C',.7,.6],['P',.6,.5]]],
       [42,[['C',.72,.2],['C',.72,.8],['P',.6,.4],['P',.6,.6]]],
       [43,[['T',.76,.6],['S',.76,.2],['C',.7,.8],['P',.6,.35],['P',.6,.5]]]]},
  /* W177 s1bounty / W179 s1gaps (both OFF unless ?s1bounty=1 / ?s1gaps=1; with both off table() is T itself, so nothing changes) */
  table(){const B=RET.s1bounty,Gp=RET.s1gaps;if(!B&&!Gp)return this.T;const g=this.T.g.map(r=>r.slice()),row=b=>g.find(r=>r[0]===b);
    if(B){row(7)[1]=row(7)[1].concat([['S',.78,.8,'b']]);row(17)[1]=[['C',.72,.35],['P',.62,.65]];   // bar 7: a second gun from the bottom; bar 17: a charger
      row(18)[1]=[['S',.74,.4],['B',.66,.63,'t'],['S',.76,.86]];row(18)[2]={dec:'bounty',ann:['BOUNTY','shoot the gold courier, then grab the gold it drops within 3 s: two guns cover it']};}
    if(Gp)g.push([15,[['P',.62,.35],['P',.62,.65]]],[29,[['P',.6,.3],['P',.6,.7]]],[45,[['P',.6,.35],['P',.6,.65]]]);   // light groups in the 5 s+ gaps after the tank (13), the cross-fire (27) and the final push (43)
    g.sort((a,b)=>a[0]-b[0]);return{g};},
  old:null,log:{emp:[],gz:0},
  want(n){return!!RET.stage1fun&&n===1&&SET.diff==='normal'&&!STAGES[0].ch&&!!window.SL&&!!RET.slice;},
  on(){return ST.on&&this.want(ST.n);},
  at(tab,b){let v=tab[0][1];for(const r of tab)if(b>=r[0])v=r[1];return v;},
  bar(){return Math.floor(G.dbar||0);},
  apply(){const b=this.bar();SL.CAP=this.at(this.CAPS,b);SL.BK[1]=this.at(this.BKS,b);SL.FN[1]=this.at(this.FNS,b);
    if(window.AL){AL.CD[1]=this.at(this.CDS,b);AL.ch1=this.at(this.CHS,b);}},
  restore(){if(!this.old)return;SL.T[1]=this.old.T;SL.CAP=this.old.CAP;SL.BK[1]=this.old.BK;SL.FN[1]=this.old.FN;if(window.AL){AL.CD[1]=this.old.CD;AL.ch1=0;}}};
{
  S1F.old={T:SL.T[1],CAP:SL.CAP,BK:SL.BK[1],FN:SL.FN[1],CD:window.AL?AL.CD[1]:.6};
  /* the goal: waves, then the mini-boss at bar LEAD (a new def object: STAGES[0] itself stays as it was) */
  { const sl=ST.setLevel;ST.setLevel=function(n){const r=sl.apply(this,arguments);
      if(S1F.want(n)){this.def=Object.assign({},STAGES[0],{goal:{k:'mini'},mini:S1F.MINI});this.len=stLen(this.def);this.lead=S1F.LEAD;this.len=Math.max(this.len,this.lead+MINI_BARS);this.hp0=S1F.HULL;}
      return r;}; }
  /* the first boss is a plain, readable fight: its own fan + ring patterns, no borrowed verbs, arena rules or zone strikes (those hit from places the ship cannot read yet) */
  if(window.BMV){const io=BMV.idOf;BMV.idOf=function(e){if(e&&e.mini&&S1F.on())return null;return io.apply(this,arguments);};}
  if(typeof B2!=='undefined'){const tm=B2.tmin;B2.tmin=function(e){return e&&e.mini&&S1F.on()?S1F.TMIN:tm.apply(this,arguments);};}   // the DPS ceilings (fair.js 30 s, armour.js 50 s for a mini) would stretch a first boss to ~55 s
  if(window.B2X){const tf=B2X.tf;B2X.tf=function(e){return e&&e.mini&&S1F.on()?S1F.TMIN:tf.apply(this,arguments);};}
  { const sb=spawnBoss;spawnBoss=function(o){const b=sb.apply(this,arguments);if(b&&b.mini&&S1F.on()&&b.minBar)b.minBar=S1F.MINBAR;return b;}; }   // b.js holds a mini-boss at an HP floor for 14 bars (~37 s at 92 BPM)
  { const bh=ST.bossHp;ST.bossHp=function(){const v=bh.apply(this,arguments);return S1F.on()?S1F.BHP:v;}; }
  { const b=SL.beat;SL.beat=function(i){if(S1F.on())i=Math.max(0,(G.bc|0)-1);return b.call(this,i);}; }   // the script runs on the stage's own beat count (G.bc, like the boss bar): the song's beat index can fall behind it and stall the script for 30 s
  NR.on('runStart',()=>{if(S1F.on()){SL.T[1]=S1F.table();S1F.apply();P.emp=Math.max(P.emp|0,1);}else S1F.restore();S1F.log={emp:[],gz:0};S1F.e0=P.emp|0;S1F.gold=null;S1F.warned=0;});
  NR.on('graze',()=>{if(S1F.on())S1F.log.gz++;});
  NR.on('tick',dt=>{if(!S1F.on())return;S1F.apply();const e=P.emp|0;if(e<S1F.e0)S1F.log.emp.push(+G.dbar.toFixed(1));S1F.e0=e;
    const p=S1F.gold;if(p&&!G.dead){if(p.dead){S1F.gold=null;if(!p.exp){S1F.log.paid=(S1F.log.paid|0)+1;G.score+=1000;floater(P.x,P.y-44,'BOUNTY +1000','#ffd23d');const d=SL.log.dec[SL.log.dec.length-1];if(d)d.got=1;}}   // collected by touch (b.js adds the repair)
      else{p.age+=dt;p.vx=0;p.vy=0;if(p.age>3){p.dead=1;p.exp=1;}}}
    if(RET.s1gaps&&!S1F.warned&&S1F.bar()>=S1F.LEAD-1){S1F.warned=1;S1F.log.warn=+G.t.toFixed(1);banner('WARNUNG','something huge is closing in',true,2.6);AU.sfx('warn');}});
  NR.on('bossIn',()=>{if(S1F.on())S1F.log.bossIn=+G.t.toFixed(1);});
  /* W177 BOUNTY WITH TEETH (RET.s1bounty): the courier pays nothing when shot (slice.js would pay 1000 at once); it drops a gold repair that waits 3 s where it died, between the two guns, and +1000 is paid when the ship touches it */
  if(RET.s1bounty===undefined)RET.s1bounty=!/[?&]s1bounty=0/.test(location.search);
  if(RET.s1gaps===undefined)RET.s1gaps=!/[?&]s1gaps=0/.test(location.search);
  { const sp=SL.spawn;SL.spawn=function(f){const r=sp.apply(this,arguments);if(RET.s1bounty&&S1F.on()&&f[0]==='B'){const e=WV.st.foes[WV.st.foes.length-1];if(e&&e.bty){e.bty=0;e.bounty=1;}}return r;}; }
  NR.on('kill',o=>{const e=o&&o.e;if(!e||!e.bounty||!RET.s1bounty||!S1F.on())return;const p={t:'hp',x:e.x,y:e.y,vx:0,vy:0,bob:0,bty:1,age:0};G.pk.push(p);S1F.gold=p;S1F.log.gold=(S1F.log.gold|0)+1;floater(e.x,e.y-22,'GRAB THE GOLD','#ffd23d');});
  DRAW.extra.push(function(){const p=S1F.gold;if(!p||p.dead||!S1F.on())return;ctx.save();ctx.translate(p.x,p.y);ctx.strokeStyle='#ffd23d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,12+16*Math.max(0,1-p.age/3),0,7);ctx.stroke();   // the ring shrinks as the 3 s run out
    ctx.fillStyle='#ffd23d';ctx.font='700 12px "Chakra Petch",sans-serif';ctx.textAlign='center';if(wcv===cv)wtxt('BOUNTY +1000',0,-34);else wtxt('BOUNTY +1000',36,0);ctx.restore();});
}
/* ---------- W176 CARRIER (23 Oct 2026, owner: "the flights are boring ... make the stages fun"; flight bar P2 + W2). Flag s1carrier, default OFF (?s1carrier=1).
   A mid-stage set piece replaces the bar 21-27 groups: a big carrier glides in and holds the right side; three gun plates, each with its own fire:
   TOP aimed fans, MIDDLE aimed bursts in a line, BOTTOM a sweeping stream. The core is armoured until two plates are down, then opens and fires rings.
   Decision: which plate first (the one that guards the lane you want, or the one whose fire hurts you most). Plates and core drop medals.
   The carrier leaves after CAR.LIFE s if it is not broken. Stats for simhunt: S1F.car {t0, open, t1, how, plates:[order]}. ---------- */
if(RET.s1carrier===undefined)RET.s1carrier=!/[?&]s1carrier=0/.test(location.search);
S1F.TC={g:S1F.T.g.filter(g=>g[0]<21||g[0]>27).concat([[21,[['K',.74,.5]],{dec:'carrier',ann:['CARRIER','three gun plates: break two and the core opens. Which plate first?']}],
  [28,[['C',.72,.3],['P',.6,.5],['C',.72,.7]]]]).sort((a,b)=>a[0]-b[0])};
const CAR=S1F.CAR={LIFE:24,X:.76,PHP:36,CHP:84,
  /* plate: y share of H, x offset, pattern, colour */
  PL:[[.24,-6,'fan','#ffa02d'],[.5,-34,'burst','#ff6a3d'],[.76,-6,'sweep','#ffd23d']],
  on(){return S1F.on()&&!!RET.s1carrier;},
  spawn(){WV.own++;try{this.mk();}finally{WV.own--;}},
  mk(){const c=en('carrier',{x:W+90,y:H*.5,r:30,hp:9999,score:2500});c.el=0;c.carC=1;c.hp=c.max=9999;c.open=0;c.t0=G.t;c.bf=99;
    c.pl=this.PL.map((p,i)=>{const e=en('turret',{x:W+90+p[1],y:H*p[0],stop:1e9});e.el=0;e.r=20;e.hp=e.max=this.PHP;e.score=400;e.carP=1;e.pat=p[2];e.col=p[3];e.cy=p[0];e.cx=p[1];e.car=c;e.nb=(G.bc|0)+3+i;e.bf=99;return e;});
    S1F.car={t0:+G.t.toFixed(1),open:-1,t1:-1,how:'',plates:[]};this.c=c;},
  alive(e){return e&&!e.dead&&e.hp>0;},
  /* every beat: each live plate fires on its own rhythm (a glow beat first: e.arm), the open core fires rings */
  beat(){const c=this.c;if(!c||!this.alive(c)||c.x>W-20||c.lv)return;const b=G.bc|0,d=diff();
    for(const e of c.pl){if(!this.alive(e)||b<e.nb)continue;eb.src=e;
      if(e.pat==='fan'){fan(e,3,.36,165+10*d,e.col);e.nb=b+3;}
      else if(e.pat==='burst'){const a=aim(e);for(let k=0;k<3;k++)eb(e.x-20,e.y,a,140+32*k,e.col);e.nb=b+3;}
      else{const a=Math.PI+Math.sin(b*.55)*.75;eb(e.x-20,e.y,a,150,e.col);eb(e.x-20,e.y,a+.18,150,e.col);e.nb=b+1;}
      eb.src=null;}
    if(c.open&&b>=c.nb){eb.src=c;ring(c,10,125+8*d,b*.3,'#ff3d6a');eb.src=null;c.nb=b+4;}},
  tick(dt){const c=this.c;if(!c)return;if(!this.on()){this.c=null;return;}
    if(!this.alive(c)){for(const e of c.pl)if(this.alive(e)){e.hp=0;kill(e);}this.c=null;return;}
    const age=G.t-c.t0,tx=this.X*W;c.t=0;c.bf=99;
    if(age>this.LIFE&&!c.lv){c.lv=1;S1F.car.t1=+G.t.toFixed(1);S1F.car.how='left';floater(W*.5,H*.5,'THE CARRIER GETS AWAY','#8fa3c7');}
    c.x=c.lv?c.x+90*dt:Math.max(tx,c.x-(c.x-tx)*Math.min(1,dt*1.6)-20*dt);c.y=c.by=H*.5+Math.sin(age*.5)*H*.04;
    if(c.lv&&c.x>W+90){c.dead=1;for(const e of c.pl)e.dead=1;this.c=null;return;}
    let up=0;for(const e of c.pl){if(!this.alive(e)){if(!e.gone){e.gone=1;S1F.car.plates.push(e.pat);for(let k=0;k<2;k++)G.pk.push({t:'shard',x:e.x,y:e.y,vx:rnd(-60,0),vy:rnd(-50,50),bob:0});}continue;}
      up++;e.t=0;e.bf=99;e.stop=1e9;e.x=c.x+e.cx;e.y=e.by=c.y+(e.cy-.5)*H;e.arm=(G.bc|0)+1>=e.nb&&c.x<W-20&&!c.lv;}
    if(!c.open&&up<=1){c.open=1;c.hp=c.max=this.CHP;c.nb=(G.bc|0)+2;S1F.car.open=+(G.t-c.t0).toFixed(1);floater(c.x-40,c.y-50,'CORE OPEN: SHOOT IT','#ff3d6a');AU.sfx('phase');}
    if(!c.open){if(c.flash>0&&G.t-(c.msg||0)>2.5){c.msg=G.t;floater(c.x-40,c.y-46,'ARMOURED: BREAK TWO PLATES','#8fa3c7');}c.hp=c.max;}
    c.arm=c.open&&(G.bc|0)+1>=c.nb;},
  /* the hull: one armoured slab joining the plates (code-drawn, no new picture), the core shut (grey shutter) or open (pulsing red) */
  /* W207 (RET.shipart): the hull is the carrier's own ship sheet (ship-ecarrier: flame loop, volley when the core fires, death clip on the kill); the core stays on top as the tell */
  sheet(c,t,o){if(!RET.shipart||!RET.foeart||!RET.sprites)return false;const m=ENEMY_ART.carrier,key=FOEART.sheet(m,c.arm?'volley':'flame')||FOEART.sheet(m,'flame');if(!key)return false;
    const sm=ART.VS[key]||ART.ANIM.s[key],sc=H*.5/sm[2],hv=key.endsWith('volley');if(hv!==!!c._va){c._va=hv;c._vs=t;}
    ctx.save();ctx.translate(c.x,c.y);ART.drawAnim(ctx,key,hv?t-c._vs:t,0,0,sc,false);
    if(c.flash>0){ctx.globalCompositeOperation='lighter';ART.drawAnim(ctx,key,hv?t-c._vs:t,0,0,sc,false,ART.ANIM.sm.hitstop.flash_white*.5);ctx.globalCompositeOperation='source-over';}
    const r=c.r,p=.5+.5*Math.sin(t*8);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fillStyle=o?'rgba(255,61,106,'+(.55+.45*p)+')':'rgba(85,96,122,.85)';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=o?'#ffd0dc':'#8fa3c7';ctx.stroke();
    if(o){ctx.beginPath();ctx.arc(0,0,r*.4,0,Math.PI*2);ctx.fillStyle='#ffffff';ctx.fill();}
    else{ctx.strokeStyle='#8fa3c7';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-r*.7,-r*.7);ctx.lineTo(r*.7,r*.7);ctx.moveTo(-r*.7,r*.7);ctx.lineTo(r*.7,-r*.7);ctx.stroke();}
    ctx.restore();c._fs=sc;c._fa=FOEART.fr;ART.anim('ship-ecarrier/death');return true;},
  draw(c,t){const h=H*.56,w=46,o=c.open;if(this.sheet(c,t,o))return;ctx.save();ctx.translate(c.x,c.y);
    ctx.fillStyle='#232b3d';ctx.strokeStyle='#8fa3c7';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-w*.4,-h/2);ctx.lineTo(w,-h/2+30);ctx.lineTo(w,h/2-30);ctx.lineTo(-w*.4,h/2);ctx.lineTo(-w*.9,0);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='#4a5878';ctx.lineWidth=2;for(const k of[-.33,-.16,.16,.33]){ctx.beginPath();ctx.moveTo(-w*.5,k*h);ctx.lineTo(w*.9,k*h);ctx.stroke();}
    const r=c.r,p=.5+.5*Math.sin(t*8);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fillStyle=o?'rgba(255,61,106,'+(.55+.45*p)+')':'#55607a';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=c.flash>0?'#ffffff':o?'#ffd0dc':'#8fa3c7';ctx.stroke();
    if(o){ctx.beginPath();ctx.arc(0,0,r*.4,0,Math.PI*2);ctx.fillStyle='#ffffff';ctx.fill();}
    else{ctx.strokeStyle='#8fa3c7';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-r*.7,-r*.7);ctx.lineTo(r*.7,r*.7);ctx.moveTo(-r*.7,r*.7);ctx.lineTo(r*.7,-r*.7);ctx.stroke();}
    ctx.restore();}};
{
  { const sp=SL.spawn;SL.spawn=function(f){if(f[0]==='K'){if(CAR.on())CAR.spawn();return;}return sp.apply(this,arguments);}; }
  { const d0=drawEnemy;drawEnemy=function(e,t){if(e&&e.carC)return CAR.draw(e,t);return d0.apply(this,arguments);}; }
  NR.on('runStart',()=>{CAR.c=null;S1F.car=null;if(CAR.on())SL.T[1]=S1F.TC;});
  NR.on('beat',()=>{if(CAR.c&&CAR.on())CAR.beat();});
  NR.on('tick',dt=>CAR.tick(dt));
  NR.on('kill',o=>{const e=o&&o.e;if(!e||!e.carC||!S1F.car)return;S1F.car.t1=+G.t.toFixed(1);S1F.car.how='kill';banner('CARRIER DOWN','',false,1.6);
    for(let k=0;k<6;k++)G.pk.push({t:'shard',x:e.x+rnd(-20,20),y:e.y+rnd(-40,40),vx:rnd(-80,0),vy:rnd(-70,70),bob:0});});
}
