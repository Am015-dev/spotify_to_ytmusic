
// the tier meter: big x1..x4, four segments (the current one fills), a thin line that runs down before the tier slips. k = size, (cx, by) = bottom-centre
function tierMeter(cx,by,k){const T=tierOf(C.n),col=TIERC[T-1],w=262*k,h=40*k,x0=cx-w/2,y0=by-h,pop=G.tpop>0?1+G.tpop*.4*(G.tdir>0?1:-.5):1;
  ctx.save();ctx.fillStyle='#05030ccc';ctx.fillRect(x0,y0,w,h);ctx.strokeStyle=col;ctx.globalAlpha=.5+.45*(T>1?PUL:0);ctx.lineWidth=1.5;ctx.strokeRect(x0+.5,y0+.5,w-1,h-1);ctx.globalAlpha=1;
  ctx.save();ctx.translate(x0+34*k,y0+h/2+10*k);ctx.scale(pop,pop);ctx.font=`700 ${Math.round(30*k)}px "Chakra Petch",sans-serif`;ctx.textAlign='center';ctx.fillStyle=col;ctx.fillText('×'+T,0,0);ctx.restore();
  const sx=x0+68*k,sw=(w-80*k)/TIERS;
  for(let i=0;i<TIERS;i++){const f=i<T-1?1:i===T-1?(T===TIERS?1:(C.n-(T-1)*TS)/TS):0;ctx.fillStyle='#ffffff1c';ctx.fillRect(sx+i*sw,y0+10*k,sw-4*k,12*k);ctx.fillStyle=TIERC[i];ctx.fillRect(sx+i*sw,y0+10*k,(sw-4*k)*f,12*k);
    if(i===T-1&&T===TIERS){ctx.globalAlpha=.3+.4*PUL;ctx.fillStyle='#fff';ctx.fillRect(sx+i*sw,y0+10*k,sw-4*k,12*k);ctx.globalAlpha=1;}}
  if(C.n>0){const left=clamp(1-(G.bc-C.lb+PHF)/(8+SH.ck),0,1);ctx.fillStyle='#ffffff22';ctx.fillRect(sx,y0+27*k,sw*TIERS-4*k,3*k);ctx.fillStyle=col;ctx.fillRect(sx,y0+27*k,(sw*TIERS-4*k)*left,3*k);}
  ctx.restore();}

