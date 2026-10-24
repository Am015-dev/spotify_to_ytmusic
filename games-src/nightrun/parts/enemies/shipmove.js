// PURPOSE: ship scale by class (enemies relative to the player hull), enemies bank along their velocity, exits ease and weave instead of a constant drift
// FLAG: shipmove (?shipmove=1; default OFF until guard.py and the smoke pass)
// TEST: qa/shipmove-test.js
/* ---------- shipmove.js (W210, owner 24 Oct 2026: "the ships are either very small, moving mechanically").
   Sizes (art only, from the flame sheet's drawn width e._fw): small fighters 0.8x the player hull, shielders / turrets 1.1x, gunships 1.5x; bosses and carriers belong to the boss workers and stay.
   Hit radius grows by half of the art growth, so a bigger ship is also a bigger target without making the field a wall.
   Motion: the sprite tilts toward its velocity (eased); a foe that drifts out of the field accelerates along a sine instead of 110 px/s on a straight line (alive.js calls SHM.exit). ---------- */
if(RET.shipmove===undefined)RET.shipmove=/[?&]shipmove=1/.test(location.search);
const SHM=window.SHM={
  REL:{drone:.8,charger:.8,swarm:.8,flank:.8,mine:.8,kamikaze:.8,shielder:1.1,turret:1.1,gunship:1.5},
  on(){return!!RET.shipmove&&!G.lab&&!G.tut;},
  /* player hull length in world units: the flame sheet's drawn width without the jet (80%) */
  hullLen(){try{const id=shipDef().id,cb=ART.ANIM.c['ship-'+id],f=ART.ANIM.s['ship-'+id+'/flame'];return f&&cb?f[2]*cb.k*.8:60;}catch(err){return 60;}},
  /* art width before this layer: e._fw once the sheet drew it, else 3.4 x radius (foeart's usual k); the factor is fixed on first sight so sim and render agree */
  f(e){return e._smf||1;},
  fix(e){const rel=this.REL[e.type];if(!rel||e._smf!=null||e.mini||e.type==='boss')return;e._smf=Math.max(1,Math.min(3,rel*this.hullLen()/(e._fw||e.r*3.4)));e.r*=1+(e._smf-1)*.5;},
  exit(e,dt){e._sx=(e._sx||0)+dt;const k=Math.min(1,e._sx/1.2);if(e.wv)e.wv.sy+=Math.sin(e._sx*3.2+e.x*.01)*70*dt;return(60+170*k*k)*dt;},
  sample(){const o={};try{for(const e of G.en)if(e._smf&&!(e.type in o))o[e.type]=+((e._fw||e._r0||e.r*3.4/(1+(this.f(e)-1)*.5))*this.f(e)/this.hullLen()).toFixed(2);}catch(err){}return o;}
};
/* movers nobody else steers (ground turrets on the scroll, plain drifters) sway on a slow sine, so no ship holds one velocity for a second */
NR.on('tick',dt=>{if(!SHM.on()||!dt)return;for(const e of G.en){SHM.fix(e);
  if(e.al||e.dead||e.hp<=0||e.mini||e.type==='boss'||e.type==='gate'||e.type==='carrier')continue;
  const p=e._smp==null?(e._smp=(e.y*.013+e.x*.007)%6.28):e._smp,t=G.t;e.x+=Math.sin(t*1.7+p)*24*dt;e.y=Math.max(30,Math.min(H-30,e.y+Math.cos(t*1.3+p)*34*dt));}});
HOOK.drawEnemy(de=>function(e,t){
  if(!SHM.on()||e.type==='boss'||e.mini||e.type==='carrier'||e.type==='gate')return de.apply(this,arguments);
  const dt=t-(e._smt||t);if(dt>0&&dt<.1){const vx=(e.x-e._smx)/dt,vy=(e.y-e._smy)/dt;e._svx=(e._svx||0)+(vx-(e._svx||0))*Math.min(1,dt*8);e._svy=(e._svy||0)+(vy-(e._svy||0))*Math.min(1,dt*8);}
  e._smt=t;e._smx=e.x;e._smy=e.y;
  let a=Math.atan2(e._svy||0,e._svx||0)-Math.PI;if(a<-Math.PI)a+=2*Math.PI;if(!(Math.abs(e._svx||0)+Math.abs(e._svy||0)>40))a=0;   // sprites face left; a still foe stays level
  a=Math.max(-.5,Math.min(.5,a))*.7;const f=SHM.f(e);
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(a);ctx.scale(f,f);ctx.translate(-e.x,-e.y);
  try{return de.apply(this,arguments);}finally{ctx.restore();}});
