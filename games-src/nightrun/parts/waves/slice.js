// PURPOSE: stages 1-3 (Normal story) play a hand-authored, bar-timed script with three readable roles and one decision per stage
// FLAG: slice (?slice=0)
// TEST: qa/slice-test.js
/* ---------- slice.js (S1, 22 Oct 2026; players: "a swarm, no logic", "enemies fly past and don't die", "no beat, no tension"). Design: nightrun/SLICE.md.
   Rides on waves.js: WV.on() keeps the director, zoo, fleet and set pieces muted; WV.tick moves the foes (hold / sine / dash / sit). This layer only
   decides WHAT enters WHEN: a script in bars, one foe per beat, fixed hull per role, a life after which the foe drifts out slowly (no fly-through),
   and one decision per stage (stage 1 BOUNTY, stage 2 POWER IN THE ARC, stage 3 LEADER). Stats for the test: SL.log. ---------- */
if(RET.slice===undefined)RET.slice=!/[?&]slice=0/.test(location.search);
const SL=window.SL={
  /* roles: hull, life on screen (s) before it drifts out, waves.js move */
  R:{P:['drone',2,7,'sine'],S:['turret',14,12,'sit'],C:['charger',2,11,'dash'],T:['gunship',30,18,'hold'],B:['drone',4,6,'hold'],L:['turret',22,16,'sit']},
  DRIFT:60,CAP:6,BK:{1:1,2:1.1,3:1.15},FN:{1:0,2:0,3:2},
  /* script: stage -> [bar, foes, opts]; a foe = role letter + slot x,y (shares of W,H) [+ side 't'/'b']; foes of one group enter on successive beats.
     opts: {dec:'bounty'|'power'|'lead', ann:[title, line]} ; loop: [fromBar, toBar] repeats while the stage still runs (kill stage) */
  T:{
    1:{g:[[1,[['P',.62,.3],['P',.66,.5],['P',.62,.7]]],[3,[['P',.6,.22],['P',.68,.5],['P',.6,.78]]],[5,[['P',.58,.3],['P',.66,.42],['P',.66,.58],['P',.58,.7]]],
         [8,[['S',.74,.5],['P',.6,.3],['P',.6,.7]]],[11,[['C',.72,.3],['C',.72,.7],['P',.6,.45],['P',.6,.6]]],
         [14,[['S',.76,.25],['S',.76,.75],['P',.6,.35],['P',.62,.5],['P',.6,.65]]],[17,[['C',.7,.4],['C',.7,.6]]],
         [22,[['S',.72,.55],['B',.86,.13,'t']],{dec:'bounty',ann:['BOUNTY','a gold courier in the corner: catch it before it goes']}],
         [26,[['T',.76,.5],['P',.6,.25],['P',.6,.75],['P',.64,.5]]],[29,[['C',.72,.3],['C',.72,.7],['P',.6,.4],['P',.6,.6]]],[32,[['P',.62,.3],['P',.66,.5],['P',.62,.7]]]]},
    2:{g:[[1,[['P',.6,.3],['P',.66,.4],['P',.66,.6],['P',.6,.7]]],[4,[['P',.58,.2],['P',.64,.4],['P',.64,.6],['P',.58,.8]]],
         [7,[['S',.74,.5],['P',.6,.3],['P',.6,.5],['P',.6,.7]]],[10,[['C',.7,.25],['C',.74,.5],['C',.7,.75]]],
         [13,[['S',.76,.3],['S',.76,.7],['C',.7,.5],['C',.7,.2],['P',.6,.5]]],
         [20,[['S',.72,.5],['P',.62,.25],['P',.62,.75]],{dec:'power',ann:['POWER IN THE ARC','a power-up in front of the gun: grab it now or wait']}],
         [24,[['T',.76,.5],['S',.7,.2],['P',.6,.3],['P',.6,.7]]],[28,[['C',.72,.3],['C',.72,.7],['S',.76,.5],['P',.6,.35],['P',.6,.65]]],
         [31,[['S',.76,.3],['S',.76,.7],['P',.6,.2],['P',.64,.4],['P',.64,.6],['P',.6,.8]]]],loop:[7,34]},
    3:{g:[[1,[['P',.58,.25],['P',.64,.38],['P',.68,.5],['P',.64,.62],['P',.58,.75]]],[4,[['S',.74,.5],['P',.6,.3],['P',.6,.5],['P',.6,.7]]],
         [7,[['C',.7,.25],['C',.74,.5],['C',.7,.75],['P',.6,.4],['P',.6,.6]]],[10,[['S',.76,.25],['S',.76,.75],['P',.6,.35],['P',.62,.5],['P',.6,.65]]],
         [14,[['L',.76,.5],['P',.62,.2],['P',.66,.35],['P',.68,.5],['P',.66,.65],['P',.62,.8]],{dec:'lead',ann:['LEADER','kill the gold gun and its escort scatters, points and all']}],
         [22,[['T',.76,.5],['S',.7,.18],['S',.7,.82],['P',.6,.4],['P',.6,.6]]],
         [26,[['L',.76,.5],['P',.62,.2],['P',.66,.35],['P',.68,.5],['P',.66,.65],['P',.62,.8]],{dec:'lead',ann:['LEADER','again: farm the escort or break the leader']}],
         [30,[['C',.7,.3],['C',.7,.7],['S',.76,.5],['P',.6,.4],['P',.62,.5],['P',.6,.6]]]],loop:[4,34]}},
  st:{q:[],gi:0,off:0,n:0,lead:null},
  log:{sp:[],maxOn:0,dec:[]},
  on(){return!!RET.slice&&WV.on()&&ST.n>=1&&ST.n<=3&&SET.diff==='normal'&&!!this.T[ST.n];},
  total(n){let k=0;for(const g of this.T[n].g)k+=g[1].length;return k;},
  reset(){this.st={q:[],gi:0,off:0,n:this.on()?ST.n:0,lead:null};this.log={sp:[],maxOn:0,dec:[]};if(this.on())WV.st.phase='slice';this.goal();},
  goal(){if(!this.on())return;const g=ST.def.goal,k=this.total(ST.n);if(g.k==='kill')ST.kv=Math.round(.72*k);if(g.k==='score')ST.sv=Math.round(.72*k*650/500)*500;},
  alive(){return WV.st.foes.filter(e=>!e.dead&&e.hp>0&&e.sl);},
  spawn(f,o,beat){const R=this.R[f[0]];const n0=WV.st.foes.length;WV.spawn([R[0],f[1],f[2],R[3],f[3]],-1);const e=WV.st.foes[n0];if(!e)return;
    e.el=0;e.hp=e.max=R[1];e.sl={role:f[0],life:R[2],t:0,out:0};if(R[0]==='turret'||R[0]==='gunship')e.score=R[0]==='turret'?300:900;
    const rec={role:f[0],t0:+G.t.toFixed(3),beat,ph:+(BT.spb*1000*Math.abs(bpos()-Math.round(bpos()))).toFixed(1),tin:-1,t1:-1,how:''};e.sl.rec=rec;this.log.sp.push(rec);
    if(f[0]==='B'){e.ldr=1;e.score=200;e.bty=1;}
    if(f[0]==='L'){e.ldr=1;e.el=1;this.st.lead=e;}
    if(o&&o.dec==='power'&&R[0]==='turret'){const p={t:'pw',k:PW.pick(),x:f[1]*W-70,y:f[2]*H,vx:-14,vy:0,bob:0,slp:1};G.pk.push(p);this.st.pk=p;}},
  /* every beat: groups whose bar has come enter one foe per beat */
  beat(i){const S=this.st,L=this.T[ST.n];if(!L||ST.over)return;
    const bar=Math.floor(i/4)-S.off;
    while(S.gi<L.g.length&&L.g[S.gi][0]<=bar&&i%4===0){const g=L.g[S.gi++],bq=WV.bopen(g[1].length);g[1].forEach((f,k)=>S.q.push({b:i+k,f,o:g[2],first:k===0,bq}));}
    if(S.gi>=L.g.length&&L.loop&&bar>=L.loop[1]){S.gi=L.g.findIndex(g=>g[0]>=L.loop[0]);S.off+=L.loop[1]-L.loop[0];}
    let on=0;for(const e of G.en)if(e.type!=='boss'&&e.hp>0&&!e.dead)on++;
    for(let k=S.q.length-1;k>=0;k--){const q=S.q[k];if(q.b>i)continue;if(on>=this.CAP){q.b=i+1;continue;}on++;S.q.splice(k,1);
      if(q.first&&q.o&&q.o.ann){if(!RET.purelook){banner(q.o.ann[0],q.o.ann[1],false,2.6);if(G.banner){G.banner.sm=1;G.banner.wv=1;}}this.log.dec.push({k:q.o.dec,t:+G.t.toFixed(1),got:0});}
      WV.cur=q.bq||null;this.spawn(q.f,q.o,i);WV.cur=null;}},   // W293: the group is one bounty squad (waves.js WV.bopen)
  tick(dt){if(!this.on()||!running||G.dead||ST.over)return;if(this.st.n!==ST.n)this.reset();WV.st.phase='slice';
    let on=0;for(const e of G.en)if(e.type!=='boss'&&e.hp>0&&!e.dead)on++;this.log.maxOn=Math.max(this.log.maxOn,on);
    for(const e of WV.st.foes){const s=e.sl;if(!s)continue;const r=s.rec;
      if(r.tin<0&&e.x<W-(e.r||14))r.tin=G.t;
      if(e.dead||e.hp<=0){if(r.t1<0){r.t1=G.t;r.how=e.hp<=0?'kill':'gone';}continue;}
      if(!e.wv||e.wv.st==='in')continue;s.t+=dt;
      if(s.t>=s.life&&!s.out){s.out=1;if(e.wv.mv==='dash'){e.wv.mv='hold';e.aimL=0;}if(e.wv.mv==='sit')e.stop=-1;}
      if(e.wv.st==='out'){e.wv.st='on';s.out=1;if(e.wv.mv==='dash'){e.wv.mv='hold';e.aimL=0;}}   // waves.js' fast retreat becomes the slow drift
      if(s.out){e.wv.sx+=this.DRIFT*dt;if(e.x>W+30){e.dead=1;r.t1=G.t;r.how='left';}}}
    const pk=this.st.pk;if(pk&&!G.pk.includes(pk)){this.st.pk=null;const d=this.log.dec[this.log.dec.length-1];if(d&&Math.hypot(pk.x-P.x,pk.y-P.y)<80)d.got=1;}
    const ld=this.st.lead;if(ld&&(ld.dead||ld.hp<=0)){this.st.lead=null;if(ld.hp<=0){for(const e of this.alive())e.sl.t=e.sl.life;floater(W*.55,H*.5,'LEADER DOWN: THE ESCORT SCATTERS','#ffd23d');const d=this.log.dec[this.log.dec.length-1];if(d)d.got=1;}}}};
{
  { const b=WV.beat;WV.beat=function(i){if(SL.on())return SL.beat(i);return b.call(this,i);}; }
  { const g=WV.goal;WV.goal=function(){const r=g.apply(this,arguments);try{SL.goal();}catch(e){}return r;}; }
  NR.on('kill',o=>{const e=o&&o.e;if(!e||!e.sl)return;G.rings.push({x:e.x,y:e.y,l:.22,m:.22,c:'#ffffff'});
    if(e.bty){G.score+=1000;G.pk.push({t:'hp',x:e.x,y:e.y,vx:-120,vy:0,bob:0});floater(e.x,e.y-22,'BOUNTY +1000','#ffd23d');const d=SL.log.dec[SL.log.dec.length-1];if(d)d.got=1;}});
  if(window.CTR){const cb=CTR.bar;CTR.bar=function(){if(SL.on())return;return cb.apply(this,arguments);};}   // counter.js' unannounced red seekers / walls: on the slice every threat is a foe you can see
  { const e0=eb,src='src';eb=function(x,y,a,sp){const e=eb[src];if(e&&e.sl&&SL.on())sp*=SL.BK[ST.n]||1;e0.src=e;const r=e0.call(this,x,y,a,sp,...[].slice.call(arguments,4));e0.src=null;return r;}; }   // the stage's bullet speed (slice foes only)
  { const f0=fan;fan=function(e,n){if(e&&e.sl&&SL.on())n+=SL.FN[ST.n]||0;return f0.apply(this,[e,n].concat([].slice.call(arguments,2)));}; }   // the stage's fan width (slice shooters only)
  NR.on('runStart',()=>SL.reset());
  NR.on('tick',dt=>SL.tick(dt));
}
