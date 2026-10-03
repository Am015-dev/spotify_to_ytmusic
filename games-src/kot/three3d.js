// ---------- 3D arena (Three.js). Falls back to the SVG board when WebGL is missing. ----------
// Look: a retro kaiju city at dusk. Painted vinyl figures on display bases, resin dice with engraved faces,
// a miniature skyline with lit windows and neon. PBR (ACES, PMREM environment, soft shadows); bloom + vignette on High.
const MS=1.85;const V3={on:false,t:0,mons:[],dice:[],parts:[],gid:null,rollId:-1,fxSeen:{},shake:0,tags:[],q:'high',pinned:false};
// ---- graphics quality (High / Medium / Low), stored in localStorage; Auto picks Medium on phones and small screens ----
const GFXKEY='ccs_gfx';
const PH=typeof PerfHUD!=='undefined'?PerfHUD:null;
function gfxPref(){try{return localStorage.getItem(GFXKEY)||'auto'}catch(e){return 'auto'}}
function gfxAuto(){if(V3.soft)return 'low';const w=Math.min(window.innerWidth||1366,(window.screen&&screen.width)||9999);return (w<820||/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent||''))?'medium':'high'}
function gfxLabel(){const b=document.getElementById('gfxbtn');if(!b)return;const p=gfxPref();const cur=V3.on?V3.q:(p==='auto'?gfxAuto():p);const cap=s=>s[0].toUpperCase()+s.slice(1);
  b.innerHTML=`${GFX_ICON} Graphics: ${p==='auto'?'Auto ('+cap(cur)+')':cap(p)}${V3.on&&p!=='auto'&&cur!==p?' → '+cap(cur):''}<small>High: bloom and soft shadows. Low: fastest (tap to change)</small>`}
const GFX_ICON='<svg class="ico" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="3" width="16" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 17h6M10 14v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 11l3-3 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function cycleGfx(){const order=['auto','high','medium','low'];const n=order[(order.indexOf(gfxPref())+1)%order.length];try{localStorage.setItem(GFXKEY,n)}catch(e){}
  if(PH)PH.hitch();if(V3.on)setQuality(n==='auto'?gfxAuto():n);gfxLabel()}
function urlGfx(){try{const m=/[?&]gfx=(high|medium|low)/.exec(location.search||'');return m?m[1]:null}catch(e){return null}}
function init3D(){
  if(!window.THREE||/jsdom/i.test(navigator.userAgent))return false;
  const cv=document.getElementById('c3');if(!cv)return false;
  let r;try{r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:false,powerPreference:'high-performance'});if(!r.getContext())return false}catch(e){return false}
  V3.r=r;try{const gl=r.getContext();const ext=gl.getExtension('WEBGL_debug_renderer_info');const name=String(ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER));V3.gpu=name;V3.soft=/swiftshader|llvmpipe|software|softpipe/i.test(name)}catch(e){}
  r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=.92;
  r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;V3.maxAniso=Math.min(8,r.capabilities.getMaxAnisotropy()||1);
  const sc=V3.scene=new THREE.Scene();sc.background=new THREE.Color(0x2a1646);
  sc.fog=new THREE.Fog(0x3b2152,38,90);
  const cam=V3.cam=new THREE.PerspectiveCamera(38,16/10,.1,400);cam.position.set(0,17,27.5);V3.look=new THREE.Vector3(0,2,2.4);cam.lookAt(V3.look);
  // lights: warm key with soft shadows, cool hemisphere fill, magenta and cyan rims from behind (neon spill)
  V3.hemi=new THREE.HemisphereLight(0x7d74e8,0x1e1024,.75);sc.add(V3.hemi);
  const sun=V3.sun=new THREE.DirectionalLight(0xffb888,2.5);sun.position.set(-12,22,14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-19,right:19,top:17,bottom:-15,near:4,far:62});sun.shadow.bias=-.00035;sun.shadow.normalBias=.025;sun.shadow.radius=3;sc.add(sun);sc.add(sun.target);
  const rim=new THREE.DirectionalLight(0xff4fa8,1.9);rim.position.set(10,8,-14);sc.add(rim);
  const rim2=new THREE.DirectionalLight(0x46d4ff,1.1);rim2.position.set(-15,6,-9);sc.add(rim2);
  V3.tex={};makeBaseTextures();
  try{makeEnv()}catch(e){console.warn('env map off',e)}
  buildSky();buildWorld();
  cv.addEventListener('click',onClick3D);cv.addEventListener('pointermove',onMove3D);cv.addEventListener('pointerleave',()=>{V3.hover=-1;cv.style.cursor=''});
  const u=urlGfx();V3.pinned=!!u;const p=gfxPref();setQuality(u||(p==='auto'?gfxAuto():p));
  const ro=new ResizeObserver(resize3D);ro.observe(cv.parentElement);resize3D();
  V3.on=true;document.body.classList.add('three');gfxLabel();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{try{makeFaceMats();V3.dice.forEach((d,k)=>{if(G&&G.dice[k])setDieFace(d,G.dice[k],true)});refreshSigns()}catch(e){}});
  if(!V3.soft||V3.pinned)setTimeout(makePortraits,1200);
  V3.clock=new THREE.Clock();perfHooks();(PH?PH.raf:requestAnimationFrame)(loop3D);
  return true}
// ---------- PerfHUD hooks: the shared speed overlay, speed test, auto step-down and idle saver (perfhud.js) ----------
function perfHooks(){if(!PH)return;
  PH.register({game:'Crown City Smash',renderer:V3.r,levels:['high','medium','low'],names:{high:'High',medium:'Medium',low:'Low'},anchor:'.gx-board',corner:'tr',
    getLevel:()=>V3.q,isAuto:()=>!V3.pinned&&gfxPref()==='auto',autoTop:()=>gfxAuto(),
    // auto, test and restore changes are not saved; Apply on the result card is a choice by hand (saved, never auto-changed)
    setLevel:(l,w)=>{if(w==='apply'){try{localStorage.setItem(GFXKEY,l)}catch(e){}}setQuality(l)},
    basePR:()=>{const d=window.devicePixelRatio||1;return V3.q==='high'?Math.min(2,d):V3.q==='medium'?Math.min(1.5,d):1},
    onPixelRatio:v=>{V3.r.setPixelRatio(v);resize3D()},
    // the test swings the camera slowly around the arena; the loop eases towards V3.orbA, and null puts it back
    orbit:t=>{V3.orbA=t==null?0:Math.sin(t*Math.PI*2)*.45},
    isAnimating:()=>!!V3.busy,
    beforeTest:()=>{try{if(window.GX&&GX.open)GX.close()}catch(e){}}})}
// ---- quality levels ----
function setQuality(q){if(!['high','medium','low'].includes(q))q='high';const r=V3.r;const was=V3.q;V3.q=q;
  const dpr=window.devicePixelRatio||1;{const want=q==='high'?Math.min(2,dpr):q==='medium'?Math.min(1.5,dpr):1;r.setPixelRatio(PH?PH.pixelRatio(want):want)}
  const sh=q!=='low';const ms=q==='high'?2048:1024;
  if(r.shadowMap.enabled!==sh||(V3.sun.shadow.mapSize.x!==ms)){r.shadowMap.enabled=sh;V3.sun.castShadow=sh;V3.sun.shadow.mapSize.set(ms,ms);if(V3.sun.shadow.map){V3.sun.shadow.map.dispose();V3.sun.shadow.map=null}
    V3.scene.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)})}
  applyEnv(V3.scene);if(V3.faceMats)Object.values(V3.faceMats).forEach(envMat);
  V3.post=q==='high'&&r.capabilities.isWebGL2;if(!V3.post&&V3.P){disposePost()}
  if(V3.r.domElement.parentElement)resize3D();gfxLabel()}
// image-based lighting: every PBR material on High, only the hero pieces (figures, dice, brass, water) on Medium, none on Low
function envMat(m){if(!m||!(m.isMeshStandardMaterial)||!V3.env)return;const want=V3.q==='high'||(V3.q==='medium'&&m.userData.hero)?V3.env:null;if(m.envMap!==want){m.envMap=want;m.needsUpdate=true}}
function applyEnv(root){root.traverse(o=>{if(o.material)[].concat(o.material).forEach(envMat)})}
function hero(m){m.userData.hero=true;return m}
// The canvas fills the whole board (width AND height); the camera backs off until the full arena fits that aspect ratio.
const CAMOFF=new THREE.Vector3(0,15,25.1);
function fitPoints(){if(V3.fitPts)return V3.fitPts;const pts=[];
  for(let k=0;k<24;k++){const a=k/24*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*11.8,.25,Math.sin(a)*11.8))}
  // seats and the name plates above them (plates are ~1.6 units tall over the head)
  for(const n of [2,4,6])for(let k=0;k<n;k++){const v=seatPos(k,n);for(const dx of [-2.3,2.3])pts.push(v.clone().setY(8.2).setX(v.x+dx),v.clone().setY(1).setX(v.x+dx))}
  pts.push(new THREE.Vector3(0,8.3,0),new THREE.Vector3(12.5,8,-6.5));
  // harbor basin, signs, dice tray
  [[17.3,-10.8],[17.3,-2.2],[7.7,-10.8]].forEach(([x,z])=>pts.push(new THREE.Vector3(x,.3,z)));
  pts.push(new THREE.Vector3(-2.8,10.1,-4.2),new THREE.Vector3(2.8,10.1,-4.2));
  [[-4.6,12.6],[4.6,12.6],[0,17.2],[-3.3,15.9],[3.3,15.9]].forEach(([x,z])=>pts.push(new THREE.Vector3(x,.3,z)));
  return V3.fitPts=pts}
function fitCamera(asp){const _ph=!!(window.phFit&&phFit(asp));if(V3.tray)V3.tray.visible=!_ph;if(_ph)return;const cam=V3.cam;const pts=fitPoints();const tall=asp<1.05;cam.fov=tall?50:asp<1.4?44:40;cam.aspect=asp;cam.updateProjectionMatrix();
  // portrait boards look down more steeply (the arena gets taller on screen) and aim a bit right, towards the Harbor
  const t=Math.max(0,Math.min(1,(1.3-asp)/.6));V3.camOff=new THREE.Vector3(0,15+t*6,25.1-t*6.5);V3.look.set(t*1.6,2,2.4-t*.8);
  const off=V3.camOff,mx=tall?.94:.9,my=.9,v=new THREE.Vector3();
  const ok=()=>{cam.lookAt(V3.look);cam.updateMatrixWorld();for(const p of pts){v.copy(p).project(cam);if(Math.abs(v.x)>mx||Math.abs(v.y)>my||v.z>1)return false}return true};
  const fits=k=>{for(const sw of [1.2,-1.2]){cam.position.copy(V3.look).addScaledVector(off,k);cam.position.x+=sw;if(!ok())return false}return true};
  let lo=.5,hi=4;for(let i=0;i<22;i++){const m=(lo+hi)/2;if(fits(m))hi=m;else lo=m}V3.camK=hi;
  const d=off.length()*hi;V3.scene.fog.near=Math.max(34,d+4);V3.scene.fog.far=Math.max(105,d+72)}
function resize3D(){const el=V3.r.domElement.parentElement;const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);
  V3.r.setSize(w,h,false);V3.r.domElement.style.width=w+'px';V3.r.domElement.style.height=h+'px';fitCamera(w/h);if(V3.post)sizePost()}
// ---- procedural textures ----
function canvasTex(w,h,draw,rep,linear){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=linear?THREE.NoColorSpace:THREE.SRGBColorSpace;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}t.anisotropy=V3.maxAniso||4;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return t}
function gradTex(cols,stops){return canvasTex(4,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);cols.forEach((c,k)=>g.addColorStop(stops[k],c));x.fillStyle=g;x.fillRect(0,0,w,h)})}
let _ns=1;const nrand=()=>{_ns=(_ns*16807)%2147483647;return (_ns-1)/2147483646};
const HASH=(()=>{const a=new Float32Array(256*256);let s=7;for(let i=0;i<a.length;i++){s=(s*16807)%2147483647;a[i]=s/2147483647}return a})();
function vnoise(x,y,per){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const P=per||256;const h=(i,j)=>HASH[(((j%P)+P)%P&255)*256+((((i%P)+P)%P)&255)];
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return (h(xi,yi)*(1-u)+h(xi+1,yi)*u)*(1-v)+(h(xi,yi+1)*(1-u)+h(xi+1,yi+1)*u)*v}
function fbm(x,y,oct,per){let s=0,a=.5,f=1;for(let o=0;o<oct;o++){s+=a*vnoise(x*f,y*f,per?per*f:0);a*=.5;f*=2}return s}
// height canvas -> tangent-space normal map
function normalFromHeight(src,strength,invert){const w=src.width,h=src.height;const d=src.getContext('2d').getImageData(0,0,w,h).data;const H=new Float32Array(w*h);for(let i=0;i<w*h;i++)H[i]=d[i*4]/255*(invert?-1:1);
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');const img=x.createImageData(w,h);const o=img.data;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const l=H[j*w+((i-1+w)%w)],r=H[j*w+((i+1)%w)],u=H[((j-1+h)%h)*w+i],b=H[((j+1)%h)*w+i];
    let nx=(l-r)*strength,ny=(b-u)*strength,nz=1;const L=Math.hypot(nx,ny,nz);nx/=L;ny/=L;nz/=L;const k=(j*w+i)*4;o[k]=(nx*.5+.5)*255;o[k+1]=(ny*.5+.5)*255;o[k+2]=(nz*.5+.5)*255;o[k+3]=255}
  x.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=V3.maxAniso||4;return t}
function mkCanvas(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c}
function texFrom(c,rep,linear){const t=new THREE.CanvasTexture(c);t.colorSpace=linear?THREE.NoColorSpace:THREE.SRGBColorSpace;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}t.anisotropy=V3.maxAniso||4;return t}
function noiseCanvas(){if(V3.noiseC)return V3.noiseC;const S=256;V3.noiseC=mkCanvas(S,S,(x)=>{const img=x.createImageData(S,S);const d=img.data;for(let j=0;j<S;j++)for(let i=0;i<S;i++){const v=fbm(i/16,j/16,4,16);const g=Math.max(0,Math.min(255,(v-.5)*1.9*255+128));const k=(j*S+i)*4;d[k]=d[k+1]=d[k+2]=g;d[k+3]=255}x.putImageData(img,0,0)});return V3.noiseC}
// overlays tileable fbm noise: amp ~ strength (0..60), scale ~ feature size in px
function noiseFill(x,w,h,base,amp,scale){const n=noiseCanvas();const T=Math.max(32,Math.min(1024,Math.round(scale*16)));x.save();x.globalCompositeOperation='overlay';x.globalAlpha=Math.min(1,amp/45);for(let j=0;j<h;j+=T)for(let i=0;i<w;i+=T)x.drawImage(n,i,j,T,T);x.restore()}
function makeBaseTextures(){const T=V3.tex;
  // painted vinyl: near-white mottling (colour) and a matching roughness breakup
  const pc=mkCanvas(256,256,(x,w,h)=>{x.fillStyle='#f4f4f4';x.fillRect(0,0,w,h);noiseFill(x,w,h,0,26,24,4)});T.paint=texFrom(pc,[2,2]);
  T.paintR=texFrom(mkCanvas(256,256,(x,w,h)=>{x.fillStyle='#b8b8b8';x.fillRect(0,0,w,h);noiseFill(x,w,h,0,60,10,3)}),[2,2],true);
  // soft contact shadow blob
  T.blob=canvasTex(128,128,(x)=>{const g=x.createRadialGradient(64,64,4,64,64,62);g.addColorStop(0,'rgba(10,4,16,.85)');g.addColorStop(.45,'rgba(10,4,16,.5)');g.addColorStop(1,'rgba(10,4,16,0)');x.fillStyle=g;x.fillRect(0,0,128,128)});
  // glow sprite
  T.glow=canvasTex(128,128,(x)=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128)});
}
// ---- environment map: a dusk studio (sky gradient, warm softbox, magenta and cyan neon panels) through PMREM ----
function makeEnv(){const r=V3.r;const es=new THREE.Scene();
  const sky=new THREE.Mesh(new THREE.SphereGeometry(50,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
    vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec3 vP;void main(){float y=vP.y;vec3 top=vec3(.10,.07,.30),mid=vec3(.55,.22,.55),hor=vec3(1.4,.55,.35),gnd=vec3(.08,.04,.09);vec3 c=y>0.?mix(hor,mix(mid,top,smoothstep(.15,.8,y)),smoothstep(0.,.25,y)):mix(hor*.5,gnd,smoothstep(0.,-.3,y));gl_FragColor=vec4(c,1.);}'}));
  es.add(sky);
  const panel=(col,i,w,h,pos)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(i),side:THREE.DoubleSide}));m.position.copy(pos);m.lookAt(0,0,0);es.add(m)};
  panel(0xffd2a8,7,18,12,new THREE.Vector3(-18,26,18));panel(0xff4fa8,4,10,24,new THREE.Vector3(24,6,-20));panel(0x40d8ff,3.2,10,20,new THREE.Vector3(-26,5,-14));panel(0xffffff,2.2,30,6,new THREE.Vector3(0,34,0));
  const pm=new THREE.PMREMGenerator(r);V3.env=pm.fromScene(es,.035).texture;pm.dispose();es.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()})}