function drawHUD(t){const D=DISTRICTS[G.di];ctx.save();
  const sc=String(G.score).padStart(8,'0'),mu='×'+G.mult.toFixed(1),bs=String(Math.max(best.score,G.score)).padStart(8,'0');
  const hb=Math.floor(G.bp),bi=((hb%4)+4)%4,T=tierOf(C.n);
  Object.assign(HUDLOG,{score:sc,mult:mu,best:bs,hp:P.hp,hpMax:P.max,neon:SH.neon,heat:Math.round(P.heat),emp:P.emp,wl:P.wl,combo:C.n,tier:T,district:D.name+(G.loop?' +'+G.loop:''),story:ST.on?ST.n:0,goal:ST.on?ST.label():'',boss:!!G.boss,bossHp:G.boss?Math.round(G.boss.hp):0,beat:bi,frame:HUDLOG.frame+1});
  ctx.font='700 22px "Chakra Petch",sans-serif';ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText(sc,18,32);
  ctx.font='16px "Share Tech Mono",monospace';ctx.fillStyle=D.b;ctx.fillText(mu,138,31);
  ctx.fillStyle='#8c86b8';ctx.font='12px "Share Tech Mono",monospace';ctx.fillText((G.daily?'DAILY ':'BEST ')+(G.daily?String(Math.max(dailyBest.score,G.score)).padStart(8,'0'):bs),18,48);
  ctx.textAlign='right';ctx.font='700 15px "Chakra Petch",sans-serif';ctx.fillStyle=D.a;ctx.fillText(ST.on?ST.n+' · '+ST.def.name:D.name+(G.loop?' +'+G.loop:'')+(HARD?' · HARD':''),W-18,28);
  const pw=180,px=W-18-pw;ctx.fillStyle='#ffffff18';ctx.fillRect(px,36,pw,4);ctx.fillStyle=G.boss?'#ff3040':D.b;ctx.fillRect(px,36,pw*(ST.on?ST.frac():G.boss||G.bossDone?1:DIR.frac()),4);
  ctx.font='11px "Share Tech Mono",monospace';ctx.fillStyle='#8c86b8';ctx.fillText(ST.on?ST.label():G.boss?'BOSS':G.bossDone?'CLEAR':'→ '+D.bossName,W-18,54);
  // bottom-left
  const by=H-20;ctx.textAlign='left';ctx.font='11px "Share Tech Mono",monospace';ctx.fillStyle='#8c86b8';ctx.fillText('HULL',18,by-14);
  const hw=Math.min(16,88/P.max);for(let i=0;i<P.max;i++){ctx.fillStyle=i<P.hp?(P.hp<=1?'#ff3040':'#3dffb0'):'#ffffff1a';ctx.fillRect(18+i*hw,by-8,hw-4,8);}
  ctx.fillStyle='#8c86b8';ctx.fillText('HEAT',112,by-14);ctx.fillStyle='#ffffff1a';ctx.fillRect(112,by-8,90,8);
  ctx.fillStyle=P.over?(SET.reduce||Math.floor(t*10)%2?'#ff3040':'#ff304066'):P.heat>70?'#ffa02d':D.b;ctx.fillRect(112,by-8,90*P.heat/100,8);
  ctx.fillStyle='#8c86b8';ctx.fillText('DASH',214,by-14);ctx.fillStyle=P.dashCd<=0?D.a:'#ffffff1a';ctx.fillRect(214,by-8,36*(1-P.dashCd),8);
  ctx.fillStyle='#8c86b8';ctx.fillText('EMP',262,by-14);for(let i=0;i<3;i++){ctx.fillStyle=i<P.emp?'#ffb020':'#ffffff1a';ctx.beginPath();ctx.arc(268+i*14,by-4,4.5,0,7);ctx.fill();}
  ctx.fillStyle='#8c86b8';WP.hud(ctx,312,by-2,1);
  tierMeter(W/2,H-8,1);
  if(G.note.t>0&&G.note.txt){ctx.globalAlpha=clamp(G.note.t,0,1);ctx.textAlign='right';ctx.font='12px "Share Tech Mono",monospace';ctx.fillStyle='#8c86b8';ctx.fillText(G.note.txt,W-18,H-12);ctx.globalAlpha=1;}
  if(G.hint.t>0&&G.hint.txt&&G.banner.t<=0){ctx.globalAlpha=clamp(G.hint.t,0,1);ctx.textAlign='center';ctx.font='700 15px "Chakra Petch",sans-serif';ctx.fillStyle='#ffffff';ctx.fillText(G.hint.txt,W/2,H-62);ctx.globalAlpha=1;}
  SH.hud(ctx,t);HUDX.ship(ctx,P.x,P.y,1,t);
  // boss bar
  if(G.boss&&G.boss.x<W){const b=G.boss;ctx.fillStyle='#00000088';ctx.fillRect(W/2-200,30,400,8);ctx.fillStyle='#ff3040';ctx.fillRect(W/2-200,30,400*clamp(b.hp/b.max,0,1),8);
    ctx.textAlign='center';ctx.font='700 12px "Chakra Petch",sans-serif';ctx.fillStyle='#fff';ctx.fillText(b.nm+(b.ph>1?'  ·  PHASE '+b.ph:''),W/2,24);}
  // banner
  if(G.banner.t>0){const k=G.banner.t,m=G.banner.m,a=Math.min(1,k*2,(m-k)*4);ctx.globalAlpha=Math.max(0,a);ctx.textAlign='center';
    if(G.banner.pic!=null)ART.portrait(G.banner.pic,W/2,H/2-58-106,100,Math.max(0,a));
    ctx.fillStyle='#05030cbb';ctx.fillRect(0,H/2-58,W,96);const col=G.banner.warn?'#ff3040':D.a;
    ctx.fillStyle=col;ctx.fillRect(0,H/2-58,W,2);ctx.fillRect(0,H/2+36,W,2);
    ctx.font='700 54px "Chakra Petch",sans-serif';ctx.fillStyle=G.banner.warn&&!SET.reduce&&Math.floor(t*6)%2?'#ffffff':col;ctx.fillText(G.banner.a,W/2+(1-a)*40,H/2+4);
    ctx.font='15px "Share Tech Mono",monospace';ctx.fillStyle='#e9e6ff';ctx.fillText(G.banner.b,W/2,H/2+26);ctx.globalAlpha=1;}
  ctx.restore();}

