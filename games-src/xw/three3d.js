// ---------- 3D battlefield (Three.js r158). 1 unit = 10 mm. The scene only mirrors G; it never owns game state. ----------
// Look: a cinematic space battle. A baked volumetric-looking nebula dome, parallax gas and three star shells, a distant ice giant,
// a holographic play mat, detailed miniature starfighters on printed bases, cratered PBR asteroids.
// PBR throughout (ACES, PMREM environment, soft shadows); bloom + vignette + grade on High. Falls back to the SVG map without WebGL.
const V3={on:false,ships:{},rocks:[],ghosts:[],fxq:[],shake:0,t:0,cam:{yaw:0,pitch:.98,dist:122,tx:45.7,tz:51},drag:null,labels:{},view:'tilt',fitDist:122,
  q:'high',anim:{},later:[],hitAt:{},frames:0,debugCam:null};
const S3=v=>v/10;// mm -> units
// ---- graphics quality (High / Medium / Low), stored in localStorage; Auto: Medium on phones and small screens, High on desktop, Low on software GPUs ----
const GFXKEY='na_gfx';
function gfxPref(){try{return localStorage.getItem(GFXKEY)||'auto'}catch(e){return 'auto'}}
function gfxAuto(){if(V3.soft)return 'low';const w=Math.min(window.innerWidth||1366,(window.screen&&screen.width)||9999);return (w<820||/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent||''))?'medium':'high'}
const GFX_ICON='<svg class="ico" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="3" width="16" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 17h6M10 14v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M5 11l3-3 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function gfxLabel(){const b=document.getElementById('gfxbtn');if(!b)return;const p=gfxPref();const cur=V3.on?V3.q:(p==='auto'?gfxAuto():p);const cap=s=>s[0].toUpperCase()+s.slice(1);
  b.innerHTML=`${GFX_ICON}<span>${p==='auto'?'Auto · '+cap(cur):cap(p)}${V3.on&&p!=='auto'&&cur!==p?' → '+cap(cur):''}</span>`;b.title='Graphics quality (tap to change): High = bloom and soft shadows, Low = fastest';b.setAttribute('aria-label','Graphics quality: '+(p==='auto'?'auto, '+cur:p))}
function cycleGfx(){const order=['auto','high','medium','low'];const n=order[(order.indexOf(gfxPref())+1)%order.length];try{localStorage.setItem(GFXKEY,n)}catch(e){}
  if(V3.on){V3.pinned=n!=='auto';setQuality(n==='auto'?gfxAuto():n)}gfxLabel()}
const PH=typeof PerfHUD!=='undefined'?PerfHUD:null;
// ---- PerfHUD hooks: the shared speed overlay, speed test, auto step-down and idle saver (perfhud.js) ----
function perfHooks(){if(!PH)return;
  PH.register({game:'Nebula Aces',renderer:V3.r,levels:['high','medium','low'],names:{high:'High',medium:'Medium',low:'Low'},anchor:'#stage',corner:'tl',
    getLevel:()=>V3.q,isAuto:()=>!V3.pinned&&gfxPref()==='auto',autoTop:()=>gfxAuto(),
    // auto, test and restore changes are not saved; Apply on the result card is a choice by hand (saved, then never auto-changed)
    setLevel:(l,w)=>{if(w==='apply'){try{localStorage.setItem(GFXKEY,l)}catch(e){}V3.pinned=true}setQuality(l)},
    basePR:()=>{const d=window.devicePixelRatio||1;return V3.q==='high'?Math.min(2,d):V3.q==='medium'?Math.min(1.5,d):1},
    onPixelRatio:v=>{V3.r.setPixelRatio(v);V3.w=0;resize3D()},
    orbit:t=>{if(t==null){if(V3.orb0!=null){V3.cam.yaw=V3.orb0;V3.orb0=null;V3.ez=null}return}if(V3.orb0==null)V3.orb0=V3.cam.yaw;V3.ez=null;V3.cam.yaw=V3.orb0+Math.sin(t*Math.PI*2)*.6},
    isAnimating:()=>V3.busy,
    beforeTest:()=>{if(typeof toggleMenu==='function')toggleMenu(false)}})}
function urlGfx(){try{const m=/[?&]gfx=(high|medium|low)/.exec(location.search||'');return m?m[1]:null}catch(e){return null}}
function init3D(){const cv=document.getElementById('c3');if(!cv||typeof THREE==='undefined'||!window.WebGLRenderingContext||/jsdom/i.test(navigator.userAgent||''))return false;
  let r;try{r=V3.r=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});if(!r.getContext())return false}catch(e){return false}
  try{const gl=r.getContext();const ext=gl.getExtension('WEBGL_debug_renderer_info');const name=String(ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER));V3.gpu=name;V3.soft=/swiftshader|llvmpipe|software|softpipe/i.test(name)}catch(e){}
  r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.useLegacyLights=false;
  r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;V3.aniso=Math.min(8,r.capabilities.getMaxAnisotropy()||1);r.setClearColor(0x020108,1);
  const sc=V3.scene=new THREE.Scene();V3.camera=new THREE.PerspectiveCamera(42,1.6,.5,9000);
  // lights: a warm white "star" key with soft shadows, a cool hemisphere fill, magenta and cyan rims (nebula spill) that separate the ships from the mat
  V3.hemi=new THREE.HemisphereLight(0x9fb4ff,0x1a1420,.9);sc.add(V3.hemi);
  const key=V3.key=new THREE.DirectionalLight(0xfff0dc,3.6);key.position.set(-10,95,75);key.target.position.set(45.7,0,45.7);sc.add(key);sc.add(key.target);
  key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-58,right:58,top:58,bottom:-58,near:40,far:200});key.shadow.bias=-.0004;key.shadow.normalBias=.04;key.shadow.radius=4;
  const rim=new THREE.DirectionalLight(0xff6f9a,.8);rim.position.set(130,30,-60);sc.add(rim);rim.target.position.set(45.7,0,45.7);sc.add(rim.target);
  const rim2=new THREE.DirectionalLight(0x4fb8ff,1.3);rim2.position.set(-60,25,-80);sc.add(rim2);rim2.target.position.set(45.7,0,45.7);sc.add(rim2.target);
  V3.flashL=new THREE.PointLight(0xffb070,0,60,2);V3.flashL.position.set(45,5,45);sc.add(V3.flashL);// explosion flash (always present so no shader recompiles)
  try{makeEnv()}catch(e){console.warn('env map off',e)}
  buildSky();sc.add(V3.mat=playMat());
  V3.root=new THREE.Group();sc.add(V3.root);V3.fxRoot=new THREE.Group();sc.add(V3.fxRoot);V3.guide=new THREE.Group();sc.add(V3.guide);
  bindCamera(cv);window.addEventListener('resize',resize3D);if(typeof GX!=='undefined'&&GX.onResize)GX.onResize(()=>resize3D());
  const u=urlGfx();V3.pinned=!!u||gfxPref()!=='auto';const p=gfxPref();setQuality(u||(p==='auto'?gfxAuto():p));
  resize3D();V3.on=true;document.body.classList.add('three');V3.clock=performance.now();gfxLabel();
  setTimeout(()=>{try{makePortraits()}catch(e){console.warn('portraits off',e)}},300);
  /* shader warm-up only where there is no GPU (it stalls start-up for seconds on iPhone); real GPUs compile on first use */if(V3.soft)try{warm3D()}catch(e){console.warn('warm off',e)}
  perfHooks();(PH?PH.raf:requestAnimationFrame)(loop3D);return true}
// ---- quality levels ----
function setQuality(q){if(!['high','medium','low'].includes(q))q='high';const r=V3.r;V3.q=q;const dpr=window.devicePixelRatio||1;
  {let want=q==='high'?Math.min(2,dpr):q==='medium'?Math.min(1.5,dpr):1;/* software rendering (no GPU): fewer pixels keeps taps responsive */if(V3.soft)want=Math.min(want,.5);r.setPixelRatio(PH?PH.pixelRatio(want):want)}
  const sh=q!=='low',ms=q==='high'?2048:1024,st=q==='high'?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;
  if(r.shadowMap.enabled!==sh||V3.key.shadow.mapSize.x!==ms||r.shadowMap.type!==st){r.shadowMap.enabled=sh;r.shadowMap.type=st;V3.key.castShadow=sh;V3.key.shadow.mapSize.set(ms,ms);if(V3.key.shadow.map){V3.key.shadow.map.dispose();V3.key.shadow.map=null}
    V3.scene.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)})}
  V3.post=q==='high'&&r.capabilities.isWebGL2;if(!V3.post&&V3.P)disposePost();
  if(V3.gas)V3.gas.children.forEach((s,i)=>s.visible=q==='high'||(q==='medium'&&i%2===0));const lo=q==='low';V3.scene.environment=lo?null:V3.env||null;V3.scene.children.forEach(o=>{if(o.isPoints)o.geometry.setDrawRange(0,lo?Math.ceil(o.userData.n/3):o.userData.n)});if(V3.plate){V3.plate.material.transparent=!lo;V3.plate.material.opacity=lo?1:.86;V3.plate.material.needsUpdate=true}V3.hemi.intensity=lo?1.5:.9;if(V3.atm)V3.atm.visible=!lo;if(V3.moon)V3.moon.visible=!lo;V3.rocks.forEach(r=>{if(r.userData.pebbles)r.userData.pebbles.visible=!lo});if(V3.starsNear)V3.starsNear.visible=q!=='low';
  if(PH)PH.hitch();V3.w=0;if(r.domElement.parentElement)resize3D();gfxLabel()}
// the frame-rate watchdog and stepDown() now live in PerfHUD (p95 over 2 s, see perfhud.js)
// ---- small procedural helpers ----
function rng(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const HASH=(()=>{const p=new Uint8Array(512);const R=rng(1337);const a=[...Array(256).keys()];for(let i=255;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}for(let i=0;i<512;i++)p[i]=a[i&255];return p})();
function vnoise3(x,y,z){const X=Math.floor(x),Y=Math.floor(y),Z=Math.floor(z);const fx=x-X,fy=y-Y,fz=z-Z;const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz);
  const h=(i,j,k)=>HASH[(HASH[(HASH[(X+i)&255]+Y+j)&255]+Z+k)&255]/255;
  const l=(a,b,t)=>a+(b-a)*t;return l(l(l(h(0,0,0),h(1,0,0),u),l(h(0,1,0),h(1,1,0),u),v),l(l(h(0,0,1),h(1,0,1),u),l(h(0,1,1),h(1,1,1),u),v),w)}
function fbm3(x,y,z,o){let a=.5,s=0,f=1;for(let i=0;i<(o||4);i++){s+=a*vnoise3(x*f,y*f,z*f);f*=2.03;a*=.5}return s}
// tileable 2D value noise on a period
function tnoise(x,y,P){const X=Math.floor(x),Y=Math.floor(y),fx=x-X,fy=y-Y,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);const h=(i,j)=>HASH[(HASH[((X+i)%P+P)%P]+((Y+j)%P+P)%P)&255]/255;return (h(0,0)*(1-u)+h(1,0)*u)*(1-v)+(h(0,1)*(1-u)+h(1,1)*u)*v}
function tfbm(x,y,P,o){let a=.5,s=0,f=1;for(let i=0;i<(o||4);i++){s+=a*tnoise(x*f,y*f,P*f);f*=2;a*=.5}return s}
function canvasTex(w,h,draw,lin){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new THREE.CanvasTexture(c);if(!lin)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=V3.aniso||4;return t}
// height field (Float32Array) -> tangent-space normal map canvas texture
function normalFromHeight(H,S,str){return canvasTex(S,S,(x)=>{const img=x.createImageData(S,S);for(let j=0;j<S;j++)for(let i=0;i<S;i++){const hl=H[j*S+(i-1+S)%S],hr=H[j*S+(i+1)%S],hu=H[((j-1+S)%S)*S+i],hd=H[((j+1)%S)*S+i];
    let nx=(hl-hr)*str,ny=(hd-hu)*str,nz=1;const L=Math.hypot(nx,ny,nz);const k=(j*S+i)*4;img.data[k]=(nx/L*.5+.5)*255;img.data[k+1]=(ny/L*.5+.5)*255;img.data[k+2]=(nz/L*.5+.5)*255;img.data[k+3]=255}x.putImageData(img,0,0)},true)}
function grayTex(A,S,lin){return canvasTex(S,S,(x)=>{const img=x.createImageData(S,S);for(let i=0;i<S*S;i++){const v=Math.max(0,Math.min(255,A[i]*255));img.data[i*4]=img.data[i*4+1]=img.data[i*4+2]=v;img.data[i*4+3]=255}x.putImageData(img,0,0)},lin)}
function glowTex(){if(V3.gt)return V3.gt;V3.gt=canvasTex(128,128,(x,w,h)=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.18,'rgba(255,255,255,.6)');g.addColorStop(.45,'rgba(255,255,255,.14)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});return V3.gt}
function glow(color,size,op){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color,transparent:true,opacity:op==null?1:op,blending:THREE.AdditiveBlending,depthWrite:false}));s.scale.set(size,size,1);return s}
// a 4-point lens flare star for bolts, muzzle flashes and sparks
function flareTex(){if(V3.ft)return V3.ft;V3.ft=canvasTex(128,128,(x,w,h)=>{x.translate(64,64);const g=x.createRadialGradient(0,0,0,0,0,40);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,40,0,7);x.fill();
  for(const a of [0,Math.PI/2]){x.save();x.rotate(a);const s=x.createLinearGradient(-64,0,64,0);s.addColorStop(0,'rgba(255,255,255,0)');s.addColorStop(.5,'rgba(255,255,255,.9)');s.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=s;x.fillRect(-64,-1.5,128,3);x.restore()}});return V3.ft}
// soft puffy fire / smoke atlas texture
function puffTex(){if(V3.pt)return V3.pt;const S=128;V3.pt=canvasTex(S,S,(x)=>{const img=x.createImageData(S,S);for(let j=0;j<S;j++)for(let i=0;i<S;i++){const dx=i/S-.5,dy=j/S-.5,r=Math.hypot(dx,dy)*2;const n=fbm3(i/18,j/18,3.3,4);const a=Math.max(0,1-r*(1.05-.5*n))*Math.min(1,(1-r)*3);const k=(j*S+i)*4;const v=180+75*n;img.data[k]=img.data[k+1]=img.data[k+2]=v;img.data[k+3]=Math.max(0,Math.min(255,a*a*255))}x.putImageData(img,0,0)});return V3.pt}
// ---- image-based lighting: a small "space studio" (nebula-tinted gradient, a warm key softbox, magenta and cyan panels) through PMREM ----
function makeEnv(){const r=V3.r;const es=new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.SphereGeometry(50,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec3 vP;void main(){float y=vP.y;vec3 top=vec3(.06,.07,.2),hor=vec3(.35,.14,.34),gnd=vec3(.03,.02,.06);vec3 c=y>0.?mix(hor,top,smoothstep(0.,.7,y)):mix(hor,gnd,smoothstep(0.,-.4,y));c+=vec3(.9,.3,.5)*pow(max(0.,dot(vP,normalize(vec3(1.,.1,-.5)))),6.)*.8;c+=vec3(.2,.5,1.)*pow(max(0.,dot(vP,normalize(vec3(-.7,.2,-.8)))),6.)*.7;gl_FragColor=vec4(c,1.);}'})));
  const panel=(col,i,w,h,pos)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(i),side:THREE.DoubleSide}));m.position.copy(pos);m.lookAt(0,0,0);es.add(m)};
  panel(0xfff0dc,9,22,14,new THREE.Vector3(-8,30,24));panel(0xff4f9a,3.5,10,26,new THREE.Vector3(30,8,-18));panel(0x40b8ff,3,10,22,new THREE.Vector3(-26,6,-20));panel(0xffffff,1.6,40,5,new THREE.Vector3(0,36,-4));
  const pm=new THREE.PMREMGenerator(r);V3.env=pm.fromScene(es,.03).texture;pm.dispose();es.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()});V3.scene.environment=V3.env}
