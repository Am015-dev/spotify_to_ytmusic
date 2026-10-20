/* ---------- COUNTER threats: DASH and EMP as the answers (flag RET.counter, ?counter=0 = the abilities without these threats). Test: nightrun/counter-test.js.
   Owner, 19 Oct 2026: "the dash button and emp still useless, the game needs to be more strategic and timing". A button only matters when some threat needs it.
   One threat every few bars (never with a boss out, in a pit stop, the lab or the tutorial), in turn from the ones the stage has unlocked:
     SEEKER   (story stage 3+)  a shooter glows a red ring for .7 s, then fires a marked homing shot (red ring; 300 px/s, turns 9 rad/s for 4 s, 2 hull on the hard tiers). Dash in the last .15 s before it hits = PARRY:
                                it flies back as a big player shot, refunds a charge and adds meter. Too early wastes the charge (it keeps homing), too late is a hit.
     WALL     (5+, not Easy)    a full-height laser line, 1.3 s warning on the right edge, then it sweeps left: only a dash (i-frames) crosses it.
                                With no dash charge when it starts, or below Hard, it gets a 110 px gap (Normal: dash or find the gap).
     CURTAIN  (7+, not Easy)    .9 s tell (gap chevrons), then two dotted walls drawn as bullets (one hazard each, not eb(), so ebCap stays free) .45 s apart, gaps 96 px and >= 270 px apart (too far to slide between even at touch speed; .9 s apart below Hard or with no dash and no EMP): dash a layer or spend the EMP.
     WARDEN   (9+)              an armoured gunner whose shield takes 70% of every hit; only an EMP strips it, for 8 s, then it comes back.
   EMP timing: 6+ enemy bullets or a shielded warden on screen = GOOD EMP (score + a quarter of the meter back); on a near-empty screen it pays nothing extra.
     The EMP button pulses (class abHot) while it would be worth it. DASH then EMP inside 1 s = COMBO blast (12 more to every ordinary foe within 300 px).
   Dash while overheated vents the gun (VENT). Hooks: b.js dash start (CTR.dash) and EMP press (CTR.emp), c.js draw. Boss HP, armour caps, bossmoves untouched;
   bullets go through eb() (ebCap, BCAP); tells >= .7 s; reduce motion = no pulse/flash. */
