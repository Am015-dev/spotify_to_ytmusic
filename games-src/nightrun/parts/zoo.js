/* ---------- zoo.js: time to kill them all + eight new enemy kinds (owner, 17 Oct 2026). Flag RET.zoo; ?zoo=0 = the game as it was.
   1. STATION AND HOVER: drones and flankers no longer fly straight through. Each enters, slows to a strafe in the right 60% of the screen on its own slot (slots keep
      them spread over y, never stacked), hovers for N beats on the beat clock (Easy 6, Normal 5, Hard 4, Very hard / Legend 3), fires from there, then departs to the left.
      A leak is still counted when it leaves alive (leak.js). Hard flyers enter at x.8 and Legend at x.9 (Easy/Normal keep x.78). When the screen is busy (ZOO.cap
      enemies that are not swarm/mine/small drones) a new wave waits in 2-beat steps; it is never skipped.
   2. THE ZOO: shielder (front bubble), splitter (dies into drones), bomber (ringed bombs), sniper (locked aim line), kamikaze (flash, then dive), healer (heals a ring),
      carrier (launches drones every 2 bars), minelayer (mines that stay 4 bars). Story: a new kind every 2-3 stages from stage 4; endless: all after ~5 minutes.
      Every kind: telegraph >= 0.5 s, hp scaled by scale.js like the old enemies, a score, a drop table, a death effect, a one-time hint, a LAB chip, art as coloured
      shapes (en-<id>.webp placeholders in assets-manifest.json). Stats for the tests: ZOO.stat. ---------- */
