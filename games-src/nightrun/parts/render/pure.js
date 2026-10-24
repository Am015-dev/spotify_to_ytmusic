// PURPOSE: ?pure=1: the flight frame is only the owner's pictures drawn as they are (no grade, scanlines, vignette, glows, rings, tints, play-field text)
// FLAG: purelook (?pure=1, off by default; RET.pure is the music flag in puremusic.js, so this one has its own name)
// TEST: look checked on 390x763 and 1440x860 frames (games-src/nightrun/review-shots/W214)
/* ---------- W214 (owner, 24 Oct 2026: "they CAN blend well; it's your shitty work that makes it look so ugly").
   render() (c.js) hands the whole flight frame to PURL.draw when the flag is on. Drawn, in order: the district backdrop and its painted layers
   (bg, far, mid, near) at full strength with the old parallax, owner pickup art, every ship from its untinted sheet at ONE texel scale
   (PURL.K world units per sheet px, a size clamp of 0.8-1.25x keeps the game's big / small ships), death clips, owner bullet pictures (painted on black, so added with 'lighter' like the fx sheets),
   owner fx sheets, then the minimal HUD at the edges. Not drawn: scanlines + vignette, colour grade / veil / haze, glows, rings, telegraphs,
   arming circles, hit flashes, tier glow, screen flash / glitch, floating text, edge pulses. Bosses and gate pylons have no single sheet
   drawn here yet: they keep the old draw. Gameplay is not touched (the sim never calls render). ---------- */
if(RET.purelook===undefined)RET.purelook=/[?&]pure=1/.test(location.search);
const PURL=window.PURL={K:90/520,
  cover(b,w,h){const s=Math.max(w/b.width,h/b.height),sw=w/s,sh=h/s;ctx.drawImage(b,(b.width-sw)/2,(b.height-sh)/2,sw,sh,0,0,w,h);},
  tile(b,y,h,scroll,par){const tw=h*b.width/b.height,off=(scroll*par)%(2*tw);   // every other tile mirrored: no seam
    for(let j=Math.floor(off/tw);j*tw-off<W;j++){const x=j*tw-off;if(x+tw<=0)continue;
      if(j&1){ctx.save();ctx.translate(x+tw,y);ctx.scale(-1,1);ctx.drawImage(b,0,0,tw,h);ctx.restore();}else ctx.drawImage(b,x,y,tw,h);}},
  bg(port,scroll){const di=G.di,n=ART.dn[di],D=DISTRICTS[di],bm=ART.bm;ctx.fillStyle='#000';
    if(port){const b=bm['bg-'+n+'-phone'];if(!b){ART.warm(di);ctx.fillRect(0,0,PW_,PH_);return;}this.cover(b,PW_,PH_);return;}
    ART.paintReady(di);const b=bm['bg-'+n];if(!b){ctx.fillRect(0,0,W,H);return;}
    this.tile(b,0,H,scroll,.03);
    const far=bm['ly-far-'+n],mid=bm['ly-mid-'+n],nr=bm['ly-near-'+D.near];
    if(far){const fh=W*far.height/far.width;this.tile(far,H-60-fh,fh,scroll,.03);}
    if(mid)this.tile(mid,H-340,310,scroll,.3);
    if(nr)this.tile(nr,H-130,130,scroll,1.1);},
  sheet(e){const M=ENEMY_ART[FOEART.id(e)];if(!M||e.type==='gate')return null;const m=M.native?{s:M.s||'e'+e.type,k:M.k||4.2}:FOEART.map(e);if(!m||!m.s)return null;
    const b='ship-'+m.s+'/',v=e.arm&&ART.ANIM.s[b+'volley']&&ART.anim(b+'volley'),key=b+(v?'volley':'flame');if(!ART.ANIM.s[key]||!ART.anim(key))return null;ART.anim(b+'death');return{m,key};},
  foe(e,t){const q=this.sheet(e);if(!q)return false;const{m,key}=q,s=ART.ANIM.s[key],fw=s[2],w=clamp(m.w||e.r*(m.k||4.2),this.K*fw*.8,this.K*fw*1.25),sc=w/fw,rot=m.rot?m.rot(e,t):0;
    ctx.save();ctx.translate(e.x,e.y);if(rot)ctx.rotate(rot);if(m.gnd)ctx.translate(0,e.r-sc*s[3]/2);ART.drawAnim(ctx,key,(e.t||0)+eb_(e),0,0,sc,false);ctx.restore();
    e._fs=sc;e._fa=FOEART.fr;e._fk=FOEART.fr;return true;},
  player(t){if(G.dead)return;const id=shipDef().id,key='ship-'+id+'/flame';ctx.save();ctx.translate(P.x,P.y);ctx.rotate(P.tilt);
    if(RET.sprites&&SPR.shipOn(id))ART.drawAnim(ctx,key,t,0,0,this.K*1.1,false);   // the player at the top of the size band: it must read first
   else ART.put(ART.sp('spr-ship-'+id,this.K*520*1.1),0,0);
    ctx.restore();},
  pic(n,x,y,w,ang){const b=ART.bm[n];if(!b){if(b===undefined)ART.load(n);return false;}const h=w*b.height/b.width;ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(x,y);if(ang)ctx.rotate(ang);ctx.drawImage(b,-w/2,-h/2,w,h);ctx.restore();return true;},
  shots(){for(const b of G.pb){const a=(b.vx||b.vy)?Math.atan2(b.vy,b.vx):0,wn=b.wid?'fx-w-'+b.wid+'-bullet':null;
      if(wn&&this.pic(wn,b.x,b.y,30,a))continue;
      this.pic(b.hv?'fx-shot-hv':b.ec?'fx-shot-ec':b.pf?'fx-shot-perfect':'fx-shot-std',b.x,b.y,b.hv?46:b.ec?30:b.pf?32:(b.len||(b.big?22:20))*1.2,a);}
    for(const b of G.eb){const a=Math.atan2(b.vy||0,b.vx||-1);
      if(b.hm>0&&this.pic('fx-orb-homing',b.x,b.y,b.r*3.6))continue;
      if(b.k==='n'&&this.pic('fx-bullet-needle',b.x,b.y,b.r*6.4,a))continue;
      if(b.k==='r'&&this.pic('fx-bullet-rocket',b.x,b.y,b.r*6,a))continue;
      if(b.k&&this.pic('fx-bullet-shell',b.x,b.y,b.r*4,a))continue;
      this.pic('fx-bullet-enemy',b.x,b.y,b.r*3.4);}},
  pickups(t){for(const p of G.pk){const y=p.y+Math.sin(p.bob)*3;if(p.t==='pw'){PW.pickup(p,y,t);continue;}ctx.save();ctx.translate(p.x,y);pkPaint(p,t);ctx.restore();}},
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
    ART.fxDraw();
    this.player(t);
    if(G.empT>0)AH.pic('fx-pw-bomb-pulse',(0.6-G.empT)*2800,P.x,P.y,0,Math.min(1,G.empT*2.2));
    ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    if(PT){ctx=vctx;ctx.setTransform(0,-1,1,0,0,cv.height);ctx.drawImage(wcv,0,0);ctx.setTransform(VS,0,0,VS,0,0);if(running&&!HUDOFF)drawHUDP(t);}
    else if(running&&!HUDOFF){drawHUD(t);PW.hud(t);}}};
