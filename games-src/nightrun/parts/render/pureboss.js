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
    ctx.save();ctx.translate(e.x,e.y);SPR.boss(e,nm,wd,by,tl,e.flash>0);if(e.b2s)this.shield(e,t);ctx.restore();return true;},
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
  pickups(t){for(const p of G.pk){const y=p.y+Math.sin(p.bob)*3;ctx.save();ctx.translate(p.x,y);if(p.t==='pw')PW.coin(p.k,16);else pkPaint(p,t);ctx.restore();}},   // power-ups: the owner's icon only (no glow disc, dashed ring or name)
  bar(w){const b=G.boss;if(!b||b.x>=W||!(b.max>0))return;ctx.fillStyle='#ff6a2a';ctx.fillRect(0,0,w*clamp(b.hp/b.max,0,1),4);}};
{const f=PURL.foe;PURL.foe=function(e,t){if(e.type==='boss')return PB.boss(e,t);if(e.type==='gate')return PB.gate(e,t);return f.call(this,e,t);};}
PURL.pickups=function(t){PB.pickups(t);};
{const f=PURL.shots;PURL.shots=function(){const eb=G.eb;G.eb=[];try{f.call(this);}finally{G.eb=eb;}PB.ebul();};}
{const h1=drawHUDP,h2=drawHUD,w=(f,wd)=>function(){PB.hud++;const b=G.boss,pl=RET.purelook&&b;if(pl)G.boss=null;   // the old boss bars / pips read G.boss: hidden here, the one thin bar is drawn after
    try{f.apply(this,arguments);}finally{if(pl)G.boss=b;if(pl)PB.bar(wd());PB.hud--;}};drawHUDP=w(h1,()=>PW_);drawHUD=w(h2,()=>W);}
{const h=PW.hud;PW.hud=function(){PB.hud++;try{return h.apply(this,arguments);}finally{PB.hud--;}};}   // the power-up panel is HUD (pure.js draws it after drawHUD)
