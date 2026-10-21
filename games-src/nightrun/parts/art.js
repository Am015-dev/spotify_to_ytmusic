/* ---------- painted art (media/*.webp): loaded once, decoded once (createImageBitmap), pre-scaled to the size they are drawn at ----------
   Everything here has a procedural fallback: until an image is ready (or if it is missing) ART.* returns null/false and the old drawing runs.
   Nothing is filtered or blurred per frame; scaled copies are cached and rebuilt only when the canvas scale S changes. */
const ART={bm:{},sc:{},big:{},bigN:[],S:0,fx:[],hp:0,dead:false,base:'media/',
  dn:['bankenviertel','mainufer','ostend','messe','athina'],
  bossN:['sek-adler','flusskrake','zentral-ice','kronos','bruecken-waechter','schranken-wart','talos','hoplite','tresor-wart','messe-waechter'],
  artK:e=>e.ak!=null?e.ak:e.nm==='TRESOR-WART'?8:e.nm==='MESSE-WÄCHTER'?9:e.k,   // the two mini-bosses with their own paintings
  shipN:['std','tri','hv','ec','swg','syn'],
  enN:['drone','charger','gunship','gate','flank','swarm','mine','turret-base','turret-barrel'],
  fxN:['shot-std','shot-hv','shot-ec','shot-perfect','bullet-enemy','muzzle','hit-spark','explosion-small','explosion-big','explosion-boss','shockwave','engine','shield-link','bullet-shell','bullet-needle','bullet-rocket'],
  pkN:['shard','hp','up','emp','drum','tempo','slow','drop']};
ART.load=n=>{if(n in ART.bm)return;ART.bm[n]=null;const im=new Image();
  im.onload=()=>{const done=b=>{ART.bm[n]=b;};
    /* effects made as light on a solid black square (no alpha): turn the black into transparency once, colours un-premultiplied, so they look right with normal blending and identical when drawn additively */
    if(n.startsWith('fx-')&&!n.startsWith('fx-fuse')){try{const w=im.naturalWidth,h=im.naturalHeight,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);const id=g.getImageData(0,0,w,h),d=id.data;let solid=true,dark=0;for(let i=3;i<d.length;i+=4)if(d[i]<250){solid=false;break;}
      for(const q of [0,w-1,(h-1)*w,h*w-1]){const o=q*4;if(d[o]+d[o+1]+d[o+2]<90)dark++;}
      if(solid&&dark>=3){for(let i=0;i<d.length;i+=4){const m=Math.max(d[i],d[i+1],d[i+2]);if(m<3){d[i+3]=0;continue;}d[i+3]=m;const k=255/m;d[i]=Math.min(255,d[i]*k);d[i+1]=Math.min(255,d[i+1]*k);d[i+2]=Math.min(255,d[i+2]*k);}g.putImageData(id,0,0);done(c);return;}}catch(e){}}
    if(self.createImageBitmap)createImageBitmap(im).then(done,()=>done(im));else done(im);};
  im.onerror=()=>{ART.err[n]=1;};im.src=ART.base+n+'.webp';};
ART.have=n=>!!ART.bm[n];
ART.err={};
ART.frame=()=>{if(Math.abs(S-ART.S)>.01){ART.S=S;ART.sc={};}
  if(running&&P){if(G.dead&&!ART.dead)ART.boom(FXW.bk('explosion-big',null,170),P.x,P.y,170,.6,RET.sprites?SPR.shipDeath():0);else if(!G.dead&&P.hp<ART.hp)ART.boom(FXW.bk('explosion-small',null,76),P.x,P.y,76,.4);ART.hp=P.hp;ART.dead=G.dead;}else ART.dead=false;};        // the canvas scale changed (resize / rotation): scaled copies are rebuilt on demand
/* a copy of image n that is w world units wide, at the pixel size it will be drawn at ({c,w,h}); null while loading */
ART.sp=(n,w,sc)=>{const b=ART.bm[n];if(!b)return null;sc=sc||S;w=Math.max(1,Math.round(w*2)/2);const k=n+'@'+w+'@'+sc;let o=ART.sc[k];if(o)return o;
  const h=w*b.height/b.width,pw=Math.max(1,Math.round(w*sc)),ph=Math.max(1,Math.round(h*sc));
  if(b.width<=pw*1.2)o={c:b,w,h};
  else{const c=document.createElement('canvas');c.width=pw;c.height=ph;const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(b,0,0,pw,ph);o={c,w,h};}
  return ART.sc[k]=o;};