// portrait HUD: drawn upright on the visible canvas in 540 x 960 units; k scales type for small phones
let HK=1;
function drawHUDP(t){const D=DISTRICTS[G.di],k=HK,w=PW_,h=PH_,T=tierOf(C.n);ctx.save();
  const sc=String(G.score).padStart(8,'0'),mu='×'+G.mult.toFixed(1),bs=String(Math.max(best.score,G.score)).padStart(8,'0');
  Object.assign(HUDLOG,{score:sc,mult:mu,best:bs,hp:P.hp,hpMax:P.max,neon:SH.neon,heat:Math.round(P.heat),emp:P.emp,wl:P.wl,combo:C.n,tier:T,district:D.name+(G.loop?' +'+G.loop:''),story:ST.on?ST.n:0,goal:ST.on?ST.label():'',boss:!!G.boss,bossHp:G.boss?Math.round(G.boss.hp):0,beat:((Math.floor(G.bp)%4)+4)%4,frame:HUDLOG.frame+1});
  ctx.textAlign='left';ctx.font=`700 ${22*k}px "Chakra Petch",sans-serif`;ctx.fillStyle='#fff';ctx.fillText(sc,14,28*k);
  const sw=ctx.measureText(sc).width;ctx.font=`${16*k}px "Share Tech Mono",monospace`;ctx.fillStyle=D.b;ctx.fillText(mu,14+sw+10,27*k);
  ctx.fillStyle='#8c86b8';ctx.font=`${12*k}px "Share Tech Mono",monospace`;ctx.fillText((G.daily?'DAILY ':'BEST ')+(G.daily?String(Math.max(dailyBest.score,G.score)).padStart(8,'0'):bs),14,44*k);
  ctx.textAlign='right';ctx.font=`700 ${15*k}px "Chakra Petch",sans-serif`;ctx.fillStyle=D.a;ctx.fillText(ST.on?ST.n+' · '+ST.def.name:D.name+(G.loop?' +'+G.loop:'')+(DF===DIFFS.hard?' · HARD':''),w-14,26*k);
  const pw=170*k,px=w-14-pw;ctx.fillStyle='#ffffff18';ctx.fillRect(px,33*k,pw,4*k);ctx.fillStyle=G.boss?'#ff3040':D.b;ctx.fillRect(px,33*k,pw*(ST.on?ST.frac():G.boss||G.bossDone?1:DIR.frac()),4*k);
  ctx.font=`${11*k}px "Share Tech Mono",monospace`;ctx.fillStyle='#8c86b8';ctx.fillText(ST.on?ST.label():G.boss?'BOSS':G.bossDone?'CLEAR':'→ '+D.bossName,w-14,50*k);
  // status row: hull, heat, dash, EMP, weapon level
  const y=76*k;ctx.textAlign='left';ctx.font=`${11*k}px "Share Tech Mono",monospace`;ctx.fillStyle='#8c86b8';
  const hw=Math.min(17,96/P.max);ctx.fillText('HULL',14,y-4*k);for(let i=0;i<P.max;i++){ctx.fillStyle=i<P.hp?(P.hp<=1?'#ff3040':'#3dffb0'):'#ffffff1a';ctx.fillRect(14+i*hw*k,y,(hw-4)*k,9*k);}
  const hx=14+P.max*hw*k+16*k;ctx.fillStyle='#8c86b8';ctx.fillText('HEAT',hx,y-4*k);ctx.fillStyle='#ffffff1a';ctx.fillRect(hx,y,86*k,9*k);
  ctx.fillStyle=P.over?(SET.reduce||Math.floor(t*10)%2?'#ff3040':'#ff304066'):P.heat>70?'#ffa02d':D.b;ctx.fillRect(hx,y,86*k*P.heat/100,9*k);
  const dx=hx+102*k;ctx.fillStyle='#8c86b8';ctx.fillText('DASH',dx,y-4*k);ctx.fillStyle=P.dashCd<=0?D.a:'#ffffff1a';ctx.fillRect(dx,y,40*k*(1-P.dashCd),9*k);
  const ex=dx+54*k;ctx.fillStyle='#8c86b8';ctx.fillText('EMP',ex,y-4*k);for(let i=0;i<3;i++){ctx.fillStyle=i<P.emp?'#ffb020':'#ffffff1a';ctx.beginPath();ctx.arc(ex+5*k+i*15*k,y+4.5*k,4.5*k,0,7);ctx.fill();}
  ctx.fillStyle='#8c86b8';WP.hud(ctx,ex+52*k,y+9*k,k);
  SH.hud(ctx,t,{nx:24*k,ny:112*k,dx:dx,dy:y+13*k,sx:14,sy:132*k,k:k});
  HUDX.ship(ctx,P.y,PH_-P.x,k,t);
  let ny=182*k;
  if(G.boss&&G.boss.x<W){const b=G.boss,bw=Math.min(440,w-28);ctx.fillStyle='#00000088';ctx.fillRect((w-bw)/2,ny+8*k,bw,9*k);ctx.fillStyle='#ff3040';ctx.fillRect((w-bw)/2,ny+8*k,bw*clamp(b.hp/b.max,0,1),9*k);
    ctx.textAlign='center';ctx.font=`700 ${12*k}px "Chakra Petch",sans-serif`;ctx.fillStyle='#fff';ctx.fillText(b.nm+(b.ph>1?'  ·  PHASE '+b.ph:''),w/2,ny+4*k);ny+=30*k;}
  PW.hud(t,14,ny+22*k,k);
  tierMeter(w/2,h-10*k,k*1.1);
  if(G.note.t>0&&G.note.txt){ctx.globalAlpha=clamp(G.note.t,0,1);ctx.textAlign='right';ctx.font=`${12*k}px "Share Tech Mono",monospace`;ctx.fillStyle='#8c86b8';ctx.fillText(G.note.txt,w-14,h-70*k);ctx.globalAlpha=1;}
  if(G.hint.t>0&&G.hint.txt&&G.banner.t<=0){ctx.globalAlpha=clamp(G.hint.t,0,1);ctx.textAlign='center';ctx.font=`700 ${17*k}px "Chakra Petch",sans-serif`;ctx.fillStyle='#fff';ctx.fillText(G.hint.txt,w/2,h-170*k);ctx.globalAlpha=1;}
  if(G.banner.t>0){const kk=G.banner.t,m=G.banner.m,a=Math.min(1,kk*2,(m-kk)*4);ctx.globalAlpha=Math.max(0,a);ctx.textAlign='center';
    if(G.banner.pic!=null)ART.portrait(G.banner.pic,w/2,h/2-58*k-100*k,92*k,Math.max(0,a));
    ctx.fillStyle='#05030cbb';ctx.fillRect(0,h/2-58*k,w,96*k);const col=G.banner.warn?'#ff3040':D.a;
    ctx.fillStyle=col;ctx.fillRect(0,h/2-58*k,w,2);ctx.fillRect(0,h/2+36*k,w,2);
    ctx.font=`700 ${Math.min(54*k,w/Math.max(7,G.banner.a.length*.62))}px "Chakra Petch",sans-serif`;ctx.fillStyle=G.banner.warn&&!SET.reduce&&Math.floor(t*6)%2?'#ffffff':col;ctx.fillText(G.banner.a,w/2+(1-a)*40,h/2+4*k);
    ctx.font=`${Math.min(15*k,w/Math.max(20,G.banner.b.length*.62))}px "Share Tech Mono",monospace`;ctx.fillStyle='#e9e6ff';ctx.fillText(G.banner.b,w/2,h/2+26*k);ctx.globalAlpha=1;}
  ctx.restore();}

