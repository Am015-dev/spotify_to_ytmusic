// ---------- the sunlit courtyard table (Three.js r158). The scene only mirrors G; it never owns game state. ----------
// Look: product-shot lighting (warm sun key with soft shadows, cool sky fill, rim light, a PMREM "courtyard" environment),
// glazed ceramic tiles (clearcoat, crazing, painted cuerda-seca motifs), terracotta kilns, dual-layer printed boards with
// punched slots, a walnut table on a paved courtyard. High adds bloom, vignette and a colour grade in a small HDR pipeline.
const V3={on:false,t:0,tiles:{},halos:[],ghosts:[],hits:[],boards:{},kilns:[],L:null,hover:null,zoom:1,orbit:{a:0,e:1.2},
  q:'high',qPref:'auto',mats:new Set(),pops:[],popQ:{},post:false,canPost:false,fontOK:0};
const CP=1.08,TSZ=.94,TD=.26,BW=12.4,BH=9.4,KR=1.45;
// ---------- graphics quality: auto (medium on phones/small screens, high on desktop), high, medium, low ----------
const GFX_KEY='sgz_gfx';
const PH=typeof PerfHUD!=='undefined'?PerfHUD:null;
function gfxAuto(){let coarse=false;try{coarse=matchMedia('(pointer:coarse)').matches}catch(e){}return (Math.min(innerWidth,innerHeight)<700||coarse)?'medium':'high'}
function gfxLoadPref(){let v=null;try{v=localStorage.getItem(GFX_KEY)}catch(e){}return ['auto','high','medium','low'].includes(v)?v:'auto'}
function gfxSetPref(v){V3.qPref=v;try{localStorage.setItem(GFX_KEY,v)}catch(e){}applyQuality(v==='auto'?gfxAuto():v)}
function gfxCycle(){const o=['auto','high','medium','low'];gfxSetPref(o[(o.indexOf(V3.qPref)+1)%o.length])}
function gfxLabel(){const n={high:'High',medium:'Medium',low:'Low'};return V3.qPref==='auto'?'Auto · '+n[V3.q]:n[V3.q]}
function applyQuality(q){V3.q=q;if(typeof gfxBtn==='function')try{gfxBtn()}catch(e){}if(!V3.r)return;const r=V3.r;const dpr=window.devicePixelRatio||1;
  const want=Math.min(q==='high'?2:q==='medium'?1.5:1,dpr);r.setPixelRatio(PH?PH.pixelRatio(want):want);
  const sh=q!=='low';const ms=q==='high'?2048:1024;
  if(V3.sun.shadow.mapSize.x!==ms){V3.sun.shadow.mapSize.set(ms,ms);if(V3.sun.shadow.map){V3.sun.shadow.map.dispose();V3.sun.shadow.map=null}}
  if(r.shadowMap.enabled!==sh){r.shadowMap.enabled=sh;for(const m of V3.mats)m.needsUpdate=true}
  V3.post=q==='high'&&V3.canPost;if(V3.motes)V3.motes.visible=q==='high';document.body.classList.toggle('gfx-post',!!V3.post);
  // Low: no clearcoat/iridescence layers (the physical shader drops those branches)
  for(const m of V3.envMats||[])if(m.isMeshPhysicalMaterial){if(m.userData.cc==null){m.userData.cc=m.clearcoat;m.userData.ir=m.iridescence}m.clearcoat=q==='low'?0:m.userData.cc;m.iridescence=q==='low'?0:m.userData.ir}
  const env=q==='low'?null:V3.envTex;for(const m of V3.envMats||[])if(m.envMap!==env){m.envMap=env;m.needsUpdate=true}V3.hemi.intensity=q==='low'?.75:.45;
  resize3D();V3.dirty=3}
// ---------- procedural texture kit ----------
function rng(seed){let a=seed>>>0||1;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function vnoise(seed,gw){const R=rng(seed),g=new Float32Array(gw*gw);for(let i=0;i<g.length;i++)g[i]=R();
  return (x,y)=>{x*=gw;y*=gw;const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const i0=((xi%gw)+gw)%gw,j0=((yi%gw)+gw)%gw,i1=(i0+1)%gw,j1=(j0+1)%gw;const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
    return (g[j0*gw+i0]*(1-u)+g[j0*gw+i1]*u)*(1-v)+(g[j1*gw+i0]*(1-u)+g[j1*gw+i1]*u)*v}}
// fast tileable fBm: each octave is baked into a W x H field once, then sampled (wraps, so f(u,4v) stays seamless)
function NF(w,h,seed,bx,by,oct){const out=new Float32Array(w*h);let amp=.5,tot=0;
  for(let o=0;o<oct;o++){const gx=bx<<o,gy=by<<o;const R=rng(seed+o*101);const g=new Float32Array(gx*gy);for(let i=0;i<g.length;i++)g[i]=R();
    for(let j=0;j<h;j++){const y=j/h*gy,yi=y|0,yf=y-yi,v=yf*yf*(3-2*yf),j0=(yi%gy)*gx,j1=((yi+1)%gy)*gx;
      for(let i=0;i<w;i++){const x=i/w*gx,xi=x|0,xf=x-xi,u=xf*xf*(3-2*xf),i0=xi%gx,i1=(xi+1)%gx;const a=g[j0+i0],b=g[j0+i1],c=g[j1+i0],d=g[j1+i1];out[j*w+i]+=((a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v)*amp}}
    tot+=amp;amp*=.5}for(let i=0;i<out.length;i++)out[i]/=tot;return out}
function fbm(seed,base,oct,W,H){W=W||256;H=H||W;const F=NF(W,H,seed,base,base,oct);return (x,y)=>{let i=Math.floor(x*W)%W,j=Math.floor(y*H)%H;if(i<0)i+=W;if(j<0)j+=H;return F[j*W+i]}}
// CPU-backed 2D canvases: texture generation reads pixels back, and a GPU canvas makes that slow
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;try{c.getContext('2d',{willReadFrequently:true})}catch(e){}return c}
function pxc(w,h,fn){const c=mkCanvas(w,h),x=c.getContext('2d');const im=x.createImageData(w,h),d=im.data;const o=[0,0,0,255];
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){o[3]=255;fn(i,j,o);const k=(j*w+i)*4;d[k]=o[0];d[k+1]=o[1];d[k+2]=o[2];d[k+3]=o[3]}x.putImageData(im,0,0);return c}
function heightOf(c){const w=c.width,h=c.height;const d=c.getContext('2d').getImageData(0,0,w,h).data;const H=new Float32Array(w*h);for(let i=0;i<w*h;i++)H[i]=d[i*4]/255;return H}
function normalCanvas(H,w,h,str,wrap){const c=mkCanvas(w,h),x=c.getContext('2d');const im=x.createImageData(w,h),d=im.data;
  for(let j=0;j<h;j++){const jm=wrap?(j+h-1)%h:Math.max(0,j-1),jp=wrap?(j+1)%h:Math.min(h-1,j+1);for(let i=0;i<w;i++){const im1=wrap?(i+w-1)%w:Math.max(0,i-1),ip=wrap?(i+1)%w:Math.min(w-1,i+1);
    const dx=(H[j*w+ip]-H[j*w+im1])*str,dy=(H[jp*w+i]-H[jm*w+i])*str;const l=1/Math.sqrt(dx*dx+dy*dy+1);const k=(j*w+i)*4;d[k]=(-dx*l*.5+.5)*255;d[k+1]=(dy*l*.5+.5)*255;d[k+2]=(l*.5+.5)*255;d[k+3]=255}}
  x.putImageData(im,0,0);return c}