/* the same sprite as a flat colour silhouette (hit flash) or tinted (light-on-black fx: multiply keeps black black) */
ART.sil=(n,w,col)=>{const o=ART.sp(n,w);if(!o)return null;const k='s|'+n+'@'+o.w+'@'+col+'@'+S;let q=ART.sc[k];if(q)return q;
  const c=document.createElement('canvas');c.width=o.c.width;c.height=o.c.height;const g=c.getContext('2d');g.drawImage(o.c,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);
  return ART.sc[k]={c,w:o.w,h:o.h};};
ART.tint=(n,w,col)=>{const o=ART.sp(n,w);if(!o)return null;const k='t|'+n+'@'+o.w+'@'+col+'@'+S;let q=ART.sc[k];if(q)return q;
  const c=document.createElement('canvas');c.width=o.c.width;c.height=o.c.height;const g=c.getContext('2d');g.drawImage(o.c,0,0);g.globalCompositeOperation='multiply';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);
  return ART.sc[k]={c,w:o.w,h:o.h};};
/* the same sprite with its hue turned by deg (one small cached copy: a painted orange orb from the painted lime one) */
ART.hue=(n,w,deg)=>{const o=ART.sp(n,w);if(!o)return null;const k='h|'+n+'@'+o.w+'@'+deg+'@'+S;let q=ART.sc[k];if(q)return q;
  const c=document.createElement('canvas');c.width=o.c.width;c.height=o.c.height;const g=c.getContext('2d');g.drawImage(o.c,0,0);
  try{const id=g.getImageData(0,0,c.width,c.height),d=id.data,a=deg*Math.PI/180,cs=Math.cos(a),sn=Math.sin(a),
    m=[.213+cs*.787-sn*.213,.715-cs*.715-sn*.715,.072-cs*.072+sn*.928,.213-cs*.213+sn*.143,.715+cs*.285+sn*.140,.072-cs*.072-sn*.283,.213-cs*.213-sn*.787,.715-cs*.715+sn*.715,.072+cs*.928+sn*.072];
    for(let i=0;i<d.length;i+=4){const r=d[i],gg=d[i+1],b=d[i+2];d[i]=Math.max(0,Math.min(255,r*m[0]+gg*m[1]+b*m[2]));d[i+1]=Math.max(0,Math.min(255,r*m[3]+gg*m[4]+b*m[5]));d[i+2]=Math.max(0,Math.min(255,r*m[6]+gg*m[7]+b*m[8]));}g.putImageData(id,0,0);}catch(e){}
  return ART.sc[k]={c,w:o.w,h:o.h};};
/* draw centred on x,y (rot in radians, optional) */
ART.put=(o,x,y,rot,al,sx,sy)=>{if(!o)return false;if(al!=null)ctx.globalAlpha=al;
  if(rot||sx||sy){ctx.save();ctx.translate(x,y);if(rot)ctx.rotate(rot);if(sx||sy)ctx.scale(sx||1,sy||1);ctx.drawImage(o.c,-o.w/2,-o.h/2,o.w,o.h);ctx.restore();}
  else ctx.drawImage(o.c,x-o.w/2,y-o.h/2,o.w,o.h);
  if(al!=null)ctx.globalAlpha=1;return true;};
ART.d=(n,w,x,y,rot,al)=>ART.put(ART.sp(n,w),x,y,rot,al);
/* W34 (ASSETS-NEEDED-2.md): a picture only when the id is REAL art listed in media/ready.json (ART.rd, shapes.js), else false = the caller draws its code shape. fx-w34-* are light on black (keyed in ART.load) and go on additively */
ART.img=id=>ART.rd&&ART.rd.has(id+'.webp')&&ART.bm[id]||null;
ART.pic=(id,w,x,y,rot,al)=>{if(!ART.img(id))return false;const o=ART.sp(id,w);if(!o)return false;if(id.startsWith('fx-')){ctx.save();ctx.globalCompositeOperation='lighter';ART.put(o,x,y,rot,al);ctx.restore();return true;}return ART.put(o,x,y,rot,al);};
/* sprite with a hit flash on top: fl = a flash is on (colour col, strength a) */
ART.dflash=(n,w,x,y,rot,fl,col,a)=>{const o=ART.sp(n,w);if(!o)return false;ART.put(o,x,y,rot);
  if(fl){const s=ART.sil(n,w,col||'#ffffff');if(s)ART.put(s,x,y,rot,a==null?.8:a);}return true;};