if(RET.counter===undefined)RET.counter=!/[?&]counter=0/.test(location.search);
const CTR=window.CTR={get on(){return!!RET.counter;},
  stat:{seek:0,parry:0,early:0,wall:0,wallHit:0,wallDash:0,curt:0,curtHit:0,curtDash:0,curtEmp:0,ward:0,strip:0,good:0,waste:0,combo:0,vent:0},
  UN:{seek:3,wall:5,curt:7,ward:9},EV:{easy:10,normal:9,hard:6,vhard:5,legend:4},
  HK:{easy:4,normal:6,hard:9,vhard:9,legend:9},WK:{easy:.8,normal:1,hard:1.3,vhard:1.5,legend:1.7},
  reset(){this.tells=[];this.walls=[];this.curts=[];this.bars=0;this.k=0;this.lastDash=-9;this.pend=0;this.fx=[];},
  live(){return this.on&&G&&G.live&&!G.dead&&!G.lab&&!G.tut&&!(SH&&SH.active);},
  kinds(){const s=S2.stg(),e=SET.diff==='easy',o=[];if(s>=this.UN.seek)o.push('seek');if(!e&&s>=this.UN.wall)o.push('wall');if(!e&&s>=this.UN.curt)o.push('curt');if(s>=this.UN.ward)o.push('ward');return o;},
  charges(){return window.ABIL&&ABIL.on?ABIL.st().n:(P.dashCd<=0?1:0);},
  red(){return window.READ&&READ.D||'#ff2d78';},
  start(k){if(k==='seek')this.seek();else if(k==='wall')this.wall();else if(k==='curt')this.curt();else if(k==='ward')this.ward();},
  seek(){const c=G.en.filter(e=>e.type!=='gate'&&e.type!=='boss'&&!e.gr&&!e.wpt&&e.x<W-40&&e.x>P.x+150&&e.hp>0);
    const e=c.length?c[Math.floor(Math.random()*c.length)]:null,n=HARDS.includes(SET.diff)?2:1;
    for(let i=0;i<n;i++)this.tells.push({e,x:e?e.x:W-30,y:e?e.y:60+Math.random()*(H-120),t:.7+.45*i,T:.7+.45*i});this.stat.seek++;},
  fire(t){const x=t.e&&!t.e.dead&&t.e.hp>0?t.e.x-10:t.x,y=t.e&&!t.e.dead&&t.e.hp>0?t.e.y:t.y,k=G.eb.length;
    eb(x,y,Math.atan2(P.y-y,P.x-x),SET.diff==='easy'?240:300,this.red(),7);if(G.eb.length>k){const b=G.eb[k];b.cxM=1;b.cxH=4;b.dmg=HARDS.includes(SET.diff)?2:1;}},
  wall(){this.walls.push({x:W-30,warn:1.3,v:420,gap:null,hit:0,dash:0});this.stat.wall++;this.tip('Laser wall: DASH through it');},
  curt(){const m=60,g1=m+Math.random()*(H-2*m);const g2=g1<H/2?clamp(g1+270+Math.random()*60,m,H-m):clamp(g1-270-Math.random()*60,m,H-m);
    const d=this.charges()<1&&P.emp<1||!HARDS.includes(SET.diff)?.9:.45;this.curts.push({t:.9+d,g:[g1,g2],T0:.9});[g1,g2].forEach((gy,i)=>this.walls.push({x:W+8,warn:.9+d*i,v:230,gap:{y:gy,h:96},cur:1,hit:0,dash:0}));this.stat.curt++;this.tip('Bullet curtain: EMP clears it');},
  ward(){const e=en('turret',{x:W+30,y:90+Math.random()*(H-180),stop:W-220});if(!e)return;const hp=Math.round(60*(this.WK[SET.diff]||1));
    e.hp=e.max=e.hq=hp;e.ctw=1;e.wsh=1;e.wshT=0;e._ph=hp;e.age=0;e.score=Math.max(e.score||0,800);this.stat.ward++;this.tip('Shielded: EMP strips the shield');},
  tip(t){try{const o=load('mnr_ctrtip',{})||{};if(o[t]||G.tut||G.lab||document.webdriver||navigator.webdriver)return;o[t]=1;save('mnr_ctrtip',o);hintShow(t,4);}catch(e){}},
  /* b.js, the frame a dash starts (before the bullets move): parry, vent */
  dash(){if(!this.live())return;this.lastDash=G.t;
    if(P.over){P.over=false;P.heat=Math.min(P.heat,35);floater(P.x,P.y-36,'VENT','#19e3ff');this.stat.vent++;}
    let got=0;for(const b of G.eb){if(!b.cxM||b.dead)continue;const sp=Math.hypot(b.vx,b.vy)||1,tt=(Math.hypot(b.x-P.x,b.y-P.y)-(b.r+3))/sp;
      if(tt<=.17){b.dead=1;got++;let tg=null,bd=1e9;for(const e of G.en){if(e.dead||e.hp<=0||e.gr)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;tg=e;}}
        const a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):0;G.pb.push({x:P.x+10,y:P.y,vx:Math.cos(a)*700,vy:Math.sin(a)*700,dm:window.TIM&&TIM.on?40:15,pf:1,big:1,ab:1,hk:1.5});
        burst(b.x,b.y,'#ffffff',10,240,.35);this.stat.parry++;}
      else if(tt<=.6)this.stat.early++;}
    if(got){G.eb=G.eb.filter(b=>!b.dead);G.score+=Math.round(300*got*G.mult);floater(P.x,P.y-30,'PARRY!','#ffffff');AU.sfx('up');if(!SET.reduce)shake(4);
      if(window.ABIL&&ABIL.on){const S=ABIL.st();S.n=Math.min(ABIL.max(),S.n+1);ABIL.gain(.1);}else P.dashCd=0;}},
  /* b.js, the frame EMP is pressed with a charge (before it clears): strip, good/waste, combo */
  emp(){if(!this.live())return;const cs=this.walls.filter(w=>w.cur&&w.x<W+10),n=G.eb.length+6*cs.length,ws=G.en.filter(e=>e.ctw&&e.wsh&&!e.dead&&e.x<W);
    for(const w of cs){let k=0;for(let y=30;y<H&&k<4;y+=120)if(Math.abs(y-w.gap.y)>48){G.pk.push({t:'shard',x:w.x,y,vx:-40,vy:0,bob:0});k++;}this.stat.curtEmp++;}
    this.walls=this.walls.filter(w=>!cs.includes(w));this.curts=[];
    for(const e of G.en)if(e.ctw&&!e.dead){if(e.wsh)this.stat.strip++;e.wsh=0;e.wshT=8;e.flash=.3;e.dk=G.t;}
    if(n>=6||ws.length){this.stat.good++;this.goodAt=G.t;G.score+=Math.round(400*G.mult);floater(P.x,P.y-44,'GOOD EMP','#ffe14d');this.pend+=.25;}else this.stat.waste++;
    if(G.t-this.lastDash<=1){this.stat.combo++;floater(P.x,P.y-58,'COMBO BLAST','#ff5fd2');this.fx.push({x:P.x,y:P.y,t:0});
      for(const e of G.en){if(e.type==='boss'||e.dead||e.hp<=0||e.gr)continue;if(Math.hypot(e.x-P.x,e.y-P.y)<300){e.hp-=12;e.flash=.25;e.dk=G.t;}}}},
  hot(){return P.emp>0&&(G.eb.length>=6||this.walls.some(w=>w.cur&&w.x<W+10)||G.en.some(e=>e.ctw&&e.wsh&&e.x<W));},
  tick(dt){if(!this.on||!G||!P)return;const b=$('bEmp');if(b)b.classList.toggle('abHot',!!(running&&!G.dead&&!SET.reduce&&this.hot()));
    if(this.pend>0&&window.ABIL&&ABIL.on){ABIL.gain(this.pend);this.pend=0;}
    for(const f of this.fx)f.t+=dt;this.fx=this.fx.filter(f=>f.t<.5);
    if(!G.live||G.dead){this.tells=[];this.walls=[];this.curts=[];return;}
    for(const t of this.tells){t.t-=dt;if(t.t<=0){t.dead=1;this.fire(t);}}this.tells=this.tells.filter(t=>!t.dead);
    const hk=this.HK[SET.diff]||3;
    for(const b of G.eb){if(!b.cxM||!(b.cxH>0))continue;b.cxH-=dt;const sp=Math.hypot(b.vx,b.vy),cur=Math.atan2(b.vy,b.vx);let w=Math.atan2(P.y-b.y,P.x-b.x)-cur;w=Math.atan2(Math.sin(w),Math.cos(w));
      const a=cur+clamp(w,-hk*dt,hk*dt);b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;}
    for(const w of this.walls){if(w.warn>0){w.warn-=dt;if(w.warn<=0&&!w.cur&&(this.charges()<1||!HARDS.includes(SET.diff)))w.gap={y:clamp(P.y+(Math.random()-.5)*160,70,H-70),h:110};continue;}
      const x0=w.x;w.x-=w.v*dt;if(w.hit||w.done)continue;
      if(P.x>=w.x-14&&P.x<=x0+14){const inGap=w.gap&&Math.abs(P.y-w.gap.y)<w.gap.h/2-8;
        if(P.dashT>0||inGap){if(P.dashT>0&&!w.dash){w.dash=1;this.stat[w.cur?'curtDash':'wallDash']++;G.score+=Math.round(200*G.mult);floater(P.x,P.y-30,'THROUGH','#19e3ff');}}
        else if(P.inv<=0&&!w.dash){w.hit=1;this.stat[w.cur?'curtHit':'wallHit']++;hurt(1);}}
      if(w.x<P.x-20)w.done=1;}
    this.walls=this.walls.filter(w=>w.x>-30);
    for(const c of this.curts){c.t-=dt;if(c.t<=0)c.dead=1;}this.curts=this.curts.filter(c=>!c.dead);
    for(const e of G.en){if(!e.ctw||e.dead)continue;e.age+=dt;if(e.age<20&&e.t>5)e.t=5;   // a warden stays up to 20 s
      if(e.wsh&&e.hp<e._ph&&e.hp>0)e.hp=e._ph-(e._ph-e.hp)*.3;
      if(!e.wsh){e.wshT-=dt;if(e.wshT<=0){e.wsh=1;floater(e.x,e.y-e.r-20,'SHIELD UP','#7df9ff');}}e._ph=e.hp;}},
  bar(){if(!this.live()||this.noAuto||G.boss||G.transT>=0)return;this.bars++;const ev=this.EV[SET.diff]||7;if(this.bars%ev!==ev-2)return;
    const o=this.kinds();if(!o.length)return;this.start(o[this.k++%o.length]);},
  draw(){if(!this.on||!G||!G.live)return;const r=this.red(),t=G.t;ctx.save();
    for(const s of this.tells){const f=1-s.t/s.T,x=s.e&&!s.e.dead?s.e.x:s.x,y=s.e&&!s.e.dead?s.e.y:s.y;ctx.globalAlpha=.4+.6*f;ctx.strokeStyle=r;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,34-16*f,0,7);ctx.stroke();}
    for(const b of G.eb)if(b.cxM){ctx.globalAlpha=1;ctx.strokeStyle=r;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(b.x,b.y,13+(SET.reduce?0:2*Math.sin(t*20)),0,7);ctx.stroke();}
    for(const w of this.walls){if(w.cur){if(w.warn>0)continue;ctx.globalAlpha=1;ctx.fillStyle=r;for(let y=14;y<H;y+=26)if(Math.abs(y-w.gap.y)>48){ctx.beginPath();ctx.arc(w.x,y,7,0,7);ctx.fill();}continue;}
      if(w.warn>0){ctx.globalAlpha=.35+.35*(SET.reduce?1:Math.abs(Math.sin(t*10)));ctx.strokeStyle=r;ctx.lineWidth=3;ctx.setLineDash([10,10]);ctx.beginPath();ctx.moveTo(w.x,0);ctx.lineTo(w.x,H);ctx.stroke();ctx.setLineDash([]);
        ctx.globalAlpha=.9;ctx.fillStyle='#ffffff';ctx.font='bold 16px sans-serif';ctx.textAlign='right';ctx.fillText(say('DASH THROUGH'),w.x-10,H/2);continue;}
      ctx.globalAlpha=.85;ctx.fillStyle=r;const g=w.gap;if(g){ctx.fillRect(w.x-6,0,12,g.y-g.h/2);ctx.fillRect(w.x-6,g.y+g.h/2,12,H-g.y-g.h/2);}else ctx.fillRect(w.x-6,0,12,H);
      ctx.globalAlpha=.25;ctx.fillRect(w.x-14,0,28,H);}
    for(const c of this.curts){ctx.globalAlpha=.5+.4*(SET.reduce?1:Math.abs(Math.sin(t*8)));ctx.fillStyle='#4dff9a';c.g.forEach((gy,i)=>{ctx.globalAlpha=i?.45:.95;ctx.beginPath();ctx.moveTo(W-6,gy-48);ctx.lineTo(W-26,gy);ctx.lineTo(W-6,gy+48);ctx.closePath();ctx.fill();});
      ctx.globalAlpha=.4;ctx.fillStyle=r;ctx.fillRect(W-4,0,4,H);}
    for(const e of G.en){if(!e.ctw||e.dead)continue;ctx.globalAlpha=1;ctx.lineWidth=4;const R=(e.r||20)+10;
      if(e.wsh){ctx.strokeStyle='#7df9ff';ctx.beginPath();for(let i=0;i<7;i++){const a=i*Math.PI/3+t*.6;ctx[i?'lineTo':'moveTo'](e.x+Math.cos(a)*R,e.y+Math.sin(a)*R);}ctx.stroke();}
      else{ctx.strokeStyle='#5a6b7a';ctx.beginPath();ctx.arc(e.x,e.y,R,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-e.wshT/8));ctx.stroke();}}
    for(const f of this.fx){ctx.globalAlpha=Math.max(0,1-f.t/.5);ctx.strokeStyle='#ff5fd2';ctx.lineWidth=8;ctx.beginPath();ctx.arc(f.x,f.y,300*Math.min(1,f.t/.3),0,7);ctx.stroke();}
    ctx.restore();}
};
CTR.reset();
{const st=document.createElement('style');st.textContent=`@keyframes abHot{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
#touch button.abHot#bEmp{animation:abHot .5s ease-in-out infinite;filter:drop-shadow(0 0 10px #ffe14d)}`;document.head.appendChild(st);}
NR.on('runStart',()=>CTR.reset());
NR.on('bar',()=>CTR.bar());
NR.on('tick',dt=>CTR.tick(dt));
