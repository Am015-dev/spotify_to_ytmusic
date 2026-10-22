// PURPOSE: wave foes act: fast swoop in, weave and reposition, slide toward the ship's lane, dodge shots, lead their aim, fire tell-then-burst, charge when close
// FLAG: alive (?alive=0 = the old hold/sine/sit movers and beat shots)
// TEST: qa/alive-test.js
/* ---------- alive.js (E1, owner 22 Oct 2026, 2/100: "the bullets are so slow; the enemies are sleeping. NOT FUN!").
   Rides on waves.js (and slice.js on stages 1-3): WV/SL still decide WHO enters WHEN, the caps (<= 6 threats) and the exits (no fly-through).
   This layer only takes over HOW a wave foe moves and shoots while it is on the field (wv.st 'in'/'on', not leaving):
   - entry: ease-out swoop on a curve, 0.4-0.7 s (was a straight 300 px/s glide);
   - on the field: weave around an anchor that glides to a new spot every 0.9-1.5 s and slides toward the ship's lane (each foe keeps its own offset);
     a player shot coming down its lane makes it sidestep (cooldown, so it can still be hit);
   - shots: a 0.35 s tell (the hull glow e.arm), then a burst of 2-3 fans that bracket the ship: where it is heading (lead from its velocity), then where it is, bullets 1.25x faster;
   - charge: drones / chargers / flankers within 300 px (chargers also every few seconds) show a red aim line for 0.35 s, then ram the predicted spot,
     brake before the left edge and swoop back (one at a time on stage 1, two from stage 2).
   Player decision it sharpens: keep moving vs. stay in a lane to aim; a foe that reads you must be beaten by changing direction after its tell. ---------- */