/* ----- effects: light on black, drawn additively, scaled up while they fade ----- */
ART.boom=(k,x,y,sz,life,delay)=>{const f=ART.fx;if(f.length>=24)f.shift();f.push({k,x,y,sz,t:-(delay||0),m:life});};   // delay: seconds before it shows (a sprite clip plays first)
ART.fxDraw=()=>{const f=ART.fx;if(!f.length)return;ctx.globalCompositeOperation='lighter';
  for(let i=f.length-1;i>=0;i--){const q=f[i];q.t+=FD;if(q.t<0)continue;const sk=RET.sprites&&ART.fxSheet(q.k),so=sk&&ART.aS(sk),ml=so?so.tot+SPR.fxTail:q.m,k=q.t/ml;if(k>=1){f.splice(i,1);continue;}
    if(sk&&ART.anim(sk)){ART.drawAnim(ctx,sk,q.t,q.x,q.y,q.sz/ART.ANIM.c[sk].bw,false,Math.min(1,(ml-q.t)/SPR.fxTail)*(q.k==='hit-spark'?.9:1));continue;}   // the sheet plays its frames, with a short fade after the last one
    const b=ART.bm['fx-'+q.k];if(!b)continue;const grow=q.k==='muzzle'||q.k==='hit-spark'||/-(muzzle|hit)$/.test(q.k)?.8+.4*k:.55+.65*k,w=q.sz*grow,h=w*b.height/b.width;
    ctx.globalAlpha=Math.min(1,(1-k)*1.6)*(q.k==='hit-spark'?.9:1);ctx.drawImage(b,q.x-w/2,q.y-h/2,w,h);}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';};
ART.wave=(x,y,r,a)=>{const b=ART.bm['fx-shockwave'];if(!b)return false;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(0,Math.min(1,a));ctx.drawImage(b,x-r,y-r,r*2,r*2);ctx.restore();return true;};
/* ----- painted backdrops ----- */
ART.bigGet=(k,mk)=>{let o=ART.big[k];if(o)return o;o=mk();if(!o)return null;ART.big[k]=o;ART.bigN.push(k);while(ART.bigN.length>10)delete ART.big[ART.bigN.shift()];return o;};
ART.bgOf=(di,port,u,w,h,dim)=>{const n='bg-'+ART.dn[di]+(port?'-phone':'');const b=ART.bm[n];if(!b)return null;
  const fb=port?null:ART.bm['ly-far-'+ART.dn[di]];       // the painted far skyline is baked into the backdrop tile: one layer, no extra blit per frame
  return ART.bigGet(n+'|'+Math.round(u*100)+(fb?'f':''),()=>{const c=document.createElement('canvas');c.width=Math.round(w*u);c.height=Math.round(h*u);const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(b,0,0,c.width,c.height);
    if(fb){const fh=w*fb.height/fb.width;g.globalAlpha=.75;g.drawImage(fb,0,(h-60-fh)*u,c.width,fh*u);g.globalAlpha=1;}
    g.fillStyle='rgba(6,3,16,'+dim+')';g.fillRect(0,0,c.width,c.height);
    if(!port){const q=g.createLinearGradient(0,(h-220)*u,0,h*u),a=DISTRICTS[di].a;q.addColorStop(0,a+'00');q.addColorStop(1,a+'38');g.fillStyle=q;g.fillRect(0,(h-220)*u,c.width,220*u);}   // the ground haze is part of the backdrop (it used to be a gradient fill over the whole picture every frame)
    return{c,w,h};});};
/* the mid skyline strip with the same haze painted onto its own pixels (source-atop): haze over (mid over sky) = (haze over mid) over (haze over sky), so the picture is unchanged */
ART.midHaze=(di,n,h)=>{const o=ART.strip('ly-mid-'+n,h);if(!o)return null;const k='mh|'+n+'@'+o.w+'@'+S;let q=ART.sc[k];if(q)return q;
  const c=document.createElement('canvas');c.width=Math.max(1,Math.round(o.w*S));c.height=Math.max(1,Math.round(o.h*S));const g=c.getContext('2d');g.drawImage(o.c,0,0,c.width,c.height);
  const y0=H-30-o.h,a=DISTRICTS[di].a,gr=g.createLinearGradient(0,(H-220-y0)*S,0,(H-y0)*S);gr.addColorStop(0,a+'00');gr.addColorStop(1,a+'38');g.globalCompositeOperation='source-atop';g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);
  return ART.sc[k]={c,w:o.w,h:o.h};};
