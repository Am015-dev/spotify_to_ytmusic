let ENVD=true;const ENVC=new Map();function buildEnv(){ENVD=false;const id=MOOD.id;let t=ENVC.get(id);if(!t){const pm=new THREE.PMREMGenerator(renderer);t=pm.fromScene(ENVSC,.02).texture;pm.dispose();ENVC.set(id,t)}scene.environment=t;if(ENVC.size>3)for(const[k,o]of ENVC)if(o!==t){o.dispose();ENVC.delete(k);break}}
scene.environmentIntensity=.8;
let lightningT=6,litV=0;
function applyMood(id){const m=MOODS.find(x=>x.id===id)||ATHM.find(x=>x.id===id)||MOODS[0];const changed=m!==MOOD;MOOD=m;const U=SKYU;
  U.uTop.value.set(...m.top);U.uMid.value.set(...m.mid);U.uHor.value.set(...m.hor);U.uGround.value.set(...m.gnd);U.uSun.value.set(...m.sun);U.uStar.value=m.star;U.uBand.value=m.band;U.uMoon.value=m.moon;U.uCloud.value=m.cloud;U.uLit.value=0;
  scene.fog.color.set(m.fog);scene.fog.density=m.fogD;hemi.color.set(m.hemi[0]);hemi.groundColor.set(m.hemi[1]);hemi.intensity=m.hemi[2];moonL.color.set(m.key[0]);moonL.intensity=m.key[1];moonL.position.set(...m.key[2]);
  renderer.toneMappingExposure=m.exp;bloom.strength=m.bloom[0];bloom.radius=m.bloom[1];scene.environmentIntensity=m.env;applyMoodMaterials();if(changed||!scene.environment)ENVD=true}
function applyMoodMaterials(){const m=MOOD;if(typeof GLASS!=='undefined')for(const g of GLASS)g.emissiveIntensity=m.win;
  if(MAT.road&&MAT.road.isMeshStandardMaterial){MAT.road.roughness=m.road[0];MAT.road.metalness=m.road[1];MAT.road.envMapIntensity=m.road[2]}
  if(MAT.pool)MAT.pool.opacity=.24*m.lamps;if(MAT.athB)MAT.athB.emissiveIntensity=m.win*.9;if(MAT.athM)MAT.athM.emissiveIntensity=m.win*.42;if(MAT.athMtn)MAT.athMtn.color.set(m.fog).lerp(new THREE.Color(m.lamps>.5?'#07080e':'#8292aa'),.42);for(const sl of(typeof searchlights!=='undefined'?searchlights:[]))sl.g.visible=m.id!=='dawn';
  if(typeof rain!=='undefined'&&rain){rain.geometry.setDrawRange(0,Math.round(m.rain[0]*(typeof rainScale==='number'?rainScale:1))*2);rain.material.opacity=m.rain[1];rain.visible=m.rain[0]>0}}

/* ============================================================ 4 · textures */
/* Some browsers (privacy/anti-fingerprinting modes, some GPU drivers, embedded web views) refuse or corrupt 2D-canvas
   uploads to WebGL, which turns every texture black. At boot we render a known canvas colour through each upload path
   and keep the first path that reads back correctly; if none does, textures fall back to each canvas's base colour. */
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');const fr=g.fillRect.bind(g);
  g.fillRect=(x,y,W,H)=>{if(c._base===undefined&&x<=0&&y<=0&&W>=w&&H>=h&&typeof g.fillStyle==='string')c._base=g.fillStyle;fr(x,y,W,H)};return[c,g]}