// ---- sky dome, sun glow, stars, far skyline bands, clouds ----
function buildSky(){const sc=V3.scene;
  const dome=new THREE.Mesh(new THREE.SphereGeometry(190,48,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
    uniforms:{t:{value:0}},
    vertexShader:'varying vec3 vP;void main(){vP=normalize(position);vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}',
    fragmentShader:`uniform float t;varying vec3 vP;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){float y=vP.y;vec3 sd=normalize(vec3(-.25,.06,-1.));float s=max(dot(vP,sd),0.);
        vec3 top=vec3(.035,.025,.11),up=vec3(.16,.07,.30),mid=vec3(.55,.18,.42),hor=vec3(1.25,.45,.26);
        vec3 c=mix(hor,mid,smoothstep(-.02,.16,y));c=mix(c,up,smoothstep(.12,.42,y));c=mix(c,top,smoothstep(.4,.95,y));
        c+=vec3(1.6,.62,.25)*pow(s,24.)*1.6+vec3(1.,.35,.2)*pow(s,4.)*.35;
        vec2 g=vec2(atan(vP.x,vP.z)*80.,y*160.);vec2 id=floor(g);float st=step(.992,h(id))*smoothstep(.25,.7,y);float tw=.6+.4*sin(t*2.+h(id+3.)*40.);
        c+=vec3(.9,.9,1.)*st*tw*1.3;if(y<0.)c=mix(c,vec3(.12,.05,.12),smoothstep(0.,-.12,y));
        gl_FragColor=vec4(c,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        }`}));
  dome.renderOrder=-10;dome.frustumCulled=false;sc.add(dome);V3.dome=dome;
  // two far skyline bands (silhouettes with tiny lit windows)
  const band=(seed,dark,lit,hmax)=>{_ns=seed;return canvasTex(2048,256,(x,w,h)=>{x.clearRect(0,0,w,h);let px=0;while(px<w){const bw=18+nrand()*46,bh=30+nrand()*hmax;x.fillStyle=dark;x.fillRect(px,h-bh,bw,bh);
      if(nrand()<.3){x.fillRect(px+bw*.4,h-bh-14-nrand()*20,3,30)}if(nrand()<.25){x.fillRect(px+bw*.15,h-bh-10,bw*.7,10)}
      for(let yy=h-bh+6;yy<h-4;yy+=7)for(let xx=px+4;xx<px+bw-4;xx+=6)if(nrand()<.22){x.fillStyle=nrand()<.8?lit:'#9fe8ff';x.globalAlpha=.55+nrand()*.45;x.fillRect(xx,yy,2.5,3);x.globalAlpha=1}
      px+=bw+nrand()*4}})};
  [[150,'#2a1236','#ffcf7a',150,26,.0],[118,'#1a0b24','#ffd990',120,20,1.3]].forEach(([rad,dk,lt,hm,ht,rot],k)=>{const tx=band(9+k*31,dk,lt,hm);tx.wrapS=THREE.RepeatWrapping;tx.repeat.set(3,1);
    const m=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,ht,96,1,true),new THREE.MeshBasicMaterial({map:tx,transparent:true,side:THREE.BackSide,fog:false,depthWrite:false,color:new THREE.Color(k?1.15:.8,k?1.1:.75,k?1.1:.85)}));
    m.position.y=ht/2-1.5;m.rotation.y=rot;m.renderOrder=-9+k;sc.add(m)});
  // painted dusk clouds, lit pink from below
  const ctex=canvasTex(256,96,(x,w,h)=>{for(let i=0;i<26;i++){const cx=30+Math.random()*196,cy=38+Math.random()*26,r=14+Math.random()*26;const g=x.createRadialGradient(cx,cy,1,cx,cy,r);g.addColorStop(0,'rgba(255,190,200,.55)');g.addColorStop(.6,'rgba(200,110,170,.25)');g.addColorStop(1,'rgba(120,60,140,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill()}});
  V3.clouds=[];for(let i=0;i<7;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:ctex,transparent:true,depthWrite:false,fog:false,opacity:.8,color:new THREE.Color(1.1,1,1.05)}));s.position.set(-70+i*22,24+Math.sin(i*1.7)*5,-60-(i%3)*12);s.scale.set(34,11,1);sc.add(s);V3.clouds.push(s)}}
// ---- dice faces: resin with engraved, paint-filled symbols ----
const DIEFACES={n:['1','2','3','E','C','H'],b:['C2','E2','O','C','C','E'],f:['FE','FW','FS','FA','FE','FW']};
const FACEIDX={'1':0,'2':1,'3':2,E:3,C:4,H:5};
// draws a symbol in a 128-unit box; paint=true uses colours, else white mask
function drawSym(x,f,paint){const ink=paint?'#1c1428':'#fff';const P=c=>paint?c:'#fff';x.lineJoin='round';x.lineCap='round';x.textAlign='center';x.textBaseline='middle';
  const claw=(list,w)=>{x.lineWidth=w;x.strokeStyle=P('#d62839');list.forEach(([a,b,c,d,e,g])=>{x.beginPath();x.moveTo(a,b);x.quadraticCurveTo(c,d,e,g);x.stroke()})};
  const bolt=(s,dx)=>{x.save();x.translate(dx||0,0);x.beginPath();x.moveTo(74*s,12);x.lineTo(30*s,72);x.lineTo(60*s,72);x.lineTo(50*s,116);x.lineTo(100*s,48);x.lineTo(70*s,48);x.closePath();x.fillStyle=P('#1fae6a');x.fill();x.restore()};
  if('123'.includes(f)){x.font='104px Bangers, Impact, "Arial Black", sans-serif';x.fillStyle=ink;x.fillText(f,64,70)}
  else if(f==='C'){claw([[30,20,40,66,26,108],[62,14,72,62,58,114],[94,20,104,66,90,108]],15)}
  else if(f==='C2'){claw([[22,22,32,64,20,104],[50,16,60,62,46,110]],13);x.font='54px Bangers, Impact, sans-serif';x.fillStyle=paint?'#fff':'#fff';x.fillText('×2',94,68)}
  else if(f==='E'){x.beginPath();x.moveTo(74,10);x.lineTo(28,72);x.lineTo(60,72);x.lineTo(50,118);x.lineTo(102,46);x.lineTo(70,46);x.closePath();x.fillStyle=P('#1fae6a');x.fill()}
  else if(f==='E2'){x.beginPath();x.moveTo(54,10);x.lineTo(16,66);x.lineTo(42,66);x.lineTo(34,116);x.lineTo(78,48);x.lineTo(52,48);x.closePath();x.fillStyle=P('#1fae6a');x.fill();x.font='54px Bangers, Impact, sans-serif';x.fillStyle=P('#fff');x.fillText('×2',96,70)}
  else if(f==='H'){x.beginPath();x.moveTo(64,112);x.bezierCurveTo(12,76,6,46,22,30);x.bezierCurveTo(36,14,58,18,64,40);x.bezierCurveTo(70,18,92,14,106,30);x.bezierCurveTo(122,46,116,76,64,112);x.fillStyle=P('#d62839');x.fill()}
  else if(f==='O'){x.beginPath();for(let k=0;k<16;k++){const a=k*Math.PI/8,r=k%2?30:58;x.lineTo(64+Math.cos(a)*r,64+Math.sin(a)*r)}x.closePath();x.fillStyle=P('#ff8c42');x.fill();if(paint){x.fillStyle='#1c1428';x.font='30px Bangers, Impact, sans-serif';x.fillText('OUCH',64,66)}}
  else if(f==='FE'){x.lineWidth=9;x.strokeStyle=ink;x.beginPath();x.moveTo(10,64);x.quadraticCurveTo(64,12,118,64);x.quadraticCurveTo(64,116,10,64);x.stroke();x.beginPath();x.arc(64,64,17,0,7);x.fillStyle=P('#2a6fdb');x.fill()}
  else if(f==='FW'){x.strokeStyle=P('#2a6fdb');x.lineWidth=13;[46,82].forEach(y=>{x.beginPath();x.moveTo(12,y);for(let i=0;i<4;i++)x.quadraticCurveTo(26+i*26,y-18,38+i*26,y);x.stroke()})}
  else if(f==='FS'){x.strokeStyle=P('#3f9e2a');x.lineWidth=15;x.beginPath();x.moveTo(24,104);x.bezierCurveTo(0,70,70,80,80,70);x.bezierCurveTo(110,50,40,40,70,18);x.stroke()}
  else if(f==='FA'){x.strokeStyle=P('#b87800');x.lineWidth=15;x.beginPath();x.ellipse(64,34,16,20,0,0,7);x.moveTo(64,56);x.lineTo(64,118);x.moveTo(30,64);x.lineTo(98,64);x.stroke()}}
function dieBase(tp,kept){return kept?['#ffcf3f','#e9a100']:tp==='b'?['#e0434f','#a51f35']:tp==='f'?['#ecd28f','#c09a4c']:['#f7efdf','#e0d2b8']}
function faceMaps(f,kept,tp){const S=256;const key=tp+f;V3.faceN=V3.faceN||{};
  // height: flat 1, symbol recessed to 0 with a soft wall
  if(!V3.faceN[key]){const hc=mkCanvas(S,S,(x)=>{x.fillStyle='#fff';x.fillRect(0,0,S,S);x.save();x.scale(2,2);x.translate(64,64);x.scale(.8,.8);x.translate(-64,-64);x.filter='blur(1.2px)';
      const m=mkCanvas(128,128,(y)=>{drawSym(y,f,false)});x.globalCompositeOperation='difference';x.drawImage(m,0,0);x.restore()});
    V3.faceN[key]=normalFromHeight(hc,3.2,false);V3.faceN[key].wrapS=V3.faceN[key].wrapT=THREE.ClampToEdgeWrapping}
  const [c0,c1]=dieBase(tp,kept);
  const map=canvasTex(S,S,(x)=>{const g=x.createRadialGradient(S*.4,S*.35,10,S*.5,S*.5,S*.75);g.addColorStop(0,c0);g.addColorStop(1,c1);x.fillStyle=g;x.fillRect(0,0,S,S);
    // resin swirl
    x.globalAlpha=.04;for(let i=0;i<5;i++){x.strokeStyle=i%2?'#fff':'#000';x.lineWidth=10+i*4;x.beginPath();x.moveTo(-20,S*(.2+i*.15));x.bezierCurveTo(S*.3,S*(.1+i*.2),S*.6,S*(.5+i*.08),S+20,S*(.3+i*.12));x.stroke()}x.globalAlpha=1;
    x.save();x.scale(2,2);x.translate(64,64);x.scale(.8,.8);x.translate(-64,-64);
    // engraving shadow (inner edge), then the paint fill
    x.save();x.translate(1.6,1.8);x.globalAlpha=.55;const sh=mkCanvas(128,128,(y)=>{drawSym(y,f,false);y.globalCompositeOperation='source-in';y.fillStyle='#2a1a10';y.fillRect(0,0,128,128)});x.drawImage(sh,0,0);x.restore();
    drawSym(x,f,true);
    x.restore()});
  return {map,normal:V3.faceN[key]}}
function makeFaceMats(){V3.faceMats={};Object.entries(DIEFACES).forEach(([tp,list])=>[...new Set(list)].forEach(f=>{for(const k of [false,true]){const {map,normal}=faceMaps(f,k,tp);
    V3.faceMats[tp+f+(k?'k':'')]=hero(new THREE.MeshPhysicalMaterial({map,normalMap:normal,normalScale:new THREE.Vector2(1.1,1.1),roughness:k?.22:.28,metalness:0,clearcoat:1,clearcoatRoughness:.12,sheen:0,emissive:k?0x3a2400:0x000000,emissiveIntensity:1}));envMat(V3.faceMats[tp+f+(k?'k':'')])}}))}
// ---- neon signs (atlas of glowing tube lettering) ----
const NEON_WORDS=[['HOTEL','#ff4fa0'],['RAMEN','#ffd23f'],['ARCADE','#43e0ff'],['BAR','#ff4fa0'],['24 HR','#8dff5a'],['DINER','#ff8a3d'],['KAIJU','#43e0ff'],['MOTEL','#ff4fa0'],
  ['DISCO','#b57bff'],['CAFE','#ffd23f'],['TOYS','#8dff5a'],['PIZZA','#ff8a3d'],['KARAOKE','#ff4fa0'],['OPEN','#43e0ff'],['NOODLES','#ffd23f'],['VIDEO','#b57bff']];
function neonDraw(x,text,col,w,h,font){x.fillStyle='#000';x.fillRect(0,0,w,h);x.font=font||`${Math.round(h*.62)}px Bangers, Impact, "Arial Black", sans-serif`;x.textAlign='center';x.textBaseline='middle';
  x.lineJoin='round';x.shadowColor=col;x.shadowBlur=h*.16;x.strokeStyle=col;x.lineWidth=h*.08;x.strokeText(text,w/2,h/2+h*.04);x.shadowBlur=h*.05;x.lineWidth=h*.022;x.strokeStyle='rgba(255,255,255,.85)';x.strokeText(text,w/2,h/2+h*.04);
  x.shadowBlur=0;x.strokeStyle=col;x.globalAlpha=.9;x.lineWidth=h*.03;x.strokeRect(h*.08,h*.1,w-h*.16,h*.8);x.globalAlpha=1}
function neonAtlas(){return canvasTex(1024,1024,(x)=>{x.fillStyle='#000';x.fillRect(0,0,1024,1024);NEON_WORDS.forEach(([t,c],i)=>{const col=i%2,row=i>>1;const cv=mkCanvas(512,128,(y,w,h)=>neonDraw(y,t,c,w,h));x.drawImage(cv,col*512,row*128)})})}
function signTex(text,bg,fg){return canvasTex(512,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#2a1838');g.addColorStop(1,'#120a1a');x.fillStyle=g;x.beginPath();x.roundRect?x.roundRect(4,4,w-8,h-8,18):x.rect(4,4,w-8,h-8);x.fill();
  x.lineWidth=5;x.strokeStyle=bg;x.shadowColor=bg;x.shadowBlur=14;x.stroke();x.font='82px Bangers, Impact, sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
  x.strokeStyle=bg;x.lineWidth=9;x.shadowBlur=20;x.strokeText(text,w/2,h/2+5);x.shadowBlur=6;x.fillStyle=fg;x.fillText(text,w/2,h/2+5)})}
