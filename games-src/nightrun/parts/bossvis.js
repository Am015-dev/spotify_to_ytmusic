// PURPOSE: bosses look different in each phase
// FLAG: bossvis (?bossvis=0), first30 (?first30=0)
// TEST: bossvis-test.js, first30-test.js
/* ---------- bosses that look different in each phase = parts/bossvis.js (flag RET.bossvis; ?bossvis=0 = the bosses before it). Review F10, 18 Oct 2026.
   Visuals only: no hitbox, HP, armour cap or timing is touched. The phases come from armour.js / b.js bossBeat (e.ph 1..3, NR 'bossPhase').
   Per phase: a red tint on the boss sprite (stronger in 3), one armour plate gone per change (placeholder shapes drawn over the body from e._dw / e._dh,
   cracks + sparks where it broke, a plate falls off), a different aura ring (ground bosses: upper arc only, they stay on the road line), the new
   attack's name flashed for one bar, and 1/3 2/3 3/3 pips with the phase lines on the boss bar. The 45 ms hit-stop is RET.JU 'phase' (ret.js; 0 with reduced motion). */
if(RET.bossvis===undefined)RET.bossvis=!/[?&]bossvis=0/.test(location.search);
const BV=window.BV={get on(){return!!RET.bossvis;},pips:0,flash:'',tinted:0,
  NAMES:{fan5:'FAN SHOT',fan7:'WIDE FAN',fan9:'WALL OF SHOTS',laser:'LASER SWEEP',spiral:'SPIRAL STORM',ring:'RING BURST',summon:'CALLS ESCORTS'},
  TINT:[null,'#ff3a3a','#ff1020'],TA:[0,.2,.4],
  RING:[['#19e3ff',1.25,2,0],['#ffb020',1.35,3,1],['#ff3040',1.45,4,2]],
  SLOTS:[[0,-.5,.34,.16,0],[-.5,0,.16,.36,1],[.46,.18,.16,.3,2]],        // plate slots: x, y (of half size), w, h, id
  tc:new Map(),
  name(e){const l=e.lists&&e.lists[e.ph-1];return l?(BV.NAMES[l[0]]||String(l[0]).toUpperCase()):'';},
  reduced(){return!!(SET.reduce||SET.rm);},
  tintOf(img,sx,sy,sw,sh,dw,dh,col){const w=Math.max(1,Math.round(dw)),h=Math.max(1,Math.round(dh)),k=sx+'|'+sy+'|'+sw+'|'+sh+'|'+w+'|'+h+'|'+col;
    let m=BV.tc.get(img);if(!m)BV.tc.set(img,m=new Map());let c=m.get(k);if(c)return c;
    if(m.size>24)m.clear();c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(img,sx,sy,sw,sh,0,0,w,h);
    g.globalCompositeOperation='source-atop';g.fillStyle=col;g.fillRect(0,0,w,h);m.set(k,c);return c;}};
/* the tint: while the original boss draw runs, every big picture it puts on the canvas gets the same picture drawn again in red on top (same place, only where the picture has pixels) */
{const db=drawBoss;drawBoss=function(e,t,fl){if(!BV.on||!e||!(e.ph>1)){return db(e,t,fl);}
  const col=BV.TINT[e.ph-1],a0=BV.TA[e.ph-1]*(e.ph===3&&!BV.reduced()?.85+.15*PUL:1);let n=0;
  const own=Object.getOwnPropertyDescriptor(ctx,'drawImage'),real=ctx.drawImage;
  ctx.drawImage=function(img,a,b,c,d,e2,f,g,h){real.apply(ctx,arguments);
    if(!img||!(img.width>64)||arguments.length<5)return;
    let sx=0,sy=0,sw=img.width,sh=img.height,dx,dy,dw,dh;
    if(arguments.length>=9){sx=a;sy=b;sw=c;sh=d;dx=e2;dy=f;dw=g;dh=h;}else{dx=a;dy=b;dw=c;dh=d;}
    if(!(dw>40)||!(dh>40))return;
    const ga=ctx.globalAlpha,go=ctx.globalCompositeOperation;if(go!=='source-over')return;
    ctx.globalAlpha=ga*a0;real.call(ctx,BV.tintOf(img,sx,sy,sw,sh,dw,dh,col),dx,dy,dw,dh);ctx.globalAlpha=ga;n++;};
  try{db(e,t,fl);}finally{if(own)Object.defineProperty(ctx,'drawImage',own);else delete ctx.drawImage;}
  BV.tinted=n;
  if(!n&&!e._dw){ctx.save();ctx.globalAlpha=a0*.8;ctx.fillStyle=col;ctx.beginPath();ctx.arc(0,0,e.r,0,7);ctx.fill();ctx.restore();}   // no picture (placeholder boss): the disc itself goes red
  };}
