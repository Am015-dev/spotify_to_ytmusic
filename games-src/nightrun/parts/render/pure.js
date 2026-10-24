// PURPOSE: ?pure=1: the flight frame is only the owner's pictures drawn as they are (no grade, scanlines, vignette, glows, rings, tints, play-field text)
// FLAG: purelook, default ON since W215 (?purelook=0 = the old layered look; RET.pure is the music flag in puremusic.js, so this one has its own name)
// TEST: look checked on 390x763 and 1440x860 frames (games-src/nightrun/review-shots/W214)
/* ---------- W214 (owner, 24 Oct 2026: "they CAN blend well; it's your shitty work that makes it look so ugly").
   render() (c.js) hands the whole flight frame to PURL.draw when the flag is on. Drawn, in order: the district backdrop and its painted layers
   (bg, far, mid, near) at full strength with the old parallax, owner pickup art, every ship from its untinted sheet at ONE texel scale
   (PURL.K world units per sheet px, a size clamp of 0.8-1.25x keeps the game's big / small ships), death clips, owner bullet pictures (painted on black, so added with 'lighter' like the fx sheets),
   owner fx sheets, then the minimal HUD at the edges. Not drawn: scanlines + vignette, colour grade / veil / haze, glows, rings, telegraphs,
   arming circles, hit flashes, tier glow, screen flash / glitch, floating text, edge pulses. Bosses and gate pylons have no single sheet
   drawn here yet: they keep the old draw. Gameplay is not touched (the sim never calls render). ---------- */
