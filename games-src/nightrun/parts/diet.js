// PURPOSE: visual diet: fewer own effects, readable enemies, a lean 6-item HUD
// FLAG: diet (?diet=0)
// TEST: diet-test.js
/* ---------- diet.js: review 8 fix list 5-7 (owner, 21 Oct 2026: "unprofessional, ugly, messy, eye strain"). Flag RET.diet, default ON; ?diet=0 = the game as it was
   (nothing below is installed). Presentation only: no hitbox, damage, spawn rule or telegraph time is touched; armour.js and hard.js are not read.
   5. OWN EFFECTS   the ship's own shots draw at half alpha and only every second ordinary shot is drawn (big, on-beat and heavy shots always), at most 16 a frame;
                    at most 4 score pop-ups and 6 explosion pictures;
                    at most 12 particles (the newest); cosmetic rings (kill rings, shock-wave pictures, explosions) never wider than 120 css px, no DROP! wave; the healer range ring is gone;
                    flank tells (anticamp / flankers chevrons + dashed lines) show only for the last 0.6 s before the entry (their tell is 0.8 s, so the cue stays >= 0.6 s).
   6. ENEMIES       every ordinary enemy is drawn at >= 32 css px (scaled round its centre; the hitbox is not touched) with a light rim (canvas shadow on the existing
                    sprite draw, no new art); the backdrop gets a further dim under play and the phone rooftop tile (the "circuit board") is not drawn under play.
   7. HUD           Settings > HUD Minimal (the default) = 6 items: score, hull, boss bar, DASH, EMP, pause. Full = the old HUD with HEAT, LINE, multiplier, combo,
                    progress, chips. The EMP refill label ("~52s") is hidden in the lean HUD. ---------- */