function texOf(c,srgb,rep){const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=V3.aniso||4;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping}return t}
function canvasTex(w,h,fn){const c=mkCanvas(w,h);fn(c.getContext('2d'),w,h);return texOf(c,true)}
function mat(m){V3.mats.add(m);return m}
// glossy pieces get the environment map; big matte surfaces (table, boards, floor) skip it, which keeps fill-rate cheap
function emat(m){mat(m);(V3.envMats||(V3.envMats=[])).push(m);m.envMap=V3.envTex||null;return m}
function smat(m){V3.mats.add(m);V3.smats.push(m);return m}
const hx=h=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255]};
function rrPath(p,x,y,w,h,r){p.moveTo(x+r,y);p.lineTo(x+w-r,y);p.quadraticCurveTo(x+w,y,x+w,y+r);p.lineTo(x+w,y+h-r);p.quadraticCurveTo(x+w,y+h,x+w-r,y+h);p.lineTo(x+r,y+h);p.quadraticCurveTo(x,y+h,x,y+h-r);p.lineTo(x,y+r);p.quadraticCurveTo(x,y,x+r,y);return p}
function rr2(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
// planar UVs for an extruded shape (caps) and a wrap for its sides; group 0 = caps, group 1 = sides
function extrudeUV(g,capFn,sideFn){const p=g.attributes.position,uv=g.attributes.uv;for(const gr of g.groups){const f=gr.materialIndex===0?capFn:sideFn;for(let i=gr.start;i<gr.start+gr.count;i++){const r=f(p.getX(i),p.getY(i),p.getZ(i));uv.setXY(i,r[0],r[1])}}uv.needsUpdate=true}
// ---------- materials ----------
function makeTextures(){const T=V3.T={};
  // woven linen (board lamination, runner, sack), tileable
  const lw=128,lf=fbm(3,8,2,128);const LH=new Float32Array(lw*lw);for(let j=0;j<lw;j++)for(let i=0;i<lw;i++){const a=Math.sin(i/lw*Math.PI*2*32),b=Math.sin(j/lw*Math.PI*2*32);const warp=((Math.floor(i/4)+Math.floor(j/4))%2)?a:b;LH[j*lw+i]=warp*.5+.5+lf(i/lw,j/lw)*.6}
  T.linenN=texOf(normalCanvas(LH,lw,lw,1.4,true),false,true);
  // walnut planks: colour, roughness, normal. 1024x512 covers 12 x 6 world units
  {const W=1024,H=512,f=fbm(11,4,4,W,H),f2=fbm(23,8,3,W,H),f3=fbm(41,16,2,W,H);const R=rng(5);const pl=[];const n=4,ph=H/n;for(let p=0;p<n;p++)pl.push({h:R(),o:R()*10,j:Math.floor(R()*W)});
    const Hh=new Float32Array(W*H),Rr=new Float32Array(W*H);const dk=[62,36,20],lt=[122,76,44];
    T.woodC=texOf(pxc(W,H,(i,j,o)=>{const p=Math.min(n-1,Math.floor(j/ph)),P=pl[p];const u=i/W,v=j/H,ly=(j-p*ph)/ph;
      const warp=f(u,v)*5+f3(u,v)*.6;const g=Math.sin((ly*7+warp+P.o)*Math.PI*2)*.5+.5;const streak=f2(u,v*4);let t=Math.pow(g,2.5)*.32+streak*.6+.04;
      const tint=.82+P.h*.32;let s=1;const e=Math.min(j-p*ph,(p+1)*ph-1-j);if(e<1.5)s=.42;else if(e<3.5)s=.78;const jd=Math.abs(i-P.j);if(p%2===0&&jd<2)s=Math.min(s,.5);
      o[0]=(dk[0]+(lt[0]-dk[0])*t)*tint*s;o[1]=(dk[1]+(lt[1]-dk[1])*t)*tint*s;o[2]=(dk[2]+(lt[2]-dk[2])*t)*tint*s;const k=j*W+i;Hh[k]=(s<1?(s-1)*.8:0)+g*.05+streak*.05;Rr[k]=s<1?.8:.36+(1-t)*.16}),true,true);
    T.woodR=texOf(pxc(W,H,(i,j,o)=>{const r=Rr[j*W+i]*255;o[0]=o[1]=o[2]=r}),false,true);T.woodN=texOf(normalCanvas(Hh,W,H,5,true),false,true)}
  // terracotta pavers with glazed star inserts: 1024 = 4x4 pavers (8 world units)
  {const W=1024,Q=256,f=fbm(7,8,4,W),f2=fbm(9,64,2,W);const R=rng(8);const tint=[];for(let i=0;i<16;i++)tint.push([.86+R()*.24,R()]);const Hh=new Float32Array(W*W),Rr=new Float32Array(W*W);
    T.floorC=texOf(pxc(W,W,(i,j,o)=>{const qi=Math.floor(i/Q),qj=Math.floor(j/Q),lx=i%Q,ly=j%Q;const e=Math.min(lx,ly,Q-1-lx,Q-1-ly);const tn=tint[qj*4+qi];const n=f(i/W,j/W),m=f2(i/W,j/W);
      const cx=Math.min(lx,Q-lx),cy=Math.min(ly,Q-ly);const star=Math.abs(cx)+Math.abs(cy)<26;const k=j*W+i;
      if(star){const inner=Math.abs(cx)+Math.abs(cy)<14;const c=inner?[240,232,214]:[34,86,128];o[0]=c[0];o[1]=c[1];o[2]=c[2];Hh[k]=.6;Rr[k]=.12;return}
      if(e<6){o[0]=214;o[1]=196;o[2]=160;Hh[k]=0;Rr[k]=.95;return}
      const w=Math.min(1,(e-6)/10);const b=(.78+n*.35)*tn[0]*(.9+.1*w);o[0]=192*b+m*18;o[1]=104*b+m*9;o[2]=62*b+m*6;Hh[k]=.25+.3*w+n*.08;Rr[k]=.8+m*.15}),true,true);
    T.floorR=texOf(pxc(W,W,(i,j,o)=>{o[0]=o[1]=o[2]=Rr[j*W+i]*255}),false,true);T.floorN=texOf(normalCanvas(Hh,W,W,3,true),false,true)}
  // terracotta body for kilns and pots (1024x256, wraps around a lathe): unglazed clay with a white-slip band and cobalt waves
  {const W=1024,H=256,f=fbm(13,8,4,W,H),f2=fbm(17,64,2,W,H);const Hh=new Float32Array(W*H),Rr=new Float32Array(W*H);
    T.clayC=texOf(pxc(W,H,(i,j,o)=>{const u=i/W,v=1-j/H;const n=f(u,v),m=f2(u,v);const k=j*W+i;let c=[158+n*40-m*14,80+n*22-m*8,54+n*14];let r=.88,h=n*.3+m*.15;
      if(v>.13&&v<.31){const wv=(v-.22)*40+Math.sin(u*Math.PI*2*24)*1.6;const band=Math.abs(wv)<.9;const edge=v<.15||v>.29;if(edge){c=[92,48,28]}else if(band){c=[36,74,138]}else{c=[236,224,200]}r=.28;h=.55}
      if(m>.78){c=c.map(x=>x*.6)}o[0]=c[0];o[1]=c[1];o[2]=c[2];Hh[k]=h;Rr[k]=r}),true,true);
    T.clayR=texOf(pxc(W,H,(i,j,o)=>{o[0]=o[1]=o[2]=Rr[j*W+i]*255}),false,true);T.clayN=texOf(normalCanvas(Hh,W,H,2.5,true),false,true)}
  {const f=fbm(44,8,4);const S=256,Hh=new Float32Array(S*S);for(let j=0;j<S;j++)for(let i=0;i<S;i++)Hh[j*S+i]=f(i/S,j/S);T.stoneN=texOf(normalCanvas(Hh,S,S,3,true),false,true)}
  // soft contact shadows
  T.blob=canvasTex(128,128,(x,w)=>{const g=x.createRadialGradient(64,64,4,64,64,62);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(.55,'rgba(0,0,0,.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,w,w)});
  T.sqShadow=canvasTex(128,128,(x,w)=>{x.filter='blur(9px)';x.fillStyle='rgba(0,0,0,.6)';rr2(x,24,24,80,80,14);x.fill();if(x.filter!=='blur(9px)'){x.shadowColor='#000';x.shadowBlur=18;x.fill()}});
  T.spark=canvasTex(64,64,(x,w)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,w);x.fillStyle='rgba(255,255,255,.9)';x.fillRect(31,4,2,56);x.fillRect(4,31,56,2)})}
// ---------- glazed ceramic tiles ----------
function tileTextures(k,R){const S=512,dark=k===0||k===2||k===3;const c=mkCanvas(S,S),x=c.getContext('2d');const jx=(R()-.5)*1.4,jy=(R()-.5)*1.4,jr=(R()-.5)*.02;
  x.fillStyle=TBASE[k];x.fillRect(0,0,S,S);x.save();x.scale(S/100,S/100);
  for(let i=0;i<34;i++){const cx=R()*100,cy=R()*100,r=6+R()*22;const g=x.createRadialGradient(cx,cy,0,cx,cy,r);const w=R()<.5;g.addColorStop(0,w?'rgba(255,255,255,.07)':'rgba(0,0,0,.08)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,100,100)}
  // glaze pools a little darker toward the rim
  const eg=x.createRadialGradient(50,50,30,50,50,72);eg.addColorStop(0,'rgba(0,0,0,0)');eg.addColorStop(1,dark?'rgba(0,0,0,.22)':'rgba(90,50,20,.16)');x.fillStyle=eg;x.fillRect(0,0,100,100);
  // the painted motif: a soft bleed under a crisp coat, then fine manganese cuerda-seca outlines
  x.save();x.translate(50+jx,50+jy);x.rotate(jr);x.translate(-50,-50);
  for(const p of MOTIF[k]){x.globalAlpha=(p.a||1)*.55;x.fillStyle=p.f;x.shadowColor=p.f;x.shadowBlur=5;x.fill(new Path2D(p.d))}x.shadowBlur=0;
  for(const p of MOTIF[k]){x.globalAlpha=(p.a||1)*.92;x.fillStyle=p.f;x.fill(new Path2D(p.d))}
  x.globalAlpha=dark?.22:.3;x.strokeStyle=dark?'#0b0806':'#4a2a14';x.lineWidth=.55;for(const p of MOTIF[k])if(!p.a)x.stroke(new Path2D(p.d));x.restore();x.globalAlpha=1;
  // iron specks and pinholes
  for(let i=0;i<26;i++){x.fillStyle=R()<.7?'rgba(60,30,12,.45)':'rgba(255,255,255,.55)';x.beginPath();x.arc(R()*100,R()*100,.15+R()*.35,0,7);x.fill()}
  // crazing: a fine crackle network, tea-stained on the light glazes
  const cracks=[];for(let i=0;i<16;i++){let px0=R()*100,py0=R()*100,a=R()*6.3;const pts=[[px0,py0]];const L=6+R()*16;for(let s=0;s<L;s++){a+=(R()-.5)*1.3;px0+=Math.cos(a)*2.6;py0+=Math.sin(a)*2.6;pts.push([px0,py0])}cracks.push(pts)}
  x.strokeStyle=dark?'rgba(255,255,255,.07)':'rgba(70,40,15,.16)';x.lineWidth=.28;for(const pts of cracks){x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke()}
  x.strokeStyle=TRIM[k];x.globalAlpha=.8;x.lineWidth=2.2;rr2(x,1.5,1.5,97,97,9);x.stroke();x.restore();
  // height: raised motif, ridged outlines, crackle grooves, orange-peel wobble; roughness: crackle and specks are duller
  const hs=256,h=mkCanvas(hs,hs),y=h.getContext('2d');y.fillStyle='#808080';y.fillRect(0,0,hs,hs);y.save();y.scale(hs/100,hs/100);y.save();y.translate(50+jx,50+jy);y.rotate(jr);y.translate(-50,-50);
  for(const p of MOTIF[k]){y.fillStyle='#8e8e8e';y.fill(new Path2D(p.d))}y.strokeStyle='#a4a4a4';y.lineWidth=.9;for(const p of MOTIF[k])if(!p.a)y.stroke(new Path2D(p.d));y.restore();
  y.strokeStyle='#666';y.lineWidth=.45;for(const pts of cracks){y.beginPath();pts.forEach((p,i)=>i?y.lineTo(p[0],p[1]):y.moveTo(p[0],p[1]));y.stroke()}y.restore();
  const H=heightOf(h),wf=fbm(Math.floor(R()*999),4,3,hs);for(let j=0;j<hs;j++)for(let i=0;i<hs;i++)H[j*hs+i]+=wf(i/hs,j/hs)*.05;
  const rc=mkCanvas(hs,hs),rx=rc.getContext('2d');rx.fillStyle='#5a5a5a';rx.fillRect(0,0,hs,hs);rx.save();rx.scale(hs/100,hs/100);rx.strokeStyle='#b4b4b4';rx.lineWidth=.6;for(const pts of cracks){rx.beginPath();pts.forEach((p,i)=>i?rx.lineTo(p[0],p[1]):rx.moveTo(p[0],p[1]));rx.stroke()}rx.restore();
  return {map:texOf(c,true),nrm:texOf(normalCanvas(H,hs,hs,3.2,false)),rough:texOf(rc)}}
function tileSideMat(k){const W=256,H=64;const c=mkCanvas(W,H),x=c.getContext('2d');const R=rng(300+k);x.fillStyle=TBASE[k];x.fillRect(0,0,W,H);x.fillStyle='rgba(0,0,0,.14)';x.fillRect(0,0,W,H);
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(255,255,255,.08)');g.addColorStop(.5,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
  // unglazed biscuit foot with a wavy drip edge
  const cc=mkCanvas(W,H),y=cc.getContext('2d');y.fillStyle='#fff';y.fillRect(0,0,W,H);const drip=[];for(let i=0;i<=W;i+=4)drip.push(H*.8-3+Math.sin(i*.09+R()*.6)*2+(R()<.08?-4:0));
  const foot=z=>{z.beginPath();z.moveTo(0,H);drip.forEach((d,i)=>z.lineTo(i*4,d));z.lineTo(W,H);z.closePath()};
  x.fillStyle='#d8c29c';foot(x);x.fill();y.fillStyle='#000';foot(y);y.fill();
  const t=texOf(c,true,true),cct=texOf(cc,false,true);return emat(new THREE.MeshPhysicalMaterial({map:t,roughness:.32,clearcoat:.85,clearcoatMap:cct,clearcoatRoughness:.08,metalness:0}))}
function buildTileMats(){V3.tmat=[];V3.gmat=[];const wf=fbm(77,4,3,128);const WH=new Float32Array(128*128);for(let j=0;j<128;j++)for(let i=0;i<128;i++)WH[j*128+i]=wf(i/128,j/128);
  const wob=texOf(normalCanvas(WH,128,128,2.4,true),false,true);
  for(let k=0;k<6;k++){const side=tileSideMat(k);const vs=[];for(let v=0;v<3;v++){const t=tileTextures(k,rng(1000+k*17+v*5));
      const m=emat(new THREE.MeshPhysicalMaterial({map:t.map,roughnessMap:t.rough,roughness:1,normalMap:t.nrm,normalScale:new THREE.Vector2(.8,.8),clearcoat:1,clearcoatRoughness:.04,clearcoatNormalMap:wob,clearcoatNormalScale:new THREE.Vector2(.22,.22),metalness:0,envMapIntensity:1.1}));
      if(k===PRISM){m.iridescence=.9;m.iridescenceIOR=1.5;m.iridescenceThicknessRange=[180,520]}vs.push([m,side])}
    V3.tmat.push(vs);V3.gmat.push([new THREE.MeshBasicMaterial({map:vs[0][0].map,transparent:true,opacity:.55,depthWrite:false}),new THREE.MeshBasicMaterial({color:TBASE[k],transparent:true,opacity:.4,depthWrite:false})])}}
function tileGeo(){const s=TSZ/2-.06,r=.1,bt=.05,bs=.05,dp=TD-.1;const sh=rrPath(new THREE.Shape(),-s,-s,2*s,2*s,r);
  const g=new THREE.ExtrudeGeometry(sh,{depth:dp,bevelEnabled:true,bevelThickness:bt,bevelSize:bs,bevelSegments:3,curveSegments:4});
  extrudeUV(g,(x,y)=>[x/(2*s)+.5,y/(2*s)+.5],(x,y,z)=>[Math.atan2(y,x)/(2*Math.PI)+.5,(z+bt)/(dp+2*bt)]);g.rotateX(-Math.PI/2);g.translate(0,bt,0);g.computeBoundingSphere();return g}
// ---------- environment: a small sunlit "courtyard studio" baked into a PMREM so glaze, brass and varnish reflect ----------
function makeEnv(){const r=V3.r;const es=new THREE.Scene();const geo=new THREE.SphereGeometry(60,32,16);const col=[];const p=geo.attributes.position;
  const sky=new THREE.Color(0x9fc2ea),hor=new THREE.Color(0xf8e2bc),gnd=new THREE.Color(0x8a4a2a),tmp=new THREE.Color();
  for(let i=0;i<p.count;i++){const y=p.getY(i)/60;if(y>0)tmp.copy(hor).lerp(sky,Math.pow(y,.6)).multiplyScalar(1.05);else tmp.copy(hor).lerp(gnd,Math.min(1,-y*3)).multiplyScalar(.7);col.push(tmp.r,tmp.g,tmp.b)}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));es.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({side:THREE.BackSide,vertexColors:true})));
  const panel=(w,h,c,k,x,y,z)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(k),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)};
  panel(16,16,0xfff0d0,9,-22,42,26);panel(30,8,0xdfeaff,2.2,26,26,-30);panel(8,30,0xfff4e4,1.8,-40,18,-18);panel(40,5,0xffe2b0,1.4,0,14,46);
  // arcade openings: dark columns between bright arches on the horizon
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;panel(3,9,0x5a3a26,.4,Math.cos(a)*54,4,Math.sin(a)*54)}
  const pm=new THREE.PMREMGenerator(r);const rt=pm.fromScene(es,.02);pm.dispose();V3.envTex=rt.texture}
