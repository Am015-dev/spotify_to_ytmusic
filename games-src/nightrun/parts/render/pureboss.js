// PURPOSE: ?pure=1 bosses, gate pylons and enemy shots from the owner's pictures only (boss idle/attack/hit/defeat sheets, fx-shield, fx-eb-*, fx-bullet-*)
// FLAG: purelook (same as pure.js; this part only adds PURL.boss / PURL.gate / PURL.ebul and wraps PURL.foe / PURL.shots)
// TEST: node qa/pureprobe.js (0 code-drawn shapes in the play field, stage 1 and a boss fight)
/* ---------- W216 (owner, 24 Oct 2026): pure.js left bosses and gate pylons on the old draw chain (tints, rings, crosshairs, plates, lasers drawn with
   fillRect) and enemy shots as lime orbs. Here: the boss is SPR.boss (its four sheets: idle, attack while it fires, hit on damage; defeat is the ghost
   clip the kill already queues), a phase shield is the fx-shield sheet, telegraphs are fx-eb-aim-line, beams fx-eb-laser-sweep. Enemy fire is ONE
   hue family (the owner's hot orange / red fx-bullet-* + fx-eb-*): shell for aimed shots, needle, rocket, mine, and a bigger spinning shell for homing.
   The boss health bar is one thin bar on the top edge of the HUD. Nothing here draws with arc / fillRect / stroke. ---------- */