// ---- GLSL noise shared by the baked backdrop textures ----
const GLN=`float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<6;i++){s+=a*n3(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
vec3 eq(vec2 uv){float th=uv.x*6.2831853,ph=(uv.y-.5)*3.1415927;return vec3(cos(ph)*cos(th),sin(ph),cos(ph)*sin(th));}
vec3 sph(vec2 uv){float p=uv.x*6.2831853,t=(1.-uv.y)*3.1415927;return vec3(-cos(p)*sin(t),cos(t),sin(p)*sin(t));}`;
const PQV='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
// render a full-screen shader once into a texture (the nebula and planet are baked at start-up, so the sky costs one texture fetch per pixel)
function bake(frag,w,h,uni){const r=V3.r;const rt=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,depthBuffer:false,generateMipmaps:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,wrapS:THREE.RepeatWrapping});
  const s=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);const m=new THREE.ShaderMaterial({uniforms:uni||{},vertexShader:PQV,fragmentShader:GLN+frag,depthTest:false,depthWrite:false});
  const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),m);q.frustumCulled=false;s.add(q);const tm=r.toneMapping;r.setRenderTarget(rt);r.render(s,cam);r.setRenderTarget(null);q.geometry.dispose();m.dispose();return rt.texture}
// ---- backdrop: nebula dome, gas layers with parallax, three star shells, a distant ice giant with its atmosphere, and a small moon ----
function buildSky(){const sc=V3.scene,C=new THREE.Vector3(45.7,0,45.7);
  const neb=bake(`varying vec2 vUv;void main(){vec3 d=sph(vUv);vec3 p=d*2.3;
    vec3 q=vec3(fbm(p),fbm(p+vec3(5.2,1.3,2.8)),fbm(p+vec3(1.7,9.2,4.1)));float n=fbm(p+q*2.6);float n2=fbm(p*2.2+q*3.3+vec3(3.));
    float band=exp(-pow(dot(d,normalize(vec3(.35,1.,.25)))*1.9,2.));float m=smoothstep(.38,.9,n)*(.25+.95*band);
    float hue=fbm(p*.8+vec3(8.,2.,5.));vec3 gas=mix(vec3(.10,.26,1.),vec3(1.,.16,.48),smoothstep(.36,.62,hue));gas=mix(gas,vec3(1.,.5,.18),smoothstep(.6,.78,hue)*.75);
    vec3 c=vec3(.004,.003,.012)+vec3(.02,.01,.05)*band;c+=gas*m*m*1.9;c+=gas*pow(n2,4.)*band*1.6;
    float dust=smoothstep(.46,.78,fbm(p*3.1+q*4.));c*=1.-.8*dust*band;c+=vec3(1.,.82,.7)*pow(max(0.,n-.62),3.)*9.*band;
    gl_FragColor=vec4(c,1.);}`,2048,1024);
  // the bake uses the sphere's own UV layout, so the dome is a plain textured sphere (one texture fetch per pixel, no per-pixel trig)
  const dome=V3.dome=new THREE.Mesh(new THREE.SphereGeometry(4200,64,32),new THREE.MeshBasicMaterial({map:neb,side:THREE.BackSide,depthWrite:false,fog:false}));
  dome.position.copy(C);dome.renderOrder=-10;sc.add(dome);
  // star shells: far (dense, small), mid, and near (below the mat, they parallax as the camera orbits)
  const stars=(n,rMin,rMax,sz,seed,below)=>{const R=rng(seed),p=new Float32Array(n*3),c=new Float32Array(n*3),s=new Float32Array(n),ph=new Float32Array(n);
    for(let i=0;i<n;i++){let x,y,z;do{x=R()*2-1;y=R()*2-1;z=R()*2-1}while(x*x+y*y+z*z>1||x*x+y*y+z*z<.01);const L=Math.hypot(x,y,z),rr=rMin+(rMax-rMin)*R();if(below)y=-Math.abs(y)-.15;
      p[i*3]=C.x+x/L*rr;p[i*3+1]=y/L*rr;p[i*3+2]=C.z+z/L*rr;const t=R();const col=t<.15?[1,.72,.5]:t<.35?[.7,.82,1]:t<.4?[1,.55,.6]:[1,.96,.9];const b=.35+.65*Math.pow(R(),3);c.set(col.map(v=>v*b*1.6),i*3);s[i]=sz*(.6+Math.pow(R(),6)*2.8);ph[i]=R()*6.28}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));g.setAttribute('size',new THREE.BufferAttribute(s,1));g.setAttribute('ph',new THREE.BufferAttribute(ph,1));
    const m=new THREE.ShaderMaterial({uniforms:{t:{value:0},px:{value:1}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      vertexShader:'attribute float size;attribute float ph;attribute vec3 color;uniform float t,px;varying vec3 vC;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;float tw=.78+.22*sin(t*(.7+fract(ph*7.)*2.)+ph*13.);vC=color*tw;gl_PointSize=size*px;}',
      fragmentShader:'varying vec3 vC;void main(){vec2 q=gl_PointCoord-.5;float r=length(q)*2.;float a=exp(-r*r*7.)+.35*exp(-r*r*1.6)*step(1.2,vC.r+vC.g);a*=1.-smoothstep(.85,1.,r);float sp=max(0.,1.-abs(q.x)*14.)*max(0.,1.-abs(q.y)*2.)+max(0.,1.-abs(q.y)*14.)*max(0.,1.-abs(q.x)*2.);a+=sp*.5*step(1.4,vC.r+vC.g);gl_FragColor=vec4(vC*a,1.);\n#include <colorspace_fragment>\n}'});
    const P=new THREE.Points(g,m);P.frustumCulled=false;P.renderOrder=-9;P.userData.n=n;sc.add(P);(V3.starMats=V3.starMats||[]).push(m);return P};
  stars(5200,3300,3900,2.2,11);stars(900,1400,2400,3.2,23);V3.starsNear=stars(700,220,900,2.6,37,true);
  // gas layers: large soft sprites below and around the mat, tinted like the nebula; they drift and parallax for depth
  const gasTex=[0,1,2].map(k=>{const S=192;return canvasTex(S,S,(x)=>{const img=x.createImageData(S,S);for(let j=0;j<S;j++)for(let i=0;i<S;i++){const dx=i/S-.5,dy=j/S-.5,r=Math.hypot(dx,dy)*2;const n=fbm3(i/30+k*7,j/30,k*3.1,5);const w=fbm3(i/12+k,j/12,9+k,3);
      const a=Math.max(0,1-r)*Math.max(0,n*1.6-.45)*(.6+.8*w);const q=(j*S+i)*4;img.data[q]=img.data[q+1]=img.data[q+2]=255;img.data[q+3]=Math.min(255,a*a*420)}x.putImageData(img,0,0)})});
  V3.gas=new THREE.Group();const R=rng(91);const cols=[0xff4f9a,0x4f7dff,0xff9a4f,0x9a5fff,0x3fd0ff];
  for(let i=0;i<16;i++){const a=R()*6.283,d=120+R()*520;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:gasTex[i%3],color:cols[i%cols.length],transparent:true,opacity:.1+R()*.14,blending:THREE.AdditiveBlending,depthWrite:false,rotation:R()*6.28}));
    s.position.set(C.x+Math.cos(a)*d,-60-R()*380,C.z+Math.sin(a)*d);const sz=260+R()*520;s.scale.set(sz,sz*.7,1);s.userData.spin=(R()-.5)*.01;s.renderOrder=-8;V3.gas.add(s)}sc.add(V3.gas);
  // the ice giant: banded clouds and a storm, lit by the key light; a fresnel atmosphere shell glows on its lit limb
  const pl=bake(`varying vec2 vUv;void main(){vec3 d=eq(vUv);float lat=(vUv.y-.5)*3.1415927;float w=fbm(d*3.)*1.3;
    float b=sin(lat*13.+w*3.2)*.5+.5,b2=sin(lat*41.+w*7.)*.5+.5;vec3 c=mix(vec3(.04,.13,.26),vec3(.28,.62,.78),b);c=mix(c,vec3(.78,.9,1.),b2*.22+pow(fbm(d*9.),3.)*.35);
    vec2 sp=vec2((vUv.x-.62)*3.,(vUv.y-.42)*6.);float st=smoothstep(.5,0.,length(sp));float sw=fbm(vec3(sp*4.,1.)+st*2.);c=mix(c,vec3(.9,.95,1.),st*sw*.7);
    gl_FragColor=vec4(c*.9,1.);}`,1024,512);
  const planet=V3.planet=new THREE.Mesh(new THREE.SphereGeometry(760,96,64),new THREE.MeshStandardMaterial({map:pl,roughness:.85,metalness:0,envMapIntensity:0}));
  planet.position.set(-900,-980,-1500);planet.rotation.set(.35,.4,.25);planet.renderOrder=-7;sc.add(planet);
  const atm=new THREE.Mesh(new THREE.SphereGeometry(800,96,64),new THREE.ShaderMaterial({uniforms:{L:{value:V3.key.position.clone().sub(V3.key.target.position).normalize()},col:{value:new THREE.Color(.35,.75,1.)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.FrontSide,
    vertexShader:'varying vec3 vN,vV;void main(){vec4 w=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform vec3 L,col;varying vec3 vN,vV;void main(){float f=1.-max(0.,dot(vN,vV));float lit=smoothstep(-.35,.6,dot(vN,L));float a=pow(f,2.6)*lit*1.8+pow(f,6.)*.25;gl_FragColor=vec4(col*a,1.);\n#include <colorspace_fragment>\n}'}));
  V3.atm=atm;atm.position.copy(planet.position);atm.renderOrder=-6;sc.add(atm);
  const mt=bake(`varying vec2 vUv;void main(){vec3 d=eq(vUv);float n=fbm(d*4.);float cr=0.;for(int i=0;i<3;i++){float k=float(i);float c=fbm(d*(6.+k*5.)+vec3(k*3.));cr+=smoothstep(.62,.66,c)-smoothstep(.66,.72,c)*.6;}gl_FragColor=vec4(vec3(.42,.4,.43)*(.55+.6*n)+cr*.08,1.);}`,512,256);
  const moon=V3.moon=new THREE.Mesh(new THREE.SphereGeometry(60,48,32),new THREE.MeshStandardMaterial({map:mt,roughness:.95,metalness:0,envMapIntensity:0}));moon.position.set(1250,-420,-1500);moon.renderOrder=-7;sc.add(moon)}
// ---- the play mat: a dark glass plate with a holographic range grid, deployment bands, ruler ticks, a glowing frame and corner emitters ----
function playMat(){const g=new THREE.Group();const M=91.4;
  const plate=new THREE.Mesh(new THREE.BoxGeometry(M+1.2,.6,M+1.2),new THREE.MeshStandardMaterial({color:0x04050c,roughness:.55,metalness:0,transparent:true,opacity:.86,envMapIntensity:.12}));
  plate.position.set(M/2,-.32,M/2);V3.plate=plate;plate.receiveShadow=true;g.add(plate);
  const grid=V3.gridMat=new THREE.ShaderMaterial({uniforms:{t:{value:0},c0:{value:new THREE.Color(0xff8a3a)},c1:{value:new THREE.Color(0xff3050)},cg:{value:new THREE.Color(0x5fb8ff)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform float t;uniform vec3 c0,c1,cg;varying vec2 vP;
      float line(float v,float w){float d=abs(fract(v)-.5);float fw=fwidth(v);return smoothstep(.5-w-fw,.5-w+fw*.2,d);}
      void main(){vec2 p=vP;float M=91.4;vec2 q=p/M;
        float major=max(line(p.x/10.+.5,.006),line(p.y/10.+.5,.006));float minor=max(line(p.x/2.5+.5,.008),line(p.y/2.5+.5,.008));
        vec2 dd=abs(fract(p/2.5)-.5);float dots=1.-smoothstep(.015,.04,length(dd-.5));
        float edge=min(min(p.x,M-p.x),min(p.y,M-p.y));float border=exp(-edge*1.6)*.7+exp(-edge*.25)*.04;
        float sweep=exp(-pow((q.y-fract(t*.035))*40.,2.))*.35;
        float tick=0.;if(edge<1.4){float along=(p.x<1.4||p.x>M-1.4)?p.y:p.x;tick=line(along/2.5+.5,.03)*(1.-smoothstep(.2,1.4,edge));}
        float vig=1.-.5*smoothstep(.3,.72,length(q-.5));
        vec3 c=cg*(major*.13+minor*.028+dots*.018+sweep*(major*.6+.05)+tick*.45)*vig+cg*border*.8;
        float z0=smoothstep(10.2,9.6,p.y),z1=smoothstep(10.2,9.6,M-p.y);
        c+=c0*(z0*.07+smoothstep(.5,0.,abs(p.y-10.))*.55);
        c+=c1*(z1*.07+smoothstep(.5,0.,abs(M-p.y-10.))*.55);
        gl_FragColor=vec4(c,1.);\n#include <colorspace_fragment>\n}`});
  grid.extensions={derivatives:true};
  const gp=new THREE.Mesh(new THREE.PlaneGeometry(M,M),grid);gp.rotation.x=-Math.PI/2;gp.position.set(0,.015,0);
  // PlaneGeometry is centred: shift its positions so vP runs 0..M along x and 0..M from the far edge (board y = MAT - z)
  gp.geometry.translate(M/2,M/2,0);gp.position.set(0,.015,M);g.add(gp);
  // glowing frame bars and corner emitters
  const fm=new THREE.MeshStandardMaterial({color:0x10131f,roughness:.3,metalness:.9,emissive:0x2f7fd0,emissiveIntensity:.9});
  const cm=new THREE.MeshStandardMaterial({color:0x2a2418,roughness:.25,metalness:1,emissive:0xffb35a,emissiveIntensity:.6});
  for(const [x,z,w,d] of [[M/2,-.6,M+1.2,.35],[M/2,M+.6,M+1.2,.35],[-.6,M/2,.35,M+1.2],[M+.6,M/2,.35,M+1.2]]){const b=new THREE.Mesh(new THREE.BoxGeometry(w,.35,d),fm);b.position.set(x,.05,z);g.add(b)}
  for(const [x,z] of [[0,0],[M,0],[0,M],[M,M]]){const e=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.4,.9,6),cm);e.position.set(x+(x?.6:-.6),.2,z+(z?.6:-.6));g.add(e);const l=glow(0xffc070,5,.55);l.position.set(e.position.x,1.1,e.position.z);g.add(l)}
  return g}
function setMatColors(){if(!V3.gridMat||!G||!G.fac)return;const c=k=>new THREE.Color(FACCOL[FACTIONS[G.fac[k]].col].eng);V3.gridMat.uniforms.c0.value=c(0);V3.gridMat.uniforms.c1.value=c(1)}
// world position of a board point (mm): board y maps to -z so the board's "up" is away from the first player
const W=(x,y,hgt)=>new THREE.Vector3(S3(x),hgt||0,S3(MAT-y));
// ---- hull paint: panel lines, rivets, weathering; shared tileable colour / roughness / normal maps (tinted per material colour) ----
function hullMaps(){if(V3.hm)return V3.hm;const S=512,H=new Float32Array(S*S),A=new Float32Array(S*S),Rg=new Float32Array(S*S);const R=rng(77);
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const n=tfbm(i/32,j/32,16,4);H[j*S+i]=.5;A[j*S+i]=.86+(n-.5)*.14;Rg[j*S+i]=.46+(n-.5)*.2}
  // panels: recursive splits, each panel slightly raised or sunk, lighter or darker, glossier or rougher
  const rect=(x0,y0,x1,y1,d)=>{if(d<4&&(x1-x0>40||y1-y0>40)&&(d<2||R()<.8)){if((x1-x0)>(y1-y0)){const m=x0+(x1-x0)*(.3+R()*.4)|0;rect(x0,y0,m,y1,d+1);rect(m,y0,x1,y1,d+1)}else{const m=y0+(y1-y0)*(.3+R()*.4)|0;rect(x0,y0,x1,m,d+1);rect(x0,m,x1,y1,d+1)}return}
    const dh=(R()-.5)*.08,da=(R()-.5)*.1,dr=(R()-.5)*.18;for(let j=y0;j<y1;j++)for(let i=x0;i<x1;i++){const k=(j%S)*S+(i%S);H[k]+=dh;A[k]+=da;Rg[k]+=dr}
    for(let i=x0;i<x1;i++)for(const j of [y0,y0+1]){const k=(j%S)*S+(i%S);H[k]-=.35;A[k]*=.55;Rg[k]=.8}
    for(let j=y0;j<y1;j++)for(const i of [x0,x0+1]){const k=(j%S)*S+(i%S);H[k]-=.35;A[k]*=.55;Rg[k]=.8}
    if(R()<.45)for(let i=x0+6;i<x1-4;i+=9)for(const j of [y0+5,y1-5]){for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const k=((j+b+S)%S)*S+((i+a+S)%S);H[k]+=.18*(a||b?.5:1);A[k]*=.92}}
    if(R()<.04){for(let j=y0+4;j<y1-4;j++)for(let i=x0+4;i<x1-4;i++){if(((i+j)>>3)%2===0){const k=j*S+i;A[k]*=.8}}}};
  rect(0,0,S,S,0);
  // streaks and grime
  for(let s=0;s<260;s++){const x=R()*S|0,y=R()*S|0,L=10+R()*60|0,a=(R()-.4)*.08;for(let j=0;j<L;j++){const k=((y+j)%S)*S+x;A[k]+=a*(1-j/L);Rg[k]+=.1*(1-j/L)}}
  const col=canvasTex(S,S,(x)=>{const img=x.createImageData(S,S);for(let i=0;i<S*S;i++){const v=Math.max(0,Math.min(1,A[i]))*255;img.data[i*4]=v;img.data[i*4+1]=v;img.data[i*4+2]=v*1.01;img.data[i*4+3]=255}x.putImageData(img,0,0)});
  const rough=grayTex(Rg,S,true),nor=normalFromHeight(H,S,5);[col,rough,nor].forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping});V3.hm={col,rough,nor};return V3.hm}