/* tile a scaled strip horizontally; every other tile is mirrored, so there is never a seam */
ART.tiles=(o,y,scroll,par,al)=>{const tw=o.w,off=(scroll*par)%(2*tw),j0=Math.floor(off/tw);ctx.globalAlpha=al;
  for(let j=j0;j*tw-off<W;j++){const x=j*tw-off;if(x+tw<=0)continue;
    if(j&1){ctx.save();ctx.translate(x+tw,y);ctx.scale(-1,1);ctx.drawImage(o.c,0,0,tw,o.h);ctx.restore();}else ctx.drawImage(o.c,x,y,tw,o.h);}
  ctx.globalAlpha=1;};
ART.strip=(n,h)=>{const b=ART.bm[n];return b?ART.sp(n,h*b.width/b.height):null;};
ART.paintReady=di=>{const n=ART.dn[di];if(n&&!ART.bm['ly-mid-'+n])ART.warm(di);return !!(n&&ART.bm['bg-'+n]&&ART.bm['ly-far-'+n]&&ART.bm['ly-mid-'+n]);};
ART.paintBG=(bg,t,scroll)=>{const D=bg.D,di=DISTRICTS.indexOf(D);bg._p=false;if(!ART.paintReady(di)||!ART.bm['ly-near-'+D.near])return false;
  const sky=ART.bgOf(di,false,S,W,H,.52);if(!sky)return false;const n=ART.dn[di];
  const far=ART.bm['ly-far-'+n],mid=ART.midHaze(di,n,310),nr=ART.strip('ly-near-'+D.near,130);if(!far||!mid||!nr)return false;
  const so=(scroll*.03)%(2*W);ctx.globalAlpha=1;
  for(let j=Math.floor(so/W);j*W-so<W;j++){const x=j*W-so;if(j&1){ctx.save();ctx.translate(x+W,0);ctx.scale(-1,1);ctx.drawImage(sky.c,0,0,W,H);ctx.restore();}else ctx.drawImage(sky.c,x,0,W,H);}
  ART.tiles(mid,H-30-mid.h,scroll,.3,.88);
  ART.tiles(nr,H-nr.h,scroll,1.1,.92);bg._p=true;return true;};
ART.paintP=(bg,scroll)=>{const di=DISTRICTS.indexOf(bg.D);if(!ART.bm['bg-'+ART.dn[di]+'-phone'])ART.warm(di);const o=ART.bgOf(di,true,VS,PW_,PH_,.5);if(!o)return false;
  const off=(scroll*.1)%(2*PH_),j0=Math.floor(off/PH_);
  for(let j=j0;j*PH_-off<PH_;j++){const y=PH_-(j*PH_-off)-PH_;      // moves down the screen like the roofs
    if(j&1){ctx.save();ctx.translate(0,y+PH_);ctx.scale(1,-1);ctx.drawImage(o.c,0,0,PW_,PH_);ctx.restore();}else ctx.drawImage(o.c,0,y,PW_,PH_);}
  return true;};
/* painted districts get a stub instead of the procedural skyline (building one is a 20-80 ms hitch); the real one is built only if a painted file failed to load */
ART.stubOk=(di,port)=>{const D=DISTRICTS[di];return !!ART.dn[di]&&!(port?D.nostubP:D.nostub);};
ART.failed=(di,port)=>{const n=ART.dn[di],D=DISTRICTS[di];return !!(ART.err['bg-'+n+(port?'-phone':'')]||(!port&&(ART.err['ly-mid-'+n]||ART.err['ly-near-'+D.near])));};
ART.warm=di=>{const n=ART.dn[di];if(!n)return;ART.load('bg-'+n);ART.load('ly-far-'+n);ART.load('ly-mid-'+n);ART.load('ly-near-'+DISTRICTS[di].near);if(wcv!==cv){ART.load('bg-'+n+'-phone');ART.load('ly-phone-'+n);}};
/* ----- boss intro portrait (drawn above the banner) ----- */
ART.portrait=(k,cx,y,sz,al)=>{const b=ART.bm['boss-'+ART.bossN[k]];if(!b)return;const px=Math.max(64,Math.round(sz*S*1.5)),key='pt|'+k+'|'+px;let o=ART.sc[key];
  if(!o){const c=document.createElement('canvas');c.width=c.height=px;const g=c.getContext('2d'),r=px/2;g.imageSmoothingQuality='high';   // a deliberate round badge: feathered edge, dark vignette, neon rim (never a bare square crop)
    g.save();g.beginPath();g.arc(r,r,r-3,0,7);g.clip();g.drawImage(b,0,0,px,px);const v=g.createRadialGradient(r,r,r*.55,r,r,r);v.addColorStop(0,'rgba(5,3,12,0)');v.addColorStop(1,'rgba(5,3,12,.85)');g.fillStyle=v;g.fillRect(0,0,px,px);g.restore();
    g.strokeStyle='#ff3040';g.lineWidth=Math.max(2,px/48);g.shadowColor='#ff3040';g.shadowBlur=px/20;g.beginPath();g.arc(r,r,r-3-g.lineWidth/2,0,7);g.stroke();o=ART.sc[key]=c;}
  ctx.save();ctx.globalAlpha=al;ctx.drawImage(o,cx-sz/2,y,sz,sz);ctx.restore();};