const TEXV=[{canvas:1,mip:1,name:'canvas'},{canvas:1,mip:0,name:'canvas, no mipmaps'},{mip:1,name:'pixel copy'},{mip:0,name:'pixel copy, no mipmaps'},{half:1,mip:0,name:'float pixel copy'}];
let TEXMODE=0;
const s2l=x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4);
function dataTex(d,w,h,v,srgb){let t;
  if(v.half){const a=new Uint16Array(d.length);for(let i=0;i<d.length;i++){const x=d[i]/255;a[i]=THREE.DataUtils.toHalfFloat(srgb&&(i&3)!==3?s2l(x):x)}t=new THREE.DataTexture(a,w,h,THREE.RGBAFormat,THREE.HalfFloatType)}
  else{t=new THREE.DataTexture(new Uint8Array(d),w,h);if(srgb)t.colorSpace=THREE.SRGBColorSpace}
  t.flipY=true;return t}
function mkTex(c,v,srgb){let t;
  if(v.none){const col=new THREE.Color();let a=0;if(c._base&&c._base!=='transparent'){try{col.setStyle(c._base,THREE.SRGBColorSpace);a=255}catch(e){}}
    t=new THREE.DataTexture(new Uint8Array([col.r*255,col.g*255,col.b*255,a].map(Math.round)),1,1);if(srgb)t.colorSpace=THREE.SRGBColorSpace}
  else if(v.canvas){t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace}
  else{t=dataTex(c.getContext('2d').getImageData(0,0,c.width,c.height).data,c.width,c.height,v,srgb);t.userData.src=c;t.userData.srgb=srgb}
  t.generateMipmaps=!!v.mip&&!v.none;t.minFilter=t.generateMipmaps?THREE.LinearMipmapLinearFilter:THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return t}
function texProbe(v){const[c,g]=cv(16,16);g.fillStyle='#ff8000';g.fillRect(0,0,16,16);const t=mkTex(c,v,true);
  const sc=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1),m=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));sc.add(m);
  const rt=new THREE.WebGLRenderTarget(4,4);renderer.setRenderTarget(rt);renderer.render(sc,cam);renderer.setRenderTarget(null);const px=new Uint8Array(64);renderer.readRenderTargetPixels(rt,0,0,4,4,px);
  rt.dispose();t.dispose();m.material.dispose();m.geometry.dispose();let ok=true;for(let i=0;i<64;i+=4)if(!(px[i]>200&&px[i+1]>20&&px[i+1]<120&&px[i+2]<45))ok=false;return ok}
TEXMODE=TEXV.length;{let gk='';try{const gl=renderer.getContext(),x=gl.getExtension('WEBGL_debug_renderer_info');gk=(x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER))+'|'+navigator.userAgent}catch(e){}let hit=false;try{hit=gk&&localStorage.getItem('mho_texprobe')===gk}catch(e){}
  if(hit)TEXMODE=0;else{for(let i=0;i<TEXV.length;i++){let ok=false;try{ok=texProbe(TEXV[i])}catch(e){}if(ok){TEXMODE=i;break}}if(TEXMODE===0&&gk)try{localStorage.setItem('mho_texprobe',gk)}catch(e){}}}
{const f=new URLSearchParams(location.search).get('texmode');if(f!==null)TEXMODE=+f}
const TEXVAR=TEXV[TEXMODE]||{none:1,name:'solid colours'};console.info('[overdrive] texture path:',TEXVAR.name);
function tex(c,rep=true,srgb=true){const t=mkTex(c,TEXVAR,srgb);if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping}t.anisotropy=8;return t}
function refreshTex(t){const c=t.userData.src;if(c&&t.isDataTexture){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,a=t.image.data;
    if(a instanceof Uint16Array){for(let i=0;i<d.length;i++){const x=d[i]/255;a[i]=THREE.DataUtils.toHalfFloat(t.userData.srgb&&(i&3)!==3?s2l(x):x)}}else a.set(d)}
  if(!TEXVAR.none)t.needsUpdate=true}