function iconTex(kind){return canvasTex(128,128,(x)=>{x.lineJoin='round';x.translate(64,64);x.scale(2,2);
  const gloss=(c0,c1)=>{const g=x.createLinearGradient(0,-26,0,26);g.addColorStop(0,c0);g.addColorStop(1,c1);return g};
  const fin=()=>{x.lineWidth=3;x.strokeStyle='rgba(40,10,40,.85)';x.stroke();x.save();x.clip();x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.ellipse(-6,-12,14,7,-.4,0,7);x.fill();x.restore()};
  if(kind==='star'){x.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?11:26;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fillStyle=gloss('#fff3a0','#f4a300');x.fill();fin()}
  else if(kind==='heart'){x.beginPath();x.moveTo(0,22);x.bezierCurveTo(-26,4,-26,-16,-12,-20);x.bezierCurveTo(-4,-22,0,-14,0,-10);x.bezierCurveTo(0,-14,4,-22,12,-20);x.bezierCurveTo(26,-16,26,4,0,22);x.fillStyle=gloss('#8dffb8','#1fae6a');x.fill();fin()}
  else if(kind==='bolt'){x.beginPath();x.moveTo(6,-26);x.lineTo(-14,4);x.lineTo(0,4);x.lineTo(-6,26);x.lineTo(16,-6);x.lineTo(2,-6);x.closePath();x.fillStyle=gloss('#b8ffd8','#1fae6a');x.fill();fin()}
  else if(kind==='brain'){x.beginPath();x.ellipse(0,0,24,18,0,0,Math.PI*2);x.fillStyle=gloss('#ffd0e8','#e45aa0');x.fill();fin();x.lineWidth=2.5;x.beginPath();x.moveTo(0,-18);x.lineTo(0,18);x.stroke()}
  else if(kind==='fire'){const g=x.createRadialGradient(0,0,1,0,0,30);g.addColorStop(0,'#fff8d0');g.addColorStop(.35,'#ffb040');g.addColorStop(.7,'rgba(255,70,40,.6)');g.addColorStop(1,'rgba(255,40,40,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,30,0,7);x.fill()}
  else if(kind==='spark'){const g=x.createRadialGradient(0,0,0,0,0,30);g.addColorStop(0,'#fff');g.addColorStop(.2,'rgba(255,240,200,.8)');g.addColorStop(1,'rgba(255,200,120,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,30,0,7);x.fill();x.fillStyle='#fff';x.fillRect(-28,-1.2,56,2.4);x.fillRect(-1.2,-28,2.4,56)}
  else{for(let i=0;i<7;i++){const cx=(Math.random()-.5)*22,cy=(Math.random()-.5)*16,rr=10+Math.random()*12;const g=x.createRadialGradient(cx,cy,1,cx,cy,rr);g.addColorStop(0,'rgba(236,214,200,.55)');g.addColorStop(1,'rgba(200,170,170,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,rr,0,7);x.fill()}}})}
// ---- materials ----
const _C=new THREE.Color();
function vinyl(color,o){return new THREE.MeshPhysicalMaterial(Object.assign({color,map:V3.tex.paint,roughnessMap:V3.tex.paintR,roughness:.48,metalness:0,clearcoat:.55,clearcoatRoughness:.32,vertexColors:true},o||{}))}
function std(color,o){return new THREE.MeshStandardMaterial(Object.assign({color,roughness:.8,metalness:0},o||{}))}
function glowMat(color,i){return new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(i||2.2)})}
// kept for older call sites: a painted vinyl material
function T(color,o){return vinyl(color,o)}
function mesh(geo,mat,x,y,z,parent,noShadow){const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);if(!noShadow){m.castShadow=true;m.receiveShadow=true}if(parent)parent.add(m);return m}
// ---- geometry helpers ----
function roundedBox(w,h,d,seg,rad){seg=seg*2+1;rad=Math.min(w/2,h/2,d/2,rad);const g=new THREE.BoxGeometry(1,1,1,seg,seg,seg);const g2=g.toNonIndexed();g.index=null;
  g.setAttribute('position',g2.attributes.position);g.setAttribute('normal',g2.attributes.normal);g.setAttribute('uv',g2.attributes.uv);
  const pos=new THREE.Vector3(),nrm=new THREE.Vector3(),box=new THREE.Vector3(w,h,d).divideScalar(2).subScalar(rad);const P=g.attributes.position.array,N=g.attributes.normal.array,U=g.attributes.uv.array,hs=.5/seg,faceTris=P.length/6,fd=new THREE.Vector3();
  for(let i=0;i<P.length;i+=3){pos.fromArray(P,i);nrm.copy(pos);nrm.x-=Math.sign(nrm.x)*hs;nrm.y-=Math.sign(nrm.y)*hs;nrm.z-=Math.sign(nrm.z)*hs;nrm.normalize();
    P[i]=box.x*Math.sign(pos.x)+nrm.x*rad;P[i+1]=box.y*Math.sign(pos.y)+nrm.y*rad;P[i+2]=box.z*Math.sign(pos.z)+nrm.z*rad;N[i]=nrm.x;N[i+1]=nrm.y;N[i+2]=nrm.z;
    const j=i/3*2,side=Math.floor(i/faceTris);
    switch(side){case 0:fd.set(1,0,0);U[j]=rbUv(fd,nrm,'z','y',rad,d);U[j+1]=1-rbUv(fd,nrm,'y','z',rad,h);break;case 1:fd.set(-1,0,0);U[j]=1-rbUv(fd,nrm,'z','y',rad,d);U[j+1]=1-rbUv(fd,nrm,'y','z',rad,h);break;
      case 2:fd.set(0,1,0);U[j]=1-rbUv(fd,nrm,'x','z',rad,w);U[j+1]=rbUv(fd,nrm,'z','x',rad,d);break;case 3:fd.set(0,-1,0);U[j]=1-rbUv(fd,nrm,'x','z',rad,w);U[j+1]=1-rbUv(fd,nrm,'z','x',rad,d);break;
      case 4:fd.set(0,0,1);U[j]=1-rbUv(fd,nrm,'x','y',rad,w);U[j+1]=1-rbUv(fd,nrm,'y','x',rad,h);break;default:fd.set(0,0,-1);U[j]=rbUv(fd,nrm,'x','y',rad,w);U[j+1]=1-rbUv(fd,nrm,'y','x',rad,h)}}
  g.computeBoundingSphere();return g}
const _tn=new THREE.Vector3();
function rbUv(fd,n,ax,pa,rad,side){const tot=2*Math.PI*rad/4,cen=Math.max(side-2*rad,0),half=Math.PI/4;_tn.copy(n);_tn[pa]=0;_tn.normalize();const arc=.5*tot/(tot+cen);const ang=1-(_tn.angleTo(fd)/half);
  if(Math.sign(_tn[ax])===1)return ang*arc;return cen/(tot+cen)+arc+arc*(1-ang)}
function taperTube(pts,r0,r1,seg,rad){const curve=new THREE.CatmullRomCurve3(pts);seg=seg||24;rad=rad||10;const g=new THREE.TubeGeometry(curve,seg,1,rad,false);const P=g.attributes.position.array;const c=new THREE.Vector3(),v=new THREE.Vector3();
  for(let i=0;i<=seg;i++){const t=i/seg;curve.getPointAt(t,c);const r=r0+(r1-r0)*t;for(let j=0;j<=rad;j++){const k=(i*(rad+1)+j)*3;v.fromArray(P,k).sub(c).multiplyScalar(r).add(c);v.toArray(P,k)}}
  return g}
function lathe(prof,seg){return new THREE.LatheGeometry(prof.map(([x,y])=>new THREE.Vector2(x,y)),seg||40)}
function capsuleH(r,len,mat,x,y,z,parent,rz){const m=mesh(new THREE.CapsuleGeometry(r,len,4,10),mat,x,y,z,parent);m.rotation.z=Math.PI/2+(rz||0);return m}
// merge many transformed geometries per material key (the whole city is a handful of draw calls)
function Bag(){const S={};const W=new THREE.Color(1,1,1);
  return {add(key,geo,m4,tint,us,uo){const g=geo.index?geo.toNonIndexed():geo;if(m4)g.applyMatrix4(m4);const n=g.attributes.position.count;const c=tint||W;const col=new Float32Array(n*3);for(let i=0;i<n;i++){col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
      const uv=g.attributes.uv?Float32Array.from(g.attributes.uv.array):new Float32Array(n*2);if(us||uo)for(let i=0;i<n;i++){uv[i*2]=uv[i*2]*(us?us[0]:1)+(uo?uo[0]:0);uv[i*2+1]=uv[i*2+1]*(us?us[1]:1)+(uo?uo[1]:0)}
      (S[key]=S[key]||[]).push({p:g.attributes.position.array,n:g.attributes.normal.array,uv,col});if(g!==geo)g.dispose();geo.dispose()},
    geo(key){const L=S[key];if(!L)return null;let n=0;L.forEach(x=>n+=x.p.length);const P=new Float32Array(n),N=new Float32Array(n),C=new Float32Array(n),U=new Float32Array(n/3*2);let o=0,ou=0;
      L.forEach(x=>{P.set(x.p,o);N.set(x.n,o);C.set(x.col,o);U.set(x.uv,ou);o+=x.p.length;ou+=x.uv.length});const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setAttribute('uv',new THREE.BufferAttribute(U,2));g.setAttribute('color',new THREE.BufferAttribute(C,3));g.computeBoundingSphere();return g}}}
const _M=new THREE.Matrix4(),_Q=new THREE.Quaternion(),_E=new THREE.Euler(),_S=new THREE.Vector3(),_P=new THREE.Vector3();
function M4(x,y,z,rx,ry,rz,sx,sy,sz){_E.set(rx||0,ry||0,rz||0);_Q.setFromEuler(_E);_P.set(x||0,y||0,z||0);_S.set(sx||1,sy||sx||1,sz||sx||1);return new THREE.Matrix4().compose(_P,_Q,_S)}
// ---- world textures ----
function facadeTextures(){const S=512,N=16,cs=S/N;_ns=4242;
  const lit=[];for(let j=0;j<N;j++){const floorOn=nrand()<.82;for(let i=0;i<N;i++){const r=nrand();lit.push(floorOn&&r<.46?(r<.33?'w':r<.4?'c':'p'):'')}}
  const alb=mkCanvas(S,S,(x)=>{x.fillStyle='#978a98';x.fillRect(0,0,S,S);noiseFill(x,S,S,0,22,20,3);
    for(let j=0;j<N;j++){x.fillStyle='rgba(40,20,40,.22)';x.fillRect(0,j*cs+cs-5,S,3);x.fillStyle='rgba(255,240,230,.18)';x.fillRect(0,j*cs+cs-2,S,2);
      for(let i=0;i<N;i++){const L=lit[j*N+i];const wx=i*cs+7,wy=j*cs+6,ww=cs-14,wh=cs-15;x.fillStyle='#3b3040';x.fillRect(wx-2,wy-2,ww+4,wh+4);
        const g=x.createLinearGradient(wx,wy,wx+ww,wy+wh);if(L==='w'){g.addColorStop(0,'#ffe2a0');g.addColorStop(1,'#f0a050')}else if(L==='c'){g.addColorStop(0,'#c8f0ff');g.addColorStop(1,'#60a8d8')}else if(L==='p'){g.addColorStop(0,'#ffb0e0');g.addColorStop(1,'#b060d0')}else{g.addColorStop(0,'#3d4a66');g.addColorStop(.5,'#1a2034');g.addColorStop(1,'#10131f')}
        x.fillStyle=g;x.fillRect(wx,wy,ww,wh);x.fillStyle='rgba(30,20,30,.7)';x.fillRect(wx+ww/2-1,wy,2,wh);if(L&&nrand()<.4){x.fillStyle='rgba(60,20,40,.55)';x.fillRect(wx,wy,ww,wh*(.3+nrand()*.4))}}}});
  const em=mkCanvas(S,S,(x)=>{x.fillStyle='#000';x.fillRect(0,0,S,S);_ns=4242;for(let j=0;j<N;j++){nrand();for(let i=0;i<N;i++){nrand();const L=lit[j*N+i];if(!L)continue;const wx=i*cs+7,wy=j*cs+6,ww=cs-14,wh=cs-15;
    x.fillStyle=L==='w'?'#ffc46a':L==='c'?'#8fd8ff':'#ff8ad8';x.globalAlpha=.75+((i*7+j*13)%10)/40;x.fillRect(wx,wy,ww,wh);x.globalAlpha=1;x.fillStyle='rgba(0,0,0,.6)';x.fillRect(wx+ww/2-1,wy,2,wh)}}});
  const hgt=mkCanvas(S,S,(x)=>{x.fillStyle='#fff';x.fillRect(0,0,S,S);for(let j=0;j<N;j++){x.fillStyle='#999';x.fillRect(0,j*cs+cs-5,S,3);for(let i=0;i<N;i++){x.fillStyle='#555';x.fillRect(i*cs+5,j*cs+4,cs-10,cs-11);x.fillStyle='#222';x.fillRect(i*cs+7,j*cs+6,cs-14,cs-15)}}});
  const rough=mkCanvas(S,S,(x)=>{x.fillStyle='#d8d8d8';x.fillRect(0,0,S,S);for(let j=0;j<N;j++)for(let i=0;i<N;i++){x.fillStyle='#262626';x.fillRect(i*cs+7,j*cs+6,cs-14,cs-15)}});
  const t={map:texFrom(alb,[1,1]),em:texFrom(em,[1,1]),n:normalFromHeight(hgt,2.2),r:texFrom(rough,[1,1],true)};[t.map,t.em,t.r].forEach(x=>{x.wrapS=x.wrapT=THREE.RepeatWrapping});return t}
function streetTex(){const S=1024;const c=mkCanvas(S,S,(x)=>{// one 16x16 block: sidewalk/concrete square, streets on two edges
    x.fillStyle='#4e4656';x.fillRect(0,0,S,S);noiseFill(x,S,S,0,9,14,3);
    for(let i=0;i<S;i+=48){x.fillStyle='rgba(40,30,40,.25)';x.fillRect(i,0,2,S);x.fillRect(0,i,S,2)}
    x.fillStyle='#2b2630';x.fillRect(0,S*.8,S,S*.2);x.fillRect(S*.8,0,S*.2,S);
    const a=mkCanvas(256,256,(y)=>{y.fillStyle='#2b2630';y.fillRect(0,0,256,256);noiseFill(y,256,256,0,14,6,2)});x.globalAlpha=.9;for(let i=0;i<S;i+=256){x.drawImage(a,i,S*.8,256,S*.2);x.drawImage(a,S*.8,i,S*.2,256)}x.globalAlpha=1;
    x.fillStyle='#a79ba3';x.fillRect(0,S*.8-10,S*.8,10);x.fillRect(S*.8-10,0,10,S*.8);
    x.fillStyle='#ffd23f';x.globalAlpha=.85;for(let i=0;i<S*.78;i+=70){x.fillRect(i,S*.9-3,40,6);x.fillRect(S*.9-3,i,6,40)}x.globalAlpha=1;
    x.fillStyle='rgba(240,236,230,.8)';for(let k=0;k<7;k++){x.fillRect(S*.8+10+k*28,S*.8-60,16,50);x.fillRect(S*.8-60,S*.8+10+k*28,50,16)}});
  const map=texFrom(c,[10,10]);
  const r=texFrom(mkCanvas(256,256,(x)=>{x.fillStyle='#ccc';x.fillRect(0,0,256,256);x.fillStyle='#6a6a6a';x.fillRect(0,205,256,51);x.fillRect(205,0,51,256);noiseFill(x,256,256,0,50,4,2)}),[10,10],true);
  return {map,r}}
function paverTex(){const S=1024;const hc=document.createElement('canvas');hc.width=hc.height=512;const hx=hc.getContext('2d');hx.fillStyle='#fff';hx.fillRect(0,0,512,512);hx.strokeStyle='#000';hx.lineWidth=3;
  const c=mkCanvas(S,S,(x)=>{x.fillStyle='#8a7c78';x.fillRect(0,0,S,S);const cx=S/2;
    // concentric rings of stone setts, alternating tones; darker granite outer band
    for(let ring=0;ring<22;ring++){const r0=18+ring*22.5,r1=r0+22.5;const n=Math.max(8,Math.round(2*Math.PI*r1/34));for(let k=0;k<n;k++){const a0=k/n*Math.PI*2+(ring%2)*.5/n*Math.PI*2,a1=a0+Math.PI*2/n;
      const tone=ring>=20?[70,58,78]:ring%5===4?[150,84,78]:[176-((k*37+ring*11)%5)*9,164-((k*17+ring*7)%5)*8,156-((k*23)%5)*8];x.fillStyle=`rgb(${tone})`;x.beginPath();x.arc(cx,cx,r1-1.2,a0+.004,a1-.004);x.arc(cx,cx,r0+1.2,a1-.004,a0+.004,true);x.closePath();x.fill();
      hx.beginPath();hx.arc(256,256,(r1-1.2)/2,a0,a1);hx.arc(256,256,(r0+1.2)/2,a1,a0,true);hx.closePath();hx.stroke()}}
    x.strokeStyle='rgba(60,40,50,.9)';x.lineWidth=3;[18+20*22.5,18+5*22.5,18+10*22.5,18+15*22.5].forEach(r=>{x.beginPath();x.arc(cx,cx,r,0,7);x.stroke()});
    noiseFill(x,S,S,0,9,16,3)});
  return {map:texFrom(c),n:normalFromHeight(hc,1.6,false)}}
function plankTex(){const hc=mkCanvas(256,256,(x)=>{x.fillStyle='#fff';x.fillRect(0,0,256,256);x.fillStyle='#000';for(let i=0;i<256;i+=32)x.fillRect(0,i,256,3)});
  const c=mkCanvas(256,256,(x)=>{for(let i=0;i<8;i++){const t=110+((i*53)%40);x.fillStyle=`rgb(${t+30},${t-20},${t-60})`;x.fillRect(0,i*32,256,32);for(let k=0;k<40;k++){x.strokeStyle=`rgba(60,30,10,${.1+Math.random()*.15})`;x.lineWidth=1;const y=i*32+Math.random()*32;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(80,y+Math.random()*4-2,170,y+Math.random()*4-2,256,y);x.stroke()}x.fillStyle='#2a160c';x.fillRect(0,i*32,256,3);x.fillRect((i*97)%256,i*32,3,32)}});
  return {map:texFrom(c,[2,2]),n:normalFromHeight(hc,2,false)}}
function waterNormal(){const S=256;const hc=mkCanvas(S,S,(x)=>{const img=x.createImageData(S,S);const d=img.data;for(let j=0;j<S;j++)for(let i=0;i<S;i++){const v=fbm(i/32,j/32,4,S/32);const k=(j*S+i)*4;d[k]=d[k+1]=d[k+2]=v*255;d[k+3]=255}x.putImageData(img,0,0)});
  const t=normalFromHeight(hc,5);t.repeat.set(3,3);return t}
// ---- world ----
function buildWorld(){const sc=V3.scene;const TX=V3.tex;
  // ground: city blocks with streets, curbs, crossings
  const st=streetTex();const ground=mesh(new THREE.PlaneGeometry(300,300),std(0xffffff,{map:st.map,roughnessMap:st.r,roughness:1,envMapIntensity:.6}),0,0,0,sc,true);ground.material.map.repeat.set(18.75,18.75);ground.material.roughnessMap.repeat.set(18.75,18.75);
  ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;
  // the arena: a thick stone plaza with a bevelled curb and a brass inlay
  const pv=paverTex();const paveMat=std(0xffffff,{map:pv.map,normalMap:pv.n,normalScale:new THREE.Vector2(.8,.8),roughness:.72});
  const stone=std(0x9d8f9a,{roughness:.7,map:TX.paint});
  const plaza=mesh(new THREE.CylinderGeometry(11.5,11.5,.25,96,1),[stone,paveMat,stone],0,.125,0,sc,true);plaza.receiveShadow=true;
  const curb=mesh(lathe([[11.92,0],[11.92,.05],[11.86,.2],[11.72,.27],[11.5,.27],[11.35,.2]],128),std(0x6d5e70,{roughness:.55,map:TX.paint}),0,0,0,sc,true);curb.receiveShadow=true;
  const brass=hero(new THREE.MeshStandardMaterial({color:0xd9a441,metalness:1,roughness:.28}));
  mesh(lathe([[11.6,.25],[11.56,.285],[11.5,.285],[11.46,.25]],128),brass,0,0,0,sc,true);
  // Downtown: a stepped display pedestal with painted bands, brass trim, a marble top and a neon ring
  const pl=new THREE.Group();sc.add(pl);V3.platform=pl;
  const band=canvasTex(512,64,(x,w,h)=>{for(let i=0;i<16;i++){x.fillStyle=i%2?'#c8283a':'#ffcb3a';x.fillRect(i*32,0,32,h)}x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,0,w,5);x.fillRect(0,h-5,w,5);noiseFill(x,w,h,0,16,6,2)},[4,1]);
  mesh(lathe([[0,0],[3.62,0],[3.62,.16],[3.52,.26],[3.4,.28],[0,.28]],96),std(0x2a1a34,{roughness:.35,metalness:.1}),0,0,0,pl);
  const drum=mesh(new THREE.CylinderGeometry(3.2,3.3,.72,96,1,true),new THREE.MeshPhysicalMaterial({map:band,roughness:.35,clearcoat:.8,clearcoatRoughness:.2}),0,.64,0,pl);drum.receiveShadow=true;
  mesh(lathe([[3.3,.98],[3.38,1.02],[3.38,1.07],[3.3,1.1],[3.18,1.1]],96),brass,0,0,0,pl);
  mesh(lathe([[3.3,.26],[3.4,.3],[3.3,.34]],96),brass,0,0,0,pl);
  const marble=canvasTex(512,512,(x,w,h)=>{x.fillStyle='#f3e9dc';x.fillRect(0,0,w,h);noiseFill(x,w,h,0,18,40,4);x.strokeStyle='rgba(150,120,140,.35)';for(let i=0;i<9;i++){x.lineWidth=1+Math.random()*2;x.beginPath();x.moveTo(Math.random()*w,0);x.bezierCurveTo(Math.random()*w,h*.3,Math.random()*w,h*.6,Math.random()*w,h);x.stroke()}
    x.translate(w/2,h/2);x.strokeStyle='rgba(190,140,40,.8)';x.lineWidth=8;x.beginPath();x.arc(0,0,236,0,7);x.stroke();x.lineWidth=3;x.beginPath();x.arc(0,0,214,0,7);x.stroke();
    x.fillStyle='rgba(200,40,58,.18)';x.beginPath();x.moveTo(-90,50);x.lineTo(-110,-60);x.lineTo(-50,-10);x.lineTo(0,-90);x.lineTo(50,-10);x.lineTo(110,-60);x.lineTo(90,50);x.closePath();x.fill()});
  const top=mesh(new THREE.CylinderGeometry(3.2,3.2,.08,96),[std(0xd9a441),new THREE.MeshPhysicalMaterial({map:marble,roughness:.25,clearcoat:.6}),std(0xd9a441)],0,1.06,0,pl);top.receiveShadow=true;
  V3.ring=mesh(new THREE.TorusGeometry(3.42,.06,10,120),glowMat(0xffc13a,2.4),0,1.02,0,pl,true);V3.ring.rotation.x=Math.PI/2;
  // the crown (brass and rubies) that floats over the king
  const crown=new THREE.Group();V3.crown=crown;sc.add(crown);
  const gold=hero(new THREE.MeshStandardMaterial({color:0xffc54a,metalness:1,roughness:.22,emissive:0x3a2200,emissiveIntensity:.6}));
  mesh(lathe([[.5,-.18],[.56,-.16],[.56,.02],[.5,.04],[.5,-.18]],40),gold,0,0,0,crown);
  const ruby=hero(new THREE.MeshPhysicalMaterial({color:0xff2040,roughness:.05,clearcoat:1,emissive:0x550010,emissiveIntensity:1.2}));
  for(let k=0;k<5;k++){const a=k/5*Math.PI*2;const sp=mesh(new THREE.ConeGeometry(.13,.44,12),gold,Math.cos(a)*.52,.24,Math.sin(a)*.52,crown);mesh(new THREE.SphereGeometry(.08,16,12),ruby,0,.25,0,sp);mesh(new THREE.OctahedronGeometry(.07),ruby,Math.cos(a+.63)*.57,-.07,Math.sin(a+.63)*.57,crown)}
  // DOWNTOWN marquee on two posts
  const mq=new THREE.Group();mq.position.set(0,0,-4.6);sc.add(mq);V3.marquee=mq;
  const frameM=std(0x2a1a34,{roughness:.4,metalness:.3});
  mesh(roundedBox(6.2,1.7,.36,2,.12),frameM,0,8.75,0,mq);[-2.6,2.6].forEach(x=>mesh(new THREE.CylinderGeometry(.12,.16,8,12),frameM,x,4,-.1,mq));
  V3.dtSign=mesh(new THREE.PlaneGeometry(5.9,1.45),new THREE.MeshBasicMaterial({map:null,color:new THREE.Color(1.3,1.3,1.3)}),0,8.75,.19,mq,true);
  const bulbs=new THREE.InstancedMesh(new THREE.SphereGeometry(.07,8,6),glowMat(0xffe6a0,3),30);for(let i=0;i<30;i++){const t=i/30;const per=2*(6.0+1.5);let d=t*per,x,y;if(d<6){x=-3+d;y=.75}else if(d<7.5){x=3;y=.75-(d-6)}else if(d<13.5){x=3-(d-7.5);y=-.75}else{x=-3;y=-.75+(d-13.5)}bulbs.setMatrixAt(i,M4(x,8.75+y,.2))}mq.add(bulbs);V3.mqBulbs=bulbs;
  // harbor: stone quay, glossy animated water, a plank pier, buoys and a tug
  const hb=new THREE.Group();hb.position.set(12.5,0,-6.5);sc.add(hb);V3.harbor=hb;
  const wn=waterNormal();V3.wn=wn;
  V3.water=mesh(new THREE.PlaneGeometry(9,8),hero(new THREE.MeshPhysicalMaterial({color:0x1d6f8a,roughness:.08,metalness:.05,normalMap:wn,normalScale:new THREE.Vector2(.55,.55),clearcoat:.4,envMapIntensity:1.4})),0,.2,0,hb,true);V3.water.rotation.x=-Math.PI/2;V3.water.receiveShadow=true;
  mesh(new THREE.PlaneGeometry(9.6,8.6),std(0x0d2530),0,.02,0,hb,true).rotation.x=-Math.PI/2;
  const quay=std(0x8c7d88,{roughness:.8,map:TX.paint});[[0,-4.15,9.8,.5],[0,4.15,9.8,.5],[-4.65,0,.5,8.8],[4.65,0,.5,8.8]].forEach(([x,z,w,d])=>mesh(roundedBox(w,.55,d,2,.08),quay,x,.26,z,hb));
  const pk=plankTex();const wood=std(0xffffff,{map:pk.map,normalMap:pk.n,roughness:.75});const dark=std(0x3a2418,{roughness:.8});
  const deck=mesh(new THREE.CylinderGeometry(2.7,2.7,.16,48),[dark,wood,dark],0,.62,0,hb);deck.receiveShadow=true;
  for(let k=0;k<10;k++){const a=k/10*Math.PI*2;mesh(new THREE.CylinderGeometry(.13,.13,.9,10),dark,Math.cos(a)*2.62,.3,Math.sin(a)*2.62,hb)}
  const rope=mesh(new THREE.TorusGeometry(2.66,.045,6,64),std(0xcaa878,{roughness:.9}),0,.66,0,hb);rope.rotation.x=Math.PI/2;
  V3.buoys=[];[[-3.3,-2.9,0xff3a3a],[3.4,2.9,0x2fe06a]].forEach(([x,z,c],k)=>{const b=new THREE.Group();b.position.set(x,.2,z);hb.add(b);mesh(lathe([[0,-.1],[.26,-.05],[.28,.12],[.12,.3],[.06,.55],[0,.55]],20),vinyl(c,{vertexColors:false}),0,0,0,b);const l=mesh(new THREE.SphereGeometry(.07,10,8),glowMat(c,3),0,.6,0,b,true);b.userData.l=l;V3.buoys.push(b)});
  const tug=new THREE.Group();tug.position.set(-2.6,.22,2.6);tug.rotation.y=.7;hb.add(tug);V3.tug=tug;
  const hs=new THREE.Shape();hs.moveTo(-.9,-.35);hs.lineTo(.6,-.35);hs.quadraticCurveTo(1.05,-.3,1.05,0);hs.quadraticCurveTo(1.05,.3,.6,.35);hs.lineTo(-.9,.35);hs.quadraticCurveTo(-1,.0,-.9,-.35);
  const hull=mesh(new THREE.ExtrudeGeometry(hs,{depth:.32,bevelEnabled:true,bevelThickness:.06,bevelSize:.05,bevelSegments:3}),vinyl(0xd8343f,{vertexColors:false}),0,-.05,0,tug);hull.rotation.x=-Math.PI/2;
  mesh(roundedBox(.6,.36,.5,2,.06),vinyl(0xf3eee4,{vertexColors:false}),-.2,.45,0,tug);mesh(new THREE.CylinderGeometry(.08,.1,.4,12),vinyl(0x2a1a34,{vertexColors:false}),-.3,.8,0,tug);
  V3.hsign=sprite(signTex('HARBOR','#43c8ff','#e9fbff'),0,4.3,-2.5,3.6,.9,hb);V3.hsign.material.color.setScalar(1.5);
  // the city: merged facades, roofs, trims, rooftop props and neon (a few draw calls)
  buildCity();
  // street lamps around the plaza (instanced poles and warm bulbs)
  const lamps=[];for(let k=0;k<26;k++){const a=k/26*Math.PI*2+.06;const x=Math.cos(a)*12.35,z=Math.sin(a)*12.35;if(z>6&&Math.abs(x)<7)continue;if(Math.abs(x-12.5)<5.2&&Math.abs(z+6.5)<4.8)continue;lamps.push([x,z])}
  const pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(.05,.08,2.2,8),std(0x2a2230,{metalness:.6,roughness:.4}),lamps.length);pole.castShadow=true;
  const bulb=new THREE.InstancedMesh(new THREE.SphereGeometry(.16,12,10),glowMat(0xffc878,1.7),lamps.length);
  lamps.forEach(([x,z],i)=>{pole.setMatrixAt(i,M4(x,1.1,z));bulb.setMatrixAt(i,M4(x,2.25,z))});sc.add(pole,bulb);
  const pool=new THREE.InstancedMesh(new THREE.CircleGeometry(1.6,24),new THREE.MeshBasicMaterial({map:TX.glow,color:new THREE.Color(.55,.34,.16),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}),lamps.length);
  lamps.forEach(([x,z],i)=>pool.setMatrixAt(i,M4(x,.03,z,-Math.PI/2)));sc.add(pool);
  // trees: clustered sculpted foliage (merged)
  const tb=Bag();for(let i=0;i<14;i++){const a=i/14*Math.PI*2+.2;const x=Math.cos(a)*13.6,z=Math.sin(a)*13.6;if(z>4&&Math.abs(x)<9)continue;if(Math.abs(x-12.5)<5.5&&Math.abs(z+6.5)<5)continue;
    tb.add('trunk',new THREE.CylinderGeometry(.1,.16,.9,8),M4(x,.45,z),new THREE.Color(0x6b4128));
    for(let j=0;j<4;j++){const g=new THREE.IcosahedronGeometry(.42+((i*7+j*3)%4)*.06,1);const col=new THREE.Color().setHSL(.3+((i+j)%3)*.03,.45,.28+j*.03);tb.add('leaf',g,M4(x+Math.cos(j*2.1)*.28*(j?1:0),1.15+j*.18,z+Math.sin(j*2.1)*.28*(j?1:0),j,j*.7,0),col)}}
  mesh(tb.geo('trunk'),std(0xffffff,{vertexColors:true}),0,0,0,sc);mesh(tb.geo('leaf'),std(0xffffff,{vertexColors:true,roughness:.7,flatShading:true}),0,0,0,sc);
  // dice tray: walnut frame, felt bed
  V3.tray=new THREE.Group();V3.tray.position.set(0,.3,12.6);sc.add(V3.tray);
  const rr=(w,h,r)=>{const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s};
  const fr=rr(10.4,4.9,.7);fr.holes.push(rr(9.6,4.1,.45));
  const walnut=canvasTex(512,512,(x,w,h)=>{x.fillStyle='#5a3220';x.fillRect(0,0,w,h);for(let i=0;i<220;i++){x.strokeStyle=`rgba(${Math.random()<.5?'30,14,6':'140,80,44'},${.12+Math.random()*.2})`;x.lineWidth=1+Math.random()*2;const y=Math.random()*h;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(w*.3,y+Math.random()*20-10,w*.7,y+Math.random()*20-10,w,y+Math.random()*6-3);x.stroke()}},[.25,.25]);
  const frame=mesh(new THREE.ExtrudeGeometry(fr,{depth:.26,bevelEnabled:true,bevelThickness:.07,bevelSize:.07,bevelSegments:3,curveSegments:8}),new THREE.MeshPhysicalMaterial({map:walnut,roughness:.35,clearcoat:.7,clearcoatRoughness:.25}),0,-.28,.6,V3.tray);frame.rotation.x=-Math.PI/2;
  const felt=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#1d5a58';x.fillRect(0,0,w,h);noiseFill(x,w,h,0,34,2,2)},[6,3]);
  const bed=mesh(new THREE.ShapeGeometry(rr(9.7,4.2,.45)),std(0xffffff,{map:felt,roughness:1}),0,-.02,.6,V3.tray,true);bed.rotation.x=-Math.PI/2;bed.receiveShadow=true;
  V3.traySpot=bed;
  makeFaceMats();
  V3.activeRing=mesh(new THREE.TorusGeometry(2.25,.07,10,64),glowMat(0xffd23f,2.6),0,.3,0,sc,true);V3.activeRing.rotation.x=Math.PI/2;
  V3.activeGlow=mesh(new THREE.CircleGeometry(2.6,40),new THREE.MeshBasicMaterial({map:TX.glow,color:new THREE.Color(.5,.4,.05),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}),0,.3,0,sc,true);V3.activeGlow.rotation.x=-Math.PI/2;
  // Tokyo Tower (King Kong pack): painted lattice tower
  const tw=new THREE.Group();tw.position.set(-13.5,.25,-10.5);tw.scale.setScalar(.85);sc.add(tw);V3.tower=tw;V3.tsegs=[];
  const white=std(0xf0e8e0,{roughness:.5});
  [[2.2,1.6,3],[1.6,1.0,2.6],[1.0,.25,2.8]].forEach(([r0,r1,h],k)=>{const y=[0,3,5.6][k];const m=mesh(new THREE.CylinderGeometry(r1,r0,h,6,4,true),new THREE.MeshStandardMaterial({color:0x8a8190,roughness:.45,metalness:.35,side:THREE.DoubleSide,wireframe:false}),0,y+h/2,0,tw);
    const lat=mesh(new THREE.TorusGeometry(r0*.97,.09,6,6),white,0,y+.06,0,tw);lat.rotation.x=Math.PI/2;V3.tsegs.push(m)});
  mesh(new THREE.SphereGeometry(.25,12,10),glowMat(0xff3355,3),0,8.6,0,tw,true);
  V3.tsign=sprite(signTex('TOKYO TOWER','#ffd23f','#fff6d0'),0,10.2,0,4.4,1.1,tw);tw.visible=false;
  V3.csign=sprite(signTex('CURSE','#b57bff','#ffffff'),0,12.6,-9,6.4,1.6);V3.csign.visible=false;V3.curseShown=null;
  sc.traverse(o=>{if(o.isInstancedMesh)o.frustumCulled=false});
  V3.icons={star:iconTex('star'),heart:iconTex('heart'),bolt:iconTex('bolt'),brain:iconTex('brain'),fire:iconTex('fire'),puff:iconTex('puff'),spark:iconTex('spark')};
  refreshSigns();
}
function refreshSigns(){if(V3.dtSign){if(V3.dtSign.material.map)V3.dtSign.material.map.dispose();V3.dtSign.material.map=canvasTex(1024,256,(x,w,h)=>neonDraw(x,'DOWNTOWN','#ff3f7a',w,h,'170px Bangers, Impact, "Arial Black", sans-serif'));V3.dtSign.material.needsUpdate=true}
  if(V3.neonMat){const old=V3.neonMat.map;V3.neonMat.map=neonAtlas();V3.neonMat.needsUpdate=true;if(old)old.dispose()}
  if(V3.hsign)V3.hsign.material.map=G&&!G.bayOn?signTex('CLOSED','#8aa6b5','#ffffff'):signTex('HARBOR','#43c8ff','#e9fbff')}
function buildCity(){const sc=V3.scene;const B=Bag();const F=facadeTextures();V3.facade=F;const CW=.5,CH=.62,AT=16;
  let seed=1;const rnd3=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
  const pal=[0x7a4a92,0x4d4a9a,0x3f6a92,0x924a70,0x6a54a2,0x3a7a84,0x9a6252,0x7a6a8c,0xa08a6a];
  const facadeBox=(Mb,cx,cy,cz,w,h,d,tint)=>{const uo=[Math.floor(rnd3()*AT)/AT,Math.floor(rnd3()*AT)/AT];
    [[0,0,d/2,0,w],[0,0,-d/2,Math.PI,w],[w/2,0,0,Math.PI/2,d],[-w/2,0,0,-Math.PI/2,d]].forEach(([x,y,z,ry,fw])=>{const m=new THREE.Matrix4().multiplyMatrices(Mb,M4(cx+x,cy+h/2,cz+z,0,ry));B.add('fac',new THREE.PlaneGeometry(fw,h),m,tint,[fw/CW/AT,h/CH/AT],uo)});
    B.add('roof',new THREE.PlaneGeometry(w,d),new THREE.Matrix4().multiplyMatrices(Mb,M4(cx,cy+h,cz,-Math.PI/2)),null,[w/3,d/3]);
    B.add('trim',roundedBox(w+.22,.16,d+.22,1,.05),new THREE.Matrix4().multiplyMatrices(Mb,M4(cx,cy+h+.02,cz)),new THREE.Color(tint).offsetHSL(0,-.12,.1))};
  const snap=(v,s)=>Math.max(s*2,Math.round(v/s)*s);let signRow=0;V3.blinks=[];const blinkPos=[[],[]];
  for(let i=0;i<120;i++){const a=rnd3()*Math.PI*2,rad=15+rnd3()*24;let x=Math.cos(a)*rad,z=Math.sin(a)*rad;
    if(z>2&&Math.abs(x)<18)continue;if(Math.abs(x-12.5)<6.5&&Math.abs(z+6.5)<6.5)continue;
    const w=snap(2+rnd3()*3,CW),d=snap(2+rnd3()*3,CW);const low=z<-8&&Math.abs(x)<18;let h=snap(low?3+rnd3()*5:3+rnd3()*(rad>25?17:11),CH);
    const ry=Math.round(Math.atan2(-x,-z)/(Math.PI/2))*(Math.PI/2)+(rnd3()-.5)*.3;const Mb=M4(x,0,z,0,ry);const tint=new THREE.Color(pal[i%pal.length]).offsetHSL((rnd3()-.5)*.04,0,(rnd3()-.5)*.08);
    B.add('curb',roundedBox(w+.9,.12,d+.9,1,.06),new THREE.Matrix4().multiplyMatrices(Mb,M4(0,.06,0)),new THREE.Color(0x8e838c));
    const kind=rnd3();let topY=h,tw=w,td=d;
    if(kind<.5||h<5){facadeBox(Mb,0,.1,0,w,h,d,tint)}
    else if(kind<.82){const h1=snap(h*.6,CH),h2=snap(h*.28,CH),w2=snap(w*.72,CW),d2=snap(d*.72,CW);facadeBox(Mb,0,.1,0,w,h1,d,tint);facadeBox(Mb,0,.1+h1+.08,0,w2,h2,d2,tint);topY=h1+h2+.08;tw=w2;td=d2;
      if(rnd3()<.5){const w3=snap(w2*.6,CW),h3=snap(1.2+rnd3()*1.8,CH);facadeBox(Mb,0,topY+.18,0,w3,h3,w3,tint);topY+=h3+.1;tw=td=w3}}
    else{const r=Math.min(w,d)/2;const circ=2*Math.PI*r;const g=new THREE.CylinderGeometry(r,r,h,24,1,true);B.add('fac',g,new THREE.Matrix4().multiplyMatrices(Mb,M4(0,h/2+.1,0)),tint,[Math.round(circ/CW)/AT,h/CH/AT],[Math.floor(rnd3()*AT)/AT,0]);
      B.add('trim',new THREE.SphereGeometry(r*1.02,24,8,0,Math.PI*2,0,Math.PI/2),new THREE.Matrix4().multiplyMatrices(Mb,M4(0,h+.1,0,0,0,0,1,.45,1)),new THREE.Color(tint).offsetHSL(0,-.1,.12));
      B.add('trim',new THREE.CylinderGeometry(r*1.06,r*1.06,.16,24),new THREE.Matrix4().multiplyMatrices(Mb,M4(0,h+.1,0)),new THREE.Color(tint).offsetHSL(0,-.15,.2));topY=h+r*.45;tw=td=r}
    // rooftop props
    const pr=rnd3();const Mt=new THREE.Matrix4().multiplyMatrices(Mb,M4(0,topY+.18,0));
    if(pr<.3){const ap=new THREE.Vector3(0,1.6,0).applyMatrix4(Mt);B.add('metal',new THREE.CylinderGeometry(.04,.06,1.6,6),new THREE.Matrix4().multiplyMatrices(Mt,M4(0,.8,0)));blinkPos[i%2].push(ap)}
    else if(pr<.55&&tw>1.2){const m=new THREE.Matrix4().multiplyMatrices(Mt,M4((rnd3()-.5)*tw*.4,0,(rnd3()-.5)*td*.4));B.add('wood',new THREE.CylinderGeometry(.42,.42,.8,14),new THREE.Matrix4().multiplyMatrices(m,M4(0,.75,0)));
      B.add('wood',new THREE.ConeGeometry(.5,.38,14),new THREE.Matrix4().multiplyMatrices(m,M4(0,1.34,0)),new THREE.Color(.55,.45,.42));[[.3,.3],[-.3,.3],[.3,-.3],[-.3,-.3]].forEach(([a,b])=>B.add('metal',new THREE.CylinderGeometry(.03,.03,.4,5),new THREE.Matrix4().multiplyMatrices(m,M4(a,.18,b))))}
    else if(pr<.8){for(let k=0;k<2;k++)B.add('metal',roundedBox(.42,.3,.34,1,.04),new THREE.Matrix4().multiplyMatrices(Mt,M4((k-.5)*.6,.1,(rnd3()-.5)*td*.4)),new THREE.Color(.75,.75,.8))}
    // neon: a sign on the front facade, or a billboard on the roof
    if(rnd3()<.5&&w>=2){const slot=signRow++%NEON_WORDS.length;const sw=Math.min(w*.8,2.4),sh=sw/4;const col=slot%2,row=slot>>1;const uo=[col*.5,1-(row+1)/8],us=[.5,1/8];
      const onRoof=h<7&&rnd3()<.6;const y=onRoof?topY+.5+sh/2:Math.min(h-.6,2.2+rnd3()*Math.max(0,h-4));const zf=(onRoof?0:d/2)+.06;
      B.add('neon',new THREE.PlaneGeometry(sw,sh),new THREE.Matrix4().multiplyMatrices(Mb,M4(0,y,zf)),null,us,uo);
      B.add('metal',roundedBox(sw+.12,sh+.1,.08,1,.03),new THREE.Matrix4().multiplyMatrices(Mb,M4(0,y,zf-.06)),new THREE.Color(.3,.25,.35));
      if(onRoof)[-sw*.35,sw*.35].forEach(px=>B.add('metal',new THREE.CylinderGeometry(.03,.03,.5,5),new THREE.Matrix4().multiplyMatrices(Mb,M4(px,topY+.25,zf-.06))))}
    // shop awning on low blocks
    if(h<5&&rnd3()<.6){B.add('awn',new THREE.CylinderGeometry(.3,.3,w*.9,12,1,false,0,Math.PI),new THREE.Matrix4().multiplyMatrices(Mb,M4(0,.9,d/2+.05,0,0,Math.PI/2)),new THREE.Color().setHSL(rnd3(),.6,.5))}}
  const F2=V3.facade;
  const facMat=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,map:F2.map,emissive:0xffffff,emissiveMap:F2.em,emissiveIntensity:1.5,normalMap:F2.n,normalScale:new THREE.Vector2(.9,.9),roughnessMap:F2.r,roughness:1,metalness:.05});
  const roofTex=canvasTex(128,128,(x,w,h)=>{x.fillStyle='#4a3e4c';x.fillRect(0,0,w,h);noiseFill(x,w,h,0,40,3,3);x.fillStyle='rgba(20,10,20,.3)';for(let i=0;i<5;i++)x.fillRect(Math.random()*w,Math.random()*h,10,10)},[1,1]);roofTex.wrapS=roofTex.wrapT=THREE.RepeatWrapping;
  V3.neonMat=new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1.6,1.6),map:null});
  const mats={fac:facMat,roof:std(0xffffff,{map:roofTex,roughness:.9}),trim:std(0xffffff,{vertexColors:true,roughness:.55,map:V3.tex.paint}),curb:std(0xffffff,{vertexColors:true,roughness:.85}),
    metal:std(0x4a4452,{vertexColors:true,metalness:.6,roughness:.4}),wood:std(0x8a5a3a,{vertexColors:true,roughness:.8}),neon:V3.neonMat,awn:vinyl(0xffffff,{roughness:.6,clearcoat:.2})};
  for(const k in mats){const g=B.geo(k);if(!g)continue;const m=mesh(g,mats[k],0,0,0,sc,k==='neon');if(k==='curb'||k==='roof')m.castShadow=false;m.receiveShadow=k!=='neon'}
  // rooftop aviation lights: two groups that blink out of phase
  V3.blinkMats=[glowMat(0xff2a44,3),glowMat(0xff2a44,3)];blinkPos.forEach((L,k)=>{if(!L.length)return;const im=new THREE.InstancedMesh(new THREE.SphereGeometry(.13,8,6),V3.blinkMats[k],L.length);L.forEach((p,i)=>im.setMatrixAt(i,M4(p.x,p.y,p.z)));sc.add(im)})}
function sprite(tex,x,y,z,w,h,parent){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));s.position.set(x,y,z);s.scale.set(w,h,1);(parent||V3.scene).add(s);return s}
// ---- monsters: painted vinyl collectibles on display bases ----
function eyes(g,xs,y,z,r,look){const W=vinyl(0xfffaf2,{roughness:.18,clearcoat:1,clearcoatRoughness:.05,map:null,roughnessMap:null});const Pm=vinyl(0x120c18,{roughness:.1,clearcoat:1,clearcoatRoughness:.04,map:null,roughnessMap:null});
  xs.forEach(x=>{const e=mesh(new THREE.SphereGeometry(r,28,20),W,x,y,z,g);
  const p=mesh(new THREE.SphereGeometry(r*.5,20,14),Pm,0,0,r*.8,e);p.scale.z=.45;
  const hl=mesh(new THREE.SphereGeometry(r*.15,10,8),new THREE.MeshBasicMaterial({color:new THREE.Color(1.15,1.15,1.15)}),r*.18,r*.2,r*.42,p,true);if(look)e.rotation.y=look})}