let PUL=0,PHF=0,FD=0;
function tierGlow(c){const T=tierOf(C.n);c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.012*(T-1)+.02*(T-1)*PUL*FX();c.fillStyle=TIERC[T-1];c.fillRect(0,0,W,H);c.restore();}   // each tier lifts the whole picture a little
function shotDraw(b,D){const ang=(b.vx||b.vy)?Math.atan2(b.vy,b.vx):0;let o,al=.55,sy;      // the ship's own shots stay thinner and dimmer than the lime enemy bullets
  if(b.hv){o=ART.sp('fx-shot-hv',46);al=.8;}
  else if(b.ec){o=ART.sp('fx-shot-ec',30);al=.65;}
  else if(b.pf&&!b.big){o=ART.sp('fx-shot-perfect',32);al=.8;}
  else{const L=b.len||(b.big?22:b.pn!=null?28:20);o=ART.tint('fx-shot-std',L*(b.big?1.2:1),b.col||(b.big?'#ffffff':D.b));al=b.big?.8:.55;if(o)sy=Math.max(.8,Math.min(3,(b.th||(b.big?4:3))*.7/o.h));}
  if(!o)return;const d=o.w/2-10;ART.put(o,b.x+Math.cos(ang)*d,b.y+Math.sin(ang)*d,ang,al,1,sy);
  if(b.big||b.hv)G_(b.x,b.y,b.hv?20:9,b.pf?'#ffe14d':D.b,.22);}