// ---------- HDR post pipeline (High): MSAA scene target, bright pass, two-level blur bloom, ACES, grade, vignette, dither ----------
const PQ_VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
function initPost(){const r=V3.r;if(!r.capabilities.isWebGL2)return;try{
  const mk=(ms)=>new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,samples:ms||0,depthBuffer:!!ms});V3.rt={s:mk(4),a:mk(),b:mk(),c:mk(),d:mk()};
  V3.fsS=new THREE.Scene();V3.fsC=new THREE.OrthographicCamera(-1,1,1,-1,0,1);V3.fsQ=new THREE.Mesh(new THREE.PlaneGeometry(2,2));V3.fsQ.frustumCulled=false;V3.fsS.add(V3.fsQ);
  const sm=(fs,u)=>new THREE.ShaderMaterial({uniforms:u,vertexShader:PQ_VS,fragmentShader:fs,depthTest:false,depthWrite:false});
  V3.mBright=sm('uniform sampler2D tIn;uniform float uTh;varying vec2 vUv;void main(){vec3 c=texture2D(tIn,vUv).rgb;float l=max(max(c.r,c.g),c.b);gl_FragColor=vec4(c*smoothstep(uTh,uTh*1.8,l),1.);}',{tIn:{value:null},uTh:{value:1.5}});
  V3.mBlur=sm('uniform sampler2D tIn;uniform vec2 uDir;varying vec2 vUv;void main(){vec3 s=texture2D(tIn,vUv).rgb*.227;s+=(texture2D(tIn,vUv+uDir*1.385).rgb+texture2D(tIn,vUv-uDir*1.385).rgb)*.316;s+=(texture2D(tIn,vUv+uDir*3.23).rgb+texture2D(tIn,vUv-uDir*3.23).rgb)*.07;gl_FragColor=vec4(s,1.);}',{tIn:{value:null},uDir:{value:new THREE.Vector2()}});
  V3.mComp=sm(`uniform sampler2D tS,tB1,tB2;uniform float uBloom,uExpo,uVig;uniform vec2 uRes;varying vec2 vUv;
    vec3 rrt(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 b=v*(.983729*v+.4329510)+.238081;return a/b;}
    vec3 aces(vec3 c){const mat3 I=mat3(vec3(.59719,.07600,.02840),vec3(.35458,.90834,.13383),vec3(.04823,.01566,.83777));const mat3 O=mat3(vec3(1.60475,-.10208,-.00327),vec3(-.53108,1.10813,-.07276),vec3(-.07367,-.00605,1.07602));c*=uExpo/.6;c=I*c;c=rrt(c);c=O*c;return clamp(c,0.,1.);}
    vec3 oetf(vec3 c){return mix(pow(c,vec3(.41666))*1.055-vec3(.055),c*12.92,vec3(lessThanEqual(c,vec3(.0031308))));}
    float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    void main(){vec3 c=texture2D(tS,vUv).rgb;vec3 b=texture2D(tB1,vUv).rgb*.7+texture2D(tB2,vUv).rgb*.9;c+=b*uBloom;
      c=oetf(aces(c));float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.07);c+=vec3(.018,.006,-.014)*(1.-l)*l*2.;c=(c-.5)*1.035+.5;
      vec2 d=vUv-.5;d.x*=uRes.x/uRes.y;float v=smoothstep(1.05,.32,length(d));c*=mix(1.-uVig,1.,v);c+=(hash(gl_FragCoord.xy)-.5)/255.;gl_FragColor=vec4(clamp(c,0.,1.),1.);}`,
    {tS:{value:null},tB1:{value:null},tB2:{value:null},uBloom:{value:.42},uExpo:{value:1.05},uVig:{value:.34},uRes:{value:new THREE.Vector2(1,1)}});
  V3.canPost=true}catch(e){console.warn('post off',e);V3.canPost=false}}
function sizePost(){if(!V3.rt)return;const pr=V3.r.getPixelRatio();const w=Math.max(4,Math.round(V3.W*pr)),h=Math.max(4,Math.round(V3.H*pr));const R=V3.rt;R.s.setSize(w,h);R.a.setSize(w>>1,h>>1);R.b.setSize(w>>1,h>>1);R.c.setSize(w>>2,h>>2);R.d.setSize(w>>2,h>>2);V3.mComp.uniforms.uRes.value.set(w,h)}
function pass(m,to){V3.fsQ.material=m;V3.r.setRenderTarget(to);V3.r.render(V3.fsS,V3.fsC)}
function drawFrame3D(){const r=V3.r;r.info.autoReset=false;r.info.reset();if(!V3.post){r.setRenderTarget(null);r.render(V3.scene,V3.cam);return}const R=V3.rt;
  r.setRenderTarget(R.s);r.render(V3.scene,V3.cam);
  V3.mBright.uniforms.tIn.value=R.s.texture;pass(V3.mBright,R.a);const B=V3.mBlur.uniforms;
  B.tIn.value=R.a.texture;B.uDir.value.set(1/R.a.width,0);pass(V3.mBlur,R.b);B.tIn.value=R.b.texture;B.uDir.value.set(0,1/R.a.height);pass(V3.mBlur,R.a);
  B.tIn.value=R.a.texture;B.uDir.value.set(1/R.c.width,0);pass(V3.mBlur,R.c);B.tIn.value=R.c.texture;B.uDir.value.set(0,1/R.c.height);pass(V3.mBlur,R.d);
  const C=V3.mComp.uniforms;C.tS.value=R.s.texture;C.tB1.value=R.a.texture;C.tB2.value=R.d.texture;C.uExpo.value=r.toneMappingExposure;pass(V3.mComp,null)}
V3.draw=()=>drawFrame3D();
// ---------- scene ----------
function init3D(){if(!window.THREE||/jsdom/i.test(navigator.userAgent))return false;const cv=document.getElementById('c3');if(!cv)return false;
  let r;try{r=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});if(!r.getContext())return false}catch(e){return false}
  V3.r=r;V3.aniso=Math.min(8,r.capabilities.getMaxAnisotropy());r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.0;
  const sc=V3.scene=new THREE.Scene();
  sc.background=canvasTex(4,256,(x)=>{const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#f5dcae');g.addColorStop(.6,'#eec38e');g.addColorStop(1,'#c98a5a');x.fillStyle=g;x.fillRect(0,0,4,256)});sc.fog=new THREE.Fog(0xe2b288,75,170);
  V3.cam=new THREE.PerspectiveCamera(34,1.6,.5,400);V3.look=new THREE.Vector3();V3.dist=40;
  makeTextures();makeEnv();
  // key: a warm low-ish afternoon sun; fill: sky/terracotta bounce; rim: cool back light that outlines tile edges
  V3.hemi=new THREE.HemisphereLight(0xdfe9ff,0x9a5a36,.4);sc.add(V3.hemi);
  const sun=V3.sun=new THREE.DirectionalLight(0xffe0b0,2.35);sun.position.set(-14,30,16);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.00025;sun.shadow.normalBias=.02;sc.add(sun);sc.add(sun.target);
  V3.rim=new THREE.DirectionalLight(0xcfe0ff,.9);V3.rim.position.set(10,14,-30);sc.add(V3.rim);sc.add(V3.rim.target);
  // courtyard paving, the walnut table and its legs, a linen runner
  const T=V3.T;for(const t of [T.floorC,T.floorR,T.floorN])t.repeat.set(32,32);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(260,260),mat(new THREE.MeshStandardMaterial({map:T.floorC,roughnessMap:T.floorR,normalMap:T.floorN,normalScale:new THREE.Vector2(1.2,1.2),roughness:1,envMapIntensity:.5})));floor.rotation.x=-Math.PI/2;floor.position.y=-3.2;floor.receiveShadow=true;sc.add(floor);
  V3.woodMat=mat(new THREE.MeshStandardMaterial({map:T.woodC,roughnessMap:T.woodR,normalMap:T.woodN,normalScale:new THREE.Vector2(.9,.9),roughness:.95,envMapIntensity:.9}));
  V3.table=new THREE.Mesh(new THREE.BufferGeometry(),V3.woodMat);V3.table.receiveShadow=true;V3.table.castShadow=false;sc.add(V3.table);
  V3.tblShadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:T.sqShadow,transparent:true,depthWrite:false,opacity:.9}));V3.tblShadow.rotation.x=-Math.PI/2;V3.tblShadow.position.y=-3.19;sc.add(V3.tblShadow);
  V3.legs=[];const legGeo=new THREE.LatheGeometry([[0,0],[.34,0],[.36,.1],[.24,.3],[.2,.9],[.26,1.2],[.3,1.45],[.36,1.6],[.36,1.8],[0,1.8]].map(p=>new THREE.Vector2(p[0],p[1])),20);
  for(let i=0;i<4;i++){const l=new THREE.Mesh(legGeo,V3.woodMat);l.castShadow=true;l.position.y=-3.2;sc.add(l);V3.legs.push(l)}
  const rc=mkCanvas(512,512),rx=rc.getContext('2d');paintRunner(rx,512);const runT=texOf(rc,true);T.linenN.repeat.set(6,6);
  V3.runner=new THREE.Mesh(new THREE.BoxGeometry(1,.02,1),[0,1,2,3,4,5].map(i=>mat(new THREE.MeshStandardMaterial(i===2?{map:runT,normalMap:T.linenN,normalScale:new THREE.Vector2(.5,.5),roughness:.95,envMapIntensity:.4}:{color:0x223a6e,roughness:1}))));
  V3.runner.position.y=.01;V3.runner.receiveShadow=true;sc.add(V3.runner);
  V3.pots=[];for(let i=0;i<6;i++){const pot=potMesh(i);sc.add(pot);V3.pots.push(pot)}
  // tiles
  V3.tgeo=tileGeo();buildTileMats();V3.blobGeo=new THREE.PlaneGeometry(1.25,1.25);V3.blobGeo.rotateX(-Math.PI/2);V3.blobMat=new THREE.MeshBasicMaterial({map:T.sqShadow,transparent:true,depthWrite:false,opacity:.75});
  makeSunToken();
  V3.hitMat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
  initFx();initPost();
  cv.addEventListener('pointerdown',e=>{V3.drag={x:e.clientX,y:e.clientY,a:V3.orbit.a,e:V3.orbit.e,moved:false}});
  window.addEventListener('pointermove',e=>{const d=V3.drag;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)>8)d.moved=true;if(d.moved){V3.orbit.a=Math.max(-.6,Math.min(.6,d.a-dx*.004));V3.orbit.e=Math.max(.8,Math.min(1.45,d.e+dy*.003));fitCam()}});
  window.addEventListener('pointerup',e=>{const d=V3.drag;V3.drag=null;if(d&&!d.moved&&e.target===cv){const h=pick3D(e);if(h&&typeof on3DPick==='function')on3DPick(h)}});
  cv.addEventListener('pointermove',e=>{if(V3.drag)return;const h=pick3D(e);const k=h?JSON.stringify(h):null;if(k!==V3.hoverK){V3.hoverK=k;V3.hover=h;if(typeof onHover==='function')onHover(h)}cv.style.cursor=h&&typeof hoverable==='function'&&hoverable(h)?'pointer':'grab'});
  cv.addEventListener('wheel',e=>{e.preventDefault();V3.zoom=Math.max(.55,Math.min(1.5,V3.zoom+e.deltaY*.001));fitCam()},{passive:false});
  cv.addEventListener('dblclick',()=>{V3.zoom=1;V3.orbit={a:0,e:1.2};fitCam()});
  new ResizeObserver(()=>resize3D()).observe(cv.parentElement);V3.on=true;document.body.classList.add('three');V3.clock=new THREE.Clock();
  V3.qPref=gfxLoadPref();applyQuality(V3.qPref==='auto'?gfxAuto():V3.qPref);
  try{document.fonts&&document.fonts.ready.then(()=>{V3.fontOK=1;if(G&&V3.L){sync3D(true)}})}catch(e){}
  perfHooks();(PH?PH.raf:requestAnimationFrame)(loop3D);return true}
// PerfHUD: overlay, speed test, auto step-down/up and the idle saver (see perf/INTEGRATE.md). The table draws only on change, so idle is 'demand'.
function perfHooks(){if(!PH)return;
  PH.register({game:'Sunglaze',renderer:V3.r,levels:['high','medium','low'],names:{high:'High',medium:'Medium',low:'Low'},anchor:'.gx-board',corner:'tr',idleMode:'demand',
    getLevel:()=>V3.q,isAuto:()=>V3.qPref==='auto',autoTop:()=>gfxAuto(),
    // auto, test and restore changes are not saved; Apply on the result card is a choice by hand (saved, never auto-changed)
    setLevel:(l,w)=>w==='apply'?gfxSetPref(l):applyQuality(l),
    basePR:()=>Math.min(V3.q==='high'?2:V3.q==='medium'?1.5:1,window.devicePixelRatio||1),
    onPixelRatio:v=>{V3.r.setPixelRatio(v);resize3D()},
    orbit:t=>{if(t==null){if(V3.orb0){V3.orbit={a:V3.orb0.a,e:V3.orb0.e};V3.orb0=null;fitCam()}return}if(!V3.orb0)V3.orb0={a:V3.orbit.a,e:V3.orbit.e};
      V3.orbit.a=Math.max(-.6,Math.min(.6,V3.orb0.a+Math.sin(t*Math.PI*2)*.45));V3.orbit.e=Math.max(.8,Math.min(1.45,V3.orb0.e-.12*Math.sin(t*Math.PI)));fitCam()},
    isAnimating:()=>!!V3.busy,
    beforeTest:()=>{if(typeof GX!=='undefined'&&GX.close)try{GX.close()}catch(e){}}})}