function brow(g,x,y,z,rot){const b=capsuleH(.055,.3,vinyl(0x241a2c,{roughness:.35}),x,y,z,g,rot)}
function buildMonster(m){const g=new THREE.Group();const C=new THREE.Color(MONS[m].c);const body=vinyl(C);const belly=vinyl(C.clone().offsetHSL(0,-.1,.14));const dark=vinyl(0x241a2c,{roughness:.35});const white=vinyl(0xfff6e8,{roughness:.3,clearcoat:.8});const anim={};
  switch(m){
  case 0:{mesh(new THREE.SphereGeometry(1,48,36),body,0,1.2,0,g).scale.set(1.15,.95,1.2);
    mesh(new THREE.SphereGeometry(.8,32,24),belly,0,.98,.52,g).scale.set(1,.8,.7);
    const sn=mesh(lathe([[0,-.19],[.36,-.19],[.44,-.14],[.47,0],[.44,.14],[.36,.19],[0,.19]],32),vinyl(0xffb3a7),0,1.0,1.18,g);sn.rotation.x=Math.PI/2;
    [-.15,.15].forEach(x=>mesh(new THREE.SphereGeometry(.085,14,10),dark,x,1.02,1.37,g).scale.set(1,1.3,.5));
    [-1,1].forEach(s=>mesh(taperTube([new THREE.Vector3(s*.36,.86,1.08),new THREE.Vector3(s*.5,.95,1.3),new THREE.Vector3(s*.58,1.25,1.38),new THREE.Vector3(s*.5,1.5,1.3)],.11,.02,20,10),white,0,0,0,g));
    [-.6,.6].forEach(x=>{const e=mesh(new THREE.ConeGeometry(.3,.62,24),body,x,2.05,.1,g);e.rotation.z=x<0?.45:-.45;e.scale.z=.55;const ie=mesh(new THREE.ConeGeometry(.2,.42,20),vinyl(0xff9fb0),0,-.04,.1,e);ie.scale.z=.4});
    eyes(g,[-.38,.38],1.52,.92,.2);brow(g,-.38,1.78,1.05,-.35);brow(g,.38,1.78,1.05,.35);
    const bolt=new THREE.Shape();[[0,.6],[-.3,0],[-.05,0],[-.2,-.5],[.3,.15],[.05,.15],[.2,.6]].forEach(([x,y],k)=>k?bolt.lineTo(x,y):bolt.moveTo(x,y));
    const bm=mesh(new THREE.ExtrudeGeometry(bolt,{depth:.1,bevelEnabled:true,bevelThickness:.04,bevelSize:.035,bevelSegments:3}),vinyl(0x4cc9f0,{emissive:0x2aa8e0,emissiveIntensity:1.4,roughness:.2}),0,2.25,.05,g);anim.bolt=bm;
    [[-.55,.45],[.55,.45],[-.55,-.45],[.55,-.45]].forEach(([x,z])=>{mesh(new THREE.CapsuleGeometry(.22,.22,6,14),body,x,.3,z,g);mesh(new THREE.CylinderGeometry(.2,.23,.12,16),dark,x,.06,z,g)});
    mesh(taperTube([new THREE.Vector3(0,1.1,-1.1),new THREE.Vector3(0,1.3,-1.35),new THREE.Vector3(.15,1.5,-1.3),new THREE.Vector3(0,1.55,-1.15)],.07,.03,16,8),body,0,0,0,g);break}
  case 1:{const pts=[];for(let k=0;k<=24;k++){const t=k/24;pts.push(new THREE.Vector2(Math.sin(t*Math.PI)*.95*(1-t*.25)+.02,t*2.1))}
    mesh(new THREE.LatheGeometry(pts,48),body,0,.9,0,g);
    eyes(g,[0],1.75,.78,.42);brow(g,-.3,2.25,.95,-.4);brow(g,.3,2.25,.95,.4);
    anim.tent=[];for(let k=0;k<7;k++){const a=k/7*Math.PI*2;const cx=Math.cos(a),cz=Math.sin(a);
      const tt=mesh(taperTube([new THREE.Vector3(cx*.45,1.05,cz*.45),new THREE.Vector3(cx*.95,.5,cz*.95),new THREE.Vector3(cx*1.3,.14,cz*1.3),new THREE.Vector3(cx*1.62,.26,cz*1.62),new THREE.Vector3(cx*1.72,.46,cz*1.66)],.2,.05,28,12),body,0,0,0,g);anim.tent.push(tt)}
    [[.55,1.4,.55],[-.6,1.9,.45],[.2,2.5,.5],[-.3,1.25,.7]].forEach(([x,y,z])=>mesh(new THREE.SphereGeometry(.1,14,10),vinyl(0xe7ccff),x,y,z,g).scale.z=.5);break}
  case 2:{const shell=vinyl(C,{emissiveMap:lavaTex(),emissive:0xff5a10,emissiveIntensity:.9});mesh(new THREE.SphereGeometry(1,48,32),shell,0,1.0,0,g).scale.set(1.35,.62,1.05);
    [-.35,.35].forEach(x=>{mesh(new THREE.CapsuleGeometry(.06,.5,4,10),body,x,1.72,.4,g);eyes(g,[x],2.1,.45,.17)});
    anim.claws=[];[-1,1].forEach(s=>{const arm=new THREE.Group();arm.position.set(s*1.3,1.2,.4);g.add(arm);mesh(new THREE.CapsuleGeometry(.14,.6,6,12),body,0,.3,0,arm).rotation.z=-s*.5;
      const cl=new THREE.Group();cl.position.set(s*.35,.8,.2);arm.add(cl);mesh(new THREE.SphereGeometry(.42,28,20),shell,0,0,0,cl).scale.set(1,1.2,.8);
      const up=mesh(new THREE.ConeGeometry(.2,.62,20),body,0,.55,.15,cl);up.rotation.x=-.3;const lo=mesh(new THREE.ConeGeometry(.16,.5,20),body,s*.18,.45,.22,cl);lo.rotation.set(-.3,0,-s*.4);anim.claws.push(cl)});
    for(let k=0;k<3;k++)[-1,1].forEach(s=>{const z=-.3+k*.35;mesh(taperTube([new THREE.Vector3(s*.95,.8,z),new THREE.Vector3(s*1.45,.9,z+.05),new THREE.Vector3(s*1.75,.45,z+.1),new THREE.Vector3(s*1.85,.04,z+.12)],.09,.03,16,8),body,0,0,0,g)});
    mesh(new THREE.CapsuleGeometry(.05,.34,4,8),dark,0,.86,.99,g).rotation.z=Math.PI/2;
    [-.2,0,.2].forEach(x=>{const t=mesh(new THREE.ConeGeometry(.06,.14,10),white,x,.8,1.0,g);t.rotation.x=Math.PI});break}
  case 3:{mesh(new THREE.CapsuleGeometry(.62,.8,10,24),vinyl(0xf1e2c4),0,1.0,0,g);
    const capM=vinyl(0xe63946,{roughness:.35,clearcoat:.8});const cap=mesh(lathe([[0,0],[.6,-.02],[1.2,-.04],[1.34,-.06],[1.38,.02],[1.25,.22],[.95,.45],[.5,.6],[0,.62]],48),capM,0,1.72,0,g);
    mesh(lathe([[.3,-.01],[1.22,-.05],[1.2,-.02],[.3,0]],48),vinyl(0xd9c3a0,{roughness:.8,clearcoat:0}),0,1.72,0,g);
    [[-.7,2.1,.62],[.2,2.32,.42],[.82,2.02,.6],[-.25,2.18,-.8],[.66,2.0,-.72],[-.95,1.95,-.2]].forEach(([x,y,z])=>{const s=mesh(new THREE.SphereGeometry(.22,18,12),white,x,y,z,g);s.scale.y=.42;s.lookAt(0,1.2,0)});
    eyes(g,[-.25,.25],1.25,.52,.15);brow(g,-.25,1.45,.66,-.4);brow(g,.25,1.45,.66,.4);
    mesh(roundedBox(.5,.14,.1,2,.05),dark,0,.9,.58,g);[-.14,0,.14].forEach(x=>mesh(new THREE.BoxGeometry(.08,.07,.04),white,x,.95,.63,g));
    [-1,1].forEach(s=>{const a=mesh(new THREE.CapsuleGeometry(.2,.5,8,16),body,s*.8,1.0,.1,g);a.rotation.z=s*.6;mesh(new THREE.SphereGeometry(.2,16,12),body,s*1.05,.72,.12,g)});
    [-.3,.3].forEach(x=>mesh(new THREE.CapsuleGeometry(.2,.1,6,12),vinyl(0xd8c4a0),x,.22,0,g));break}
  case 4:{const metal=vinyl(C,{roughness:.32,clearcoat:.9,metalness:.15});mesh(roundedBox(1.7,1.5,1.4,4,.2),metal,0,1.35,0,g);
    mesh(roundedBox(1.32,.5,.12,3,.06),vinyl(0x0f0c16,{roughness:.08,clearcoat:1}),0,1.6,.69,g);
    [-.3,.3].forEach(x=>mesh(roundedBox(.3,.17,.05,2,.04),glowMat(0x4cff9f,2.6),x,1.6,.76,g,true));
    mesh(roundedBox(.9,.3,.1,2,.05),vinyl(0xdfe7f0,{metalness:.6,roughness:.25}),0,1.0,.7,g);[-.3,-.1,.1,.3].forEach(x=>mesh(new THREE.BoxGeometry(.04,.22,.04),dark,x,1.0,.76,g));
    const an=mesh(new THREE.CylinderGeometry(.04,.05,.6,10),dark,0,2.4,0,g);anim.bulb=mesh(new THREE.SphereGeometry(.15,18,14),glowMat(0xffd23f,2.4),0,.35,0,an,true);
    [-1,1].forEach(s=>{mesh(roundedBox(.42,.5,1.6,3,.18),dark,s*.66,.3,0,g);[-.52,0,.52].forEach(z=>{const w=mesh(new THREE.CylinderGeometry(.19,.19,.46,20),vinyl(0x9a9aa6,{metalness:.8,roughness:.3,clearcoat:.2}),s*.66,.3,z,g);w.rotation.z=Math.PI/2});
      const arm=mesh(roundedBox(.26,.9,.26,2,.1),vinyl(0xffd23f),s*1.05,1.3,.2,g);arm.rotation.z=s*.4;mesh(new THREE.SphereGeometry(.2,16,12),dark,s*1.25,.9,.25,g);
      [-.35,.35].forEach(y=>mesh(new THREE.CylinderGeometry(.06,.06,.05,12),vinyl(0x9a9aa6,{metalness:.8,roughness:.3}),s*.86,1.35+y,.5,g).rotation.z=Math.PI/2)});break}
  case 5:{const ice=vinyl(C,{flatShading:true,roughness:.06,clearcoat:1,clearcoatRoughness:.05,emissive:0x0d4a58,emissiveIntensity:.8,map:null,roughnessMap:null,transparent:true,opacity:.94});
    const ic=mesh(new THREE.IcosahedronGeometry(1.1,1),ice,0,1.45,0,g);ic.scale.y=1.3;
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2;const s=mesh(new THREE.ConeGeometry(.2,.8,5),vinyl(0xe8fdff,{flatShading:true,roughness:.1,clearcoat:1,map:null}),Math.cos(a)*.95,1.9+(k%2)*.3,Math.sin(a)*.8,g);s.lookAt(Math.cos(a)*3,3,Math.sin(a)*3);s.rotateX(Math.PI/2)}
    [-.3,.3].forEach(x=>{const e=mesh(roundedBox(.28,.12,.06,2,.03),glowMat(0x7fe8ff,2.8),x,1.6,1.0,g,true);e.rotation.z=x<0?-.25:.25});
    [-.24,-.08,.08,.24].forEach(x=>{const t=mesh(new THREE.ConeGeometry(.07,.22,5),white,x,1.08,.97,g);t.rotation.x=Math.PI});
    [-1,1].forEach(s=>mesh(new THREE.OctahedronGeometry(.35,0),ice,s*1.2,1.2,.1,g));[-.4,.4].forEach(x=>mesh(new THREE.DodecahedronGeometry(.28,0),ice,x,.25,0,g));break}
  case 6:{const bg=new THREE.SphereGeometry(1,64,48);const pa=bg.attributes.position;for(let k=0;k<pa.count;k++){const v=new THREE.Vector3().fromBufferAttribute(pa,k);const n=1+.07*Math.sin(v.x*9)*Math.cos(v.y*8)+.05*Math.sin(v.z*11);v.multiplyScalar(n);pa.setXYZ(k,v.x,v.y,v.z)}bg.computeVertexNormals();
    const br=mesh(bg,vinyl(C,{roughness:.3,clearcoat:.9}),0,1.9,0,g);br.scale.set(1.1,.9,1);mesh(roundedBox(.06,.9,1.9,1,.02),vinyl(0xc45a9a),0,2.2,0,g);
    [-1,1].forEach(s=>{const a=mesh(new THREE.CylinderGeometry(.035,.045,1,8),dark,s*.45,2.95,0,g);a.rotation.z=-s*.4;mesh(new THREE.SphereGeometry(.14,16,12),glowMat(0xffd23f,2.2),0,.55,0,a,true)});
    eyes(g,[-.35,.35],1.75,.85,.22);g.children.filter(o=>o.geometry&&o.geometry.type==='SphereGeometry'&&o.position.y===1.75).forEach(e=>mesh(new THREE.TorusGeometry(.1,.025,8,20),glowMat(0xb57bff,2),0,0,.2,e,true));
    anim.tent=[];[-.5,-.17,.17,.5].forEach((x,k)=>{const t=mesh(taperTube([new THREE.Vector3(x,1.25,.1),new THREE.Vector3(x*1.1,.8,.2),new THREE.Vector3(x*1.25,.35,.1),new THREE.Vector3(x*1.4,.08,.25)],.15,.06,20,10),vinyl(0xc45a9a),0,0,0,g);anim.tent.push(t)});break}
  case 7:{const shell=vinyl(0xf2e4c9,{roughness:.3,clearcoat:.9});const top=mesh(new THREE.SphereGeometry(1.1,40,20,0,Math.PI*2,0,Math.PI/2),shell,0,1.55,.4,g);top.scale.set(1,.55,1);top.rotation.x=-.25;anim.lid=top;
    for(let k=0;k<7;k++){const r=mesh(new THREE.TorusGeometry(1.1,.03,6,40,Math.PI),vinyl(0xd9c6a3),0,0,0,top);r.rotation.set(0,k/7*Math.PI,0)}
    const bot=mesh(new THREE.SphereGeometry(1.1,40,20,0,Math.PI*2,Math.PI/2,Math.PI/2),shell,0,1.35,.4,g);bot.scale.set(1,.4,1);
    mesh(new THREE.SphereGeometry(.95,32,16),vinyl(0x5a2a3e,{roughness:.2}),0,1.45,.35,g).scale.set(1,.2,1);
    eyes(g,[-.35,.35],1.5,1.15,.16);mesh(new THREE.SphereGeometry(.18,24,18),new THREE.MeshPhysicalMaterial({color:0xfff4fa,roughness:.05,clearcoat:1,iridescence:1,emissive:0x443344,emissiveIntensity:.6}),0,1.42,1.1,g);
    for(let k=0;k<5;k++){const ang=k*.55,px=Math.sin(ang)*1.1*k*.45,pz=-.3-Math.cos(ang)*k*.42;mesh(new THREE.SphereGeometry(.5-k*.04,32,24),body,px,.62,pz,g);[-1,1].forEach(side=>{mesh(taperTube([new THREE.Vector3(px+side*.35,.5,pz),new THREE.Vector3(px+side*.6,.45,pz),new THREE.Vector3(px+side*.72,.05,pz)],.05,.03,10,6),dark,0,0,0,g)})}break}
  default:{mesh(new THREE.SphereGeometry(.85,40,30),body,0,1.45,0,g);mesh(new THREE.SphereGeometry(.6,28,20),belly,0,1.3,.35,g).scale.set(1,.9,.7);
    [[.5,1.9,.4],[-.6,1.3,.5],[.7,1.1,.2],[0,2.25,.1],[-.3,.85,.6],[.55,1.55,-.5],[-.5,1.9,-.4]].forEach(([x,y,z])=>{const t=mesh(new THREE.ConeGeometry(.09,.38,10),vinyl(0x6b3f22),x,y,z,g);t.lookAt(x*3,y*2-1.4,z*3);t.rotateX(Math.PI/2)});
    [-1,1].forEach(s=>{const e=mesh(new THREE.ConeGeometry(.26,.62,20),body,s*.45,2.35,0,g);e.rotation.z=-s*.25;e.scale.z=.6});
    const wingShape=new THREE.Shape();wingShape.moveTo(0,0);wingShape.lineTo(1.6,.9);wingShape.quadraticCurveTo(1.35,.5,1.4,.2);wingShape.quadraticCurveTo(1.6,.1,1.9,-.1);wingShape.quadraticCurveTo(1.5,-.2,1.3,-.4);wingShape.quadraticCurveTo(1.35,-.65,1.4,-.9);wingShape.quadraticCurveTo(.9,-.6,.6,-.5);wingShape.lineTo(0,-.3);
    anim.wings=[];[-1,1].forEach(s=>{const wg=new THREE.Group();wg.position.set(s*.6,1.6,-.2);g.add(wg);const w=mesh(new THREE.ExtrudeGeometry(wingShape,{depth:.04,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:2}),vinyl(0x3f7d3a,{side:THREE.DoubleSide}),0,0,0,wg);if(s<0)w.scale.x=-1;anim.wings.push(wg)});
    [-.28,.28].forEach(x=>mesh(new THREE.SphereGeometry(.16,20,14),glowMat(0xff4455,2.4),x,1.6,.72,g,true));
    [-.12,.12].forEach(x=>{const f=mesh(new THREE.ConeGeometry(.05,.2,10),white,x,1.12,.78,g);f.rotation.x=Math.PI});
    [-.3,.3].forEach(x=>mesh(new THREE.CapsuleGeometry(.14,.2,6,10),body,x,.4,0,g))}
  }
  airbrush(g);
  // the display base (glossy black lacquer, a coloured rim and a brass bezel)
  const R=new THREE.Group();const base=new THREE.Group();R.add(base);g.position.y=.14;R.add(g);
  mesh(lathe([[0,0],[1.18,0],[1.24,.03],[1.26,.08],[1.22,.13],[1.14,.155],[0,.155]],64),new THREE.MeshPhysicalMaterial({color:0x17111e,roughness:.25,clearcoat:1,clearcoatRoughness:.1}),0,0,0,base);
  mesh(new THREE.TorusGeometry(1.255,.022,8,80),new THREE.MeshStandardMaterial({color:C,emissive:C,emissiveIntensity:.9,roughness:.3}),0,.08,0,base,true).rotation.x=Math.PI/2;
  mesh(lathe([[1.16,.15],[1.13,.163],[1.1,.15]],64),new THREE.MeshStandardMaterial({color:0xd9a441,metalness:1,roughness:.3}),0,0,0,base,true);
  const shadow=mesh(new THREE.PlaneGeometry(3.4,3.4),new THREE.MeshBasicMaterial({map:V3.tex.blob,transparent:true,depthWrite:false,opacity:.75}),0,.012,0,R,true);shadow.rotation.x=-Math.PI/2;shadow.renderOrder=1;
  const mats=[];g.traverse(o=>{if(o.isMesh&&o.material&&(o.material.isMeshPhysicalMaterial||o.material.isMeshStandardMaterial)&&!mats.includes(o.material)){o.material=o.material.clone();mats.push(o.material);o.material.userData.c0=o.material.color.clone();o.material.userData.e0=o.material.emissive.clone()}});
  R.traverse(o=>{if(o.material&&o.material.isMeshStandardMaterial)o.material.userData.hero=true});if(V3.r)applyEnv(R);R.scale.setScalar(MS);R.userData.s=MS;return {g:R,fig:g,anim,mats,phase:Math.random()*6}}
