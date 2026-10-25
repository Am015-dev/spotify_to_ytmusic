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
  shield(e,t){const k='fx-shield/glow';if(!ART.ANIM.s[k]||!ART.anim(k))return;const s=ART.ANIM.s[k];ctx.save();ctx.globalCompositeOperation='lighter';ART.drawAnim(ctx,k,t,0,0,e.r*3.2*.8/s[3],false,.6);ctx.restore();},   // 0.8x at alpha .6: the boss outline shows through
  boss(e,t){const ak=ART.artK(e),nm=ART.bossN[ak];if(!nm)return true;const b=ART.bm['spr-boss-'+nm];if(!b){ART.load('spr-boss-'+nm);return true;}
    SPR.warmBoss(nm);
    for(const l of e.lasers||[]){ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.a);
      if(l.t<2*BT.spb)this.pic('fx-eb-aim-line',700,0,1400,10,0,.9);else this.pic('fx-eb-laser-sweep',700,0,1400,40,0,.95);ctx.restore();}
    const wd=(wcv!==cv?1.9:1.2)*(ak===6?e.r*3.6*b.width/b.height:e.r*[3.6,3.4,3,3.2,3.2,3.6,0,3.4,3.4,3.4][ak]),   // art only (e.r stays the hitbox); a phone boss body is >= 40% of the short side
      mv=UIK.boss[nm]&&UIK.boss[nm].move||'air',by=mv==='air'?Math.sin(t*1.6)*3:0,tl=mv==='air'?Math.sin(t*.9)*.035:0;
    {const R=wd*.9,g=ctx.createRadialGradient(e.x,e.y,R*.7,e.x,e.y,R*1.9);g.addColorStop(0,'rgba(0,0,0,.2)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.save();ctx.fillStyle=g;ctx.fillRect(e.x-R*1.9,e.y-R*1.9,R*3.8,R*3.8);ctx.restore();}   // W239: a soft vignette (<= 20%) on the backdrop band behind the boss, never on its pixels (drawn before it)
    ctx.save();ctx.translate(e.x,e.y);
    if(rotMode){const f=Math.min(1,PB.maxW()/(e._dw||wd*1.2));ctx.rotate(Math.PI/2);   // portrait: the world is turned upright by render(), so turn the sheet back (feet down), shrunk to fit and centred on the hitbox
      const bw=wd*f*1.5+12;PURL.ink(bw,bw*b.height/b.width+12,()=>SPR.boss(e,nm,wd*f,by,tl,e.flash>0));const w=e._dw||0,h=e._dh||0;e._bb={x0:e.x-h/2,x1:e.x+h/2,y0:e.y-w/2,y1:e.y+w/2,cx:e.x,cy:e.y};}
    else{const bw=wd*1.5+12;PURL.ink(bw,bw*b.height/b.width+12,()=>SPR.boss(e,nm,wd,by,tl,e.flash>0));}   // W244: boss in the same outline / shadow / lit edge as every ship
    if(e.b2s)this.shield(e,t);ctx.restore();return true;},
  maxW(){return H*.84*.9;},   // phone: the body is at most 90% of the play width left after an 8% margin on each side
  keep(e){if(!rotMode||!e._dw)return;const hw=e._dw/2+H*.1;e.y=clamp(e.y,hw,H-hw);},   // the boss stays inside the field (its y is the screen's x)
  gate(e,t){ctx.save();ctx.translate(e.x,0);const top=e.gy-e.gap/2,bot=e.gy+e.gap/2,fl=e.flash>0;
    if(e.on){for(const [y0,y1] of[[0,top],[bot,H]])this.pic('fx-eb-laser-sweep',0,(y0+y1)/2,y1-y0,36,Math.PI/2,.95);}
    else if(e.tele){for(const [y0,y1] of[[0,top],[bot,H]])this.pic('fx-eb-aim-line',0,(y0+y1)/2,y1-y0,8,Math.PI/2,.5+.4*Math.abs(Math.sin(t*8)));}
    for(const y of[top,bot])if(!FOEART.post(e,y,y===top,fl))gatePost(y,y===top,fl);
    ctx.restore();return true;},
  ebul(){for(const b of G.eb){const a=Math.atan2(b.vy||0,b.vx||-1),r=b.r||5;
      if(b.hm>0){this.pic('fx-bullet-shell',b.x,b.y,r*7,0,G.t*5);continue;}
      if(b.k==='n'){this.pic('fx-bullet-needle',b.x,b.y,r*9,0,a);continue;}
      if(b.k==='r'){this.pic('fx-bullet-rocket',b.x,b.y,r*8,0,a);continue;}
      if(b.ew||b.k==='m'){this.pic('fx-eb-mine',b.x,b.y,r*5);continue;}
      this.pic('fx-bullet-shell',b.x,b.y,r*5.2);}},
  pickups(t){for(const p of G.pk){const y=p.y+Math.sin(p.bob)*3;ctx.save();ctx.translate(p.x,y);PURL.ink(56,56,()=>{if(p.t==='pw')PW.coin(p.k,16);else pkPaint(p,t);},.3);ctx.restore();}},   // W244: pickups sit in the scene with the same ink shadow   // power-ups: the owner's icon only (no glow disc, dashed ring or name)
  bar(w){const b=G.boss;if(!b||b.x>=W||!(b.max>0))return;ctx.fillStyle='#ff6a2a';ctx.fillRect(0,0,w*clamp(b.hp/b.max,0,1),4);}};
NR.on('tick',()=>{if(RET.purelook&&G&&G.boss)PB.keep(G.boss);});
{const f=PURL.foe;PURL.foe=function(e,t){if(e.type==='boss')return PB.boss(e,t);if(e.type==='gate')return PB.gate(e,t);return f.call(this,e,t);};}
PURL.pickups=function(t){PB.pickups(t);};
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
