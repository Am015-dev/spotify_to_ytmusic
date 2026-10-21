/* ---------- fleet.js: four enemy warships in the fly stages (owner, 21 Oct 2026: "include enemy ships ... same as the fly stages difficulty will increase gradually").
   Flag RET.fleet, default ON; ?fleet=0 = the game as it was (no fleet waves, no extra dice).
   INTERCEPTOR (story stage 6+): fast and fragile. Strafes on a station >= 4 s firing aimed pairs, then shows its dive line for .7 s (kinked where it will swerve),
      dives along it, swerves once at the kink and leaves on the left. Step off the line.
   BOMBER (10+): slow. Every 4 beats lays a bomb line across the ship (4 blasts in a column, then a row) with a .75 s ground ring; only inside a ring hurts.
   CARRIER (16+): launches 2 (later 3) small drones that orbit it; while one of its drones lives its shield takes every hit. Kill the drones, then the hull;
      it relaunches 8 beats after the shield drops.
   CRUISER (22+): mini-boss. Three turrets (one falls silent per third of hull lost) and a rotating twin beam: .9 s dashed warning, 3 s live, 2.5 s off.
      Once a stage, never on a boss stage, and it pulls out when a boss arrives.
   RAMP (n = story stage; endless n = 1 + seconds / 13): a kind enters single and rare (weight .5) for its first 4 stages, then in pairs (carrier: 3 drones),
      from 8 stages on in mixed groups (interceptors escort bombers, carriers and cruisers). Share of waves: .07 at stage 6, +.012 a stage, at most .24.
      Easy drops one unit of a group, Hard and above add an interceptor. Fire rates use diff() and frK() like zoo.js; caps per kind (K.max) and the zoo / pacing crowd caps hold.
   Hulls: en() (stage curve, power) then held in the pacing band, in hits of what the ship does per hit (PAC.dph x UPS.hp): interceptor 2-3, drone 1,
      bomber and carrier 6-9, cruiser 14-18. armour.js and hard.js are not touched. Dwell >= 4 s on screen before leaving; nothing fires, blasts or beams off screen;
      bullets go through eb() (ebCap, BCAP). Art: code shapes; FLEET.spr() draws the approved sheets (anim/ship-e<kind>/flame|volley|death) once ART.drawAnim
      exists and RET.sprites is on. Test: nightrun/fleet-test.js. ---------- */