/* ----- start-up: the gameplay sprites first, bosses and the rest of the districts one at a time while the title is up ----- */
{for(const n of ART.shipN)ART.load('spr-ship-'+n);for(const n of ART.enN)ART.load('spr-en-'+n);for(const n of ART.fxN)ART.load('fx-'+n);for(const n of ART.pkN)ART.load('pk-'+n);
  ART.warm(0);
  const rest=[];for(const n of ART.bossN){rest.push('spr-boss-'+n);rest.push('boss-'+n);}
  let i=0;const step=()=>{if(i<rest.length)ART.load(rest[i++]);else if(i<rest.length+DISTRICTS.length){ART.warm(i++-rest.length);}else return;setTimeout(step,350);};setTimeout(step,1500);}
NR.on('kill',({e,boss})=>{
  if(boss){const bx=e.x,by=e.y,dl=RET.sprites?SPR.bossDefeat(e):0;for(let i=0;i<5;i++)G.delayed.push({t:dl+i*.16,f:()=>ART.boom(FXW.bk(i===4?'explosion-boss':'explosion-big',e,i===4?320:170),bx+rnd(-40,40),by+rnd(-40,40),i===4?320:170,.6)});return;}
  {const sz=e.type==='gunship'?150:e.type==='mine'?90:Math.max(54,e.r*3.6);ART.boom(FXW.bk(e.type==='gunship'||e.type==='mine'?'explosion-big':'explosion-small',e,sz),e.x,e.y,sz,.42);}});
NR.on('fire',f=>{if(f.x!=null&&ART.fx.length<16)ART.boom(FXW.mz('muzzle'),f.x+10,f.y,34,.09);});
{const _b=banner;banner=function(a,b,warn,t){_b(a,b,warn,t);if(warn&&G.boss&&!G.boss.dead&&G.boss.k!=null)G.banner.pic=ART.artK(G.boss);};}   // boss intro / phase banners carry the boss portrait
{const _e=enterDistrict;enterDistrict=function(i){ART.warm(i);ART.warm(nextDi(i).di);return _e.apply(this,arguments);};}
/* the scaled copies of the next backdrop are built in calm moments, never in the middle of a fight */
setInterval(()=>{if(document.hidden||!G||(running&&!calmNow()))return;ART.frame();const port=wcv!==cv;
  for(const di of[G.di,nextDi(G.di).di]){if(!ART.paintReady(di))continue;const n=ART.dn[di];
    if(port)ART.bgOf(di,true,VS,PW_,PH_,.5);else{ART.bgOf(di,false,S,W,H,.52);ART.midHaze(di,n,310);ART.strip('ly-near-'+DISTRICTS[di].near,130);}}},700);
/* ---------- animated strip sheets (media/anim/<who>/<act>-strip.webp, one row of frames; sizes, fps, anchors, hold times and calibration are bundled by build.py as ART.ANIM, so there is no fetch at run time).
   RET.sprites (default on; ?sprites=0 = the stills exactly as before). ART.anim / ART.aframe / ART.drawAnim are the loader (HANDOFF-SPRITES.md section 1; "aframe" because ART.frame is the per-frame tick);
   SPR.* wires the bosses and the player ships. Every path returns false/null until its sheet is decoded or when it is missing, so the old drawing runs. Step 2 (weapon fx, explosions, pickups, enemy ships, on-foot, props) hooks in here with ART.drawAnim. ---------- */
