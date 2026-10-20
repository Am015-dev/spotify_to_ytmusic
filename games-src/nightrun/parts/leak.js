/* ---------- leak.js: ground enemies, calmer pacing, escape penalty (owner, 17 Oct 2026). Flag RET.leak; ?leak=0 = the game as it was.
   1. GROUND ENEMIES: gtank (rolls on the road line, lobs a slow shell), gturret (rises out of the road, aimed shots), gwalker (slow, tanky, steps).
      They stand on UIK.groundY() (the ground-boss road line, same soft shadow), never fly or jump, scroll left with the ground. About 30% of the waves of a stage
      from its 3rd stage on (pos >= 2). Never in portrait (no road line there), in the LAB, during a boss, nor on ferry / fleet stages (water).
   2. CALMER PACING: flyers move slower (Easy/Normal x.78, Hard x.9, Very hard/Legend and Heat x1), bosses and ground enemies keep their speed; the waves keep their
      bar lines. After every 3rd wave (Easy/Normal) and after a mini-boss (not Legend/Heat) one bar has no new spawn: the screen scrolls, READY pulses on the beat.
   3. BREACH: every enemy that leaves the screen alive is a leak (gunship / elite / leader count 3; swarm, mine, gate, bullets, bosses 0). The meter holds
      free + per-hull leaks (2 + 4/3/2); at the top it costs 1 hull (the normal hurt(): shield, assists and medals see it) and drops back to the warning level.
      1 leak per 2 quiet bars heals it. Easy/Normal never lose the last hull to it; Hard/Legend may. A leak also stops the FEVER meter filling until the next bar. ---------- */
