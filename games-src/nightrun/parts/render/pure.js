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
const PURL=window.PURL={K:90/520,get PK(){return wcv!==cv?1.6:1.3;},   // W215/W219: player 1.6x the enemies' texel scale on the phone, 1.3x on PC
  pl(){const s=ART.ANIM.s['ship-'+shipDef().id+'/flame'];return(s?s[2]:260)*this.K*this.PK;},   // the player's drawn length (world units)
  WARM:/^(?!(arc|frost|wave)$)/,   // W219 r3: only the cyan weapon pictures stay; every other weapon (warm, pink, violet) is drawn as the white standard streak   // W215: weapon shot pictures in the enemy-shot hues (lime / yellow / orange): drawn as the cool standard shot instead
  dim(b,v,bl){const D=this.DM||(this.DM=new Map());let c=D.get(b);if(c)return c;   // W219: backdrop layers only, once per picture: brightness .65, saturate .85, so the play layer is the brightest thing
    c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d');x.filter=`blur(${bl||2}px) brightness(${v||.6}) saturate(.7)`   /* W215c: far planes soft, darker, less saturated: they read as distance */;x.drawImage(b,0,0);D.set(b,c);return c;},
  cover(b,w,h){b=this.dim(b,.42,1.8);   // the phone painting is brighter than the PC strips: a lower value lands it at the PC's level
   const s=Math.max(w/b.width,h/b.height),sw=w/s,sh=h/s;ctx.drawImage(b,(b.width-sw)/2,(b.height-sh)/2,sw,sh,0,0,w,h);},
  tile(b,y,h,scroll,par,v,bl){b=this.dim(b,v,bl);const tw=h*b.width/b.height,off=(scroll*par)%(2*tw);   // every other tile mirrored: no seam
    for(let j=Math.floor(off/tw);j*tw-off<W;j++){const x=j*tw-off;if(x+tw<=0)continue;
      if(j&1){ctx.save();ctx.translate(x+tw,y);ctx.scale(-1,1);ctx.drawImage(b,0,0,tw,h);ctx.restore();}else ctx.drawImage(b,x,y,tw,h);}},
  bg(port,scroll){const di=G.di,n=ART.dn[di],D=DISTRICTS[di],bm=ART.bm;ctx.fillStyle='#000';
    if(port){const b=bm['bg-'+n+'-phone'];if(!b){ART.warm(di);ctx.fillRect(0,0,PW_,PH_);return;}this.cover(b,PW_,PH_);return;}
    ART.paintReady(di);const b=bm['bg-'+n];if(!b){ctx.fillRect(0,0,W,H);return;}
    this.tile(b,0,H,scroll,.03,.5,3);
    const far=bm['ly-far-'+n],mid=bm['ly-mid-'+n],nr=bm['ly-near-'+D.near];
    if(far){const fh=W*far.height/far.width;this.tile(far,H-60-fh,fh,scroll,.06,.55,2.5);}
    if(mid)this.tile(mid,H-340,310,scroll,.3,.62,1.5);
    if(nr)this.tile(nr,H-130,130,scroll,1.1,.75,1);},   // parallax .03 / .06 / .3 / 1.1; every plane behind the ships is softer and darker than the ships
  sheet(e){const M=ENEMY_ART[FOEART.id(e)];if(!M||e.type==='gate')return null;const m=M.native?{s:M.s||'e'+e.type,k:M.k||4.2}:FOEART.map(e);if(!m||!m.s)return null;
    const b='ship-'+m.s+'/',v=e.arm&&ART.ANIM.s[b+'volley']&&ART.anim(b+'volley'),key=b+(v?'volley':'flame');if(!ART.ANIM.s[key]||!ART.anim(key))return null;ART.anim(b+'death');return{m,key};},
  foe(e,t){const q=this.sheet(e);if(!q)return false;const{m,key}=q,s=ART.ANIM.s[key],fw=s[2],w=clamp(m.w||e.r*(m.k||4.2),Math.max(this.K*fw*.8,this.pl()*.75),Math.max(this.K*fw*1.25,this.pl()*.75)),sc=w/fw,rot=m.rot?m.rot(e,t):0;
    ctx.save();ctx.translate(e.x,e.y);if(rot)ctx.rotate(rot);if(m.gnd)ctx.translate(0,e.r-sc*s[3]/2);this.lit(key,(e.t||0)+eb_(e),sc,s);ctx.restore();
    e._fs=sc;e._fa=FOEART.fr;e._fk=FOEART.fr;return true;},
  player(t){if(G.dead)return;const id=shipDef().id,key='ship-'+id+'/flame',k=this.K*this.PK;ctx.save();ctx.translate(P.x,P.y);ctx.rotate(P.tilt);
    const s=ART.ANIM.s[key],L=s?s[2]*k:56,e=ART.bm['fx-engine'];   // W215: owner engine light (fx-engine, painted on black) under the tail, steady flicker, no ring or halo
    if(e){const w=L*(.42+.04*Math.sin(t*38)),h=w*e.height/e.width*1.3;ctx.globalCompositeOperation='lighter';ctx.drawImage(e,-L*.22-w,-h/2,w,h);ctx.globalCompositeOperation='source-over';}else if(e===undefined)ART.load('fx-engine');
    if(RET.sprites&&SPR.shipOn(id)&&s)this.lit(key,t,k,s);   // the player one notch above the enemies' texel scale (1.35x, inside the 1.5x band): it must read first
   else ART.put(ART.sp('spr-ship-'+id,this.K*520*this.PK),0,0);
    ctx.restore();},
  lit(key,t,k,s){   // W215c: one scene light for every ship, baked once per sheet frame and size: a key light from the upper neon side
    // (soft lift on that side + a thin cyan rim), a slight under-shade on the far side. Never a flat tint; the owner's frame stays underneath.
    const m=ctx.getTransform(),ps=Math.hypot(m.a,m.b),i=ART.aframe(key,t),q=Math.round(k*ps*64),id=key+'|'+i+'|'+q,C=this.LC||(this.LC=new Map());let c=C.get(id);
    if(!c){if(C.size>600)C.clear();const fw=s[2]*k*ps,fh=s[3]*k*ps,w=Math.ceil(fw+8),h=Math.ceil(fh+8);c=document.createElement('canvas');c.width=w;c.height=h;
      const a=c.getContext('2d');a.setTransform(ps,0,0,ps,w/2,h/2);ART.drawAnim(a,key,t,0,0,k,false);a.setTransform(1,0,0,1,0,0);
      const r=document.createElement('canvas');r.width=w;r.height=h;const b=r.getContext('2d'),d=Math.max(1.5,ps*.9);
      b.drawImage(c,0,0);b.globalCompositeOperation='source-in';b.fillStyle='#8ff4ff';b.fillRect(0,0,w,h);b.globalCompositeOperation='destination-out';b.drawImage(c,d*.6,d);   // the rim: silhouette minus itself shifted away from the light
      a.globalCompositeOperation='source-atop';let g=a.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(205,240,255,.30)');g.addColorStop(.45,'rgba(205,240,255,0)');g.addColorStop(.6,'rgba(10,0,30,0)');g.addColorStop(1,'rgba(10,0,30,.38)');
      a.fillStyle=g;a.fillRect(0,0,w,h);a.globalCompositeOperation='lighter';a.drawImage(r,0,0);a.globalCompositeOperation='source-over';C.set(id,c);}
    const W_=c.width/ps,H_=c.height/ps;ctx.drawImage(c,-W_/2,-H_/2,W_,H_);},
  hot(n,v){const b=ART.bm[n];if(!b){if(b===undefined)ART.load(n);return null;}const c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d');x.filter=v==='w'?'saturate(0) brightness(1.6)':'hue-rotate(-55deg) saturate(2.6) brightness(1.2)';x.drawImage(b,0,0);return ART.bm[n+'~'+v]=c;},   // ~o orange-red, ~w white (made once per picture)
  pic(n,x,y,w,ang,hk){const v=/~([ow])$/.exec(n),b=v?(ART.bm[n]||this.hot(n.slice(0,-2),v[1])):ART.bm[n];if(!b&&v)return false;if(!b){if(b===undefined)ART.load(n);return false;}const h=w*b.height/b.width*(hk||1);ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(x,y);if(ang)ctx.rotate(ang);ctx.drawImage(b,-w/2,-h/2,w,h);ctx.restore();return true;},
  shots(){for(const b of G.pb){const a=(b.vx||b.vy)?Math.atan2(b.vy,b.vx):0,wn=b.wid&&!this.WARM.test(b.wid)?'fx-w-'+b.wid+'-bullet':null;   // player shots keep the cool hues (cyan / white / violet); enemy shots own lime to orange
      if(wn&&this.pic(wn,b.x,b.y,44,a))continue;
      const w0=(b.len||(b.big?22:20))*2.4*(b.hv||b.pf?1.3:1),d=Math.hypot(b.x-P.x,b.y-P.y)-24;   // W219 r3: a streak trailing back toward the nose (stateless: the stream starts at the ship)
      const L=clamp(d,w0,170),cx=b.x-Math.cos(a)*L/2,cy=b.y-Math.sin(a)*L/2;
      if(this.pic('fx-shot-std',cx,cy,L,a,1.7*w0/L))this.pic('fx-shot-std',b.x-Math.cos(a)*w0*.4,b.y-Math.sin(a)*w0*.4,w0*.8,a,1);}   // body, then the hot head again additively
    for(const b of G.eb){const a=Math.atan2(b.vy||0,b.vx||-1);
      if(b.hm>0&&this.pic('fx-orb-homing',b.x,b.y,b.r*3.6))continue;
      if(b.k==='n'&&this.pic('fx-bullet-shell',b.x,b.y,b.r*7,a,.38)){this.pic('fx-bullet-needle~w',b.x,b.y,b.r*6,a,1.4);continue;}   // W219: needle = the owner's orange shell drawn as a long bolt (the shell family reads best) with the needle, whitened once, as its hot core
      if(b.k==='r'&&this.pic('fx-bullet-rocket',b.x,b.y,b.r*6,a))continue;
      if(b.k&&this.pic('fx-bullet-shell',b.x,b.y,b.r*4,a))continue;
      this.pic('fx-bullet-enemy',b.x,b.y,b.r*3.4);}},
  coin(p,y,t,x){const k='pk-coin/spin',s=ART.ANIM.s[k];if(!s||!ART.anim(k))return false;ART.drawAnim(ctx,k,t+p.bob,x===undefined?p.x:x,y,22/s[2],false);return true;},   // W219: shards as the owner's spinning coin: it reads as a pickup, not a bullet
  pickups(t){for(const p of G.pk){const y=p.y+Math.sin(p.bob)*3;if(p.t==='pw'){const o=ART.sp('pk-'+p.k,40);if(!o&&ART.bm['pk-'+p.k]===undefined)ART.load('pk-'+p.k);if(o){ctx.save();ctx.translate(p.x,y);ART.put(o,0,0,Math.sin(t*2+p.bob)*.08);ctx.restore();}continue;}   // W219: the owner's power-up picture only (no hex, ring, glow or caption)
      if(p.t==='shard'&&this.coin(p,y,t))continue;ctx.save();ctx.translate(p.x,y);pkPaint(p,t);ctx.restore();}},
  edge(f,rs){ctx.save();ctx.beginPath();for(const r of rs)ctx.rect(...r);ctx.clip();try{f();}finally{ctx.restore();}},   // W219 r3: the HUD draws only in its edge bands (no score pops, chevrons or arcs over play)
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
    for(const q of ART.fx)if(!q._h&&/muzzle/.test(q.k)){q.sz*=.3;q._h=1;}   // W219: the player's muzzle burst at 0.3x size (render-only fx list)
    ART.fxDraw();
    this.player(t);
    if(G.empT>0)AH.pic('fx-pw-bomb-pulse',(0.6-G.empT)*2800,P.x,P.y,0,Math.min(1,G.empT*2.2));
    ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    if(PT){ctx=vctx;ctx.setTransform(0,-1,1,0,0,cv.height);ctx.drawImage(wcv,0,0);ctx.setTransform(VS,0,0,VS,0,0);if(running&&!HUDOFF)this.edge(()=>drawHUDP(t),[[0,0,PW_,62*HK]]);}
    else if(running&&!HUDOFF)this.edge(()=>{drawHUD(t);PW.hud(t);},[[0,0,W,120],[0,H-130,W,130]]);},};