// airbrushed shading baked into vertex colours: darker toward the feet and in the undersides, like a painted vinyl toy
function airbrush(g){g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert();const v=new THREE.Vector3(),n=new THREE.Vector3(),nm=new THREE.Matrix3();
  g.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const m=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld);nm.getNormalMatrix(m);const P=o.geometry.attributes.position,N=o.geometry.attributes.normal;const c=new Float32Array(P.count*3);
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(m);n.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();const y=Math.max(0,Math.min(1,v.y/2.2));const k=(.58+.42*(y*y*(3-2*y)))*(.84+.16*(n.y*.5+.5))*(1+.06*Math.max(0,n.z));c[i*3]=c[i*3+1]=c[i*3+2]=Math.min(1.08,k)}
    o.geometry.setAttribute('color',new THREE.BufferAttribute(c,3))})}
function lavaTex(){if(V3.tex.lava)return V3.tex.lava;V3.tex.lava=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#000';x.fillRect(0,0,w,h);x.strokeStyle='#ffb040';x.lineCap='round';x.shadowColor='#ff5010';x.shadowBlur=6;
  for(let i=0;i<16;i++){let px=Math.random()*w,py=Math.random()*h;x.lineWidth=1.5+Math.random()*2.5;x.beginPath();x.moveTo(px,py);for(let k=0;k<5;k++){px+=(Math.random()-.5)*50;py+=(Math.random()-.5)*50;x.lineTo(px,py)}x.stroke()}},[1,1]);return V3.tex.lava}