// glows and shadows are computed straight into pixel data so they never depend on the canvas path
function radial(stops,sz=128){const st=stops.map(([o,col])=>{const n=col.match(/[\d.]+/g).map(Number);return[o,n[0],n[1],n[2],n[3]??1]});const d=new Uint8Array(sz*sz*4);
  for(let y=0;y<sz;y++)for(let x=0;x<sz;x++){const r=Math.min(1,Math.hypot(x+.5-sz/2,y+.5-sz/2)/(sz/2));let k=0;while(k<st.length-2&&r>st[k+1][0])k++;const A=st[k],B=st[k+1]||A,f=B[0]>A[0]?Math.min(1,Math.max(0,(r-A[0])/(B[0]-A[0]))):0;
    const i=(y*sz+x)*4;for(let j=0;j<3;j++)d[i+j]=A[1+j]+(B[1+j]-A[1+j])*f;d[i+3]=255*(A[4]+(B[4]-A[4])*f)}
  const v=TEXVAR.none||TEXVAR.canvas?{mip:1}:TEXVAR;const t=dataTex(d,sz,sz,v,true);t.generateMipmaps=!!v.mip;t.minFilter=t.generateMipmaps?THREE.LinearMipmapLinearFilter:THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return t}
const GLOW=radial([[0,'rgba(255,255,255,1)'],[.22,'rgba(255,255,255,.55)'],[1,'rgba(255,255,255,0)']]);
const FLARE=radial([[0,'rgba(255,255,255,1)'],[.08,'rgba(255,255,255,.9)'],[.25,'rgba(255,255,255,.25)'],[1,'rgba(255,255,255,0)']]);
const SHADOW=radial([[0,'rgba(0,0,0,.85)'],[.55,'rgba(0,0,0,.45)'],[1,'rgba(0,0,0,0)']]);
// road: navy hex plates, glowing hex outlines and circuit traces, rumble strips, edge lines, centre dash (one tile = W × W)
function roadTex(){const Z=512,[c,g]=cv(Z,Z),[e,ge]=cv(Z,Z);const r=mul(11);g.fillStyle='#0a0b2a';g.fillRect(0,0,Z,Z);ge.fillStyle='#000';ge.fillRect(0,0,Z,Z);
  const rows=10,hh=Z/rows,rad=hh/Math.sqrt(3),hex=(ctx,x,y,rd)=>{ctx.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;ctx.lineTo(x+Math.cos(a)*rd,y+Math.sin(a)*rd)}ctx.closePath()};
  for(let col=-1;col*1.5*rad<Z+rad;col++)for(let row=-1;row<=rows;row++){const x=col*1.5*rad,y=row*hh+(col&1?hh/2:0);const sh=r();
    hex(g,x,y,rad-1.5);g.fillStyle=`rgb(${11+sh*9|0},${12+sh*10|0},${44+sh*22|0})`;g.fill();g.strokeStyle='#1d2c78';g.lineWidth=3;g.stroke();
    const mg=r()<.05;hex(ge,x,y,rad-1.5);ge.strokeStyle=mg?'rgba(255,62,200,.75)':'rgba(22,200,255,.42)';ge.lineWidth=mg?3:2.2;ge.stroke();
    if(r()<.08){hex(ge,x,y,rad*.52);ge.strokeStyle='rgba(22,200,255,.6)';ge.lineWidth=2;ge.stroke()}}
  for(let i=0;i<26;i++){let x=40+r()*(Z-80),y=r()*Z;ge.strokeStyle='rgba(76,234,255,.28)';ge.lineWidth=2;ge.beginPath();ge.moveTo(x,y);for(let k=0;k<4;k++){if(k%2)x+=(r()-.5)*90;else y+=(r()-.5)*120;ge.lineTo(x,y)}ge.stroke();ge.fillStyle='rgba(76,234,255,.6)';ge.fillRect(x-2.5,y-2.5,5,5)}
  for(let y=0;y<Z;y+=32){const a=(y/32)%2?'#ff2d95':'#ffffff';for(const x of[0,Z-13]){g.fillStyle=a;g.fillRect(x,y,13,32);ge.fillStyle=a;ge.globalAlpha=.55;ge.fillRect(x,y,13,32);ge.globalAlpha=1}}
  for(const x of[24,Z-29]){g.fillStyle='#dff6ff';g.fillRect(x,0,5,Z);ge.fillStyle='rgba(191,244,255,.85)';ge.fillRect(x,0,5,Z)}
  for(let y=0;y<Z;y+=128){g.fillStyle='#e8f6ff';g.fillRect(Z/2-3,y,6,64);ge.fillStyle='rgba(255,255,255,.6)';ge.fillRect(Z/2-3,y,6,64)}
  return[tex(c),tex(e)]}