if(RET.fleet===undefined)RET.fleet=!/[?&]fleet=0/.test(location.search);
const FLEET=window.FLEET={
  K:{einterceptor:{k:'int',st:6,r:13,hp:3,score:260,col:'#ff6a3c',lo:2,hi:3,ml:1.2,w:0,max:4,hint:'INTERCEPTOR: step off its dive line'},
     ebomber:{k:'bom',st:10,r:20,hp:10,score:520,col:'#ffb43c',lo:6,hi:9,ml:2.6,w:1,max:2,hint:'HEAVY BOMBER: step out of the red line'},
     ecarrier:{k:'car',st:16,r:32,hp:24,score:1100,col:'#a07bff',lo:6,hi:9,ml:3,w:3,max:1,hint:'DRONE CARRIER: kill its drones to drop the shield'},
     ecruiser:{k:'cru',st:22,r:44,hp:60,score:3000,col:'#ff3d8a',lo:14,hi:18,ml:6,w:3,max:1,hint:'CRUISER: slip through the beam gap'},
     efdrone:{k:'drn',r:9,hp:1,score:60,col:'#c9a8ff',lo:1,hi:1,ml:.6,w:0,max:9}},
  ORDER:['einterceptor','ebomber','ecarrier','ecruiser'],
  ARR:1.7,   // arrival floor (s after it is fully on screen): the hull cannot reach 0 any sooner (like DMG.minLife but for every source, EMP and dash included), so a unit is seen for >= 1.5 s before it can die (industry S01); HP and shots-to-kill unchanged (damage above the floor counts)
  TELE:{dive:.7,bomb:.75,beam:.9},BR:46,BEAM:{L:360,w:9,spd:.55,live:3,off:2.5},
  SPR:{einterceptor:.1,ebomber:.13,ecarrier:.17,ecruiser:.22},
  bombs:[],fx:[],seen:{},run:{},cruKey:null,inited:false,stat:null,
  reset(){this.bombs=[];this.fx=[];this.run={};this.cruKey=null;
    this.stat={waves:[],kinds:{},dives:0,swerves:0,lines:0,blasts:0,launches:0,shDown:0,absorbed:0,beams:0,tele:{dive:9,bomb:9,beam:9},offFire:0,withBoss:0,dwell:{}};},
  on(){return !!RET.fleet;},
  n(){return ST.on?ST.n:1+G.t/13;},
  p(n){return n<6?0:Math.min(.24,.07+.012*(n-6));},
  tier(id,n){const a=n-this.K[id].st;return a<0?-1:a<4?0:a<8?1:2;},
  bossStage(){const g=ST.on&&ST.def&&ST.def.goal;return !!g&&(g.k==='boss'||g.k==='mini');},
  key(){return ST.on?'s'+ST.n:'t'+Math.floor(G.t/90);},
  ok(){return RET.fleet&&!G.lab&&!G.tut&&!G.boss&&!G.bossDone&&!ST.over&&!(window.LEAK&&LEAK.gapOn())&&!(ST.on&&ST.def&&ST.def.ch);},
  busy(){return (window.ZOO&&RET.zoo&&ZOO.count()>=ZOO.CAP())||(window.PAC&&PAC.on()&&PAC.soft()&&PAC.alive()>=PAC.cap());},
  alive(id){let c=0;for(const e of G.en)if(e.type===id&&e.hp>0&&!e.dead)c++;return c;},
  cruOK(){return !G.boss&&!this.bossStage()&&this.cruKey!==this.key()&&!this.alive('ecruiser');},
  unl(n){return this.ORDER.filter(id=>n>=this.K[id].st&&(id!=='ecruiser'||this.cruOK())&&this.alive(id)<this.K[id].max);},
  pick(n){const u=this.unl(n);if(!u.length)return null;
    const un=u.find(id=>!this.run[id]);if(un&&GR()<.7)return un;                       // a kind not seen this run comes first
    let tot=0;const w=u.map(id=>{const x=(this.tier(id,n)?1:.5)*(id==='ecruiser'?.6:1);tot+=x;return x;});let r=GR()*tot;
    for(let i=0;i<u.length;i++){r-=w[i];if(r<=0)return u[i];}return u[0];},
  group(id,n){const t=this.tier(id,n),I='einterceptor',B='ebomber';let g;
    if(id===I)g=t===0?[I]:t===1?[I,I]:[I,I,B];
    else if(id===B)g=t===0?[B]:t===1?[B,B]:[B,I,I];
    else g=t<2?[id]:[id,I,I];
    if(SET.diff==='easy'&&g.length>1)g.pop();
    if(HARDS.includes(SET.diff)&&t>=1)g.push(I);
    const c={};return g.filter(k=>{c[k]=(c[k]|0)+1;return this.alive(k)+c[k]<=this.K[k].max&&(k===id||n>=this.K[k].st);});},
  wave(n){const id=this.pick(n);if(!id)return false;const g=this.group(id,n),t=this.tier(id,n);if(!g.length)return false;
    this.run[id]=(this.run[id]|0)+1;if(id==='ecruiser')this.cruKey=this.key();
    if(this.stat.waves.length<200)this.stat.waves.push({n:Math.round(n),ids:g.slice(),t});
    const sy=gr(90,H-120);
    g.forEach((k,i)=>{const f=()=>{if(G.dead||ST.over)return;if(k==='ecruiser'&&(G.boss||this.bossStage()))return;
        const y=k===id?sy:clamp(sy+(i%2?-1:1)*gr(90,150),70,H-80);this.mk(k,{x:W+40+(k==='ecruiser'?40:0),y,nd:t>=1?3:2});};
      if(i===0)f();else DIR.later(i*2,f);});
    return true;},
  /* ---- one unit; hull from en() held in the pacing band ---- */
  mk(id,o){const T=this.K[id];const e=en(id,Object.assign({r:T.r,hp:T.hp,score:T.score,zt:1,vz:0,fl:T.k,bf:99},o||{}));
    if(window.PAC&&PAC.dph>0){const u=(window.UPS&&UPS.hp)||1;e.hp=clamp(e.hp,T.lo*PAC.dph*u,T.hi*PAC.dph*u);}   // not rounded: the band is in hits, whatever one hit takes off
    e.max=e.hq=e.hp;e.fs=0;e.t0=G.t;e.hb=0;if(T.k==='car'||T.k==='cru')e.noRam=1;
    this.stat.kinds[id]=(this.stat.kinds[id]|0)+1;return e;},
  mine(e){return e.fl&&this.K[e.type]&&e.hp>0&&!e.dead;},
  onScr(e){return e.x<W-40&&e.x>20&&e.y>10&&e.y<H-10;},
  ir(e,s){return this.onScr(e)&&e.x>P.x+60&&Math.hypot(e.x-P.x,e.y-P.y)>minShot(s);},
  fire(e,x,y,a,s,c){if(!this.onScr(e)){this.stat.offFire++;return;}eb.src=e;const k=e.arm;e.arm=true;eb(x,y,a,s,c);e.arm=k;eb.src=null;},
  leaveAt(e){if(e.ls==null){e.ls=G.t;const d=this.stat.dwell,k=e.type;if(e.tin!=null){(d[k]=d[k]||[]).push(+(G.t-e.tin).toFixed(2));}}},
  /* ---- movement (b.js has no case for these types; this runs on the game tick) ---- */
  mv(e,dt){const k=e.fl;
    if(k==='int'){
      if(e.fs===0){if(e.sx==null){e.sx=gr(W*.58,W*.8);e.sy=clamp(e.y,90,H-90);}e.x=Math.max(e.sx,e.x-380*dt);e.y+=clamp(e.sy-e.y,-200*dt,200*dt);
        if(e.x<=e.sx){e.fs=1;e.h0=G.t;e.ph=0;e.bf=2;}}
      else if(e.fs===1){e.ph+=dt;e.x=e.sx+Math.sin(e.ph*.9)*16;e.y=clamp(e.sy+Math.sin(e.ph*1.7)*Math.min(110,e.ph*60),60,H-60);
        if(G.t-e.h0>=Math.max(4.2,8*BT.spb)&&G.t-(e.tin==null?e.t0:e.tin)>=4)this.tele(e);}
      else if(e.fs===2){e.x=e.p[0].x+Math.sin(G.t*60)*1.5;if(G.t-e.tl0>=this.TELE.dive){this.stat.tele.dive=Math.min(this.stat.tele.dive,G.t-e.tl0);e.fs=3;e.seg=0;this.stat.dives++;this.leaveAt(e);AU.sfx('warn');}}
      else{const a=e.p[e.seg],b=e.p[e.seg+1],L=Math.hypot(b.x-a.x,b.y-a.y)||1,v=(HARDS.includes(SET.diff)?560:500)*dt;
        e.x+=(b.x-a.x)/L*v;e.y+=(b.y-a.y)/L*v;e.ang=Math.atan2(b.y-a.y,b.x-a.x);
        if((b.x-e.x)*(b.x-a.x)+(b.y-e.y)*(b.y-a.y)<=0){e.x=b.x;e.y=b.y;if(e.seg===0){e.seg=1;this.stat.swerves++;burst(e.x,e.y,this.K[e.type].col,8,160,.3);}else e.dead=1;}}
      return;}
    if(k==='bom'){
      if(e.fs===0){if(e.sx==null){e.sx=gr(W*.6,W*.78);e.sy=clamp(e.y,80,H-100);}e.x=Math.max(e.sx,e.x-150*dt);e.y+=clamp(e.sy-e.y,-90*dt,90*dt);if(e.x<=e.sx){e.fs=1;e.h0=G.t;e.drops=0;e.bc2=0;}}
      else if(e.fs===1){e.x-=6*dt;e.y=e.sy+Math.sin(e.t*.8)*30;if(e.drops>=3&&G.t-e.h0>=4.5){e.fs=2;this.leaveAt(e);}}
      else e.x-=80*dt;
      return;}
    if(k==='car'){
      if(e.fs===0){e.sx=e.sx||W-150;e.sy=e.sy||clamp(e.y,130,H-150);e.x=Math.max(e.sx,e.x-90*dt);e.y+=clamp(e.sy-e.y,-60*dt,60*dt);if(e.x<=e.sx){e.fs=1;e.h0=G.t;e.hb=0;this.launch(e);}}
      else if(e.fs===1){e.y=clamp(e.sy+Math.sin((G.t-e.h0)*.6)*60,90,H-90);if(e.hb>=32&&G.t-e.h0>=6){e.fs=2;this.leaveAt(e);}}
      else e.x-=70*dt;
      const n=this.kids(e);if(e.fsh&&!n){e.fsh=0;e.lb=G.bc;this.stat.shDown++;floater(e.x,e.y-e.r-18,'SHIELD DOWN','#4ad1ff');burst(e.x,e.y,'#4ad1ff',18,240,.4);AU.sfx('hit');}
      return;}
    if(k==='drn'){const c=e.par;
      if(!c||c.dead||c.hp<=0){e.fs=9;e.x-=220*dt;e.y+=clamp(P.y-e.y,-60*dt,60*dt);if(e.x<-30)e.dead=1;return;}
      e.oa+=1.5*dt;e.out=Math.min(1,(e.out||0)+dt*2);const R=(c.r+44)*e.out,tx=c.x+Math.cos(e.oa)*R,ty=c.y+Math.sin(e.oa)*R*.85;
      e.x+=(tx-e.x)*Math.min(1,dt*6);e.y+=(ty-e.y)*Math.min(1,dt*6);return;}
    if(k==='cru'){
      if(G.boss&&e.fs<2){e.fs=2;this.leaveAt(e);this.stat.withBoss++;}
      if(e.fs===0){e.sx=e.sx||W-170;e.sy=e.sy||clamp(e.y,150,H-170);e.x=Math.max(e.sx,e.x-70*dt);e.y+=clamp(e.sy-e.y,-50*dt,50*dt);
        if(e.x<=e.sx){e.fs=1;e.h0=G.t;e.hb=0;e.bm={ph:0,t:G.t+1.2,a:gr(0,6.28),dir:GR()<.5?-1:1};}}
      else if(e.fs===1){e.y=clamp(e.sy+Math.sin((G.t-e.h0)*.35)*50,100,H-100);this.beam(e,dt);if(e.hb>=64&&G.t-e.h0>=12){e.fs=2;this.leaveAt(e);}}
      else{e.x-=(G.boss?180:90)*dt;if(e.bm)e.bm.ph=0;}
      return;}},
  tele(e){   // dive line: from the station through the ship's locked spot to a kink 70 px past it, then a swerve of 31 degrees away from the near edge
    const px=clamp(P.x,40,W*.5),py=clamp(P.y,50,H-50),L=Math.hypot(px-e.x,py-e.y)||1,M={x:Math.max(20,px+(px-e.x)/L*70),y:clamp(py+(py-e.y)/L*70,30,H-30)},sw=M.y<H*.35?1:M.y>H*.65?-1:(GR()<.5?-1:1);
    e.p=[{x:e.x,y:e.y},M,{x:-80,y:clamp(M.y+sw*.6*(M.x+80),-40,H+40)}];e.fs=2;e.tl0=G.t;},
  kids(e){let n=0;for(const q of G.en)if(q.par===e&&q.hp>0&&!q.dead)n++;return n;},
  launch(e){const n=e.nd||2;for(let i=0;i<n;i++){const d=this.mk('efdrone',{x:e.x-e.r,y:e.y,par:e,oa:i*6.283/n+Math.PI});d.gr=0;d.bf=3+i*2;}
    e.fsh=1;e.lb=null;this.stat.launches++;this.fx.push({x:e.x-e.r,y:e.y,l:.5,m:.5,c:'#a07bff',k:'ring',r:44});},
  beam(e,dt){const B=this.BEAM,m=e.bm;if(!m)return;
    if(m.ph===0){if(G.t>=m.t&&this.onScr(e)){m.ph=1;m.t0=G.t;}}
    else if(m.ph===1){m.a+=m.dir*B.spd*dt;if(G.t-m.t0>=this.TELE.beam){this.stat.tele.beam=Math.min(this.stat.tele.beam,G.t-m.t0);m.ph=2;m.t0=G.t;this.stat.beams++;AU.sfx('warn');}}
    else{m.a+=m.dir*B.spd*dt;
      if(!G.dead&&this.onScr(e)){const dx=P.x-e.x,dy=P.y-e.y,al=dx*Math.cos(m.a)+dy*Math.sin(m.a),pe=Math.abs(-dx*Math.sin(m.a)+dy*Math.cos(m.a));
        if(pe<B.w&&Math.abs(al)>e.r&&Math.abs(al)<B.L)hurt();}
      if(G.t-m.t0>=B.live){m.ph=0;m.t=G.t+B.off;m.dir=-m.dir;}}},
  /* ---- the beat: shots, bomb lines, launches ---- */
  beat(e,d){if(e.dead||e.hp<=0||G.dead)return;const k=e.fl,T=this.K[e.type];e.hb=(e.hb|0)+1;
    if(k==='int'){if(e.fs!==1){e.arm=false;return;}const s=170+15*d;
      if(--e.bf<=0){if(this.ir(e,s)){const a=aim(e);this.fire(e,e.x-e.r,e.y,a-.08,s,T.col);this.fire(e,e.x-e.r,e.y,a+.08,s,T.col);}e.bf=fireIn(gx(2.2,3.2)/d/frK());}
      e.arm=e.bf===1&&this.ir(e,s);return;}
    if(k==='bom'){if(e.fs!==1)return;e.bc2++;e.arm=e.bc2%4===3;if(e.bc2%4)return;if(!this.onScr(e))return;this.line(e);return;}
    if(k==='car'){if(e.fs!==1){e.arm=false;return;}if(!e.fsh&&e.lb!=null&&G.bc-e.lb>=8&&this.onScr(e))this.launch(e);e.arm=!e.fsh&&e.lb!=null&&G.bc-e.lb===7;return;}
    if(k==='drn'){if(e.fs===9||!e.par)return;const s=130+10*d;if(--e.bf<=0){if(this.ir(e,s))this.fire(e,e.x,e.y,aim(e),s,T.col);e.bf=fireIn(gx(3,4.5)/d/frK());}e.arm=e.bf===1;return;}
    if(k==='cru'){if(e.fs!==1){e.arm=false;return;}const s=160+15*d,lv=this.guns(e);
      if(--e.bf<=0){if(this.ir(e,s)&&lv){const g=this.gun(e,(e.ti=(e.ti|0)+1)%lv);this.fire(e,g.x,g.y,Math.atan2(P.y-g.y,P.x-g.x),s,T.col);}e.bf=fireIn(gx(1.2,1.8)/d/frK());}
      e.arm=e.bf===1;}},
  guns(e){return clamp(Math.ceil(3*e.hp/e.max),0,3);},
  gun(e,i){const r=e.r;return [{x:e.x-r*.9,y:e.y},{x:e.x-r*.55,y:e.y-r*.55},{x:e.x-r*.55,y:e.y+r*.55}][i];},
  line(e){const R=this.BR,col=(e.drops|0)%2===0,L=[],sp=R*2+14;
    if(col){const x=clamp(P.x+gr(-25,25),60,W-80),y0=clamp(P.y-gr(0,3)*sp,R+6,H-R-6-3*sp);for(let i=0;i<4;i++)L.push({x,y:y0+i*sp});}
    else{const y=clamp(P.y+gr(-20,20),R+10,H-R-10),x0=clamp(P.x-gr(0,3)*sp,R+6,W-R-60-3*sp);for(let i=0;i<4;i++)L.push({x:x0+i*sp,y});}
    const id=++this.stat.lines;for(const q of L)this.bombs.push({x:q.x,y:q.y,t0:G.t,R,id,sx:e.x,sy:e.y+e.r*.6});e.drops=(e.drops|0)+1;},
  /* ---- timers: bombs, beams, fx; movement of every fleet unit ---- */
  tick(dt){if(!RET.fleet||!running||G.dead||ST.over||SH.active)return;
    for(const e of G.en)if(this.mine(e))this.mv(e,dt);
    const hit={};
    for(const b of this.bombs){if(b.f)continue;if(G.t-b.t0>=this.TELE.bomb){b.f=1;this.stat.blasts++;this.stat.tele.bomb=Math.min(this.stat.tele.bomb,G.t-b.t0);
        this.fx.push({x:b.x,y:b.y,l:.4,m:.4,c:'#ffb43c',k:'blast',r:b.R});burst(b.x,b.y,'#ffb43c',14,260,.4);
        if(!G.dead&&!hit[b.id]&&Math.hypot(P.x-b.x,P.y-b.y)<b.R+6){hit[b.id]=1;hurt();}}}
    if(this.bombs.some(b=>b.f)){shake(4);AU.sfx('boom');}
    this.bombs=this.bombs.filter(b=>!b.f);
    for(const f of this.fx)f.l-=dt;this.fx=this.fx.filter(f=>f.l>0);},
  /* ---- looks: code shapes until the sprite loader lands ---- */
  spr(e,t){if(!this.SPR[e.type]||typeof SPR==='undefined')return false;return SPR.foe(e,e.type,t,e.x,e.y,520*this.SPR[e.type],e.fl==='int'&&e.fs===3&&e.ang!=null?e.ang+Math.PI:0,e.flash>0);},   // flame / volley / death sheets (art.js SPR.foe); width = sheet px x SPR
  draw(e,t){const T=this.K[e.type],fl=e.flash>0,r=e.r,line=fl?'#fff':T.col,fill=fl?'#fff':'#12081f',k=e.fl;
    if(e.shT>0){ctx.save();ctx.globalAlpha=.3+.25*Math.sin(t*14);ctx.strokeStyle='#ffe27a';ctx.fillStyle='#ffe27a22';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,r+8,0,7);ctx.fill();ctx.stroke();ctx.restore();}   // arrival shield
    if(k==='car'&&e.fsh){ctx.save();ctx.globalAlpha=.35+.2*Math.sin(t*6);ctx.strokeStyle='#4ad1ff';ctx.fillStyle='#4ad1ff1c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,r+14,0,7);ctx.fill();ctx.stroke();ctx.restore();}
    if(this.spr(e,t)){if(e.arm){ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha=.35+.5*(typeof PHF==='number'?PHF:0);ctx.strokeStyle='#ff7080';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r+8,0,7);ctx.stroke();ctx.restore();}   // the shot tell stays
      if(e.max>1)hpBar(e.x-14,e.y-r-9,28,e.hp/e.max);return;}
    ctx.save();ctx.translate(e.x,e.y);
    if(e.arm){ctx.globalAlpha=.35+.5*(typeof PHF==='number'?PHF:0);ctx.strokeStyle='#ff7080';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r+8,0,7);ctx.stroke();ctx.globalAlpha=1;}
    ctx.lineWidth=2;ctx.strokeStyle=line;ctx.fillStyle=fill;
    if(k==='int'){ctx.rotate(e.fs===3&&e.ang!=null?e.ang+Math.PI:0);if(e.fs===2)ctx.fillStyle=Math.floor(t*12)%2?'#ff3050':fill;
      ctx.beginPath();ctx.moveTo(-r*1.5,0);ctx.lineTo(r,-r*.9);ctx.lineTo(r*.5,0);ctx.lineTo(r,r*.9);ctx.closePath();ctx.fill();ctx.stroke();}
    else if(k==='bom'){ctx.beginPath();ctx.moveTo(-r*1.2,0);ctx.lineTo(-r*.3,-r*.7);ctx.lineTo(r*1.2,-r*.9);ctx.lineTo(r,0);ctx.lineTo(r*1.2,r*.9);ctx.lineTo(-r*.3,r*.7);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=fl?'#fff':e.arm?'#ff3050':T.col;for(const s of[-1,1]){ctx.beginPath();ctx.arc(r*.2,s*r*.38,r*.2,0,7);ctx.fill();}}
    else if(k==='car'){ctx.beginPath();for(let i=0;i<6;i++){const q=i*Math.PI/3;ctx.lineTo(Math.cos(q)*r*1.15,Math.sin(q)*r*.85);}ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=fl?'#fff':e.arm?'#ff3050':T.col+'88';for(const s of[-1,1]){ctx.beginPath();ctx.arc(-r*.45,s*r*.4,r*.22,0,7);ctx.fill();ctx.stroke();}}
    else if(k==='drn'){ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=line;ctx.beginPath();ctx.arc(-r*.3,0,r*.35,0,7);ctx.fill();}
    else if(k==='cru'){ctx.beginPath();ctx.moveTo(-r*1.4,0);ctx.lineTo(-r*.8,-r*.75);ctx.lineTo(r*1.2,-r*.6);ctx.lineTo(r*1.4,0);ctx.lineTo(r*1.2,r*.6);ctx.lineTo(-r*.8,r*.75);ctx.closePath();ctx.fill();ctx.stroke();
      const lv=this.guns(e);for(let i=0;i<3;i++){const g=this.gun(e,i);ctx.fillStyle=fl?'#fff':i<lv?T.col:'#3a2a3a';ctx.beginPath();ctx.arc(g.x-e.x,g.y-e.y,r*.17,0,7);ctx.fill();ctx.stroke();}
      ctx.fillStyle=e.bm&&e.bm.ph===2?'#ffffff':'#ff3d8a88';ctx.beginPath();ctx.arc(r*.25,0,r*.25,0,7);ctx.fill();}
    ctx.restore();if(e.max>1&&e.hp>0)hpBar(e.x-14,e.y-r-(k==='car'&&e.fsh?22:9),28,e.hp/e.max);},
  over(t){if(!RET.fleet||!running)return;ctx.save();
    for(const e of G.en){if(!e.fl||e.dead||e.hp<=0)continue;
      if(e.fl==='int'&&e.fs===2&&e.p){const left=this.TELE.dive-(G.t-e.tl0),sol=left<=.3;ctx.globalAlpha=sol?.95:.45+.3*Math.sin(t*20);ctx.strokeStyle='#ff3050';ctx.lineWidth=sol?3:1.5;ctx.setLineDash(sol?[]:[10,8]);
        ctx.beginPath();ctx.moveTo(e.p[0].x,e.p[0].y);ctx.lineTo(e.p[1].x,e.p[1].y);ctx.lineTo(e.p[2].x,e.p[2].y);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='#ff3050';ctx.beginPath();ctx.arc(e.p[1].x,e.p[1].y,6,0,7);ctx.fill();}
      if(e.fl==='drn'&&e.par&&!e.par.dead&&e.par.hp>0){ctx.globalAlpha=.25;ctx.strokeStyle='#4ad1ff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.par.x,e.par.y);ctx.stroke();}
      if(e.fl==='cru'&&e.bm&&e.bm.ph){const m=e.bm,B=this.BEAM,c=Math.cos(m.a),s=Math.sin(m.a),live=m.ph===2;
        for(const sg of[-1,1]){const x0=e.x+sg*c*e.r,y0=e.y+sg*s*e.r,x1=e.x+sg*c*B.L,y1=e.y+sg*s*B.L;
          if(live){ctx.globalAlpha=.35;ctx.strokeStyle='#ff3d8a';ctx.lineWidth=B.w*2+6;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.globalAlpha=1;ctx.strokeStyle='#fff';ctx.lineWidth=4;}
          else{ctx.globalAlpha=.4+.4*((G.t-m.t0)/this.TELE.beam);ctx.strokeStyle='#ff3d8a';ctx.lineWidth=1.5;ctx.setLineDash([8,8]);}
          ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.setLineDash([]);}}}
    for(const b of this.bombs){const k=clamp((G.t-b.t0)/this.TELE.bomb,0,1);ctx.globalAlpha=.9;ctx.strokeStyle='#ff4d4d';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(b.x,b.y,b.R,0,7);ctx.stroke();
      ctx.globalAlpha=.15+.3*k;ctx.fillStyle='#ff3040';ctx.beginPath();ctx.arc(b.x,b.y,b.R*(.3+.7*k),0,7);ctx.fill();
      if(k<.5){ctx.globalAlpha=.4*(1-2*k);ctx.strokeStyle='#ffb43c';ctx.lineWidth=1;ctx.setLineDash([4,6]);ctx.beginPath();ctx.moveTo(b.sx,b.sy);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);}}
    for(const f of this.fx){const k=1-f.l/f.m;ctx.globalAlpha=Math.max(0,f.l/f.m);ctx.strokeStyle=f.c;ctx.fillStyle=f.c;ctx.lineWidth=3;
      if(f.k==='blast'){ctx.globalAlpha=.5*(1-k);ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.6+.4*k),0,7);ctx.fill();}else{ctx.beginPath();ctx.arc(f.x,f.y,(f.r||20)*(.3+.7*k),0,7);ctx.stroke();}}
    ctx.restore();},
  hint(e){const T=this.K[e.type];if(!T||!T.hint||this.seen[e.type])return;this.seen[e.type]=1;
    try{localStorage.setItem('nr.fleet.seen',JSON.stringify(this.seen));}catch(err){}
    if(window.HINT&&HINT.on()&&typeof hintShow==='function')hintShow(T.hint,6,T.col);else{G.note={t:6,txt:T.hint};floater(W*.5,H*.2,T.hint,T.col);}},
  died(e){const T=this.K[e.type];if(!T)return;const drop=(t,dx=0,dy=0)=>G.pk.push({t,x:e.x+dx,y:e.y+dy,vx:rnd(-40,20),vy:rnd(-60,60),bob:rnd(0,7)});
    const ring=(r,l)=>this.fx.push({x:e.x,y:e.y,l:l||.5,m:l||.5,c:T.col,k:'ring',r});
    switch(e.fl){
      case'int':drop('shard');ring(e.r+30,.35);burst(e.x,e.y,T.col,18,320);break;
      case'bom':drop('shard',-6);drop('shard',6);if(GX()<.2)drop('emp');ring(e.r+36);burst(e.x,e.y,T.col,30,340);break;
      case'car':for(const q of G.en)if(q.par===e&&q.hp>0)q.hp=0;drop(WP.canGain()&&GX()<.5?'up':'emp');for(let i=0;i<4;i++)drop('shard',rnd(-24,24),rnd(-24,24));ring(100,.7);burst(e.x,e.y,T.col,44,400);shake(8);break;
      case'cru':drop(WP.canGain()?'up':'emp');if(GX()<.5&&P.hp<P.max)drop('hp');for(let i=0;i<6;i++)drop('shard',rnd(-30,30),rnd(-30,30));ring(140,.8);burst(e.x,e.y,T.col,60,460);shake(12);break;
      case'drn':if(GX()<.25)drop('shard');burst(e.x,e.y,T.col,8,180,.35);break;}},
  init(){if(this.inited)return;this.inited=true;
    try{this.seen=JSON.parse(localStorage.getItem('nr.fleet.seen')||'{}')||{};}catch(err){this.seen={};}
    for(const id in this.K){DMG.ml[id]=this.K[id].ml;if(window.VIS)VIS.ml[id]=this.K[id].ml;if(window.LEAK&&LEAK.W)LEAK.W[id]=this.K[id].w;}
    if(typeof labBuildFoes==='function'){const lb=labBuildFoes;labBuildFoes=function(body){lb(body);if(!RET.fleet)return;const r=lsec(body,'ENEMY SHIPS (fleet)');
      for(const id of FLEET.ORDER)lchip(r,FLEET.K[id].hint.split(':')[0],labFoe(y=>{FLEET.bombs=[];FLEET.mk(id,{x:W+40,y,nd:3});}));};}}};