function paintRunner(x,S){x.fillStyle='#223a6e';x.fillRect(0,0,S,S);const R=rng(4);for(let i=0;i<S;i+=2){x.fillStyle=`rgba(0,0,20,${.05+R()*.08})`;x.fillRect(i,0,1,S);x.fillStyle=`rgba(200,210,255,${.02+R()*.04})`;x.fillRect(0,i,S,1)}
  // embroidered borders: ivory and saffron bands, a running meander, little stars
  for(const [o,w,c] of [[10,6,'#e9dcc0'],[20,3,'#e0a53a'],[S-16,6,'#e9dcc0'],[S-23,3,'#e0a53a']]){x.fillStyle=c;x.fillRect(0,o,S,w);x.fillRect(o,0,w,S)}
  x.strokeStyle='#e9dcc0';x.lineWidth=2;x.setLineDash([5,3]);for(const y0 of [36,S-36]){x.beginPath();for(let i=0;i<=S;i+=4){const y=y0+Math.sin(i/9)*4;i?x.lineTo(i,y):x.moveTo(i,y)}x.stroke();x.beginPath();for(let i=0;i<=S;i+=4){const y=y0+Math.sin(i/9)*4;i?x.lineTo(y,i):x.moveTo(y,i)}x.stroke()}x.setLineDash([]);
  x.fillStyle='#e0a53a';for(let i=60;i<S-40;i+=36){for(const [a,b] of [[i,50],[i,S-50],[50,i],[S-50,i]]){star8(x,a,b,5);x.fill()}}
  x.globalAlpha=.16;x.fillStyle='#e9dcc0';x.fill(new Path2D(rays(S/2,S/2,16,S*.08,S*.44,S*.035)));x.globalAlpha=1}
// lathe helper: [[r,y],...] -> geometry
const lathe=(pts,seg)=>new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg||32);
function clayMat(){if(!V3.clayM)V3.clayM=emat(new THREE.MeshStandardMaterial({map:V3.T.clayC,roughnessMap:V3.T.clayR,normalMap:V3.T.clayN,roughness:1,envMapIntensity:.7}));return V3.clayM}
// potted lemon shrubs around the table: lathe pots, instanced leaves and fruit
function potMesh(i){const g=new THREE.Group();const R=rng(60+i);const pot=new THREE.Mesh(lathe([[0,0],[.62,0],[.66,.06],[.82,.5],[.9,.95],[.86,1.05],[1.0,1.12],[1.02,1.22],[.9,1.25],[.84,1.18],[0,1.18]],28),clayMat());pot.castShadow=pot.receiveShadow=true;g.add(pot);
  const soil=new THREE.Mesh(new THREE.CircleGeometry(.84,20),mat(new THREE.MeshStandardMaterial({color:0x3a2616,roughness:1})));soil.rotation.x=-Math.PI/2;soil.position.y=1.16;g.add(soil);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.05,.08,1,6),mat(new THREE.MeshStandardMaterial({color:0x5a3f28,roughness:.9})));trunk.position.y=1.6;g.add(trunk);
  const lg=new THREE.SphereGeometry(.16,6,4);lg.scale(1,.28,.55);const N=150;const leaves=new THREE.InstancedMesh(lg,mat(new THREE.MeshStandardMaterial({roughness:.55,envMapIntensity:.6})),N);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),s=new THREE.Vector3(1,1,1),c=new THREE.Color();
  for(let k=0;k<N;k++){const a=R()*6.28,b=Math.acos(2*R()-1),rad=.55+R()*.35;v.set(Math.sin(b)*Math.cos(a)*rad,2.15+Math.cos(b)*rad*.8,Math.sin(b)*Math.sin(a)*rad);e.set(R()*3,R()*6.3,R()*3);q.setFromEuler(e);s.setScalar(.8+R()*.6);m4.compose(v,q,s);leaves.setMatrixAt(k,m4);c.setHSL(.26+R()*.06,.45+R()*.2,.2+R()*.14);leaves.setColorAt(k,c)}
  leaves.castShadow=true;g.add(leaves);const fr=new THREE.InstancedMesh(new THREE.SphereGeometry(.12,10,8),emat(new THREE.MeshPhysicalMaterial({color:0xf2c418,roughness:.4,clearcoat:.5})),9);
  for(let k=0;k<9;k++){const a=R()*6.28,b=.5+R()*1.6;v.set(Math.sin(b)*Math.cos(a)*.86,2.15+Math.cos(b)*.7,Math.sin(b)*Math.sin(a)*.86);m4.compose(v,q.identity(),s.set(1,1.15,1));fr.setMatrixAt(k,m4)}g.add(fr);g.scale.setScalar(.92);return g}
function makeSunToken(){const g=new THREE.Group();const brass=emat(new THREE.MeshPhysicalMaterial({color:0xd4a24a,metalness:1,roughness:.28,clearcoat:.4,clearcoatRoughness:.2}));
  const rim=new THREE.Mesh(lathe([[0,0],[.42,0],[.46,.02],[.48,.07],[.48,.14],[.46,.19],[.43,.21],[.4,.2],[.39,.18],[0,.18]],40),brass);rim.castShadow=true;rim.receiveShadow=true;g.add(rim);
  const S=256,c=mkCanvas(S,S),x=c.getContext('2d');x.fillStyle='#f3b92e';x.beginPath();x.arc(128,128,128,0,7);x.fill();const gr=x.createRadialGradient(128,110,10,128,128,128);gr.addColorStop(0,'#ffe08a');gr.addColorStop(1,'#e08a18');x.fillStyle=gr;x.fill();
  x.fillStyle='#c4541a';x.fill(new Path2D(rays(128,128,12,56,118,13)));x.fillStyle='#fff0b8';x.beginPath();x.arc(128,128,54,0,7);x.fill();x.strokeStyle='#a8661a';x.lineWidth=5;x.stroke();
  x.fillStyle='#7a3a0c';x.font='700 70px "Cormorant Garamond",Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.fillText('1',128,134);
  const H=heightOf(c);const top=new THREE.Mesh(new THREE.CircleGeometry(.395,40),emat(new THREE.MeshPhysicalMaterial({map:texOf(c,true),normalMap:texOf(normalCanvas(H,S,S,2,false)),roughness:.3,clearcoat:1,clearcoatRoughness:.05})));top.rotation.x=-Math.PI/2;top.position.y=.181;g.add(top);
  const sh=new THREE.Mesh(V3.blobGeo||new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:V3.T.blob,transparent:true,depthWrite:false,opacity:.7}));sh.scale.setScalar(.95);sh.position.y=.004;g.add(sh);
  V3.sunTok=g;V3.scene.add(g);g.userData={pos:new THREE.Vector3()}}
// ---------- layout: kiln ring and player boards, chosen to fill the current board area ----------
function focusSeat(){if(!G)return 0;if(NET.on&&NET.mySeat>=0&&P(NET.mySeat))return NET.mySeat;const s=sideToAct();if(s>=0&&P(s).human)return s;if(UI.lastHuman!=null&&P(UI.lastHuman)&&P(UI.lastHuman).human)return UI.lastHuman;const h=G.pl.find(p=>p.human);return h?h.i:(s>=0?s:0)}
function ringGeom(n){const RR=Math.max(4.6,n*(2*KR+.5)/(2*Math.PI));return {RR,cr:RR-KR-.25,out:RR+KR}}
function computeLayout(w,h){const n=G?G.fac.length:5,np=G?G.np:2;const ring=ringGeom(n);const R=ring.out+.4;const me=focusSeat();const gp=1.2;
  const others=[];for(let k=1;k<np;k++)others.push((me+k)%np);const cands=[];const narrow=w<700;
  const mk=(name,boards)=>{let x0=-R,x1=R,z0=-R,z1=R;for(const b of boards){x0=Math.min(x0,b.x-BW/2);x1=Math.max(x1,b.x+BW/2);z0=Math.min(z0,b.z-BH/2);z1=Math.max(z1,b.z+BH/2)}
    const W=x1-x0,D=z1-z0;const e=V3.orbit.e;const sc=Math.min(w/W,h/(D*Math.sin(e)+1.2*Math.cos(e)));cands.push({name,boards,box:{x0,x1,z0,z1},sc,ring})};
  const bz=R+gp+BH/2;
  mk('focus',[{p:me,x:0,z:bz}]);
  if(!narrow){const row=[me].concat(others);
    mk('row',row.map((p,k)=>({p,x:(k-(np-1)/2)*(BW+gp),z:bz})));
    if(np===2){mk('lr',[{p:me,x:-(R+gp+BW/2),z:0},{p:others[0],x:R+gp+BW/2,z:0}]);mk('tb',[{p:others[0],x:0,z:-bz},{p:me,x:0,z:bz}])}
    if(np>=3){mk('ring-mid',[{p:me,x:0,z:bz}].concat(others.map((p,k)=>({p,x:(k-(others.length-1)/2)*(BW+gp),z:-bz}))));
      const L=[],Rr=[];others.forEach((p,k)=>(k%2?Rr:L).push(p));const col=(arr,side)=>arr.map((p,k)=>({p,x:side*(R+gp+BW/2),z:(k-(arr.length-1)/2)*(BH+gp)}));
      mk('sides',[{p:me,x:0,z:bz}].concat(col(L,-1),col(Rr,1)));
      if(np===4)mk('grid',[{p:me,x:-(BW+gp)/2,z:bz},{p:others[0],x:(BW+gp)/2,z:bz},{p:others[1],x:-(R+gp+BW/2),z:-BH*.35},{p:others[2],x:R+gp+BW/2,z:-BH*.35}]);
      mk('wing',[{p:me,x:-(R+gp+BW/2),z:BH*.55},{p:others[0],x:-(R+gp+BW/2),z:-BH*.55-gp}].concat(others.slice(1).map((p,k)=>({p,x:R+gp+BW/2,z:(k-(others.length-2)/2)*(BH+gp)}))))}}
  let best=null;for(const c of cands){const v=c.sc*(c.name==='focus'?(narrow?1.4:.6):1);if(!best||v>best.v)best=Object.assign(c,{v})}
  const L=best;L.kilns=[];for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n;L.kilns.push({x:Math.cos(a)*ring.RR,z:Math.sin(a)*ring.RR})}
  const cq=ring.out-.9;L.bag={x:-cq,z:-cq};L.lid={x:cq,z:-cq};
  L.bp={};for(const b of L.boards)L.bp[b.p]=b;return L}
// world position of every slot
function slotPos(sl){const L=V3.L;const a=sl.split('_');const t=a[0][0];const n=+a[0].slice(1);
  if(t==='f'){const K=L.kilns[n];if(!K)return null;const k=+a[1];return {x:K.x+(k%2?.5:-.5),z:K.z+(k<2?-.5:.5),y:.16,s:.9}}
  if(t==='c'){const k=+a[1];const cnt=Math.max(1,V3.ctrN||1);const cols=Math.max(3,Math.ceil(Math.sqrt(cnt+1)));const side=L.ring.cr*1.38;const pitch=Math.min(1.05,side/cols);return {x:(k%cols-(cols-1)/2)*pitch,z:(Math.floor(k/cols)-(Math.ceil((cnt+1)/cols)-1)/2)*pitch+pitch*.5,y:.03,s:pitch*.9/1}}
  const b=L.bp[n];if(!b)return null;const r=+a[1],k=+a[2];
  if(t==='l')return {x:b.x-.45-.54-k*CP,z:b.z-3.2+.54+r*CP,y:.14,s:1};
  if(t==='w')return {x:b.x+.45+.54+k*CP,z:b.z-3.2+.54+r*CP,y:.14,s:1};
  if(t==='x')return {x:b.x-5.31+r*CP,z:b.z+3.09,y:.14,s:1};return null}