function render(t,dt){FD=dt;ART.frame();G.tpop=Math.max(0,(G.tpop||0)-dt*1.6);const T_=tierOf(C.n);
  const PT=wcv!==cv;                                     // portrait: the world is drawn on its own canvas (landscape coordinates) and turned upright afterwards
  if(PT){ctx=vctx;ctx.setTransform(VS,0,0,VS,0,0);drawBGP(bgFor(G.di),t,dt,G.scroll);ctx=wctx;ctx.setTransform(S,0,0,S,0,0);ctx.clearRect(0,0,W,H);}
  else{ctx=vctx;ctx.setTransform(S,0,0,S,0,0);}
  const sh=G.shake;ctx.save();if(sh)ctx.translate(rnd(-sh,sh)*.5,rnd(-sh,sh)*.5);
  if(!PT){drawBG(bgFor(G.di),t,dt,G.scroll);
  }   // (no rain, no traffic specks: the background stays calm)
  drawPickups(t);
  for(const e of G.en)drawEnemy(e,t);
  // player bullets
  ctx.globalCompositeOperation='lighter';const D=DISTRICTS[G.di];
  // the ship's own fire is dim and thin: the enemy bullets (bright lime, dark rim) are what must read
  const PS=ART.have('fx-shot-std');
  for(const b of G.pb){if(PS){shotDraw(b,D);continue;}ctx.globalAlpha=.5;ctx.fillStyle=b.col||(b.big?'#ffffff':b.pf?'#ffe14d':b.ec?'#c08aff':D.b);const th=(b.th||(b.big?4:3))*.6;ctx.fillRect(b.x-10,b.y-th/2,b.len||(b.big?(b.hv?46:b.bd?30:22):b.pn!=null?28:16),th);if(b.big||b.hv)G_(b.x,b.y,b.hv?20:9,b.pf?'#ffe14d':D.b,.22);}
  ctx.globalAlpha=1;
  if(SET.part)for(const p of G.pt){const a=p.l/p.m;if(p.ghost){G_(p.x,p.y,p.sz*2,p.c,a*.5);}else{ctx.globalAlpha=a;ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.sz,p.sz);}}
  ctx.globalAlpha=1;
  for(const b of G.eb)G_(b.x,b.y,b.r*3.2,b.c,.9);
  ctx.globalCompositeOperation='source-over';
  FXV.bullets();
  ART.fxDraw();
  drawPlayer(t);HUDX.drones(t);
  if(running&&!G.dead)FXV.ring(t);
  PW.draw(t);
  for(const r of G.rings){const k=1-r.l/r.m;ctx.strokeStyle=r.c;ctx.globalAlpha=1-k;ctx.lineWidth=3*(1-k)+1;ctx.beginPath();ctx.arc(r.x,r.y,18+k*52,0,7);ctx.stroke();ctx.globalAlpha=1;}
  ctx.textAlign='center';ctx.font='700 13px "Chakra Petch",sans-serif';for(const f of G.fl){ctx.globalAlpha=Math.min(1,f.l*2);ctx.fillStyle=f.c;wtxt(f.txt,f.x,f.y);}ctx.globalAlpha=1;
  if(PT)SH.ring(ctx,t);
  ctx.restore();
  if(G.empT>0&&ART.wave(P.x,P.y,(0.6-G.empT)*1400,G.empT*2.2)){}
  else if(G.empT>0){ctx.strokeStyle='#ffb020';ctx.lineWidth=6*G.empT;ctx.beginPath();ctx.arc(P.x,P.y,(0.6-G.empT)*1400,0,7);ctx.stroke();}
  if(G.flash>0){ctx.fillStyle=`rgba(255,255,255,${G.flash*.5})`;ctx.fillRect(0,0,W,H);}
  if(G.glitch>0){for(let i=0;i<6;i++){const y=rnd(0,H),h=rnd(4,26);ctx.drawImage(wcv,0,y*S,wcv.width,h*S,rnd(-20,20),y,W,h);}ctx.fillStyle=`rgba(255,40,80,${G.glitch*.25})`;ctx.fillRect(0,0,W,H);}
  if(running&&T_>1)tierGlow(ctx);
  if(PT){if(running)FXV.edges(t);
    ctx=vctx;ctx.setTransform(0,-1,1,0,0,cv.height);ctx.drawImage(wcv,0,0);                // world, turned so that its right is the screen's up
    ctx.setTransform(VS,0,0,VS,0,0);ctx.drawImage(scanFor(true),0,0,PW_,PH_);
    if(running)drawHUDP(t);}
  else{ctx.drawImage(scanFor(false),0,0,W,H);
    if(running){FXV.edges(t);drawHUD(t);PW.hud(t);}}}

/* ---------- menus, settings, flow ---------- */
const titleEl=$('title'),overEl=$('over'),pauseEl=$('pausem'),setEl=$('setm');
const HUDLOG={frame:0};
function showBest(){$('bestT').innerHTML=(best.score?`Best run <strong>${best.score.toLocaleString('de-DE')}</strong> · ${best.dist}`:'No runs logged yet')
  +` &nbsp;·&nbsp; Daily <strong>${dailyBest.score?dailyBest.score.toLocaleString('de-DE'):'—'}</strong>`;}
showBest();
function syncUI(){$('touch').hidden=!(running&&touchUI&&!paused&&!SH.active);}
/* ---------- settings (one card, Overdrive's look): the schema drives the rows; every change is saved and applied live ---------- */
const OFFON=[[false,'Off'],[true,'On']];
const SCHEMA=[
  {g:'Gameplay',rows:[{k:'diff',l:'Difficulty',o:[['easy','Easy'],['normal','Normal'],['hard','Hard']]},{k:'auto',l:'Auto-fire',o:[[true,'On'],[false,'Off']]},{k:'aim',l:'Aim assist',o:OFFON}]},
  {g:'Controls',rows:[{k:'layout',l:'Touch layout',o:[['left','Left'],['right','Right']]},{k:'sens',l:'Sensitivity',s:[1,5,1],f:v=>String(v)},{k:'dsize',l:'Button size',o:[['S','Small'],['M','Medium'],['L','Large']]}]},
  {g:'Rhythm',rows:[{k:'win',l:'Timing window',o:[['tight','Tight'],['normal','Normal'],['loose','Loose']]},{k:'all',l:'Everything counts',o:OFFON},{k:'cue',l:'Beat cue',o:[['off','Off'],['S','Small'],['M','Medium'],['L','Large']]},
    {k:'sync',l:'Latency',s:[-150,150,5],f:v=>(v>0?'+':'')+v+' ms',tap:1}]},
  {g:'Audio',rows:[{k:'master',l:'Master',s:[0,100,5],p:1},{k:'music',l:'Music',s:[0,100,5],p:1},{k:'sfx',l:'Effects',s:[0,100,5],p:1},{k:'duck',l:'Ducking',o:[[true,'On'],[false,'Off']]},{k:'mute',l:'Mute all',o:OFFON}]},
  {g:'Visuals',rows:[{k:'part',l:'Particles',o:[[0,'Off'],[1,'Low'],[2,'Full']]},{k:'shake',l:'Screen shake',o:[[0,'Off'],[1,'Low'],[2,'Full']]},{k:'flash',l:'Flashing',o:[[0,'Off'],[1,'Reduced'],[2,'Full']]},
    {k:'q',l:'Quality',o:[['L','Low'],['M','Medium'],['H','High']]},{k:'fps',l:'FPS cap',o:[[30,'30'],[60,'60']]},{k:"pal",l:"Colour theme",o:[['neon','Neon'],['cb','Blue-orange'],['term','Terminal']]},{k:'fpsc',l:'FPS counter',o:OFFON}]},
  {g:'Accessibility',rows:[{k:'rm',l:'Reduced motion',o:OFFON},{k:'hc',l:'High-contrast bullets',o:OFFON}]}];
