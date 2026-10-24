// PURPOSE: flight looks like one picture, not stacked layers: ships graded and lit by the district, engine glow, depth haze and soft seams between the backdrop strips, real explosions (flash, fireball, smoke, sparks), a shaded armoured carrier
// FLAG: flylook (?flylook=0 = the old look)
// TEST: qa/flylook-probe.js (seam step, ship-to-backdrop colour distance, frame time); qa/flylook-shots.js (phone + PC at 5, 20, 40 s)
/* ---------- FLYLOOK (W201, owner 24 Oct 2026: "the flight is very ugly, they look like ugly layers, everything looks so ugly and unrealistic").
   Diagnosis (stage 1, 1440x860 and 390x763 at 5/20/40 s, beta after W194):
   - the ship sheets are painted warm (brass, olive, orange) and lit neutral; the city is violet and lit from the neon above: they read as stickers;
   - the explosion sheets (with their dark smoke) are drawn ADDITIVE, so the smoke turns into a flat white cloud, and there is no flash, fireball, sparks or lingering smoke;
   - the near rail strip starts with a hard horizontal edge on the hazy skyline (the brightness jumps there), the skyline strip has no depth haze at its foot;
   - lit.js puts a thin arc on every ship (a circle outline, not light) and a dark blob under ships that fly;
   - the stage 1 carrier is flat fills: a slate polygon and a flat pink disc.
   Fix (cheap, no new pictures): every ship sheet is graded ONCE per district into a copy (multiply toward the backdrop's mean colour, a little of the haze, the key light of the
   district's neon on the upper edge, shade underneath), so per frame there is no extra work; the boom sheets are drawn normally with an additive flash and fireball under them,
   smoke puffs that drift and sparks that streak; a soft glow on each foe's engine; the near strip gets a feathered top and a haze band; the carrier is shaded with gradients. ---------- */