ART.ANIM=__ANIM__;
ART.as={};ART.aDone=false;ART.aP=0;ART.aT=0;                // aDone / aP / aT: set by ART.aframe (a one-shot reached its end; progress 0..1 and seconds inside the frame)
ART.LOOPA=new Set(['idle','run','flame','glow','loop','spin','hover']);   // every other act is a one-shot: it stops on its last frame
ART.aS=key=>{let o=ART.as[key];if(o!==undefined)return o;const m=ART.ANIM.s[key];if(!m)return ART.as[key]=null;   // per-sheet record, built once: cumulative frame end times (smoothing.json holds at the sheet fps)
  const act=key.slice(key.lastIndexOf('/')+1),hd=ART.ANIM.sm.holds[act],n=m[0],cum=new Float32Array(n);let s=0;for(let i=0;i<n;i++){s+=(hd&&hd.length===n?hd[i]:1)/m[1];cum[i]=s;}
  return ART.as[key]={m,act,cum,tot:s,loop:ART.LOOPA.has(act),xf:ART.ANIM.sm.crossfade.actions.indexOf(act)>=0};};
/* the decoded strip for key ('boss-kronos/idle'), or null while it loads / when it is not listed in ready.json / with the flag off */
ART.anim=key=>{if(!RET.sprites)return null;const n='anim/'+key+'-strip';if(!ART.rd||!ART.rd.has(n+'.webp'))return null;const b=ART.bm[n];if(b)return b;if(!(n in ART.bm))ART.load(n);return null;};
/* frame index at t seconds since the act began */
ART.aframe=(key,t)=>{const o=ART.aS(key);ART.aDone=false;ART.aP=0;ART.aT=0;if(!o)return 0;const n=o.m[0];let u=t>0?t:0;
  if(o.loop)u%=o.tot;else if(u>=o.tot){ART.aDone=true;ART.aP=1;return n-1;}
  for(let i=0;i<n;i++)if(u<o.cum[i]){const a=i?o.cum[i-1]:0;ART.aT=u-a;ART.aP=ART.aT/(o.cum[i]-a);return i;}
  return n-1;};
/* one cell, its anchor on x,y; sc = world units per sheet px; flip mirrors around the anchor; sy = extra vertical squash about the anchor; idle / flame cross-fade into the next frame (smoothing.json) */
ART.drawAnim=(c,key,t,x,y,sc,flip,al,sy)=>{const o=ART.aS(key),b0=o&&ART.anim(key);if(!b0)return false;const i=ART.aframe(key,t),p=ART.aP,m=o.m,w=m[2],h=m[3],sv=sc*(sy||1),X=ART.ANIM.sm.crossfade,
    cf=o.xf&&p>X.from&&(o.loop||i+1<m[0])?(p-X.from)/(1-X.from)*X.max_alpha:0,ga=c.globalAlpha;
  let b=b0,cw=w,ch=h;const ts=sc*S;       // sheets are drawn ~3-5x smaller than they are: a copy at the drawn pixel size is built once per sheet and canvas scale (like ART.sp), so the blit is 1:1 and the downscale is smooth
  if(ts<.75){cw=Math.max(1,Math.round(w*ts));const k='a|'+key+'@'+cw;let q=ART.sc[k];
    if(!q){ch=Math.max(1,Math.round(h*cw/w));const cv_=document.createElement('canvas');cv_.width=cw*m[0];cv_.height=ch;const g=cv_.getContext('2d');g.imageSmoothingQuality='high';for(let j=0;j<m[0];j++)g.drawImage(b0,j*w,0,w,h,j*cw,0,cw,ch);q=ART.sc[k]={c:cv_,h:ch};}
    b=q.c;ch=q.h;}
  if(flip){c.save();c.translate(x,y);c.scale(-1,1);x=0;y=0;}
  const dx=x-m[4]*sc,dy=y-m[5]*sv;if(al!=null)c.globalAlpha=al*ga;
  c.drawImage(b,i*cw,0,cw,ch,dx,dy,w*sc,h*sv);
  if(cf>0){c.globalAlpha=(al==null?1:al)*ga*cf;c.drawImage(b,((i+1)%m[0])*cw,0,cw,ch,dx,dy,w*sc,h*sv);}
  if(flip)c.restore();c.globalAlpha=ga;return true;};