const PB=window.PB={hud:0,   // >0 while a HUD function runs (qa/pureprobe.js counts code shapes outside it)
  
  img(n){const b=ART.bm[n];if(!b){if(b===undefined)ART.load(n);return null;}return b;},
  pic(n,x,y,w,h,ang,al){const b=this.img(n);if(!b)return false;ctx.save();ctx.globalCompositeOperation='lighter';if(al!=null)ctx.globalAlpha=al;ctx.translate(x,y);if(ang)ctx.rotate(ang);ctx.drawImage(b,-w/2,-(h||w*b.height/b.width)/2,w,h||w*b.height/b.width);ctx.restore();return true;},
  shield(e,t){const k='fx-shield/glow';if(!ART.ANIM.s[k]||!ART.anim(k))return;const s=ART.ANIM.s[k];ART.drawAnim(ctx,k,t,0,0,e.r*2.2/s[3],false,.35);},   // W224: behind the boss, normal blend, alpha .35: the body stays on top and readable
  boss(e,t){const ak=ART.artK(e),nm=ART.bossN[ak];if(!nm)return true;const b=ART.bm['spr-boss-'+nm];if(!b){ART.load('spr-boss-'+nm);return true;}
    SPR.warmBoss(nm);
    for(const l of e.lasers||[]){ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.a);
      if(l.t<2*BT.spb)this.pic('fx-eb-aim-line',700,0,1400,10,0,.9);else this.pic('fx-eb-laser-sweep',700,0,1400,40,0,.95);ctx.restore();}
    const wd=(wcv!==cv?1.9:1.2)*(ak===6?e.r*3.6*b.width/b.height:e.r*[3.6,3.4,3,3.2,3.2,3.6,0,3.4,3.4,3.4][ak]),   // art only (e.r stays the hitbox); a phone boss body is >= 40% of the short side
      mv=UIK.boss[nm]&&UIK.boss[nm].move||'air',by=mv==='air'?Math.sin(t*1.6)*3:0,tl=mv==='air'?Math.sin(t*.9)*.035:0;
    {const R=wd*.9,g=ctx.createRadialGradient(e.x,e.y,R*.7,e.x,e.y,R*1.9);g.addColorStop(0,'rgba(0,0,0,.2)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.save();ctx.fillStyle=g;ctx.fillRect(e.x-R*1.9,e.y-R*1.9,R*3.8,R*3.8);ctx.restore();}   // W239: a soft vignette (<= 20%) on the backdrop band behind the boss, never on its pixels (drawn before it)
    ctx.save();ctx.translate(e.x,e.y);if(e.b2s)this.shield(e,t);
    const da=ART.drawAnim;ART.drawAnim=(c,key,tt,x,y,sc,fl,al,sy)=>{if(al==null&&!fl&&c===ctx&&PURL.HALO&&PURL.cel(key,sc,'h'))PURL.dcel(key,tt,sc,'h',x,y,.9);return da(c,key,tt,x,y,sc,fl,al,sy);};   // W239 (owner: the sheet is a dark gunmetal vault, our 'B' value lift bleached it): the boss is drawn as painted, no lift, tint or rim; only the normal-blend dark shadow behind it and SPR.boss's own 60 ms hit flash remain
    try{SPR.boss(e,nm,wd,by,tl,e.flash>0);}finally{ART.drawAnim=da;}ctx.restore();return true;},
  gate(e,t){ctx.save();ctx.translate(e.x,0);const top=e.gy-e.gap/2,bot=e.gy+e.gap/2,fl=e.flash>0;
    if(e.on){for(const [y0,y1] of[[0,top],[bot,H]])this.pic('fx-eb-laser-sweep',0,(y0+y1)/2,y1-y0,36,Math.PI/2,.95);}
    else if(e.tele){for(const [y0,y1] of[[0,top],[bot,H]])this.pic('fx-eb-aim-line',0,(y0+y1)/2,y1-y0,8,Math.PI/2,.5+.4*Math.abs(Math.sin(t*8)));}
    for(const y of[top,bot])if(!FOEART.post(e,y,y===top,fl))gatePost(y,y===top,fl);
    ctx.restore();return true;},
  ebul(){for(const b of G.eb){const a=Math.atan2(b.vy||0,b.vx||-1),r=b.r||5;
      if(b.hm>0){if(!this.orb(b.x,b.y,r*7))this.pic('fx-bullet-shell',b.x,b.y,r*7,0,G.t*5);continue;}
      if(b.k==='n'){this.pic('fx-bullet-needle',b.x,b.y,r*9,0,a);continue;}
      if(b.k==='r'){this.pic('fx-bullet-rocket',b.x,b.y,r*8,0,a);continue;}
      if(b.ew||b.k==='m'){this.pic('fx-eb-mine',b.x,b.y,r*5);continue;}
      if(!this.orb(b.x,b.y,Math.max(r*5.2,(PURL.ph?16:12)/S)))this.pic('fx-bullet-shell',b.x,b.y,Math.max(r*5.2,(PURL.ph?16:12)/S));}},   // W227: the orange shell, never under ~8 px of visible core on the phone
  orb(x,y,w){let O=this.OB;if(!O){const b=this.img('fx-bullet-shell');if(!b)return false;const p=Math.ceil(b.width*.12),mk=(rim)=>{const c=document.createElement('canvas');c.width=b.width+2*p;c.height=b.height+2*p;const g=c.getContext('2d');g.drawImage(b,p,p);   // W231: the plain enemy shot drawn with normal blend (was 'lighter': only a small hot dot survived on the neon, read as pink): the owner's shell keyed on its light, over a dark rim
      const d=g.getImageData(0,0,c.width,c.height),a=d.data;for(let i=0;i<a.length;i+=4){const l=Math.max(a[i],a[i+1],a[i+2])/255;a[i+3]=255*Math.min(1,l*1.8);if(rim){a[i]=14;a[i+1]=4;a[i+2]=6;}else if(l>0){a[i]=Math.min(255,a[i]/l);a[i+1]=Math.min(255,a[i+1]/l);a[i+2]=Math.min(255,a[i+2]/l);}}g.putImageData(d,0,0);
      if(!rim)return c;const r=document.createElement('canvas');r.width=c.width;r.height=c.height;const x=r.getContext('2d');x.filter=`blur(${Math.max(2,p/3)}px)`;x.drawImage(c,0,0);x.drawImage(c,0,0);return r;};O=this.OB={c:mk(0),r:mk(1),k:(b.width+2*p)/b.width};}
    const W_=w*O.k;ctx.globalAlpha=.85;ctx.drawImage(O.r,x-W_*.65,y-W_*.65,W_*1.3,W_*1.3);ctx.globalAlpha=1;ctx.drawImage(O.c,x-W_/2,y-W_/2,W_,W_);return true;},
  chip(bn,w,k){const kk=bn.t,u=bn.m-kk;if(u>1.2)return;const T=ctx.getTransform(),sy=Math.hypot(T.c,T.d)||1,band=(PURL.ph?42:64)/sy,f=Math.min(13,band*sy*.36)/sy,a=Math.max(0,Math.min(1,u*6,(1.2-u)*5));   // W231: every flight banner is one title line inside the top HUD band, <= 1.2 s (was a strip / 96 px band over the field)
    ctx.save();ctx.globalAlpha=a;ctx.font=`700 ${f}px "Chakra Petch",sans-serif`;ctx.textBaseline='middle';ctx.fillStyle=bn.warn?'#ff5a4a':'#e9e6ff';
    if(PURL.ph){ctx.textAlign='center';ctx.fillText(bn.a,w*.585,band*.42,130/sy);}else{ctx.textAlign='right';ctx.fillText(bn.a,w-20/sy,band*.5,360/sy);}ctx.restore();},
  pickups(t){for(const p of G.pk){const y=p.y+Math.sin(p.bob)*3;ctx.save();ctx.translate(p.x,y);if(p.t==='pw')PW.coin(p.k,16);else if(!(p.t==='shard'&&this.gold()))pkPaint(p,t);else{const o=ART.sp('pk-shard~g',13);if(o)ART.put(o,0,0,0,null,.35+.65*Math.abs(Math.cos(t*3+p.bob)),1);}ctx.restore();}},
  gold(){const n='pk-shard~g';if(ART.bm[n])return true;const b=this.img('pk-shard');if(!b)return false;const c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d');x.filter='sepia(1) saturate(3.2) hue-rotate(-8deg) brightness(1.15)';x.drawImage(b,0,0);ART.bm[n]=c;return true;},   // W227: pickups own one hue, gold (teal is the tower windows), made once   // power-ups: the owner's icon only (no glow disc, dashed ring or name)
  bar(w){const b=G.boss;if(!b||b.x>=W||!(b.max>0))return;ctx.fillStyle='#ff6a2a';ctx.fillRect(0,0,w*clamp(b.hp/b.max,0,1),4);}};
{const f=PURL.foe;PURL.foe=function(e,t){if(e.type==='boss')return PB.boss(e,t);if(e.type==='gate')return PB.gate(e,t);return f.call(this,e,t);};}
PURL.pickups=function(t){PB.pickups(t);};
{const d=PURL.draw;PURL.draw=function(){PB.fl=1;try{return d.apply(this,arguments);}finally{PB.fl=0;}};   // W231: flight banners live in the HUD band
  const sm=CALM.small,dr=CALM.draw;CALM.small=function(bn){return RET.purelook&&PB.fl&&PB.hud?!!bn:sm.apply(this,arguments);};CALM.draw=function(bn,w,h,k){if(RET.purelook&&PB.fl&&PB.hud)return PB.chip(bn,w,k);return dr.apply(this,arguments);};}
{const f=PURL.shots;PURL.shots=function(){const eb=G.eb;G.eb=[];try{f.call(this);}finally{G.eb=eb;}PB.ebul();};}
/* W239 (PC seed 2: the ship flew under the score panel and could not be seen): the score / multiplier panel and the HULL panel fade to 35% while the ship's box overlaps them.
   The HUD is drawn once as always; the pixels under each overlapped panel are copied first and laid back over it at (1 - fade) afterwards, so every HUD implementation fades the same way. */
PB.FA=[1,1];PB.FADE=.35;
PB.fadeBox=()=>{const sh=ART.ANIM.s['ship-'+shipDef().id+'/flame'],k=PURL.K*PURL.PK,hw=(sh?sh[2]*k:56)/2+4,hh=(sh?sh[3]*k:30)/2+4,hk=HKL;
  const rs=[[0,0,260*hk,70*hk],[0,H-78*hk,330*hk,78*hk]];   // score + multiplier (+ its caption), HULL / HEAT / DASH / EMP / weapons plate
  return rs.map((r,i)=>{const hit=!G.dead&&P.x+hw>r[0]&&P.x-hw<r[0]+r[2]&&P.y+hh>r[1]&&P.y-hh<r[1]+r[3];PB.FA[i]+=((hit?PB.FADE:1)-PB.FA[i])*.35;if(Math.abs(PB.FA[i]-(hit?PB.FADE:1))<.01)PB.FA[i]=hit?PB.FADE:1;return r;});};
PB.fadeRun=(f,self,args)=>{const rs=PB.fadeBox(),T=ctx.getTransform(),cvs=ctx.canvas,sn=[];
  rs.forEach((r,i)=>{if(PB.FA[i]>=1)return;const x0=Math.max(0,Math.floor(T.a*r[0]+T.e)),y0=Math.max(0,Math.floor(T.d*r[1]+T.f)),x1=Math.min(cvs.width,Math.ceil(T.a*(r[0]+r[2])+T.e)),y1=Math.min(cvs.height,Math.ceil(T.d*(r[1]+r[3])+T.f));
    if(x1<=x0||y1<=y0)return;const c=document.createElement('canvas');c.width=x1-x0;c.height=y1-y0;c.getContext('2d').drawImage(cvs,x0,y0,x1-x0,y1-y0,0,0,x1-x0,y1-y0);sn.push([c,x0,y0,PB.FA[i]]);});
  try{return f.apply(self,args);}finally{if(sn.length){ctx.save();ctx.setTransform(1,0,0,1,0,0);for(const [c,x,y,a] of sn){ctx.globalAlpha=1-a;ctx.drawImage(c,x,y);}ctx.restore();}}};
{const h1=drawHUDP,h2=drawHUD,w=(f,wd)=>function(){PB.hud++;const b=G.boss,pl=RET.purelook&&b;if(pl)G.boss=null;   // the old boss bars / pips read G.boss: hidden here, the one thin bar is drawn after
    try{if(wd()===W&&RET.purelook)PB.fadeRun(f,this,arguments);else f.apply(this,arguments);}finally{if(pl)G.boss=b;if(pl)PB.bar(wd());PB.hud--;}};drawHUDP=w(h1,()=>PW_);drawHUD=w(h2,()=>W);}
{const h=PW.hud;PW.hud=function(){PB.hud++;try{return h.apply(this,arguments);}finally{PB.hud--;}};}   // the power-up panel is HUD (pure.js draws it after drawHUD)