/* plates, cracks, aura: drawn over the boss in its own coordinates (the context is at the boss centre) */
BV.over=function(e,t){const ph=e.ph||1,mv=UIK.moveOf?UIK.moveOf(e):'air',ground=mv!=='air',dw=e._dw||e.r*3,dh=e._dh||e.r*3,k30=RET.first30&&window.F30?F30.k(e):1,hw=dw/2,hh=dh/2,red=BV.reduced(),by=0;
  BV.rect={cx:(()=>{const T=ctx.getTransform();return T.e;})(),cy:ctx.getTransform().f,s:Math.hypot(ctx.getTransform().a,ctx.getTransform().b),hw:hw*k30,hh:hh*k30,rot:!!rotMode};
  ctx.save();if(k30!==1)ctx.scale(k30,k30);
  // aura ring: phase 1 thin cyan, 2 amber double, 3 red thick and pulsing; a ground boss gets the upper arc only
  const R=BV.RING[ph-1],rr=Math.max(hw,hh)*.5*R[1]+e.r*.35,pu=red?0:Math.sin(t*(3+ph*2))*(ph-1)*2;
  ctx.globalCompositeOperation='lighter';ctx.strokeStyle=R[0];ctx.lineWidth=R[2];ctx.globalAlpha=.3+.1*ph;
  for(let i=0;i<(ph===2?2:1);i++){ctx.beginPath();const r=rr+i*8+pu;if(ground)ctx.ellipse(0,hh*.3,r*1.25,r,0,Math.PI,Math.PI*2);else ctx.arc(0,by,r,0,7);ctx.stroke();}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  // armour plates: slot s is gone in phase s+2 and later (phase 2 loses one, phase 3 two); intact plates are steel chips, gone ones a dark scar with cracks
  const lost=ph-1,v=e.bv;
  for(const s of BV.SLOTS){const id=s[4],x=s[0]*hw*(ground&&id===0?1:1),y=(ground&&id===0?-.46:s[1])*hh,w=s[2]*hw,h=s[3]*hh;
    if(id<lost){
      ctx.fillStyle='#0a0612cc';ctx.beginPath();ctx.ellipse(x,y,w*.55,h*.55,0,0,7);ctx.fill();
      ctx.strokeStyle='#ff6a3d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-w*.6,y-h*.2);ctx.lineTo(x-w*.1,y+h*.05);ctx.lineTo(x+w*.15,y-h*.3);ctx.lineTo(x+w*.6,y+h*.15);ctx.moveTo(x-w*.1,y+h*.05);ctx.lineTo(x,y+h*.6);ctx.stroke();
      if(!red&&((Math.floor(t*9)+id)%5===0)){ctx.globalCompositeOperation='lighter';G_(x+rnd(-w*.4,w*.4),y+rnd(-h*.3,h*.3),9+ph*3,'#ffd23d',.9);ctx.globalCompositeOperation='source-over';}
      else if(red){ctx.globalCompositeOperation='lighter';G_(x,y,10,'#ffd23d',.5);ctx.globalCompositeOperation='source-over';}
    }else{
      ctx.fillStyle=RET.first30?R[0]+'73':'#7a84a8aa';ctx.strokeStyle=RET.first30?'#0a0612':'#dfe6ff';ctx.lineWidth=1.5;ctx.beginPath();   // first30: a tinted marker in the phase colour, not a white plate
      ctx.moveTo(x-w*.5,y+h*.5);ctx.lineTo(x-w*.35,y-h*.5);ctx.lineTo(x+w*.5,y-h*.4);ctx.lineTo(x+w*.4,y+h*.5);ctx.closePath();ctx.fill();ctx.stroke();if(BV.pl)BV.pl.push(ctx.fillStyle);
    }}
  // the plate that just broke falls off the boss (ground bosses: it drops to the road line and stops there)
  if(v&&v.t>0&&v.id!=null){const s=BV.SLOTS[v.id],p=1-v.t,w=s[2]*hw,h=s[3]*hh,x=s[0]*hw+(v.id===2?1:-1)*p*50,fall=Math.min(p*p*260,ground?Math.max(0,hh-(s[1]*hh)-4):260);
    ctx.save();ctx.globalAlpha=Math.min(1,v.t*2);ctx.translate(x,(ground&&v.id===0?-.46:s[1])*hh+fall);ctx.rotate(red?0:p*4);ctx.fillStyle=RET.first30?R[0]:'#7a84a8';ctx.strokeStyle=RET.first30?'#0a0612':'#dfe6ff';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(-w*.5,h*.5);ctx.lineTo(-w*.35,-h*.5);ctx.lineTo(w*.5,-h*.4);ctx.lineTo(w*.4,h*.5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  ctx.restore();};
{const db2=drawBoss;drawBoss=function(e,t,fl){db2(e,t,fl);if(BV.on&&e&&e.ph)BV.over(e,t);};}
/* the phase change: the broken plate, sparks, and the new attack's name for one bar */
NR.on('bossPhase',d=>{const e=G&&G.boss;if(!BV.on||!e||!d)return;const ph=d.ph||e.ph,id=Math.max(0,Math.min(2,ph-2));e.bv={t:1,id};
  const s=BV.SLOTS[id],hw=(e._dw||e.r*3)/2,hh=(e._dh||e.r*3)/2;
  try{burst(e.x+s[0]*hw,e.y+s[1]*hh,'#ffd23d',BV.reduced()?4:14,220,.4);}catch(x){}
  const nm=BV.name(e),txt='NEW ATTACK: '+nm,bar=4*(BT.spb||.5);BV.flash=txt;
  if(G.banner&&G.banner.t>0)G.banner.b=e.nm+' · '+nm;       // the banner is on screen first: it carries the name too
  if(window.HINT&&typeof HINT.show==='function')HINT.show(txt,{t:bar});       // HINT waits under the banner by itself
  else G.hint={t:(G.banner&&G.banner.t>0?G.banner.t:0)+bar,txt:say(txt)};});   // the hint is hidden under the banner, so its clock starts after it
NR.on('tick',dt=>{const e=G&&G.boss;if(e&&e.bv&&e.bv.t>0)e.bv.t-=dt*1.1;});
/* the boss bar: phase lines at 1/3 and 2/3, three pips, the counter */
{const pips=(x,y,w,h,k,ph)=>{if(!BV.on||!G.boss)return;
    const b=G.boss,p=b.ph||1;ctx.save();ctx.fillStyle='#ffffff99';ctx.fillRect(x+w/3-1,y-1,2,h+2);ctx.fillRect(x+w*2/3-1,y-1,2,h+2);
    const r=Math.max(4,5*k),py=y+h+r+4*k,cx=x+w-r*4.6;
    for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(cx+i*r*2.6,py,r,0,7);ctx.fillStyle=i<p?BV.RING[p-1][0]:'#ffffff22';ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle='#ffffffaa';ctx.stroke();}
    ctx.font=`700 ${Math.max(14,13*k)}px "Chakra Petch",sans-serif`;ctx.textAlign='right';ctx.fillStyle='#fff';ctx.fillText(p+'/3',cx-r*1.6,py+Math.max(14,13*k)*.35);
    ctx.restore();BV.pips=p;};
  const hud=drawHUD;drawHUD=function(t){hud(t);const b=G&&G.boss;if(b&&b.x<W)pips(W/2-200*HKL,30*HKL,400*HKL,8*HKL,HKL,b.ph);};
  const hudp=drawHUDP;drawHUDP=function(t){hudp(t);const b=G&&G.boss;if(!b||b.x>=W)return;const k=HK,w=PW_,bw=Math.min(330,w-120),ny=40*k+6*k;pips((w-bw)/2,ny+12*k,bw,6*k,k,b.ph);};}
/* ===== first30 (flag RET.first30 below; lives here because it is mostly the boss's looks) ===== */
/* ---------- FIRST30 (flag RET.first30, default ON; ?first30=0 = the game exactly as before). Owner, 21 Oct 2026: "boring, eye strain, no story, extremely annoying".
   9  opening: saga.js (no cards before play; 2 small live cards after the first wave; the briefing is one line on the start banner)
   11 bosses: drawn at least F30.MIN css px (draw.js drawBoss scales the body, bossvis.js scales the plates with it; hit radius unchanged), kept in the centre lane,
      and on Normal and below the ship's shots bend toward the boss (F30.TURN rad/s, only shots already heading roughly at it)
   12 eye strain: boss lasers are a tinted soft-edged beam at alpha <= F30.A (existing fx sheet multiplied with a colour; a gradient when the sheet is missing),
      the title logo loses its red / cyan offset. No new art (ASSET-POLICY.md). Test: nightrun/first30-test.js ---------- */
if(RET.first30===undefined)RET.first30=!/[?&]first30=0/.test(location.search);
const F30=window.F30={get on(){return!!RET.first30;},MIN:140,A:.6,TURN:1.5,COL:'#ff5a3c',tc:new Map(),
  s(){const cv=document.getElementById('game');const w=cv?cv.clientWidth:0;return w>0?w/(rotMode?H:W):1;},                         // css px per world unit
  k(e){if(!RET.first30||!e)return 1;const a=Math.max(e._dw||e.r*3,e._dh||e.r*3);return Math.max(1,Math.min(1.7,F30.MIN/(a*F30.s())));},
  css(e){return Math.max(e._dw||e.r*3,e._dh||e.r*3)*F30.k(e)*F30.s();},
  /* a near-white colour becomes amber, anything else is kept: a beam is never white */
  col(c){const m=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c||'');if(!m)return F30.COL;return(+('0x'+m[1])+ +('0x'+m[2])+ +('0x'+m[3]))/3>190&&+('0x'+m[3])>120?'#ffb347':c.slice(0,7);},
  /* the existing sheet multiplied with a colour (pink / white core -> that colour; black stays black, so it is drawn additively), cached */
  tint(img,col){let m=F30.tc.get(img);if(!m)F30.tc.set(img,m=new Map());let c=m.get(col);if(c)return c;if(m.size>6)m.clear();
    c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);g.globalCompositeOperation='multiply';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);
    g.globalCompositeOperation='destination-in';g.drawImage(img,0,0);m.set(col,c);return c;},
  /* a beam from the origin along +x, soft on both edges, one fill at alpha <= A (the caller has translated / rotated) */
  beam(L,w,col){col=F30.col(col);const g=ctx.createLinearGradient(0,-w/2,0,w/2);g.addColorStop(0,col+'00');g.addColorStop(.28,col+'aa');g.addColorStop(.5,col+'ff');g.addColorStop(.72,col+'aa');g.addColorStop(1,col+'00');
    ctx.save();ctx.globalAlpha=Math.min(F30.A,ctx.globalAlpha);ctx.fillStyle=g;F30.maxA=Math.max(F30.maxA,ctx.globalAlpha);ctx.fillRect(0,-w/2,L,w);ctx.restore();F30.beams++;},
  /* the boss laser sheet, tinted, centred at (x,y) w x h (tiled over the length by stretching, like AH.span) */
  sheet(id,x,y,w,h,col){const b=window.ART&&ART.img&&ART.img(id);if(!b)return false;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=F30.A;F30.maxA=Math.max(F30.maxA,ctx.globalAlpha);ctx.translate(x,y);ctx.drawImage(F30.tint(b,F30.col(col)),-w/2,-h/2,w,h);ctx.restore();F30.beams++;return true;},
  beams:0,maxA:0};