// faction material sets (cached): painted hull, secondary panels, faction trim paint, gunmetal, glass canopy, engine glow
const FACCOL=[{hull:0xe6dccb,hull2:0x9c9486,trim:0xe8732a,eng:0xffa24f,glass:0x0b2a3a,base:'#f08a3a'},{hull:0x565e6e,hull2:0x2e3440,trim:0xc2203a,eng:0xff4f6a,glass:0x2a0608,base:'#e0304a'},{hull:0x8a7a52,hull2:0x4c4432,trim:0x3fc28a,eng:0x7dffb0,glass:0x08281a,base:'#39c27f'}];
function facMats(c){V3.fm=V3.fm||{};const k=c.hull+':'+c.trim;if(V3.fm[k])return V3.fm[k];const H=hullMaps();
  const paint=(color,o)=>new THREE.MeshStandardMaterial(Object.assign({color,map:H.col,roughnessMap:H.rough,normalMap:H.nor,normalScale:new THREE.Vector2(.6,.6),roughness:1,metalness:.25,envMapIntensity:1},o||{}));
  const M={hull:paint(c.hull),hull2:paint(c.hull2,{metalness:.45}),trim:paint(c.trim,{metalness:.15,roughness:.8}),
    metal:new THREE.MeshStandardMaterial({color:0x3a3d44,roughness:.32,metalness:.95,normalMap:H.nor,normalScale:new THREE.Vector2(.3,.3)}),
    dark:new THREE.MeshStandardMaterial({color:0x15171c,roughness:.55,metalness:.6}),
    glass:new THREE.MeshPhysicalMaterial({color:c.glass,roughness:.04,metalness:.2,clearcoat:1,clearcoatRoughness:.02,emissive:c.glass,emissiveIntensity:.35,envMapIntensity:2.2}),
    nozzle:new THREE.MeshStandardMaterial({color:0x2a2622,roughness:.35,metalness:1}),
    hot:new THREE.MeshBasicMaterial({color:new THREE.Color(c.eng).multiplyScalar(2.2)}),
    lamp:new THREE.MeshBasicMaterial({color:new THREE.Color(c.eng).multiplyScalar(2.5)}),
    white:new THREE.MeshBasicMaterial({color:new THREE.Color(1,1,1).multiplyScalar(2.2)})};
  M.hull.userData.hullMat=true;V3.fm[k]=M;return M}
// ---- geometry kit: parts grouped by material and merged into one mesh per material (few draw calls per ship) ----
function Kit(){this.g={};this.fx=[]}
Kit.prototype.add=function(key,geo,p,r,s){const m=new THREE.Matrix4().compose(new THREE.Vector3(...(p||[0,0,0])),new THREE.Quaternion().setFromEuler(new THREE.Euler(...(r||[0,0,0]))),new THREE.Vector3(...(s||[1,1,1])));
  const g=geo.index?geo.toNonIndexed():geo.clone();geo.dispose();for(const a of Object.keys(g.attributes))if(!['position','normal','uv'].includes(a))g.deleteAttribute(a);if(!g.attributes.normal)g.computeVertexNormals();g.applyMatrix4(m);(this.g[key]=this.g[key]||[]).push(g);return this};
// both sides: the part at +z and its mirror at -z (rotations about x and y flip)
Kit.prototype.pair=function(key,mk,p,r,s){for(const sd of [1,-1]){const rr=r||[0,0,0];this.add(key,mk(sd),[p[0],p[1],p[2]*sd],[rr[0]*sd,rr[1]*sd,rr[2]],s)}return this};
// box-projected UVs so the panel texture has the same density on every part
function boxUV(g,k){const P=g.attributes.position,N=g.attributes.normal,U=new Float32Array(P.count*2);for(let i=0;i<P.count;i++){const nx=Math.abs(N.getX(i)),ny=Math.abs(N.getY(i)),nz=Math.abs(N.getZ(i));const x=P.getX(i),y=P.getY(i),z=P.getZ(i);
    let u,v;if(ny>=nx&&ny>=nz){u=x;v=z}else if(nx>=nz){u=z;v=y}else{u=x;v=y}U[i*2]=u*k;U[i*2+1]=v*k}g.setAttribute('uv',new THREE.BufferAttribute(U,2))}
function mergeG(list,uvk){let n=0;list.forEach(g=>n+=g.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let o=0;
  for(const g of list){P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);if(g.attributes.uv)U.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count;g.dispose()}
  const m=new THREE.BufferGeometry();m.setAttribute('position',new THREE.BufferAttribute(P,3));m.setAttribute('normal',new THREE.BufferAttribute(N,3));m.setAttribute('uv',new THREE.BufferAttribute(U,2));if(uvk)boxUV(m,uvk);m.computeBoundingSphere();return m}
Kit.prototype.build=function(M,engCol){const grp=new THREE.Group();grp.userData.engCol=engCol;for(const k in this.g){const mesh=new THREE.Mesh(mergeG(this.g[k],['hull','hull2','trim','metal'].includes(k)?.5:0),M[k]);mesh.castShadow=true;mesh.receiveShadow=k!=='glass';grp.add(mesh)}
  grp.userData.eng=[];grp.userData.lamps=[];for(const f of this.fx){if(f.k==='eng')engineFx(grp,f);else if(f.k==='lamp'){const s=glow(f.c,f.s||.7,.9);s.position.set(...f.p);grp.add(s);grp.userData.lamps.push({s,ph:f.ph||0,blink:f.blink})}}return grp};
// part generators (unit-sized; the kit positions/rotates/scales them)
const PI=Math.PI;
function latheX(prof,seg,sy,sz){const g=new THREE.LatheGeometry(prof.map(([r,x])=>new THREE.Vector2(Math.max(r,.0001),x)),seg||16);g.rotateZ(-PI/2);if(sy||sz)g.scale(1,sy||1,sz||1);return g}
function plate(pts,th,bev){const sh=new THREE.Shape();pts.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));const b=bev==null?Math.min(.04,th*.4):bev;
  const g=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:b>0,bevelSize:b,bevelThickness:b,bevelSegments:2,curveSegments:4});g.rotateX(-PI/2);g.translate(0,-th/2,0);return g}