const PALS={neon:null,cb:{a:'#ffb020',b:'#4aa3ff'},term:{a:'#3dff7a',b:'#d6ffe0'}};
let palOn='neon';
function applyPal(){if(palOn===SET.pal)return;palOn=SET.pal;const th=PALS[SET.pal];
  for(const D of DISTRICTS){if(!D.a0){D.a0=D.a;D.b0=D.b;}D.a=th?th.a:D.a0;D.b=th?th.b:D.b0;}
  for(const k in BGC)delete BGC[k];for(const k in BGPC)delete BGPC[k];}
function applySet(){deriveSet();AU.vol();DF=DIFFS[SET.diff]||DIFFS.normal;HARD=SET.diff==="hard";applyPal();
  stage.classList.toggle('ds-S',SET.dsize==='S');stage.classList.toggle('ds-L',SET.dsize==='L');document.documentElement.classList.toggle('hc',!!SET.hc);
  $('fpsEl').hidden=!SET.fpsc;fit();
  if(typeof diffDraw==='function')diffDraw();}
function setVal(k,v){SET[k]=v;saveSet();applySet();syncSet();}
const setRows={};
function buildSettings(){const body=$('setBody');
  for(const grp of SCHEMA){const h=document.createElement('h3');h.textContent=grp.g;body.appendChild(h);
    for(const r of grp.rows){const row=document.createElement('div');setRows[r.k]=row;
      if(r.o){row.className='seg';row.dataset.k=r.k;row.innerHTML='<span>'+r.l+'</span>';
        r.o.forEach(([v,lab],i)=>{const b=document.createElement('button');b.type='button';b.textContent=lab;b.dataset.v=i;b.addEventListener('click',()=>setVal(r.k,v));row.appendChild(b);});}
      else{row.className='sl';const id='s'+r.k[0].toUpperCase()+r.k.slice(1);row.innerHTML=`<span>${r.l}</span><input type="range" id="${id}" min="${r.s[0]}" max="${r.s[1]}" step="${r.s[2]}" aria-label="${r.l}"><output id="v${id.slice(1)}"></output>`;
        row.querySelector('input').addEventListener('input',e=>{const x=+e.target.value;setVal(r.k,r.p?x/100:x);});
        if(r.tap){const b=document.createElement('button');b.type='button';b.id='calBtn';b.className='go dim';b.style.cssText='min-height:34px;font-size:12px;padding:.3em .9em';b.textContent='TAP TEST';b.addEventListener('click',toggleCal);row.appendChild(b);}}
      body.appendChild(row);
      if(r.tap){const cb=document.createElement('div');cb.id='calBox';cb.innerHTML='<div id="calInfo">Tap the pad on every click. 8 taps.</div><button id="calPad" type="button">TAP TO THE CLICK</button><div id="calPips">'+'<i></i>'.repeat(8)+'</div>';body.appendChild(cb);
        $('calPad').addEventListener('pointerdown',e=>{e.preventDefault();doCalTap(e.timeStamp);});}}}}
function syncSet(){for(const grp of SCHEMA)for(const r of grp.rows){const row=setRows[r.k];if(!row)continue;
    if(r.o)row.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(SET[r.k]===r.o[i][0])));
    else{const inp=row.querySelector('input'),v=r.p?Math.round(SET[r.k]*100):SET[r.k];inp.value=v;row.querySelector('output').textContent=r.f?r.f(v):v+'%';}}}
let setFrom='title';
function openSettings(from){setFrom=from;setEl.hidden=false;titleEl.hidden=true;pauseEl.hidden=true;stopCal();syncSet();$('setBack').focus();}
function closeSettings(){stopCal();setEl.hidden=true;if(setFrom==='pause'){pauseEl.hidden=false;$('resumeBtn').focus();}else titleEl.hidden=false;}
let defArmed=0;
$('setDef').addEventListener('click',()=>{const b=$('setDef');if(!defArmed){defArmed=setTimeout(()=>{defArmed=0;b.textContent='DEFAULTS';},3000);b.textContent='TAP AGAIN TO RESET';return;}
  clearTimeout(defArmed);defArmed=0;b.textContent='DEFAULTS';Object.assign(SET,DEFS,{v3:1});saveSet();applySet();syncSet();});