if(RET.purelook===undefined)RET.purelook=!/[?&]purelook=0/.test(location.search);   // W215: the default flight look
const PURL=window.PURL={K:90/520,get ph(){return wcv!==cv||Math.min(innerWidth,innerHeight)<500;},   // W227: the phone layout (the portrait world, or any screen under 500 px), not only wcv!==cv
  get PK(){return this.ph?1.6:1.3;},   // W215/W219: player 1.6x the enemies' texel scale on the phone, 1.3x on PC
  pl(){const s=ART.ANIM.s['ship-'+shipDef().id+'/flame'];return(s?s[2]:260)*this.K*this.PK;},   // the player's drawn length (world units)
  WARM:/^(beat|disc|flame|orbit|shell|storm|swarm)$/,   // W215: weapon shot pictures in the enemy-shot hues (lime / yellow / orange): drawn as the cool standard shot instead
  dim(b,v){v=v||.32;const D=this.DM||(this.DM=new Map()),k=D.get(b)||{};D.set(b,k);let c=k[v];if(c)return c;   // W219/W224: backdrop layers only, once per picture: brightness .32, saturate .6, so the play layer is the brightest thing
    c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d');x.filter=`brightness(${v}) saturate(.6)`;x.drawImage(b,0,0);x.filter='none';
    const d=x.getImageData(0,0,c.width,c.height),a=d.data,cw=c.width,ch=c.height;   // W224: a light haze veil baked into the backdrop only (stronger toward the bottom), the depth cue between the city and the ships
    for(let y=0;y<ch;y++){const f=.1+.18*y/ch;for(let i=y*cw*4,e=i+cw*4;i<e;i+=4){a[i]+=(58-a[i])*f;a[i+1]+=(44-a[i+1])*f;a[i+2]+=(92-a[i+2])*f;}}
    x.putImageData(d,0,0);return k[v]=c;},
  cover(b,w,h){b=this.dim(b,.32);
   const s=Math.max(w/b.width,h/b.height),sw=w/s,sh=h/s;ctx.drawImage(b,(b.width-sw)/2,(b.height-sh)/2,sw,sh,0,0,w,h);},
  tile(b,y,h,scroll,par,keep,v){if(!keep)b=this.dim(b,v);const tw=h*b.width/b.height,off=(scroll*par)%(2*tw);   // every other tile mirrored: no seam
    for(let j=Math.floor(off/tw);j*tw-off<W;j++){const x=j*tw-off;if(x+tw<=0)continue;
      if(j&1){ctx.save();ctx.translate(x+tw,y);ctx.scale(-1,1);ctx.drawImage(b,0,0,tw,h);ctx.restore();}else ctx.drawImage(b,x,y,tw,h);}},
  bg(port,scroll){const di=G.di,n=ART.dn[di],D=DISTRICTS[di],bm=ART.bm;ctx.fillStyle='#000';
    if(port){const b=bm['bg-'+n+'-phone'];if(!b){ART.warm(di);ctx.fillRect(0,0,PW_,PH_);return;}this.cover(b,PW_,PH_);return;}
    ART.paintReady(di);const b=bm['bg-'+n];if(!b){ctx.fillRect(0,0,W,H);return;}
    this.tile(b,0,H,scroll,.03);
    const far=bm['ly-far-'+n],mid=bm['ly-mid-'+n],nr=bm['ly-near-'+D.near];
    if(far){const fh=W*far.height/far.width;this.tile(far,H-60-fh,fh,scroll,.03);}
    if(mid)this.tile(mid,H-340,310,scroll,.3,0,.4);   // W224: the mid strip a step brighter than the sky (three planes)
    if(nr)this.tile(nr,H-130,130,scroll,1.1,1);},   // the near strip keeps full value (play-layer depth)
  sheet(e){const M=ENEMY_ART[FOEART.id(e)];if(!M||e.type==='gate')return null;const m=M.native?{s:M.s||'e'+e.type,k:M.k||4.2}:FOEART.map(e);if(!m||!m.s)return null;
    const b='ship-'+m.s+'/',v=e.arm&&ART.ANIM.s[b+'volley']&&ART.anim(b+'volley'),key=b+(v?'volley':'flame');if(!ART.ANIM.s[key]||!ART.anim(key))return null;ART.anim(b+'death');return{m,key};},
  foe(e,t){const q=this.sheet(e);if(!q)return false;const{m,key}=q,s=ART.ANIM.s[key],fw=s[2],mn=this.pl()*(this.ph?.8:.72),w=clamp(m.w||e.r*(m.k||4.2),Math.max(this.K*fw*.8,mn),Math.max(this.K*fw*1.25,mn)),sc=w/fw,rot=m.rot?m.rot(e,t):0;   // W224/W227: an enemy is >= .8 x the player's length on the phone, .72 x on PC
    ctx.save();ctx.translate(e.x,e.y);if(rot)ctx.rotate(rot);if(m.gnd)ctx.translate(0,e.r-sc*s[3]/2);
    if(this.HALO)this.pool(1,w*.45,0,sc*s[3]);if(!this.lit(key,(e.t||0)+eb_(e),sc,rot))ART.drawAnim(ctx,key,(e.t||0)+eb_(e),0,0,sc,false);ctx.restore();
    e._fs=sc;e._fa=FOEART.fr;e._fk=FOEART.fr;return true;},
  BR:{'ship-echarger':3.2},   // W233: the charger's art is the darkest foe sheet (probe: 2.5 on a busy backdrop); a longer value lift for it only
  HUE:{'ship-eturret':-30},   // W231: gold is the pickups' hue; the brass gunship family turns copper-red (the enemy-shot family)
  PF:'saturate(1.3) brightness(3.5)',   // W231: the player's value lift: the clearest actor on the screen (qa/w231probe.js: player contrast >= every foe's)
  HALO:1,   // W224 probe switch (qa/w224probe.js measures the sprite without its halo)
  get LD(){const d=1.5/S;return wcv!==cv?[d,d]:[d,-d];},   // the key light (top-right pink neon) in world units: the phone world is turned a quarter
  cel(key,sc,kd){const o=ART.aS(key),b0=o&&ART.anim(key);if(!b0)return null;const m=o.m,w=m[2],h=m[3],cw=Math.max(1,Math.round(w*sc*S)),C=this.CC||(this.CC=new Map()),k=key+'|'+cw+kd;let q=C.get(k);if(q)return q;   // W224: one cached strip per sheet, drawn size and kind: h = soft dark halo, b = warm value pass (W227: a warm key, the family of the enemy shots, so threats are the warmest and lightest actors), r = neon rim tint
    const ch=Math.max(1,Math.round(h*cw/w)),p=kd==='h'?Math.ceil(Math.max(cw,ch)*.12)+3:kd==='r'?2:0,fw=cw+2*p,fh=ch+2*p,c=document.createElement('canvas');c.width=fw*m[0];c.height=fh;const g=c.getContext('2d');g.imageSmoothingQuality='high';
    g.filter=kd==='h'?`brightness(0) blur(${Math.max(1.5,p/2.2)}px)`:kd==='b'?`sepia(.35) saturate(2)${this.HUE[key.split('/')[0]]?` hue-rotate(${this.HUE[key.split('/')[0]]}deg)`:''} brightness(${this.BR[key.split('/')[0]]||2.2})`:kd==='B'?'sepia(.25) saturate(1.4)':kd==='p'?this.PF:'none';   /* W231: B = the boss (milder: the 'b' pass clipped it to white), p = the player lift */for(let j=0;j<m[0];j++)g.drawImage(b0,j*w,0,w,h,j*fw+p,p,cw,ch);g.filter='none';
    if(kd==='r'){const d=g.getImageData(0,0,c.width,c.height),a=d.data;for(let i=0;i<a.length;i+=4){a[i]=255;a[i+1]=110;a[i+2]=225;}g.putImageData(d,0,0);}
    if(kd==='B'){const d=g.getImageData(0,0,c.width,c.height),a=d.data,L=new Uint8Array(256);for(let v=0;v<256;v++)L[v]=Math.round(255*(1-Math.pow(1-v/255,3)));for(let i=0;i<a.length;i+=4){a[i]=L[a[i]];a[i+1]=L[a[i+1]];a[i+2]=L[a[i+2]];}g.putImageData(d,0,0);}   // W231: the boss lift is a curve (darks and mids up, highlights kept under white), not brightness(): its hit / attack frames clipped
    C.set(k,q={c,fw,fh,p,cw});return q;},
  dcel(key,t,sc,kd,ox,oy,al){const q=this.cel(key,sc,kd);if(!q)return false;const o=ART.aS(key),m=o.m,u=m[2]*sc/q.cw,i=ART.aframe(key,t);if(al!=null)ctx.globalAlpha=al;
    ctx.drawImage(q.c,i*q.fw,0,q.fw,q.fh,ox-m[4]*sc-q.p*u,oy-m[5]*sc-q.p*u,q.fw*u,q.fh*u);ctx.globalAlpha=1;return true;},
  lit(key,t,sc,rot){if(!this.cel(key,sc,'b'))return false;const[lx,ly]=this.LD,c=Math.cos(-rot||0),s_=Math.sin(-rot||0);   // W224: halo behind, neon rim on the light side, then the brightened sprite
    if(this.HALO){this.dcel(key,t,sc,'h',0,0,.9);ctx.globalCompositeOperation='lighter';this.dcel(key,t,sc,'r',lx*c-ly*s_,lx*s_+ly*c,.3);ctx.globalCompositeOperation='source-over';}
    return this.dcel(key,t,sc,'b',0,0);},
  pool(o,x,y,hh){const n='fx-engine',P_=this.PL||(this.PL={});let b=P_[o];   // W224: the engine light spilling on the haze behind a ship (the owner's fx-engine, blurred once; orange for enemies)
    if(!b){const s0=ART.bm[n];if(!s0){if(s0===undefined)ART.load(n);return;}b=P_[o]=document.createElement('canvas');b.width=s0.width+80;b.height=s0.height+80;const g=b.getContext('2d');g.filter='blur(12px)';g.drawImage(s0,40,40);
      if(o){const d=g.getImageData(0,0,b.width,b.height),a=d.data;for(let i=0;i<a.length;i+=4){const l=Math.max(a[i],a[i+1],a[i+2])/255;a[i]=255*l;a[i+1]=130*l;a[i+2]=40*l;}g.putImageData(d,0,0);}}   // enemies: warm orange, the family of their shots (threat = warm)
    const w=hh*3,h=hh*1.5;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.3;ctx.drawImage(b,x-w/2,y-h/2,w,h);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';},
  player(t){if(G.dead)return;const id=shipDef().id,key='ship-'+id+'/flame',k=this.K*this.PK;ctx.save();ctx.translate(P.x,P.y);ctx.rotate(P.tilt);
    const s=ART.ANIM.s[key],L=s?s[2]*k:56,e=ART.bm['fx-engine'];   // W215: owner engine light (fx-engine, painted on black) under the tail, steady flicker, no ring or halo
    if(e){const w=L*(.42+.04*Math.sin(t*38)),h=w*e.height/e.width*1.3;ctx.globalCompositeOperation='lighter';ctx.drawImage(e,-L*.22-w,-h/2,w,h);ctx.globalCompositeOperation='source-over';}else if(e===undefined)ART.load('fx-engine');
    if(s)this.pool(0,-L*.5,0,s[3]*k);if(s&&this.HALO){this.dcel(key,t,k,'h',0,0,.9);this.dcel(key,t,k,'h',0,0,.9);this.dcel(key,t,k,'h',0,0,.9);}   // W231: the foes' dark halo behind the player too
    if(RET.sprites&&SPR.shipOn(id)&&s)this.rim(key,t,k,s);   // the player one notch above the enemies' texel scale (1.35x, inside the 1.5x band): it must read first
   else ART.put(ART.sp('spr-ship-'+id,this.K*520*this.PK),0,0);
    ctx.restore();},
  rim(key,t,k,s){   // W215: the player's frame with a 1 px light outline (the benchmark shooters outline the player ship so it reads on any backdrop; no glow, no ring)
    const m=ctx.getTransform(),ps=Math.hypot(m.a,m.b),fw=s[2]*k*ps,fh=s[3]*k*ps,O=this.O||(this.O=[document.createElement('canvas'),document.createElement('canvas')]),w=Math.ceil(fw+8),h=Math.ceil(fh+8);
    for(const c of O)if(c.width<w||c.height<h){c.width=Math.max(c.width,w);c.height=Math.max(c.height,h);}
    const a=O[0].getContext('2d'),b=O[1].getContext('2d'),cw=O[0].width,ch=O[0].height;a.setTransform(1,0,0,1,0,0);a.clearRect(0,0,cw,ch);a.setTransform(ps,0,0,ps,cw/2,ch/2);{const c0=ctx;ctx=a;try{if(!this.dcel(key,t,k,'p',0,0))ART.drawAnim(a,key,t,0,0,k,false);}finally{ctx=c0;}}   /* W231: the lifted 'p' frame */
    b.setTransform(1,0,0,1,0,0);b.clearRect(0,0,cw,ch);b.globalCompositeOperation='source-over';b.drawImage(O[0],0,0);b.globalCompositeOperation='source-in';b.fillStyle='#ffc8f2';b.fillRect(0,0,cw,ch);b.globalCompositeOperation='source-over';
    const d=Math.max(1.2*(window.devicePixelRatio||1),1.6)/ps,W_=cw/ps,H_=ch/ps;
    const[lx,ly]=this.LD,r=-P.tilt,l=Math.hypot(lx,ly),ux=(lx*Math.cos(r)-ly*Math.sin(r))/l,uy=(lx*Math.sin(r)+ly*Math.cos(r))/l;   // W224: a rim light from the neon side only (was a light outline all round: the sticker edge)
    for(const f of[1,.7])for(const a of[-.6,0,.6])ctx.drawImage(O[1],d*f*(ux*Math.cos(a)-uy*Math.sin(a))-W_/2,d*f*(ux*Math.sin(a)+uy*Math.cos(a))-H_/2,W_,H_);
    ctx.drawImage(O[0],-W_/2,-H_/2,W_,H_);},
  hot(n,v){const b=ART.bm[n];if(!b){if(b===undefined)ART.load(n);return null;}const c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d');x.filter=v==='w'?'saturate(0) brightness(1.6)':'hue-rotate(-55deg) saturate(2.6) brightness(1.2)';x.drawImage(b,0,0);return ART.bm[n+'~'+v]=c;},   // ~o orange-red, ~w white (made once per picture)
  pic(n,x,y,w,ang,hk){const v=/~([ow])$/.exec(n),b=v?(ART.bm[n]||this.hot(n.slice(0,-2),v[1])):ART.bm[n];if(!b&&v)return false;if(!b){if(b===undefined)ART.load(n);return false;}const h=w*b.height/b.width*(hk||1);ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(x,y);if(ang)ctx.rotate(ang);ctx.drawImage(b,-w/2,-h/2,w,h);ctx.restore();return true;},
  bm(kd){const B=this.BM||(this.BM={});if(B[kd])return B[kd];const s0=ART.bm['fx-shot-std'];if(!s0){if(s0===undefined)ART.load('fx-shot-std');return null;}   // W224: the owner's standard streak as a mask (alpha = its light), three layers like a bullet-curtain engine: dark rim, cyan edge, white core
    const p=kd==='r'?10:0,c=document.createElement('canvas');c.width=s0.width+2*p;c.height=s0.height+2*p;const g=c.getContext('2d');g.drawImage(s0,p,p);const d=g.getImageData(0,0,c.width,c.height),a=d.data;
    for(let i=0;i<a.length;i+=4){const l=Math.max(a[i],a[i+1],a[i+2])/255;a[i+3]=255*Math.min(1,kd==='c'?Math.max(0,l-.45)*2.4:l*1.6);if(kd==='r'){a[i]=10;a[i+1]=6;a[i+2]=20;}else if(kd==='e'){a[i]=60;a[i+1]=225;a[i+2]=255;}else{a[i]=a[i+1]=a[i+2]=255;}}
    g.putImageData(d,0,0);if(kd==='r'){const r=document.createElement('canvas');r.width=c.width;r.height=c.height;const x=r.getContext('2d');x.filter='blur(3px)';x.drawImage(c,0,0);x.drawImage(c,0,0);return B[kd]=r;}return B[kd]=c;},
  bolt(x,y,L,T,a){const r=this.bm('r'),e=this.bm('e'),c=this.bm('c'),g=ART.bm['fx-shot-std'];if(!r||!e||!c)return false;ctx.save();ctx.translate(x,y);if(a)ctx.rotate(a);
    ctx.globalAlpha=.6;ctx.drawImage(r,-L*.6,-T*1.5,L*1.2,T*3);ctx.globalAlpha=1;ctx.drawImage(e,-L/2,-T,L,T*2);ctx.drawImage(c,-L*.46,-T*.75,L*.92,T*1.5);
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.3;ctx.drawImage(g,-L*.6,-T*1.4,L*1.2,T*2.8);ctx.restore();return true;},   // normal blend; only a small additive glow on top
  shots(){for(const b of G.pb){const l=b.hv?64:b.ec?44:b.big||b.pf?56:48;   // W224: player shots are 44-64 px white / cyan bolts along the flight axis (no fan, no bank tilt), the same for every weapon
      this.bolt(b.x,b.y,l/S,(b.hv?4.5:3.5)/S,0);}   // T = half the 7-9 px body
    for(const b of G.eb){const a=Math.atan2(b.vy||0,b.vx||-1);
      if(b.hm>0&&this.pic('fx-orb-homing',b.x,b.y,b.r*3.6))continue;
      if(b.k==='n'&&this.pic('fx-bullet-shell',b.x,b.y,b.r*7,a,.38)){this.pic('fx-bullet-needle~w',b.x,b.y,b.r*6,a,1.4);continue;}   // W219: needle = the owner's orange shell drawn as a long bolt (the shell family reads best) with the needle, whitened once, as its hot core
      if(b.k==='r'&&this.pic('fx-bullet-rocket',b.x,b.y,b.r*6,a))continue;
      if(b.k&&this.pic('fx-bullet-shell',b.x,b.y,b.r*4,a))continue;
      this.pic('fx-bullet-enemy',b.x,b.y,b.r*3.4);}},
  coin(p,y,t){const k='pk-coin/spin',s=ART.ANIM.s[k];if(!s||!ART.anim(k))return false;ART.drawAnim(ctx,k,t+p.bob,p.x,y,22/s[2],false);return true;},   // W219: shards as the owner's spinning coin: it reads as a pickup, not a bullet
  pickups(t){for(const p of G.pk){const y=p.y+Math.sin(p.bob)*3;if(p.t==='pw'){const o=ART.sp('pk-'+p.k,40);if(!o&&ART.bm['pk-'+p.k]===undefined)ART.load('pk-'+p.k);if(o){ctx.save();ctx.translate(p.x,y);ART.put(o,0,0,Math.sin(t*2+p.bob)*.08);ctx.restore();}continue;}   // W219: the owner's power-up picture only (no hex, ring, glow or caption)
      if(p.t==='shard'&&this.coin(p,y,t))continue;ctx.save();ctx.translate(p.x,y);pkPaint(p,t);ctx.restore();}},
  draw(t,dt){const PT=wcv!==cv;for(const c of[vctx,wctx]){c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';}
    if(PT){ctx=vctx;ctx.setTransform(VS,0,0,VS,0,0);this.bg(true,G.scroll);ctx=wctx;ctx.setTransform(S,0,0,S,0,0);ctx.clearRect(0,0,W,H);}
    else{ctx=vctx;ctx.setTransform(S,0,0,S,0,0);}
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    const sh=G.shake;ctx.save();if(sh)ctx.translate(rnd(-sh,sh)*.5,rnd(-sh,sh)*.5);
    if(!PT)this.bg(false,G.scroll);
    this.pickups(t);
    FOEART.fr++;for(const e of G.en)if(!this.foe(e,t))drawEnemy(e,t);   // bosses / gate pylons: the old draw (no single sheet here yet)
    if(ART.gh.length)ART.ghosts();
    this.shots();
    for(const q of ART.fx)if(!q._h&&/muzzle/.test(q.k)){q.sz*=.5;q._h=1;}   // W219: the player's muzzle burst at half size (render-only fx list)
    ART.fxDraw();
    this.player(t);
    if(G.empT>0)AH.pic('fx-pw-bomb-pulse',(0.6-G.empT)*2800,P.x,P.y,0,Math.min(1,G.empT*2.2));
    ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    if(PT){ctx=vctx;ctx.setTransform(0,-1,1,0,0,cv.height);ctx.drawImage(wcv,0,0);ctx.setTransform(VS,0,0,VS,0,0);if(running&&!HUDOFF)drawHUDP(t);}
    else if(running&&!HUDOFF){drawHUD(t);const s=G.pw,n=s?s.act.length+(s.drop?1:0):0,k=n>1?.36:.5;PW.hud(t,345,H-6-20*k-46*k*Math.max(0,n-1),k);}}};   // W227: smaller, so even a stack of cards stays inside the band. W224: the power-up panel sits inside the bottom HUD band (top >= H-78, the hull box's top), right of the hull box (was in the sky at y 112)