function box(w,h,d){return new THREE.BoxGeometry(w,h,d)}
function cyl(r0,r1,l,seg){const g=new THREE.CylinderGeometry(r1,r0,l,seg||12);g.rotateZ(-PI/2);return g}// along x, r0 at -x, r1 at +x
function nozzleG(r,l){return latheX([[r*.72,0],[r*.95,-l*.25],[r*1.05,-l*.7],[r*1.1,-l],[r*.92,-l*.98],[r*.8,-l*.5],[r*.55,-l*.12],[.001,-l*.1]],18)}
function canopyG(l,w,h){const g=new THREE.SphereGeometry(1,20,12,0,PI*2,0,PI/2);g.scale(l/2,h,w/2);return g}
function sphere(r,a,b){return new THREE.SphereGeometry(r,a||12,b||8)}
// an engine: bell nozzle (metal), hot core disc, glow sprite and an additive exhaust plume; the loop flickers them
function engine(K,p,r,dir){const x=p[0],y=p[1],z=p[2];K.add('nozzle',nozzleG(r,r*1.3),[x,y,z]);K.add('hot',new THREE.CircleGeometry(r*.78,16).rotateY(-PI/2),[x-r*.18,y,z]);K.fx.push({k:'eng',p:[x-r*.2,y,z],r})}
function plumeMat(col){V3.plm=V3.plm||{};if(V3.plm[col])return V3.plm[col];const m=new THREE.ShaderMaterial({uniforms:{col:{value:new THREE.Color(col)},k:{value:1}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform vec3 col;uniform float k;varying vec2 vUv;void main(){float w=1.-vUv.y;float a=pow(w,1.8);vec3 c=mix(col,vec3(1.),pow(w,6.)*.7)*a*1.5*k;gl_FragColor=vec4(c,1.);\n#include <colorspace_fragment>\n}'});V3.plm[col]=m;return m}
function engineFx(grp,f){const c=grp.userData.engCol||0xffa24f;const g=new THREE.Group();g.position.set(...f.p);
  const pl=new THREE.Mesh(new THREE.ConeGeometry(f.r*.8,f.r*4.2,16,1,true).rotateZ(PI/2).translate(-f.r*2.1,0,0),plumeMat(c));g.add(pl);
  const s=glow(c,f.r*3.4,.6);s.position.x=-f.r*.3;g.add(s);const s2=glow(0xffffff,f.r*1.3,.6);s2.position.x=-f.r*.1;g.add(s2);grp.add(g);grp.userData.eng.push({g,pl,s,s2,r:f.r,ph:Math.random()*6})}
// ---- original ship models (+x forward, y up). Every model: hull panels, greebles, glass canopy, bell nozzles with glow, faction trim ----
const DESIGN={
  // Compact "Lancer" heavy fighter: a pointed central lance, two gun booms on swept wing plates, forward canards, three engines
  lance(K){K.add('hull',latheX([[0,2.35],[.12,2.15],[.3,1.55],[.44,.8],[.5,-.2],[.46,-1.],[.38,-1.7],[.3,-1.95]],16,.78,.92));
    K.add('metal',latheX([[0,2.55],[.05,2.35],[.12,2.2]],10),[0,0,0]);
    K.add('glass',canopyG(1.25,.5,.3),[.75,.26,0]);K.add('metal',box(.08,.07,.54),[.55,.4,0]);K.add('metal',box(.08,.07,.5),[1.05,.36,0]);
    K.add('hull2',plate([[-1.6,-.14],[.2,-.12],[.3,0],[.2,.12],[-1.6,.14]],.14),[0,.43,0]);// dorsal spine
    for(let i=0;i<4;i++)K.add('metal',box(.16,.08,.1),[-1.4+i*.34,.52,(i%2?.07:-.07)]);K.add('metal',cyl(.015,.015,.9,6),[-1.2,.75,0],[0,0,.25]);
    K.pair('dark',()=>box(.9,.18,.12),[-.3,-.05,.44]);// side intakes
    K.pair('hull',sd=>plate([[-1.35,.34*sd],[.05,.34*sd],[-.45,1.32*sd],[-1.55,1.32*sd]],.09),[0,-.02,0]);// main wings
    K.pair('trim',sd=>plate([[-1.25,.95*sd],[-.25,.95*sd],[-.38,1.2*sd],[-1.38,1.2*sd]],.02,0),[0,.045,0]);// trim stripe
    K.pair('hull2',sd=>plate([[-1.1,.3*sd],[-.4,.3*sd],[-.8,.95*sd],[-1.3,.95*sd]],.06),[0,-.16,0],[.18,0,0]);// lower anhedral plates
    K.pair('trim',sd=>plate([[.95,.3*sd],[1.45,.3*sd],[1.15,.85*sd],[.85,.85*sd]],.05),[0,0,0]);// canards
    for(const sd of [1,-1]){const z=1.36*sd;K.add('hull',latheX([[.2,1.25],[.26,.9],[.28,-.8],[.26,-1.7],[.24,-1.95]],12),[0,0,z]);
      K.add('metal',cyl(.05,.045,1.4,8),[1.9,0,z]);K.add('metal',cyl(.08,.08,.18,10),[1.35,0,z]);K.add('metal',cyl(.065,.065,.12,8),[2.55,0,z]);
      for(let i=0;i<3;i++)K.add('hull2',box(.3,.1,.14),[-.5-i*.45,.25,z]);K.add('trim',cyl(.285,.285,.22,12),[.35,0,z]);
      K.add('hull2',plate([[-1.8,0],[-1.2,0],[-1.5,.5],[-1.9,.5]],.03),[0,.02,z],[PI/2,0,0]);engine(K,[-1.95,0,z],.22);K.fx.push({k:'lamp',p:[-.5,0,z+.3*Math.sign(z)],c:sd>0?0x6fff9a:0xff5050,s:.55,blink:1,ph:sd})}
    engine(K,[-1.95,0,0],.28);K.add('hull2',box(.5,.3,.3),[-1.3,-.35,0]);},
  // Armada "Talon" light fighter: a faceted arrowhead with raked blade fins, a crystal canopy and one hot engine
  shard(K){K.add('hull',plate([[2.3,0],[-1.2,1.15],[-.9,.35],[-1.1,0],[-.9,-.35],[-1.2,-1.15]],.34,.07));
    K.add('hull2',plate([[1.9,0],[-.9,.45],[-1.,0],[-.9,-.45]],.16,.04),[0,.24,0]);K.add('hull2',plate([[1.6,0],[-.9,.4],[-.9,-.4]],.14,.04),[0,-.22,0]);
    K.add('glass',new THREE.SphereGeometry(.34,6,4,0,PI*2,0,PI/2),[.85,.3,0],[0,PI/6,0],[1.7,.9,1]);K.add('lamp',sphere(.1,8,6),[.85,.34,0]);
    K.pair('trim',sd=>plate([[1.9,.05*sd],[-1.05,1.08*sd],[-1.2,1.15*sd],[1.7,.02*sd]],.05,0),[0,.2,0]);// red edge chevrons
    K.pair('hull2',sd=>plate([[-.1,0],[-1.25,0],[-1.6,.95*sd],[-.75,.95*sd]],.05),[-.2,.32,.55],[-.62,0,0]);// blade fins
    K.pair('trim',sd=>plate([[-.75,.9*sd],[-1.6,.9*sd],[-1.62,.98*sd],[-.72,.98*sd]],.06,0),[-.2,.32,.55],[-.62,0,0]);
    for(let i=0;i<5;i++)K.add('metal',box(.06,.05,.36),[.2-i*.14,.33,0]);
    K.pair('metal',()=>cyl(.035,.03,.9,6),[1.5,-.22,.22]);K.add('dark',box(.5,.12,.5),[-.4,-.28,0]);
    K.add('nozzle',cyl(.3,.34,.3,16),[-1.05,.02,0]);engine(K,[-1.2,.02,0],.3);engine(K,[-1.08,.02,.55],.12);engine(K,[-1.08,.02,-.55],.12);
    K.fx.push({k:'lamp',p:[-1.15,.05,1.1],c:0xff3040,s:.6,blink:1},{k:'lamp',p:[-1.15,.05,-1.1],c:0xff3040,s:.6,blink:1,ph:1.5})},
  // Compact "Anvil" bomber: a lancer frame with a heavy belly ordnance pod and armoured cheeks
  bomber(K){DESIGN.lance(K);K.add('hull2',latheX([[0,1.3],[.2,1.1],[.34,.6],[.36,-.9],[.28,-1.4],[.2,-1.5]],14),[-.1,-.5,0]);
    for(let i=0;i<4;i++)K.add('trim',box(.12,.1,.5),[.6-i*.4,-.72,0]);K.pair('hull',()=>box(1.3,.25,.1),[.1,.05,.52]);K.pair('metal',()=>cyl(.08,.08,.6,8),[.8,-.5,.3])},
  // Compact "Needle" interceptor: a slim hexagonal dart, swept wings, twin root engines
  needle(K){K.add('hull',latheX([[0,2.1],[.14,1.8],[.36,.9],[.44,-.3],[.4,-1.3],[.32,-1.55]],6,.8,1));K.add('glass',canopyG(1.,.38,.26),[.6,.28,0]);
    K.pair('hull',sd=>plate([[-.2,.3*sd],[-1.5,1.55*sd],[-1.85,1.55*sd],[-1.3,.3*sd]],.07),[0,0,0]);K.pair('trim',sd=>plate([[-1.35,1.25*sd],[-1.62,1.55*sd],[-1.85,1.55*sd],[-1.6,1.25*sd]],.02,0),[0,.045,0]);
    for(const sd of [1,-1]){K.add('hull2',latheX([[.16,.4],[.2,0],[.2,-1.1],[.18,-1.4]],10),[0,0,.52*sd]);engine(K,[-1.4,0,.52*sd],.17);K.add('metal',cyl(.03,.03,1.,6),[-1.2,0,1.6*sd]);K.fx.push({k:'lamp',p:[-1.8,0,1.62*sd],c:sd>0?0x6fff9a:0xff5050,s:.5,blink:1})}
    engine(K,[-1.55,0,0],.2);for(let i=0;i<3;i++)K.add('metal',box(.18,.06,.1),[-.4-i*.3,.38,0])},
  // Compact "Kestrel" courier: a flattened lifting body with swept tail wings and twin engines
  hawk(K){K.add('hull',latheX([[0,2.1],[.4,1.7],[.85,.9],[1.,-.2],[.9,-1.2],[.6,-1.9]],20,.42,1.05));K.add('glass',canopyG(1.,.6,.3),[1.,.3,0]);
    K.add('hull2',latheX([[0,1.],[.3,.6],[.36,-.8],[.3,-1.5]],12,.8,1),[-.2,.3,0]);
    K.pair('hull',sd=>plate([[-.8,.8*sd],[-1.6,2.2*sd],[-2.1,2.2*sd],[-1.9,.8*sd]],.1),[0,0,0]);K.pair('trim',sd=>plate([[-1.45,1.9*sd],[-1.62,2.2*sd],[-2.1,2.2*sd],[-2.,1.9*sd]],.02,0),[0,.06,0]);
    for(const sd of [1,-1]){K.add('hull2',cyl(.26,.24,1.,12),[-1.6,0,.62*sd]);engine(K,[-2.1,0,.62*sd],.24)}K.pair('metal',()=>cyl(.04,.04,.8,6),[1.2,-.2,.5]);
    for(let i=0;i<4;i++)K.add('metal',box(.2,.06,.14),[-.2-i*.3,.46,.2*(i%2?1:-1)])},
  // Compact "Longhaul" freighter (large base): a boxy hauler with cargo pods on a spine, a forward bridge and a dorsal turret
  freighter(K){K.add('hull2',box(6.2,.55,1.),[-.2,0,0]);
    for(let i=0;i<4;i++)for(const sd of [1,-1]){const x=1.6-i*1.35;K.add(i%2?'hull':'trim',box(1.15,.95,1.1),[x,0,1.12*sd]);K.add('hull2',box(1.2,.12,1.15),[x,.5,1.12*sd]);K.add('metal',box(.1,.8,.1),[x+.62,0,1.12*sd])}
    K.add('hull',latheX([[0,4.],[.35,3.8],[.6,3.2],[.7,2.4],[.7,2.]],16,.9,1.1),[0,.1,0]);K.add('glass',new THREE.CylinderGeometry(.62,.66,.2,16,1,true,-PI*.5,PI),[3.1,.3,0],[0,0,PI/2]);
    K.add('hull',box(1.3,1.1,2.9),[-3.4,0,0]);for(const z of [-.9,0,.9])engine(K,[-4.05,0,z],.4);K.pair('hull2',()=>box(1.,.08,.9),[-3.,.2,1.9]);
    for(let i=0;i<6;i++)K.add('metal',box(.12,.5,.02),[-3.3+i*.12,.8,1.3]);K.add('metal',cyl(.05,.05,1.4,6),[-2.2,.9,-.5],[0,0,PI/2.2]);K.add('metal',new THREE.SphereGeometry(.35,12,6,0,PI*2,0,PI/2),[-2.2,1.35,-.5],[PI,0,0]);
    K.add('metal',cyl(.4,.4,.35,16),[.4,.45,0],[0,0,PI/2]);K.add('hull',new THREE.SphereGeometry(.38,16,8,0,PI*2,0,PI/2),[.4,.62,0]);K.pair('metal',()=>cyl(.05,.05,1.1,8),[.95,.72,.14]);
    K.fx.push({k:'lamp',p:[1.6,.55,1.7],c:0x6fff9a,blink:1},{k:'lamp',p:[1.6,.55,-1.7],c:0xff5050,blink:1},{k:'lamp',p:[-3.4,.6,0],c:0xffffff,blink:1,ph:2})},
  // Armada "Warden" gunship (large base): an angular armoured wedge with a stepped bridge, weapon pylons and twin drives
  gunship(K){K.add('hull',plate([[3.2,0],[1.2,1.3],[-2.6,1.6],[-2.9,.9],[-2.9,-.9],[-2.6,-1.6],[1.2,-1.3]],.8,.12));K.add('hull2',plate([[2.4,0],[.6,.8],[-2.2,1.],[-2.2,-1.],[.6,-.8]],.5,.08),[0,.6,0]);
    K.add('hull2',box(1.2,.5,.8),[-1.3,1.05,0]);K.add('glass',box(.1,.16,.6),[-.68,1.12,0]);K.add('trim',plate([[3.,0],[1.1,1.22],[1.,1.1],[2.7,0],[1.,-1.1],[1.1,-1.22]],.05,0),[0,.43,0]);
    for(const sd of [1,-1]){K.add('hull2',plate([[.2,0],[-1.6,0],[-2.,1.2*sd],[-.4,1.2*sd]],.18),[0,-.1,1.4*sd]);K.add('metal',cyl(.2,.18,1.6,10),[-.4,-.1,2.55*sd]);K.add('metal',cyl(.06,.05,1.2,8),[.9,-.1,2.55*sd]);
      engine(K,[-2.95,.05,.9*sd],.42);K.fx.push({k:'lamp',p:[-2.,-.1,2.7*sd],c:0xff3040,blink:1,ph:sd})}
    for(let i=0;i<8;i++)K.add('metal',box(.25,.12,.2),[1.4-i*.45,.9,(i%3-1)*.4]);K.add('metal',cyl(.03,.03,1.,6),[-1.4,1.6,.2],[0,0,PI/2])},
  // Armada "Herald" shuttle (large base): a stubby hull on an inverted-gull delta with canted ventral fins
  shuttle(K){K.add('hull',latheX([[0,2.4],[.35,2.1],[.62,1.2],[.7,-.6],[.62,-1.8],[.5,-2.1]],8,.9,1));K.add('glass',canopyG(.9,.7,.34),[1.7,.35,0]);
    for(const sd of [1,-1]){K.add('hull2',plate([[.8,0],[-1.8,0],[-2.,2.1*sd],[-1.3,2.1*sd]],.14),[0,-.05,.45*sd],[.32*sd,0,0]);K.add('trim',plate([[-1.35,1.8*sd],[-2.,1.8*sd],[-2.,2.1*sd],[-1.3,2.1*sd]],.03,0),[0,.05,.45*sd],[.32*sd,0,0]);
      K.add('hull2',plate([[.2,0],[-1.4,0],[-1.7,.9*sd],[-.8,.9*sd]],.08),[-.2,-.5,.3*sd],[(PI/2-.5)*sd,0,0]);engine(K,[-2.1,.05,.35*sd],.3)}
    K.add('hull2',plate([[.2,0],[-1.3,0],[-1.6,.7],[-.7,.7]],.07),[-.3,.6,0],[PI/2,0,0]);for(let i=0;i<5;i++)K.add('metal',box(.25,.06,.18),[.9-i*.4,.66,.3*(i%2?1:-1)]);K.pair('metal',()=>cyl(.05,.05,.9,8),[2.,-.2,.35])},
  // Armada "Razor" interceptor: the arrowhead with long forward-raked razor wings and wingtip cannons
  razor(K){DESIGN.shard(K);for(const sd of [1,-1]){K.add('hull2',plate([[-.9,.5*sd],[1.5,1.45*sd],[1.55,1.62*sd],[-1.1,.9*sd]],.06),[0,.08,0]);K.add('trim',plate([[1.5,1.45*sd],[1.55,1.62*sd],[.1,1.08*sd],[.05,.95*sd]],.07,0),[0,.08,0]);
    K.add('metal',cyl(.05,.04,1.,8),[1.6,.08,1.56*sd]);K.fx.push({k:'lamp',p:[2.1,.08,1.56*sd],c:0xff3040,s:.5,blink:1,ph:sd})}},
  // Armada "Maul" bomber: a widened arrowhead with armour plates and two finned ordnance pods
  maul(K){DESIGN.shard(K);for(const sd of [1,-1]){K.add('hull2',latheX([[0,1.3],[.16,1.1],[.26,.6],[.26,-.8],[.2,-1.1]],12),[-.2,-.28,.95*sd]);K.add('trim',plate([[-1.,0],[-1.3,0],[-1.3,.3],[-1.1,.3]],.03,0),[-.1,-.28,.95*sd],[PI/2,0,0]);
    K.add('hull',plate([[.8,.35*sd],[-.6,.35*sd],[-.9,1.1*sd],[.2,1.1*sd]],.12),[0,.12,0])}},
  // Compact "Keel" strike fighter: a crescent flying wing with a central cockpit pod and wingtip engine pods
  wedge(K){K.add('hull',plate([[.9,0],[.2,1.1],[-.3,2.3],[-.9,2.4],[-.6,1.2],[-1.,0],[-.6,-1.2],[-.9,-2.4],[-.3,-2.3],[.2,-1.1]],.22,.06));
    K.add('hull2',latheX([[0,1.9],[.2,1.6],[.4,.9],[.45,-.4],[.38,-1.1]],14,.85,1),[0,.12,0]);K.add('glass',canopyG(.8,.42,.26),[.9,.42,0]);
    for(const sd of [1,-1]){K.add('hull2',cyl(.24,.22,1.4,12),[-.6,0,2.3*sd]);engine(K,[-1.3,0,2.3*sd],.22);K.add('metal',cyl(.04,.04,1.,6),[.5,0,2.3*sd]);K.add('trim',plate([[-.2,1.2*sd],[-.6,2.1*sd],[-.8,2.1*sd],[-.45,1.2*sd]],.02,0),[0,.13,0]);
      K.fx.push({k:'lamp',p:[-.9,.25,2.4*sd],c:sd>0?0x6fff9a:0xff5050,blink:1})}engine(K,[-1.1,.12,0],.26)}};
const MODELS={};for(const k in DESIGN)MODELS[k]=c=>{const K=new Kit();DESIGN[k](K);return K.build(facMats(c),c.eng)};
// ---- bases: glossy black plastic with a printed pilot token (name, skill, firing arc), a lit faction rim and a clear acrylic peg ----
function tokenTex(s){const col=FACCOL[FACTIONS[G.fac[s.side]].col].base;const P=PILOTS[s.pilot]||{};return canvasTex(512,512,(x,w,h)=>{
  const g=x.createRadialGradient(w/2,h/2,40,w/2,h/2,w*.75);g.addColorStop(0,'#1d2130');g.addColorStop(1,'#07080d');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.globalAlpha=.06;for(let i=0;i<900;i++){x.fillStyle=Math.random()<.5?'#fff':'#000';x.fillRect(Math.random()*w,Math.random()*h,2,2)}x.globalAlpha=1;
  x.strokeStyle=col;x.lineWidth=14;x.strokeRect(10,10,w-20,h-20);x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=2;x.strokeRect(26,26,w-52,h-52);
  // firing arcs (the model faces +x): front 90 degree wedge, a turret gets a full ring, an auxiliary arc gets the rear wedge
  const arc=(SHIPS[s.type]||{}).arc;x.save();x.translate(w/2,h/2);x.fillStyle=col;x.globalAlpha=.22;x.beginPath();x.moveTo(0,0);x.lineTo(w/2,-h/2);x.lineTo(w/2,h/2);x.closePath();x.fill();
  if(arc==='A'){x.beginPath();x.moveTo(0,0);x.lineTo(-w/2,-h/2);x.lineTo(-w/2,h/2);x.closePath();x.fill()}x.globalAlpha=1;x.strokeStyle=col;x.lineWidth=6;
  for(const sgn of [1,-1]){x.beginPath();x.moveTo(0,0);x.lineTo(w/2-14,sgn*(h/2-14));x.stroke();if(arc==='A'){x.beginPath();x.moveTo(0,0);x.lineTo(-w/2+14,sgn*(h/2-14));x.stroke()}}
  if(arc==='T'){x.lineWidth=5;x.setLineDash([14,10]);x.beginPath();x.arc(0,0,w*.36,0,7);x.stroke();x.setLineDash([])}
  x.fillStyle='#fff';x.beginPath();x.moveTo(w/2-44,-20);x.lineTo(w/2-18,0);x.lineTo(w/2-44,20);x.fill();
  x.fillStyle='#0a0b10';x.beginPath();x.arc(0,0,40,0,7);x.fill();x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=3;x.stroke();x.restore();
  // pilot plate at the rear: skill disc and name
  x.fillStyle='rgba(0,0,0,.55)';x.fillRect(40,h-122,w-80,84);x.strokeStyle=col;x.lineWidth=3;x.strokeRect(40,h-122,w-80,84);
  x.fillStyle='#ffb347';x.beginPath();x.arc(92,h-80,32,0,7);x.fill();x.fillStyle='#1a1006';x.font='800 40px Orbitron, "Exo 2", sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(String(s.ps!=null?s.ps:P.ps||''),92,h-78);
  x.fillStyle='#fff';x.textAlign='left';let nm=(s.name||'').toUpperCase();let fs=40;x.font=`800 ${fs}px "Exo 2", sans-serif`;while(x.measureText(nm).width>w-190&&fs>18){fs-=2;x.font=`800 ${fs}px "Exo 2", sans-serif`}x.fillText(nm,138,h-90);
  x.font='600 22px "Exo 2", sans-serif';x.fillStyle='rgba(255,255,255,.7)';x.fillText(((SHIPS[s.type]||{}).n||'').toUpperCase(),140,h-58)})}
function baseGeo(b){const r=.45,s=b/2-r;const sh=new THREE.Shape();sh.moveTo(-s,-b/2);sh.lineTo(s,-b/2);sh.quadraticCurveTo(b/2,-b/2,b/2,-s);sh.lineTo(b/2,s);sh.quadraticCurveTo(b/2,b/2,s,b/2);sh.lineTo(-s,b/2);sh.quadraticCurveTo(-b/2,b/2,-b/2,s);sh.lineTo(-b/2,-s);sh.quadraticCurveTo(-b/2,-b/2,-s,-b/2);
  const g=new THREE.ExtrudeGeometry(sh,{depth:.28,bevelEnabled:true,bevelSize:.12,bevelThickness:.12,bevelSegments:3,curveSegments:6});g.rotateX(-PI/2);g.translate(0,.12,0);return g}
function blobTex(){if(V3.bt)return V3.bt;V3.bt=canvasTex(128,128,(x,w,h)=>{const g=x.createRadialGradient(64,64,10,64,64,64);g.addColorStop(0,'rgba(0,0,0,.85)');g.addColorStop(.6,'rgba(0,0,0,.4)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});return V3.bt}
function ringTex(){if(V3.rt)return V3.rt;V3.rt=canvasTex(256,256,(x,w,h)=>{x.strokeStyle='#fff';for(let i=0;i<10;i++){x.globalAlpha=(1-i/10)*.25;x.lineWidth=2+i*2.4;x.beginPath();x.roundRect?x.roundRect(40,40,176,176,22):x.rect(40,40,176,176);x.stroke()}x.globalAlpha=1;x.lineWidth=5;x.beginPath();x.roundRect?x.roundRect(40,40,176,176,22):x.rect(40,40,176,176);x.stroke()});return V3.rt}
// shield bubble: fresnel rim + hexagon cells + a ripple from the impact point; amp decays after each hit
function shieldMat(){return new THREE.ShaderMaterial({uniforms:{amp:{value:0},hit:{value:new THREE.Vector3(1,0,0)},t:{value:0},col:{value:new THREE.Color(.4,.8,1.)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
  vertexShader:'varying vec3 vN,vV,vL;varying vec2 vUv;void main(){vL=normalize(position);vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:`uniform float amp,t;uniform vec3 hit,col;varying vec3 vN,vV,vL;varying vec2 vUv;
    float hex(vec2 p){p.x*=1.1547;p.y+=mod(floor(p.x),2.)*.5;p=abs(fract(p)-.5);return abs(max(p.x*1.5+p.y,p.y*2.)-1.);}
    void main(){if(amp<.002)discard;float f=pow(1.-abs(dot(vN,vV)),2.2);float d=acos(clamp(dot(vL,normalize(hit)),-1.,1.));float wave=exp(-pow((d-(1.-amp)*2.4)*4.,2.))*amp;
      float h=1.-smoothstep(0.,.12,hex(vUv*vec2(28.,12.)));float spot=exp(-d*d*6.)*amp;
      float a=(f*.6+h*(.12+wave*1.3)*(.35+f)+spot*1.1+wave*.7)*amp;gl_FragColor=vec4(col*a*1.3,1.);\n#include <colorspace_fragment>\n}`})}
function bombMesh(t){const g=new THREE.Group();const mine=t.k==='mine';const H=hullMaps();
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshStandardMaterial({color:mine?0x3c424e:0x4a3022,roughness:.4,metalness:.85,normalMap:H.nor,emissive:mine?0x0a2440:0x401000,emissiveIntensity:.6}));core.position.y=.9;core.castShadow=true;g.add(core);
  for(let i=0;i<6;i++){const sp=new THREE.Mesh(new THREE.CylinderGeometry(.08,.14,.7,6),core.material);const d=new THREE.Vector3().setFromSphericalCoords(1,Math.acos(1-2*(i+.5)/6),i*2.4);sp.position.copy(d.clone().multiplyScalar(1.1)).add(new THREE.Vector3(0,.9,0));sp.lookAt(core.position.clone().add(d.multiplyScalar(3)));sp.rotateX(PI/2);g.add(sp)}
  const lamp=new THREE.Mesh(sphere(.25),new THREE.MeshBasicMaterial({color:new THREE.Color(mine?0x66ccff:0xff7733).multiplyScalar(3)}));lamp.position.y=1.9;g.add(lamp);
  const l=glow(mine?0x66ccff:0xff7733,3.2,.8);l.position.y=1.9;g.add(l);g.userData.lamp=l;g.position.copy(W(t.x,t.y));g.userData.bomb=t.id;return g}
function shipMesh(s){const g=new THREE.Group();const b=S3(B(s));const fc=FACCOL[FACTIONS[G.fac[s.side]].col];
  const blob=new THREE.Mesh(new THREE.PlaneGeometry(b*1.7,b*1.7),new THREE.MeshBasicMaterial({map:blobTex(),transparent:true,depthWrite:false,opacity:.8}));blob.rotation.x=-PI/2;blob.position.y=.02;g.add(blob);
  const plastic=new THREE.MeshPhysicalMaterial({color:0x0b0c10,roughness:.28,metalness:0,clearcoat:.8,clearcoatRoughness:.15});
  const base=new THREE.Mesh(baseGeo(b),plastic);base.castShadow=true;base.receiveShadow=true;g.add(base);
  const tok=new THREE.Mesh(new THREE.PlaneGeometry(b-.5,b-.5),new THREE.MeshStandardMaterial({map:tokenTex(s),roughness:.55,metalness:0}));tok.rotation.x=-PI/2;tok.rotation.z=0;tok.position.y=.53;tok.receiveShadow=true;g.add(tok);
  const rimC=new THREE.Color(fc.eng);const rim=new THREE.Mesh(new THREE.PlaneGeometry(b*1.45,b*1.45),new THREE.MeshBasicMaterial({map:ringTex(),color:rimC.clone().multiplyScalar(1.2),transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));rim.rotation.x=-PI/2;rim.position.y=.06;g.add(rim);
  const acr=new THREE.MeshPhysicalMaterial({color:0xcfe6ff,roughness:.05,metalness:0,transparent:true,opacity:.28,clearcoat:1,envMapIntensity:2,depthWrite:false});
  const sock=new THREE.Mesh(new THREE.CylinderGeometry(.34,.42,.3,16),plastic);sock.position.y=.66;g.add(sock);
  const peg=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,3.2,12),acr);peg.position.y=2.2;g.add(peg);
  const T=SHIPS[s.type];const mdl=(MODELS[T.model]||MODELS.lance)(fc);mdl.position.y=3.6;const k=(s.base==='L'?2.1:2.3)*(T.scale||1);/* big, readable miniatures that overhang their bases, like the real ones */mdl.scale.multiplyScalar(k);g.add(mdl);
  const pick=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b,5),5,Math.max(b,5)),new THREE.MeshBasicMaterial({visible:false}));pick.position.y=2;pick.userData.ship=s.id;g.add(pick);
  const bs=new THREE.Box3().setFromObject(mdl);const sz=bs.getSize(new THREE.Vector3());
  const shield=new THREE.Mesh(new THREE.SphereGeometry(1,40,24),shieldMat());shield.scale.set(sz.x*.62+.6,Math.max(1.6,sz.y*.9+.8),sz.z*.62+.6);shield.position.y=3.6;shield.renderOrder=5;g.add(shield);
  g.userData={mdl,shield,pick,rim,rimC,blob,bob:Math.random()*6,sel:0};return g}
// ---- asteroids: an icosphere displaced by fbm with sculpted impact craters (bowls with raised rims), keeping the rule footprint; PBR rock ----
function mergeVerts(g){const P=g.attributes.position;const map=new Map(),pos=[],idx=[];for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i);const key=Math.round(x*1e4)+','+Math.round(y*1e4)+','+Math.round(z*1e4);let k=map.get(key);if(k===undefined){k=pos.length/3;map.set(key,k);pos.push(x,y,z)}idx.push(k)}
  const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setIndex(idx);return o}
function rockMaps(){if(V3.rkm)return V3.rkm;const S=256,H=new Float32Array(S*S);for(let j=0;j<S;j++)for(let i=0;i<S;i++){H[j*S+i]=tfbm(i/16,j/16,16,5)}
  const Rg=H.map(v=>.78+v*.2);V3.rkm={nor:normalFromHeight(H,S,9),rough:grayTex(Rg,S,true)};[V3.rkm.nor,V3.rkm.rough].forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,2)});return V3.rkm}
function rockGeo(R,seed,det,prof){const g=mergeVerts(new THREE.IcosahedronGeometry(1,det));const P=g.attributes.position;const rr=rng(seed);const cr=[];const nc=det>=4?9:3;
  for(let i=0;i<nc;i++){const v=new THREE.Vector3(rr()*2-1,rr()*1.6-.6,rr()*2-1).normalize();cr.push({v,r:.16+rr()*.34,d:.1+rr()*.12})}
  const col=new Float32Array(P.count*3);const v=new THREE.Vector3();const off=rr()*50;
  for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);const n=fbm3(v.x*1.6+off,v.y*1.6,v.z*1.6,5);const fine=vnoise3(v.x*7+off,v.y*7,v.z*7),grit=vnoise3(v.x*23,v.y*23+off,v.z*23);let h=1+(n-.5)*.55+(fine-.5)*.1+(grit-.5)*.025;let dark=0;
    for(const c of cr){const a=Math.acos(Math.max(-1,Math.min(1,v.dot(c.v))))/c.r;if(a<1.35){const bowl=a<1?-(1-a*a)*c.d:0;const rim=Math.exp(-Math.pow((a-1)*4.5,2))*c.d*.55;h+=bowl+rim;if(a<1)dark+=(1-a)*.5}}
    let k=1;if(prof){const ang=Math.atan2(v.z,v.x)-prof.rot;const nn=prof.n;const ii=((Math.round(-ang/(2*Math.PI)*nn)%nn)+nn)%nn;k=prof.k[ii]}
    v.multiplyScalar(R*h*k);P.setXYZ(i,v.x,v.y*.78,v.z);const base=(.26+n*.3)*(.85+grit*.3),c=base*(1-Math.min(.55,dark));col[i*3]=c*1.05;col[i*3+1]=c*.95;col[i*3+2]=c*.88}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
  // spherical UVs for the detail maps
  const U=new Float32Array(P.count*2);for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).normalize();U[i*2]=Math.atan2(v.z,v.x)/(2*PI)+.5;U[i*2+1]=v.y*.5+.5}g.setAttribute('uv',new THREE.BufferAttribute(U,2));return g}
function rockMat(){if(V3.rockM)return V3.rockM;const R=rockMaps();V3.rockM=new THREE.MeshStandardMaterial({color:0x9a8c80,vertexColors:true,roughness:.93,metalness:.04,envMapIntensity:.4});return V3.rockM}
function rockMesh(o,idx){const seed=Math.round(o.x*7+o.y*13)+idx*101;const geo=rockGeo(S3(o.r)*1.05,seed,V3.q==='low'?3:5,o);
  const m=new THREE.Mesh(geo,rockMat());m.castShadow=true;m.receiveShadow=true;m.position.copy(W(o.x,o.y,1.6));m.userData={spin:(Math.random()-.5)*.1,ph:Math.random()*6,y0:1.6};
  // a ring of pebbles orbiting each rock (one instanced mesh)
  const pg=rockGeo(1,seed+7,1,null);const n=12;const pb=new THREE.InstancedMesh(pg,rockMat(),n);pb.castShadow=true;const rr=rng(seed+3);pb.userData.p=[];
  for(let i=0;i<n;i++){pb.userData.p.push({a:rr()*6.28,d:S3(o.r)*(1.25+rr()*.6),y:(rr()-.5)*1.8,s:.12+rr()*.32,sp:(.05+rr()*.12)*(rr()<.5?-1:1),rx:rr()*6,ry:rr()*6})}m.userData.pebbles=pb;return m}
// the engine hum (GA sample 'engine_loop') plays while any ship flies a maneuver; one copy at most, faded in and out
function engineBed(on){if(on===!!V3.engOn)return;V3.engOn=on;if(typeof sndEngine==='function')sndEngine(on)}
// ---- sync the scene with G ----
function sync3D(){if(!V3.on||!G)return;if(PH)PH.wake();
  if(V3.gid!==G.seed+':'+G.ships.length+':'+G.rocks.length){V3.gid=G.seed+':'+G.ships.length+':'+G.rocks.length;for(const k in V3.ships)V3.root.remove(V3.ships[k]);V3.ships={};V3.rocks.forEach(r=>{V3.root.remove(r);V3.root.remove(r.userData.pebbles)});V3.rocks=[];V3.anim={};V3.later=[];setMatColors();
    G.rocks.forEach((o,i)=>{const m=rockMesh(o,i);V3.root.add(m);m.userData.pebbles.visible=V3.q!=='low';V3.root.add(m.userData.pebbles);V3.rocks.push(m)})}
  V3.bombs=V3.bombs||{};const live=new Set((G.bombs||[]).map(t=>t.id));for(const id in V3.bombs)if(!live.has(id)){V3.root.remove(V3.bombs[id]);delete V3.bombs[id]}
  for(const t of (G.bombs||[]))if(!V3.bombs[t.id]){V3.bombs[t.id]=bombMesh(t);V3.root.add(V3.bombs[t.id])}
  for(const s of G.ships){let m=V3.ships[s.id];if(!m){m=V3.ships[s.id]=shipMesh(s);V3.root.add(m);m.position.copy(W(s.x,s.y));m.rotation.y=s.h}
    m.visible=s.alive||(V3.anim[s.id]&&V3.anim[s.id].boom)||false;if(!V3.anim[s.id]){m.position.copy(W(s.x,s.y));m.rotation.y=s.h}}
  drainFx();drawGuides();tags3D()}
// hits land when the bolt arrives: effects on a ship that was just shot at are delayed until then
function at(id,fn){const t=V3.hitAt[id]||0,now=performance.now();if(t>now)V3.later.push({t,fn});else fn()}
function drainFx(){while(UI.fx.length){const f=UI.fx.shift();const m=V3.ships[f.id];
    if(f.k==='move'&&m){V3.anim[f.id]={path:f.path,t0:performance.now(),dur:Math.max(1,f.dur)};sfx(f.roll?'roll':'engine')}
    else if(f.k==='shot'){const a=V3.ships[f.a],d=V3.ships[f.d];if(a&&d)bolt(a,d,f.ion?'I':f.w,f.d);}
    else if(f.k==='shield'&&m){sfx('shield');at(f.id,()=>{const u=m.userData.shield.material.uniforms;u.amp.value=1;const src=V3.lastFrom&&V3.lastFrom[f.id];if(src){const l=m.worldToLocal(src.clone());l.y-=3.6;u.hit.value.copy(l.lengthSq()?l.normalize():new THREE.Vector3(1,0,0))}})}
    else if(f.k==='hull'&&m){at(f.id,()=>{sparks(m.position,0xffb060,22);debris(m,5,.6);V3.shake=Math.max(V3.shake,.5);sfx('hull');pop(m,'-'+f.n,'hurt')})}
    else if(f.k==='crit'&&m){at(f.id,()=>{sparks(m.position,0xff4020,40);debris(m,9,.8);flash(m.position.clone().setY(3.6),0xff8040,9,.4);V3.shake=1;sfx('crit');pop(m,'CRIT!','crit')})}
    else if(f.k==='boom'&&m){const id=f.id;const t=Math.max(performance.now(),V3.hitAt[id]||0);V3.anim[id]={boom:true,t0:t,dur:1400};at(id,()=>{boom(m);sfx('boom')})}
    else if(f.k==='miss'&&m){at(f.id,()=>{pop(m,'MISS','miss');sfx('miss')})}
    else if(f.k==='token'&&m){pop(m,f.k2==='evade'?'EVADE':'FOCUS','tok');sfx('token')}
    else if(f.k==='lock'){sfx('lock');const d=V3.ships[f.to];if(d)pop(d,'LOCKED','lock')}
    else if(f.k==='stress'&&m){pop(m,'STRESS','hurt');sfx('stress')}
    else if(f.k==='rock'&&m){sfx('rock');sparks(m.position,0xaa8866,20);puff(m.position,0x8a7a70,8)}
    else if(f.k==='bump'&&m){pop(m,'BUMP','hurt');sfx('rock')}
    else if(f.k==='blast'){const p=W(f.x,f.y,1);sparks(p,0xffa040,50);flash(p,0xffd090,26,.9);ring(p,0xffb060,18);fire(p,10,1.4);V3.shake=1.4;sfx('boom')}
    else if(f.k==='bomb'){sfx('token')}}}
// ---- effects ----
function fxAdd(o,dur,kind,extra){V3.fxRoot.add(o);const sm=V3.slowmo||1;const e=Object.assign({o,t0:performance.now(),dur:dur*sm,kind},extra||{});if(extra&&extra.t0&&sm>1)e.t0=performance.now()+(extra.t0-performance.now())*sm;V3.fxq.push(e);return e}
function boltMat(col,core){const k=col+':'+core;V3.bm=V3.bm||{};if(V3.bm[k])return V3.bm[k];V3.bm[k]=new THREE.MeshBasicMaterial({color:new THREE.Color(core?0xffffff:col).lerp(new THREE.Color(col),core?.35:0).multiplyScalar(core?4:2.2),transparent:true,opacity:core?1:.5,blending:THREE.AdditiveBlending,depthWrite:false});return V3.bm[k]}
function bolt(a,d,w,did){const from=a.position.clone().add(new THREE.Vector3(0,3.6,0)),to=d.position.clone().add(new THREE.Vector3(0,3.6,0));const as=G.ships.find(s=>V3.ships[s.id]===a);
  const col=w==='I'?0x66ccff:w==='P'?(as&&FACCOL[FACTIONS[G.fac[as.side]].col].eng)||0xff5050:0xffe070;const n=w==='P'?3:1,dur=w==='P'?300:520;(V3.lastFrom=V3.lastFrom||{})[did]=from.clone();
  // start at the ship's nose, aim slightly scattered across the target
  const dir=to.clone().sub(from).normalize();const f0=from.clone().addScaledVector(dir,3);
  for(let i=0;i<n;i++){const off=new THREE.Vector3((Math.random()-.5)*1.4,(Math.random()-.5)*.8,(Math.random()-.5)*1.4);const g=new THREE.Group();
    const L=w==='P'?3.2:1.6;const core=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,L,6),boltMat(col,1));const halo=new THREE.Mesh(new THREE.CylinderGeometry(.26,.26,L*1.15,8),boltMat(col,0));g.add(core,halo);
    const h=glow(col,w==='P'?2.6:3.6,.9);h.position.y=L/2;g.add(h);if(w!=='P'){const tr=glow(0xffffff,1.4,1);tr.position.y=L/2;g.add(tr)}
    const e=fxAdd(g,dur,'bolt',{from:f0.clone(),to:to.clone().add(off),t0:performance.now()+i*110});g.visible=false;
    const mf=new THREE.Sprite(new THREE.SpriteMaterial({map:flareTex(),color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));mf.position.copy(f0);mf.scale.setScalar(3.5);fxAdd(mf,160,'flash',{t0:performance.now()+i*110,s:3.5})}
  V3.hitAt[did]=performance.now()+(dur+(n-1)*110)*(V3.slowmo||1);sfx(w==='P'?'laser':w==='I'?'ion':'torp')}
