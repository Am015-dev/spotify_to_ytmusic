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
  FOEF:'brightness(2) contrast(1.15) saturate(1.1)',SHIPF:'brightness(1.3) saturate(1.15)',   // W302 (17h value lift only): enemies off the dark city by value, the player one step brighter still
  WARM:/^(beat|disc|flame|orbit|shell|storm|swarm)$/,   // W215: weapon shot pictures in the enemy-shot hues (lime / yellow / orange): drawn as the cool standard shot instead
  dim(b,v){const D=this.DM||(this.DM=new Map());let c=D.get(b);if(c)return c;   // W219: backdrop layers only, once per picture: brightness .65, saturate .85, so the play layer is the brightest thing
    c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d');x.filter=`brightness(${v||.65}) saturate(.85)`;x.drawImage(b,0,0);D.set(b,c);return c;},
  cover(b,w,h){b=this.dim(b,.55);   // the phone painting is brighter than the PC strips: a lower value lands it at the PC's level
   const s=Math.max(w/b.width,h/b.height),sw=w/s,sh=h/s,m=ctx.getTransform(),dw=Math.round(w*m.a),dh=Math.round(h*m.d),C=this.CV||(this.CV={});   // W241: the still backdrop is cropped and scaled once per size, then copied 1:1 each frame
   if(dw>1&&dh>1&&dw*dh<4e6){if(C.b!==b||C.w!==dw||C.h!==dh){const cv_=C.cv||(C.cv=document.createElement('canvas'));cv_.width=dw;cv_.height=dh;const g=cv_.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(b,(b.width-sw)/2,(b.height-sh)/2,sw,sh,0,0,dw,dh);g.fillStyle='rgba(12,8,24,.22)';g.fillRect(0,0,dw,dh);C.b=b;C.w=dw;C.h=dh;}
     const q=ctx.imageSmoothingQuality;ctx.imageSmoothingQuality='low';ctx.drawImage(C.cv,0,0,w,h);ctx.imageSmoothingQuality=q;return;}
   ctx.drawImage(b,(b.width-sw)/2,(b.height-sh)/2,sw,sh,0,0,w,h);ctx.fillStyle='rgba(12,8,24,.22)';ctx.fillRect(0,0,w,h);},
  pan(b,w,h,off){b=this.dim(b,.55);const X=1.35,s=Math.max(w/b.width,h*X/b.height),sw=w/s,sh=h*X/s,m=ctx.getTransform(),dw=Math.round(w*m.a),dh=Math.round(h*m.d),eh=Math.round(dh*X),ex=eh-dh,C=this.PC||(this.PC={});   // W250: the phone sky is cropped once at 1.35x height, then a window of it slides 1:1 (far plane, ratio .1, no flip, no seam: it pans back and forth)
   if(dw<2||dh<2||dw*eh>4e6){this.cover(b,w,h);return;}
   if(C.b!==b||C.w!==dw||C.h!==dh){const c=C.cv||(C.cv=document.createElement('canvas'));c.width=dw;c.height=eh;const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(b,(b.width-sw)/2,(b.height-sh)/2,sw,sh,0,0,dw,eh);g.fillStyle='rgba(12,8,24,.22)';g.fillRect(0,0,dw,eh);C.b=b;C.w=dw;C.h=dh;}
   const p=ex>0?off*m.d%(2*ex):0,y=Math.round(p>ex?2*ex-p:p),q=ctx.imageSmoothingQuality;ctx.imageSmoothingQuality='low';ctx.drawImage(C.cv,0,ex-y,dw,dh,0,0,w,h);ctx.imageSmoothingQuality=q;},
  tile(b,y,h,scroll,par,keep){if(!keep)b=this.dim(b);const tw=h*b.width/b.height,off=(scroll*par)%(2*tw);   // every other tile mirrored: no seam
    for(let j=Math.floor(off/tw);j*tw-off<W;j++){const x=j*tw-off;if(x+tw<=0)continue;
      if(j&1){ctx.save();ctx.translate(x+tw,y);ctx.scale(-1,1);ctx.drawImage(b,0,0,tw,h);ctx.restore();}else ctx.drawImage(b,x,y,tw,h);}},
  bg(port,scroll){const di=G.di,n=ART.dn[di],D=DISTRICTS[di],bm=ART.bm;ctx.fillStyle='#000';
    if(port){const b=bm['bg-'+n+'-phone'];if(!b){ART.warm(di);ctx.fillRect(0,0,PW_,PH_);return;}this.pan(b,PW_,PH_,scroll*.1);return;}   // W250: three planes, ratios .1 / .3 / .6: far sky pans, mid rooftops fainter, near rooftops larger and faster
    ART.paintReady(di);const b=bm['bg-'+n];if(!b){ctx.fillRect(0,0,W,H);return;}
    this.tile(b,0,H,scroll,.03);
    const far=bm['ly-far-'+n],mid=bm['ly-mid-'+n],nr=bm['ly-near-'+D.near];
    if(far){const fh=W*far.height/far.width;this.tile(far,H-60-fh,fh,scroll,.03);}
    if(mid)this.tile(mid,H-340,310,scroll,.3);
    if(nr)this.tile(nr,H-130,130,scroll,1.1,1);},   // the near strip keeps full value (play-layer depth)
  sheet(e){const M=ENEMY_ART[FOEART.id(e)];if(!M||e.type==='gate')return null;const m=M.native?{s:M.s||'e'+e.type,k:M.k||4.2}:FOEART.map(e);if(!m||!m.s)return null;
    const b='ship-'+m.s+'/',v=e.arm&&ART.ANIM.s[b+'volley']&&ART.anim(b+'volley'),key=b+(v?'volley':'flame');if(!ART.ANIM.s[key]||!ART.anim(key))return null;ART.anim(b+'death');return{m,key};},
  foe(e,t){const q=this.sheet(e);if(!q)return false;const{m,key}=q,s=ART.ANIM.s[key],fw=s[2],fl=this.pl()*(wcv!==cv?.68:.55),w=clamp(m.w||e.r*(m.k||4.2),Math.max(this.K*fw*.8,fl),Math.max(this.K*fw*1.25,fl)),sc=w/fw,rot=m.rot?m.rot(e,t):0;
    ctx.save();ctx.translate(e.x,e.y);if(rot)ctx.rotate(rot);if(m.gnd)ctx.translate(0,e.r-sc*s[3]/2);this.ink(sc*s[2]+8,sc*s[3]+8,()=>{ctx.filter=this.FOEF;ART.drawAnim(ctx,key,(e.t||0)+eb_(e),0,0,sc,false);ctx.filter='none';},.6,key+'|'+Math.round(sc*20)+'|'+this.fk(key,(e.t||0)+eb_(e)));ctx.restore();
    e._fs=sc;e._fa=FOEART.fr;e._fk=FOEART.fr;return true;},
  player(t){if(G.dead)return;const id=shipDef().id,key='ship-'+id+'/flame',k=this.K*this.PK;ctx.save();ctx.translate(P.x,P.y);ctx.rotate(P.tilt);
    const s=ART.ANIM.s[key],L=s?s[2]*k:56,e=ART.bm['fx-engine'];   // W215: owner engine light (fx-engine, painted on black) under the tail, steady flicker, no ring or halo
    if(e){const w=L*((wcv!==cv?.6:.46)+.04*Math.sin(t*38)),h=w*e.height/e.width*1.3;ctx.globalCompositeOperation='lighter';ctx.drawImage(e,-L*.22-w,-h/2,w,h);ctx.drawImage(e,-L*.22-w*.6,-h*.3,w*.6,h*.6);ctx.globalCompositeOperation='source-over';}   // W302: engine light larger on phone and a hot core pass: the ship is found by its light firstelse if(e===undefined)ART.load('fx-engine');
    if(RET.sprites&&SPR.shipOn(id)&&s)this.rim(key,t,k,s);   // the player one notch above the enemies' texel scale (1.35x, inside the 1.5x band): it must read first
   else ART.put(ART.sp('spr-ship-'+id,this.K*520*this.PK),0,0);
    ctx.restore();},
  rim(key,t,k,s){this.ink(s[2]*k+8,s[3]*k+8,()=>{ctx.filter=this.SHIPF;ART.drawAnim(ctx,key,t,0,0,k,false);ctx.filter='none';},.9,key+'|'+Math.round(k*20)+'|'+this.fk(key,t));},   // W215: the player's frame with a 1 px outline (no glow, no ring)
  fk(key,t){const i=ART.aframe(key,t);return i+'.'+Math.round(ART.aP*4);},   // W255: sheet frame + crossfade step, the cache key part of an animated actor (looping time would never repeat)
  ink(w_,h_,fn,lit,ck){   // W244: ONE ink pass for every actor (player, enemies, boss, pickups): fn draws the actor at the local origin (current transform = its place); we add the same outline weight, one soft ink shadow offset down-right (key light upper left) and a thin warm lit edge on the upper left. No blur: offset copies of one silhouette, built into pooled canvases.
    const m=ctx.getTransform(),ps=Math.hypot(m.a,m.b),O=this.O||(this.O=[document.createElement('canvas'),document.createElement('canvas'),document.createElement('canvas')]),w=Math.ceil(w_*ps+8),h=Math.ceil(h_*ps+8);
    if(!(ps>0)||w*h>4e6){fn();return;}
    const CC=this.IC||(this.IC=new Map()),CK=ck&&ck+'|'+Math.round(ps*50)+'|'+Math.round(Math.atan2(m.b,m.a)*12)+'|'+lit,hit=CK&&CC.get(CK);   // W255: an actor sheet frame (time in 1/15 s steps, rotation in 1/12 rad steps) is inked once and then copied: the ink pass was 18 canvas ops per actor per frame
    if(hit){ctx.drawImage(hit.cv,0,0,hit.w,hit.h,-hit.W/2,-hit.H/2,hit.W,hit.H);return;}
    for(const c of O)if(c.width<w||c.height<h){c.width=Math.max(c.width,w);c.height=Math.max(c.height,h);}
    const a=O[0].getContext('2d'),b=O[1].getContext('2d'),W_=w/ps,H_=h/ps,o=ctx;
    a.setTransform(1,0,0,1,0,0);a.globalAlpha=1;a.globalCompositeOperation='source-over';a.clearRect(0,0,w,h);a.setTransform(ps,0,0,ps,w/2,h/2);
    ctx=a;try{fn();}finally{ctx=o;}
    b.setTransform(1,0,0,1,0,0);b.globalCompositeOperation='source-over';b.clearRect(0,0,w,h);b.drawImage(O[0],0,0,w,h,0,0,w,h);const pb=window.PB;if(pb)pb.hud++;b.globalCompositeOperation='source-in';b.fillStyle='#07030f';b.fillRect(0,0,w,h);b.globalCompositeOperation='source-over';if(pb)pb.hud--;   // tint fills on the pooled canvases are not play-field shapes (qa/pureprobe.js counts them out)
    
    const T=CK?document.createElement('canvas'):null;let tc=ctx;if(T){T.width=w;T.height=h;tc=T.getContext('2d');tc.setTransform(ps,0,0,ps,w/2,h/2);}
    const d=Math.max(1.2*(window.devicePixelRatio||1),1.6)/ps,ox=3*d,oy=5*d,lx=(ox*m.a+oy*m.b)/ps,ly=(oy*m.a-ox*m.b)/ps,X=-W_/2,Y=-H_/2,im=(c,x,y)=>tc.drawImage(c,0,0,w,h,X+x,Y+y,W_,H_);
    tc.globalAlpha=.4;im(O[1],lx,ly);tc.globalAlpha=1;   // the shadow rotates with the actor so it always falls the same way on screen
    for(const[x,y]of[[-d,0],[d,0],[0,-d],[0,d],[-d*.7,-d*.7],[d*.7,-d*.7],[-d*.7,d*.7],[d*.7,d*.7]])im(O[1],x,y);
    im(O[0],0,0);
    if(lit!==0){const c=O[2].getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.clearRect(0,0,w,h);c.drawImage(O[0],0,0,w,h,0,0,w,h);c.globalCompositeOperation='source-in';c.fillStyle='#ffe6c4';if(pb)pb.hud++;c.fillRect(0,0,w,h);if(pb)pb.hud--;   // upper-left lit edge: the art's own shape minus itself shifted down-right
      c.globalCompositeOperation='destination-out';const sx=ps*d*1.6,cs=m.a/ps,sn=m.b/ps;c.drawImage(O[0],0,0,w,h,sx*.7*(cs+sn),sx*.7*(cs-sn),w,h);c.globalCompositeOperation='source-over';
      tc.globalAlpha=lit||.35;im(O[2],0,0);tc.globalAlpha=1;}
    if(T){const px=(this.IP||0)+w*h;this.IP=px;CC.set(CK,{cv:T,w,h,W:W_,H:H_});for(const[k,e]of CC){if(this.IP<=8e6)break;this.IP-=e.w*e.h;CC.delete(k);}ctx.drawImage(T,0,0,w,h,X,Y,W_,H_);}},
  hot(n,v){const b=ART.bm[n];if(!b){if(b===undefined)ART.load(n);return null;}const c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d');x.filter=v==='w'?'saturate(0) brightness(1.6)':'hue-rotate(-55deg) saturate(2.6) brightness(1.2)';x.drawImage(b,0,0);return ART.bm[n+'~'+v]=c;},   // ~o orange-red, ~w white (made once per picture)
  pic(n,x,y,w,ang,hk){const v=/~([ow])$/.exec(n),b=v?(ART.bm[n]||this.hot(n.slice(0,-2),v[1])):ART.bm[n];if(!b&&v)return false;if(!b){if(b===undefined)ART.load(n);return false;}const h=w*b.height/b.width*(hk||1);ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(x,y);if(ang)ctx.rotate(ang);ctx.drawImage(b,-w/2,-h/2,w,h);ctx.restore();return true;},
  shots(){const ph=wcv!==cv,g=ph?1.4:1;   // W302: phone player shots 1.4x and thicker (owner: 'player bullets are not visible at all'); still under the enemy shots (drawn first)
    for(const b of G.pb){if(b.y<12)continue;const fa=Math.min(b.x>W*.7?1-(b.x-W*.7)/(W*.3):1,1-(Math.hypot(b.x-P.x,b.y-P.y)-W*.55)/(W*.25));if(fa<.05)continue;ctx.globalAlpha=Math.min(1,fa);const a=(b.vx||b.vy)?Math.atan2(b.vy,b.vx):0,wn=b.wid&&!this.WARM.test(b.wid)?'fx-w-'+b.wid+'-bullet':null;   // player shots keep the cool hues (cyan / white / violet); enemy shots own lime to orange
      if(wn&&this.pic(wn,b.x,b.y,44*g,a))continue;
      const n=b.hv?'fx-shot-hv':b.ec?'fx-shot-ec':'fx-shot-std',w=(b.hv?52:b.ec?40:(b.len||(b.big?22:20))*2.4*(b.pf?1.3:1))*g;
      if(this.pic(n,b.x,b.y,w,a,ph?2.4:1.7)&&n==='fx-shot-std')this.pic(n,b.x,b.y,w*.8,a,ph?1.4:1);}   // body thicker, then the core again additively   // the thin standard streak twice (additive): bright enough to read at game size
    ctx.globalAlpha=1;},   // W302: player shots only; enemy shots have ONE owner, PB.ebul (pureboss.js), called from draw() right after this
  draw(t,dt){const PT=wcv!==cv;for(const c of[vctx,wctx]){c.imageSmoothingEnabled=true;c.imageSmoothingQuality='medium';}
    if(PT){ctx=vctx;ctx.setTransform(VS,0,0,VS,0,0);this.bg(true,G.scroll);ctx=wctx;ctx.setTransform(S,0,0,S,0,0);ctx.clearRect(0,0,W,H);}
    else{ctx=vctx;ctx.setTransform(S,0,0,S,0,0);}
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    const sh=G.shake;ctx.save();if(sh)ctx.translate(rnd(-sh,sh)*.5,rnd(-sh,sh)*.5);
    if(!PT)this.bg(false,G.scroll);
    PB.pickups(t);   // W302: pickups have one owner, PB.pickups (pureboss.js)
    FOEART.fr++;for(const e of G.en)if(!this.foe(e,t))drawEnemy(e,t);   // bosses / gate pylons: the old draw (no single sheet here yet)
    if(ART.gh.length)ART.ghosts();
    this.shots();PB.ebul();
    for(const q of ART.fx)if(!q._h&&/muzzle/.test(q.k)){q.sz*=.5;q._h=1;}   // W219: the player's muzzle burst at half size (render-only fx list)
    ART.fxDraw();
    this.player(t);
    if(G.empT>0)AH.pic('fx-pw-bomb-pulse',(0.6-G.empT)*2800,P.x,P.y,0,Math.min(1,G.empT*2.2));
    ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    if(PT){ctx=vctx;ctx.setTransform(0,-1,1,0,0,cv.height);ctx.imageSmoothingEnabled=false;ctx.drawImage(wcv,0,0);ctx.imageSmoothingEnabled=true;ctx.setTransform(VS,0,0,VS,0,0);if(running&&!HUDOFF)drawHUDP(t);}
    else if(running&&!HUDOFF){drawHUD(t);PW.hud(t);}}};