/* the logo: no red / cyan split (eye strain on every visit) */
if(RET.first30){const st=document.createElement('style');st.textContent='h1{text-shadow:none!important}h1 span{text-shadow:none!important}';document.head.appendChild(st);}
/* bosses: centre lane (portrait and flyers: the boss stays within 70 world px of the middle once it has arrived) and the auto-aim on Normal and below */
NR.on('tick',dt=>{if(!RET.first30||!G||!G.boss||G.boss.dead||G.dead)return;const e=G.boss;if(e.x>bossX()+4)return;
  const flyer=rotMode||(window.UIK&&UIK.moveOf?UIK.moveOf(e)==='air':true);
  if(flyer){const lo=H/2-80,hi=H/2+80,cl=y=>Math.max(lo,Math.min(hi,y));if(e.bmC&&e.bmC.air){e.bmC.y=cl(e.bmC.y);e.bmC.y0=cl(e.bmC.y0);}
    e.y+=(cl(e.y)-e.y)*Math.min(1,dt*(e.bmC?12:4));}
  if(SET.diff!=='easy'&&SET.diff!=='normal')return;
  for(const b of G.pb){if(b.dead||b.big&&b.pf)continue;const dx=e.x-b.x,dy=e.y-b.y,sp=Math.hypot(b.vx,b.vy);if(sp<50||dx*b.vx+dy*b.vy<=0)continue;
    const a0=Math.atan2(b.vy,b.vx),a1=Math.atan2(dy,dx);let d=Math.atan2(Math.sin(a1-a0),Math.cos(a1-a0));if(Math.abs(d)>1.1)continue;
    const t=Math.max(-F30.TURN*dt,Math.min(F30.TURN*dt,d)),a=a0+t;b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;}});
window.__bv={BV};