function resize3D(){if(!V3.r)return;const el=V3.r.domElement.parentElement;const w=Math.max(50,el.clientWidth),h=Math.max(50,el.clientHeight);V3.r.setSize(w,h,false);V3.dirty=3;if(PH)PH.wake();V3.r.domElement.style.width='100%';V3.r.domElement.style.height='100%';V3.cam.aspect=w/h;V3.cam.updateProjectionMatrix();V3.W=w;V3.H=h;sizePost();relayout()}
function relayout(){if(V3.on&&!G){V3.L=computeLayout(V3.W||800,V3.H||600);if(!V3.lkey){V3.lkey='idle';buildStatic()}fitCam();return}if(!V3.on||!G)return;const L=computeLayout(V3.W||800,V3.H||600);const key=L.name+JSON.stringify(L.boards.map(b=>[b.p,b.x,b.z]))+G.fac.length;V3.L=L;if(key!==V3.lkey){V3.lkey=key;buildStatic()}fitCam();sync3D(true)}
// camera: binary-search the distance so the whole layout (with tile height) fits, then centre it
function fitCam(){const L=V3.L;if(!L)return;V3.dirty=3;if(PH)PH.wake();let b=L.box;const zb=V3.zoomBoard&&L.name==='focus'&&L.bp[V3.zoomBoard.p];if(zb)b={x0:zb.x-BW/2-.3,x1:zb.x+BW/2+.3,z0:zb.z-BH/2-(V3.zoomBoard.ring?L.ring.out*2+1.2:.3),z1:zb.z+BH/2+.3};const pts=[];for(const x of [b.x0,b.x1])for(const z of [b.z0,b.z1])for(const y of [0,.6])pts.push(new THREE.Vector3(x,y,z));
  const o=V3.orbit;const dir=new THREE.Vector3(Math.sin(o.a)*Math.cos(o.e),Math.sin(o.e),Math.cos(o.a)*Math.cos(o.e));const look=new THREE.Vector3((b.x0+b.x1)/2,0,(b.z0+b.z1)/2);
  const test=d=>{V3.cam.position.copy(look).addScaledVector(dir,d);V3.cam.lookAt(look);V3.cam.updateMatrixWorld();let mx=0,my0=1,my1=-1;for(const p of pts){const v=p.clone().project(V3.cam);mx=Math.max(mx,Math.abs(v.x));my0=Math.min(my0,v.y);my1=Math.max(my1,v.y)}return {mx,my0,my1}};
  for(let it=0;it<3;it++){let lo=5,hi=400;for(let k=0;k<30;k++){const d=(lo+hi)/2;const r=test(d);const fits=r.mx<=.97&&r.my1<=.97&&r.my0>=-.97&&(r.my1-r.my0)<=1.94;if(fits)hi=d;else lo=d}
    const r=test(hi);const off=(r.my1+r.my0)/2;look.z-=off*(b.z1-b.z0)*.5;V3.dist=hi}
  const d=V3.dist*V3.zoom;V3.camTo={pos:look.clone().addScaledVector(dir,d),look:look.clone()};if(!V3.camNow||!ANIM||V3.drag){V3.camNow={pos:V3.camTo.pos.clone(),look:look.clone()}}V3.cam.position.copy(V3.camNow.pos);V3.cam.lookAt(V3.camNow.look);V3.look.copy(look);
  // tight shadow frustum around the whole layout
  const B=L.box;const s=Math.max(B.x1-B.x0,B.z1-B.z0)/2+2;const cx=(B.x0+B.x1)/2,cz=(B.z0+B.z1)/2;V3.sun.target.position.set(cx,0,cz);V3.sun.position.set(cx-14,30,cz+16);
  Object.assign(V3.sun.shadow.camera,{left:-s,right:s,top:s,bottom:-s,near:12,far:60});V3.sun.shadow.camera.updateProjectionMatrix();V3.rim.target.position.set(cx,0,cz);V3.rim.position.set(cx+10,14,cz-30)}
// ---------- static pieces: table, kilns, courtyard medallion, boards, sack and shard box ----------
function tableGeo(w,d){const sh=rrPath(new THREE.Shape(),-w/2,-d/2,w,d,.9);const g=new THREE.ExtrudeGeometry(sh,{depth:.8,bevelEnabled:true,bevelThickness:.18,bevelSize:.18,bevelSegments:4,curveSegments:8});
  extrudeUV(g,(x,y)=>[x/12,y/6],(x,y,z)=>[(x+y)/12,z/6]);g.rotateX(-Math.PI/2);g.translate(0,-.98,0);return g}
function shadowPlane(w,d,op,tex){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:tex||V3.T.sqShadow,transparent:true,depthWrite:false,opacity:op}));m.rotation.x=-Math.PI/2;return m}
function buildStatic(){const sc=V3.scene;if(V3.stat)for(const m of V3.stat)sc.remove(m);V3.stat=[];for(const m of V3.smats||[]){if(m.map&&m.map.userData&&m.map.userData.own)m.map.dispose();m.dispose();V3.mats.delete(m)}V3.smats=[];V3.hits=[];V3.boards={};const L=V3.L;const add=m=>{sc.add(m);V3.stat.push(m);return m};
  const b=L.box;const tw=b.x1-b.x0+3,td=b.z1-b.z0+3,tx=(b.x0+b.x1)/2,tz=(b.z0+b.z1)/2;V3.table.geometry.dispose();V3.table.geometry=tableGeo(tw,td);V3.table.position.set(tx,0,tz);
  V3.tblShadow.scale.set(tw*1.5,td*1.5,1);V3.tblShadow.position.set(tx+1.5,-3.19,tz+1.5);
  V3.legs.forEach((l,i)=>l.position.set(tx+(i%2?1:-1)*(tw/2-1.3),-3.2,tz+(i<2?-1:1)*(td/2-1.3)));
  const pp=[[-1,-.3],[-1,.35],[1,-.3],[1,.35],[-.45,1],[.45,1]];V3.pots.forEach((p,i)=>{const q=pp[i];p.position.set(q[1]===1?tx+q[0]*tw*.62:tx+q[0]*(tw/2+2.6),-3.2,q[1]===1?tz+td/2+4.2:tz+q[1]*td)});
  V3.runner.scale.set(L.ring.out*2+2,1,L.ring.out*2+2);V3.runner.position.set(0,.01,0);
  // the courtyard: a limestone medallion with a carved rim and an inlaid sunburst
  const cr=L.ring.cr;const med=add(new THREE.Group());const lime=V3.limeM||(V3.limeM=mat(new THREE.MeshStandardMaterial({color:0xe9dcc0,roughness:.62,normalMap:V3.T.stoneN,normalScale:new THREE.Vector2(.3,.3),envMapIntensity:.7})));
  const rimM=new THREE.Mesh(lathe([[cr-.02,.03],[cr+.02,.1],[cr+.1,.12],[cr+.2,.1],[cr+.24,.05],[cr+.24,.02],[cr+.2,0]].reverse(),64),lime);rimM.castShadow=rimM.receiveShadow=true;med.add(rimM);
  if(!V3.medT||V3.medT.cr!==cr){const S=768,c=mkCanvas(S,S),x=c.getContext('2d');const f=fbm(31,8,4,S);const im=pxc(S,S,(i,j,o)=>{const n=f(i/S,j/S);o[0]=226+n*24;o[1]=212+n*22;o[2]=184+n*18});x.drawImage(im,0,0);
    const h=S/2;x.save();x.translate(h,h);for(let i=0;i<5;i++){x.strokeStyle=i%2?'rgba(35,64,122,.55)':'rgba(184,83,43,.45)';x.lineWidth=i===0?10:3;x.beginPath();x.arc(0,0,h*(.96-i*.035),0,7);x.stroke()}
    x.fillStyle='rgba(184,83,43,.32)';x.fill(new Path2D(rays(0,0,16,h*.16,h*.8,h*.05)));x.fillStyle='rgba(224,165,58,.35)';x.fill(new Path2D(rays(0,0,16,h*.14,h*.6,h*.03).replace(/M/g,'M')));
    for(let i=0;i<32;i++){const a=i/32*Math.PI*2;x.fillStyle=i%2?'#23407a':'#b8532b';x.globalAlpha=.6;x.beginPath();x.arc(Math.cos(a)*h*.86,Math.sin(a)*h*.86,5,0,7);x.fill()}x.globalAlpha=1;
    x.strokeStyle='rgba(35,64,122,.5)';x.lineWidth=3;x.beginPath();x.arc(0,0,h*.16,0,7);x.stroke();x.restore();V3.medT={cr,t:texOf(c,true)}}
  const top=new THREE.Mesh(new THREE.CircleGeometry(cr+.02,64),smat(new THREE.MeshStandardMaterial({map:V3.medT.t,roughness:.55,normalMap:V3.T.stoneN,normalScale:new THREE.Vector2(.25,.25),envMapIntensity:.7})));top.rotation.x=-Math.PI/2;top.position.y=.03;top.receiveShadow=true;med.add(top);
  const mh=add(new THREE.Mesh(new THREE.CircleGeometry(cr,32),V3.hitMat));mh.rotation.x=-Math.PI/2;mh.position.y=.08;mh.userData.hit={k:'ctr'};V3.hits.push(mh);
  // kilns: thick terracotta discs, a rolled lip with a slip-painted band, a painted floor with the kiln's number
  if(!V3.kilnGeo)V3.kilnGeo=lathe([[1.5,0],[1.56,.02],[1.6,.1],[1.61,.2],[1.58,.265],[1.53,.29],[1.48,.285],[1.44,.24],[1.4,.175],[1.34,.155]],56);
  L.kilns.forEach((K,i)=>{const g=new THREE.Group();const body=new THREE.Mesh(V3.kilnGeo,clayMat());body.castShadow=body.receiveShadow=true;g.add(body);
    const fl=new THREE.Mesh(new THREE.CircleGeometry(1.36,48),kilnFloorMat(i));fl.rotation.x=-Math.PI/2;fl.position.y=.155;fl.receiveShadow=true;g.add(fl);
    const sh=shadowPlane(4,4,.8,V3.T.blob);sh.position.y=.006;g.add(sh);g.position.set(K.x,0,K.z);add(g);body.userData.hit={k:'kiln',i};fl.userData.hit={k:'kiln',i};V3.hits.push(body,fl)});
  // the clay sack and the shard box
  const bag=add(V3.sack||(V3.sack=sackMesh()));bag.position.set(L.bag.x,0,L.bag.z);
  const box=add(V3.sbox||(V3.sbox=shardBox()));box.position.set(L.lid.x,0,L.lid.z);V3.shardN=-1;
  V3.bagLbl=add(V3.bagLbl||labelMesh('',2.6));V3.bagLbl.position.set(L.bag.x,.03,L.bag.z+1.55);V3.lidLbl=add(V3.lidLbl||labelMesh('',2.6));V3.lidLbl.position.set(L.lid.x,.03,L.lid.z+1.35);V3.lblKey='';
  // boards: a printed base with a punched top layer (47 slots)
  const bg=boardGeos();
  for(const bd of L.boards){const g=new THREE.Group();const tex=boardTexture(bd.p);tex.t.userData.own=1;const print=smat(new THREE.MeshStandardMaterial({map:tex.t,roughness:.8,normalMap:V3.linenB,normalScale:new THREE.Vector2(.35,.35),envMapIntensity:.4}));
    const edge=smat(new THREE.MeshStandardMaterial({color:new THREE.Color(PCOL[bd.p]).multiplyScalar(.7),roughness:.7}));
    const base=new THREE.Mesh(bg.base,[print,edge]);base.receiveShadow=true;base.castShadow=true;const lay=new THREE.Mesh(bg.lay,[print,V3.coreMat]);lay.receiveShadow=true;lay.castShadow=true;g.add(base,lay);
    const sh=shadowPlane(BW+1.4,BH+1.4,.85);sh.position.y=.004;g.add(sh);g.position.set(bd.x,0,bd.z);add(g);V3.boards[bd.p]={g,tex};
    for(let r=0;r<5;r++){const h=new THREE.Mesh(new THREE.PlaneGeometry(cap(r)*CP,CP),V3.hitMat);h.rotation.x=-Math.PI/2;h.position.set(bd.x-.45-cap(r)*CP/2,.2,bd.z-3.2+.54+r*CP);h.userData.hit={k:'line',p:bd.p,r};add(h);V3.hits.push(h)
      for(let c=0;c<5;c++){const w=new THREE.Mesh(new THREE.PlaneGeometry(CP,CP),V3.hitMat);w.rotation.x=-Math.PI/2;w.position.set(bd.x+.99+c*CP,.2,bd.z-3.2+.54+r*CP);w.userData.hit={k:'cell',p:bd.p,r,c};add(w);V3.hits.push(w)}}
    const fh=new THREE.Mesh(new THREE.PlaneGeometry(7*CP,CP*1.4),V3.hitMat);fh.rotation.x=-Math.PI/2;fh.position.set(bd.x-5.31+3*CP,.2,bd.z+3.3);fh.userData.hit={k:'line',p:bd.p,r:5};add(fh);V3.hits.push(fh)}}
