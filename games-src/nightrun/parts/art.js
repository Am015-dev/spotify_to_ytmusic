/* ---------- painted art (media/*.webp): loaded once, decoded once (createImageBitmap), pre-scaled to the size they are drawn at ----------
   Everything here has a procedural fallback: until an image is ready (or if it is missing) ART.* returns null/false and the old drawing runs.
   Nothing is filtered or blurred per frame; scaled copies are cached and rebuilt only when the canvas scale S changes. */
const ART={bm:{},sc:{},big:{},bigN:[],S:0,fx:[],hp:0,dead:false,base:'media/',
  dn:['bankenviertel','mainufer','ostend','messe','athina'],
  bossN:['sek-adler','flusskrake','zentral-ice','kronos','bruecken-waechter','schranken-wart','talos','hoplite','tresor-wart','messe-waechter'],
  artK:e=>e.nm==='TRESOR-WART'?8:e.nm==='MESSE-WÄCHTER'?9:e.k,   // the two mini-bosses with their own paintings
  shipN:['std','tri','hv','ec','swg','syn'],
  enN:['drone','charger','gunship','gate','flank','swarm','mine','turret-base','turret-barrel'],
  fxN:['shot-std','shot-hv','shot-ec','shot-perfect','bullet-enemy','muzzle','hit-spark','explosion-small','explosion-big','explosion-boss','shockwave','engine','shield-link','bullet-shell','bullet-needle','bullet-rocket'],
  pkN:['shard','hp','up','emp','drum','tempo','slow','drop']};
ART.load=n=>{if(n in ART.bm)return;ART.bm[n]=null;const im=new Image();
  im.onload=()=>{const done=b=>{ART.bm[n]=b;};if(self.createImageBitmap)createImageBitmap(im).then(done,()=>done(im));else done(im);};
  im.onerror=()=>{ART.err[n]=1;};im.src=ART.base+n+'.webp';};
ART.have=n=>!!ART.bm[n];
ART.err={};
ART.frame=()=>{if(Math.abs(S-ART.S)>.01){ART.S=S;ART.sc={};}
  if(running&&P){if(G.dead&&!ART.dead)ART.boom('explosion-big',P.x,P.y,170,.6);else if(!G.dead&&P.hp<ART.hp)ART.boom('explosion-small',P.x,P.y,76,.4);ART.hp=P.hp;ART.dead=G.dead;}else ART.dead=false;};        // the canvas scale changed (resize / rotation): scaled copies are rebuilt on demand
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
/* sprite with a hit flash on top: fl = a flash is on (colour col, strength a) */
ART.dflash=(n,w,x,y,rot,fl,col,a)=>{const o=ART.sp(n,w);if(!o)return false;ART.put(o,x,y,rot);
  if(fl){const s=ART.sil(n,w,col||'#ffffff');if(s)ART.put(s,x,y,rot,a==null?.8:a);}return true;};