if(RET.flylook===undefined)RET.flylook=!/[?&]flylook=0/.test(location.search);
const FLY=window.FLY={di:-1,pal:{},G:new Map(),P:[],n:0,
  on(){return!!RET.flylook&&!G.lab;},
  /* the district's mean backdrop colour (one 16x16 read of the painted backdrop) */
  palOf(di){if(this.pal[di])return this.pal[di];const b=ART.bm['bg-'+ART.dn[di]];if(!b||!b.width)return null;
    try{const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');g.drawImage(b,0,0,16,16);const d=g.getImageData(0,0,16,16).data,m=[0,0,0];
      for(let i=0;i<d.length;i+=4)for(let j=0;j<3;j++)m[j]+=d[i+j]/256;return this.pal[di]=m;}catch(e){return this.pal[di]=[60,40,90];}},
  K:{mul:.7,amb:.26,rim:.32,rimH:.4,shade:.38},
  /* grade one sheet (frames side by side) or picture into a copy: multiply toward the backdrop, ambient haze, key light from above, shade below; alpha kept */
  grade(src,di){const p=this.palOf(di);if(!p)return null;const D=DISTRICTS[di],K=this.K,w=src.width,h=src.height;if(!w||!h)return null;
    const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(src,0,0);
    const mx=Math.max(p[0],p[1],p[2],1),mt=p.map(v=>Math.round(255*(1-K.mul+K.mul*v/mx)));
    g.globalCompositeOperation='multiply';g.fillStyle='rgb('+mt.join(',')+')';g.fillRect(0,0,w,h);
    g.globalCompositeOperation='destination-in';g.drawImage(src,0,0);
    g.globalCompositeOperation='source-atop';g.globalAlpha=K.amb;g.fillStyle='rgb('+p.map(Math.round).join(',')+')';g.fillRect(0,0,w,h);g.globalAlpha=1;
    const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,this.a(D.a,K.rim));r.addColorStop(K.rimH,this.a(D.a,0));r.addColorStop(.6,'rgba(8,3,20,0)');r.addColorStop(1,'rgba(8,3,20,'+K.shade+')');
    g.fillStyle=r;g.fillRect(0,0,w,h);return c;},
  a(hex,al){const n=parseInt(hex.slice(1,7),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+al+')';},
  /* graded copy of a sheet / picture, rebuilt when the district changes */
  sync(){const di=G.di|0;if(di!==this.di){this.di=di;this.G.clear();for(const k in ART.sc)if(/^a\|ship-|^spr-(en|ship|boss)-/.test(k))delete ART.sc[k];}},
  of(key,src){this.sync();let o=this.G.get(key);if(o&&o.s===src)return o.c;const c=this.grade(src,this.di);if(!c)return src;this.G.set(key,{s:src,c});this.n++;return c;},
  /* blasts: flash + fireball (additive), smoke that drifts up and spreads, sparks that streak out */
  boom(x,y,sz,big){const P=this.P;if(P.length>140)P.splice(0,P.length-140);const r=sz*.5;
    P.push({k:'f',x,y,r:r*1.5,l:0,m:.12,d:0});P.push({k:'b',x,y,r:r*1.1,l:0,m:.32,d:0});
    for(let i=0,n=big?6:3;i<n;i++)P.push({k:'s',x:x+rnd(-r,r)*.4,y:y+rnd(-r,r)*.4,vx:rnd(-30,30)-40,vy:rnd(-40,-10),r:r*rnd(.35,.6),l:0,m:rnd(.7,1.2)*(big?1.4:1),d:rnd(0,.08)});
    for(let i=0,n=big?12:7;i<n;i++){const a=rnd(0,Math.PI*2),v=rnd(220,520)*(big?1.3:1);P.push({k:'k',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:0,m:rnd(.18,.36),d:0});}},
  draw(dt){const P=this.P;if(!P.length)return;const sm=LIT.spr('#3a2a4a'),fb=LIT.spr('#ff8a3a'),fl=LIT.spr('#fff2d0');ctx.save();ctx.lineCap='round';
    for(const s of [0,1]){ctx.globalCompositeOperation=s?'lighter':'source-over';   // smoke first (normal blending), then the light on top
      for(const q of P){if((q.k==='s')===!!s)continue;if(q.d>0){q.d-=dt;continue;}const k=q.l/q.m;if(k>=1)continue;
        if(q.k==='s'){q.x+=q.vx*dt;q.y+=q.vy*dt;const rr=q.r*(1+1.4*k);ctx.globalAlpha=.55*Math.min(1,k*6)*(1-k);ctx.drawImage(sm,q.x-rr,q.y-rr,rr*2,rr*2);}
        else if(q.k==='f'){ctx.globalAlpha=.85*(1-k);const rr=q.r*(.6+.6*k);ctx.drawImage(fl,q.x-rr,q.y-rr,rr*2,rr*2);}
        else if(q.k==='b'){ctx.globalAlpha=.7*(1-k)*(1-k);const rr=q.r*(.5+.9*k);ctx.drawImage(fb,q.x-rr,q.y-rr,rr*2,rr*2);}
        else{const x0=q.x,y0=q.y;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=260*dt;ctx.globalAlpha=1-k;ctx.strokeStyle=k<.4?'#fff0c0':'#ffa040';ctx.lineWidth=2*(1-k)+.6;ctx.beginPath();ctx.moveTo(x0-q.vx*.03,y0-q.vy*.03);ctx.lineTo(q.x,q.y);ctx.stroke();}
        q.l+=dt;}}
    ctx.restore();this.P=P.filter(q=>q.l<q.m);}};
{ /* ship sheets and pictures: the graded copy (the downscaled copies art.js builds are made from it) */
  const an=ART.anim;ART.anim=function(key){const b=an.apply(this,arguments);return b&&FLY.on()&&running&&/^ship-/.test(key)?FLY.of('a|'+key,b):b;};
  const sp=ART.sp;ART.sp=function(n,w,sc){if(!FLY.on()||!running||!/^spr-(en|ship|boss)-/.test(n))return sp.apply(this,arguments);
    const b=ART.bm[n];if(!b)return null;FLY.sync();const k=n+'@'+Math.max(1,Math.round(w*2)/2)+'@'+(sc||S);if(ART.sc[k]&&ART.sc[k].fly)return ART.sc[k];
    const o=sp.apply(this,arguments);if(!o)return o;const c=o.c===b?FLY.of(n,b):FLY.grade(o.c,G.di|0)||o.c;return ART.sc[k]={c,w:o.w,h:o.h,fly:1};};
  /* boom sheets (they carry their own dark smoke) are drawn normally, not added: the additive draw washed them into a white cloud */
  const fx0=ART.fxDraw;ART.fxDraw=function(){if(!FLY.on())return fx0.apply(this,arguments);const f=ART.fx,keep=[];
    for(let i=f.length-1;i>=0;i--){const sk=RET.sprites&&ART.fxSheet(f[i].k);if(sk&&/^fx-boom/.test(sk)&&ART.anim(sk))keep.push(f.splice(i,1)[0]);}
    const live=[];for(let i=keep.length-1;i>=0;i--){const q=keep[i],sk=ART.fxSheet(q.k),so=ART.aS(sk),ml=so?so.tot+SPR.fxTail:q.m;q.t+=FD;if(q.t>=ml)continue;live.push(q);
      if(q.t>=0)ART.drawAnim(ctx,sk,q.t,q.x,q.y,q.sz/ART.ANIM.c[sk].bw,false,Math.min(1,(ml-q.t)/SPR.fxTail));}
    ctx.globalAlpha=1;const r=fx0.apply(this,arguments);for(const q of live)f.push(q);   // the rest (muzzle, sparks, flat pictures) as before
    FLY.draw(FD||1/60);return r;};
  NR.on('kill',o=>{const e=o&&o.e;if(!e||!FLY.on())return;const big=o.boss||e.type==='gunship'||e.type==='mine'||e.type==='turret'||e.ldr;FLY.boom(e.x,e.y,o.boss?260:big?140:Math.max(54,(e.r||14)*3.6),big);if(big&&!o.boss&&!RET.lit)shake(4);});
  NR.on('runStart',()=>{FLY.P=[];});
  /* foes: a soft glow on the engine (behind the ship, the side it flies away from) */
  const d0=drawEnemy;drawEnemy=function(e,t){if(FLY.on()&&e&&!e.dead&&e.hp>0&&!e.carC&&e.type!=='boss'){const r=Math.max(10,Math.min(34,e.r||14)),D=DISTRICTS[G.di]||DISTRICTS[0],
      f=.75+.25*Math.sin(t*31+e.x*.07),gx=e.x+r*.95,gr=r*.9*f;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.32*f;ctx.drawImage(LIT.spr(D.b||'#19e3ff'),gx-gr,e.y-gr*.6,gr*2,gr*1.2);ctx.restore();}
    return d0.apply(this,arguments);};
  /* lit.js: no outline arc as "rim" (the graded sheets carry the key light now), no dark blob under ships in the air */
  if(window.LIT){const ov=LIT.over,un=LIT.under;
    LIT.over=function(e,x,y,r,far){if(!FLY.on())return ov.apply(this,arguments);const a=ctx.arc;ctx.arc=function(){};try{return ov.apply(this,arguments);}finally{ctx.arc=a;}};
    LIT.under=function(x,y,r){if(!FLY.on())return un.apply(this,arguments);const D=this.D();ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.08;ctx.drawImage(this.spr(D.a),x-r*1.6,y-r*.4,r*3.2,r*1.8);ctx.restore();};}
  /* the backdrop strips: the near strip's deck (where it turns solid and dark over the bright skyline) fades from a haze band just under its lit rail in the backdrop's own colour (PC, painted districts) */
  const deck=o=>{if(o.deck!=null)return o.deck;try{const c=o.c,x=document.createElement('canvas');x.width=64;x.height=Math.max(8,Math.round(c.height/4));const g=x.getContext('2d');g.drawImage(c,0,0,x.width,x.height);
      const d=g.getImageData(0,0,x.width,x.height).data;let y=0;for(;y<x.height;y++){let n=0;for(let i=0;i<x.width;i++)if(d[(y*x.width+i)*4+3]>200)n++;if(n>x.width*.92)break;}return o.deck=o.h*y/x.height;}catch(e){return o.deck=o.h*.5;}};
  const pb=ART.paintBG;ART.paintBG=function(bg,t,scroll){const ok=pb.apply(this,arguments);if(!ok||!FLY.on())return ok;const di=DISTRICTS.indexOf(bg.D),nr=ART.strip('ly-near-'+bg.D.near,130),p=FLY.palOf(di);if(!nr||!p)return ok;
    const yd=H-nr.h+deck(nr),k='fh|'+di+'@'+H,hz=ART.sc[k]||(ART.sc[k]=(()=>{const c=p.map(v=>Math.round(v*1.25)).join(','),g=ctx.createLinearGradient(0,yd,0,yd+100);
      g.addColorStop(0,'rgba('+c+',0)');g.addColorStop(.16,'rgba('+c+',.06)');g.addColorStop(.32,'rgba('+c+',.5)');g.addColorStop(.6,'rgba('+c+',.36)');g.addColorStop(1,'rgba('+c+',0)');return g;})());
    ctx.fillStyle=hz;ctx.fillRect(0,yd,W,100);FLY.yd=yd;return ok;};
  /* the stage 1 carrier: shaded hull and a glowing core instead of flat fills */
  if(window.S1F&&S1F.CAR){const C=S1F.CAR,cd=C.draw;C.draw=function(c,t){if(!FLY.on())return cd.apply(this,arguments);const h=H*.56,w=46,o=c.open,D=DISTRICTS[G.di]||DISTRICTS[0];ctx.save();ctx.translate(c.x,c.y);
      const hull=()=>{ctx.beginPath();ctx.moveTo(-w*.4,-h/2);ctx.lineTo(w,-h/2+30);ctx.lineTo(w,h/2-30);ctx.lineTo(-w*.4,h/2);ctx.lineTo(-w*.9,0);ctx.closePath();};
      const g=ctx.createLinearGradient(-w*.9,0,w,0);g.addColorStop(0,'#3a3550');g.addColorStop(.35,'#1c1a2c');g.addColorStop(1,'#0c0a16');hull();ctx.fillStyle=g;ctx.fill();
      ctx.save();hull();ctx.clip();const v=ctx.createLinearGradient(0,-h/2,0,h/2);v.addColorStop(0,FLY.a(D.a,.35));v.addColorStop(.25,FLY.a(D.a,0));v.addColorStop(.8,'rgba(4,2,10,0)');v.addColorStop(1,'rgba(4,2,10,.6)');ctx.fillStyle=v;ctx.fillRect(-w,-h/2,w*2.1,h);
      ctx.strokeStyle='rgba(150,140,190,.35)';ctx.lineWidth=1.5;for(const q of[-.33,-.16,.16,.33]){ctx.beginPath();ctx.moveTo(-w*.6,q*h);ctx.lineTo(w,q*h);ctx.stroke();ctx.strokeStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.moveTo(-w*.6,q*h+2);ctx.lineTo(w,q*h+2);ctx.stroke();ctx.strokeStyle='rgba(150,140,190,.35)';}
      ctx.restore();hull();ctx.strokeStyle=FLY.a(D.a,.55);ctx.lineWidth=2;ctx.stroke();
      const r=c.r,p=.5+.5*Math.sin(t*8),cg=ctx.createRadialGradient(-r*.25,-r*.3,r*.1,0,0,r);
      if(o){cg.addColorStop(0,'#ffffff');cg.addColorStop(.3,'#ff9ab8');cg.addColorStop(.75,'#d0204e');cg.addColorStop(1,'#4a0818');}else{cg.addColorStop(0,'#9aa6c4');cg.addColorStop(.6,'#4a5270');cg.addColorStop(1,'#1a1e2e');}
      ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fillStyle=cg;ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=c.flash>0?'#ffffff':o?'#ffd0dc':'#6a7898';ctx.stroke();
      if(o){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35+.35*p;ctx.drawImage(LIT.spr('#ff3d6a'),-r*2.2,-r*2.2,r*4.4,r*4.4);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
      else{ctx.strokeStyle='#8fa3c7';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-r*.7,-r*.7);ctx.lineTo(r*.7,r*.7);ctx.moveTo(-r*.7,r*.7);ctx.lineTo(r*.7,-r*.7);ctx.stroke();}
      ctx.restore();};}
}