// ---- positions ----
function seatPos(k,n){const span=n<=2?.5:n<=3?.8:n<=4?1.0:1.2;const a=Math.PI*(n<=1?.5:(.5-span/2+span*k/(n-1)));return new THREE.Vector3(-Math.cos(a)*10.8,.25,.2+Math.sin(a)*7.4)}
function targetOf(p,k){if(G.city===p.i)return new THREE.Vector3(0,1.1,0);if(G.bay===p.i)return new THREE.Vector3(12.5,.7,-6.5);return seatPos(k,G.pl.length)}
// ---- sync with the game state ----
function sync3D(){if(!V3.on)return;if(PH)PH.wake();
  const tags=document.getElementById('tags');
  if(!G){V3.mons.forEach(o=>V3.scene.remove(o.g));V3.mons=[];tags.innerHTML='';clearDice();return}
  if(V3.gid!==G.gid||V3.mons.length!==G.pl.length){V3.mons.forEach(o=>V3.scene.remove(o.g));V3.gid=G.gid;V3.fxSeen={};
    V3.mons=G.pl.map((p,k)=>{const o=buildMonster(p.m);const t=targetOf(p,k);o.g.position.copy(t);o.pos=t.clone();o.to=t.clone();V3.scene.add(o.g);o.state={hp:p.hp,alive:p.alive,loc:locKey(p)};return o});
    tags.innerHTML=G.pl.map((p,k)=>`<div class="tag" data-seat="${k}"></div>`).join('');V3.rollId=-1;clearDice()}
  G.pl.forEach((p,k)=>{const o=V3.mons[k];const lk=locKey(p);
    if(lk!==o.state.loc){o.from=o.g.position.clone();o.to=targetOf(p,k);o.hop=0;o.state.loc=lk}
    if(!p.alive&&o.state.alive){o.ko=0;o.state.alive=false}
    if(p.alive&&!o.state.alive){o.state.alive=true;o.ko=undefined;o.fig.rotation.z=0;o.fig.position.y=.14;o.mats.forEach(m=>m.color.copy(m.userData.c0))}});
  // floating fx
  for(const k in UI.fx){const list=UI.fx[k];const seen=V3.fxSeen[k]||0;for(let j=seen;j<list.length;j++)fx3D(+k,list[j]);V3.fxSeen[k]=list.length}
  for(const k in V3.fxSeen)if(!UI.fx[k])V3.fxSeen[k]=0;
  // dice
  if(G.rollId!==V3.rollId||V3.dice.length!==G.dice.length){rollDice3D(V3.dice.length!==G.dice.length);V3.rollId=G.rollId}
  V3.dice.forEach((d,k)=>{const gd=G.dice[k];if(!gd)return;if(d.shown!==(gd.t||'n')+gd.f+(gd.k?'k':'')&&d.t>=1){setDieFace(d,gd)}});
  // tags
  [...tags.children].forEach((el,k)=>{const p=G.pl[k];el.className=`tag ${k===G.active&&!G.winner?'on':''} ${p.alive?'':'ko'} ${inTokyo(p.i)?'city':''}`;
    el.style.setProperty('--mc',MONS[p.m].c);
    el.innerHTML=`<b>${inTokyo(p.i)?'👑 ':''}${esc(mname(p))}${(G.mode==='solo'&&p.human)||(NET.on&&k===NET.mySeat)?' <i>you</i>':''}${NET.on&&pname(p)?' <i>'+esc(pname(p))+'</i>':''}</b>${p.alive?`<span><em class="h">♥${p.hp}</em><em class="v">★${p.vp}</em><em class="e">⚡${p.en}</em>${mbOn()?`<em class="m">🧠${p.mb}</em>`:''}${exIcons(p)?`<em>${exIcons(p)}</em>`:''}</span>`:'<span>K.O.</span>'}`});
  V3.tower.visible=exOn('tower');if(exOn('tower'))G.tower.forEach((o,l)=>{const m=V3.tsegs[l].material;m.color.set(o>=0?MONS[P(o).m].c:'#d8442e');m.emissive.set(o>=0?0x331100:0x000000)});
  V3.csign.visible=exOn('curse');if(exOn('curse')&&V3.curseShown!==G.curse){V3.curseShown=G.curse;V3.csign.material.map=signTex(CURSES[G.curse].n.toUpperCase(),'#b57bff','#ffffff');V3.csign.material.needsUpdate=true}
  G.pl.forEach((p,k)=>{const o=V3.mons[k];o.berserk=!!(p.tok&&p.tok.berserk&&p.alive);const n=p.alive?(p.cult||0):0;o.cults=o.cults||[];
    while(o.cults.length<n){const c=mesh(new THREE.IcosahedronGeometry(.26,2),glowMat(0xc08bff,2.6),0,0,0,V3.scene,true);o.cults.push(c)}
    while(o.cults.length>n)V3.scene.remove(o.cults.pop())});
  const hud=document.getElementById('hud');const a=cur();
  hud.innerHTML=G.winner?`<b>🏆 ${esc(G.winText)}</b>`:`<b>ROUND ${G.turn}</b> · ${esc(mname(a))} ${['','is rolling','resolves','enters the city','is shopping','ends its turn'][G.step]||''}${G.phase==='roll'?` · ${G.rolls} reroll${G.rolls===1?'':'s'} left`:''}`;
  V3.hsign.visible=G.bayOn;if(V3.harbor.userData.open!==G.bayOn){V3.harbor.userData.open=G.bayOn;V3.hsign.material.map=G.bayOn?signTex('HARBOR','#43c8ff','#e9fbff'):signTex('CLOSED','#8aa6b5','#ffffff')}
  V3.water.material.color.set(G.bayOn?0x1d6f8a:0x4a5a66);
  if(G.winner&&!V3.won){V3.won=true;const w=G.winner==='draw'?null:+G.winner.slice(1)-1;if(w!==null){for(let i=0;i<40;i++)spawn(i%3?'star':'spark',V3.mons[w].g.position.clone().add(new THREE.Vector3(0,3,0)),1,1.8)}}
  if(!G.winner)V3.won=false}