function kilnFloorMat(i){V3.kfm=V3.kfm||{};if(V3.kfm[i])return V3.kfm[i];const S=512,h=S/2;
  if(!V3.kfBase){const f=fbm(50,8,4,S),f2=fbm(51,64,2,S);const c=pxc(S,S,(a,b,o)=>{const n=f(a/S,b/S),m=f2(a/S,b/S);o[0]=150+n*44-m*16;o[1]=76+n*24-m*8;o[2]=52+n*14});
    const x=c.getContext('2d');const hc=mkCanvas(S,S),y=hc.getContext('2d');y.fillStyle='#808080';y.fillRect(0,0,S,S);x.save();x.translate(h,h);y.save();y.translate(h,h);
    // white-slip rosette and rings, with incised grooves in the height map
    x.fillStyle='rgba(240,226,200,.5)';x.fill(new Path2D(petals(0,0,8,h*.1,h*.78,h*.16,Math.PI/8)));x.fillStyle='rgba(240,226,200,.35)';x.fill(new Path2D(petals(0,0,8,h*.1,h*.6,h*.12,0)));
    for(const [rr,lw,cl] of [[.97,6,'rgba(90,40,20,.5)'],[.9,3,'rgba(240,226,200,.7)'],[.2,4,'rgba(35,64,122,.7)']]){x.strokeStyle=cl;x.lineWidth=lw;x.beginPath();x.arc(0,0,h*rr,0,7);x.stroke();y.strokeStyle='#5a5a5a';y.lineWidth=lw;y.beginPath();y.arc(0,0,h*rr,0,7);y.stroke()}
    for(let k=0;k<24;k++){const a=k/24*Math.PI*2;x.fillStyle='rgba(240,226,200,.8)';x.beginPath();x.arc(Math.cos(a)*h*.84,Math.sin(a)*h*.84,4,0,7);x.fill();y.fillStyle='#5f5f5f';y.beginPath();y.arc(Math.cos(a)*h*.84,Math.sin(a)*h*.84,4,0,7);y.fill()}
    y.fillStyle='#9a9a9a';y.beginPath();y.arc(0,-h*.84,24,0,7);y.fill();x.restore();y.restore();
    const H=heightOf(hc);for(let j=0;j<S;j++)for(let k=0;k<S;k++)H[j*S+k]+=f2(k/S,j/S)*.08;V3.kfBase={c,n:texOf(normalCanvas(H,S,S,3,false))}}
  // stamped number cartouche at the north edge
  const c=mkCanvas(S,S),x=c.getContext('2d');x.drawImage(V3.kfBase.c,0,0);x.save();x.translate(h,h);
  x.fillStyle='#f2e6cc';x.beginPath();x.arc(0,-h*.84,24,0,7);x.fill();x.strokeStyle='#23407a';x.lineWidth=3;x.stroke();x.fillStyle='#23407a';x.font='700 34px "Cormorant Garamond",Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.fillText(String(i+1),0,-h*.84+2);x.restore();
  return V3.kfm[i]=mat(new THREE.MeshStandardMaterial({map:texOf(c,true),normalMap:V3.kfBase.n,roughness:.86,envMapIntensity:.6}))}
function sackMesh(){const g=new THREE.Group();const pts=[[0,0],[.6,.01],[.95,.16],[1.1,.5],[1.08,.92],[.88,1.28],[.54,1.52],[.36,1.66],[.35,1.76],[.5,1.9],[.66,2.02],[.6,2.1],[.4,2.06]];const geo=lathe(pts,48);const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const a=Math.atan2(z,x);const f=1+.05*Math.sin(a*6+y*2.3)+.03*Math.sin(a*11-y*4)+(y>1.85?.14*Math.sin(a*9):0)*(y-1.85)*4;p.setXYZ(i,x*f,y,z*f)}geo.computeVertexNormals();
  if(!V3.sackM){const W=512,H=256,c=mkCanvas(W,H),x=c.getContext('2d');const R=rng(9);x.fillStyle='#c7a574';x.fillRect(0,0,W,H);for(let i=0;i<W;i+=3){x.fillStyle=`rgba(90,60,30,${.05+R()*.08})`;x.fillRect(i,0,1,H)}for(let j=0;j<H;j+=3){x.fillStyle=`rgba(255,240,210,${.04+R()*.06})`;x.fillRect(0,j,W,1)}
    // stencilled indigo sun on the front
    x.save();x.translate(W/2,H*.55);x.scale(1,1.6);x.globalAlpha=.75;x.fillStyle='#2c3f7a';x.fill(new Path2D(rays(0,0,12,18,44,7)));x.beginPath();x.arc(0,0,16,0,7);x.fill();x.restore();
    const n=V3.T.linenN.clone();n.repeat.set(8,4);n.needsUpdate=true;V3.sackM=mat(new THREE.MeshStandardMaterial({map:texOf(c,true),normalMap:n,normalScale:new THREE.Vector2(1.2,1.2),roughness:.95,envMapIntensity:.4,side:THREE.DoubleSide}))}
  const m=new THREE.Mesh(geo,V3.sackM);m.rotation.y=Math.PI;m.castShadow=m.receiveShadow=true;g.add(m);
  const rope=mat(new THREE.MeshStandardMaterial({color:0xb8863a,roughness:.8}));const tie=new THREE.Mesh(new THREE.TorusGeometry(.4,.065,8,28),rope);tie.rotation.x=Math.PI/2;tie.position.y=1.7;tie.castShadow=true;g.add(tie);
  for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,.55,6),rope);e.position.set(.25*s,1.45,.42);e.rotation.z=.25*s;e.castShadow=true;g.add(e)}
  const sh=shadowPlane(3.2,3.2,.9,V3.T.blob);sh.position.y=.005;g.add(sh);return g}
function shardBox(){const g=new THREE.Group();const rb=(w,h,d)=>{const s=rrPath(new THREE.Shape(),-w/2,-h/2,w,h,Math.min(.05,h/3));const e=new THREE.ExtrudeGeometry(s,{depth:d-.04,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:2,curveSegments:3});extrudeUV(e,(x,y)=>[x/6+.3,y/3],(x,y,z)=>[(x+z)/6,y/3]);e.translate(0,0,-(d-.04)/2);return e};
  const wm=V3.woodMat;const bot=new THREE.Mesh(rb(2.1,.14,1.7),wm);bot.position.y=.07;g.add(bot);
  for(const [x,z,w,d] of [[0,-.8,2.1,.12],[0,.8,2.1,.12],[-1,0,.12,1.5],[1,0,.12,1.5]]){const s=new THREE.Mesh(rb(w,.6,d),wm);s.position.set(x,.36,z);g.add(s)}
  // brass corner fittings
  const br=emat(new THREE.MeshStandardMaterial({color:0xc99a48,metalness:1,roughness:.32}));for(const [x,z] of [[-1,-.8],[1,-.8],[-1,.8],[1,.8]]){const c=new THREE.Mesh(new THREE.BoxGeometry(.18,.64,.18),br);c.position.set(x,.36,z);g.add(c)}
  g.traverse(o=>{o.castShadow=true;o.receiveShadow=true});
  // broken tile pieces inside (the count follows the shard box)
  const R=rng(21);V3.shards=[];for(let i=0;i<14;i++){const s=new THREE.Shape();const n=3+Math.floor(R()*2);for(let k=0;k<n;k++){const a=k/n*Math.PI*2+R()*.8,r=.18+R()*.16;k?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r)}
    const ge=new THREE.ExtrudeGeometry(s,{depth:.07,bevelEnabled:true,bevelThickness:.015,bevelSize:.015,bevelSegments:1});ge.rotateX(-Math.PI/2);const k=Math.floor(R()*5);
    const m=new THREE.Mesh(ge,V3.tmat[k][i%3]);m.position.set((R()-.5)*1.5,.16+R()*.1,(R()-.5)*1.2);m.rotation.set((R()-.5)*.5,R()*6,(R()-.5)*.5);m.castShadow=true;m.visible=false;g.add(m);V3.shards.push(m)}
  const sh=shadowPlane(3,2.6,.85);sh.position.y=.005;g.add(sh);return g}