if(RET.leak===undefined)RET.leak=!/[?&]leak=0/.test(location.search);
const LEAK=window.LEAK={
  pg:.3,                                                 // share of the waves of an eligible stage that are ground waves
  spd:{easy:.78,normal:.78,hard:.9},                     // flyer speed factor per difficulty (missing = 1)
  grp:{easy:4,normal:3,hard:2,vhard:2,legend:2},         // leaks per hull
  free:2,                                                // leaks that only warn
  W:{drone:1,flank:1,charger:1,turret:1,gtank:1,gturret:1,gwalker:1,gunship:3},   // leak weight per type (elite / leader: 3)
  GT:{gtank:{r:22,hp:10,score:350,ml:1.5},gturret:{r:18,hp:7,score:300,ml:1.2},gwalker:{r:28,hp:22,score:600,ml:2.8}},
  log:[],sCost:0,M:0,quiet:0,total:0,paid:0,warn:0,noFev:false,flashT:0,txt:'',txtT:0,gap:0,waves:0,gaps:0,ground:0,okWaves:0,inited:false,
  en:(t,o)=>en(t,o),                                      // for the tests (en lives inside the page closure)
  on(){return !!RET.leak;},
  hard(){return HARDS.includes(SET.diff);},
  heat(){return !!(window.HEAT&&ST.on&&HEAT.lv(ST.n)>0);},
  cap(){return this.free+(this.grp[SET.diff]||2);},
  reset(){this.log=[];this.sCost=0;this.M=0;this.quiet=0;this.total=0;this.paid=0;this.warn=0;this.noFev=false;this.flashT=0;this.txtT=0;this.gap=0;this.waves=0;this.gaps=0;this.ground=0;this.okWaves=0;LEAK.rdy(false);},
  /* ---- pacing ---- */
  spdK(){if(!this.on()||G.lab||G.tut||this.heat())return 1;return this.spd[SET.diff]||1;},
  es(e){return e.gnd||e.type==='boss'||e.type==='gate'?1:this.spdK();},        // speed factor of one enemy (b.js enemy loop)
  gapOK(){return this.on()&&!G.lab&&!G.tut&&(SET.diff==='easy'||SET.diff==='normal')&&!this.heat();},
  gapOn(){return this.gap===2;},
  rdy(on){const e=this.rdyEl&&this.rdyEl.isConnected?this.rdyEl:(on?this.rdyMk():null);if(!e)return;e.style.display=on?'':'none';},
  rdyMk(){const e=document.createElement('div');e.id='retReady';e.setAttribute('aria-hidden','true');
    e.style.cssText='position:absolute;left:0;right:0;top:34%;text-align:center;pointer-events:none;z-index:6;font:700 clamp(22px,5vmin,40px) "Share Tech Mono",monospace;color:#19e3ff;letter-spacing:.2em;text-shadow:0 0 12px #19e3ff;display:none;transition:transform .12s,opacity .12s';
    e.textContent='READY';($('stage')||document.body).appendChild(e);this.rdyEl=e;return e;},
  /* ---- ground enemies ---- */
  gndOK(){if(!this.on()||rotMode||G.lab||G.tut||G.boss||G.bossDone)return false;
    if(ST.on){const d=ST.def;if(!d||(d.pos|0)<2||/FAEHRE|FLOTTE|FERRY/.test(d.name||''))return false;}else if(DIR.tierv()<2)return false;
    let n=0;for(const e of G.en)if(e.gnd&&e.hp>0)n++;return n<3;},
  mk(type,x){const g=this.GT[type],gy=UIK.groundY();
    const e=en(type,{x,y:gy-g.r,by:gy-g.r,r:g.r,hp:g.hp,score:g.score,gnd:1,bf:fireIn(gx(1,2))});e._dh=g.r*2;e._dw=g.r*2.6;return e;},
  gwave(){const t=DIR.tierv(),w=[['gtank',.4],['gturret',.35],['gwalker',t>=2.4||(ST.on&&ST.def.pos>=3)?.25:0]];let tot=0;for(const q of w)tot+=q[1];let r=GR()*tot,ty='gtank';for(const q of w){r-=q[1];if(r<=0){ty=q[0];break;}}
    const n=ty==='gwalker'?1:(GR()<.4?2:1);for(let i=0;i<n;i++)this.mk(ty,W+40+i*(ty==='gturret'?210:150));this.ground++;return 3;},
  fire(e,d){   // runs on every beat for a ground enemy
    const arm0=e.arm;if(e.x>W-30||e.x<40||G.dead||e.hp<=0){e.arm=false;return;}
    const far=s=>Math.hypot(e.x-P.x,e.y-P.y)>minShot(s)&&e.x>P.x+60;
    if(--e.bf<=0){
      if(e.type==='gtank'&&e.arm&&far(150)){eb.src=e;const n=G.eb.length;eb(e.x-18,e.y-e.r*.6,-2.4,150);if(G.eb.length>n){const b=G.eb[G.eb.length-1],T=1.7,g=420,dx=Math.max(120,e.x-P.x);b.vx=-dx/T;b.vy=(P.y-b.y-.5*g*T*T)/T;b.lob=g;b.r=7;}eb.src=null;e.bf=fireIn(3.4/d/frK());}
      else if(e.type==='gturret'&&e.arm&&far(170)){eb.src=e;eb(e.x-8,e.y-e.r*.5,aim(e),170+14*d);eb.src=null;e.bf=fireIn(1.7/d/frK());}
      else if(e.type==='gwalker'&&e.arm&&far(150)){eb.src=e;fan(e,3,.5,150+12*d,'#ffa02d');eb.src=null;e.bf=fireIn(2.8/d/frK());}
      else e.bf=fireIn(1.2/d/frK());}
    e.arm=e.bf===1;},
  move(e,dt){const gy=UIK.groundY(),d=diff();e.y=gy-e.r;e.by=e.y;
    if(e.type==='gtank')e.x-=(78+6*d)*dt;else if(e.type==='gturret')e.x-=88*dt;else e.x-=(46+3*d)*dt;},
  /* ---- breach ---- */
  weight(e){return e.el||e.ldr?3:(this.W[e.type]||0);},
  tick(dt){if(!this.on()||!running||G.dead||G.lab||G.tut||ST.over)return;
    if(this.flashT>0)this.flashT-=dt;if(this.txtT>0)this.txtT-=dt;
    for(const e of G.en){if(e.type==='boss'||e.dead||e.lkd||e.hp<=0||e.rk||e.x>-e.r-4)continue;e.lkd=1;const w=this.weight(e);if(w>0)this.leak(w,e);}
    for(const b of G.eb)if(b.lob)b.vy+=b.lob*dt*G.slow;},
  leak(w,e){if(this.log.length<40)this.log.push([e.type,Math.round(e.x),w]);this.M+=w;this.total+=w;this.quiet=0;this.noFev=true;this.flashT=.9;
    floater(34,clamp(e.y,60,H-90),this.M<=this.free?'LEAK '+Math.min(this.M,this.free)+'/'+this.free:'LEAK','#ff6a7a');
    while(this.M>=this.cap())this.pay();},
  pay(){this.M=this.free;this.paid++;
    if(this.sCost>=Math.max(1,Math.floor(P.max/2))){this.say('BREACH: hull holds');return;}   // a stage's breach never takes more than half the hull
    if(!this.hard()&&P.hp<=1){this.say('BREACH: hull holds');return;}
    const hp0=P.hp,sh0=SH.sh,inv=P.inv,dq=P.dq,dh=P.dashT;P.inv=0;P.dq=0;P.dashT=0;hurt(1);
    if(P.hp>=hp0){P.inv=inv;P.dq=dq;P.dashT=dh;}
    this.say(P.hp<hp0?'BREACH: -1 hull':'BREACH: blocked');if(P.hp<hp0){this.cost=(this.cost|0)+1;this.sCost++;}},
  say(t){this.txt=t;this.txtT=2.6;floater(W*.5,H*.28,t,'#ff3050');shake(6);},
  /* ---- HUD: a thin BREACH meter in the stat strip, red as it fills ---- */
  draw(c,x,y3,k,right){if(!this.on()||!running||G.lab||G.tut||ST.over)return;const f=Math.min(1,this.M/this.cap()),t=c.getTransform(),u=Math.hypot(t.a,t.b)*(c.canvas.getBoundingClientRect().width/c.canvas.width||1),
      fs=Math.max(14*k,14.5/Math.max(.05,u)),q=fs/14;c.save();                       // text is at least 14 css px on a phone
    c.font=`700 ${fs.toFixed(1)}px "Share Tech Mono",monospace`;c.textAlign='left';
    const hot=f>=.75,col=hot?'#ff5060':f>=.5?'#ffb020':'#c4cde6',lab=this.txtT>0?this.txt:(RET.holdline&&this.lab||'BREACH');c.fillStyle=this.txtT>0?'#ff6a7a':col;
    const w0=c.measureText(lab).width+8*q,bw=this.txtT>0?0:64*q,bh=5*q;
    if(right)x-=w0+bw;c.fillStyle='#05030ccc';c.fillRect(x-4*q,y3-fs*.5-1*q,w0+bw+6*q,fs+4*q);   // dark backing: the label sits over bright art
    c.fillStyle=this.txtT>0?'#ff6a7a':col;c.fillText(lab,x,y3+4*q);
    if(this.txtT<=0){c.fillStyle='#ffffff22';c.fillRect(x+w0,y3-bh/2+1*q,bw,bh);c.fillStyle=col;c.fillRect(x+w0,y3-bh/2+1*q,bw*f,bh);
      c.fillStyle='#ffffff66';c.fillRect(x+w0+bw*this.free/this.cap(),y3-bh/2-1*q,1.5*q,bh+2*q);                         // the tick marks where the free warning ends
      if(hot&&!SET.reduce&&Math.floor(G.t*6)%2){c.strokeStyle='#ff3040';c.lineWidth=1.5*q;c.strokeRect(x+w0-1,y3-bh/2,bw+2,bh+2*q);}}
    c.restore();},
  /* ---- drawing of the ground enemies (coloured shapes; painted art spr-en-<type> is used once it is real art) ---- */
  art(e,t){const D=DISTRICTS[G.di],fl=e.flash>0,r=e.r,line=fl?'#fff':D.a,fill=fl?'#fff':'#14091f';
    ctx.save();ctx.translate(e.x,e.y);
    UIK.bossShadow(e,'ground',e._dw);
    if(e.arm){const k=PHF;ctx.save();ctx.globalCompositeOperation='lighter';G_(0,-r*.3,r*(1.7+1.2*k),'#ff3050',.22+.5*k);ctx.restore();}
    if(ART.dflash('spr-en-'+e.type,r*3.2,0,0,0,fl)){ctx.restore();return;}
    ctx.lineWidth=2;ctx.strokeStyle=line;ctx.fillStyle=fill;
    if(e.type==='gtank'){
      ctx.beginPath();ctx.rect(-r*1.1,r-r*.5,r*2.2,r*.5);ctx.fill();ctx.stroke();                        // tread block
      ctx.fillStyle=fl?'#fff':D.a+'66';for(let i=-2;i<=2;i++){ctx.beginPath();ctx.arc(i*r*.42,r-r*.25,r*.16,0,7);ctx.fill();}
      ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(-r*.95,r-r*.5);ctx.lineTo(-r*.7,r-r*1.05);ctx.lineTo(r*.75,r-r*1.05);ctx.lineTo(r*.95,r-r*.5);ctx.closePath();ctx.fill();ctx.stroke();   // hull
      ctx.beginPath();ctx.rect(-r*.4,r-r*1.45,r*.8,r*.4);ctx.fill();ctx.stroke();                         // turret
      ctx.save();ctx.translate(-r*.2,r-r*1.25);ctx.rotate(-.35);ctx.beginPath();ctx.rect(-r*1.05,-r*.09,r*.9,r*.18);ctx.fill();ctx.stroke();ctx.restore();}   // barrel, up and left
    else if(e.type==='gturret'){const rise=clamp((W+10-e.x)/90,0,1),gy=UIK.groundY();ctx.save();ctx.beginPath();ctx.rect(-r*2,-r*3,r*4,r*3+r+ (gy-(e.y+r)));ctx.clip();ctx.translate(0,(1-rise)*r*1.8);
      ctx.beginPath();ctx.moveTo(-r*.95,r);ctx.lineTo(-r*.6,r-r*.55);ctx.lineTo(r*.6,r-r*.55);ctx.lineTo(r*.95,r);ctx.closePath();ctx.fill();ctx.stroke();                          // base
      const a=clamp(Math.atan2(P.y-(e.y-r*.2),P.x-e.x),-3.0,-.15);ctx.beginPath();ctx.arc(0,r-r*.6,r*.5,Math.PI,0);ctx.fill();ctx.stroke();                                       // dome
      ctx.save();ctx.translate(0,r-r*.75);ctx.rotate(a);ctx.beginPath();ctx.rect(0,-r*.1,r*1.15,r*.2);ctx.fill();ctx.stroke();ctx.restore();ctx.restore();}
    else{const sw=Math.sin(e.t*3.2),lift=v=>Math.max(0,v)*5;                                                // walker: the legs step, the body stays level
      ctx.lineWidth=3;for(const s of[-1,1]){const ph=s*sw,fx=s*r*.5+ph*r*.35,fy=r-lift(ph);ctx.beginPath();ctx.moveTo(s*r*.25,r-r*.9);ctx.lineTo(s*r*.55,r-r*.5);ctx.lineTo(fx,fy);ctx.stroke();
        ctx.beginPath();ctx.rect(fx-r*.22,fy-3,r*.44,3);ctx.fillStyle=fl?'#fff':D.a;ctx.fill();}
      ctx.lineWidth=2;ctx.fillStyle=fill;ctx.beginPath();ctx.rect(-r*.8,r-r*1.9,r*1.6,r*1.0);ctx.fill();ctx.stroke();                                                   // torso
      ctx.beginPath();ctx.rect(-r*.45,r-r*2.35,r*.9,r*.5);ctx.fill();ctx.stroke();                                                                                       // head
      ctx.save();ctx.translate(-r*.5,r-r*1.45);ctx.beginPath();ctx.rect(-r*1.0,-r*.1,r*.9,r*.2);ctx.fill();ctx.stroke();ctx.restore();                                   // arm cannon
      ctx.globalCompositeOperation='lighter';G_(-r*.15,r-r*2.1,r*.35,'#ff3050',.8);ctx.globalCompositeOperation='source-over';}
    hpBar(-14,-r*(e.type==='gwalker'?1.45:1.05)-6,28,e.hp/e.max);
    ctx.restore();},
  init(){if(this.inited)return;this.inited=true;
    Object.assign(DMG.ml,{gtank:this.GT.gtank.ml,gturret:this.GT.gturret.ml,gwalker:this.GT.gwalker.ml});
    { const de=drawEnemy;drawEnemy=function(e,t){if(e.gnd&&RET.leak){LEAK.art(e,t);return;}de(e,t);}; }
    { const dp=DMG.pass;DMG.pass=function(dt){dp.call(this,dt);LEAK.tick(dt);}; }
    { const fg=RET.fvGain;RET.fvGain=function(v){if(RET.leak&&LEAK.noFev)return false;return fg.call(this,v);}; }
    { const so=DIR.spawnOne;DIR.spawnOne=function(fill){
        if(!RET.leak||G.lab||G.tut)return so.call(this,fill);
        if(LEAK.gapOn()){this.acc=Math.min(this.acc+1,1.4);return;}                         // the breathing bar: nothing new enters
        LEAK.waves++;
        if(LEAK.gndOK()&&!fill){LEAK.okWaves++;if(GR()<LEAK.pg){LEAK.gwave();if(LEAK.gapOK()&&LEAK.waves%3===0&&!LEAK.gap)LEAK.gap=1;return;}}
        so.call(this,fill);
        if(LEAK.gapOK()&&LEAK.waves%3===0&&!LEAK.gap)LEAK.gap=1;}; }
    { const md=DIR.miniDown;DIR.miniDown=function(){md.call(this);if(RET.leak&&!LEAK.heat()&&SET.diff!=='legend'&&!LEAK.gap)LEAK.gap=1;}; }
    { const st=HUDX.strip;HUDX.strip=function(c,x,y,k){st.call(this,c,x,y,k);try{LEAK.draw(c,x,y+46*k,k);}catch(err){}}; }
    if(typeof hudMin==='function'){const hm=hudMin;hudMin=function(c,k,x,y,t){hm(c,k,x,y,t);try{LEAK.draw(c,x+312*k,y+66*k,k,true);}catch(err){}};}   // desktop plate: the BREACH meter sits right-aligned on the weapon row under the plate (it used to draw over the HULL label at y+22k)
    if(typeof labBuildFoes==='function'){const lb=labBuildFoes;labBuildFoes=function(body){lb(body);const r=lsec(body,'GROUND ENEMY (on the road)');
      for(const [n,t] of [['TANK','gtank'],['GROUND TURRET','gturret'],['WALKER','gwalker']])lchip(r,n,labFoe(()=>LEAK.mk(t,W-110)));};}
  }};
NR.on('runStart',()=>{LEAK.init();LEAK.reset();});
NR.on('stageClear',()=>{LEAK.rdy(false);});
NR.on('runEnd',()=>{LEAK.rdy(false);});
NR.on('beat',()=>{if(!RET.leak||!running)return;const d=diff();
  for(const e of G.en)if(e.gnd)LEAK.fire(e,d);
  if(LEAK.gap===2&&LEAK.rdyEl){const e=LEAK.rdyEl;e.style.transform='scale(1.25)';e.style.opacity='1';setTimeout(()=>{e.style.transform='scale(1)';e.style.opacity='.7';},120);}});
NR.on('bar',()=>{if(!RET.leak||!running)return;LEAK.noFev=false;
  if(LEAK.gap===2){LEAK.gap=0;LEAK.rdy(false);}else if(LEAK.gap===1){LEAK.gap=2;LEAK.gaps++;LEAK.rdy(true);}
  if(LEAK.M>0&&++LEAK.quiet>=2){LEAK.M=Math.max(0,LEAK.M-1);LEAK.quiet=0;}});