// wall face: dark panels with seams, chevrons pointing along the direction of travel (one tile = 25 m)
function wallTex(beam){const[c,g]=cv(1024,128),[e,ge]=cv(1024,128);const gr=g.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#2a3160');gr.addColorStop(1,'#141833');g.fillStyle=gr;g.fillRect(0,0,1024,128);ge.fillStyle='#000';ge.fillRect(0,0,1024,128);
  for(let x=0;x<1024;x+=128){g.fillStyle='#0b0e22';g.fillRect(x,0,3,128);g.fillStyle='rgba(120,150,255,.25)';g.fillRect(x+3,0,1,128)}
  for(let x=10;x<1024;x+=64){ge.fillStyle=beam;g.fillStyle=beam;for(const ctx of[g,ge]){ctx.globalAlpha=ctx===g?.5:1;ctx.beginPath();ctx.moveTo(x,26);ctx.lineTo(x+16,26);ctx.lineTo(x+40,64);ctx.lineTo(x+16,102);ctx.lineTo(x,102);ctx.lineTo(x+24,64);ctx.closePath();ctx.fill();ctx.globalAlpha=1}}
  return[tex(c),tex(e)]}
// glass tower facade and a matching window map (lit panes toggle during the race)
function facadeTex(){const[c,g]=cv(256,512);const cols=16,rows=36,cw=256/cols,ch=512/rows;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const X=x*cw,Y=y*ch;if(y%6===5){g.fillStyle='#10152c';g.fillRect(X,Y,cw,ch);continue}
    const gr=g.createLinearGradient(0,Y,0,Y+ch);gr.addColorStop(0,'#3a5c9a');gr.addColorStop(.25,'#1f3462');gr.addColorStop(1,'#142347');g.fillStyle=gr;g.fillRect(X+1,Y+1,cw-2,ch-2);g.fillStyle='rgba(180,210,255,.18)';g.fillRect(X+1,Y+1,cw-2,2)}
  g.fillStyle='#10152c';g.fillRect(0,0,3,3);return tex(c)}
const WIN_CELLS=[];function windowTex(seed,pal){const r=mul(seed);const[c,g]=cv(256,512);g.fillStyle='#000';g.fillRect(0,0,256,512);const cols=16,rows=36,cw=256/cols,ch=512/rows;const cells=[];
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){if(y%6===5)continue;const cell=[x*cw+4,y*ch+4,cw-8,ch-7];cells.push(cell);if(r()<.3){g.fillStyle=pal[Math.floor(r()*pal.length)];g.globalAlpha=.45+r()*.55;g.fillRect(...cell);g.globalAlpha=1}}
  const t=tex(c);WIN_CELLS.push({g,t,cells,pal,r});return t}
function streetTex(){const[c,g]=cv(512,512),[e,ge]=cv(512,512);g.fillStyle='#0c0a18';g.fillRect(0,0,512,512);ge.fillStyle='#000';ge.fillRect(0,0,512,512);const r=mul(5);
  for(let i=0;i<3000;i++){g.fillStyle=`rgba(90,80,140,${r()*.08})`;g.fillRect(r()*512,r()*512,2,2)}
  g.fillStyle='#16132a';for(const p of[96,352]){g.fillRect(p-22,0,44,512);g.fillRect(0,p-22,512,44)}
  for(const p of[96,352])for(let k=0;k<512;k+=36){ge.fillStyle='rgba(255,180,106,.9)';ge.fillRect(p-24,k,4,4);ge.fillRect(p+20,k+18,4,4);ge.fillRect(k,p-24,4,4);ge.fillRect(k+18,p+20,4,4)}
  for(let i=0;i<40;i++){ge.fillStyle=['#ff2d95','#22e4ff','#8c55ff'][i%3];ge.globalAlpha=.7;ge.fillRect(r()*512,r()*512,3,3)}ge.globalAlpha=1;return[tex(c),tex(e)]}