FLEET.reset();
{ const p0=DMG.pass;DMG.pass=function(dt){const r=p0.call(this,dt);   // after the frame's hull loss is booked, before the kill check: an arriving unit keeps its hull
    if(RET.fleet)for(const e of G.en)if(e.fl&&FLEET.K[e.type]&&!e.dead&&e.tin!=null&&G.t-e.tin<FLEET.ARR){{const fl=e.max*(1-(G.t-e.tin)/FLEET.ARR);if(e.hp<fl)e.hp=e.hq=Math.min(e.max,fl);}e.shT=FLEET.ARR-(G.t-e.tin);}else if(e.shT)e.shT=0;
    return r;}; }
{ const de=drawEnemy;drawEnemy=function(e,t){if(RET.fleet&&e.fl&&FLEET.K[e.type]){FLEET.draw(e,t);return;}de(e,t);}; }
{ const dp=drawPickups;drawPickups=function(t){dp(t);try{FLEET.over(t);}catch(err){}}; }
{ const so=DIR.spawnOne;DIR.spawnOne=function(fill,k){   // outermost: a fleet wave replaces the wave; a busy screen goes to the zoo / pacing deferral inside
    if(!RET.fleet||fill||k||!FLEET.ok()||FLEET.busy())return so.apply(this,arguments);
    const n=FLEET.n(),p=FLEET.p(n);if(p<=0||GR()>=p)return so.apply(this,arguments);
    if(FLEET.wave(n))return;return so.apply(this,arguments);}; }
{ const h0=DMG.hit;DMG.hit=function(d,b,e){if(RET.fleet&&e&&e.fsh&&!(G.empT>0))return 0;return h0.apply(this,arguments);}; }   // the carrier shield: no damage while its drones live (EMP still cuts through)
{ const bl=ZOO.block;ZOO.block=function(b,e){if(RET.fleet&&e&&e.fsh&&!(G.empT>0)){FLEET.stat.absorbed++;if(FLEET.fx.length<40)FLEET.fx.push({x:b.x,y:b.y,l:.2,m:.2,c:'#4ad1ff',k:'ring',r:12});return true;}return bl.apply(this,arguments);}; }
NR.on('runStart',()=>{if(!RET.fleet)return;FLEET.init();FLEET.reset();});
NR.on('runEnd',()=>{FLEET.bombs=[];FLEET.fx=[];});
NR.on('stageClear',()=>{FLEET.bombs=[];});
NR.on('tick',dt=>{try{FLEET.tick(dt);}catch(err){}});
NR.on('spawn',e=>{if(RET.fleet&&e&&e.fl&&e.fl!=='drn')FLEET.hint(e);});
NR.on('kill',o=>{if(!RET.fleet||!o||o.boss||!o.e||!o.e.fl)return;FLEET.died(o.e);});
NR.on('beat',()=>{if(!RET.fleet||!running||G.dead)return;const d=diff();for(const e of G.en.slice())if(e.fl&&FLEET.K[e.type])FLEET.beat(e,d);});