// label plaques on the table
function labelMesh(t,w){const c=mkCanvas(512,128);const tx=texOf(c,true);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),emat(new THREE.MeshStandardMaterial({map:tx,transparent:true,roughness:.35,envMapIntensity:.7,depthWrite:false})));m.rotation.x=-Math.PI/2;m.userData.c=c;m.userData.t=tx;setLabel(m,t);return m}
function setLabel(m,t){const c=m.userData.c,x=c.getContext('2d');x.clearRect(0,0,512,128);x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=10;x.shadowOffsetY=4;x.fillStyle='#f4ead2';rr2(x,10,14,492,96,46);x.fill();x.shadowColor='transparent';
  x.strokeStyle='#23407a';x.lineWidth=5;rr2(x,18,22,476,80,40);x.stroke();x.strokeStyle='#e0a53a';x.lineWidth=2;rr2(x,26,30,460,64,32);x.stroke();
  x.fillStyle='#23407a';x.font='700 50px "Cormorant Garamond",Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.fillText(t,256,64);m.userData.t.needsUpdate=true}
// ---------- the dual-layer player board ----------
function boardSlots(){const S=[];for(let r=0;r<5;r++){const z=-3.2+.54+r*CP;for(let k=0;k<cap(r);k++)S.push([-.45-.54-k*CP,z,'l']);for(let k=0;k<5;k++)S.push([.45+.54+k*CP,z,'w'])}for(let k=0;k<7;k++)S.push([-5.31+k*CP,3.09,'x']);return S}
function boardGeos(){if(V3.bgeo)return V3.bgeo;const outer=()=>rrPath(new THREE.Shape(),-BW/2,-BH/2,BW,BH,.38);const cuv=(x,y)=>[(x+BW/2)/BW,(y+BH/2)/BH];
  const base=new THREE.ExtrudeGeometry(outer(),{depth:.08,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:3,curveSegments:6});extrudeUV(base,cuv,(x,y,z)=>[(x+y)/4,z*4]);base.rotateX(-Math.PI/2);base.translate(0,.03,0);
  const top=outer();const hs=.49;for(const [x,z] of boardSlots())top.holes.push(rrPath(new THREE.Path(),x-hs,-z-hs,2*hs,2*hs,.09));
  const lay=new THREE.ExtrudeGeometry(top,{depth:.05,bevelEnabled:true,bevelThickness:.015,bevelSize:.012,bevelSegments:2,curveSegments:3});extrudeUV(lay,cuv,(x,y,z)=>[(x+y)*.6,z*6]);lay.rotateX(-Math.PI/2);lay.translate(0,.155,0);
  // grey-brown pressed card core for the punched walls
  const f=fbm(71,16,3,128);const cc=pxc(128,128,(i,j,o)=>{const n=f(i/128,j/128);o[0]=128+n*40;o[1]=112+n*34;o[2]=92+n*26});V3.coreMat=mat(new THREE.MeshStandardMaterial({map:texOf(cc,true,true),roughness:.95}));
  V3.linenB=V3.T.linenN.clone();V3.linenB.repeat.set(26,20);V3.linenB.needsUpdate=true;return V3.bgeo={base,lay}}
function boardTexture(pi){const c=mkCanvas(BW*100,BH*100);const t=texOf(c,true);t.anisotropy=V3.aniso||8;const o={c,t,key:''};paintBoard(o,pi);return o}
function paperCanvas(W,H){const c=mkCanvas(W,H),x=c.getContext('2d');const R=rng(33);for(let i=0;i<260;i++){const cx=R()*W,cy=R()*H,r=30+R()*140;const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,R()<.4?'rgba(255,250,235,.06)':'rgba(150,110,60,.07)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(cx-r,cy-r,2*r,2*r)}
  for(let i=0;i<W;i+=3){x.fillStyle=`rgba(120,90,50,${.018+R()*.02})`;x.fillRect(i,0,1,H)}for(let j=0;j<H;j+=3){x.fillStyle=`rgba(120,90,50,${.018+R()*.02})`;x.fillRect(0,j,W,1)}return c}
function star8(x,cx,cy,r){x.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,q=i%2?r*.45:r;x.lineTo(cx+Math.cos(a)*q,cy+Math.sin(a)*q)}x.closePath()}
function paintBoard(o,pi){const GG=G||{ex:{},pl:[{nm:PNAMES[0],score:0,human:1},{nm:PNAMES[1],score:0,human:0,lv:'normal'}],markerIn:null};const p=GG.pl[pi];if(!p)return;const act=!!G&&sideToAct()===pi&&G.phase==='offer';const you=!!G&&!!p.human&&isYou(pi);const key=[p.nm,p.score,p.human,p.lv,GG.ex.gray,act,GG.markerIn===pi,V3.fontOK,!!G,you].join('|');if(o.key===key)return;o.key=key;
  const c=o.c,x=c.getContext('2d'),S=100,W=c.width,H=c.height;const X=v=>(v+BW/2)*S,Z=v=>(v+BH/2)*S;const pc=PCOL[pi];const FH='"Cormorant Garamond",Georgia,serif';
  x.fillStyle='#e6d6b4';x.fillRect(0,0,W,H);if(!V3.paper)V3.paper=paperCanvas(W,H);x.drawImage(V3.paper,0,0);
  // printed border: cobalt band with gold stars and hairlines
  x.lineWidth=28;x.strokeStyle='#213d74';rr2(x,24,24,W-48,H-48,24);x.stroke();x.lineWidth=2;x.strokeStyle='#d9a441';rr2(x,9,9,W-18,H-18,34);x.stroke();rr2(x,39,39,W-78,H-78,12);x.stroke();
  x.fillStyle='#e7b54e';for(let i=62;i<W-50;i+=44){star8(x,i,24,8);x.fill();star8(x,i,H-24,8);x.fill()}for(let j=66;j<H-50;j+=44){star8(x,24,j,8);x.fill();star8(x,W-24,j,8);x.fill()}
  // header banner in the player's colour
  const hg=x.createLinearGradient(0,48,0,124);hg.addColorStop(0,pc);hg.addColorStop(1,shade(pc,-.22));x.fillStyle=hg;rr2(x,56,48,W-112,76,12);x.fill();
  x.strokeStyle=act?'#ffe27a':'#d9a441';x.lineWidth=act?6:3;if(act){x.shadowColor='#ffd24a';x.shadowBlur=18}rr2(x,56,48,W-112,76,12);x.stroke();x.shadowBlur=0;
  x.strokeStyle='rgba(255,248,230,.45)';x.lineWidth=1.5;rr2(x,64,56,W-128,60,8);x.stroke();
  x.fillStyle='#fff8ea';x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=4;x.shadowOffsetY=2;x.font=`700 52px ${FH}`;x.textBaseline="middle";x.textAlign="left";
  x.fillText(p.nm+(p.human?(G?(you?'  (you)':''):(GG.pl.filter(q=>q.human).length===1?'  (you)':'')):'  ·  '+p.lv+' computer'),88,88);x.shadowBlur=0;x.shadowOffsetY=0;
  if(act){const sx=W-210,sy=86;x.fillStyle='#ffd24a';x.fill(new Path2D(rays(sx,sy,12,12,24,4)));x.beginPath();x.arc(sx,sy,11,0,7);x.fill()}
  // score medallion
  const mx=W-118,my=86;const mg=x.createRadialGradient(mx-12,my-14,6,mx,my,52);mg.addColorStop(0,'#fff0b0');mg.addColorStop(.6,'#e0a53a');mg.addColorStop(1,'#9a6418');x.fillStyle=mg;x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=8;x.shadowOffsetY=3;x.beginPath();x.arc(mx,my,50,0,7);x.fill();x.shadowBlur=0;x.shadowOffsetY=0;
  x.fillStyle='#fbf1d8';x.beginPath();x.arc(mx,my,39,0,7);x.fill();x.strokeStyle='#b07a24';x.lineWidth=2;x.stroke();x.fillStyle='#5a3413';x.textAlign='center';x.font=`700 ${p.score>99?36:44}px ${FH}`;x.fillText(String(p.score),mx,my+3);
  // section titles
  x.fillStyle='#6b4a2a';x.textAlign='left';x.textBaseline='alphabetic';x.font=`italic 600 ${GG.ex.gray?19:25}px ${FH}`;x.fillText(GG.ex.gray?'unmarked mosaic · no glaze twice in a row or column':'mosaic',X(.45),147);x.font=`italic 600 25px ${FH}`;x.fillText('drying racks',X(-5.8),147);
  x.fillText('breakage',X(-5.8),Z(3.09)-58);
  // mosaic surround: limestone with grout between the cut-outs
  x.fillStyle='#b9a584';rr2(x,X(.45)-2,Z(-3.2)+3,5*CP*S+6,5*CP*S+4,10);x.fill();
  // racks: a faint stepped backdrop and row medallions
  for(let r=0;r<5;r++){const zc=Z(-3.2+.54+r*CP);const x0=X(-.45-.54-(cap(r)-1)*CP)-54;x.fillStyle='rgba(160,120,70,.12)';rr2(x,x0,zc-54,X(-.45)-x0+6,108,12);x.fill();
    x.fillStyle='#213d74';x.beginPath();x.arc(X(-.2),zc-14,16,0,7);x.fill();x.strokeStyle='#d9a441';x.lineWidth=2;x.stroke();x.fillStyle='#fbf1d8';x.font=`700 24px ${FH}`;x.textAlign='center';x.textBaseline='middle';x.fillText(String(r+1),X(-.2),zc-12);
    x.fillStyle='rgba(138,90,43,.7)';x.beginPath();x.moveTo(X(-.3),zc+10);x.lineTo(X(-.08),zc+22);x.lineTo(X(-.3),zc+34);x.fill()}
  // the recessed slots (seen through the top layer's cut-outs), with painted ambient occlusion at the walls
  const hs=49;const slot=(xc,zc,kind,glz)=>{x.save();rr2(x,xc-hs,zc-hs,2*hs,2*hs,9);x.clip();x.fillStyle=kind==='l'?'#cdb48a':kind==='x'?'#dcbcaa':GG.ex.gray?'#bdb5a6':'#f6efe0';x.fillRect(xc-hs,zc-hs,2*hs,2*hs);
      if(kind==='w'&&!GG.ex.gray)paintGlaze(x,glz,xc-42,zc-42,84,.3);if(kind==='x'){x.strokeStyle='rgba(160,48,42,.25)';x.lineWidth=3;x.beginPath();x.moveTo(xc-20,zc-20);x.lineTo(xc+20,zc+20);x.moveTo(xc+20,zc-20);x.lineTo(xc-20,zc+20);x.stroke()}
      for(const [lw,a] of [[16,.1],[8,.14],[3,.22]]){x.lineWidth=lw;x.strokeStyle=`rgba(40,22,8,${a})`;rr2(x,xc-hs,zc-hs,2*hs,2*hs,9);x.stroke()}x.restore();
      x.lineWidth=2;x.strokeStyle=kind==='x'?'rgba(160,48,42,.55)':'rgba(120,80,40,.45)';rr2(x,xc-hs-4,zc-hs-4,2*hs+8,2*hs+8,12);x.stroke()};
  for(const [sx,sz,kind] of boardSlots()){const r=Math.round((sz+3.2-.54)/CP),k=Math.round((sx-.45-.54)/CP);slot(X(sx),Z(sz),kind,kind==='w'?WALLC(r,k):null)}
  // breakage penalties in red medallions
  const fz=Z(3.09);for(let k=0;k<7;k++){const xc=X(-5.31+k*CP);x.fillStyle='#a8322a';x.beginPath();x.arc(xc,fz+84,19,0,7);x.fill();x.fillStyle='#fbe9dc';x.font=`700 24px ${FH}`;x.textAlign='center';x.textBaseline='middle';x.fillText(String(FLOOR[k]),xc,fz+86)}
  x.textAlign='left';x.textBaseline='alphabetic';x.fillStyle='#6b4a2a';x.font=`italic 600 24px ${FH}`;x.fillText('extra tiles go to the shard box, no penalty',X(1.9),fz-18);
  x.fillStyle='#213d74';x.font=`700 26px ${FH}`;x.fillText(`at the end:  row +${BONUS.row}  ·  column +${BONUS.col}  ·  glaze +${BONUS.colour}`,X(1.9),fz+30);o.t.needsUpdate=true}
function shade(h,k){const c=hx(h);const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return `rgb(${f(c[0])},${f(c[1])},${f(c[2])})`}
// ---------- dynamic pieces: tiles fly between slots ----------
function wantTiles(){const w=[];G.fac.forEach((a,i)=>a.forEach((t,k)=>w.push({sl:`f${i}_${k}`,k:t})));V3.ctrN=G.ctr.length;G.ctr.forEach((t,k)=>w.push({sl:`c_${k}`,k:t}));
  for(const p of G.pl){if(!V3.L.bp[p.i])continue;p.lines.forEach((L,r)=>L.forEach((t,k)=>w.push({sl:`l${p.i}_${r}_${k}`,k:t})));p.wall.forEach((row,r)=>row.forEach((v,c)=>{if(v>=0)w.push({sl:`w${p.i}_${r}_${c}`,k:v<5?v:PRISM})}));p.floor.forEach((t,k)=>{if(t!==SUN)w.push({sl:`x${p.i}_${k}`,k:t})})}return w}
V3.tseq=0;
function tileObj(k){const n=V3.tseq++;const m=new THREE.Mesh(V3.tgeo,V3.tmat[k][n%3]);m.castShadow=true;m.receiveShadow=true;const b=new THREE.Mesh(V3.blobGeo,V3.blobMat);b.position.y=.004;b.renderOrder=-1;m.add(b);V3.scene.add(m);
  return {m,k,b,jr:(((n*7919)%100)/100-.5)*.06}}
function sync3D(fast){if(!V3.on||!G||!V3.L)return;V3.dirty=3;if(PH)PH.wake();for(const pi in V3.boards)paintBoard(V3.boards[pi].tex,+pi);
  const lk=G.bag.length+'|'+G.lid.length;if(V3.lblKey!==lk){V3.lblKey=lk;setLabel(V3.bagLbl,`clay sack · ${G.bag.length}`);setLabel(V3.lidLbl,`shard box · ${G.lid.length}`)}
  const sn=Math.min(V3.shards?V3.shards.length:0,Math.ceil(G.lid.length/2));if(V3.shardN!==sn){V3.shardN=sn;V3.shards.forEach((m,i)=>m.visible=i<sn)}
  const want=wantTiles();const have=V3.tiles;const next={};const pend=[];const now=V3.t;const anim=ANIM&&!fast;
  for(const w of want){const o=have[w.sl];if(o&&o.k===w.k){next[w.sl]=o;delete have[w.sl];aim(o,w.sl,anim?.25:0,0,0)}else pend.push(w)}
  const spare=Object.values(have);let walls=0;const newOnes=[];
  for(const w of pend){const tp=slotPos(w.sl);let i=-1,bd=1e9;spare.forEach((o,j)=>{if(o.k!==w.k||!tp)return;const d=Math.hypot(o.m.position.x-tp.x,o.m.position.z-tp.z);if(d<bd){bd=d;i=j}});if(i>=0){const o=spare.splice(i,1)[0];next[w.sl]=o;const toWall=w.sl[0]==='w';if(toWall)walls++;aim(o,w.sl,anim?(toWall?.9:.65):0,anim?1.6:0,toWall?Math.min(1.2,.1*walls):0)}else newOnes.push(w)}
  for(const w of newOnes){const o=tileObj(w.k);const p=slotPos(w.sl);const src=w.sl[0]==='f'?V3.L.bag:null;o.m.position.set(src?src.x:p.x,src?2.2:p.y+3,src?src.z:p.z);next[w.sl]=o;aim(o,w.sl,anim?.7:0,anim?1.2:0,anim&&walls?Math.min(2.2,1+.1*walls)+Math.random()*.3:anim?Math.random()*.3:0)}
  for(const o of spare){const d=V3.L.lid;o.go={from:o.m.position.clone(),to:new THREE.Vector3(d.x+(Math.random()-.5),.3,d.z+(Math.random()-.5)*.8),t0:now+(walls?.5:0),dur:anim?.7:0,arc:1.2,s0:o.m.scale.x,s1:.7,die:1}}
  V3.dying=(V3.dying||[]).concat(spare);V3.tiles=next;
  let sp;if(G.markerIn==='ctr'){const cnt=G.ctr.length;const q=slotPos(`c_${cnt}`);sp={x:q.x,y:.04,z:q.z}}else{const pl=P(G.markerIn);const k=pl.floor.indexOf(SUN);const q=V3.L.bp[G.markerIn]?slotPos(`x${G.markerIn}_${Math.max(0,k)}`):{x:0,z:0,y:.1};sp={x:q.x,y:.15,z:q.z}}
  V3.sunTok.userData.pos.set(sp.x,sp.y,sp.z);if(!anim)V3.sunTok.position.copy(V3.sunTok.userData.pos);V3.sunTok.visible=G.markerIn==='ctr'||!!V3.L.bp[G.markerIn];
  syncHighlights()}
function aim(o,sl,dur,arc,delay){const p=slotPos(sl);if(!p)return;const to=new THREE.Vector3(p.x,p.y,p.z);o.goal=to;o.sl=sl;const s=p.s||1;if(o.go&&o.go.to.distanceTo(to)<.01&&o.go.s1===s)return;if(!dur&&!(o.go&&V3.t<o.go.t0+o.go.dur)){o.m.position.copy(to);o.m.scale.setScalar(s);o.m.rotation.set(0,o.jr||0,0);o.go=null;return}
  o.go={from:o.m.position.clone(),to,t0:V3.t+(delay||0),dur:dur||.2,arc:arc||0,s0:o.m.scale.x,s1:s,sl}}
// ---------- feedback: sparkles, dust puffs, score pops ----------
function initFx(){const N=360;const g=new THREE.BufferGeometry();const F=V3.fx={N,pos:new Float32Array(N*3),col:new Float32Array(N*4),vel:new Float32Array(N*3),life:new Float32Array(N),max:new Float32Array(N),rgb:new Float32Array(N*3),grav:new Float32Array(N),i:0,alive:0};
  g.setAttribute('position',new THREE.BufferAttribute(F.pos,3));g.setAttribute('color',new THREE.BufferAttribute(F.col,4));F.g=g;
  const pts=new THREE.Points(g,new THREE.PointsMaterial({size:.34,map:V3.T.spark,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));pts.frustumCulled=false;pts.renderOrder=6;V3.scene.add(pts);
  // idle life on High: dust motes drifting through the sunlight
  const M=90,mg=new THREE.BufferGeometry(),mp=new Float32Array(M*3),R=rng(3);for(let i=0;i<M;i++){mp[i*3]=(R()-.5)*40;mp[i*3+1]=.6+R()*6;mp[i*3+2]=(R()-.5)*34}mg.setAttribute('position',new THREE.BufferAttribute(mp,3));
  V3.motes=new THREE.Points(mg,new THREE.PointsMaterial({size:.12,map:V3.T.spark,color:0xfff0c8,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending}));V3.motes.frustumCulled=false;V3.scene.add(V3.motes)}
function burst(x,y,z,n,col,kind){const F=V3.fx;const c=new THREE.Color(col);for(let k=0;k<n;k++){const i=F.i;F.i=(F.i+1)%F.N;const a=Math.random()*Math.PI*2;const sp=kind==='dust'?.8+Math.random()*1.2:1.2+Math.random()*1.8;
    F.pos[i*3]=x+Math.cos(a)*.3;F.pos[i*3+1]=y+.1;F.pos[i*3+2]=z+Math.sin(a)*.3;F.vel[i*3]=Math.cos(a)*sp;F.vel[i*3+1]=kind==='dust'?.4+Math.random()*.6:1.4+Math.random()*2;F.vel[i*3+2]=Math.sin(a)*sp;
    const w=kind==='spark'&&Math.random()<.4;F.rgb[i*3]=w?1.4:c.r*1.6;F.rgb[i*3+1]=w?1.3:c.g*1.6;F.rgb[i*3+2]=w?1.1:c.b*1.6;F.grav[i]=kind==='dust'?-.6:1.2;F.max[i]=F.life[i]=kind==='dust'?.6+Math.random()*.3:.7+Math.random()*.5}
  V3.fxBusy=V3.t+1.4;if(PH)PH.wake()}
function tickFx(dt){const F=V3.fx;if(!F||V3.t>(V3.fxBusy||0)+.1)return false;for(let i=0;i<F.N;i++){if(F.life[i]<=0){F.col[i*4+3]=0;continue}F.life[i]-=dt;const u=Math.max(0,F.life[i]/F.max[i]);
    F.vel[i*3]*=1-dt*2.5;F.vel[i*3+2]*=1-dt*2.5;F.vel[i*3+1]-=F.grav[i]*dt*2;F.pos[i*3]+=F.vel[i*3]*dt;F.pos[i*3+1]+=F.vel[i*3+1]*dt;F.pos[i*3+2]+=F.vel[i*3+2]*dt;
    F.col[i*4]=F.rgb[i*3];F.col[i*4+1]=F.rgb[i*3+1];F.col[i*4+2]=F.rgb[i*3+2];F.col[i*4+3]=u*u}
  F.g.attributes.position.needsUpdate=true;F.g.attributes.color.needsUpdate=true;return true}
function landFx(o,sl){const p=o.m.position;const t=sl[0];if(t==='w'){burst(p.x,p.y+.2,p.z,18,TBASE[o.k],'spark');const q=V3.popQ[sl];if(q){delete V3.popQ[sl];scorePop(p.x,p.z,'+'+q.pts)}}
  else if(t==='x')burst(p.x,p.y,p.z,12,'#caa27a','dust');else if(t==='l'||t==='c')burst(p.x,p.y,p.z,5,'#e8d8b8','dust')}
function scorePop(x,z,txt){const c=mkCanvas(256,128),g=c.getContext('2d');g.font='700 84px "Cormorant Garamond",Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=10;g.strokeStyle='rgba(60,30,8,.85)';g.strokeText(txt,128,66);
  const gr=g.createLinearGradient(0,30,0,100);gr.addColorStop(0,'#fff6c8');gr.addColorStop(1,'#f0b030');g.fillStyle=gr;g.fillText(txt,128,66);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:texOf(c,true),transparent:true,depthTest:false,depthWrite:false}));s.scale.set(1.8,.9,1);s.position.set(x,1,z);s.renderOrder=9;V3.scene.add(s);V3.pops.push({s,t0:V3.t})}