function flash(pos,col,size,dur){const f=glow(col,size,1);f.position.copy(pos);fxAdd(f,(dur||.7)*1000,'flash',{s:size});V3.flashL.position.copy(pos);V3.flashL.color.set(col);V3.flashT=Math.max(V3.flashT||0,1)}
function sparks(pos,col,n){for(let i=0;i<n;i++){const g=new THREE.Sprite(new THREE.SpriteMaterial({map:i%3?glowTex():flareTex(),color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));const s=.5+Math.random()*.9;g.scale.setScalar(s);g.position.copy(pos).add(new THREE.Vector3(0,3.6,0));
    fxAdd(g,500+Math.random()*600,'spark',{v:new THREE.Vector3((Math.random()-.5)*18,(Math.random()-.2)*12,(Math.random()-.5)*18),s})}}
function puff(pos,col,n){for(let i=0;i<n;i++){const g=new THREE.Sprite(new THREE.SpriteMaterial({map:puffTex(),color:col,transparent:true,opacity:.5,depthWrite:false,rotation:Math.random()*6}));g.position.copy(pos).add(new THREE.Vector3((Math.random()-.5)*3,.5+Math.random(),(Math.random()-.5)*3));g.scale.setScalar(1.5);
    fxAdd(g,900+Math.random()*500,'puff',{v:new THREE.Vector3((Math.random()-.5)*3,.8+Math.random(),(Math.random()-.5)*3),s:1.5,g:2.6})}}
function fire(pos,n,k){for(let i=0;i<n;i++){const hot=i<n/2;const g=new THREE.Sprite(new THREE.SpriteMaterial({map:puffTex(),color:hot?0xffa040:0x3a302c,transparent:true,opacity:hot?1:.7,blending:hot?THREE.AdditiveBlending:THREE.NormalBlending,depthWrite:false,rotation:Math.random()*6}));
    g.position.copy(pos).add(new THREE.Vector3((Math.random()-.5)*2*k,(Math.random()-.5)*1.5*k,(Math.random()-.5)*2*k));const s=(2+Math.random()*2)*k;g.scale.setScalar(s);
    fxAdd(g,(hot?700:1600)+Math.random()*500,hot?'fire':'puff',{v:new THREE.Vector3((Math.random()-.5)*5,(Math.random())*3,(Math.random()-.5)*5).multiplyScalar(k),s,g:hot?2.2:3.2,t0:performance.now()+(hot?0:120)})}}
function ring(pos,col,size){const m=new THREE.Mesh(new THREE.RingGeometry(.86,1,64),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(1.1),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-PI/2;m.position.copy(pos);fxAdd(m,900,'ring',{s:size})}
// hull fragments that tumble away (use the ship's own hull paint)
function debris(m,n,k){const src=m.userData.mdl;let hm=null;src.traverse(o=>{if(!hm&&o.material&&o.material.userData&&o.material.userData.hullMat)hm=o.material});hm=hm||rockMat();
  for(let i=0;i<n;i++){const geo=i%3?new THREE.BoxGeometry(.3+Math.random()*.5,.08+Math.random()*.2,.2+Math.random()*.4):new THREE.TetrahedronGeometry(.3+Math.random()*.3);const d=new THREE.Mesh(geo,i%4?hm:facMats(FACCOL[0]).metal);d.castShadow=true;
    d.position.copy(m.position).add(new THREE.Vector3((Math.random()-.5)*2,3.6+(Math.random()-.5),(Math.random()-.5)*2));
    fxAdd(d,1600+Math.random()*900,'debris',{v:new THREE.Vector3((Math.random()-.5)*16*k,(Math.random()*.9+.1)*10*k,(Math.random()-.5)*16*k),w:new THREE.Vector3(Math.random()*9,Math.random()*9,Math.random()*9)});
    if(i%2===0){const ember=glow(0xff8030,1.2,1);d.add(ember)}}}
function boom(m){const p=m.position.clone().add(new THREE.Vector3(0,3.6,0));flash(p,0xffe0a0,30,.8);fire(p,18,1.3);ring(m.position.clone().setY(1),0xffb060,26);sparks(m.position,0xffc070,50);sparks(m.position,0xff4020,30);debris(m,16,1.2);V3.shake=1.6}
function pop(m,text,cls){const el=document.createElement('div');el.className='pop '+cls;el.textContent=text;document.getElementById('tags').appendChild(el);const v=m.position.clone().add(new THREE.Vector3(0,6,0));el._v=v;el.style.setProperty('--dx',(Math.random()*40-20)+'px');setTimeout(()=>el.remove(),1500);placeEl(el,v)}
function placeEl(el,v){const p=v.clone().project(V3.camera),c=V3.r.domElement;el.style.left=((p.x+1)/2*c.clientWidth)+'px';el.style.top=((1-p.y)/2*c.clientHeight)+'px';el.style.display=p.z<1?'':'none'}
// ---- guides: dial preview templates, arcs and range bands for the selected ship, target lines ----
function clearGuides(){while(V3.guide.children.length){const c=V3.guide.children.pop();c.traverse(o=>{if(o.geometry)o.geometry.dispose()})}}
// translucent glowing ribbon: bright edges, a soft core and chevrons flowing along the maneuver
function ribbonMat(col,op){return new THREE.ShaderMaterial({uniforms:{col:{value:new THREE.Color(col)},op:{value:op},t:V3.tU||(V3.tU={value:0}),len:{value:1}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform vec3 col;uniform float op,t,len;varying vec2 vUv;void main(){float e=abs(vUv.y-.5)*2.;float edge=smoothstep(.72,.96,e)*(1.-smoothstep(.96,1.,e));
    float s=vUv.x*len;float chev=smoothstep(.72,.9,fract(s*.35-abs(vUv.y-.5)*.8-t*.9))*(1.-e*.6);float fade=smoothstep(0.,.06,vUv.x)*(.55+.45*vUv.x);
    float a=(edge*1.1+.16+chev*.55*step(.3,op))*op*fade;gl_FragColor=vec4(col*a*1.5,1.);\n#include <colorspace_fragment>\n}`})}
function ribbon(pts,col,op,h){const pos=[],uv=[],idx=[];let L=0;pts.forEach((p,i)=>{if(i)L+=Math.hypot(p.x-pts[i-1].x,p.y-pts[i-1].y)});let acc=0;
  pts.forEach((p,i)=>{if(i)acc+=Math.hypot(p.x-pts[i-1].x,p.y-pts[i-1].y);const n=V(Math.cos(p.h+Math.PI/2),Math.sin(p.h+Math.PI/2));const a=add(p,mul(n,TPL_W/2)),b=sub(p,mul(n,TPL_W/2));const A=W(a.x,a.y,h||.35),Bw=W(b.x,b.y,h||.35);pos.push(A.x,A.y,A.z,Bw.x,Bw.y,Bw.z);const u=L?acc/L:0;uv.push(u,1,u,0);if(i){const k=i*2;idx.push(k-2,k-1,k,k-1,k+1,k)}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);const m=ribbonMat(col,op);m.uniforms.len.value=S3(L);return new THREE.Mesh(g,m)}
// a glowing base footprint: a soft frame strip (quad ring) plus a faint fill and a front notch
function outline(p,b,col,op){const c=corners(p,b);const grp=new THREE.Group();const w=S3(b)*.07;const pos=[],uv=[],idx=[];
  const cen=c.reduce((a,q)=>({x:a.x+q.x/4,y:a.y+q.y/4}),{x:0,y:0});
  for(let i=0;i<=4;i++){const q=c[i%4];const o=W(q.x,q.y,.42),inr=W(cen.x+(q.x-cen.x)*.86,cen.y+(q.y-cen.y)*.86,.42);pos.push(o.x,o.y,o.z,inr.x,inr.y,inr.z);uv.push(i/4,1,i/4,0);if(i){const k=i*2;idx.push(k-2,k-1,k,k-1,k+1,k)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
  const fm=new THREE.ShaderMaterial({uniforms:{col:{value:new THREE.Color(col)},op:{value:op}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform vec3 col;uniform float op;varying vec2 vUv;void main(){float a=pow(vUv.y,2.2)*1.3+.08;gl_FragColor=vec4(col*a*op*1.6,1.);\n#include <colorspace_fragment>\n}'});
  grp.add(new THREE.Mesh(g,fm));const fill=new THREE.BufferGeometry().setFromPoints([0,1,2,0,2,3].map(i=>W(c[i].x,c[i].y,.4)));grp.add(new THREE.Mesh(fill,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op*.12,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending})));
  const f=fwd(p.h);const tip=W(p.x+f.x*S3(b)*6,p.y+f.y*S3(b)*6,.45);const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([W(cen.x,cen.y,.45),tip]),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:op*.9}));grp.add(ln);return grp}
function arcFan(s,arc,rmax,col){const g=new THREE.Group();const b=B(s);const mk=(r,span,h0)=>{const pts=[W(s.x,s.y,.3)];for(let i=0;i<=32;i++){const a=h0-span+i/32*span*2;const rr=r*RANGE+b/2/Math.max(.72,Math.cos(Math.min(Math.PI/4,Math.abs(normA(a-h0)))));pts.push(W(s.x+Math.cos(a)*rr,s.y+Math.sin(a)*rr,.3))}return pts};
  const span=arc==='T'?Math.PI:Math.PI/4;
  for(let r=3;r>=1;r--){if(r>rmax)continue;const pts=mk(r,span,s.h);const v=[],uv=[];for(let i=1;i<pts.length-1;i++){v.push(pts[0].x,pts[0].y,pts[0].z,pts[i].x,pts[i].y,pts[i].z,pts[i+1].x,pts[i+1].y,pts[i+1].z);uv.push(0,0,1,0,1,0)}
    const shp=new THREE.BufferGeometry();shp.setAttribute('position',new THREE.Float32BufferAttribute(v,3));shp.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    g.add(new THREE.Mesh(shp,new THREE.ShaderMaterial({uniforms:{col:{value:new THREE.Color(col)},op:{value:.05+.035*(4-r)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform vec3 col;uniform float op;varying vec2 vUv;void main(){float a=op*(.5+.5*vUv.x)+pow(vUv.x,18.)*.35;gl_FragColor=vec4(col*a,1.);\n#include <colorspace_fragment>\n}'})));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.slice(1)),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false})))}
  const e=mk(3,span,s.h);g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([e[1],e[0],e[e.length-1]]),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false})));return g}
// an animated dashed laser line for firing lanes
function laneMesh(a,b,col){const d=b.clone().sub(a);const L=d.length();const g=new THREE.PlaneGeometry(L,.35);g.translate(L/2,0,0);g.rotateX(-PI/2);const m=new THREE.Mesh(g,new THREE.ShaderMaterial({uniforms:{col:{value:new THREE.Color(col)},t:V3.tU||(V3.tU={value:0}),L:{value:L}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 col;uniform float t,L;varying vec2 vUv;void main(){float e=1.-abs(vUv.y-.5)*2.;float dash=step(.45,fract(vUv.x*L*.6-t*1.5));float a=(pow(e,3.)*.9+pow(e,12.)*.8)*(.35+.65*dash);gl_FragColor=vec4(col*a*1.6,1.);\n#include <colorspace_fragment>\n}'}));
  m.position.copy(a);m.rotation.y=-Math.atan2(d.z,d.x);return m}
function drawGuides(){clearGuides();if(!G)return;const sel=UI.sel&&ship(UI.sel);
  if(G.phase==='plan'&&sel&&sel.alive&&myPlanShip(sel)&&!(typeof sumPending==='function'&&sumPending())){const b=B(sel);const show=UI.hoverDial!=null?[UI.hoverDial]:UI.draft&&UI.draft[sel.id]!=null?[UI.draft[sel.id]]:sel.dial!=null&&sel.dial!=='set'?[sel.dial]:[];
    // phones: no fan of every maneuver over the mat (testers found it a jumble); show the suggested one until the player picks
    if(!show.length&&typeof PHN!=='undefined'&&PHN.on&&UI.hints&&typeof suggestDial==='function')show.push(suggestDial(sel));
    dialOf(sel).forEach((m,i)=>{if(show.length&&!show.includes(i))return;const col=m.c==='r'?0xff4a4a:m.c==='g'?0x4aff8a:0xdfe8ff;const tp=tplPoints(sel,b,m,4);V3.guide.add(ribbon(tp,col,show.length?.85:.2));
      const fp=finalPose(sel,b,m);V3.guide.add(outline(fp,b,col,show.length?.95:.25))});
    if(!show.length&&UI.hints&&typeof suggestDial==='function'){const sg=suggestDial(sel);V3.guide.add(outline(finalPose(sel,b,dialOf(sel)[sg]),b,0x7fd4ff,.95))}}
  if(sel&&sel.alive&&(G.phase==='target'||G.phase==='action'||UI.showArcs))V3.guide.add(arcFan(sel,sel.arc,3,sel.side===0?0xffa24f:0xff4f6a));
  if(G.phase==='action'&&sel&&G.cur===sel.id&&UI.hoverAct){const a=actionsFor(sel).find(x=>x.a===UI.hoverAct.a);if(a&&a.opts)a.opts.forEach((o,i)=>{if(UI.hoverAct.i!=null&&UI.hoverAct.i!==i)return;V3.guide.add(outline(o.p,B(sel),0x66ddff,.9))})}
  if(G.phase==='ask'&&G.q)G.q.opts.forEach((o,i)=>{if(!o.p)return;const on=UI.hoverAct&&UI.hoverAct.a==='Q'&&UI.hoverAct.i===i;V3.guide.add(outline(o.p,o.b||40,0x66ddff,on?.95:.35))});
  if(G.phase==='target'&&G.cur){const s=ship(G.cur);for(const w of weaponsFor(s))for(const t of w.targets){V3.guide.add(laneMesh(W(t.q.x,t.q.y,2),W(t.p.x,t.p.y,2),t.obstructed?0xffcc55:0xff5566))}}}
function myPlanShip(s){return G.phase==='plan'&&isHuman(s.side)&&s.side===planSide()}
// ---- labels ----
function tags3D(){const box=document.getElementById('tags');if(!box)return;for(const s of G.ships){let el=V3.labels[s.id];if(!el){el=V3.labels[s.id]=document.createElement('div');el.className='tag s'+s.side;box.appendChild(el)}
    if(!s.alive){el.style.display='none';continue}const hp=s.hull-hullDmg(s);
    el.title=s.name;el.innerHTML=`<b>${esc(typeof shortName==='function'?shortName(s):s.name)}</b><span><em class="ps">${psOf(s)}</em> <em class="h" title="hull left">♥${hp}</em>${s.shMax?` <em class="sh" title="shields left">◈${s.sh}</em>`:''}${s.stress?` <em class="st">!${s.stress}</em>`:''}${s.focus?' <em class="f">◉</em>':''}${s.evade?' <em class="e">✦</em>':''}${[s.tl,s.tl2].filter(x=>x&&ship(x)).map(x=>` <em class="l">⌖${esc(ship(x).name.split(' ')[0])}</em>`).join('')}${s.ion?' <em class="io">ion</em>':''}${G.phase==='plan'&&s.dial!=null?' <em class="dl">▣</em>':''}</span>`;
    el.classList.toggle('on',G.cur===s.id&&G.phase!=='plan');el.classList.toggle('sel',UI.sel===s.id);
    const tg=G.phase==='target'&&G.cur&&typeof humanTurn==='function'&&humanTurn()&&weaponsFor(ship(G.cur)).some(w=>w.targets.some(t=>t.id===s.id));el.classList.toggle('tgt',!!tg);if(tg)el.insertAdjacentHTML('beforeend','<em class="tgl">can be shot</em>')}}
// ---- camera: drag to orbit, right-drag or two fingers to pan, wheel/pinch to zoom ----
function bindCamera(cv){const P={};cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);P[e.pointerId]={x:e.clientX,y:e.clientY,b:e.button,x0:e.clientX,y0:e.clientY,t:performance.now()}});
  cv.addEventListener('pointermove',e=>{const p=P[e.pointerId];if(!p)return;const ids=Object.keys(P);const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;const C=V3.cam;V3.ez=null;
    if(ids.length===2){const o=P[ids.find(i=>i!=e.pointerId)];const d0=Math.hypot(p.x-dx-o.x,p.y-dy-o.y),d1=Math.hypot(p.x-o.x,p.y-o.y);C.dist=Math.max(35,Math.min(maxDist(),C.dist*d0/Math.max(1,d1)));panBy(dx/2,dy/2);if(window.PHN&&PHN.on)PHN.clamp();return}
    if(window.PHN&&PHN.on){if(Math.hypot(e.clientX-p.x0,e.clientY-p.y0)>8)panBy(dx,dy);PHN.clamp();return}if(p.b===2||e.shiftKey)panBy(dx,dy);else{C.yaw-=dx*.005;C.pitch=Math.max(.25,Math.min(1.45,C.pitch+dy*.004))}});
  const up=e=>{const p=P[e.pointerId];delete P[e.pointerId];if(p&&Math.hypot(e.clientX-p.x0,e.clientY-p.y0)<6&&performance.now()-p.t<500)onClick3D(e)};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',e=>delete P[e.pointerId]);
  cv.addEventListener('wheel',e=>{e.preventDefault();V3.ez=null;V3.cam.dist=Math.max(35,Math.min(maxDist(),V3.cam.dist*(1+Math.sign(e.deltaY)*.1)))},{passive:false});cv.addEventListener('contextmenu',e=>e.preventDefault())}
function panBy(dx,dy){const C=V3.cam,k=C.dist/900;C.tx-=(Math.cos(C.yaw)*dx+Math.sin(C.yaw)*dy)*k*1.2;C.tz-=(-Math.sin(C.yaw)*dx+Math.cos(C.yaw)*dy)*k*1.2;C.tx=Math.max(-10,Math.min(100,C.tx));C.tz=Math.max(-10,Math.min(100,C.tz))}
const maxDist=()=>Math.max(220,V3.fitDist*1.6);
// place the camera from the orbit state (C) and optional shake
function placeCam(sx,sy,C){C=C||V3.cam;V3.camera.position.set(C.tx+Math.sin(C.yaw)*Math.cos(C.pitch)*C.dist+(sx||0),Math.sin(C.pitch)*C.dist+(sy||0),C.tz+Math.cos(C.yaw)*Math.cos(C.pitch)*C.dist);V3.camera.lookAt(C.tx,0,C.tz)}
// fit the camera so the whole 91.4 x 91.4 mat (plus the height of the ships' name plates) fills the board at any aspect ratio
function fitCam(k){if(!V3.camera)return;const C=V3.cam,cam=V3.camera,top=k==='top';const asp=V3.camera.aspect||1.6;// online, side 1 sees the mat from its own edge
  const yaw=typeof NET!=='undefined'&&NET.on&&NET.mySide===1?Math.PI:0,sg=Math.cos(yaw);const phn=window.PHN&&PHN.on;Object.assign(C,{yaw,pitch:phn?1.52:top?1.45:.98+Math.max(0,Math.min(1,(1.45-asp)/.5))*.22,tx:45.7,tz:45.7,dist:C.dist||122});
  const pts=[];for(const x of [0,91.4])for(const z of [0,91.4])for(const y of (top?[0]:[0,9]))pts.push(new THREE.Vector3(x,y,z));const lim=phn?.985:.95;
  for(let it=0;it<60;it++){placeCam();cam.updateMatrixWorld();let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const p of pts){const q=p.clone().project(cam);a=Math.min(a,q.x);b=Math.max(b,q.x);c=Math.min(c,q.y);d=Math.max(d,q.y)}
    const ext=Math.max((b-a)/2,(d-c)/2)/lim;C.dist*=1+(ext-1)*.8;C.tz-=sg*(c+d)/2*25;C.tx+=sg*(a+b)/2*25;if(Math.abs(ext-1)<.002&&Math.abs(c+d)<.004)break}
  V3.fitDist=C.dist}
// switching views eases the camera over ~0.7 s (instant with reduced motion); resizes snap so the mat always fits
function camView(k){if(window.PHN&&PHN.on)k='top';const from=V3.camera&&V3.on?Object.assign({},V3.cam):null;V3.view=k;if(typeof UI!=='undefined')UI.top=k==='top';fitCam(k);
  if(from&&V3.on&&!reduceMotion()){V3.ez={from,t0:performance.now(),dur:700}}}
function reduceMotion(){try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}
function onClick3D(e){if(window.PHN&&PHN.on&&PHN.tap(e))return;const c=V3.r.domElement,r=c.getBoundingClientRect();const m=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);const rc=new THREE.Raycaster();rc.setFromCamera(m,V3.camera);
  const picks=Object.values(V3.ships).filter(g=>g.visible).map(g=>g.userData.pick);const h=rc.intersectObjects(picks)[0];if(h&&typeof uiAct==='function'){uiAct({ship:h.object.userData.ship});return}
  const pt=new THREE.Vector3();if(typeof matPick==='function'&&rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),pt))matPick(pt.x*10,MAT-pt.z*10)}
// the canvas fills the whole board (width AND height); the camera is refitted to the new aspect ratio
function resize3D(){if(!V3.r)return;const el=V3.r.domElement.parentElement;const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);if(w===V3.w&&h===V3.h)return;V3.w=w;V3.h=h;
  V3.r.setSize(w,h,false);V3.camera.aspect=w/h;V3.camera.fov=w/h<1?50:42;V3.camera.updateProjectionMatrix();fitCam(V3.view);V3.ez=null;placeCam();sizePost();renderFrame()}// draw at once: a resized canvas is blank until the next frame
// ---- post-processing (High): HDR scene in an MSAA target, soft-knee bright pass, three-level blur, bloom + vignette + grade + dither ----
function makePost(){const P={};const hf={type:THREE.HalfFloatType,depthBuffer:false};
  P.rt=new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,samples:4});P.lv=[0,1,2].map(()=>({a:new THREE.WebGLRenderTarget(4,4,hf),b:new THREE.WebGLRenderTarget(4,4,hf)}));
  P.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);P.scene=new THREE.Scene();P.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));P.quad.frustumCulled=false;P.scene.add(P.quad);
  P.bright=new THREE.ShaderMaterial({uniforms:{t:{value:null},px:{value:new THREE.Vector2()},th:{value:1.1}},vertexShader:PQV,depthTest:false,depthWrite:false,toneMapped:false,
    fragmentShader:'uniform sampler2D t;uniform vec2 px;uniform float th;varying vec2 vUv;void main(){vec3 c=(texture2D(t,vUv+px*vec2(-.5,-.5)).rgb+texture2D(t,vUv+px*vec2(.5,-.5)).rgb+texture2D(t,vUv+px*vec2(-.5,.5)).rgb+texture2D(t,vUv+px*vec2(.5,.5)).rgb)*.25;float l=max(c.r,max(c.g,c.b));float k=smoothstep(th,th*2.,l);gl_FragColor=vec4(min(c*k,vec3(16.)),1.);}'});
  P.blur=new THREE.ShaderMaterial({uniforms:{t:{value:null},dir:{value:new THREE.Vector2()}},vertexShader:PQV,depthTest:false,depthWrite:false,toneMapped:false,
    fragmentShader:'uniform sampler2D t;uniform vec2 dir;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb*.227;c+=(texture2D(t,vUv+dir*1.385).rgb+texture2D(t,vUv-dir*1.385).rgb)*.316;c+=(texture2D(t,vUv+dir*3.231).rgb+texture2D(t,vUv-dir*3.231).rgb)*.07;gl_FragColor=vec4(c,1.);}'});
  P.comp=new THREE.ShaderMaterial({uniforms:{tS:{value:null},b0:{value:null},b1:{value:null},b2:{value:null},str:{value:.75},vig:{value:.42},time:{value:0}},vertexShader:PQV,depthTest:false,depthWrite:false,
    fragmentShader:`uniform sampler2D tS,b0,b1,b2;uniform float str,vig,time;varying vec2 vUv;
      void main(){vec3 c=texture2D(tS,vUv).rgb;vec3 b=texture2D(b0,vUv).rgb*.5+texture2D(b1,vUv).rgb*.8+texture2D(b2,vUv).rgb*1.2;c+=b*str;
        float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.08);c*=mix(vec3(.96,.98,1.06),vec3(1.05,1.,.95),smoothstep(.05,.8,l));
        vec2 q=vUv-.5;c*=1.-vig*smoothstep(.28,.9,length(q*vec2(1.15,1.)));
        gl_FragColor=vec4(c,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        gl_FragColor.rgb+=(fract(sin(dot(gl_FragCoord.xy+time,vec2(12.9898,78.233)))*43758.5453)-.5)/255.;}`});
  V3.P=P;sizePost()}
function sizePost(){const P=V3.P;if(!P)return;const s=V3.r.getDrawingBufferSize(new THREE.Vector2());const w=Math.max(4,s.x|0),h=Math.max(4,s.y|0);if(P.w===w&&P.h===h)return;P.w=w;P.h=h;P.rt.setSize(w,h);
  P.lv.forEach((L,i)=>{const d=2<<i;L.a.setSize(Math.max(2,w/d|0),Math.max(2,h/d|0));L.b.setSize(Math.max(2,w/d|0),Math.max(2,h/d|0))})}
function disposePost(){const P=V3.P;if(!P)return;P.rt.dispose();P.lv.forEach(L=>{L.a.dispose();L.b.dispose()});[P.bright,P.blur,P.comp].forEach(m=>m.dispose());V3.P=null}
function pass(mat,target){const P=V3.P;P.quad.material=mat;V3.r.setRenderTarget(target);V3.r.render(P.scene,P.cam)}
function renderFrame(){const r=V3.r,cam=V3.camera;r.info.autoReset=false;r.info.reset();/* PerfHUD reads draws and triangles for the whole frame */if(!V3.post){r.setRenderTarget(null);r.render(V3.scene,cam);return}
  if(!V3.P)makePost();sizePost();const P=V3.P;r.setRenderTarget(P.rt);r.render(V3.scene,cam);let src=P.rt.texture,sw=P.w,sh=P.h;
  P.lv.forEach((L,i)=>{const w=L.a.width,h=L.a.height;if(i===0){P.bright.uniforms.t.value=src;P.bright.uniforms.px.value.set(1/sw,1/sh);pass(P.bright,L.a);src=L.a.texture}
    P.blur.uniforms.t.value=src;P.blur.uniforms.dir.value.set(1/w,0);pass(P.blur,L.b);P.blur.uniforms.t.value=L.b.texture;P.blur.uniforms.dir.value.set(0,1/h);pass(P.blur,L.a);src=L.a.texture});
  const u=P.comp.uniforms;u.tS.value=P.rt.texture;u.b0.value=P.lv[0].a.texture;u.b1.value=P.lv[1].a.texture;u.b2.value=P.lv[2].a.texture;u.time.value=(V3.t*60)%100;pass(P.comp,null)}
// ---- offscreen portraits: 3D eight-sided dice faces (for the dice rows) and ship art (for the pilot cards), tone-mapped on the CPU ----
function portrait(obj,cam,S,lights){const r=V3.r;const rt=new THREE.WebGLRenderTarget(S,S,{type:THREE.FloatType,samples:r.capabilities.isWebGL2?4:0});const ps=new THREE.Scene();ps.environment=V3.env;
  (lights||[[0x9fb0ff,0x201030,1.2,'h'],[0xfff0dc,4,[-3,6,5]],[0xff4f9a,2.6,[5,2,-4]],[0x4fb8ff,2,[-5,1,-4]]]).forEach(L=>{if(L[3]==='h')ps.add(new THREE.HemisphereLight(L[0],L[1],L[2]));else{const d=new THREE.DirectionalLight(L[0],L[1]);d.position.set(...L[2]);ps.add(d)}});ps.add(obj);
  const buf=new Float32Array(S*S*4);const ex=r.toneMappingExposure/.6;const cc=r.getClearColor(new THREE.Color()),ca=r.getClearAlpha();const sh=r.shadowMap.enabled;r.shadowMap.enabled=false;r.setClearColor(0,0);r.setRenderTarget(rt);r.clear();r.render(ps,cam);r.readRenderTargetPixels(rt,0,0,S,S,buf);r.setRenderTarget(null);r.setClearColor(cc,ca);r.shadowMap.enabled=sh;ps.remove(obj);rt.dispose();
  const aces=(R,G,B)=>{R*=ex;G*=ex;B*=ex;let r1=.59719*R+.35458*G+.04823*B,g1=.076*R+.90834*G+.01566*B,b1=.0284*R+.13383*G+.83777*B;const f=v=>(v*(v+.0245786)-.000090537)/(v*(.983729*v+.432951)+.238081);r1=f(r1);g1=f(g1);b1=f(b1);
    return [1.60475*r1-.53108*g1-.07367*b1,-.10208*r1+1.10813*g1-.00605*b1,-.00327*r1-.07276*g1+1.07602*b1].map(v=>{v=Math.max(0,Math.min(1,v));return 255*(v<=.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-.055)})};
  const c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');const img=x.createImageData(S,S);
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const s=((S-1-j)*S+i)*4,d=(j*S+i)*4;const a=Math.max(0,Math.min(1,buf[s+3]));if(a<=0)continue;const [R,G,B]=aces(buf[s]/a,buf[s+1]/a,buf[s+2]/a);img.data[d]=R;img.data[d+1]=G;img.data[d+2]=B;img.data[d+3]=a*255}
  x.putImageData(img,0,0);return c.toDataURL('image/png')}
// the eight-sided die: an octahedron (flattened like the real ones) with each face's symbol engraved: recessed via a normal map and paint-filled
const DIE_SYM={hit:'hit',crit:'crit',focus:'focus',evade:'evade',blank:''};
function symPath(x,k,s){x.save();x.scale(s,s);x.beginPath();
  if(k==='hit'){for(let i=0;i<16;i++){const a=i/16*Math.PI*2-Math.PI/2,r=i%2?.42:1;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath()}
  else if(k==='crit'){for(let i=0;i<8;i++){const a=i/8*Math.PI*2-Math.PI/2,r=i%2?.3:1;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.moveTo(.22,0);x.arc(0,0,.22,0,Math.PI*2,true)}
  else if(k==='focus'){x.arc(0,0,.9,0,Math.PI*2);x.moveTo(.52,0);x.arc(0,0,.52,0,Math.PI*2,true);x.moveTo(.26,0);x.arc(0,0,.26,0,Math.PI*2)}
  else if(k==='evade'){x.moveTo(0,-1);x.quadraticCurveTo(.12,-.12,1,0);x.quadraticCurveTo(.12,.12,0,1);x.quadraticCurveTo(-.12,.12,-1,0);x.quadraticCurveTo(-.12,-.12,0,-1);x.closePath()}
  x.restore()}
function dieFaceTex(kind,face,col){const S=256;const tri=(x)=>{x.beginPath();x.moveTo(S/2,S*.06);x.lineTo(S*.97,S*.9);x.lineTo(S*.03,S*.9);x.closePath()};
  const map=canvasTex(S,S,(x)=>{const g=x.createLinearGradient(0,0,S,S);g.addColorStop(0,col[0]);g.addColorStop(1,col[1]);x.fillStyle=g;x.fillRect(0,0,S,S);x.globalAlpha=.08;for(let i=0;i<400;i++){x.fillStyle=i%2?'#fff':'#000';x.beginPath();x.arc(Math.random()*S,Math.random()*S,Math.random()*6,0,7);x.fill()}x.globalAlpha=1;
    if(DIE_SYM[face]){x.save();x.translate(S/2,S*.6);x.fillStyle=col[2];symPath(x,face,S*.2);x.fill('evenodd');x.restore()}});
  const H=new Float32Array(S*S).fill(1);if(DIE_SYM[face]){const c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,S,S);x.filter='blur(2px)';x.translate(S/2,S*.6);x.fillStyle='#fff';symPath(x,face,S*.2);x.fill('evenodd');const d=x.getImageData(0,0,S,S).data;for(let i=0;i<S*S;i++)H[i]=1-d[i*4]/255*.9}
  return {map,nor:normalFromHeight(H,S,6)}}
function dieMesh(kind,face){const col=kind==='atk'?['#e1283c','#7a0a18','#fff4ea']:['#1fae5c','#0a4a26','#f0fff4'];const g=new THREE.OctahedronGeometry(1,0);
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,1,1).normalize(),new THREE.Vector3(0,0,1));const up=new THREE.Vector3(0,1,0).applyQuaternion(q);const roll=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.atan2(up.x,up.y));q.premultiply(roll);
  g.applyQuaternion(q);g.scale(1,1.12,1);const P=g.attributes.position,U=new Float32Array(P.count*2);const faces=[];let front=0,best=-9;
  for(let f=0;f<P.count/3;f++){const c=new THREE.Vector3();for(let k=0;k<3;k++)c.add(new THREE.Vector3().fromBufferAttribute(P,f*3+k));if(c.z>best){best=c.z;front=f}faces.push(c)}
  for(let f=0;f<P.count/3;f++){// project each face onto its own plane; the front face projects straight onto x/y (upright)
    const n=faces[f].clone().normalize();const ax=Math.abs(n.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0);const t=new THREE.Vector3().crossVectors(ax,n).normalize(),b=new THREE.Vector3().crossVectors(n,t);
    const pts=[0,1,2].map(k=>{const v=new THREE.Vector3().fromBufferAttribute(P,f*3+k).sub(faces[f].clone().multiplyScalar(1/3));return f===front?[v.x,v.y]:[-v.dot(t),v.dot(b)]});
    pts.forEach(([x,y],k)=>{U[(f*3+k)*2]=.5+x*.47;U[(f*3+k)*2+1]=.37+y*.47*.93})}
  g.setAttribute('uv',new THREE.BufferAttribute(U,2));g.computeVertexNormals();
  const others=kind==='atk'?['hit','focus','crit','blank','hit','blank','focus']:['evade','focus','blank','evade','blank','focus','evade'];let oi=0;const mats=[];
  for(let f=0;f<8;f++){const T=dieFaceTex(kind,f===front?face:others[oi++],col);mats.push(new THREE.MeshPhysicalMaterial({map:T.map,normalMap:T.nor,normalScale:new THREE.Vector2(1.4,1.4),roughness:.22,metalness:0,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.2}));g.addGroup(f*3,3,f)}
  return new THREE.Mesh(g,mats)}
function makePortraits(){if(!V3.on||V3.portraitsDone)return;V3.portraitsDone=true;if(V3.soft&&!V3.pinned)return;/* software GL: each readback blocks ~0.25 s and delays the first taps; the SVG dice stay */const cssR=[],urls=[];const dcam=new THREE.PerspectiveCamera(30,1,.1,50);
  // find which octahedron face looks at the camera and orient the die so that face is face 0
  for(const kind of ['atk','def'])for(const face of ['hit','crit','focus','evade','blank']){if(kind==='atk'&&face==='evade'||kind==='def'&&(face==='hit'||face==='crit'))continue;const m=dieMesh(kind,face);
    m.rotation.set(-.12,.22,.05);dcam.position.set(0,.3,4.4);dcam.lookAt(0,0,0);const url=portrait(m,dcam,112);m.geometry.dispose();[].concat(m.material).forEach(q=>{q.map.dispose();q.normalMap.dispose();q.dispose()});cssR.push(`.dice3d .die.${kind}.${face}{background-image:url(${url})}`);urls.push(url)}
  const st=document.createElement('style');st.id='dice3d';st.textContent=cssR.join('\n');document.head.appendChild(st);
  // decode every face first and keep the images referenced, so a re-rendered dice row never paints blank; the SVG dice stay until then
  V3.diceImgs=urls.map(u=>{const im=new Image();im.src=u;return im});Promise.all(V3.diceImgs.map(im=>im.decode?im.decode().catch(()=>{}):Promise.resolve())).then(()=>document.body.classList.add('dice3d'));
  // ship art for the pilot cards (one per model and faction colour set)
  V3.art={};const scam=new THREE.PerspectiveCamera(28,1,.1,80);scam.position.set(4.2,3.4,8.2);scam.lookAt(0,-.2,0);
  const todo=[];for(const t in SHIPS){const T=SHIPS[t];for(const col of [0,1,2])todo.push([t,col])}
  const next=()=>{const it=todo.shift();if(!it){if(typeof renderRoster==='function')try{renderRoster()}catch(e){}return}const [t,col]=it;const T=SHIPS[t];try{const m=(MODELS[T.model]||MODELS.lance)(FACCOL[col]);const bb=new THREE.Box3().setFromObject(m);const sz=bb.getSize(new THREE.Vector3()).length();m.scale.setScalar(5.2/sz);const ct=new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());m.position.sub(ct);m.rotation.y=.35;
      V3.art[t+':'+col]=portrait(m,scam,160)}catch(e){}setTimeout(next,16)};
  if(!V3.soft||V3.pinned)setTimeout(next,200)}
function shipArt(s){const k=s&&V3.art?V3.art[s.type+':'+FACTIONS[G.fac[s.side]].col]:null;return k||null}
// ---- animation loop ----
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const _v=new THREE.Vector3(),_m4=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_s=new THREE.Vector3();
function loop3D(now){(PH?PH.raf:requestAnimationFrame)(loop3D);if(!V3.on)return;V3.frames++;const raw=(now-V3.clock)/1000;const dt=Math.min(.05,raw);V3.clock=now;V3.t+=dt;const t=V3.t;const reduce=reduceMotion();
  if(V3.tU)V3.tU.value=t;if(V3.gridMat)V3.gridMat.uniforms.t.value=t;(V3.starMats||[]).forEach(m=>{m.uniforms.t.value=t;m.uniforms.px.value=V3.r.getPixelRatio()});
  if(V3.gas&&!reduce)V3.gas.children.forEach(s=>s.material.rotation+=s.userData.spin*dt);if(V3.planet)V3.planet.rotation.y+=dt*.004;
  for(let i=V3.later.length-1;i>=0;i--){if(now>=V3.later[i].t){const f=V3.later[i].fn;V3.later.splice(i,1);try{f()}catch(e){}}}
  const cur=G&&G.cur,sel=typeof UI!=='undefined'?UI.sel:null;let nMove=0,easing=false;
  for(const id in V3.ships){const m=V3.ships[id],a=V3.anim[id];const s=G?ship(id):null;const U=m.userData;// G is null in an online lobby between battles
    if(a&&a.boom){if(now<a.t0)continue;const k=(now-a.t0)/a.dur;U.mdl.scale.multiplyScalar(.95);U.mdl.rotation.x+=dt*6;U.mdl.rotation.z+=dt*3;if(k>.25)U.mdl.visible=false;if(k>=1){m.visible=false;delete V3.anim[id]}continue}
    let moving=false;if(a&&a.path)nMove++;
    if(a&&a.path&&a.path.length<2){delete V3.anim[id]}
    else if(a&&a.path){moving=true;const k=Math.min(1,(now-a.t0)/a.dur),u=ease(k)*(a.path.length-1),i=Math.min(a.path.length-2,Math.floor(u)),f=u-i,p=a.path[i],q=a.path[i+1]||p;
      m.position.copy(W(p.x+(q.x-p.x)*f,p.y+(q.y-p.y)*f));let dh=normA(q.h-p.h);m.rotation.y=p.h+dh*f;if(U.mdl)U.mdl.rotation.x=-dh*2*Math.sin(k*Math.PI);
      if(k>=1){delete V3.anim[id];U.land=1;if(s){m.position.copy(W(s.x,s.y));m.rotation.y=s.h}if(!reduce)puff(m.position,0x6a7aa0,5)}}
    // idle: gentle bob, a landing dip after each move, engines flare while flying
    let y=3.6;if(!reduce){y+=Math.sin(t*1.4+U.bob)*.2;if(U.land>0){U.land=Math.max(0,U.land-dt*2.4);y-=Math.sin(U.land*Math.PI)*.55}}y+=U.sel*.6;if(U.mdl)U.mdl.position.y=y;
    const boost=moving?1.6:1;if(U.mdl&&U.mdl.userData.eng)U.mdl.userData.eng.forEach(e=>{const fl=reduce?1:.88+.12*Math.sin(t*37+e.ph)+.06*Math.sin(t*71+e.ph*2);e.pl.scale.set(boost*fl,1,1);e.s.material.opacity=(V3.post?.3:.6)*fl;e.s2.material.opacity=(V3.post?.35:.6)*fl});
    if(U.mdl&&U.mdl.userData.lamps)U.mdl.userData.lamps.forEach(l=>{if(l.blink)l.s.material.opacity=reduce?.7:(Math.sin(t*3+l.ph*2)>.6?1:.18)});
    // selection / active glow on the base rim
    const want=cur===id&&G.phase!=='plan'?1:sel===id?.7:0;U.sel+=(want-U.sel)*Math.min(1,dt*8);if(Math.abs(want-U.sel)>.01||U.land>0)easing=true;U.rim.material.opacity=.4+U.sel*(.5+(reduce?0:.25*Math.sin(t*5)));U.rim.scale.setScalar(1+U.sel*.06);
    const u=U.shield.material.uniforms;if(u.amp.value>0){easing=true;u.amp.value=Math.max(0,u.amp.value-dt*.9/(V3.slowmo||1));u.t.value=t}U.shield.visible=u.amp.value>.002}
  V3.rocks.forEach(r=>{const U=r.userData;if(!reduce){r.rotation.y=Math.sin(t*.05+U.ph)*.06;r.rotation.x=Math.sin(t*.07+U.ph)*.04;r.position.y=U.y0+Math.sin(t*.4+U.ph)*.15}
    const pb=U.pebbles;if(pb){pb.userData.p.forEach((p,i)=>{if(!reduce)p.a+=p.sp*dt;_v.set(r.position.x+Math.cos(p.a)*p.d,r.position.y+p.y,r.position.z+Math.sin(p.a)*p.d);_e.set(p.rx+t*p.sp,p.ry+t*p.sp*.7,0);_q.setFromEuler(_e);_s.setScalar(p.s);_m4.compose(_v,_q,_s);pb.setMatrixAt(i,_m4)});pb.instanceMatrix.needsUpdate=true}});
  for(const id in (V3.bombs||{})){const b=V3.bombs[id];if(b.userData.lamp)b.userData.lamp.material.opacity=.5+.4*Math.sin(t*4);b.children[0].rotation.y+=dt*.5}
  for(let i=V3.fxq.length-1;i>=0;i--){const f=V3.fxq[i],k=(now-f.t0)/f.dur;if(k<0){f.o.visible=false;continue}f.o.visible=true;
    if(f.kind==='bolt'){f.o.position.lerpVectors(f.from,f.to,Math.min(1,k));f.o.lookAt(f.to);f.o.rotateX(Math.PI/2);if(k>=1){const e=f.to.clone();const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:flareTex(),color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));sp.position.copy(e);fxAdd(sp,220,'flash',{s:4})}}
    else if(f.kind==='spark'){f.o.position.addScaledVector(f.v,dt);f.v.multiplyScalar(.93);f.o.material.opacity=Math.max(0,1-k);f.o.scale.setScalar(f.s*(1-k*.6))}
    else if(f.kind==='flash'){f.o.scale.setScalar(f.s*(1+k*1.2));f.o.material.opacity=Math.max(0,1-k)}
    else if(f.kind==='fire'){f.o.position.addScaledVector(f.v,dt);f.v.multiplyScalar(.95);f.o.scale.setScalar(f.s*(1+k*f.g));f.o.material.opacity=Math.max(0,1-k);f.o.material.color.setRGB(1,.62-.4*k,.25-.2*k)}
    else if(f.kind==='puff'){f.o.position.addScaledVector(f.v,dt);f.v.multiplyScalar(.97);f.o.scale.setScalar(f.s*(1+k*f.g));f.o.material.opacity=Math.max(0,(1-k)*.5)}
    else if(f.kind==='ring'){f.o.scale.setScalar(.5+f.s*ease(Math.min(1,k)));f.o.material.opacity=Math.max(0,.75*(1-k)*(1-k))}
    else if(f.kind==='debris'){f.v.y-=9*dt;f.o.position.addScaledVector(f.v,dt);f.v.multiplyScalar(.985);if(f.o.position.y<.3){f.o.position.y=.3;f.v.y*=-.35;f.v.x*=.6;f.v.z*=.6}f.o.rotation.x+=f.w.x*dt;f.o.rotation.y+=f.w.y*dt;f.o.rotation.z+=f.w.z*dt;if(k>.8)f.o.scale.setScalar(Math.max(.01,(1-k)*5))}
    if(k>=1){V3.fxRoot.remove(f.o);f.o.traverse(o=>{if(o.geometry&&!o.isSprite)o.geometry.dispose()});V3.fxq.splice(i,1)}}
  if(V3.flashT>0){V3.flashT=Math.max(0,V3.flashT-dt*2.2);V3.flashL.intensity=V3.flashT*V3.flashT*2400}else V3.flashL.intensity=0;
  V3.shake=reduce?0:Math.max(0,V3.shake-dt*2);const sx=(Math.random()-.5)*V3.shake,sy=(Math.random()-.5)*V3.shake;
  if(V3.debugCam){V3.camera.position.copy(V3.debugCam.pos);V3.camera.lookAt(V3.debugCam.look)}
  else if(V3.ez){const e=V3.ez,k=Math.min(1,(now-e.t0)/e.dur),q=ease(k);const C={};for(const n of ['yaw','pitch','dist','tx','tz'])C[n]=e.from[n]+(V3.cam[n]-e.from[n])*q;placeCam(sx,sy,C);if(k>=1)V3.ez=null}
  else placeCam(sx,sy);
  renderFrame();
  // what the player should see smoothly: ship moves, bolts and explosions, delayed hits, camera glides and drags, shake, flash, the speed test
  const anyAnim=Object.keys(V3.anim).length>0;
  V3.busy=!!(anyAnim||easing||V3.fxq.length||V3.later.length||V3.ez||V3.drag||V3.shake>0||V3.flashT>0||PH&&PH.testing);
  engineBed(nMove>0);
  const L=[];for(const s of (G?G.ships:[])){const el=V3.labels[s.id],m=V3.ships[s.id];if(el&&m&&s.alive){placeEl(el,m.position.clone().add(new THREE.Vector3(0,8.4,0)));if(el.style.display!=='none')L.push({el,x:parseFloat(el.style.left),y:parseFloat(el.style.top),w:el.offsetWidth,h:el.offsetHeight})}}
  // name tags that would collide stack upwards instead of overlapping
  L.sort((a,b)=>b.y-a.y);const done=[];for(const t of L){for(let g=0;g<6;g++){const q=done.find(q=>Math.abs(t.x-q.x)<(t.w+q.w)/2+2&&t.y-t.h<q.y+2&&q.y-q.h<t.y+2);if(!q)break;t.y=q.y-q.h-2}t.y=Math.max(t.h,t.y);t.el.style.top=t.y+'px';done.push(t)}
  const ct=document.getElementById('coachtag');if(ct&&ct._v)placeEl(ct,ct._v);
  document.querySelectorAll('#tags .pop').forEach(el=>el._v&&placeEl(el,el._v))}