if(RET.alive===undefined)RET.alive=!/[?&]alive=0/.test(location.search);
const AL=window.AL={
  BK:1.25,TELL:.35,rams:0,CHR:460,CD:{1:.6,2:.5,3:.45},
  /* type -> [burst shots, spread (rad), base speed (before x1.25), cooldown s, weave x, weave y, entry s] */
  K:{drone:[2,.16,170,2.1,34,58,.45],flank:[2,.16,170,2.1,34,58,.45],swarm:[1,0,160,3,36,62,.4],charger:[1,0,180,3.2,28,50,.45],
     turret:[3,.2,175,2.3,10,30,.7],gunship:[3,.12,200,2.6,16,34,.65],shielder:[2,0,170,2.8,14,30,.6],mine:[0,0,0,9,18,30,.6]},
  pv:{x:0,y:0,vx:0,vy:0},
  on(){return!!RET.alive&&WV.on()&&!(G.boss&&G.boss.mini)&&!G.lab&&!G.tut;},
  k(e){return this.K[e.type]||this.K.drone;},
  nch(){let n=0;for(const e of WV.st.foes)if(e.al&&(e.al.ph==='tell'||e.al.ph==='charge')&&!e.dead&&e.hp>0)n++;return n;},
  leaving(e){return!e.wv||e.wv.st==='out'||(e.sl&&e.sl.out);},
  maxX(){return window.HB&&HB.on()?HB.maxX(22):W-50;},
  init(e,i){const k=this.k(e),v=e.wv;
    e.al={ph:'in',t:0,x0:e.x,y0:e.y,ax:v.sx,ay:v.sy,tx:v.sx,ty:v.sy,dur:k[6]+GR()*.25,arc:(GR()<.5?-1:1)*(40+GR()*50),
      ofs:((i%5)-2)*H*.11,rp:.9+GR()*.6,cd:.6+GR()*1.2,fs:0,ft:0,fn:0,dg:0,dgc:0,cc:1.2+GR()*1.5,w:GR()*6.28};},
  /* where the ship will be in s seconds (clamped to the field) */
  lead(s){const p=this.pv;return{x:clamp(P.x+p.vx*s,20,W*.6),y:clamp(P.y+p.vy*s,24,H-24)};},
  fire(e,i){const k=this.k(e),sp=k[2]+12*(diff()-1),d=Math.hypot(P.x-e.x,P.y-e.y),q=this.lead(i%2?0:Math.min(1.1,d/(sp*this.BK))),a=Math.atan2(q.y-e.y,q.x-e.x);   // odd shots of a burst go where the ship IS: a bracket, not one line to sidestep
    const n=k[1]?3:1;eb.src=e;for(let j=0;j<n;j++)eb(e.x-18,e.y,a+(j-(n-1)/2)*k[1],sp,e.el?'#ffd23d':e.type==='turret'||e.type==='gunship'?'#ffa02d':undefined);eb.src=null;},
  tick(dt){if(!this.on()||!running||G.dead||ST.over||!dt)return;
    const p=this.pv;if(p.t){p.vx+=((P.x-p.x)/dt-p.vx)*Math.min(1,dt*6);p.vy+=((P.y-p.y)/dt-p.vy)*Math.min(1,dt*6);}p.x=P.x;p.y=P.y;p.t=1;
    const mx=this.maxX();let i=0;
    for(const e of WV.st.foes){if(e.dead||e.hp<=0||!e.wv)continue;i++;
      if(this.leaving(e)){if(e.al){e.al.ph='out';e.aimL=0;}if(e.sl&&e.sl.out)e.wv.sx+=110*dt;continue;}   // slice's slow drift out: brisker
      if(!e.al)this.init(e,i);const a=e.al,k=this.k(e);a.t+=dt;
      e.bf=99;   // the beat shots of b.js are replaced by the tell + burst below
      if(a.ph==='in'){const u=Math.min(1,a.t/a.dur),s=1-Math.pow(1-u,3),dx=a.ax-a.x0,dy=a.ay-a.y0,l=Math.hypot(dx,dy)||1,o=Math.sin(Math.PI*u)*a.arc;
        e.x=a.x0+dx*s-dy/l*o;e.y=a.y0+dy*s+dx/l*o;if(u>=1){a.ph='on';a.t=0;e.wv.st='on';e.wv.t=0;}e.by=e.y;continue;}
      e.wv.st='on';e.aimL=0;
      if(a.ph==='on'){
        a.rp-=dt;if(a.rp<=0){a.rp=.9+GR()*.6;a.tx=clamp(e.wv.sx+(GR()-.5)*W*.16,W*.5,mx);}   // a new spot every ~1.2 s
        a.ty=clamp(P.y+a.ofs+(e.wv.sy-H/2)*.35,40,H-40);                                      // its own offset around the ship's lane
        const ms=(e.type==='turret'?70:e.type==='gunship'?90:150)*dt;a.ax+=clamp(a.tx-a.ax,-ms*1.6,ms*1.6);a.ay+=clamp(a.ty-a.ay,-ms,ms);
        if(a.dgc>0)a.dgc-=dt;else if(e.type!=='turret'&&e.type!=='gunship')for(const b of G.pb){if(b.x<e.x&&b.x>e.x-230&&Math.abs(b.y-e.y)<(e.r||14)+12){a.dg=(b.y<e.y?1:-1)*240;a.dgc=1.1;break;}}
        if(a.dg){a.ay=clamp(a.ay+a.dg*dt,40,H-40);a.dg*=Math.pow(.02,dt);if(Math.abs(a.dg)<20)a.dg=0;}
        e.x=a.ax+Math.sin(G.t*2.9+a.w)*k[4];e.y=clamp(a.ay+Math.sin(G.t*2.3+a.w*1.3)*k[5],30,H-30);
        /* fire: tell (hull glow) then the burst */
        if(a.fs===0&&k[0]){a.cd-=dt;if(a.cd<=0&&e.x<W-30&&e.x>P.x+90&&Math.hypot(e.x-P.x,e.y-P.y)>140){a.fs=1;a.ft=this.TELL;}}
        if(a.fs===1){e.arm=true;a.ft-=dt;if(a.ft<=0){a.fs=2;a.fn=k[0];a.ft=0;}}
        if(a.fs===2){e.arm=false;a.ft-=dt;if(a.ft<=0){this.fire(e,a.fn);a.fn--;a.ft=.12;if(a.fn<=0){a.fs=0;a.cd=k[3]*(.85+GR()*.3)*(this.CD[ST.n]||.6);}}}
        if(a.fs===0)e.arm=false;
        /* charge: close drones / flankers, chargers on their own clock */
        const rammer=e.type==='charger'||e.type==='drone'||e.type==='flank'||e.type==='swarm';a.cc-=dt;
        if(rammer&&this.nch()<(ST.n>=2?2:1)&&a.fs===0&&a.cc<=0&&e.x>P.x+80&&(Math.hypot(e.x-P.x,e.y-P.y)<this.CHR||e.type==='charger')){a.ph='tell';a.t=0;a.fs=0;e.arm=false;}}
      else if(a.ph==='tell'){const q=this.lead(.45);a.gx=q.x;a.gy=q.y;e.aimL=0;e.x+=(GR()-.5)*3;   // a shiver and the red aim line
        if(a.t>=this.TELL){a.ph='charge';a.t=0;const dx=a.gx-e.x,dy=a.gy-e.y,l=Math.hypot(dx,dy)||1,v=e.type==='charger'?820:720;a.vx=dx/l*v;a.vy=dy/l*v;a.left=Math.min(l+60,380);}}
      else if(a.ph==='charge'){e.aimL=0;if(Math.hypot(P.x-e.x,P.y-e.y)<(e.r||14)+16&&!(P.inv>0)){const h0=P.hp;hurt(2);if(P.hp<h0)AL.rams++;}   // a ram that lands costs 2 hull (b.js' body hit is 1)
        if(a.t<.15){const dx=P.x-e.x,dy=P.y-e.y,l=Math.hypot(dx,dy)||1,v=Math.hypot(a.vx,a.vy);a.vx+=(dx/l*v-a.vx)*dt*6;a.vy+=(dy/l*v-a.vy)*dt*6;}const s=Math.hypot(a.vx,a.vy)*dt;e.x+=a.vx*dt;e.y=clamp(e.y+a.vy*dt,24,H-24);a.left-=s;
        if(a.left<=0||e.x<60||a.t>.8){a.ph='back';a.t=0;a.x0=e.x;a.y0=e.y;a.ax=clamp(e.wv.sx,W*.5,mx);a.ay=clamp(P.y+a.ofs,40,H-40);a.dur=.6;a.arc=(GR()<.5?-1:1)*50;a.cc=1.4+GR()*1.4;}}
      else if(a.ph==='back'){const u=Math.min(1,a.t/a.dur),s=1-Math.pow(1-u,3),dx=a.ax-a.x0,dy=a.ay-a.y0,l=Math.hypot(dx,dy)||1,o=Math.sin(Math.PI*u)*a.arc;
        e.x=a.x0+dx*s-dy/l*o;e.y=a.y0+dy*s+dx/l*o;if(u>=1){a.ph='on';a.t=0;a.tx=a.ax;}}
      e.by=e.y;}}};
if(RET.alive){   // off: no wrapper at all, the old game runs untouched
  /* enemy bullets 1.25x faster (not the boss's patterns) */
  { const e0=eb;eb=function(x,y,a,sp){const s=eb.src;if(AL.on()&&running&&!(s&&s.type==='boss'))sp*=AL.BK;e0.src=s;try{return e0.apply(this,[x,y,a,sp].concat([].slice.call(arguments,4)));}finally{e0.src=null;}}; }
  /* the charge tell: a red dashed line to the spot it will ram (draw.js' own charger line stays off: e.aimL=0) */
  { const d0=drawEnemy;drawEnemy=function(e,t){const r=d0.apply(this,arguments);const a=e.al;
      if(a&&a.ph==='tell'&&a.gx!=null){ctx.save();ctx.strokeStyle='#ff3040';ctx.globalAlpha=.75;ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(a.gx,a.gy);ctx.stroke();ctx.restore();}
      return r;}; }
  NR.on('runStart',()=>{AL.pv={x:P.x,y:P.y,vx:0,vy:0};AL.rams=0;});
  NR.on('tick',dt=>AL.tick(dt));
}