function billboardTex([name,tag,c1,c2]){const[c,g]=cv(512,256);const gr=g.createLinearGradient(0,0,512,256);const d=new THREE.Color(c1).multiplyScalar(.35);gr.addColorStop(0,'#'+d.getHexString());gr.addColorStop(1,c1);g.fillStyle=gr;g.fillRect(0,0,512,256);
  g.fillStyle='rgba(0,0,0,.18)';for(let y=0;y<256;y+=4)g.fillRect(0,y,512,1);g.fillStyle=c2;g.fillRect(0,0,512,8);g.fillRect(0,248,512,8);
  g.save();g.translate(70,128);g.strokeStyle='#fff';g.lineWidth=9;g.beginPath();g.moveTo(-36,-36);g.lineTo(36,36);g.moveTo(36,-36);g.lineTo(-36,36);g.stroke();g.strokeStyle=c2;g.lineWidth=4;g.strokeRect(-46,-46,92,92);g.restore();
  g.fillStyle='#fff';let fs=76;g.font=`italic 900 ${fs}px "Arial Black",system-ui,sans-serif`;while(g.measureText(name).width>370&&fs>30){fs-=4;g.font=`italic 900 ${fs}px "Arial Black",system-ui,sans-serif`}g.fillText(name,132,128);
  g.fillStyle=c2;g.font='italic 800 22px system-ui,sans-serif';g.fillText(tag,134,170);return tex(c,false)}