ART.gh=[];      // clips that outlive their object (boss defeat, ship death): {key,x,y,k,t}
ART.ghosts=()=>{const g=ART.gh;for(let i=g.length-1;i>=0;i--){const q=g[i],o=ART.aS(q.key);q.t+=FD;if(!o||q.t>o.tot+.2){g.splice(i,1);continue;}ART.drawAnim(ctx,q.key,q.t,q.x,q.y,q.k,false);}};
const SPR={_sq:1,_di:-1};
/* ----- bosses: idle / attack / hit / defeat. Sheets face left like the stills; the body is drawn as wide as the still was (calibration bw), the frame bottom sits where the still's bottom did (+ the idle gap), so the feet do not move ----- */
SPR.boss=(e,nm,wd,by,tl,fl)=>{const cb=ART.ANIM.c['boss-'+nm],st=ART.bm['spr-boss-'+nm];if(!cb||!st||e.labPose)return false;const base='boss-'+nm+'/',ik=base+'idle';
  if(!ART.anim(ik)){return false;}ART.anim(base+'attack');ART.anim(base+'hit');ART.anim(base+'defeat');
  if(e.fireT>0)e.fireT=Math.max(0,e.fireT-FD);e._st=(e._st||0)+FD;const T=e._st,A=UIK.boss[nm];   // (the grid path ticked these; the sheets do now)
  let want='idle';
  if(e.ph!==undefined&&(e.arm||e.fireT>0)&&ART.anim(base+'attack'))want='attack';
  else if(e._sa==='hit'&&T-e._s0<ART.aS(base+'hit').tot)want='hit';
  else if(fl&&T>=(e._hc||0)&&ART.anim(base+'hit'))want='hit';
  if(want!==e._sa){e._sa=want;e._s0=T;if(want==='hit')e._hc=T+ART.aS(base+'hit').tot+.6;}
  const key=base+want,k=wd/cb.bw,y=by+wd*st.height/st.width/2+cb.gap*k,tt=T-e._s0,sm=ART.ANIM.sm;
  if(A){let dw=wd*A.kw,dh=dw*A.ch/A.cw;if(ART.artK(e)===6){dh=e.r*3.6*A.kh;dw=dh*A.cw/A.ch;}e._dh=dh;e._dw=dw;}
  if(!rotMode&&A&&A.move==='ground')e.y=UIK.groundY()-(e._dh||130)/2;   // a walker stands on the road line this very frame (bossMove sets the same value on the next step): the road moves when the LAB panel opens or the window changes
  const i=ART.aframe(key,tt);let sy=1;const sq=sm.squash.frames[want];if(sq&&sq.indexOf(i)>=0&&ART.aT<sm.squash.ms/1000)sy=1-sm.squash.amount*(1-ART.aT/(sm.squash.ms/1000));
  if(!e._sp)e._sp={base:'',y:0,k:1};e._sp.base=base;e._sp.y=y;e._sp.k=k;
  ctx.save();if(tl){ctx.translate(0,by);ctx.rotate(tl);ctx.translate(0,-by);}
  ART.drawAnim(ctx,key,tt,0,y,k,false,null,sy);
  if(fl){ctx.globalCompositeOperation='lighter';ART.drawAnim(ctx,key,tt,0,y,k,false,sm.hitstop.flash_white*.5,sy);}   // the hit flash stays on top
  ctx.restore();return true;};
/* a boss that just died: its defeat clip plays once where it stood; returns the seconds the explosion waits */
SPR.bossDefeat=e=>{const p=e._sp;if(!p||!ART.anim(p.base+'defeat'))return 0;const key=p.base+'defeat';ART.gh.push({key,x:e.x,y:e.y+p.y,k:p.k,t:0});return Math.min(1.2,ART.aS(key).tot);};
/* ----- player ships: flame (ship + jet, replaces fx-engine) and death. The frame centre goes where calibration puts the nose where the still's nose was ----- */
SPR.shipOn=id=>{ART.anim('ship-'+id+'/death');return !!(ART.ANIM.c['ship-'+id]&&ART.anim('ship-'+id+'/flame'));};
SPR.ship=(c,id,t,bob)=>{const cb=ART.ANIM.c['ship-'+id],bk=ART.ANIM.sm.ship_bank,f=Math.min(1,Math.abs(P.tilt)/(bk.tilt_deg*Math.PI/180));
  SPR._sq+=((1-f*(1-bk.squash_y))-SPR._sq)*Math.min(1,FD*1000/bk.ease_ms);                 // banking: the existing tilt, plus a squash while the ship moves up / down
  return ART.drawAnim(c,'ship-'+id+'/flame',t,cb.ox,bob+cb.oy,cb.k,false,null,SPR._sq);};