// latency test: clicks on the audio clock, 8 taps, the median lateness becomes the Audio sync
function stopCal(){calStop();$('calBox').classList.remove('on');$('calBtn').textContent='TAP TEST';}
function toggleCal(){if($('calBox').classList.contains('on')){stopCal();return;}AU.unlock();calStart();$('calBox').classList.add('on');$('calBtn').textContent='CLOSE';calUI();}
function doCalTap(ts){if(!CAL.on)return;const d=calTap(ts);calUI();if(CAL.done!=null)syncSet();return d;}
function calUI(){const pips=$('calPips').children;for(let i=0;i<pips.length;i++)pips[i].classList.toggle('on',i<CAL.taps.length);
  $('calInfo').textContent=CAL.done!=null?'Done. Audio sync set to '+(CAL.done>0?'+':'')+CAL.done+' ms':CAL.last==='off'?'Too far from the click. Tap on the click.':CAL.last!=null?'Last tap '+(CAL.last>0?'+':'')+Math.round(CAL.last)+' ms ('+CAL.taps.length+'/'+CAL.need+')':'Tap the pad on every click. '+CAL.need+' taps.';}
addEventListener('keydown',e=>{if(CAL.on&&e.code==='Space'&&!setEl.hidden){e.preventDefault();doCalTap(e.timeStamp);}});
function calFrame(){const pad=$('calPad');if(!pad||setEl.hidden||!CAL.on)return;const ph=(calNow()-CAL.t0)/CAL.per,fr=ph-Math.floor(ph);pad.classList.toggle('beat',ph>=0&&fr<.14);}
$('setBack').addEventListener('click',closeSettings);
$('setBtn').addEventListener('click',()=>openSettings('title'));
$('pSetBtn').addEventListener('click',()=>openSettings('pause'));
buildSettings();
function setPause(on){if(!running||on===paused)return;paused=on;pauseEl.hidden=!on;
  if(on){AU.suspend();touch=null;touchFire=false;for(const k in K)K[k]=false;}else{AU.resume();pressed={};}
  syncUI();if(on)$('resumeBtn').focus();}
function start(daily){if(running)return;if(ST.on){startStory(ST.n);return;}AU.unlock();pressed={};titleEl.hidden=true;overEl.hidden=true;pauseEl.hidden=true;setEl.hidden=true;
  newGame(daily);G.live=true;running=true;paused=false;AU.resume();NR.music.rate=1;AU.startStage(stageFor(0,false));NR.emit('runStart',{daily:!!daily});
  FPS.n=0;FPS.t=0;FPS.slow=0;FPS.worst=0;syncUI();}
function restart(){if(ST.on){const n=ST.n;running=false;paused=false;startStory(n);return;}const dl=G.daily;running=false;paused=false;start(dl);}
function quitToTitle(){if(running)NR.emit('runEnd',{quit:true});ST.on=false;ST.over=false;selEl.hidden=true;resEl.hidden=true;$('stBtn2').hidden=true;running=false;paused=false;pauseEl.hidden=true;overEl.hidden=true;titleEl.hidden=false;newGame();G.banner.t=0;P.x=-200;AU.resume();AU.menuMusic();syncUI();showBest();}
function gameOver(){if(!running)return;if(ST.on){ST.fail();return;}running=false;NR.emit('runEnd',{score:G.score,di:G.di,kills:G.kills});const D=DISTRICTS[G.di];const dist=D.name+(G.loop?' +'+G.loop:'');let eye='Signal lost';
  if(G.daily){if(G.score>dailyBest.score){dailyBest={n:todayN(),score:G.score};save('mnr_daily',dailyBest);eye='New daily best';}else eye='Daily run over';}
  else if(G.score>best.score){best={score:G.score,dist};save('mnr_best',best);eye='New best run';}
  $('overEyebrow').textContent=eye;
  $('oScore').textContent=G.score.toLocaleString('de-DE');$('oDist').textContent=dist;$('oPerf').textContent=G.perf;
  $('oBest').innerHTML=G.daily?`Daily best <strong>${dailyBest.score.toLocaleString('de-DE')}</strong>`:`Best <strong>${best.score.toLocaleString('de-DE')}</strong> · ${best.dist}`;
  overEl.hidden=false;overlayReady=false;syncUI();AU.menuMusic();setTimeout(()=>{overlayReady=true;if(!overEl.hidden)$('againBtn').focus();},600);showBest();
  G.over=true;lastDaily=G.daily;}