function vSignTex(txt,col){const[c,g]=cv(128,512);g.fillStyle='#05030c';g.fillRect(0,0,128,512);const n=[...txt].length,step=Math.min(84,470/n);g.font=`italic 900 ${Math.min(80,step*.95)}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';
  g.shadowColor=col;g.shadowBlur=18;g.fillStyle=col;[...txt].forEach((ch,i)=>g.fillText(ch,64,256-(n-1)*step/2+i*step));g.shadowBlur=0;g.fillStyle='#fff';g.globalAlpha=.5;[...txt].forEach((ch,i)=>g.fillText(ch,64,256-(n-1)*step/2+i*step));g.globalAlpha=1;
  g.strokeStyle=col;g.lineWidth=5;g.strokeRect(6,6,116,500);g.lineWidth=2;g.strokeRect(14,14,100,484);return tex(c,false)}
function textTex(txt,col,w=1024,h=128){const[c,g]=cv(w,h);g.fillStyle='rgba(3,10,20,.92)';g.fillRect(0,0,w,h);let fs=h*.62;g.font=`italic 900 ${fs}px system-ui,sans-serif`;while(g.measureText(txt).width>w*.9){fs-=4;g.font=`italic 900 ${fs}px system-ui,sans-serif`}
  g.textAlign='center';g.textBaseline='middle';g.shadowColor=col;g.shadowBlur=14;g.fillStyle=col;g.fillText(txt,w/2,h/2+2);g.shadowBlur=0;g.strokeStyle=col;g.lineWidth=4;g.strokeRect(2,2,w-4,h-4);return tex(c,false)}
function padTex(kind){const[c,g]=cv(128,256);if(kind==='boost'){g.fillStyle='rgba(0,0,0,0)';for(let i=0;i<4;i++){const y=220-i*60;g.fillStyle=`rgba(255,${190+i*15},60,${.5+i*.15})`;g.beginPath();g.moveTo(10,y);g.lineTo(64,y-44);g.lineTo(118,y);g.lineTo(118,y+16);g.lineTo(64,y-28);g.lineTo(10,y+16);g.fill()}}
  else{g.strokeStyle='#4ceaff';g.lineWidth=8;g.strokeRect(8,8,112,240);g.fillStyle='rgba(76,234,255,.18)';g.fillRect(8,8,112,240);g.font='italic 900 90px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText('?',64,130)}return tex(c,false)}
function hazardTex(){const[c,g]=cv(256,64);for(let i=-2;i<12;i++){g.fillStyle=i%2?'#111':'#ffc23d';g.beginPath();g.moveTo(i*28,0);g.lineTo(i*28+28,0);g.lineTo(i*28+60,64);g.lineTo(i*28+32,64);g.fill()}return tex(c,false)}
function liveryTex(t){const[c,g]=cv(512,512);g.fillStyle=t.a;g.fillRect(0,0,512,512);if(t.pat&&t.pat!=='racing'){liveryPat(t,g);return tex(c,false)}
  const sd=g.createLinearGradient(0,0,512,0);sd.addColorStop(0,'rgba(0,0,0,0)');sd.addColorStop(.25,'rgba(0,0,0,0)');sd.addColorStop(.5,'rgba(0,0,0,.42)');sd.addColorStop(.75,'rgba(0,0,0,.2)');sd.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=sd;g.fillRect(0,0,512,512);
  g.fillStyle=t.b;g.fillRect(512*.19,0,512*.12,512);g.fillStyle=t.c;g.fillRect(512*.246,0,512*.008,512);
  g.fillStyle=t.b;for(let y=90;y<420;y+=70){g.beginPath();g.moveTo(512*.02,y);g.lineTo(512*.12,y+26);g.lineTo(512*.02,y+52);g.lineTo(512*.02,y+38);g.lineTo(512*.08,y+26);g.lineTo(512*.02,y+14);g.fill();g.beginPath();g.moveTo(512*.48,y);g.lineTo(512*.38,y+26);g.lineTo(512*.48,y+52);g.lineTo(512*.48,y+38);g.lineTo(512*.42,y+26);g.lineTo(512*.48,y+14);g.fill()}
  g.fillStyle=t.b;g.globalAlpha=.85;g.fillRect(512*.68,0,512*.14,512);g.globalAlpha=1;
  const r=mul(t.id.length*97);g.strokeStyle='rgba(0,0,0,.18)';for(let i=0;i<40;i++){const x=r()*512,y=r()*512;g.lineWidth=r()*2;g.beginPath();g.moveTo(x,y);g.lineTo(x+r()*4,y+20+r()*50);g.stroke()}
  g.fillStyle=t.c;g.font='italic 900 40px system-ui';g.save();g.translate(512*.62,300);g.rotate(Math.PI/2);g.fillText(t.name.split(' ')[0].toUpperCase(),0,0);g.restore();if(t.num!=null){t=Object.assign({},t,{pat:'racing'});liveryPat(t,g)}return tex(c,false)}
function wingTex(t){const[c,g]=cv(256,256);g.fillStyle=t.a;g.fillRect(0,0,256,256);g.fillStyle=t.b;for(let i=0;i<3;i++){g.save();g.translate(128,128);g.rotate(-.9);g.fillRect(-200,-60+i*48,400,22);g.restore()}g.fillStyle=t.c;g.fillRect(0,240,256,16);return tex(c)}

/* ============================================================ 5 · track data */
function buildTrackData(){
  const pts=CP.map(p=>V3(p[0]*S,p[1],p[2]*S));
  const curve=new THREE.CatmullRomCurve3(pts,true,'centripetal',.5);
  const L0=curve.getLength(),N=Math.round(L0/2),ds=L0/N,sp=curve.getSpacedPoints(N);
  const P=new Float32Array(N*3),T=new Float32Array(N*3),Rv=new Float32Array(N*3),U=new Float32Array(N*3),K=new Float32Array(N),B=new Float32Array(N),SEC=new Array(N);
  const tan=[];for(let i=0;i<N;i++){const a=sp[(i-1+N)%N],b=sp[(i+1)%N];tan.push(b.clone().sub(a).normalize())}
  let k=new Float32Array(N);const w=4;
  for(let i=0;i<N;i++){const t1=tan[(i-w+N)%N],t2=tan[(i+w)%N];k[i]=Math.atan2(t1.x*t2.z-t1.z*t2.x,t1.x*t2.x+t1.z*t2.z)/(2*w*ds)}
  const smooth=(a,r)=>{const o=new Float32Array(N);for(let i=0;i<N;i++){let s=0;for(let j=-r;j<=r;j++)s+=a[(i+j+N)%N];o[i]=s/(2*r+1)}return o};
  k=smooth(smooth(k,8),8);let b=new Float32Array(N);for(let i=0;i<N;i++)b[i]=clamp(k[i]*42,-.26,.26)*(TRK.bank||1);b=smooth(b,20);
  const Y=V3(0,1,0),fr=V3(),rt=V3(),up=V3();
  for(let i=0;i<N;i++){const p=sp[i],t=tan[i];fr.crossVectors(t,Y).normalize();rt.copy(fr).multiplyScalar(Math.cos(b[i])).addScaledVector(Y,-Math.sin(b[i]));up.crossVectors(rt,t).normalize();
    P.set([p.x,p.y,p.z],i*3);T.set([t.x,t.y,t.z],i*3);Rv.set([rt.x,rt.y,rt.z],i*3);U.set([up.x,up.y,up.z],i*3);K[i]=k[i];B[i]=b[i];
    let bi=0,bd=1e9;for(let j=0;j<CP.length;j++){const d=(CP[j][0]*S-p.x)**2+(CP[j][2]*S-p.z)**2+((CP[j][1]-p.y)*6)**2;if(d<bd){bd=d;bi=j}}SEC[i]=CP[bi][3]}
  const td={N,ds,L:N*ds,P,T,R:Rv,U,K,B,SEC,rev:false};
  const J=[];for(const js of TRK.jumps){
    if(js.kind==='river'){let a=-1,bb=-1;for(let i=0;i<N;i++){const x=P[i*3],z=P[i*3+2];if(x>=js.xmin*S&&x<=js.xmax*S&&z>RIVER[0]-4&&z<RIVER[1]+4){if(a<0)a=i;bb=i}}if(a>=0){let s0=a*ds,s1=bb*ds;if(js.jw&&s1-s0>js.jw){const c=(s0+s1)/2;s0=c-js.jw/2;s1=c+js.jw/2}J.push({...js,s0,s1,floor:-6.5})}}
    else{let gi=0,gd=1e9;for(let i=0;i<N;i++){const d=(P[i*3]-js.at[0]*S)**2+(P[i*3+2]-js.at[1]*S)**2;if(d<gd){gd=d;gi=i}}
      J.push({...js,s0:gi*ds-js.half,s1:gi*ds+js.half,floor:js.kind==='sky'?P[gi*3+1]-40:js.floor})}}
  td.jumps=J;return td}
function reverseTrack(f){const N=f.N,o={N,ds:f.ds,L:f.L,P:new Float32Array(N*3),T:new Float32Array(N*3),R:new Float32Array(N*3),U:new Float32Array(N*3),K:new Float32Array(N),B:new Float32Array(N),SEC:new Array(N),rev:true};
  for(let i=0;i<N;i++){const j=(N-i)%N;for(let c=0;c<3;c++){o.P[i*3+c]=f.P[j*3+c];o.T[i*3+c]=-f.T[j*3+c];o.R[i*3+c]=-f.R[j*3+c];o.U[i*3+c]=f.U[j*3+c]}o.K[i]=-f.K[j];o.B[i]=-f.B[j];o.SEC[i]=f.SEC[j]}
  o.jumps=f.jumps.map(j=>({...j,s0:f.L-j.s1,s1:f.L-j.s0}));return o}
let TF=buildTrackData(),TD=TF,TRACKS={fwd:TF,rev:null};
function frameAt(td,s,o){s=mod(s,td.L);const f=s/td.ds,i=Math.floor(f)%td.N,j=(i+1)%td.N,a=f-Math.floor(f),A=i*3,Bj=j*3;
  o.p.set(lerp(td.P[A],td.P[Bj],a),lerp(td.P[A+1],td.P[Bj+1],a),lerp(td.P[A+2],td.P[Bj+2],a));
  o.t.set(lerp(td.T[A],td.T[Bj],a),lerp(td.T[A+1],td.T[Bj+1],a),lerp(td.T[A+2],td.T[Bj+2],a)).normalize();
  o.r.set(lerp(td.R[A],td.R[Bj],a),lerp(td.R[A+1],td.R[Bj+1],a),lerp(td.R[A+2],td.R[Bj+2],a)).normalize();
  o.u.set(lerp(td.U[A],td.U[Bj],a),lerp(td.U[A+1],td.U[Bj+1],a),lerp(td.U[A+2],td.U[Bj+2],a)).normalize();
  o.k=lerp(td.K[i],td.K[j],a);o.i=i;return o}
const mkF=()=>({p:V3(),t:V3(),r:V3(),u:V3(),k:0,i:0});
const kAt=(td,s)=>td.K[Math.floor(mod(s,td.L)/td.ds)%td.N];
function yAt(td,s){const f=mod(s,td.L)/td.ds,i=Math.floor(f)%td.N,j=(i+1)%td.N;return lerp(td.P[i*3+1],td.P[j*3+1],f-Math.floor(f))}
function jumpAt(td,s){const m=mod(s,td.L);for(const j of td.jumps)if(m>=j.s0&&m<=j.s1)return j;return null}
const WATER_Y=-5.5,isWater=(td,s)=>!TRK.city&&yAt(td,s)<WATER_Y;
const isDirt=(td,s)=>{const q=td.SEC[Math.floor(mod(s,td.L)/td.ds)%td.N];return !!q&&q.includes('PISTE')};
const inGapF=s=>!!jumpAt(TF,s)||isWater(TF,s)||isDirt(TF,s);
const HCELL=60,hash=new Map();
function indexTrack(){hash.clear();for(let i=0;i<TF.N;i+=2){const x=TF.P[i*3],z=TF.P[i*3+2],key=Math.floor(x/HCELL)+','+Math.floor(z/HCELL);if(!hash.has(key))hash.set(key,[]);hash.get(key).push(x,z,TF.P[i*3+1],i)}}
indexTrack();
// another part of the circuit passing above/below this point (flyovers): used to keep pylons and gantries clear
const crossAt=(p,test)=>nearTrack(p.x,p.z,HALF+10,y=>test(y-p.y));
function nearTrack(x,z,r,test){const c0=Math.floor((x-r)/HCELL),c1=Math.floor((x+r)/HCELL),d0=Math.floor((z-r)/HCELL),d1=Math.floor((z+r)/HCELL);
  for(let a=c0;a<=c1;a++)for(let b=d0;b<=d1;b++){const arr=hash.get(a+','+b);if(!arr)continue;for(let k=0;k<arr.length;k+=4)if((!test||test(arr[k+2],arr[k+3]))&&(arr[k]-x)**2+(arr[k+1]-z)**2<r*r)return true}return false}
function nearestTrackDist(x,z,r){let best=1e9;const c0=Math.floor((x-r)/HCELL),c1=Math.floor((x+r)/HCELL),d0=Math.floor((z-r)/HCELL),d1=Math.floor((z+r)/HCELL);
  for(let a=c0;a<=c1;a++)for(let b=d0;b<=d1;b++){const arr=hash.get(a+','+b);if(!arr)continue;for(let k=0;k<arr.length;k+=4){const d=(arr[k]-x)**2+(arr[k+1]-z)**2;if(d<best)best=d}}return Math.sqrt(best)}