// engine events (called by the UI): remember score pops until the tile lands
function V3fx(f){if(!V3.on||!ANIM)return;if(f.t==='wall'){const x=f.x;V3.popQ[`w${x.p}_${x.r}_${x.c}`]={pts:x.pts,t:V3.t}}}
// ---------- glow: legal targets get crisp glowing outlines (SDF shader); the preview shows ghost tiles ----------
const HALO_FS=`uniform vec3 uCol;uniform float uOp;uniform vec2 uSize;uniform float uR,uShape,uPad;varying vec2 vUv;
  float sdb(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
  void main(){vec2 full=uSize+2.*uPad;vec2 p=(vUv-.5)*full;float d=uShape>.5?length(p)-uSize.x*.5:sdb(p,uSize*.5,uR);
    float line=1.-smoothstep(.02,.05,abs(d));float glow=exp(-max(d,0.)*11.)*.4*step(0.,d);float inner=(d<0.&&uShape<.5)?.08*exp(d*8.):0.;
    gl_FragColor=vec4(uCol,(line+glow+inner)*uOp);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;
function haloMesh(w,d,col,circle,y){const pad=.35;const u={uCol:{value:new THREE.Color(col).multiplyScalar(1.7)},uOp:{value:1},uSize:{value:new THREE.Vector2(w,d)},uR:{value:.12},uShape:{value:circle?1:0},uPad:{value:pad}};
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w+2*pad,d+2*pad),new THREE.ShaderMaterial({uniforms:u,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:HALO_FS,transparent:true,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.position.y=y;m.renderOrder=5;return m}
function syncHighlights(){const sc=V3.scene;V3.dirty=3;if(PH)PH.wake();for(const h of V3.halos){sc.remove(h);h.geometry.dispose();h.material.dispose()}V3.halos=[];for(const g of V3.ghosts)sc.remove(g);V3.ghosts=[];for(const o of Object.values(V3.tiles))o.lift=0;
  const H=UI.hl||{};const add=(x,z,w,d,col,ring,y)=>{const m=haloMesh(w,d,col||0xffc43a,ring,y||.3);m.position.x=x;m.position.z=z;sc.add(m);V3.halos.push(m);return m};
  for(const s of H.src||[]){if(s.src<0){const D=(V3.L.ring.cr+.2)*2;add(0,0,D,D,s.col||0xff9a1a,1,.14)}else{const K=V3.L.kilns[s.src];if(K)add(K.x,K.z,3.3,3.3,s.col||0xff9a1a,1,.31)}}
  for(const sl of H.tiles||[]){const o=V3.tiles[sl];if(o){o.lift=1;const p=slotPos(sl);add(p.x,p.z,.98*(p.s||1),.98*(p.s||1),0xffe070,0,p.y+.02)}}
  for(const l of H.lines||[]){const b=V3.L.bp[l.p];if(!b)continue;if(l.r<5)add(b.x-.45-cap(l.r)*CP/2,b.z-3.2+.54+l.r*CP,cap(l.r)*CP,CP,l.col||0xffc43a,0,.25);else add(b.x-5.31+3*CP,b.z+3.09,7*CP,CP,l.col||0xff7a4a,0,.25)}
  for(const c of H.cells||[]){const b=V3.L.bp[c.p];if(b)add(b.x+.99+c.c*CP,b.z-3.2+.54+c.r*CP,CP-.02,CP-.02,c.col||0xffc43a,0,.25)}
  for(const g of H.ghost||[]){const p=slotPos(g.sl);if(!p)continue;const m=new THREE.Mesh(V3.tgeo,V3.gmat[g.k]);m.position.set(p.x,p.y+.02,p.z);m.scale.setScalar(p.s||1);sc.add(m);V3.ghosts.push(m);if(g.bad){const r=add(p.x,p.z,.95,.95,0xff3a2a,0,.46);r.userData.fixed=.95}}}
// ---------- the frame loop: renders only while something moves (plus a gentle idle on High) ----------
const ease=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
function loop3D(){(PH?PH.raf:requestAnimationFrame)(loop3D);const dt=Math.min(1,V3.clock.getDelta());V3.t+=dt;const t=V3.t;
  const tl=Object.values(V3.tiles);const fxOn=V3.t<(V3.fxBusy||0)+.1;
  const busy=V3.dirty>0||V3.drag||fxOn||V3.pops.length||tl.some(o=>o.go||o.lift||o.land)||(V3.dying&&V3.dying.length)||(V3.camTo&&V3.camNow&&V3.camNow.pos.distanceTo(V3.camTo.pos)>.01)||V3.sunTok.position.distanceTo(V3.sunTok.userData.pos)>.005||!!(PH&&PH.testing);V3.busy=!!busy;
  V3.avg=(V3.avg||.016)*.95+dt*.05;if(!busy){const gap=V3.halos.length?.08:(V3.q==='high'&&V3.avg<1/40?1/24:1e9);if(t-(V3.lastR||0)<gap)return}const rdt=Math.min(.1,t-(V3.lastR||t));V3.lastR=t;if(V3.dirty>0)V3.dirty--;
  const move=o=>{const g=o.go;if(!g)return true;if(t<g.t0)return false;const u=g.dur?Math.max(0,Math.min(1,(t-g.t0)/g.dur)):1;const e=ease(u);
    o.m.position.lerpVectors(g.from,g.to,e);o.m.position.y+=Math.sin(Math.PI*u)*g.arc;o.m.rotation.y=(o.jr||0)+(g.arc?(1-e)*Math.PI*.5:0);o.m.rotation.x=g.arc?Math.sin(Math.PI*u)*.3:0;o.m.scale.setScalar(g.s0+(g.s1-g.s0)*e);
    if(o.b)o.b.visible=false;if(u>=1){o.go=null;o.m.rotation.x=0;if(o.b)o.b.visible=true;if(g.arc>.3&&!g.die&&ANIM){o.land=t;landFx(o,g.sl||'')}return true}return false};
  for(const o of tl){move(o);if(!o.go&&o.goal){let y=o.goal.y+(o.lift?.28+.07*Math.sin(t*5):0);if(o.land){const ph=t-o.land;if(ph<.5)y+=.16*Math.exp(-ph*9)*Math.abs(Math.sin(ph*16));else o.land=0}o.m.position.y=y;
      if(o.b){const h=(y-o.goal.y)/(o.m.scale.x||1);o.b.position.y=.004-h;o.b.scale.setScalar(1+h*.8);o.b.visible=h<1}}}
  if(V3.dying)V3.dying=V3.dying.filter(o=>{if(move(o)){V3.scene.remove(o.m);return false}return true});
  const sp=V3.sunTok.userData.pos;V3.sunTok.position.lerp(sp,Math.min(1,dt*(ANIM?5:60)));
  for(const h of V3.halos)h.material.uniforms.uOp.value=h.userData.fixed||(.62+.38*Math.abs(Math.sin(t*3.2)));
  if(V3.camTo&&V3.camNow){const k=Math.min(1,dt*4);V3.camNow.pos.lerp(V3.camTo.pos,k);V3.camNow.look.lerp(V3.camTo.look,k);V3.cam.position.copy(V3.camNow.pos);V3.cam.lookAt(V3.camNow.look)}
  tickFx(rdt);
  // queued pops whose tile never animated
  for(const k in V3.popQ){if(t-V3.popQ[k].t>3){const p=slotPos(k);if(p)scorePop(p.x,p.z,'+'+V3.popQ[k].pts);delete V3.popQ[k]}}
  V3.pops=V3.pops.filter(q=>{const a=t-q.t0;q.s.position.y=1+a*1.1;q.s.material.opacity=a<.8?1:Math.max(0,1-(a-.8)/.6);if(a>1.4){V3.scene.remove(q.s);q.s.material.map.dispose();q.s.material.dispose();return false}return true});
  if(V3.motes&&V3.motes.visible){const L=V3.L;if(L){V3.motes.position.set((L.box.x0+L.box.x1)/2,0,(L.box.z0+L.box.z1)/2)}V3.motes.rotation.y=t*.01;V3.motes.position.y=Math.sin(t*.3)*.3;V3.motes.material.opacity=.28+.08*Math.sin(t*1.7)}
  drawFrame3D()}
function pick3D(e){const rc=V3.r.domElement.getBoundingClientRect();const m=new THREE.Vector2(((e.clientX-rc.left)/rc.width)*2-1,-((e.clientY-rc.top)/rc.height)*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(m,V3.cam);
  const tl=Object.entries(V3.tiles).map(([sl,o])=>{o.m.userData.sl=sl;return o.m});const hits=ray.intersectObjects(tl.concat(V3.hits),false);
  for(const h of hits){if(h.object.userData.sl)return {k:'tile',sl:h.object.userData.sl};if(h.object.userData.hit)return h.object.userData.hit}return null}
// screen position of a slot, for tests and anchored hints
function slotScreen(sl){const p=slotPos(sl);if(!p)return null;const v=new THREE.Vector3(p.x,p.y+.2,p.z).project(V3.cam);const cv=V3.r.domElement;return {x:(v.x+1)/2*cv.clientWidth,y:(1-v.y)/2*cv.clientHeight}}
// true when nothing is moving (tests wait for this before tapping the 3D table)
function V3idle(){if(!V3.on)return true;return !Object.values(V3.tiles).some(o=>o.go)&&!(V3.dying&&V3.dying.length)&&!(V3.camTo&&V3.camNow&&V3.camNow.pos.distanceTo(V3.camTo.pos)>.05)}