if(RET.diet===undefined)RET.diet=!/[?&]diet=0/.test(location.search);
const DIET=window.DIET={on:!!RET.diet,PA:.5,PBMAX:16,PT:12,FX:6,FL:4,RING:120,CHEV:.6,MINCSS:32,FMAX:2.4,RIM:'rgba(226,236,255,.95)',RIMB:4,DIM:.22,
  kc:1,kT:-9,seq:0,cap:0,cfs:{},inPB:0,st:{fr:0,pb:0,pt:0,minCss:1e9,ens:0,big:0},
  lean(){return this.on&&SET.hud!=='full';},
  /* css px per world unit (portrait: the 540-unit side spans the canvas width) */
  k(){const n=performance.now();if(n-this.kT>500){this.kT=n;const r=cv.getBoundingClientRect();this.kc=(wcv!==cv?r.width/540:r.width/960)||1;}return this.kc;},
  /* share of a sheet frame that the ship really covers (alpha bbox of frame 0), measured once per sheet */
  cf(s){let v=this.cfs[s];if(v!==undefined)return v;const key='ship-'+s+'/flame',o=ART.aS(key),b=o&&ART.ANIM.s[key]&&ART.anim(key);if(!b)return .62;
    try{const m=o.m,w=m[2],h=m[3],n=96,nh=Math.max(1,Math.round(n*h/w)),c=document.createElement('canvas');c.width=n;c.height=nh;const g=c.getContext('2d');g.drawImage(b,0,0,w,h,0,0,n,nh);
      const d=g.getImageData(0,0,n,nh).data;let x0=n,x1=-1,y0=nh,y1=-1;for(let y=0;y<nh;y++)for(let x=0;x<n;x++)if(d[(y*n+x)*4+3]>60){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
      v=x1<0?.62:Math.max(x1-x0+1,y1-y0+1)/n;}catch(e){v=.62;}return this.cfs[s]=v;},
  /* drawn size of an enemy in world units (before the diet scale) */
  size(e){const m=window.FOEART&&RET.foeart&&RET.sprites?FOEART.map(e):null;if(m)return (m.w||e.r*m.k)*this.cf(m.s);return e.r*2.2;},
  scale(e){const css=this.size(e)*this.k();return Math.min(this.FMAX,Math.max(1,this.MINCSS*1.06/Math.max(1,css)));},
  ringMax(){return this.RING/2/this.k();}   // the widest cosmetic ring radius in world units
};
if(DIET.on){
  /* ---- 5. own shots: half alpha, every second ordinary shot, cap; particles: the newest 12; cosmetic rings capped ---- */
  {const put=ART.put;ART.put=function(o,x,y,rot,al){if(DIET.inPB){if(al!=null)arguments[4]=al*DIET.PA;else ctx.globalAlpha*=DIET.PA;}return put.apply(this,arguments);};}
  {const g0=G_;G_=function(x,y,r,c,a=1){return g0.call(this,x,y,r,c,DIET.inPB?a*DIET.PA:a);};}
  {const sd=shotDraw;shotDraw=function(){DIET.inPB++;try{return sd.apply(this,arguments);}finally{DIET.inPB--;}};}
  if(window.FXW&&FXW.bullet){const fb=FXW.bullet;FXW.bullet=function(){DIET.inPB++;const a=ctx.globalAlpha;ctx.globalAlpha=a*DIET.PA;try{return fb.apply(this,arguments);}finally{DIET.inPB--;ctx.globalAlpha=a;}};}
  DIET.thin=L=>{const out=[];for(const b of L){if(b._dk===undefined)b._dk=DIET.seq++;if(b.big||b.pf||b.hv||b._dk%2===0)out.push(b);}
    if(out.length>DIET.PBMAX){const keep=out.filter(b=>b.big||b.pf||b.hv),rest=out.filter(b=>!(b.big||b.pf||b.hv));return keep.concat(rest.slice(-Math.max(0,DIET.PBMAX-keep.length)));}return out;};
  {const rd=render;render=function(t,dt){if(!running||!G)return rd.apply(this,arguments);if(DIET.capC){DIET.capC(vctx);DIET.capC(wctx);}
    const pb=G.pb,pt=G.pt,fx=[],rm=DIET.ringMax();DIET.st.fr++;DIET.st.minCss=1e9;DIET.st.ens=0;
    const fl=G.fl;if(fl.length>DIET.FL)G.fl=fl.slice(-DIET.FL);G.pb=DIET.thin(pb);DIET.st.pb=G.pb.length;if(pt.length>DIET.PT)G.pt=pt.slice(-DIET.PT);DIET.st.pt=SET.part?G.pt.length:0;
    for(const L of [window.ZOO&&ZOO.fx,window.FLEET&&FLEET.fx])if(L)for(const f of L)if(f.k==='ring'&&f.r>rm){fx.push([f,f.r]);f.r=rm;}
    for(const q of ART.fx)if(q.sz>2*rm){fx.push([q,q.sz,'sz']);q.sz=2*rm;}   // explosion pictures: no wider than a cosmetic ring
    try{return rd.apply(this,arguments);}finally{G.pb=pb;G.pt=pt;G.fl=fl;for(const [f,r,k] of fx)f[k||'r']=r;}};}
  {const bo=ART.boom;ART.boom=function(){while(ART.fx.length>=DIET.FX)ART.fx.shift();return bo.apply(this,arguments);};}   // at most 8 explosion pictures alive (was 24)
  if(window.AH&&AH.boom){const bm=AH.boom;AH.boom=function(id,x,y,w){if(/ring|wave/.test(id)&&w>2*DIET.ringMax())arguments[3]=2*DIET.ringMax();return bm.apply(this,arguments);};}
  {const pic=ART.pic;ART.pic=function(id,w,x,y,rot,al){if(running&&w>2*DIET.ringMax()&&/^fx-w34-rule-/.test(id))al=Math.min(al==null?1:al,.14);return pic.call(this,id,w,x,y,rot,al);};}   // stage-rule zones keep their true size (gameplay), drawn faint
  if(window.PW&&PW.draw){const pd=PW.draw;PW.draw=function(){const s=G&&G.pw,wv=s&&s.wv;if(wv>0)s.wv=0;try{return pd.apply(this,arguments);}finally{if(wv>0)s.wv=wv;}};}   // the screen-wide DROP! wave: gone (the flash and the pop-up stay)
  /* own power-up auras and rings round the ship: arcs drawn inside PW.draw / drawPlayer are capped at the cosmetic ring size */
  {const cap=DIET.capC=c=>{if(!c||c.__diet)return;c.__diet=1;const a=c.arc;c.arc=function(x,y,r){if(DIET.cap&&r>0){const t=this.getTransform(),k=Math.hypot(t.a,t.b)/S,mx=DIET.ringMax();if(r*k>mx)arguments[2]=mx/k;}return a.apply(this,arguments);};};cap(vctx);cap(wctx);
   const sc=f=>function(){DIET.cap++;try{return f.apply(this,arguments);}finally{DIET.cap--;}};PW.draw=sc(PW.draw);drawPlayer=sc(drawPlayer);}
  if(window.FXW&&FXW.healRing)FXW.healRing=()=>true;   // the healer's 150-unit range ring: gone (the heal itself still shows on the healed ship)
  /* flank tells: the last 0.6 s only */
  for(const [o,k] of [[window.AC,'draw'],[window.FLK,'drawTells']])if(o&&o[k]){const f=o[k];o[k]=function(){const L=this.tells;if(!L||!L.length)return f.apply(this,arguments);
      this.tells=L.filter(q=>q.t<=DIET.CHEV);try{return this.tells.length?f.apply(this,arguments):undefined;}finally{this.tells=L;}};}
  /* ---- 6. enemies: >= 32 css px, light rim; backdrop: rooftop tile off, a further dim ---- */
  {const de=drawEnemy;drawEnemy=function(e,t){if(!running||!G||e===G.boss||e.type==='boss'||e.hp<=0)return de.apply(this,arguments);
    const f=DIET.scale(e),css=DIET.size(e)*f*DIET.k();if(e.x>-20&&e.x<W+20&&e.y>-20&&e.y<H+20){DIET.st.ens++;if(css<DIET.st.minCss)DIET.st.minCss=css;}
    ctx.save();if(f>1){ctx.translate(e.x,e.y);ctx.scale(f,f);ctx.translate(-e.x,-e.y);}ctx.shadowColor=DIET.RIM;ctx.shadowBlur=DIET.RIMB;
    try{return de.apply(this,arguments);}finally{ctx.restore();}};}
  {const bp=drawBGP;drawBGP=function(bg){if(!running)return bp.apply(this,arguments);const i=DISTRICTS.indexOf(bg.D),k='ly-phone-'+ART.dn[i],lb=ART.bm[k];if(lb)ART.bm[k]=undefined;
    try{bp.apply(this,arguments);}finally{if(lb)ART.bm[k]=lb;}ctx.save();ctx.globalAlpha=DIET.DIM;ctx.fillStyle='#000';ctx.fillRect(-40,-40,PW_+80,PH_+80);ctx.restore();};}
  {const bl=drawBG;drawBG=function(){bl.apply(this,arguments);if(!running)return;ctx.save();ctx.globalAlpha=DIET.DIM;ctx.fillStyle='#000';ctx.fillRect(-40,-40,W+80,H+80);ctx.restore();};}
  /* ---- 7. the lean HUD (Settings > HUD Minimal): score, hull, boss bar + the DASH / EMP / pause buttons ---- */
  const LOG=()=>Object.assign(HUDLOG,{score:String(G.score).padStart(8,'0'),mult:'×'+G.mult.toFixed(1),best:String(Math.max(best.score,G.score)).padStart(8,'0'),hp:P.hp,hpMax:P.max,neon:SH.neon,heat:Math.round(P.heat),emp:P.emp,wl:P.wl,combo:C.n,tier:tierOf(C.n),
    district:DISTRICTS[G.di].name+(G.loop?' +'+G.loop:''),story:ST.on?ST.n:0,goal:ST.on?ST.label():'',boss:!!G.boss,bossHp:G.boss?Math.round(G.boss.hp):0,beat:((Math.floor(G.bp)%4)+4)%4,frame:HUDLOG.frame+1,lean:1});
  const pips=(x,y,hw,hh,gap)=>{for(let i=0;i<P.max;i++){ctx.fillStyle=i<P.hp?(P.hp<=1?'#ff3040':'#3dffb0'):'#ffffff1a';ctx.fillRect(x+i*(hw+gap),y,hw,hh);}};
  const banner=(t,w,h,k)=>{if(!(G.banner.t>0))return;if(window.CALM&&CALM.small(G.banner)){CALM.draw(G.banner,w,h,k);return;}const kk=G.banner.t,m=G.banner.m,a=Math.min(1,kk*2,(m-kk)*4),D=DISTRICTS[G.di];ctx.globalAlpha=Math.max(0,a);ctx.textAlign='center';
    if(G.banner.pic!=null)ART.portrait(G.banner.pic,w/2,h/2-58*k-100*k,92*k,Math.max(0,a));
    if(G.banner.ev)ART.pic(G.banner.ev,Math.min(256*k,w*.7),w/2,h/2-58*k-40*k,0,Math.max(0,a));ctx.globalAlpha=Math.max(0,a);
    ctx.fillStyle='#05030cbb';ctx.fillRect(0,h/2-58*k,w,96*k);const col=G.banner.warn?'#ff3040':D.a;ctx.fillStyle=col;ctx.fillRect(0,h/2-58*k,w,2);ctx.fillRect(0,h/2+36*k,w,2);
    ctx.font=`700 ${Math.min(54*k,w/Math.max(7,G.banner.a.length*.62))}px "Chakra Petch",sans-serif`;ctx.fillStyle=G.banner.warn&&!SET.reduce&&BK(t,6)?'#ffffff':col;ctx.fillText(G.banner.a,w/2+(1-a)*40,h/2+4*k);
    ctx.font=`${Math.min(15*k,w/Math.max(20,G.banner.b.length*.62))}px "Share Tech Mono",monospace`;ctx.fillStyle='#e9e6ff';ctx.fillText(G.banner.b,w/2,h/2+26*k);ctx.globalAlpha=1;};
  const buttons=()=>{if(window.ABIL&&ABIL.on)ABIL.rings();else{const v=HUDX.vals();setRing($('bDash'),Math.min(1,(v.dash+(v.dash<v.dashMax&&P.dashCd>0?1-clamp(P.dashCd,0,1):0))/v.dashMax),'#19e3ff',v.dashMax>1?v.dash:'');setRing($('bEmp'),P.emp/3,'#ffb020',P.emp>0?P.emp:'');}};
  DIET.hudP=function(t){const D=DISTRICTS[G.di],k=HK,w=PW_,h=PH_;ctx.save();LOG();
    const sH=34*k,pad=10*k;ctx.fillStyle='#05030cb0';ctx.fillRect(0,0,w,sH);ctx.fillStyle=D.a+'44';ctx.fillRect(0,sH,w,1);
    ctx.textAlign='left';ctx.font=`700 ${19*k}px "Chakra Petch",sans-serif`;ctx.fillStyle='#fff';ctx.fillText(String(G.score).padStart(8,'0'),pad,23*k);
    {const hw=Math.min(12*k,90*k/P.max),gap=3*k,hwid=P.max*(hw+gap)-gap;pips(w-pad-hwid,13*k,hw,9*k,gap);}
    Object.assign(HUDLOG,{x:HUDX.vals()});
    const short=h*Math.max(.2,frame.clientWidth/w)<800;
    if(G.boss&&G.boss.x<W){const b=G.boss,bw=Math.min(330,w-120),by=sH+8*k,bh=6*k;ctx.fillStyle='#00000088';ctx.fillRect((w-bw)/2,by,bw,bh);ctx.fillStyle='#ff3040';ctx.fillRect((w-bw)/2,by,bw*clamp(b.hp/b.max,0,1),bh);}
    buttons();
    /* short phone: the now-playing line is skipped (it pushed hud-cover to 21.2%); RESUMED notes stay */
    if(G.note.t>0&&G.note.txt&&!((short||innerHeight<600)&&/^\u266a/.test(G.note.txt))){ctx.globalAlpha=clamp(G.note.t,0,1);ctx.textAlign='right';ctx.font=`${12*k}px "Share Tech Mono",monospace`;ctx.fillStyle='#c9c4ec';ctx.fillText(G.note.txt,w-14,h-70*k);ctx.globalAlpha=1;}
    if(window.HINT&&HINT.on())HINT.draw(ctx,{W:w,H:h,mode:'port',cpu:Math.max(.2,frame.clientWidth/w),top:short?h*.8+4:(G.boss&&G.boss.x<W?80:62)*k,x0:6,x1:w-6,ship:{x:P.y,y:PH_-P.x},acc:D.a});
    else if(G.hint.t>0&&G.hint.txt&&G.banner.t<=0){ctx.globalAlpha=clamp(G.hint.t,0,1);hintDraw(w/2,h-170*k,17*k,k,w,28*k,44*k);ctx.globalAlpha=1;}
    banner(t,w,h,k);ctx.restore();};
  DIET.hudL=function(t){const D=DISTRICTS[G.di],ku=HKL;ctx.save();LOG();
    const cn=(ax,ay,f)=>{if(ku===1){f();return;}ctx.save();ctx.translate(ax,ay);ctx.scale(ku,ku);ctx.translate(-ax,-ay);f();ctx.restore();};
    cn(0,0,()=>{UIK.plate(ctx,'ui-hud-mult',8,6,150,48,20,12,33,125);ctx.font='700 22px "Chakra Petch",sans-serif';ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText(String(G.score).padStart(8,'0'),20,37);});
    cn(0,H,()=>{const y0=H-62;UIK.plate(ctx,'ui-hud-bars',8,y0,228,50,24,12,157,197);const by=y0+36;ctx.textAlign='left';ctx.font='11px "Share Tech Mono",monospace';ctx.fillStyle='#dcd8f6';
      ctx.fillText('HULL',20,y0+26);pips(20,by-8,Math.min(16,88/P.max)-4,8,4);
      ctx.fillStyle='#dcd8f6';ctx.fillText('DASH',122,y0+26);ctx.fillStyle='#ffffff1a';ctx.fillRect(122,by-8,36,8);ctx.fillStyle=P.dashCd<=0?D.a:'#ffffff40';ctx.fillRect(122,by-8,36*(1-clamp(P.dashCd,0,1)),8);
      ctx.fillStyle='#dcd8f6';ctx.fillText('EMP',172,y0+26);for(let i=0;i<3;i++){ctx.fillStyle=i<P.emp?'#ffb020':'#ffffff1a';ctx.beginPath();ctx.arc(178+i*14,by-4,4.5,0,7);ctx.fill();}});
    Object.assign(HUDLOG,{x:HUDX.vals()});
    if(touchUI)buttons();
    if(G.note.t>0&&G.note.txt)cn(W,H,()=>{ctx.globalAlpha=clamp(G.note.t,0,1);ctx.textAlign='right';ctx.font='12px "Share Tech Mono",monospace';ctx.fillStyle='#c9c4ec';ctx.fillText(G.note.txt,W-18,H-12);ctx.globalAlpha=1;});
    if(window.HINT&&HINT.on())HINT.draw(ctx,{W,H,mode:'land',cpu:Math.max(.2,frame.clientWidth/W),top:(G.boss&&G.boss.x<W?84:76)*ku,x0:Math.min(W*.4,244*ku),x1:W-8,ship:{x:P.x,y:P.y},acc:D.a});
    else if(G.hint.t>0&&G.hint.txt&&G.banner.t<=0)cn(W/2,H-62,()=>{ctx.globalAlpha=clamp(G.hint.t,0,1);hintDraw(W/2,H-62,15,1,W,26,40);ctx.globalAlpha=1;});
    if(G.boss&&G.boss.x<W){const b=G.boss;ctx.fillStyle='#00000088';ctx.fillRect(W/2-200*ku,30*ku,400*ku,8*ku);ctx.fillStyle='#ff3040';ctx.fillRect(W/2-200*ku,30*ku,400*ku*clamp(b.hp/b.max,0,1),8*ku);}
    banner(t,W,H,Math.min(ku,1.3));ctx.restore();};
  const hud=(f,lean)=>function(t){if(!DIET.lean()||!running||!G)return f.apply(this,arguments);if(window.COM)COM.hud=1;try{return lean(t);}finally{if(window.COM)COM.hud=0;}};
  drawHUDP=hud(drawHUDP,t=>DIET.hudP(t));drawHUD=hud(drawHUD,t=>DIET.hudL(t));
  if(window.PW&&PW.hud){const ph=PW.hud;PW.hud=function(){if(DIET.lean())return;return ph.apply(this,arguments);};}
  if(typeof HOLD!=='undefined'&&HOLD.draw){const hd=HOLD.draw;HOLD.draw=function(){if(DIET.lean())return;return hd.apply(this,arguments);};}   // LINE: Full HUD only
  if(window.ABIL&&ABIL.rings){const ar=ABIL.rings;ABIL.rings=function(){const r=ar.apply(this,arguments);if(DIET.lean()){const e=$('bEmp');if(e&&/^~/.test(e.getAttribute('data-t')||''))e.removeAttribute('data-t');}return r;};}
}