if(RET.zoo===undefined)RET.zoo=!/[?&]zoo=0/.test(location.search);
const ZOO=window.ZOO={
  hov:{easy:6,normal:5,hard:4,vhard:3,legend:3},          // hover length in beats per difficulty
  cap:{easy:6,normal:7,hard:8,vhard:9,legend:9},          // enemies on screen (not swarm / mine / small drones) before a new wave waits
  spd:{hard:.8,legend:.9},                                // flyer entry speed factor (leak.js has easy/normal .78)
  pz:.27,                                                 // share of the waves of an eligible stage/run that are zoo waves
  ID:['shielder','kamikaze','splitter','bomber','sniper','healer','carrier','minelayer'],
  T:{
    shielder:{r:18,hp:6,score:300,col:'#4ad1ff',st:4,tt:45,sh:8,ml:1.6,w:1,hint:'SHIELDER: hit it from the side',max:3},
    kamikaze:{r:12,hp:3,score:200,col:'#ff4d4d',st:6,tt:80,ml:.8,w:0,hint:'KAMIKAZE: dodge its dive',max:4},
    splitter:{r:17,hp:5,score:350,col:'#ff5acf',st:9,tt:115,ml:1.4,w:1,hint:'SPLITTER: bursts into drones',max:3},
    bomber:{r:16,hp:6,score:400,col:'#ffa02d',st:11,tt:150,ml:1.5,w:1,hint:'BOMBER: leave the red rings',max:2},
    sniper:{r:14,hp:5,score:400,col:'#9dff3a',st:14,tt:185,ml:1.5,w:1,hint:'SNIPER: move when the line locks',max:2},
    healer:{r:13,hp:5,score:350,col:'#3dffb0',st:16,tt:220,ml:1.4,w:1,hint:'HEALER: shoot it first',max:1},
    carrier:{r:34,hp:30,score:1100,col:'#b48cff',st:19,tt:255,ml:3,w:3,hint:'CARRIER: it launches drones',max:1},
    minelayer:{r:17,hp:8,score:400,col:'#d8ff3d',st:22,tt:290,ml:1.6,w:1,hint:'MINELAYER: shoot or avoid mines',max:1},
    zdrn:{r:8,hp:1,score:40,col:'#c08aff',ml:.5,w:0,max:99}},
  bombs:[],mines:[],fx:[],seen:{},run:{},inited:false,BR:64,
  stat:{hovers:[],minGap:1e9,maxHover:0,maxCount:0,spawnsDeferred:0,kinds:{},launches:0,bombs:0,mines:0,heals:0,splits:0,dives:0,snipes:0,blocks:0,pops:0},
  on(){return !!RET.zoo;},
  hovOn(){return !!RET.zoo&&!G.lab&&!G.tut&&!G.boss;},
  N(){return this.hov[SET.diff]||5;},
  CAP(){return (this.cap[SET.diff]||7)-(touchUI||rotMode?1:0);},
  reset(){this.bombs=[];this.mines=[];this.fx=[];this.run={};this.stat={hovers:[],minGap:1e9,maxHover:0,maxCount:0,spawnsDeferred:0,kinds:{},launches:0,bombs:0,mines:0,heals:0,splits:0,dives:0,snipes:0,blocks:0,pops:0};},
  /* ---- bookkeeping ---- */
  zt(e){return !!e.zt;},
  counted(e){return e.hp>0&&!e.dead&&e.type!=='boss'&&e.type!=='swarm'&&e.type!=='mine'&&e.type!=='zdrn'&&e.type!=='gate'&&!e.gnd;},
  count(){let n=0;for(const e of G.en)if(this.counted(e))n++;return n;},
  alive(id){let n=0;for(const e of G.en)if(e.type===id&&e.hp>0&&!e.dead)n++;return n;},
  unl(){if(G.lab)return this.ID.slice();
    if(ST.on){if(ST.def&&ST.def.ch)return [];return this.ID.filter(id=>ST.n>=this.T[id].st);}
    return this.ID.filter(id=>G.t>=this.T[id].tt);},
  /* ---- slots: every hovering enemy gets its own spot (best of 24 random spots, >= 80 px from the others when there is room) ---- */
  slot(e,x0,x1){const o=[];for(const q of G.en)if(q!==e&&q.zs&&q.zst!==2&&q.hp>0)o.push(q.zs);
    let best=null,bd=-1;const a=x0==null?W*.42:x0,b=x1==null?W-90:x1;
    for(let k=0;k<24;k++){const x=gr(a,b),y=gr(70,H-80);if(P&&Math.hypot(x-P.x,y-P.y)<SPAWN_R)continue;
      let md=1e9;for(const s of o)md=Math.min(md,Math.hypot(s.x-x,(s.y-y)*1.25));if(md>bd){bd=md;best={x,y};if(md>=80)break;}}
    return best||{x:(a+b)/2,y:H/2};},
  /* ---- generic hover for drones and the new flyers ---- */
  hv(e,dt,d,o){
    if(!e.zs){e.zs=this.slot(e,o.x0,o.x1);e.zph=gr(0,6.28);e.zst=0;e.by=e.y;}
    const v=o.v||(120+15*d);
    if(e.zst===0){e.x-=v*dt;e.by+=clamp(e.zs.y-e.by,-170*dt,170*dt);
      e.y=e.by+Math.sin(G.bp*Math.PI/2+(e.ph||0))*(e.amp||0)*clamp((e.x-e.zs.x)/120,0,1);
      if(e.x<=e.zs.x){e.zst=1;e.hv0=G.bc;e.bf=Math.min(e.bf,2);}}
    else if(e.zst===1){const k=Math.min(1,dt*4);e.x+=(e.zs.x+Math.sin(e.t*.8+e.zph)*14-e.x)*k;e.y+=(e.zs.y+Math.sin(e.t*1.3+e.zph)*10-e.y)*k;
      if(G.bc-e.hv0>=o.N)this.leave(e,o);}
    else e.x-=v*1.3*dt;
    return true;},
  leave(e,o){if(o.keep&&o.keep(e))return;e.zst=2;if(this.stat.hovers.length<300)this.stat.hovers.push({t:e.type,d:SET.diff,b:G.bc-e.hv0,x:Math.round(e.zs.x),h:e.hp<e.max?1:0});},
  flank(e,dt,d){
    if(!e.zs){e.zph=gr(0,6.28);e.zst=0;e.zs={x:e.x,y:e.ty};}
    if(e.zst===0){const vy=190*(e.hurry||1);
      if(Math.abs(e.ty-e.y)>6){e.y+=Math.sign(e.ty-e.y)*Math.min(Math.abs(e.ty-e.y),vy*dt);e.x=Math.max(W*.42,e.x-(80+8*d)*dt);}
      else{e.settled=1;e.by=e.ty;e.zst=1;e.hv0=G.bc;e.zs={x:e.x,y:e.y};e.bf=Math.min(e.bf,2);}}
    else if(e.zst===1){e.x=e.zs.x+Math.sin(e.t*.8+e.zph)*14;e.y=e.zs.y+Math.sin(e.t*1.3+e.zph)*10;if(G.bc-e.hv0>=this.N())this.leave(e,{});}
    else e.x-=(150+10*d)*1.2*dt;
    return true;},
  /* ---- movement of one enemy; true = handled here (b.js skips its own switch) ---- */
  mv(e,dt,d){if(!RET.zoo||e.type==='boss')return false;
    if(!e.zt){if(!this.hovOn())return false;
      if(e.type==='drone'&&!e.gnd)return this.hv(e,dt,d,{N:this.N()});
      if(e.type==='flank')return this.flank(e,dt,d);
      return false;}
    const T=this.T[e.type];if(!T)return false;
    switch(e.type){
      case'shielder':{const r=this.hv(e,dt,d,{N:this.N()+2,v:100});const fa=Math.atan2(P.y-e.y,P.x-e.x);e.fa=e.fa==null?fa:e.fa+angD(fa,e.fa)*Math.min(1,dt*1.6);return r;}
      case'splitter':return this.hv(e,dt,d,{N:this.N(),v:130});
      case'healer':return this.hv(e,dt,d,{N:this.N()+6,v:100,x0:W*.68,x1:W-70});
      case'sniper':return this.hv(e,dt,d,{N:this.N()+9,v:110,x0:W-72,x1:W-62,keep:q=>q.aim===1});
      case'kamikaze':return this.kz(e,dt,d);
      case'bomber':e.x-=130*dt;e.y+=Math.sin(e.t*1.1)*10*dt;return true;
      case'minelayer':e.x-=125*dt;e.y+=Math.sin(e.t*.9)*14*dt;return true;
      case'carrier':{if(e.x>W-170&&e.zst!==2)e.x-=60*dt;else{e.zst=e.zst||1;if(e.zst===1)e.y=e.by+Math.sin(e.t*.7)*70;}
        if(e.zst===1&&G.bc-(e.hv0==null?(e.hv0=G.bc):e.hv0)>=36){e.zst=2;if(this.stat.hovers.length<300)this.stat.hovers.push({t:'carrier',d:SET.diff,b:36,x:Math.round(e.x),h:e.hp<e.max?1:0});}
        if(e.zst===2)e.x-=70*dt;return true;}
      case'zdrn':{e.x-=(170+10*d)*dt;if(e.t>.35)e.y+=clamp(P.y-e.y,-1,1)*Math.min(70,Math.abs(P.y-e.y)*2)*dt;e.y+=(e.vy||0)*dt;e.vy=(e.vy||0)*(1-Math.min(1,dt*3));return true;}}
    return false;},
  kz(e,dt,d){
    if(e.zst===3){e.x+=Math.cos(e.ang)*400*dt;e.y+=Math.sin(e.ang)*400*dt;if(e.x>W+200||e.y>H+200||e.y<-200)e.dead=1;return true;}
    this.hv(e,dt,d,{N:999,v:150});
    if(e.tel){const sp=BT.spb,left=(e.diveAt-G.bp)*sp;
      if(left>.3||!e.lock){e.ang=Math.atan2(P.y-e.y,P.x-e.x);}
      if(left<=.3)e.lock=1;
      if(G.bp>=e.diveAt){e.zst=3;e.tel=0;this.stat.dives++;}}
    return true;},
  /* ---- the beat: enemy fire, heals, launches, aim lines ---- */
  beat(e,d){
    if(e.dead||e.hp<=0||G.dead)return;
    const ir=s=>e.x<W-30&&e.x>P.x+60&&e.y>14&&e.y<H-14&&Math.hypot(e.x-P.x,e.y-P.y)>minShot(s);
    switch(e.type){
      case'shielder':case'splitter':{if(e.zst!==1){e.arm=false;break;}const s=150+15*d,c=e.type==='shielder'?'#4ad1ff':'#ff5acf';
        if(--e.bf<=0){if(e.arm&&ir(s)){eb.src=e;eb(e.x-e.r,e.y,aim(e),s,c);eb.src=null;}e.bf=fireIn(gx(2.4,3.6)/d/frK());}e.arm=e.bf===1&&ir(s);break;}
      case'sniper':{if(e.zst!==1){e.aim=0;e.arm=false;break;}
        if(e.aim===1){if(G.bp>=e.aimAt){e.aim=0;e.arm=false;e.rest=2;if(e.x>P.x+100&&Math.hypot(e.x-P.x,e.y-P.y)>minShot(330)){eb.src=e;e.arm=true;eb(e.x-e.r,e.y,e.ang,330,'#9dff3a',5);e.arm=false;eb.src=null;this.stat.snipes++;}}}
        else if(e.rest>0)e.rest--;
        else if(e.x<W-40&&e.x>P.x+120){e.aim=1;e.arm=true;e.lock=0;e.aimAt=Math.round(G.bp)+Math.max(1,Math.ceil(.85/BT.spb));e.ang=Math.atan2(P.y-e.y,P.x-e.x);}
        break;}
      case'kamikaze':{if(e.zst!==1||e.tel)break;e.kc=(e.kc||0)+1;const wait=e.wait||4;
        if(e.kc>=wait&&e.x<W-40){e.tel=1;e.lock=0;e.diveAt=Math.round(G.bp)+Math.max(1,Math.ceil(.6/BT.spb));e.ang=Math.atan2(P.y-e.y,P.x-e.x);}break;}
      case'healer':{if(e.zst===2)break;e.hc=(e.hc||0)+1;if(e.hc%2)break;let n=0;
        for(const q of G.en){if(q===e||q.type==='boss'||q.hp<=0||q.dead||q.gnd||q.x>W-20)continue;if(q.hp>=q.max)continue;if(Math.hypot(q.x-e.x,q.y-e.y)>150)continue;
          q.hp=Math.min(q.max,q.hp+Math.max(1,Math.ceil(q.max*.12)));q.hq=q.hp;n++;this.fx.push({x:q.x,y:q.y-q.r,l:.5,m:.5,c:'#3dffb0',k:'plus'});}
        this.fx.push({x:e.x,y:e.y,l:.6,m:.6,c:'#3dffb0',k:'ring',r:150});if(n)this.stat.heals+=n;break;}
      case'carrier':{if(e.zst===2){e.arm=false;break;}e.lc=(e.lc||0)+1;const ph=e.lc%8;e.arm=ph===7;
        if(ph===0&&e.x<W-60){let z=0;for(const q of G.en)if(q.type==='zdrn'&&q.hp>0)z++;
          if(z<7){for(const s of[-1,1]){const c=this.mk('zdrn',{x:e.x-e.r,y:e.y+s*e.r*.6,bf:99});c.vy=s*70;c.gr=0;}this.stat.launches++;
            this.fx.push({x:e.x-e.r,y:e.y,l:.5,m:.5,c:'#b48cff',k:'ring',r:40});}}break;}
      case'bomber':{if(e.x>W-60||e.x<90)break;e.bc2=(e.bc2||0)+1;if(e.bc2%3)break;if(Math.hypot(e.x-P.x,e.y+e.r-P.y)<this.BR*.6)break;
        this.bombs.push({x:e.x,y:e.y+e.r,vy:35,b0:G.bc,t0:G.t,f:0});this.stat.bombs++;break;}
      case'minelayer':{if(e.x>W-70||e.x<80)break;e.mc=(e.mc||0)+1;if(e.mc%2)break;if(this.mines.length>=8||Math.hypot(e.x-P.x,e.y-P.y)<150)break;
        this.mines.push({x:e.x,y:e.y,b0:G.bc,t0:G.t,hp:1,r:11});this.stat.mines++;break;}}
  },
  /* ---- spawning ---- */
  mk(id,o){const T=this.T[id];const e=en(id,Object.assign({r:T.r,hp:T.hp,score:T.score,zt:1,bf:fireIn(gx(1.4,2.6))},o||{}));
    if(id==='shielder'){e.shN=e.shMax=Math.max(2,Math.round(e.max*.9));e.fa=Math.PI;}   // the bubble soaks about as much damage as the hull, so it scales with the power score exactly like hp
    if(id==='kamikaze')e.wait=3+Math.floor(GR()*3);
    this.stat.kinds[id]=(this.stat.kinds[id]|0)+1;return e;},
  fy(){return gr(90,H-120);},
  W:{
    shielder(){const n=HARDS.includes(SET.diff)?2:1;for(let i=0;i<n;i++)DIR.later(i*2,()=>{if(!G.dead)ZOO.mk('shielder',{x:W+40,y:ZOO.fy()});});return 3;},
    splitter(){const n=SET.diff==='easy'?1:2;for(let i=0;i<n;i++)DIR.later(i*2,()=>{if(!G.dead)ZOO.mk('splitter',{x:W+40,y:ZOO.fy()});});return 3;},
    bomber(){const n=HARDS.includes(SET.diff)?2:1,y0=GR()<.5?gr(70,130):gr(H-190,H-120);for(let i=0;i<n;i++)DIR.later(i*4,()=>{if(!G.dead)ZOO.mk('bomber',{x:W+40,y:i%2?H-y0+0:y0});});return 4;},
    sniper(){const n=SET.diff==='legend'?2:1;for(let i=0;i<n;i++)DIR.later(i*3,()=>{if(!G.dead)ZOO.mk('sniper',{x:W+40,y:ZOO.fy()});});return 3;},
    kamikaze(){const n=SET.diff==='easy'?2:HARDS.includes(SET.diff)?4:3;for(let i=0;i<n;i++)DIR.later(i,()=>{if(!G.dead)ZOO.mk('kamikaze',{x:W+40,y:ZOO.fy()});});return 3;},
    healer(){const y=ZOO.fy();ZOO.mk('healer',{x:W+40,y});for(let i=0;i<3;i++)DIR.later(1+i,()=>{if(!G.dead)en('drone',{x:W+40,y:ZOO.fy(),amp:0});});return 4;},
    carrier(){ZOO.mk('carrier',{x:W+70,y:gr(160,H-200)});return 6;},
    minelayer(){ZOO.mk('minelayer',{x:W+40,y:gr(110,H-110)});return 3;}},
  waveOK(){return RET.zoo&&!G.lab&&!G.tut&&!G.boss&&!G.bossDone&&!(window.LEAK&&LEAK.gapOn())&&!(ST.on&&ST.def&&ST.def.ch);},
  pick(){const u=this.unl().filter(id=>this.alive(id)<this.T[id].max&&this.W[id]);if(!u.length)return null;
    const un=u.find(id=>!this.run[id]);                                          // the newest unseen kind first
    if(un&&(ST.on?G.dbar>=2:true)&&GR()<.7)return un;
    let tot=0;const w=u.map((id,i)=>{const x=1+(i>=u.length-2?1.5:0);tot+=x;return x;});let r=GR()*tot;for(let i=0;i<u.length;i++){r-=w[i];if(r<=0)return u[i];}return u[0];},
  wave(){const id=this.pick();if(!id)return false;this.run[id]=(this.run[id]|0)+1;this.W[id]();return true;},
  /* ---- one-time hint ---- */
  hint(e){const id=e.type;if(!this.T[id]||!this.T[id].hint)return;if(this.seen[id])return;this.seen[id]=1;
    try{localStorage.setItem('nr.zoo.seen',JSON.stringify(this.seen));}catch(err){}
    G.note={t:6,txt:this.T[id].hint};floater(W*.5,H*.2,this.T[id].hint,this.T[id].col);},
  /* ---- shield: blocks a bullet that arrives within 66 degrees of its front; true = absorbed ---- */
  block(b,e){if(e.type!=='shielder'||!(e.shN>0))return false;
    const a=Math.atan2(b.y-e.y,b.x-e.x);if(Math.abs(angD(a,e.fa))>1.15)return false;
    e.shN-=DMG.hit(b.dm*(b.pf?SH.sharp:1),b,e);e.shF=.12;this.stat.blocks++;this.fx.push({x:b.x,y:b.y,l:.2,m:.2,c:'#4ad1ff',k:'ring',r:12});
    if(e.shN<=0){this.stat.pops++;this.fx.push({x:e.x,y:e.y,l:.4,m:.4,c:'#4ad1ff',k:'ring',r:e.r+34});burst(e.x,e.y,'#4ad1ff',16,220,.4);floater(e.x,e.y-e.r-18,'SHIELD DOWN','#4ad1ff');AU.sfx('hit');}
    return true;},
  /* ---- overlays + timers (bombs, mines, fx) ---- */
  tick(dt){if(!RET.zoo||!running||G.dead||ST.over||SH.active)return;
    const s=this.stat;let c=this.count();if(c>s.maxCount)s.maxCount=c;
    const hv=[];for(const e of G.en)if(e.zst===1&&e.hp>0&&!e.dead&&!e.gnd&&e.type!=='carrier')hv.push(e);
    if(hv.length>s.maxHover)s.maxHover=hv.length;
    for(let i=0;i<hv.length;i++)for(let j=i+1;j<hv.length;j++){const g=Math.hypot(hv[i].x-hv[j].x,hv[i].y-hv[j].y)-hv[i].r-hv[j].r;if(g<s.minGap)s.minGap=g;}
    for(const e of G.en){if(e.type==='shielder'&&e.shF>0)e.shF-=dt;if(e.type==='sniper'&&e.aim===1&&(e.aimAt-G.bp)*BT.spb>.4)e.ang=Math.atan2(P.y-e.y,P.x-e.x);}
    for(const b of this.bombs){b.y+=b.vy*dt;b.x-=40*dt;
      if(!b.f&&G.t-b.t0>=.5&&G.bc>=b.b0+1){b.f=1;const R=this.BR;this.fx.push({x:b.x,y:b.y,l:.4,m:.4,c:'#ffa02d',k:'blast',r:R});burst(b.x,b.y,'#ffa02d',22,300,.5);shake(5);AU.sfx('boom');
        if(!G.dead&&Math.hypot(P.x-b.x,P.y-b.y)<R+6)hurt();}}
    this.bombs=this.bombs.filter(b=>!b.f);
    for(const m of this.mines){m.armed=G.t-m.t0>=.5&&G.bc>=m.b0+1;
      for(const q of G.pb){if(q.dead)continue;if((q.x-m.x)**2+(q.y-m.y)**2<(m.r+5)**2){m.hp=0;q.dead=1;}}
      if(m.armed&&!G.dead&&Math.hypot(P.x-m.x,P.y-m.y)<m.r+7){m.hp=0;hurt();}
      if(G.bc-m.b0>=16)m.hp=0,m.fiz=1;
      if(m.hp<=0){this.fx.push({x:m.x,y:m.y,l:m.fiz?.2:.4,m:m.fiz?.2:.4,c:'#d8ff3d',k:'ring',r:m.fiz?14:30});if(!m.fiz){burst(m.x,m.y,'#d8ff3d',10,180,.4);G.score+=20;}}}
    this.mines=this.mines.filter(m=>m.hp>0);
    for(const f of this.fx)f.l-=dt;this.fx=this.fx.filter(f=>f.l>0);},
  /* ---- looks ---- */
  over(t){if(!RET.zoo||!running)return;ctx.save();
    for(const e of G.en){if(e.dead||e.hp<=0)continue;
      if(e.type==='healer'){ctx.globalAlpha=.16+.1*Math.sin(t*3);ctx.strokeStyle='#3dffb0';ctx.setLineDash([6,8]);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(e.x,e.y,150,0,7);ctx.stroke();ctx.setLineDash([]);}
      if(e.type==='sniper'&&e.aim===1){const k=clamp(1-(e.aimAt-G.bp)*BT.spb/.85,0,1),lk=(e.aimAt-G.bp)*BT.spb<=.4;
        ctx.globalAlpha=lk?.95:.3+.4*k;ctx.strokeStyle=lk?'#ff3050':'#9dff3a';ctx.lineWidth=lk?2:1;ctx.setLineDash(lk?[]:[10,8]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.ang)*1500,e.y+Math.sin(e.ang)*1500);ctx.stroke();ctx.setLineDash([]);}
      if(e.type==='kamikaze'&&e.tel&&e.zst!==3){const left=(e.diveAt-G.bp)*BT.spb;ctx.globalAlpha=left<=.3?.95:.4;ctx.strokeStyle='#ff3050';ctx.lineWidth=left<=.3?2.5:1.2;ctx.setLineDash(left<=.3?[]:[8,8]);
        ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.ang)*1500,e.y+Math.sin(e.ang)*1500);ctx.stroke();ctx.setLineDash([]);}}
    for(const b of this.bombs){const k=clamp((G.t-b.t0)/.5,0,1),R=this.BR,near=G.bc>=b.b0+1;ctx.globalAlpha=.9;ctx.strokeStyle='#ff4d4d';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(b.x,b.y,R,0,7);ctx.stroke();
      ctx.globalAlpha=.18+.3*k;ctx.fillStyle='#ff304088';ctx.beginPath();ctx.arc(b.x,b.y,R*(near?1:.35+.65*k),0,7);ctx.fill();
      ctx.globalAlpha=1;ctx.fillStyle='#1a0e0a';ctx.strokeStyle='#ffa02d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(b.x,b.y,7,0,7);ctx.fill();ctx.stroke();}
    for(const m of this.mines){const left=16-(G.bc-m.b0);ctx.globalAlpha=m.armed?(left<=2&&Math.floor(t*8)%2?.4:1):.45;ctx.fillStyle='#1a1d08';ctx.strokeStyle=m.armed?'#d8ff3d':'#7a8a30';ctx.lineWidth=2;
      ctx.beginPath();for(let i=0;i<8;i++){const q=i*Math.PI/4+t*.5,rr=i%2?m.r*.6:m.r;ctx.lineTo(m.x+Math.cos(q)*rr,m.y+Math.sin(q)*rr);}ctx.closePath();ctx.fill();ctx.stroke();
      if(!m.armed){ctx.strokeStyle='#ff4d4d';ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(m.x,m.y,m.r+9,0,7);ctx.stroke();ctx.setLineDash([]);}}
    for(const f of this.fx){const k=1-f.l/f.m;ctx.globalAlpha=Math.max(0,f.l/f.m);ctx.strokeStyle=f.c;ctx.fillStyle=f.c;ctx.lineWidth=3;
      if(f.k==='plus'){ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText('+',f.x,f.y-k*14);}
      else if(f.k==='blast'){ctx.globalAlpha=.5*(1-k);ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.6+.4*k),0,7);ctx.fill();}
      else{ctx.beginPath();ctx.arc(f.x,f.y,(f.r||20)*(.3+.7*k),0,7);ctx.stroke();}}
    ctx.restore();},
  art(e,t){const T=this.T[e.type],fl=e.flash>0,r=e.r,line=fl?'#fff':T.col,fill=fl?'#fff':'#12081f';ctx.save();ctx.translate(e.x,e.y);
    if(e.arm){const k=PHF;ctx.save();ctx.globalCompositeOperation='lighter';G_(0,0,r*(1.7+1.2*k),'#ff3050',.22+.5*k);ctx.restore();
      ctx.strokeStyle='#ff7080';ctx.globalAlpha=.35+.65*k;ctx.lineWidth=2+2*k;ctx.beginPath();ctx.arc(0,0,r+4+16*(1-k),0,7);ctx.stroke();ctx.globalAlpha=1;}
    ctx.lineWidth=2;ctx.strokeStyle=line;ctx.fillStyle=fill;
    const glow=(c,a)=>{ctx.globalCompositeOperation='lighter';G_(0,0,r*1.1,c,a);ctx.globalCompositeOperation='source-over';};
    switch(e.type){
      case'shielder':{ctx.beginPath();for(let i=0;i<6;i++){const q=i*Math.PI/3+Math.PI/6;ctx.lineTo(Math.cos(q)*r,Math.sin(q)*r);}ctx.closePath();ctx.fill();ctx.stroke();glow(T.col,.35);
        if(e.shN>0){const f=e.fa==null?Math.PI:e.fa,rs=r+12;ctx.globalAlpha=(.35+.5*(e.shN/e.shMax))*(e.shF>0?1:.8);ctx.strokeStyle=e.shF>0?'#fff':'#4ad1ff';ctx.fillStyle='#4ad1ff22';ctx.lineWidth=4;
          ctx.beginPath();ctx.arc(0,0,rs,f-1.15,f+1.15);ctx.stroke();ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,rs,f-1.15,f+1.15);ctx.closePath();ctx.fill();ctx.globalAlpha=1;}
        break;}
      case'splitter':{ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(0,-r);ctx.lineTo(r,0);ctx.lineTo(0,r);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(0,r);ctx.stroke();
        for(const s of[-1,1]){ctx.beginPath();ctx.arc(s*r*.38,0,r*.2,0,7);ctx.fillStyle=fl?'#fff':T.col+'88';ctx.fill();}glow(T.col,.3);break;}
      case'bomber':{ctx.beginPath();ctx.moveTo(-r*1.3,0);ctx.lineTo(r*.9,-r*.7);ctx.lineTo(r*1.2,0);ctx.lineTo(r*.9,r*.7);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.beginPath();ctx.arc(0,r*.75,r*.32,0,7);ctx.fillStyle=fl?'#fff':'#ffa02d';ctx.fill();ctx.stroke();glow(T.col,.3);break;}
      case'sniper':{ctx.beginPath();ctx.moveTo(-r*1.6,0);ctx.lineTo(-r*.2,-r*.6);ctx.lineTo(r*.9,0);ctx.lineTo(-r*.2,r*.6);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.beginPath();ctx.moveTo(-r*1.6,0);ctx.lineTo(-r*2.3,0);ctx.stroke();ctx.fillStyle=e.aim===1?'#ff3050':T.col;ctx.beginPath();ctx.arc(-r*.1,0,r*.22,0,7);ctx.fill();glow(T.col,.3);break;}
      case'kamikaze':{ctx.rotate(e.zst===3||e.tel?e.ang+Math.PI:Math.PI);ctx.fillStyle=e.tel?'#ff3050':fill;ctx.beginPath();ctx.moveTo(r*1.5,0);ctx.lineTo(-r*.8,-r*.9);ctx.lineTo(-r*.3,0);ctx.lineTo(-r*.8,r*.9);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.rotate(-(e.zst===3||e.tel?e.ang+Math.PI:Math.PI));glow('#ff4d4d',e.tel?.7:.3);break;}
      case'healer':{ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=fl?'#fff':T.col;ctx.fillRect(-r*.18,-r*.6,r*.36,r*1.2);ctx.fillRect(-r*.6,-r*.18,r*1.2,r*.36);glow(T.col,.35);break;}
      case'carrier':{ctx.beginPath();ctx.moveTo(-r*1.3,0);ctx.lineTo(-r*.6,-r*.8);ctx.lineTo(r*1.1,-r*.8);ctx.lineTo(r*1.3,0);ctx.lineTo(r*1.1,r*.8);ctx.lineTo(-r*.6,r*.8);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle=fl?'#fff':e.arm?'#ff3050':T.col+'88';for(const s of[-1,1]){ctx.beginPath();ctx.rect(-r*1.0,s*r*.5-r*.14,r*.7,r*.28);ctx.fill();ctx.stroke();}glow(T.col,.25);break;}
      case'minelayer':{ctx.beginPath();ctx.moveTo(-r*1.2,-r*.4);ctx.lineTo(r*1.1,-r*.6);ctx.lineTo(r*1.4,0);ctx.lineTo(r*1.1,r*.6);ctx.lineTo(-r*1.2,r*.4);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.beginPath();ctx.arc(-r*.3,0,r*.3,0,7);ctx.fillStyle=fl?'#fff':T.col;ctx.fill();glow(T.col,.3);break;}
      default:{ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r*.6,-r*.7);ctx.lineTo(r,0);ctx.lineTo(r*.6,r*.7);ctx.closePath();ctx.fill();ctx.stroke();glow(T.col,.5);}}
    if(e.max>1&&e.hp>0)hpBar(-14,-r-(e.type==='shielder'?22:9),28,e.hp/e.max);
    ctx.restore();},
  /* ---- death: drops + effect (b.js kill() has already scored and bursted) ---- */
  died(e){const T=this.T[e.type];if(!T)return;const D=DISTRICTS[G.di];
    const drop=(t,dx=0,dy=0)=>G.pk.push({t,x:e.x+dx,y:e.y+dy,vx:rnd(-40,20),vy:rnd(-60,60),bob:rnd(0,7)});
    const ring=(r,l)=>this.fx.push({x:e.x,y:e.y,l:l||.5,m:l||.5,c:T.col,k:'ring',r});
    switch(e.type){
      case'shielder':drop('shard',-6);drop('shard',6);if(GX()<.12)drop(WP.canGain()?'up':'emp');ring(e.r+40);burst(e.x,e.y,T.col,26,300);break;
      case'splitter':drop('shard');if(!e.rk&&e.hp<=0){const n=SET.diff==='easy'?2:3;this.stat.splits++;for(let i=0;i<n;i++){const a=-1.2+i*2.4/(n-1||1),c=this.mk('zdrn',{x:e.x,y:e.y,bf:99});c.gr=0;c.vy=Math.sin(a)*260;c.x-=10;}}
        ring(e.r+36);burst(e.x,e.y,T.col,28,340);break;
      case'bomber':drop('shard',-6);drop('shard',6);if(GX()<.2)drop('emp');ring(e.r+30);burst(e.x,e.y,'#ffa02d',30,360);break;
      case'sniper':drop('shard',-8);drop('shard');drop('shard',8);if(GX()<.25&&WP.canGain())drop('up');ring(e.r+34);break;
      case'kamikaze':drop('shard');ring(e.r+44,.35);burst(e.x,e.y,'#ff4d4d',24,420);break;
      case'healer':drop('shard');if(GX()<.35&&P.hp<P.max)drop('hp');ring(150,.6);burst(e.x,e.y,T.col,24,260);break;
      case'carrier':drop(WP.canGain()&&GX()<.6?'up':'emp');for(let i=0;i<5;i++)drop('shard',rnd(-24,24),rnd(-24,24));ring(110,.7);burst(e.x,e.y,T.col,50,420);shake(10);break;
      case'minelayer':drop('shard',-6);drop('shard');drop('shard',6);ring(e.r+34);burst(e.x,e.y,T.col,26,300);break;
      case'zdrn':if(GX()<.2)drop('shard');burst(e.x,e.y,T.col,10,200,.4);break;}},
  init(){if(this.inited)return;this.inited=true;
    try{this.seen=JSON.parse(localStorage.getItem('nr.zoo.seen')||'{}')||{};}catch(err){this.seen={};}
    if(RET.zoo){window.LEAK&&Object.assign(LEAK.spd,this.spd);}
    for(const id in this.T)DMG.ml[id]=this.T[id].ml;
    if(window.LEAK)for(const id in this.T)if(this.T[id].w)LEAK.W[id]=this.T[id].w;
    { const de=drawEnemy;drawEnemy=function(e,t){if(RET.zoo&&e.zt&&ZOO.T[e.type]){ZOO.art(e,t);return;}de(e,t);}; }
    { const dp=drawPickups;drawPickups=function(t){dp(t);try{ZOO.over(t);}catch(err){}}; }
    { const so=DIR.spawnOne;DIR.spawnOne=function(fill){
        if(!RET.zoo||G.lab||G.tut)return so.call(this,fill);
        if(window.LEAK&&LEAK.gapOn())return so.call(this,fill);
        if(ZOO.count()>=ZOO.CAP()&&!ST.over){ZOO.stat.spawnsDeferred++;DIR.later(2,()=>{if(!G.dead)DIR.spawnOne(fill);});return;}   // too many on screen: this wave comes later
        if(!fill&&ZOO.waveOK()&&GR()<ZOO.pz&&ZOO.wave())return;
        return so.call(this,fill);}; }
    if(typeof labBuildFoes==='function'){const lb=labBuildFoes;labBuildFoes=function(body){lb(body);const r=lsec(body,'NEW ENEMIES (the zoo)');
      for(const id of ZOO.ID)lchip(r,id.toUpperCase(),labFoe(y=>{ZOO.bombs=[];ZOO.mines=[];ZOO.mk(id,{x:W-110,y});}));
      lchip(r,'HOVER DRONE',labFoe(y=>{const e=en('drone',{x:W-60,y,amp:0});e.zs={x:W*.6,y};e.zph=0;e.zst=0;e.hv0=0;ZOO.lab=1;}));};}
  }};
const angD=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;};
NR.on('runStart',()=>{ZOO.init();ZOO.reset();});
NR.on('runEnd',()=>{ZOO.bombs=[];ZOO.mines=[];ZOO.fx=[];});
NR.on('stageClear',()=>{ZOO.bombs=[];ZOO.mines=[];});
NR.on('tick',dt=>{try{ZOO.tick(dt);}catch(err){}});
NR.on('spawn',e=>{if(!RET.zoo||!e)return;
  if(e.zt)ZOO.hint(e);
  if(e.type==='flank'&&ZOO.hovOn()){const s=ZOO.slot(e,W*.5,W-90);e.ty=s.y;e.zs={x:s.x,y:s.y};}});
NR.on('kill',o=>{if(!RET.zoo||!o||o.boss||!o.e||!o.e.zt)return;ZOO.died(o.e);});
NR.on('beat',()=>{if(!RET.zoo||!running||G.dead)return;const d=diff();for(const e of G.en.slice())if(e.zt&&ZOO.T[e.type]&&e.type!=='zdrn')ZOO.beat(e,d);});