function locKey(p){return !p.alive?'ko':G.city===p.i?'city':G.bay===p.i?'bay':'out'}
function fx3D(k,e){const o=V3.mons[k];if(!o)return;const at=o.g.position.clone().add(new THREE.Vector3(0,4.4,0));
  popLabel(at,e.t,e.c);
  if(e.c==='hurt'){o.flash=1;o.shakeT=.5;V3.shake=Math.min(1,V3.shake+.35);spawn('fire',at.clone().add(new THREE.Vector3(0,-1,0)),6,1.3);spawn('puff',at.clone().add(new THREE.Vector3(0,-1.2,0)),3,.8)}
  else if(e.c==='heal')spawn('heart',at,6,.9);else if(e.c==='star'){spawn(/mindbug/i.test(e.t)?'brain':'star',at,8,1);spawn('spark',at,4,1.2)}else if(e.c==='energy')spawn('bolt',at,6,.9)}
function popLabel(v,text,c){const st=document.getElementById('stage');const p=v.clone().project(V3.cam);const el=document.createElement('div');el.className='pop '+c;el.textContent=text;
  el.style.left=((p.x+1)/2*100)+'%';el.style.top=((1-p.y)/2*100)+'%';el.style.setProperty('--dx',(Math.random()*40-20)+'px');st.appendChild(el);setTimeout(()=>el.remove(),1600)}
function spawn(kind,at,n,speed){for(let i=0;i<n;i++){const s=sprite(V3.icons[kind],at.x,at.y,at.z,.6,.6);if(kind==='spark'||kind==='fire')s.material.color.setScalar(2);else if(kind!=='puff')s.material.color.setScalar(1.25);const a=Math.random()*Math.PI*2;
  V3.parts.push({s,v:new THREE.Vector3(Math.cos(a)*speed*(.5+Math.random()),2+Math.random()*3*speed,Math.sin(a)*speed*(.5+Math.random())),life:1+Math.random()*.5,max:1.4,grow:kind==='puff'||kind==='fire',spin:(Math.random()-.5)*4})}}
// ---- dice ----
function clearDice(){V3.dice.forEach(d=>{V3.tray.remove(d.m);if(d.blob)V3.tray.remove(d.blob)});V3.dice=[]}
function upQuat(f,tp){const q=new THREE.Quaternion();const E=new THREE.Euler();
  switch(DIEFACES[tp||'n'].indexOf(f)){case 0:E.set(0,0,Math.PI/2);break;case 1:E.set(0,0,-Math.PI/2);break;case 2:E.set(0,0,0);break;case 3:E.set(Math.PI,0,0);break;case 4:E.set(-Math.PI/2,0,0);break;default:E.set(Math.PI/2,0,0)}
  q.setFromEuler(E);return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),.62).multiply(q)}
function rollDice3D(rebuild){const n=G.dice.length;if(rebuild){clearDice();if(!V3.dieGeo)V3.dieGeo=roundedBox(1.05,1.05,1.05,4,.17);
    for(let k=0;k<n;k++){const m=new THREE.Mesh(V3.dieGeo,Array.from({length:6},()=>V3.faceMats.n1));m.castShadow=true;m.receiveShadow=true;V3.tray.add(m);
      const blob=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.9),new THREE.MeshBasicMaterial({map:V3.tex.blob,transparent:true,depthWrite:false,opacity:.6}));blob.rotation.x=-Math.PI/2;blob.renderOrder=1;V3.tray.add(blob);V3.dice.push({m,blob,t:1,k:k})}}
  V3.dice.forEach((d,k)=>{const gd=G.dice[k];const home=new THREE.Vector3(((k%(n>6?4:6))-((n>6?4:Math.min(n,6))-1)/2)*1.45,.52,Math.floor(k/(n>6?4:6))*1.35-(n>6?.6:0));d.home=home;
    const spin=!gd.k||rebuild;d.final=upQuat(gd.f,gd.t);
    const src=V3.mons[G.active]?V3.mons[G.active].g.position.clone().sub(V3.tray.position):new THREE.Vector3(0,0,-6);
    if(spin){d.t=0;d.start=new THREE.Vector3(src.x+(Math.random()-.5)*1.5,src.y+3+Math.random()*1.5,src.z+(Math.random()-.5)*1.5);d.axis=new THREE.Vector3(Math.random(),Math.random(),Math.random()).normalize();d.spins=6+Math.random()*6;d.dur=.7+Math.random()*.35}
    else{d.t=1;d.m.position.copy(home)}
    setDieFace(d,gd,!spin)})}
function setDieFace(d,gd,now){const tp=gd.t||'n';const mats=DIEFACES[tp].map(f=>V3.faceMats[tp+f+(gd.k?'k':'')]);d.m.material=mats;d.shown=tp+gd.f+(gd.k?'k':'');
  if(now||d.t>=1){d.final=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),d.yaw||0).multiply(upQuat(gd.f,gd.t))}}
function ray(ev){const r=ev.target.getBoundingClientRect();const v=new THREE.Vector2((ev.clientX-r.left)/r.width*2-1,-(ev.clientY-r.top)/r.height*2+1);const rc=new THREE.Raycaster();rc.setFromCamera(v,V3.cam);return rc}
function onClick3D(ev){const _p=!!(window.PHONE&&PHONE.on);if(!G||UI.choice||(G.phase!=='roll'&&!_p))return;const myTurn=humanTurn();const rc=ray(ev);
  const hit=myTurn&&!_p&&G.phase==='roll'&&rc.intersectObjects(V3.dice.map(d=>d.m),false)[0];if(hit){const k=V3.dice.findIndex(d=>d.m===hit.object);if(k>=0){V3.dice[k].pulse=1;uiAct({die:String(k)})}return}
  const mh=rc.intersectObjects(V3.mons.map(o=>o.g),true)[0];if(mh){const k=V3.mons.findIndex(o=>{let x=mh.object;while(x){if(x===o.g)return true;x=x.parent}return false});if(k>=0){seatInfo(k);return}}
  if(_p&&window.phNearMon){const k=phNearMon(ev);if(k>=0)seatInfo(k)}}
function onMove3D(ev){if(V3.moveBusy)return;V3.moveBusy=true;requestAnimationFrame(()=>{V3.moveBusy=false;let k=-1;
  if(G&&G.phase==='roll'&&!UI.choice&&humanTurn()&&V3.dice.length){const h=ray(ev).intersectObjects(V3.dice.map(d=>d.m),false)[0];if(h)k=V3.dice.findIndex(d=>d.m===h.object)}
  V3.hover=k;ev.target.style.cursor=k>=0?'pointer':''})}
// ---- post-processing (High): HDR scene in an MSAA target, soft-knee bright pass, three-level blur, bloom + vignette + grade ----
const PQV='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
function makePost(){const P={};const hf={type:THREE.HalfFloatType,depthBuffer:false};
  P.rt=new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,samples:4});P.lv=[0,1,2].map(()=>({a:new THREE.WebGLRenderTarget(4,4,hf),b:new THREE.WebGLRenderTarget(4,4,hf)}));
  P.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);P.scene=new THREE.Scene();P.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));P.quad.frustumCulled=false;P.scene.add(P.quad);
  P.bright=new THREE.ShaderMaterial({uniforms:{t:{value:null},px:{value:new THREE.Vector2()},th:{value:1.0}},vertexShader:PQV,depthTest:false,depthWrite:false,toneMapped:false,
    fragmentShader:'uniform sampler2D t;uniform vec2 px;uniform float th;varying vec2 vUv;void main(){vec3 c=(texture2D(t,vUv+px*vec2(-.5,-.5)).rgb+texture2D(t,vUv+px*vec2(.5,-.5)).rgb+texture2D(t,vUv+px*vec2(-.5,.5)).rgb+texture2D(t,vUv+px*vec2(.5,.5)).rgb)*.25;float l=max(c.r,max(c.g,c.b));float k=smoothstep(th,th*1.8,l);gl_FragColor=vec4(min(c*k,vec3(12.)),1.);}'});
  P.blur=new THREE.ShaderMaterial({uniforms:{t:{value:null},dir:{value:new THREE.Vector2()}},vertexShader:PQV,depthTest:false,depthWrite:false,toneMapped:false,
    fragmentShader:'uniform sampler2D t;uniform vec2 dir;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb*.227;c+=(texture2D(t,vUv+dir*1.385).rgb+texture2D(t,vUv-dir*1.385).rgb)*.316;c+=(texture2D(t,vUv+dir*3.231).rgb+texture2D(t,vUv-dir*3.231).rgb)*.07;gl_FragColor=vec4(c,1.);}'});
  P.comp=new THREE.ShaderMaterial({uniforms:{tS:{value:null},b0:{value:null},b1:{value:null},b2:{value:null},str:{value:.6},vig:{value:.34},time:{value:0}},vertexShader:PQV,depthTest:false,depthWrite:false,
    fragmentShader:`uniform sampler2D tS,b0,b1,b2;uniform float str,vig,time;varying vec2 vUv;
      void main(){vec3 c=texture2D(tS,vUv).rgb;vec3 b=texture2D(b0,vUv).rgb*.6+texture2D(b1,vUv).rgb*.8+texture2D(b2,vUv).rgb*1.1;c+=b*str;
        float l=dot(c,vec3(.2126,.7152,.0722));c=mix(c,c*vec3(1.03,.98,1.06),.5);c=mix(vec3(l),c,1.06);
        vec2 q=vUv-.5;float v=1.-vig*smoothstep(.25,.85,length(q*vec2(1.1,1.)));c*=v;
        gl_FragColor=vec4(c,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        gl_FragColor.rgb+=(fract(sin(dot(gl_FragCoord.xy+time,vec2(12.9898,78.233)))*43758.5453)-.5)/255.;}`});
  V3.P=P;sizePost()}
function sizePost(){const P=V3.P;if(!P)return;const r=V3.r;const s=r.getDrawingBufferSize(new THREE.Vector2());const w=Math.max(4,s.x|0),h=Math.max(4,s.y|0);if(P.w===w&&P.h===h)return;P.w=w;P.h=h;P.rt.setSize(w,h);
  P.lv.forEach((L,i)=>{const d=2<<i;L.a.setSize(Math.max(2,w/d|0),Math.max(2,h/d|0));L.b.setSize(Math.max(2,w/d|0),Math.max(2,h/d|0))})}