// While the title is up, build one of every material kind off-screen and compile its shaders, so the first Launch does not stall
// on rock textures and shader compilation (about a second on slow GPUs). No game state is touched.
function warm3D(){if(G||!V3.on||!V3.r)return;const g=new THREE.Group();
  try{const box=new THREE.BoxGeometry(1,1,1);const mk=m=>{const o=new THREE.Mesh(box,m);o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
    mk(new THREE.MeshPhysicalMaterial({color:0x0b0c10,roughness:.28,metalness:0,clearcoat:.8,clearcoatRoughness:.15}));
    mk(new THREE.MeshPhysicalMaterial({color:0xcfe6ff,roughness:.05,metalness:0,transparent:true,opacity:.28,clearcoat:1,envMapIntensity:2,depthWrite:false}));
    mk(new THREE.MeshStandardMaterial({map:ringTex(),roughness:.55,metalness:0}));
    mk(new THREE.MeshBasicMaterial({map:blobTex(),transparent:true,depthWrite:false,opacity:.8}));
    mk(new THREE.MeshBasicMaterial({map:ringTex(),transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));
    mk(shieldMat());rockMaps();mk(rockMat()).material.vertexColors=true;
    const im=new THREE.InstancedMesh(box,rockMat(),2);im.castShadow=true;g.add(im);
    const fc=FACCOL[Object.keys(FACCOL)[0]];Object.keys(MODELS).forEach(k=>{try{g.add(MODELS[k](fc))}catch(e){}});
    // guide overlays (path ribbons, base outlines, firing lanes, arc fans) use their own shaders
    const pts=[0,1,2].map(i=>({x:10+i*8,y:10,h:0}));
    [()=>ribbon(pts,0xffffff,.5),()=>outline({x:20,y:20,h:0},40,0xffffff,.5),()=>laneMesh(W(0,0,2),W(30,30,2),0xff5566),()=>arcFan({x:20,y:20,h:0,base:'S',type:Object.keys(SHIPS)[0]},'F',3,0xffa24f)].forEach(f=>{try{g.add(f())}catch(e){}});
    g.traverse(o=>{o.frustumCulled=false});V3.root.add(g);V3.r.compile(V3.scene,V3.camera);renderFrame()/* uploads the textures and buffers too */}catch(e){console.warn('warm',e)}
  finally{V3.root.remove(g)}}