let lastDaily=false;
$('startBtn').addEventListener('click',()=>start(false));
storyUI();
$('dailyBtn').addEventListener('click',()=>start(true));
$('againBtn').addEventListener('click',()=>start(lastDaily));
$('menuBtn').addEventListener('click',quitToTitle);
$('resumeBtn').addEventListener('click',()=>setPause(false));
$('restartBtn').addEventListener('click',restart);
$('quitBtn').addEventListener('click',quitToTitle);

// attract mode: demo background behind title
newGame();G.banner.t=0;P.x=-200;
let last=performance.now();
let simOn=false;
let fpsN=0,fpsT=0;
function loop(now){const raw=now-last;if(!simOn&&raw<(SET.fps===30?30:12.5)){requestAnimationFrame(loop);return;}   // FPS cap: 30 skips every other frame; 60 holds a 120/144/240 Hz screen to 60-80 draws a second (the game was drawing every refresh)
  let dt=Math.min(.05,raw/1000);last=now;if(simOn){requestAnimationFrame(loop);return;}
  if(SET.fpsc){fpsN++;if(now-fpsT>500){$('fpsEl').textContent=Math.round(fpsN*1000/(now-fpsT))+' FPS';fpsN=0;fpsT=now;}}
  if(CAL.on)calFrame();
  if(!paused)fbT+=dt;
  if(running&&!paused){update(dt);if(raw<1000&&!document.hidden){FPS.n++;FPS.t+=raw;if(raw>FPS.worst)FPS.worst=raw;if(raw>40)FPS.slow++;}}
  else if(!running){G.t+=dt;G.scroll+=60*dt;for(const p of G.pt){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;}G.pt=G.pt.filter(p=>p.l>0);}
  if(!running&&!G.dead&&!G.over){G.attract=(G.attract||0)+dt;if(G.attract>9){G.attract=0;const n=(G.di+1)%DISTRICTS.length;G.di=n;bgFor(n);}}
  const bp=bpos(),fr=bp-Math.floor(bp);PHF=fr;PUL=Math.pow(1-fr,2.5)*(((Math.floor(bp)%4)+4)%4===0?1:.65);
  render(G.t,paused?0:dt);requestAnimationFrame(loop);}
applySet();syncSet();requestAnimationFrame(loop);
document.fonts&&document.fonts.ready.then(()=>{for(const k in BGC)delete BGC[k];});
[1500,2300,3100].forEach((ms,i)=>setTimeout(()=>{if(!running)bgFor(i+1);},ms));        // build the other districts' skylines while the title is up
window.__mnr={ART,get S_(){return S},STILL,DYE,get CAL(){return CAL},winMs,calNow,get DIST(){return DISTRICTS},DEFS,TIERC,calTap:doCalTap,calStart,applySet,setVal,tierOf,TS,DIFFS,get DF(){return DF},get TIP(){return TIP},get G(){return G},get P(){return P},get C(){return C},get BT(){return BT},get TR(){return TR},get SET(){return SET},get J(){return J},get HUD(){return HUDLOG},
  get MSGS(){return MSGS},get FPS(){return FPS},get running(){return running},get paused(){return paused},get rotMode(){return rotMode},get touchUI(){return touchUI},
  get SH(){return SH},get GA(){return GA},get TP(){return TP},TP_DEF,HUDX,UBY,PWK,hurt,NR,PW,FXV,eb,get god(){return godMode},set god(v){godMode=!!v;},bpos,judge,mnow,audible,AU,
  get ST(){return ST},get TUNE(){return TUNE},get HARD(){return HARD},loadTrack,get STAGES(){return STAGES},get K(){return K},startStory,unlockedN:unlocked,sSave,
  // test hooks: ?sim=1 has no audio clock; simOn stops the animation loop and step() advances the game by hand with the beat clock tied to game time
  simOn(v){simOn=v!==false;},step(dt){fbT+=dt;if(running&&!paused)update(dt);},press(n){pressed[n]=performance.now();},touchTo(x,y){touch={id:-1,sx:0,sy:0,px:x,py:y,x:0,y:0};touchFire=true;},
  abort(){if(running){NR.emit('runEnd',{quit:true});running=false;}ST.on=false;ST.over=false;paused=false;touch=null;touchFire=false;pressed={};},
  skipTo(i){if(!running)return;G.loop=G.loop;G.en=[];G.eb=[];enterDistrict(i);},
  killBoss(){const b=G.boss;if(b){b.floor=0;b.minBar=0;b.hp=0;}},bossNow(){if(running&&!G.boss&&!G.bossDone){G.force=true;G.en=[];}},get spawnBoss(){return spawnBoss},bossShot,BCAP,fanAngle,get PWbs(){return PW.bs},get bsMnow(){return bsM()},get diffNow(){return diff()},DIR,UPS,TUNE2,PATS,MUTS,WARN,NEW2,SHIPX,SHIPS,AX,upsCalc,lvSide,lvRear,lvPierce,lvBT,get SONGM(){return SONGM},songBars,songEnergy,ORDER,nextDi,posOf};
})();
</script>

</body></html>