SPR.shipDeath=()=>{const id=shipDef().id,cb=ART.ANIM.c['ship-'+id],key='ship-'+id+'/death';if(!cb||!ART.anim(key))return 0;ART.gh.push({key,x:P.x+cb.ox,y:P.y+cb.oy,k:cb.k,t:0});return ART.aS(key).tot;};
/* ----- weapon fx (muzzle / impact), explosions (burst), small fx (spark, hit-confirm, shield glow) and pickups (spin). Each effect keeps its old key; ART.fxSheet maps it to the sheet, 0 when there is none.
   Sizes: calibration bw (content width in sheet px) so a sheet is drawn as wide as the still it replaces. Per-weapon 'beam' sheets stay unwired: the player's shots are small sprites (FXW.bullet), a 392 px beam would not fit them.
   debris / ground-dust have no hook yet (nothing draws them as stills either). ----- */
SPR.fxTail=.08;
ART.fxs={};
ART.fxSheet=k=>{let s=ART.fxs[k];if(s!==undefined)return s;let m;s=0;
  if(k==='hit-spark')s='fx-spark/burst';else if(k==='hitconfirm')s='fx-hitconfirm/burst';
  else if((m=/^boom-(.+)$/.exec(k)))s='fx-boom-'+m[1]+'/burst';
  else if((m=/^w-(\w+)-(muzzle|hit)$/.exec(k)))s='wpn-'+m[1]+'/'+(m[2]==='hit'?'impact':'muzzle');
  if(s&&!(ART.ANIM.s[s]&&ART.ANIM.c[s]))s=0;return ART.fxs[k]=s;};
SPR.PK={shard:'pk-coin/spin',hp:'pk-health/spin'};
/* a pickup coin: sheet drawn about the origin, w world units wide (the still's size); false = draw the still */
SPR.pk=(k,w)=>{const key=RET.sprites&&SPR.PK[k];if(!key||!ART.ANIM.c[key]||!ART.anim(key))return false;return ART.drawAnim(ctx,key,G.t,0,0,w/ART.ANIM.c[key].bw,false);};
/* a shield is up: the glow loops around the ship */
SPR.shield=()=>{const key='fx-shield/glow';if(!RET.sprites||!ART.ANIM.c[key]||!ART.anim(key))return false;ctx.save();ctx.globalCompositeOperation='lighter';ART.drawAnim(ctx,key,G.t,P.x,P.y,96/ART.ANIM.c[key].bw,false,.6);ctx.restore();return true;};
SPR.warmFx=()=>{for(const k of['fx-boom-small-fire/burst','fx-boom-medium-fire/burst','fx-boom-large-fire/burst','fx-spark/burst','fx-hitconfirm/burst','fx-shield/glow','pk-coin/spin','pk-health/spin'])ART.anim(k);
  try{for(const id of WP.eq)if(id){ART.anim('wpn-'+id+'/muzzle');ART.anim('wpn-'+id+'/impact');}}catch(e){}};
/* load on demand: the chosen ship's sheets and the three newer hulls' stills shortly after start, each district's boss a few seconds after the district begins */
setTimeout(()=>{if(!RET.sprites)return;for(const n of['drift','lancer','nova'])ART.load('spr-ship-'+n);try{SPR.shipOn(shipDef().id);}catch(e){}SPR.warmFx();},2500);
SPR.warmBoss=nm=>{for(const a of['idle','attack','hit','defeat'])ART.anim('boss-'+nm+'/'+a);ART.anim('fx-boom-boss-a/burst');ART.anim('fx-boom-boss-b/burst');SPR.warmFx();};
NR.on('tick',()=>{if(!RET.sprites||!G.live)return;const b=G.boss;if(b&&!b._sl){b._sl=1;const nm=ART.bossN[ART.artK(b)];if(nm)SPR.warmBoss(nm);}      // a boss on screen: its sheets start loading the moment it spawns, two seconds before it stops
  if(G.di===SPR._di)return;SPR._di=G.di;const nm=ART.bossN[DISTRICTS[G.di].boss];if(nm)setTimeout(()=>SPR.warmBoss(nm),3500);});