function disposePost(){const P=V3.P;if(!P)return;P.rt.dispose();P.lv.forEach(L=>{L.a.dispose();L.b.dispose()});[P.bright,P.blur,P.comp].forEach(m=>m.dispose());V3.P=null}
function pass(mat,target){const P=V3.P;P.quad.material=mat;V3.r.setRenderTarget(target);V3.r.render(P.scene,P.cam)}
function renderFrame(cam){const r=V3.r;r.info.autoReset=false;r.info.reset();/* PerfHUD reads draws and triangles for the whole frame */if(!V3.post){r.setRenderTarget(null);r.render(V3.scene,cam);return}
  if(!V3.P)makePost();sizePost();const P=V3.P;
  r.setRenderTarget(P.rt);r.render(V3.scene,cam);
  let src=P.rt.texture,sw=P.w,sh=P.h;
  P.lv.forEach((L,i)=>{const w=L.a.width,h=L.a.height;
    if(i===0){P.bright.uniforms.t.value=src;P.bright.uniforms.px.value.set(1/sw,1/sh);pass(P.bright,L.a);src=L.a.texture}
    P.blur.uniforms.t.value=src;P.blur.uniforms.dir.value.set(1/w,0);pass(P.blur,L.b);P.blur.uniforms.t.value=L.b.texture;P.blur.uniforms.dir.value.set(0,1/h);pass(P.blur,L.a);src=L.a.texture});
  const u=P.comp.uniforms;u.tS.value=P.rt.texture;u.b0.value=P.lv[0].a.texture;u.b1.value=P.lv[1].a.texture;u.b2.value=P.lv[2].a.texture;u.time.value=(V3.t*60)%100;pass(P.comp,null)}
// ---- animation loop ----
const _up=new THREE.Vector3(0,1,0),_v=new THREE.Vector3(),_red=new THREE.Color(1,.1,.05),_ko=new THREE.Color(0x8a8190);
function loop3D(){(PH?PH.raf:requestAnimationFrame)(loop3D);V3.frames=(V3.frames||0)+1;const raw=V3.clock.getDelta();const dt=Math.min(.12,raw);V3.t+=dt;const t=V3.t;
  // the frame-time watch and step-down now live in PerfHUD (p95 over 2 s); PerfHUD.raf also throttles this loop to 10 fps when idle.
  // V3.busy: something the player should see move smoothly (hops, K.O. falls, hits, dice, particles, camera glides, the speed test)
  let busy=!!(PH&&PH.testing)||V3.parts.length>0||V3.shake>.001;
  if(V3.dome)V3.dome.material.uniforms.t.value=t;
  if(V3.wn){V3.wn.offset.set(t*.02,t*.013)}
  if(!G){V3.busy=busy;animWorld(dt,t);renderFrame(V3.cam);return}
  // monsters
  V3.mons.forEach((o,k)=>{const p=G.pl[k];if(!p)return;const g=o.g;const act=k===G.active&&!G.winner;
    if(o.hop!==undefined||o.land>0||o.shakeT>0||o.flash>0||(o.ko!==undefined&&o.ko<1))busy=true;
    if(o.hop!==undefined){o.hop=Math.min(1,o.hop+dt/.85);const e=o.hop;const ee=e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2;g.position.lerpVectors(o.from,o.to,ee);g.position.y+=Math.sin(Math.PI*e)*4.2;o.land=0;
      if(e>=1){o.hop=undefined;o.land=1;V3.shake=Math.min(1,V3.shake+.25);spawn('puff',g.position.clone().add(new THREE.Vector3(0,.3,0)),7,1.2)}}
    let sq=0;if(o.land>0){o.land=Math.max(0,o.land-dt*3.2);sq=Math.sin(o.land*Math.PI)*.12}
    const b=Math.sin(t*2.2+o.phase),S=MS;const bob=(act?Math.abs(Math.sin(t*6))*.05:0);g.scale.set(S*(1+sq*.6),S,S*(1+sq*.6));o.fig.scale.set(1-b*.02+sq*.3,1+b*.035+bob-sq,1-b*.02+sq*.3);
    if(o.ko!==undefined){o.ko=Math.min(1,o.ko+dt*1.5);const e=1-Math.pow(1-o.ko,3);o.fig.rotation.z=e*Math.PI/2*.92;o.fig.position.y=.14+e*.45;g.position.y=Math.max(.2,g.position.y);o.mats.forEach(m=>m.color.lerp(_ko,.05))}
    else{const tgt=V3.cam.position;const want=Math.atan2(tgt.x-g.position.x,tgt.z-g.position.z)*.8;g.rotation.y+=(want-g.rotation.y)*.1}
    if(o.shakeT>0){o.shakeT-=dt;g.position.x+=Math.sin(t*60)*.03}
    if(o.flash>0){o.flash-=dt*2;const f=Math.max(0,o.flash);o.mats.forEach(m=>m.emissive.copy(m.userData.e0).lerp(_red,f))}
    else if(o.berserk){const r=.25+Math.sin(t*8)*.2;o.mats.forEach(m=>m.emissive.setRGB(r,0,0));o.wasB=1}else if(o.wasB||o.flash!==undefined){o.wasB=0;o.flash=undefined;o.mats.forEach(m=>m.emissive.copy(m.userData.e0))}
    if(o.cults)o.cults.forEach((c,j)=>{const a=t*1.6+j*Math.PI*2/o.cults.length;c.position.set(g.position.x+Math.cos(a)*2.6,g.position.y+2.4+Math.sin(t*3+j)*.3,g.position.z+Math.sin(a)*2.6);c.rotation.y=t*2});
    const A=o.anim;if(A.tent)A.tent.forEach((x,j)=>{x.rotation.x=Math.sin(t*3+j)*.08;x.rotation.z=Math.cos(t*2.5+j)*.08});
    if(A.wings)A.wings.forEach((w,j)=>{w.rotation.y=(j?-1:1)*Math.sin(t*(act?9:4))*.5});if(A.claws)A.claws.forEach((c,j)=>c.rotation.z=Math.sin(t*3+j*2)*.25);
    if(A.bulb)A.bulb.material.color.setHSL(.14,1,.5+Math.sin(t*6)*.2).multiplyScalar(2.2);if(A.bolt){A.bolt.rotation.y=Math.sin(t*2)*.4;A.bolt.material.emissiveIntensity=1.1+Math.sin(t*7)*.5}if(A.lid)A.lid.rotation.x=-.25-Math.abs(Math.sin(t*1.5))*.15});
  const a=V3.mons[G.active];if(a&&!G.winner){V3.activeRing.visible=V3.activeGlow.visible=true;V3.activeRing.position.set(a.g.position.x,Math.max(.3,a.g.position.y)+.06,a.g.position.z);V3.activeRing.scale.setScalar(1+Math.sin(t*4)*.06);V3.activeGlow.position.copy(V3.activeRing.position).setY(V3.activeRing.position.y-.03)}else V3.activeRing.visible=V3.activeGlow.visible=false;
  const co=G.city>=0?V3.mons[G.city]:null;V3.crown.visible=!!co;if(co){V3.crown.position.set(co.g.position.x,co.g.position.y+5.8+Math.sin(t*2)*.12,co.g.position.z);V3.crown.rotation.y=t}
  // dice
  V3.dice.forEach((d,k)=>{if(!d.home)return;const gd=G.dice[k];
    if(d.t<1||d.pulse>0)busy=true;
    if(d.t<1){d.t=Math.min(1,d.t+dt/d.dur);const e=d.t;const bounce=Math.abs(Math.sin(e*Math.PI*2.5))*(1-e)*1.6;
      d.m.position.lerpVectors(d.start,d.home,1-Math.pow(1-e,3));d.m.position.y=d.home.y+(1-e)*(d.start.y-d.home.y)*(1-e)+bounce;
      const sp=new THREE.Quaternion().setFromAxisAngle(d.axis,d.spins*(1-e)*(1-e));d.m.quaternion.copy(d.final).multiply(sp);if(d.t>=1){snd('clack');d.m.quaternion.copy(d.final);if(gd)setDieFace(d,gd);spawn('puff',d.m.position.clone().add(V3.tray.position).setY(.5),2,.25)}}
    else{const hov=V3.hover===k;const up=gd&&gd.k?.35+Math.sin(t*4)*.05:hov?.14:0;if(!(gd&&gd.k)&&Math.abs(up-(d.lift||0))>.004)busy=true;d.lift=(d.lift||0)+(up-(d.lift||0))*Math.min(1,dt*12);d.m.position.set(d.home.x,d.home.y+d.lift,d.home.z);d.m.quaternion.slerp(d.final,.2)}
    if(d.pulse>0)d.pulse=Math.max(0,d.pulse-dt*3);const s=1+(d.pulse||0)*.12+(V3.hover===k?.04:0);d.m.scale.setScalar(s);
    if(d.blob){d.blob.position.set(d.m.position.x,.02,d.m.position.z);const hgt=Math.max(0,d.m.position.y-.52);d.blob.material.opacity=.6/(1+hgt*1.2);d.blob.scale.setScalar(1+hgt*.25)}});
  // particles
  for(let i=V3.parts.length-1;i>=0;i--){const q=V3.parts[i];q.life-=dt;q.v.y-=6*dt;q.s.position.addScaledVector(q.v,dt);const f=Math.max(0,q.life/q.max);q.s.material.opacity=Math.min(1,f*1.5);q.s.material.rotation+=q.spin*dt;if(q.grow)q.s.scale.setScalar(.45+(1-f)*1.1);
    if(q.life<=0){V3.scene.remove(q.s);q.s.material.dispose();V3.parts.splice(i,1)}}
  animWorld(dt,t);
  // camera: eased towards the framed position, gentle sway, shake on hits, a slow push-in on the winner
  const cam=V3.cam;const sway=Math.sin(t*.25)*1.2;V3.shake=Math.max(0,V3.shake-dt*1.8);
  const wi=G.winner&&G.winner!=='draw'?V3.mons[+G.winner.slice(1)-1]:null;V3.zoom=Math.max(0,Math.min(1,(V3.zoom||0)+(wi?dt*.6:-dt*2)));
  const base=V3.look.clone().addScaledVector(V3.camOff||CAMOFF,V3.camK||1);if(V3.orbA){base.sub(V3.look).applyAxisAngle(_up,V3.orbA).add(V3.look)}base.x+=sway;const look=V3.look.clone();
  if(wi&&V3.zoom>0){const wp=wi.g.position;const e=V3.zoom*V3.zoom*(3-2*V3.zoom);base.lerp(new THREE.Vector3(wp.x*.6,wp.y+8,wp.z+13),e);look.lerp(new THREE.Vector3(wp.x,wp.y+3,wp.z),e)}
  if(V3.debugCam){base.copy(V3.debugCam.pos);look.copy(V3.debugCam.look)}
  if(!V3.camP||V3.debugCam){V3.camP=base.clone();V3.camL=look.clone()}else{const k=1-Math.exp(-dt*5);if(V3.camP.distanceToSquared(base)>.02||V3.camL.distanceToSquared(look)>.02||(wi&&V3.zoom<1))busy=true;V3.camP.lerp(base,k);V3.camL.lerp(look,k)}V3.busy=busy;
  cam.position.set(V3.camP.x+(Math.random()-.5)*V3.shake*.5,V3.camP.y+(Math.random()-.5)*V3.shake*.5,V3.camP.z);cam.lookAt(V3.camL);
  renderFrame(cam);
  // name tags follow monsters
  const tags=document.getElementById('tags');if(tags)[...tags.children].forEach((el,k)=>{const o=V3.mons[k];if(!o)return;const v=o.g.position.clone().add(new THREE.Vector3(0,o.ko!==undefined?2:5.7,0)).project(cam);
    const cw=V3.r.domElement.clientWidth,ch=V3.r.domElement.clientHeight,hw=(el.offsetWidth||80)/2+4,th=(el.offsetHeight||30)+4;const px=Math.min(cw-hw,Math.max(hw,(v.x+1)/2*cw)),py=Math.min(ch-4,Math.max(th,(1-v.y)/2*ch));el.style.transform=`translate(-50%,-100%) translate(${px.toFixed(1)}px,${py.toFixed(1)}px)`})}
function animWorld(dt,t){
  V3.ring.material.color.setHSL(.12,1,.55+Math.sin(t*3)*.08).multiplyScalar(2.2);
  if(V3.blinkMats){const a=Math.sin(t*3)>0;V3.blinkMats[0].color.setRGB(a?3:.25,a?.3:.02,a?.45:.04);V3.blinkMats[1].color.setRGB(a?.25:3,a?.02:.3,a?.04:.45)}
  if(V3.mqBulbs){V3.mqBulbs.material.color.setRGB(2.6+Math.sin(t*9)*.5,2.2+Math.sin(t*9)*.4,1.2)}
  if(V3.neonMat){const f=Math.sin(t*23)>.97?.55:1;V3.neonMat.color.setScalar(1.6*f)}
  if(V3.buoys)V3.buoys.forEach((b,k)=>{b.position.y=.2+Math.sin(t*1.6+k*2)*.05;b.rotation.z=Math.sin(t*1.3+k)*.12;b.userData.l.visible=Math.sin(t*2.5+k*3)>0});
  if(V3.tug){V3.tug.position.y=.22+Math.sin(t*1.2)*.04;V3.tug.rotation.z=Math.sin(t*1.1)*.05}
  V3.clouds.forEach((c,k)=>{c.position.x+=dt*(.4+k*.05);if(c.position.x>90)c.position.x=-90})}
// ---- 3D portraits of the vinyl figures for the monster picker (the SVG art stays as the fallback) ----
const MONPIC={};
function monPic(k){return MONPIC[k]?`<img class="mp3" src="${MONPIC[k]}" alt="" draggable="false">`:`<svg viewBox="-66 -70 132 136">${monArt(k)}</svg>`}
function makePortraits(){if(!V3.on||V3.portraitsDone)return;V3.portraitsDone=true;const S=192;const r=V3.r;let rt;
  try{rt=new THREE.WebGLRenderTarget(S,S,{type:THREE.FloatType,samples:r.capabilities.isWebGL2?4:0})}catch(e){return}
  const ps=new THREE.Scene();ps.add(new THREE.HemisphereLight(0x9a90ff,0x2a1430,.9));const key=new THREE.DirectionalLight(0xffc9a0,2.6);key.position.set(-4,6,6);ps.add(key);
  const rim=new THREE.DirectionalLight(0xff4fa8,2.2);rim.position.set(5,3,-5);ps.add(rim);const rim2=new THREE.DirectionalLight(0x46d4ff,1.4);rim2.position.set(-6,2,-4);ps.add(rim2);
  const cam=new THREE.PerspectiveCamera(30,1,.1,50);cam.position.set(0,2.4,6.7);cam.lookAt(0,1.4,0);
  const buf=new Float32Array(S*S*4);const ex=r.toneMappingExposure/.6;
  const aces=(R,G,B)=>{R*=ex;G*=ex;B*=ex;let r1=.59719*R+.35458*G+.04823*B,g1=.076*R+.90834*G+.01566*B,b1=.0284*R+.13383*G+.83777*B;const f=v=>(v*(v+.0245786)-.000090537)/(v*(.983729*v+.432951)+.238081);r1=f(r1);g1=f(g1);b1=f(b1);
    const o=[1.60475*r1-.53108*g1-.07367*b1,-.10208*r1+1.10813*g1-.00605*b1,-.00327*r1-.07276*g1+1.07602*b1];return o.map(v=>{v=Math.max(0,Math.min(1,v));return 255*(v<=.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-.055)})};
  const list=MONS.map((_,k)=>k);const one=()=>{const k=list.shift();if(k===undefined){rt.dispose();if(UI&&UI.info&&typeof renderModal==='function')try{renderModal()}catch(e){}return}
    try{const o=buildMonster(k);o.g.scale.setScalar(1);o.g.rotation.y=-.35;o.g.traverse(x=>{if(x.material)[].concat(x.material).forEach(m=>{if(m.isMeshStandardMaterial){m.envMap=V3.env;m.needsUpdate=true}})});ps.add(o.g);
      const cc=r.getClearColor(new THREE.Color()),ca=r.getClearAlpha();const sh=r.shadowMap.enabled;r.shadowMap.enabled=false;r.setClearColor(0,0);r.setRenderTarget(rt);r.clear();r.render(ps,cam);r.readRenderTargetPixels(rt,0,0,S,S,buf);r.setRenderTarget(null);r.setClearColor(cc,ca);r.shadowMap.enabled=sh;ps.remove(o.g);
      const c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');const img=x.createImageData(S,S);
      for(let j=0;j<S;j++)for(let i=0;i<S;i++){const s=((S-1-j)*S+i)*4,d=(j*S+i)*4;const a=Math.max(0,Math.min(1,buf[s+3]));if(a<=0)continue;const [R,G,B]=aces(buf[s]/a,buf[s+1]/a,buf[s+2]/a);img.data[d]=R;img.data[d+1]=G;img.data[d+2]=B;img.data[d+3]=a*255}
      x.putImageData(img,0,0);MONPIC[k]=c.toDataURL('image/png');o.g.traverse(x=>{if(x.geometry)x.geometry.dispose()})}catch(e){console.warn('portrait',k,e)}
    setTimeout(one,30)};
  one()}