/* ----- effects: light on black, drawn additively, scaled up while they fade ----- */
ART.boom=(k,x,y,sz,life)=>{const f=ART.fx;if(f.length>=24)f.shift();f.push({k,x,y,sz,t:0,m:life});};
ART.fxDraw=()=>{const f=ART.fx;if(!f.length)return;ctx.globalCompositeOperation='lighter';
  for(let i=f.length-1;i>=0;i--){const q=f[i];q.t+=FD;const k=q.t/q.m;if(k>=1){f.splice(i,1);continue;}
    const b=ART.bm['fx-'+q.k];if(!b)continue;const grow=q.k==='muzzle'||q.k==='hit-spark'?.8+.4*k:.55+.65*k,w=q.sz*grow,h=w*b.height/b.width;
    ctx.globalAlpha=Math.min(1,(1-k)*1.6)*(q.k==='hit-spark'?.9:1);ctx.drawImage(b,q.x-w/2,q.y-h/2,w,h);}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';};
ART.wave=(x,y,r,a)=>{const b=ART.bm['fx-shockwave'];if(!b)return false;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(0,Math.min(1,a));ctx.drawImage(b,x-r,y-r,r*2,r*2);ctx.restore();return true;};
/* ----- painted backdrops ----- */
ART.bigGet=(k,mk)=>{let o=ART.big[k];if(o)return o;o=mk();if(!o)return null;ART.big[k]=o;ART.bigN.push(k);while(ART.bigN.length>10)delete ART.big[ART.bigN.shift()];return o;};
ART.bgOf=(di,port,u,w,h,dim)=>{const n='bg-'+ART.dn[di]+(port?'-phone':'');const b=ART.bm[n];if(!b)return null;
  const fb=port?null:ART.bm['ly-far-'+ART.dn[di]];       // the painted far skyline is baked into the backdrop tile: one layer, no extra blit per frame
  return ART.bigGet(n+'|'+Math.round(u*100)+(fb?'f':''),()=>{const c=document.createElement('canvas');c.width=Math.round(w*u);c.height=Math.round(h*u);const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(b,0,0,c.width,c.height);
    if(fb){const fh=w*fb.height/fb.width;g.globalAlpha=.75;g.drawImage(fb,0,(h-60-fh)*u,c.width,fh*u);g.globalAlpha=1;}
    g.fillStyle='rgba(6,3,16,'+dim+')';g.fillRect(0,0,c.width,c.height);return{c,w,h};});};
/* tile a scaled strip horizontally; every other tile is mirrored, so there is never a seam */
ART.tiles=(o,y,scroll,par,al)=>{const tw=o.w,off=(scroll*par)%(2*tw),j0=Math.floor(off/tw);ctx.globalAlpha=al;
  for(let j=j0;j*tw-off<W;j++){const x=j*tw-off;if(x+tw<=0)continue;
    if(j&1){ctx.save();ctx.translate(x+tw,y);ctx.scale(-1,1);ctx.drawImage(o.c,0,0,tw,o.h);ctx.restore();}else ctx.drawImage(o.c,x,y,tw,o.h);}
  ctx.globalAlpha=1;};
ART.strip=(n,h)=>{const b=ART.bm[n];return b?ART.sp(n,h*b.width/b.height):null;};
ART.paintReady=di=>{const n=ART.dn[di];if(n&&!ART.bm['ly-mid-'+n])ART.warm(di);return !!(n&&ART.bm['bg-'+n]&&ART.bm['ly-far-'+n]&&ART.bm['ly-mid-'+n]);};
ART.paintBG=(bg,t,scroll)=>{const D=bg.D,di=DISTRICTS.indexOf(D);bg._p=false;if(!ART.paintReady(di)||!ART.bm['ly-near-'+D.near])return false;
  const sky=ART.bgOf(di,false,S,W,H,.52);if(!sky)return false;const n=ART.dn[di];
  const far=ART.bm['ly-far-'+n],mid=ART.strip('ly-mid-'+n,310),nr=ART.strip('ly-near-'+D.near,130);if(!far||!mid||!nr)return false;
  const so=(scroll*.03)%(2*W);ctx.globalAlpha=1;
  for(let j=Math.floor(so/W);j*W-so<W;j++){const x=j*W-so;if(j&1){ctx.save();ctx.translate(x+W,0);ctx.scale(-1,1);ctx.drawImage(sky.c,0,0,W,H);ctx.restore();}else ctx.drawImage(sky.c,x,0,W,H);}
  ART.tiles(mid,H-30-mid.h,scroll,.3,.88);
  const hz=bg.hzG||(bg.hzG=(()=>{const q=ctx.createLinearGradient(0,H-220,0,H);q.addColorStop(0,D.a+'00');q.addColorStop(1,D.a+'38');return q;})());ctx.fillStyle=hz;ctx.fillRect(0,H-220,W,220);
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
  if(boss){const bx=e.x,by=e.y;for(let i=0;i<5;i++)G.delayed.push({t:i*.16,f:()=>ART.boom(i===4?'explosion-boss':'explosion-big',bx+rnd(-40,40),by+rnd(-40,40),i===4?320:170,.6)});return;}
  ART.boom(e.type==='gunship'||e.type==='mine'?'explosion-big':'explosion-small',e.x,e.y,e.type==='gunship'?150:e.type==='mine'?90:Math.max(54,e.r*3.6),.42);});
NR.on('fire',f=>{if(f.x!=null&&ART.fx.length<16)ART.boom('muzzle',f.x+10,f.y,34,.09);});
{const _b=banner;banner=function(a,b,warn,t){_b(a,b,warn,t);if(warn&&G.boss&&!G.boss.dead&&G.boss.k!=null)G.banner.pic=ART.artK(G.boss);};}   // boss intro / phase banners carry the boss portrait
{const _e=enterDistrict;enterDistrict=function(i){ART.warm(i);ART.warm(nextDi(i).di);return _e.apply(this,arguments);};}
/* the scaled copies of the next backdrop are built in calm moments, never in the middle of a fight */
setInterval(()=>{if(document.hidden||!G||(running&&!calmNow()))return;ART.frame();const port=wcv!==cv;
  for(const di of[G.di,nextDi(G.di).di]){if(!ART.paintReady(di))continue;const n=ART.dn[di];
    if(port)ART.bgOf(di,true,VS,PW_,PH_,.5);else{ART.bgOf(di,false,S,W,H,.52);ART.strip('ly-mid-'+n,310);ART.strip('ly-near-'+DISTRICTS[di].near,130);}}},700);
