// ---------- Rampart & Vine in 3D (Three.js r158): printed cardboard tiles and wooden figures on a sunlit farmhouse table.
// The scene only mirrors G and UI; it never owns game state. Everything here is guarded: jsdom (no WebGL) never calls init3D past the first line.
const V3={on:false,t:0,tiles:{},protos:{},figs:{},tweens:[],pops:[],fx:[],marks:null,ghost:null,spots:null,look:null,dist:14,tilt:1.02,dirty:true,lastK:null,
  q:'high',pref:'auto',lockQ:false,slowT:0,okT:0,uTime:{value:0}};
const TS=2,TH=.16,U=TS/100;
const PCOL=['#c8372d','#2d62b8','#e2ae22','#3b8a45','#34323b','#a064c0'];
const PCOL3=PCOL.map(c=>parseInt(c.slice(1),16));
// ---------- graphics quality: High (post, 2k soft shadows), Medium (1k shadows, no post), Low (no shadows, no post, no idle animation) ----------
const GFX={high:{pr:2,sh:2048,post:true,anim:true,nm:'High'},med:{pr:1.5,sh:1024,post:false,anim:true,nm:'Medium'},low:{pr:1,sh:0,post:false,anim:false,nm:'Low'}};
const GFXQ=['high','med','low'];
function gfxAuto(){let small=false;try{small=Math.min(innerWidth,innerHeight)<600||(matchMedia('(pointer:coarse)').matches&&Math.max(innerWidth,innerHeight)<1200)}catch(e){}return small?'med':'high'}
function gfxPref(){try{const v=localStorage.getItem('rv_gfx');return GFX[v]?v:'auto'}catch(e){return 'auto'}}
V3.pref=gfxPref();
function setGfx(v){V3.pref=GFX[v]?v:'auto';try{localStorage.setItem('rv_gfx',V3.pref)}catch(e){}V3.lockQ=false;V3.prMul=1;applyQ(V3.pref==='auto'?gfxAuto():V3.pref)}
function applyQ(q){V3.q=GFX[q]?q:'high';V3.slowT=0;V3.okT=0;if(!V3.r)return;const c=GFX[V3.q],r=V3.r;
  r.setPixelRatio(Math.min(c.pr,window.devicePixelRatio||1)*(V3.prMul||1));
  const sh=c.sh>0;if(r.shadowMap.enabled!==sh){r.shadowMap.enabled=sh;V3.scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true)})}
  V3.sun.castShadow=sh;if(sh&&V3.sun.shadow.mapSize.x!==c.sh){V3.sun.shadow.mapSize.set(c.sh,c.sh);if(V3.sun.shadow.map){V3.sun.shadow.map.dispose();V3.sun.shadow.map=null}}
  lowMats(V3.q==='low');if(c.post&&!V3.post)V3.post=makePost();resize3D();V3.dirty=true;if(typeof onGfxChange==='function')onGfxChange()}
// Low: no reflections, no bump or linen normal maps (the costly per-pixel work), a brighter sky fill instead
function lowMats(low){if(V3.lowM===low)return;V3.lowM=low;const sc=V3.scene;sc.environment=low?null:V3.env;V3.hemi.intensity=low?1.05:.55;if(V3.tableM){V3.tableM.bumpMap=low?null:V3.tableM.map}
  const txs=new Set();const fix=m=>{if(m.userData.top)m.normalMap=low?null:linenNormal();for(const k of ['map','bumpMap','normalMap'])if(m[k])txs.add(m[k]);m.needsUpdate=true};sc.traverse(o=>{if(o.material)[].concat(o.material).forEach(fix)});for(const k in V3.protos)V3.protos[k].traverse(o=>{if(o.material)[].concat(o.material).forEach(fix)});if(V3.tableM)txs.add(V3.tableM.map);
  txs.forEach(t=>{const a=low?1:(V3.aniso||1);if(t.anisotropy!==a){t.anisotropy=a;t.needsUpdate=true}})}
// frames dropping badly for 3 s: step down one level (then, on Low, lower the resolution)
function stepDown(){const i=GFXQ.indexOf(V3.q);if(i<GFXQ.length-1){applyQ(GFXQ[i+1]);return}const pr=V3.r.getPixelRatio();if(pr>.55){V3.prMul=(V3.prMul||1)*.75;V3.r.setPixelRatio(Math.max(.5,pr*.75));resize3D()}V3.slowT=0}
function init3D(){if(!window.THREE||/jsdom/i.test(navigator.userAgent))return false;const cv=document.getElementById('c3');if(!cv)return false;
  let r;try{r=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});if(!r.getContext())return false}catch(e){return false}
  V3.r=r;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=.94;
  V3.aniso=Math.min(8,r.capabilities.getMaxAnisotropy());V3.texS=gfxAuto()==='high'?512:384;
  const sc=V3.scene=new THREE.Scene();
  const sky=document.createElement('canvas');sky.width=4;sky.height=256;const x=sky.getContext('2d');const gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#a9c9dc');gr.addColorStop(.5,'#f3dfbb');gr.addColorStop(1,'#d9b484');x.fillStyle=gr;x.fillRect(0,0,4,256);
  const st=new THREE.CanvasTexture(sky);st.colorSpace=THREE.SRGBColorSpace;sc.background=st;sc.fog=new THREE.Fog(0xe9d3ad,40,120);
  try{V3.env=sc.environment=envMap(r)}catch(e){}
  V3.cam=new THREE.PerspectiveCamera(30,1.6,.1,500);V3.look=new THREE.Vector3(0,0,0);
  // warm late-afternoon key light, cool sky fill, a pale rim from behind to lift the pieces off the board
  sc.add(V3.hemi=new THREE.HemisphereLight(0xdce8ff,0x8a6a48,.55));
  const sun=V3.sun=new THREE.DirectionalLight(0xffdcaa,3.0);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.00025;sun.shadow.normalBias=.012;sun.shadow.radius=3;sc.add(sun);sc.add(sun.target);
  const rim=V3.rim=new THREE.DirectionalLight(0xd6e4ff,.75);sc.add(rim);sc.add(rim.target);
  sc.add(makeTable());
  V3.plane=new THREE.Plane(new THREE.Vector3(0,1,0),-TH);V3.ray=new THREE.Raycaster();
  // input: drag = pan, wheel/pinch = zoom, tap = act
  const ptrs=new Map();
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});V3.drag={x:e.clientX,y:e.clientY,l:V3.look.clone(),moved:false,n:ptrs.size,d0:pinchD(ptrs),dist0:V3.dist}});
  cv.addEventListener('pointermove',e=>{if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});const d=V3.drag;
    if(!d){const h=cellAt(e);if(h!==V3.hover){V3.hover=h;V3.dirty=true}return}
    if(ptrs.size>=2){const pd=pinchD(ptrs);if(d.d0>0){V3.dist=clampDist(d.dist0*d.d0/pd);V3.userMoved=true;placeCam()}d.moved=true;return}
    const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)>7)d.moved=true;
    if(d.moved&&d.n===1){const k=V3.dist*.0016*(700/Math.max(300,V3.r.domElement.clientHeight));V3.look.set(d.l.x-dx*k,0,d.l.z-dy*k/Math.sin(V3.tilt));V3.camTo=null;V3.userMoved=true;placeCam()}});
  const up=e=>{ptrs.delete(e.pointerId);const d=V3.drag;if(!ptrs.size)V3.drag=null;if(d&&!d.moved&&d.n===1&&e.type==='pointerup'){const c=cellAt(e);const w=worldAt(e);if(typeof on3DTap==='function')on3DTap(c,w)}};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('pointerleave',()=>{if(V3.hover){V3.hover=null;V3.dirty=true}});
  cv.addEventListener('wheel',e=>{e.preventDefault();V3.userMoved=true;const to=clampDist((V3.camTo?V3.camTo.dist:V3.dist)*(1+Math.sign(e.deltaY)*.14));V3.camTo={look:(V3.camTo?V3.camTo.look:V3.look).clone(),dist:to,t:0}},{passive:false});
  V3.on=true;applyQ(V3.pref==='auto'?gfxAuto():V3.pref);
  new ResizeObserver(resize3D).observe(cv.parentElement);resize3D();document.body.classList.add('three');V3.clock=new THREE.Clock();requestAnimationFrame(loop3D);return true}
function pinchD(m){const a=[...m.values()];return a.length<2?0:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}
function clampDist(d){return Math.max(4.5,Math.min(120,d))}
function seeded(s){s=s>>>0||1;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
function placeCam(){const c=V3.cam,l=V3.look;c.position.set(l.x,l.y+Math.sin(V3.tilt)*V3.dist,l.z+Math.cos(V3.tilt)*V3.dist);c.lookAt(l);
  // sun low in the west-south-west: long soft shadows; the shadow box hugs what the camera sees
  const s=V3.sun;s.position.set(l.x-11,17,l.z+9);s.target.position.copy(l);const e=Math.min(40,V3.dist*.62+3);Object.assign(s.shadow.camera,{left:-e,right:e,top:e,bottom:-e,near:4,far:50});s.shadow.camera.updateProjectionMatrix();
  V3.rim.position.set(l.x+8,7,l.z-12);V3.rim.target.position.copy(l);
  const f=V3.scene.fog;f.near=V3.dist*1.4+12;f.far=V3.dist*4.5+70;
  if(V3.tableU){V3.tableU.look.value.copy(l);V3.tableU.rad.value=V3.dist*.62+5}V3.dirty=true}
function resize3D(){if(!V3.r)return;const el=V3.r.domElement.parentElement;const w=Math.max(50,el.clientWidth),h=Math.max(50,el.clientHeight);const big=V3.lastW&&(Math.abs(w-V3.lastW)>40||Math.abs(h-V3.lastH)>40);V3.lastW=w;V3.lastH=h;V3.r.setSize(w,h,false);V3.r.domElement.style.width=w+'px';V3.r.domElement.style.height=h+'px';V3.cam.aspect=w/h;V3.cam.updateProjectionMatrix();
  if(V3.post){const v=V3.r.getDrawingBufferSize(new THREE.Vector2());V3.post.setSize(v.x,v.y)}if(!V3.fitted||(big&&!V3.userMoved&&!V3.camTo))fitAll(true);placeCam()}
function cellWorld(x,y){return new THREE.Vector3(x*TS,0,y*TS)}
// fit every tile (and every glowing spot) into the view for this aspect ratio
function boardBounds(){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;const eat=k=>{const [x,y]=unkey(k);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)};
  if(G){for(const k of G.order)eat(k);for(const k of (UI.cells||[]))eat(k)}if(x0>x1){x0=x1=y0=y1=0}return {x0,x1,y0,y1}}
function fitAll(instant){if(!V3.cam)return;const b=boardBounds();const W=(b.x1-b.x0+1)*TS+.8,D=(b.y1-b.y0+1)*TS+.8;const a=V3.cam.aspect;const vf=V3.cam.fov*Math.PI/180;const hf=2*Math.atan(Math.tan(vf/2)*a);
  const e=V3.tilt;const needH=(D*Math.sin(e)+1.2)/2,needW=W/2;const d=Math.max(needH/Math.tan(vf/2),needW/Math.tan(hf/2))*1.02+D*Math.cos(e)*.12;
  const to=new THREE.Vector3((b.x0+b.x1)/2*TS,0,(b.y0+b.y1)/2*TS+.1);V3.userMoved=false;if(instant){V3.look.copy(to);V3.dist=clampDist(Math.max(10,d));V3.camTo=null;placeCam()}else{V3.camTo={look:to,dist:clampDist(Math.max(10,d)),t:0}}V3.fitted=true;V3.dirty=true}
function focusCell(k,zoom){if(!V3.on||!k)return;const [x,y]=unkey(k);const to=cellWorld(x,y);V3.camTo={look:to,dist:zoom?Math.min(V3.dist,zoom):V3.dist,t:0}}
function screenOf(v){const p=v.clone().project(V3.cam);const R=V3.r.domElement;return {x:(p.x+1)/2*R.clientWidth,y:(1-p.y)/2*R.clientHeight,in:Math.abs(p.x)<1&&Math.abs(p.y)<1}}
function ndc(e){const rc=V3.r.domElement.getBoundingClientRect();return new THREE.Vector2(((e.clientX-rc.left)/rc.width)*2-1,-((e.clientY-rc.top)/rc.height)*2+1)}
function worldAt(e){V3.ray.setFromCamera(ndc(e),V3.cam);const p=new THREE.Vector3();return V3.ray.ray.intersectPlane(V3.plane,p)?p:null}
function cellAt(e){const p=worldAt(e);if(!p)return null;return key(Math.round(p.x/TS),Math.round(p.z/TS))}
const GEOS={};function gq(k,f){return GEOS[k]||(GEOS[k]=f())}
function cvs(w,h){const c=document.createElement('canvas');c.width=w;c.height=h||w;return c}
function tex(c,srgb,rep){const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=V3.lowM?1:(V3.aniso||1);if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping}return t}
// tileable value noise (period P lattice cells) for procedural textures
const NZ=(()=>{const R=seeded(4242);return Float32Array.from({length:64*64},()=>R())})();
function vnoise(x,y,P){const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;const m=v=>((v%P)+P)%P;const a=NZ[m(y0)*64+m(x0)],b=NZ[m(y0)*64+m(x0+1)],c=NZ[m(y0+1)*64+m(x0)],d=NZ[m(y0+1)*64+m(x0+1)];const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}
function fbm(u,v,p){p=p||8;return vnoise(u*p,v*p,p)*.5+vnoise(u*p*2,v*p*2,p*2)*.3+vnoise(u*p*4,v*p*4,p*4)*.2}
// ---------- environment: a warm sky dome with a low sun, pre-filtered for reflections ----------
function envMap(r){const s=new THREE.Scene();const g=new THREE.SphereGeometry(20,48,24);const pos=g.attributes.position,col=new Float32Array(pos.count*3);
  const top=new THREE.Color('#7fa9d4'),hor=new THREE.Color('#fbe3bf'),bot=new THREE.Color('#5d4430'),c=new THREE.Color();
  for(let i=0;i<pos.count;i++){const y=pos.getY(i)/20;if(y>0)c.copy(hor).lerp(top,Math.pow(y,.55));else c.copy(hor).lerp(bot,Math.min(1,-y*4));c.toArray(col,i*3)}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));s.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
  const sunM=new THREE.Mesh(new THREE.SphereGeometry(2,16,8),new THREE.MeshBasicMaterial({color:new THREE.Color(14,11,8)}));sunM.position.set(-10,9,8);s.add(sunM);
  const box=new THREE.Mesh(new THREE.PlaneGeometry(14,14),new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1.55,1.45),side:THREE.DoubleSide}));box.position.set(0,16,0);box.rotation.x=Math.PI/2;s.add(box);
  const pm=new THREE.PMREMGenerator(r);const rt=pm.fromScene(s,.03);pm.dispose();return rt.texture}
// ---------- post-processing (High only): MSAA HDR target, soft bloom, ACES, warm grade, vignette ----------
function makePost(){const r=V3.r;const P={};const mk=()=>new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,depthBuffer:false});
  P.rt=new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,samples:r.capabilities.isWebGL2?4:0});P.a=mk();P.b=mk();
  P.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);P.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));P.quad.frustumCulled=false;P.sc=new THREE.Scene();P.sc.add(P.quad);
  const vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';const sm=(u,f)=>new THREE.ShaderMaterial({uniforms:u,vertexShader:vs,fragmentShader:f,depthTest:false,depthWrite:false});
  P.bright=sm({t:{value:null},th:{value:1.1}},'uniform sampler2D t;uniform float th;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(th,th*2.2,l),1.);}');
  P.blur=sm({t:{value:null},d:{value:new THREE.Vector2()}},'uniform sampler2D t;uniform vec2 d;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb*.2270;c+=(texture2D(t,vUv+d*1.3846).rgb+texture2D(t,vUv-d*1.3846).rgb)*.3162;c+=(texture2D(t,vUv+d*3.2308).rgb+texture2D(t,vUv-d*3.2308).rgb)*.0703;gl_FragColor=vec4(c,1.);}');
  P.fin=sm({t:{value:null},b:{value:null},ex:{value:1},bk:{value:.55},asp:{value:1}},`uniform sampler2D t,b;uniform float ex,bk,asp;varying vec2 vUv;
vec3 RRT(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 q=v*(.983729*v+.4329510)+.238081;return a/q;}
vec3 aces(vec3 c){const mat3 I=mat3(vec3(.59719,.07600,.02840),vec3(.35458,.90834,.13383),vec3(.04823,.01566,.83777));const mat3 O=mat3(vec3(1.60475,-.10208,-.00327),vec3(-.53108,1.10813,-.07276),vec3(-.07367,-.00605,1.07602));c*=ex/.6;c=I*c;c=RRT(c);c=O*c;return clamp(c,0.,1.);}
vec3 srgb(vec3 c){return mix(pow(c,vec3(.41666))*1.055-.055,c*12.92,vec3(lessThanEqual(c,vec3(.0031308))));}
void main(){vec3 c=texture2D(t,vUv).rgb+texture2D(b,vUv).rgb*bk;c=aces(c);
 float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.07);c*=vec3(1.015,1.,.97);c=mix(c,c*c*(3.-2.*c),.12);
 vec2 q=(vUv-.5)*vec2(asp,1.);float v=smoothstep(1.02,.32,length(q)*1.05);c*=mix(.74,1.,v);
 gl_FragColor=vec4(srgb(clamp(c,0.,1.)),1.);}`);
  P.setSize=(w,h)=>{P.rt.setSize(w,h);const hw=Math.max(2,w>>1),hh=Math.max(2,h>>1);P.a.setSize(hw,hh);P.b.setSize(hw,hh);P.w=w;P.h=h;P.fin.uniforms.asp.value=w/h};
  P.pass=(m,to)=>{P.quad.material=m;r.setRenderTarget(to);r.render(P.sc,P.cam)};
  P.render=()=>{r.setRenderTarget(P.rt);r.render(V3.scene,V3.cam);
    P.bright.uniforms.t.value=P.rt.texture;P.pass(P.bright,P.a);
    const hw=1/P.a.width,hh=1/P.a.height;for(const k of [1,2.2]){P.blur.uniforms.t.value=P.a.texture;P.blur.uniforms.d.value.set(hw*k,0);P.pass(P.blur,P.b);P.blur.uniforms.t.value=P.b.texture;P.blur.uniforms.d.value.set(0,hh*k);P.pass(P.blur,P.a)}
    P.fin.uniforms.t.value=P.rt.texture;P.fin.uniforms.b.value=P.a.texture;P.fin.uniforms.ex.value=r.toneMappingExposure;P.pass(P.fin,null)};
  return P}
function draw(){const r=V3.r;if(GFX[V3.q].post&&V3.post){V3.post.render()}else{r.setRenderTarget(null);r.render(V3.scene,V3.cam)}}
V3.draw=draw;
// ---------- the table: honey oak planks, waxed, with a pool of light that follows the view ----------
function makeTable(){const S=1024,c=cvs(S),x=c.getContext('2d');const R=seeded(31);const rows=4,ph=S/rows;
  for(let r=0;r<rows;r++){const y0=r*ph;const hue=28+R()*6,li=36+R()*7;x.fillStyle=`hsl(${hue},${44+R()*10}%,${li}%)`;x.fillRect(0,y0,S,ph);
    // long grain: wavy streaks of darker and lighter wood
    for(let k=0;k<120;k++){const yy=y0+R()*ph,amp=1+R()*5,f=.004+R()*.01,p=R()*6.3,dark=R()<.6;x.strokeStyle=dark?`rgba(70,38,16,${.05+R()*.14})`:`rgba(255,215,160,${.04+R()*.08})`;x.lineWidth=.6+R()*2.4;x.beginPath();
      for(let xx=-10;xx<=S+10;xx+=16){const yv=yy+Math.sin(xx*f+p)*amp+Math.sin(xx*f*3.1+p*2)*amp*.3;if(xx<0)x.moveTo(xx,yv);else x.lineTo(xx,yv)}x.stroke()}
    // a knot or two with rings bending round it
    if(R()<.8){const kx=R()*S,ky=y0+ph*(.3+R()*.4);for(let i=9;i>0;i--){x.strokeStyle=`rgba(60,30,12,${.06+.03*(9-i)/9})`;x.lineWidth=1.4;x.beginPath();x.ellipse(kx,ky,i*5.5,i*1.8,0,0,6.3);x.stroke()}x.fillStyle='rgba(50,24,10,.55)';x.beginPath();x.ellipse(kx,ky,6,3,0,0,6.3);x.fill()}
    // seams between planks and a butt joint
    x.fillStyle='rgba(35,18,6,.85)';x.fillRect(0,y0,S,3);x.fillStyle='rgba(255,220,170,.18)';x.fillRect(0,y0+3,S,2);
    const jx=R()*S;x.fillStyle='rgba(35,18,6,.7)';x.fillRect(jx,y0,3,ph)}
  // wear: fine scratches and a faint sheen of wax
  for(let i=0;i<260;i++){const a=R()*S,b=R()*S,l=10+R()*60,an=(R()-.5)*.5;x.strokeStyle=`rgba(${R()<.5?'255,230,190':'40,20,8'},${.05+R()*.08})`;x.lineWidth=.6;x.beginPath();x.moveTo(a,b);x.lineTo(a+Math.cos(an)*l,b+Math.sin(an)*l);x.stroke()}
  const t=tex(c,true,true);t.repeat.set(36,36);
  const m=V3.tableM=new THREE.MeshStandardMaterial({map:t,bumpMap:t,bumpScale:1.4,roughness:.58,metalness:0,envMapIntensity:.7});
  const u=V3.tableU={look:{value:new THREE.Vector3()},rad:{value:12}};
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,u);sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWp=(modelMatrix*vec4(position,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;uniform vec3 look;uniform float rad;').replace('#include <opaque_fragment>','float dd=distance(vWp.xz,look.xz)/rad;outgoingLight*=mix(.42,1.04,smoothstep(1.9,.35,dd));\n#include <opaque_fragment>')};
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(400,400),m);floor.rotation.x=-Math.PI/2;floor.position.y=-.004;floor.receiveShadow=true;return floor}
// ---------- shared procedural textures ----------
// linen weave for the printed tops (normal map)
function linenNormal(){return gq('linen',()=>{const S=256,T=32,h=new Float32Array(S*S);const R=seeded(77);const slubU=Float32Array.from({length:T},()=>.75+R()*.5),slubV=Float32Array.from({length:T},()=>.75+R()*.5);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=x/S*T,v=y/S*T;const iu=Math.floor(u),iv=Math.floor(v);const wu=.5+.5*Math.cos((u-iu-.5)*Math.PI*2),wv=.5+.5*Math.cos((v-iv-.5)*Math.PI*2);
    const over=(iu+iv)%2;h[y*S+x]=(over?wu*.35+wv*.65*slubV[iv]:wv*.35+wu*.65*slubU[iu])+(fbm(x/S,y/S,16)-.5)*.5}
  const c=cvs(S),x=c.getContext('2d'),id=x.createImageData(S,S);for(let y=0;y<S;y++)for(let xx=0;xx<S;xx++){const H=(a,b)=>h[((b+S)%S)*S+((a+S)%S)];const nx=(H(xx-1,y)-H(xx+1,y))*1.6,ny=(H(xx,y-1)-H(xx,y+1))*1.6;const l=Math.hypot(nx,ny,1);const o=(y*S+xx)*4;id.data[o]=(nx/l*.5+.5)*255;id.data[o+1]=(ny/l*.5+.5)*255;id.data[o+2]=(1/l*.5+.5)*255;id.data[o+3]=255}
  x.putImageData(id,0,0);const t=tex(c,false,true);t.repeat.set(2.5,2.5);return t})}
// cardboard core for tile edges
function coreTex(){return gq('core',()=>{const S=128,c=cvs(S),x=c.getContext('2d');x.fillStyle='#8a806a';x.fillRect(0,0,S,S);const R=seeded(5);for(let i=0;i<1400;i++){x.fillStyle=R()<.5?'rgba(60,52,40,.22)':'rgba(200,190,165,.2)';x.fillRect(R()*S,R()*S,1+R()*4,1)}
  for(let i=0;i<5;i++){x.fillStyle='rgba(50,44,34,.25)';x.fillRect(0,R()*S,S,1)}return tex(c,true,true)})}
// detail masks for the little buildings: R = masonry courses, G = curved roof tiles, B = fine plaster / leaf noise
function detailTex(){return gq('detail',()=>{const S=256,c=cvs(S),x=c.getContext('2d'),id=x.createImageData(S,S),d=id.data;const R=seeded(99);const rows=8,rh=S/rows;
  const br=[];for(let r=0;r<rows;r++){const n=6+Math.floor(R()*4);let w=Array.from({length:n},()=>.6+R());const sum=w.reduce((a,b)=>a+b,0);let acc=0;const row={sh:Math.floor(R()*S),e:[],v:[]};for(const q of w){acc+=q/sum*S;row.e.push(acc);row.v.push(.45+R()*.45)}br.push(row)}
  const tv=Float32Array.from({length:16*8},()=>R());
  for(let y=0;y<S;y++)for(let xx=0;xx<S;xx++){const o=(y*S+xx)*4;const n1=fbm(xx/S,y/S,8);
    const row=br[Math.floor(y/rh)],fy=y%rh,px=(xx+row.sh)%S;let bi=0;while(row.e[bi]<px)bi++;const left=bi?row.e[bi-1]:0,bx=Math.min(px-left,row.e[bi]-px);
    let m=(fy<2||bx<1.6)?.12:row.v[bi]*(.8+.4*n1)*(fy<4||bx<3.5?.85:1);
    const cw=S/16,ci=Math.floor(xx/cw),cx=(xx%cw)/cw,ri=Math.floor(y/32),ry=y%32;let g=(.28+.62*Math.pow(Math.sin(cx*Math.PI),.7))*(.75+.5*tv[(ri*16+ci)%128]);if(ry>27)g*=.4+.1*(31-ry);g*=.9+.2*n1;
    const b=n1*.75+R()*.25;d[o]=m*255;d[o+1]=Math.min(1,g)*255;d[o+2]=b*255;d[o+3]=255}
  x.putImageData(id,0,0);const t=tex(c,false,true);t.colorSpace=THREE.NoColorSpace;return t})}
// wood grain for the followers (light, multiplied by each player's stain)
function grainTex(){return gq('grain',()=>{const S=256,c=cvs(S),x=c.getContext('2d');x.fillStyle='#f3e9d8';x.fillRect(0,0,S,S);const R=seeded(12);
  for(let k=0;k<55;k++){const x0=R()*S,amp=3+R()*9,f=.006+R()*.02,p=R()*6.3;x.strokeStyle=`rgba(${R()<.7?'120,80,45':'255,245,230'},${.05+R()*.13})`;x.lineWidth=.8+R()*3;x.beginPath();for(let y=-8;y<=S+8;y+=8){const xv=x0+Math.sin(y*f+p)*amp+Math.sin(y*f*2.7)*amp*.4;y<0?x.moveTo(xv,y):x.lineTo(xv,y)}x.stroke()}
  for(let i=0;i<3;i++){const cx=R()*S,cy=R()*S;for(let j=1;j<8;j++){x.strokeStyle=`rgba(110,70,40,${.12})`;x.lineWidth=1;x.beginPath();x.ellipse(cx,cy,j*4,j*14,0,0,6.3);x.stroke()}}
  const t=tex(c,true,true);return t})}
function blobTex(){return gq('blob',()=>{const c=cvs(64),x=c.getContext('2d');const g=x.createRadialGradient(32,32,2,32,32,31);g.addColorStop(0,'rgba(0,0,0,.62)');g.addColorStop(.45,'rgba(0,0,0,.35)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return tex(c,false)})}
function puffTex(){return gq('puff',()=>{const c=cvs(64),x=c.getContext('2d');const g=x.createRadialGradient(32,32,1,32,32,31);g.addColorStop(0,'rgba(255,250,235,.9)');g.addColorStop(.5,'rgba(255,245,220,.35)');g.addColorStop(1,'rgba(255,240,210,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return tex(c,true)})}
function glowTex(edge){return gq('glowT'+(edge?1:0),()=>{const S=256,c=cvs(S),x=c.getContext('2d');const rr=(i,r)=>{x.beginPath();x.roundRect?x.roundRect(i,i,S-2*i,S-2*i,r):x.rect(i,i,S-2*i,S-2*i)};
  if(!edge){const g=x.createRadialGradient(S/2,S/2,S*.1,S/2,S/2,S*.72);g.addColorStop(0,'rgba(255,236,170,.03)');g.addColorStop(1,'rgba(255,226,140,.2)');x.fillStyle=g;rr(14,24);x.fill()}
  x.shadowColor='rgba(255,205,90,1)';x.shadowBlur=16;x.strokeStyle='rgba(255,222,120,.9)';x.lineWidth=6;rr(16,24);x.stroke();x.shadowBlur=0;x.strokeStyle='rgba(255,250,225,.85)';x.lineWidth=2;rr(16,24);x.stroke();return tex(c,true)})}
function ringTex(){return gq('ringT',()=>{const S=128,c=cvs(S),x=c.getContext('2d');x.shadowColor='rgba(255,255,255,1)';x.shadowBlur=10;x.strokeStyle='#fff';x.lineWidth=7;x.beginPath();x.arc(S/2,S/2,S*.36,0,6.3);x.stroke();
  const g=x.createRadialGradient(S/2,S/2,0,S/2,S/2,S*.36);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,.05)');x.shadowBlur=0;x.fillStyle=g;x.fill();return tex(c,true)})}
// ---------- tile art: a painted top on printed cardboard ----------
const PAINT={grass:['#98ad50','#86a044','#a9b25a','#bcb064','#789a3e','#8fa84c','#a2aa55','#6f8f3a'],fleck:['rgba(212,200,120,.5)','rgba(110,135,62,.45)','rgba(180,190,105,.45)','rgba(84,112,52,.35)','rgba(236,220,150,.4)']};
function dabs(x,R,n,cx,cy,w,h,cols,r0,r1,a){x.globalAlpha=a==null?1:a;for(let i=0;i<n;i++){x.fillStyle=cols[Math.floor(R()*cols.length)];x.beginPath();x.ellipse(cx+(R()-.5)*w,cy+(R()-.5)*h,r0+R()*(r1-r0),(r0+R()*(r1-r0))*.6,R()*3.14,0,6.3);x.fill()}x.globalAlpha=1}
function alongPts(pts,step){const L=lineLen(pts),n=Math.max(2,Math.ceil(L/step));const o=[];for(let i=0;i<=n;i++){const f=i/n,p=along(pts,f),q=along(pts,Math.min(1,f+.01)),q0=along(pts,Math.max(0,f-.01));const a=Math.atan2(q[1]-q0[1],q[0]-q0[0]);o.push([p[0],p[1],a])}return o}
function tileTexture(t,foot){const g=buildGeo(t),d=TT[t];const S=V3.texS||512,c=cvs(S);const x=c.getContext('2d');const R=seeded(t*977+13);x.scale(S/100,S/100);x.lineCap='round';x.lineJoin='round';
  // meadow: soft colour pools, then brushed grass flecks and a few wild flowers
  x.fillStyle='#8a9f43';x.fillRect(0,0,100,100);
  for(let i=0;i<16;i++){const cx=R()*100,cy=R()*100,rr=12+R()*22;const gg=x.createRadialGradient(cx,cy,0,cx,cy,rr);const col=PAINT.grass[Math.floor(R()*PAINT.grass.length)];gg.addColorStop(0,col);gg.addColorStop(1,col+'00');x.globalAlpha=.55;x.fillStyle=gg;x.fillRect(cx-rr,cy-rr,rr*2,rr*2)}x.globalAlpha=1;
  dabs(x,R,260,50,50,104,104,PAINT.grass,1.2,3.4,.45);
  for(let i=0;i<900;i++){const a=-1.2+R()*.9,l=.8+R()*1.8,px=R()*100,py=R()*100;x.strokeStyle=PAINT.fleck[i%5];x.lineWidth=.35+R()*.45;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}
  for(let i=0;i<16;i++){x.fillStyle=['#c8402a','#e8d9a0','#e6b93a','#9c78c8'][Math.floor(R()*4)];x.beginPath();x.arc(4+R()*92,4+R()*92,.35+R()*.35,0,6.3);x.fill()}
  // crop patches in the fields (lavender, wheat or vines), kept away from the edges so tiles join cleanly
  const nC=d.C.length,nR=d.R.length;d.F.forEach((f,k)=>{const sp=g.spots[nC+nR+k];if(!sp||R()<.22)return;const kind=['lav','wheat','vine','lav','lav','wheat'][Math.floor(R()*6)];const w=17+R()*14,h=13+R()*10;
    const cx=Math.min(86-w/2,Math.max(14+w/2,sp[0]+(R()-.5)*16)),cy=Math.min(86-h/2,Math.max(14+h/2,sp[1]+(R()-.5)*16));x.save();x.translate(cx,cy);x.rotate((R()-.5)*.8);
    const patch=()=>{x.beginPath();x.moveTo(-w/2+2,-h/2);x.lineTo(w/2-2,-h/2+(R()-.5));x.quadraticCurveTo(w/2,-h/2,w/2,-h/2+2);x.lineTo(w/2+(R()-.5),h/2-2);x.quadraticCurveTo(w/2,h/2,w/2-2,h/2);x.lineTo(-w/2+2,h/2);x.quadraticCurveTo(-w/2,h/2,-w/2,h/2-2);x.lineTo(-w/2,-h/2+2);x.quadraticCurveTo(-w/2,-h/2,-w/2+2,-h/2);x.closePath()};
    x.fillStyle='rgba(60,70,30,.25)';x.save();x.translate(.6,.8);patch();x.fill();x.restore();patch();x.save();x.clip();
    if(kind==='lav'){x.fillStyle='#8c8a50';x.fillRect(-w,-h,w*2,h*2);for(let yy=-h/2+1.6;yy<h/2;yy+=3.2){x.strokeStyle='rgba(70,62,40,.45)';x.lineWidth=2.2;x.beginPath();x.moveTo(-w/2,yy+.7);x.lineTo(w/2,yy+.7);x.stroke();
        for(let xx=-w/2+.8;xx<w/2;xx+=.9){x.fillStyle=['#7a62b0','#8e74c4','#6a53a0','#a38bd2','#7f68b8'][Math.floor(R()*5)];x.beginPath();x.ellipse(xx,yy+(R()-.5)*.5,.75+R()*.35,1.05+R()*.3,0,0,6.3);x.fill()}
        x.strokeStyle='rgba(215,200,245,.55)';x.lineWidth=.35;x.beginPath();x.moveTo(-w/2,yy-.6);x.lineTo(w/2,yy-.6);x.stroke()}}
    else if(kind==='wheat'){x.fillStyle='#d7b457';x.fillRect(-w,-h,w*2,h*2);dabs(x,R,60,0,0,w,h,['#e6c86c','#c99d42','#efd78a','#d0a94c'],1,2.6,.6);x.lineWidth=.35;for(let i=0;i<220;i++){const px=(R()-.5)*w,py=(R()-.5)*h;x.strokeStyle=R()<.5?'rgba(160,115,40,.5)':'rgba(255,238,170,.6)';x.beginPath();x.moveTo(px,py);x.lineTo(px+.3,py-1.3);x.stroke()}}
    else{x.fillStyle='#a88d62';x.fillRect(-w,-h,w*2,h*2);for(let yy=-h/2+1.5;yy<h/2;yy+=3){x.strokeStyle='rgba(90,64,40,.5)';x.lineWidth=.5;x.beginPath();x.moveTo(-w/2,yy+1);x.lineTo(w/2,yy+1);x.stroke();for(let xx=-w/2+1;xx<w/2;xx+=1.6){x.fillStyle=['#4f6b2e','#5d7a34','#44602a','#6d8a3c'][Math.floor(R()*4)];x.beginPath();x.arc(xx+(R()-.5)*.4,yy,.8+R()*.4,0,6.3);x.fill()}}}
    x.restore();x.strokeStyle='rgba(70,80,36,.55)';x.lineWidth=.6;patch();x.stroke();x.restore()});
  for(const h of g.hedges){const p=new Path2D(lineD(h));x.strokeStyle='rgba(40,50,20,.3)';x.lineWidth=4.6;x.stroke(p);for(const q of alongPts(h,1.1))dabs(x,R,2,q[0],q[1],1.4,1.4,['#4e6b2c','#5d7c33','#3f5a24','#6d8c3d'],.9,1.7,1)}
  // soft shade under every building, tree and wall (so nothing floats, even with shadows off)
  for(const f of foot||[]){const gg=x.createRadialGradient(f[0]+.6,f[1]+.6,0,f[0]+.6,f[1]+.6,f[2]);gg.addColorStop(0,'rgba(45,30,12,.34)');gg.addColorStop(1,'rgba(45,30,12,0)');x.fillStyle=gg;x.fillRect(f[0]-f[2]+.6,f[1]-f[2]+.6,f[2]*2,f[2]*2)}
  // river beds: grassy bank, sandy shore, deep water in the middle (the moving surface is a separate mesh)
  for(const V of g.rivers){const p=new Path2D(lineD(V));x.lineCap='butt';x.strokeStyle='rgba(70,90,40,.55)';x.lineWidth=22;x.stroke(p);x.strokeStyle='#c9ad74';x.lineWidth=18.5;x.stroke(p);x.strokeStyle='#8f9a6a';x.lineWidth=16.4;x.stroke(p);x.strokeStyle='#3e7ea6';x.lineWidth=15;x.stroke(p);x.strokeStyle='#2d6790';x.lineWidth=9;x.stroke(p);x.strokeStyle='#23577c';x.lineWidth=4;x.stroke(p);
    for(const q of alongPts(V,1.4)){for(const s of [-1,1]){if(R()<.5)continue;const o=8.4+R()*.8;dabs(x,R,1,q[0]-Math.sin(q[2])*o*s,q[1]+Math.cos(q[2])*o*s,.6,.6,['#e7d3a2','#b69866','#7c8f4a'],.4,1,.9)}}x.lineCap='round'}
  for(const p of g.ponds){x.fillStyle='#c9ad74';x.beginPath();x.arc(p.x,p.y,p.r+2,0,7);x.fill();const gg=x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);gg.addColorStop(0,'#22567b');gg.addColorStop(1,'#4486ad');x.fillStyle=gg;x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill();dabs(x,R,30,p.x,p.y,p.r*2.3,p.r*2.3,['#5f8a3a','#7c9a48'],.6,1.4,.35)}
  // towns: sun-warmed paving stones inside the walls, a dark ditch just outside
  for(const T of g.towns){const P2=new Path2D(polyD(T.poly));for(const w of T.walls){x.strokeStyle='rgba(55,40,20,.32)';x.lineWidth=9;x.stroke(new Path2D(lineD(w)))}
    x.fillStyle=d.C[T.seg].cat?'#e6d2ac':'#d6b98a';x.fill(P2);x.save();x.clip(P2);
    for(let yy=0;yy<100;yy+=2.2){const off=(Math.round(yy/2.2)%2)*1.4;for(let xx=-2+off;xx<102;xx+=2.8){const v=R();x.fillStyle=v<.33?'#cdb07e':v<.66?'#dcc295':'#c4a574';x.beginPath();x.ellipse(xx+(R()-.5)*.4,yy+(R()-.5)*.3,1.2,.85,0,0,6.3);x.fill()}}
    x.fillStyle='rgba(150,110,60,.18)';for(let i=0;i<40;i++){x.beginPath();x.arc(R()*100,R()*100,2+R()*5,0,6.3);x.fill()}
    for(const w of T.walls){for(const [lw,a] of [[12,.12],[8,.14],[5,.16]]){x.strokeStyle=`rgba(70,45,20,${a})`;x.lineWidth=lw;x.stroke(new Path2D(lineD(w)))}}x.restore()}
  // dirt roads: grass-worn verges, packed earth, two cart ruts and a green crown down the middle
  for(const Rd of g.roads){const p=new Path2D(lineD(Rd.pts));x.strokeStyle='rgba(90,80,40,.28)';x.lineWidth=13;x.stroke(p);x.strokeStyle='#a98b5c';x.lineWidth=10.6;x.stroke(p);x.strokeStyle='#d3b98a';x.lineWidth=8.6;x.stroke(p);
    for(const q of alongPts(Rd.pts,1)){const nx=-Math.sin(q[2]),ny=Math.cos(q[2]);for(const s of [-1,1])dabs(x,R,1,q[0]+nx*4.6*s,q[1]+ny*4.6*s,1,1,['#9aab55','#8a9e4c','#b0a066'],.5,1.3,.8);
      dabs(x,R,1,q[0]+(R()-.5)*6,q[1]+(R()-.5)*6,1,1,['#e4cfa2','#c4a672','#b89a66'],.3,.9,.7);if(R()<.35){x.fillStyle='rgba(120,150,70,.55)';x.beginPath();x.ellipse(q[0],q[1],.8,.4,q[2],0,6.3);x.fill()}}
    for(const o of [-2.3,2.3]){const op=new Path2D(lineD(offsetLine(Rd.pts,o)));x.strokeStyle='rgba(120,90,55,.6)';x.lineWidth=1.3;x.stroke(op);const hp=new Path2D(lineD(offsetLine(Rd.pts,o+(o<0?-.9:.9))));x.strokeStyle='rgba(245,228,190,.45)';x.lineWidth=.5;x.stroke(hp)}
    for(let i=0;i<14;i++){const q=along(Rd.pts,R());x.fillStyle=R()<.5?'#8f7b5c':'#efe0bd';x.beginPath();x.arc(q[0]+(R()-.5)*7,q[1]+(R()-.5)*7,.3+R()*.4,0,6.3);x.fill()}}
  for(const h of g.hubs){x.fillStyle='#a98b5c';x.beginPath();x.arc(h.x,h.y,h.r+2,0,7);x.fill();x.fillStyle='#d6be90';x.beginPath();x.arc(h.x,h.y,h.r+1,0,7);x.fill();dabs(x,R,20,h.x,h.y,h.r*1.6,h.r*1.6,['#e4cfa2','#c4a672'],.4,1,.6)}
  if(g.mon){const m=g.mon;x.fillStyle='rgba(60,80,30,.35)';x.beginPath();x.arc(m.x,m.y,m.r+3,0,7);x.fill();x.fillStyle='#b5c47a';x.beginPath();x.arc(m.x,m.y,m.r+2,0,7);x.fill();dabs(x,R,50,m.x,m.y,m.r*2.4,m.r*2.4,['#c4d08a','#a6b86a','#d6d49a'],.8,1.8,.6);
    x.strokeStyle='#d8c49a';x.lineWidth=2.4;x.beginPath();x.moveTo(m.x,m.y+4);x.lineTo(m.x,m.y+m.r+2);x.stroke()}
  for(const I of g.inns){x.fillStyle='#c9ad74';x.beginPath();x.ellipse(I.x-3,I.y+2,8.4,6.4,0,0,7);x.fill();const gg=x.createRadialGradient(I.x-3,I.y+2,0,I.x-3,I.y+2,7);gg.addColorStop(0,'#23577c');gg.addColorStop(1,'#4a8cb2');x.fillStyle=gg;x.beginPath();x.ellipse(I.x-3,I.y+2,6.6,4.8,0,0,7);x.fill()}
  if(d.gar){const fs=gardenSpot(t);x.fillStyle='#7a5a38';x.fillRect(fs[0]-7,fs[1]-5,14,10);for(let i=0;i<5;i++){x.fillStyle=i%2?'#5f8a36':'#89b04d';x.fillRect(fs[0]-6+i*2.6,fs[1]-4,1.6,8)}}
  // print finish: fine grain, afternoon light across the tile, a hint of wear on the die-cut edge
  for(let i=0;i<1600;i++){x.fillStyle=R()<.5?'rgba(255,250,235,.05)':'rgba(40,30,15,.07)';x.fillRect(R()*100,R()*100,.5,.5)}
  const lg=x.createLinearGradient(0,0,100,100);lg.addColorStop(0,'rgba(255,240,205,.08)');lg.addColorStop(1,'rgba(70,45,20,.07)');x.fillStyle=lg;x.fillRect(0,0,100,100);
  for(const [w,a] of [[3,.05],[1.6,.07],[.7,.1]]){x.strokeStyle=`rgba(50,35,15,${a})`;x.lineWidth=w;x.strokeRect(0,0,100,100)}
  const tx=tex(c,true);return tx}
function gardenSpot(t){const g=buildGeo(t),d=TT[t];const sp=g.spots[d.C.length+d.R.length]||[50,50];return [Math.min(84,Math.max(16,sp[0]+10)),Math.min(84,Math.max(16,sp[1]+10))]}
function offsetLine(pts,o){return pts.map((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let nx=-(b[1]-a[1]),ny=b[0]-a[0];const L=Math.hypot(nx,ny)||1;return [p[0]+nx/L*o,p[1]+ny/L*o]})}
// dock thumbnail of the painted top (so the panel matches the board)
const THUMB={};function tileThumb(t){if(!V3.on)return null;if(THUMB[t])return THUMB[t];try{const src=tileProto(t).userData.top.image;const c=cvs(160),x=c.getContext('2d');x.drawImage(src,0,0,160,160);return THUMB[t]=c.toDataURL('image/jpeg',.88)}catch(e){return null}}
// ---------- geometry helpers ----------
// average face normals across smooth edges (ExtrudeGeometry is non-indexed and faceted); caps stay flat
function smoothNormals(g,isCap,cosT){const p=g.attributes.position.array,n=p.length/9,fn=new Float32Array(n*3),cap=new Uint8Array(n);const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3();
  for(let i=0;i<n;i++){A.fromArray(p,i*9);B.fromArray(p,i*9+3).sub(A);C.fromArray(p,i*9+6).sub(A);B.cross(C).normalize();fn[i*3]=B.x;fn[i*3+1]=B.y;fn[i*3+2]=B.z;cap[i]=isCap(B)?1:0}
  const M=new Map();const k=j=>Math.round(p[j]*1e4)+','+Math.round(p[j+1]*1e4)+','+Math.round(p[j+2]*1e4);
  for(let i=0;i<n;i++)if(!cap[i])for(let v=0;v<3;v++){const kk=k(i*9+v*3);let L=M.get(kk);if(!L)M.set(kk,L=[]);L.push(i)}
  const nn=new Float32Array(n*9);
  for(let i=0;i<n;i++)for(let v=0;v<3;v++){const o=i*9+v*3;if(cap[i]){nn[o]=fn[i*3];nn[o+1]=fn[i*3+1];nn[o+2]=fn[i*3+2];continue}let sx=0,sy=0,sz=0;for(const j of M.get(k(o))){if(fn[j*3]*fn[i*3]+fn[j*3+1]*fn[i*3+1]+fn[j*3+2]*fn[i*3+2]>cosT){sx+=fn[j*3];sy+=fn[j*3+1];sz+=fn[j*3+2]}}const l=Math.hypot(sx,sy,sz)||1;nn[o]=sx/l;nn[o+1]=sy/l;nn[o+2]=sz/l}
  g.setAttribute('normal',new THREE.BufferAttribute(nn,3));return g}
// the tile: a rounded, bevelled slab; the print wraps over the top shoulder of the bevel, the grey-brown board core shows below
function slabGeo(){return gq('slab',()=>{const bs=.03,bt=.034,a=TS*.985/2-bs,rr=.05;const s=new THREE.Shape();
  s.moveTo(-a+rr,-a);s.lineTo(a-rr,-a);s.quadraticCurveTo(a,-a,a,-a+rr);s.lineTo(a,a-rr);s.quadraticCurveTo(a,a,a-rr,a);s.lineTo(-a+rr,a);s.quadraticCurveTo(-a,a,-a,a-rr);s.lineTo(-a,-a+rr);s.quadraticCurveTo(-a,-a,-a+rr,-a);
  const g=new THREE.ExtrudeGeometry(s,{depth:TH-2*bt,bevelEnabled:true,bevelThickness:bt,bevelSize:bs,bevelSegments:3,curveSegments:3});g.rotateX(-Math.PI/2);g.translate(0,bt,0);
  smoothNormals(g,f=>Math.abs(f.y)>.9999,Math.cos(50*Math.PI/180));
  const p=g.attributes.position.array,nr=g.attributes.normal.array,n=p.length/9,yc=TH-bt*.55;const top=[],side=[];for(let i=0;i<n;i++){const o=i*9;(Math.min(p[o+1],p[o+4],p[o+7])>=yc?top:side).push(i)}
  const P=new Float32Array(n*9),N=new Float32Array(n*9),UV=new Float32Array(n*6);let w=0;
  for(const i of top.concat(side)){const isTop=w<top.length;for(let v=0;v<3;v++){const o=i*9+v*3,q=w*9+v*3,u=w*6+v*2;P[q]=p[o];P[q+1]=p[o+1];P[q+2]=p[o+2];N[q]=nr[o];N[q+1]=nr[o+1];N[q+2]=nr[o+2];
      if(isTop){UV[u]=p[o]/TS+.5;UV[u+1]=.5-p[o+2]/TS}else{UV[u]=(p[o]+p[o+2])*1.6;UV[u+1]=p[o+1]*1.6}}w++}
  const G2=new THREE.BufferGeometry();G2.setAttribute('position',new THREE.BufferAttribute(P,3));G2.setAttribute('normal',new THREE.BufferAttribute(N,3));G2.setAttribute('uv',new THREE.BufferAttribute(UV,2));
  G2.addGroup(0,top.length*3,0);G2.addGroup(top.length*3,side.length*3,1);G2.computeBoundingSphere();return G2})}
// props helper: collect geometry parts with a colour, a detail kind and a sway weight, merge them into one mesh per tile type
const KIND={s:[1,0,0],r:[0,1,0],p:[0,0,.45],l:[0,0,1.3],w:[0,0,.2],n:[0,0,0]};
function Props(seed){this.parts=[];this.foot=[];this.R=seeded(seed||1)}
Props.prototype.add=function(geo,col,x,y,z,ry,sx,sy,sz,kind,sway,capCol){const g=(geo.index?geo.toNonIndexed():geo.clone());sx=sx||1;sy=sy||1;sz=sz||1;g.applyMatrix4(new THREE.Matrix4().makeScale(sx,sy,sz));
  const p=g.attributes.position,nm=g.attributes.normal,cnt=p.count,uv=new Float32Array(cnt*2),sw=new Float32Array(cnt),caps=new Uint8Array(cnt);kind=kind||'n';
  let y0=1e9,y1=-1e9;for(let i=0;i<cnt;i++){y0=Math.min(y0,p.getY(i));y1=Math.max(y1,p.getY(i))}
  for(let i=0;i<cnt;i++){const X=p.getX(i),Y=p.getY(i),Z=p.getZ(i),ax=Math.abs(nm.getX(i)),ay=Math.abs(nm.getY(i)),az=Math.abs(nm.getZ(i));let a,b;
    if(kind==='r'){if(capCol&&az>.95){caps[i]=1;a=X;b=Y}else{a=Z;b=X*1.1+Y*.4}}else if(ay>=ax&&ay>=az){a=X;b=Z}else if(ax>=az){a=Z;b=Y}else{a=X;b=Y}
    uv[i*2]=a/.24;uv[i*2+1]=b/.24;if(sway)sw[i]=sway*Math.pow(Math.max(0,(Y-y0)/(y1-y0||1)),1.6)}
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry||0,0)),new THREE.Vector3(1,1,1)));
  const c=new THREE.Color(col).offsetHSL((this.R()-.5)*.012,(this.R()-.5)*.05,(this.R()-.5)*.06);const cc=capCol?new THREE.Color(capCol):null;
  this.parts.push({g,c,cc,caps,uv,sw,k:KIND[kind]||KIND.n,kc:KIND.p})};
// add a part positioned in the local frame of a rotated building
Props.prototype.addL=function(geo,col,cx,cy,cz,ry,lx,ly,lz,sx,sy,sz,kind){const c=Math.cos(ry),s=Math.sin(ry);this.add(geo,col,cx+lx*c+lz*s,cy+ly,cz-lx*s+lz*c,ry,sx,sy,sz,kind)};
Props.prototype.mesh=function(mat){let n=0;for(const p of this.parts)n+=p.g.attributes.position.count;if(!n)return null;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3),uv=new Float32Array(n*2),dk=new Float32Array(n*3),sw=new Float32Array(n);let o=0;
  for(const p of this.parts){const cnt=p.g.attributes.position.count;pos.set(p.g.attributes.position.array,o*3);nor.set(p.g.attributes.normal.array,o*3);uv.set(p.uv,o*2);sw.set(p.sw,o);
    for(let i=0;i<cnt;i++){const cap=p.caps[i];const C=cap?p.cc:p.c,K=cap?p.kc:p.k;col[(o+i)*3]=C.r;col[(o+i)*3+1]=C.g;col[(o+i)*3+2]=C.b;dk[(o+i)*3]=K[0];dk[(o+i)*3+1]=K[1];dk[(o+i)*3+2]=K[2]}o+=cnt}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('duv',new THREE.BufferAttribute(uv,2));g.setAttribute('dk',new THREE.BufferAttribute(dk,3));g.setAttribute('sw',new THREE.BufferAttribute(sw,1));
  g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;return m};
const box=()=>gq('box',()=>new THREE.BoxGeometry(1,1,1));
const roof4=()=>gq('roof4',()=>{const g=new THREE.ConeGeometry(.72,1,4,1);g.rotateY(Math.PI/4);g.translate(0,.5,0);return g});
const cyl=()=>gq('cyl',()=>{const g=new THREE.CylinderGeometry(.5,.5,1,14);g.translate(0,.5,0);return g});
const cone=()=>gq('cone',()=>{const g=new THREE.ConeGeometry(.5,1,14);g.translate(0,.5,0);return g});
const cypressG=()=>gq('cyp',()=>{const pts=[[0,0],[.3,.05],[.46,.22],[.5,.4],[.42,.62],[.28,.82],[.1,.97],[0,1]].map(p=>new THREE.Vector2(p[0],p[1]));return new THREE.LatheGeometry(pts,9)});
const ball=()=>gq('ball',()=>new THREE.IcosahedronGeometry(.5,1));
const dome=()=>gq('dome',()=>new THREE.SphereGeometry(.5,14,7,0,Math.PI*2,0,Math.PI/2));
const hayG=()=>gq('hay',()=>new THREE.SphereGeometry(.5,12,6,0,Math.PI*2,0,Math.PI/2));
const gable=()=>gq('gable',()=>{const s=new THREE.Shape();s.moveTo(-.5,0);s.lineTo(.5,0);s.lineTo(0,.6);s.lineTo(-.5,0);const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});g.translate(0,0,-.5);return g});
const L=(u)=>(u-50)*U;// tile units -> local world
const WALLS=['#efe0c2','#e8cfa2','#f3e5c8','#e2c08f','#ead6b1','#f0d9b5','#e6c9a0'],ROOFS=['#c2653d','#b4532f','#cf7a48','#a84a2b','#c86d45','#b9603a'],SHUT=['#6e8fa6','#7c9c7a','#8f7fb4','#5f8aa0','#9aae9a','#7b95b8'];
const pick=(R,a)=>a[Math.floor(R()*a.length)];
function house(P,u,v,R,s,rot){s=s||1;let w=(8+R()*4)*s,d=(6.5+R()*2.5)*s,h=(5+R()*3.5)*s;const y=TH;const ry=rot!=null?rot:Math.floor(R()*4)*Math.PI/2+(R()-.5)*.3;const cx=L(u),cz=L(v);
  const wc=pick(R,WALLS),rc=pick(R,ROOFS);P.add(box(),wc,cx,y+h*U/2,cz,ry,w*U,h*U,d*U,'p');
  const rh=d*.34;P.add(gable(),rc,cx,y+h*U-.2*U,cz,ry+Math.PI/2,d*1.16*U,rh/.6*U,w*1.1*U,'r',0,wc);
  const sc=pick(R,SHUT);for(const side of [1,-1]){if(side<0&&R()<.4)continue;const n=w>10?2:1;for(let i=0;i<n;i++){const lx=n===1?(R()-.5)*w*.3:(i?1:-1)*w*.26;P.addL(box(),sc,cx,y+h*U*.58,cz,ry,lx*U,0,side*(d/2+.12)*U,1.9*U,2.2*U,.3*U,'w')}}
  P.addL(box(),'#6b4a30',cx,y+1.5*U,cz,ry,(R()-.5)*w*.4*U,0,(d/2+.1)*U,1.8*U,3*U,.25*U,'w');
  if(R()<.4)P.addL(box(),'#d9c2a0',cx,y+(h+rh*.6)*U,cz,ry,w*.28*U,0,d*.12*U,1.4*U,3*U,1.4*U,'s');
  P.foot.push([u,v,Math.max(w,d)*.72])}
function tower(P,u,v,s){s=s||1;const r=3.4*s*U,h=13*s*U;P.add(cyl(),'#d2b98c',L(u),TH,L(v),0,r*2,h,r*2,'s');P.add(cyl(),'#c6ab7c',L(u),TH+h-1.2*U,L(v),0,r*2.3,1.4*U,r*2.3,'s');P.add(cone(),'#b85a35',L(u),TH+h+.2*U,L(v),0,r*2.5,6*s*U,r*2.5,'r');P.foot.push([u,v,7*s])}
function cypress(P,u,v,R){const h=(15+R()*7)*U;P.add(cyl(),'#6b4f35',L(u),TH,L(v),0,1*U,2*U,1*U,'w');P.add(cypressG(),R()<.5?'#2f4a26':'#3a5a2e',L(u),TH+1.2*U,L(v),R()*3,(4.4+R())*U,h,(4.4+R())*U,'l',1);P.foot.push([u+1.5,v+1,4.5])}
function olive(P,u,v,R){P.add(cyl(),'#6b5540',L(u),TH,L(v),0,1.5*U,5*U,1.5*U,'w');const cols=['#7f915a','#8b9a64','#95a670','#76885a'];for(let i=0;i<3;i++){const a=R()*6.3,o=i?2.2:0;P.add(ball(),pick(R,cols),L(u+Math.cos(a)*o),TH+(5.2+R()*1.6)*U,L(v+Math.sin(a)*o),R()*3,(6+R()*2)*U,(4.8+R())*U,(6+R()*2)*U,'l',.7)}P.foot.push([u+1,v+1,6.5])}
function hay(P,u,v){P.add(hayG(),'#dab65c',L(u),TH,L(v),0,5.4*U,4.6*U*2,5.4*U,'l');P.foot.push([u,v,4.2])}
function tileProps(t){const g=buildGeo(t),d=TT[t],R=seeded(t*131+7),P=new Props(t*71+3),N=GRID;
  const spots=g.spots.map(p=>p);const clearOf=(u,v,r)=>spots.every(p=>Math.hypot(p[0]-u,p[1]-v)>r);
  const labAt=(u,v)=>g.lab[Math.min(N-1,Math.max(0,Math.floor(v*N/100)))*N+Math.min(N-1,Math.max(0,Math.floor(u*N/100)))];
  const farFrom=(u,v,lab,r)=>{for(let a=0;a<6;a++){const q=a/6*Math.PI*2;if(labAt(u+Math.cos(q)*r,v+Math.sin(q)*r)!==lab)return false}return true};
  // town walls: a plinth, the curtain wall, crenellations and towers; houses packed inside
  for(const T of g.towns){const c=d.C[T.seg];
    for(const w of T.walls){for(let i=1;i<w.length;i++){const a=w[i-1],b=w[i];const len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<.5)continue;const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);const mu=(a[0]+b[0])/2,mv=(a[1]+b[1])/2;
        P.add(box(),'#c3a878',L(mu),TH+.8*U,L(mv),-ang,(len+.8)*U,1.6*U,3.6*U,'s');P.add(box(),'#d4bd90',L(mu),TH+3.4*U,L(mv),-ang,(len+.6)*U,6.8*U,2.6*U,'s');
        const nm=Math.max(1,Math.round(len/3.2));for(let j=0;j<nm;j++){const f=(j+.5)/nm;P.add(box(),'#cdb487',L(a[0]+(b[0]-a[0])*f),TH+7.5*U,L(a[1]+(b[1]-a[1])*f),-ang,Math.min(1.7,len/nm*.55)*U,1.6*U,2.8*U,'s')}
        if(i%3===0)P.foot.push([mu,mv,4])}
      if(w.length>6){const m=w[Math.floor(w.length/2)];if(clearOf(m[0],m[1],8))tower(P,m[0],m[1],1)}}
    const hs=[];for(let v=6;v<96;v+=10.5)for(let u=6;u<96;u+=10.5){const uu=u+(R()-.5)*5,vv=v+(R()-.5)*5;if(labAt(uu,vv)!==T.seg||!farFrom(uu,vv,T.seg,4.5))continue;if(!clearOf(uu,vv,9.5))continue;if(c.cat&&Math.hypot(uu-(g.spots[T.seg][0]+(g.spots[T.seg][0]<50?9:-9)),vv-(g.spots[T.seg][1]+(g.spots[T.seg][1]<50?9:-9)))<19)continue;if(R()<.12)continue;hs.push([uu,vv])}
    for(const [u,v] of hs)house(P,u,v,R,1);
    const sp=g.spots[T.seg];
    if(c.cat){// the basilica: limestone nave, apse dome and bell tower
      const bu=sp[0]+(sp[0]<50?9:-9),bv=sp[1]+(sp[1]<50?9:-9);P.add(box(),'#f4ecdb',L(bu),TH+6*U,L(bv),0,24*U,12*U,12*U,'s');P.add(gable(),'#b9603a',L(bu),TH+12*U,L(bv),Math.PI/2,12.8*U,8*U,24.6*U,'r',0,'#f4ecdb');P.add(cyl(),'#efe5d0',L(bu+12),TH,L(bv),0,12*U,12*U,12*U,'s');P.add(dome(),'#8e9ba6',L(bu+12),TH+12*U,L(bv),0,12*U,10*U,12*U,'r');P.add(box(),'#efe5d0',L(bu-11),TH+11*U,L(bv),0,7*U,22*U,7*U,'s');P.add(roof4(),'#b4532f',L(bu-11),TH+22*U,L(bv),0,7.4*U,8*U,7.4*U,'r');P.foot.push([bu,bv,16])}
    if(c.p){const bu=Math.min(90,sp[0]+8),bv=Math.max(10,sp[1]-8);P.add(cyl(),'#5b4430',L(bu),TH,L(bv),0,.9*U,15*U,.9*U,'w');P.add(box(),'#2c5fb8',L(bu+3.4),TH+12*U,L(bv),0,6*U,5*U,.6*U,'p',.4);P.add(box(),'#f0c44c',L(bu+3.4),TH+12*U,L(bv),0,6.2*U,1.2*U,.7*U,'n',.4)}
    if(c.g){const gu=Math.max(10,sp[0]-9),gv=Math.min(90,sp[1]+6);
      if(c.g==='wine'){P.add(cyl(),'#7a4a2a',L(gu),TH,L(gv),0,4.4*U,5*U,4.4*U,'w');P.add(cyl(),'#3b2a1a',L(gu),TH+1*U,L(gv),0,4.6*U,.7*U,4.6*U);P.add(cyl(),'#3b2a1a',L(gu),TH+3.4*U,L(gv),0,4.6*U,.7*U,4.6*U);P.add(cyl(),'#7a1f3d',L(gu),TH+5*U,L(gv),0,3.4*U,.4*U,3.4*U)}
      else if(c.g==='grain'){for(let i=0;i<3;i++)P.add(cone(),'#e0b447',L(gu+(i-1)*3),TH,L(gv+(i%2)*2),0,3.4*U,6*U,3.4*U,'l')}
      else{P.add(box(),'#3f6fb5',L(gu),TH+1.6*U,L(gv),.4,8*U,3.2*U,3.2*U,'p');P.add(box(),'#8a4fb0',L(gu+1),TH+4.4*U,L(gv+1),.2,7*U,2.6*U,2.8*U,'p')}P.foot.push([gu,gv,5])}}
  // the priory: chapel, bell tower, door, two cypresses
  if(g.mon){const m=g.mon;P.add(box(),'#f1e6cf',L(m.x),TH+5*U,L(m.y-2),0,16*U,10*U,11*U,'s');P.add(gable(),'#b8583a',L(m.x),TH+10*U,L(m.y-2),Math.PI/2,12*U,6.5*U,17*U,'r',0,'#f1e6cf');
    P.add(box(),'#ebdcbf',L(m.x-9),TH+8*U,L(m.y-5),0,5*U,16*U,5*U,'s');P.add(roof4(),'#a94a2c',L(m.x-9),TH+16*U,L(m.y-5),0,5.6*U,5*U,5.6*U,'r');P.add(box(),'#6a4a30',L(m.x),TH+3*U,L(m.y+3.6),0,3.6*U,6*U,.6*U,'w');
    P.add(box(),'#3a3024',L(m.x-9),TH+13*U,L(m.y-2.4),0,1.6*U,2.4*U,.3*U);cypress(P,m.x+11,m.y-7,R);cypress(P,m.x+12,m.y+3,R);P.foot.push([m.x,m.y-2,13])}
  for(const h of g.hubs){if(d.R.filter(r=>r.e.length===1).length>=3){P.add(cyl(),'#b9a47e',L(h.x),TH,L(h.y),0,7*U,2.4*U,7*U,'s');P.add(cyl(),'#2f5f86',L(h.x),TH+2.3*U,L(h.y),0,5*U,.3*U,5*U);P.add(box(),'#6b4f35',L(h.x-3),TH+2.5*U,L(h.y),0,.7*U,5*U,.7*U,'w');P.add(box(),'#6b4f35',L(h.x+3),TH+2.5*U,L(h.y),0,.7*U,5*U,.7*U,'w');P.add(box(),'#6b4f35',L(h.x),TH+5*U,L(h.y),0,7*U,.8*U,.8*U,'w');P.foot.push([h.x,h.y,5])}else house(P,h.x,h.y,R,.9,0)}
  for(const I of g.inns){P.add(box(),'#f3e2c2',L(I.x+5),TH+4*U,L(I.y-4),0,10*U,8*U,8*U,'p');P.add(gable(),'#b5532f',L(I.x+5),TH+7.8*U,L(I.y-4),0,9*U,5*U,11*U,'r',0,'#f3e2c2');P.add(box(),'#6b4f35',L(I.x+10.5),TH+6*U,L(I.y-4),0,1*U,4*U,4*U,'w');P.add(box(),'#e0a53a',L(I.x+11.2),TH+5.4*U,L(I.y-4),0,.5*U,2.6*U,3*U);P.foot.push([I.x+5,I.y-4,7])}
  // bridges where a road crosses the river
  for(const Rd of g.roads)for(const V of g.rivers){for(let f=0;f<=1;f+=.05){const p=along(Rd.pts,f);if(dLine(p[0],p[1],V)<3){const a=along(Rd.pts,Math.max(0,f-.05)),b=along(Rd.pts,Math.min(1,f+.05));const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
      P.add(box(),'#cbb48b',L(p[0]),TH+1.4*U,L(p[1]),-ang,24*U,2.8*U,11*U,'s');for(const o of [-5,5]){const c=Math.cos(-ang),s=Math.sin(-ang);P.add(box(),'#bfa57a',L(p[0])+o*U*s,TH+3.6*U,L(p[1])+o*U*c,-ang,24*U,2*U,1.2*U,'s')}break}}}
  // trees and haystacks in the fields, away from follower spots and from the tile edge
  const tries=26;let n=0;const want=4+Math.floor(R()*4);for(let i=0;i<tries&&n<want;i++){const u=10+R()*80,v=10+R()*80;const lb=labAt(u,v);if(lb!==-1||!farFrom(u,v,-1,4))continue;if(!clearOf(u,v,10))continue;if(g.mon&&Math.hypot(u-g.mon.x,v-g.mon.y)<18)continue;if(g.inns.some(I=>Math.hypot(u-I.x,v-I.y)<14))continue;
    const k=R();if(k<.55)cypress(P,u,v,R);else if(k<.85)olive(P,u,v,R);else hay(P,u,v);n++}
  if(d.gar){const fs=gardenSpot(t);for(let i=0;i<5;i++)P.add(box(),i%2?'#476f2a':'#5c8a36',L(fs[0]-5.2+i*2.6),TH+1*U,L(fs[1]),0,1.6*U,2*U,7*U,'l')}
  return P}
function riverMeshes(t){const g=buildGeo(t);const out=[];const mat=waterMat();
  for(const V of g.rivers){const a=offsetLine(dense(V),7.3),b=offsetLine(dense(V),-7.3).reverse();const s=new THREE.Shape(a.concat(b).map(p=>new THREE.Vector2(L(p[0]),-L(p[1]))));const m=new THREE.Mesh(new THREE.ShapeGeometry(s),mat);m.rotation.x=-Math.PI/2;m.position.y=TH+.003;m.receiveShadow=true;out.push(m)}
  for(const p of g.ponds){const m=new THREE.Mesh(new THREE.CircleGeometry(p.r*U,28),mat);m.rotation.x=-Math.PI/2;m.position.set(L(p.x),TH+.003,L(p.y));m.receiveShadow=true;out.push(m)}
  for(const I of g.inns){const m=new THREE.Mesh(new THREE.CircleGeometry(5.6*U,20),mat);m.scale.set(1.2,.85,1);m.rotation.x=-Math.PI/2;m.position.set(L(I.x-3),TH+.003,L(I.y+2));m.receiveShadow=true;out.push(m)}
  return out}
function dense(pts){if(pts.length>2)return pts;const o=[];for(let i=0;i<=10;i++)o.push(along(pts,i/10));return o}
// shimmering water: moving ripples in the normal, tiny sun glints (they bloom on High)
function waterMat(){return gq('waterM',()=>{const m=new THREE.MeshStandardMaterial({color:0x1f5f8c,roughness:.12,metalness:0,transparent:true,opacity:.62,envMapIntensity:.9,depthWrite:false});
  m.onBeforeCompile=sh=>{sh.uniforms.uTime=V3.uTime;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWp=(modelMatrix*vec4(position,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;uniform float uTime;')
      .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n{vec2 p=vWp.xz*7.;float t=uTime;vec2 gr=vec2(cos(p.x*1.7+p.y*.4+t*1.9)+.6*cos(p.x*3.3-p.y*1.1-t*2.6),cos(p.y*1.5-p.x*.5-t*1.6)+.6*cos(p.y*2.9+p.x*1.7+t*2.2))*.09;normal=normalize(normal+(viewMatrix*vec4(gr.x,0.,gr.y,0.)).xyz);}')
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n{vec2 p=vWp.xz*11.;float t=uTime;float s=sin(p.x*3.1+t*2.3)*sin(p.y*2.7-t*1.7)*sin((p.x-p.y)*1.9+t*1.3);float gpat=smoothstep(.55,.95,sin(vWp.x*1.3+t*.7)*sin(vWp.z*1.1-t*.5)*.5+.5);totalEmissiveRadiance+=vec3(1.,.93,.78)*pow(max(s,0.),40.)*1.4*gpat;}')};
  return m})}
// prop material: vertex colour x detail mask (stone courses, roof tiles, plaster), bump from the same mask, trees sway gently
function propMat(){return gq('propM',()=>{const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.86,metalness:0,envMapIntensity:.8});const dt=detailTex();
  m.onBeforeCompile=sh=>{sh.uniforms.tDetail={value:dt};sh.uniforms.uTime=V3.uTime;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 duv;attribute vec3 dk;attribute float sw;varying vec2 vDUv;varying vec3 vDk;uniform float uTime;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvDUv=duv;vDk=dk;if(sw>0.){vec2 wo=modelMatrix[3].xz+position.xz*3.;transformed.x+=sw*sin(uTime*1.7+wo.x*2.1+wo.y*1.3)*.006;transformed.z+=sw*cos(uTime*1.3+wo.y*1.9)*.004;}');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tDetail;varying vec2 vDUv;varying vec3 vDk;\nvec3 pnArb(vec3 sp,vec3 sn,vec2 dH,float fd){vec3 sx=normalize(dFdx(sp));vec3 sy=normalize(dFdy(sp));vec3 r1=cross(sy,sn);vec3 r2=cross(sn,sx);float det=dot(sx,r1)*fd;vec3 gr=sign(det)*(dH.x*r1+dH.y*r2);return normalize(abs(det)*sn-gr);}')
      .replace('#include <color_fragment>','#include <color_fragment>\nvec3 dtx=texture2D(tDetail,vDUv).rgb-.5;float dd=dot(dtx,vDk);diffuseColor.rgb*=1.+dd*.95;')
      .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor-dd*.25,.35,1.);')
      .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=pnArb(-vViewPosition,normal,vec2(dFdx(dd),dFdy(dd))*1.1,faceDirection);')};
  return m})}
const SIDE_MAT=()=>gq('sideM',()=>new THREE.MeshStandardMaterial({map:coreTex(),color:0xb0a488,roughness:.95,metalness:0}));
function topMat(t){const m=new THREE.MeshStandardMaterial({map:null,normalMap:V3.lowM?null:linenNormal(),normalScale:new THREE.Vector2(.32,.32),roughness:.74,metalness:0,envMapIntensity:.75});m.userData.top=1;return m}
function tileProto(t){if(V3.protos[t])return V3.protos[t];const grp=new THREE.Group();const P=tileProps(t);const top=topMat(t);top.map=tileTexture(t,P.foot);
  const slab=new THREE.Mesh(slabGeo(),[top,SIDE_MAT()]);slab.receiveShadow=true;slab.castShadow=true;slab.userData.slab=1;grp.add(slab);
  const pm=P.mesh(propMat());if(pm)grp.add(pm);for(const w of riverMeshes(t))grp.add(w);grp.userData.top=top.map;V3.protos[t]=grp;return grp}
// each laid tile gets its own faint tint and a hair of misalignment, like real cardboard on a table
function tileObj(t,r,real){const g=tileProto(t).clone();g.rotation.y=-r*Math.PI/2;if(real){const R=V3.rng||(V3.rng=seeded(2024));const s=g.children[0];const tm=s.material[0].clone();tm.color.setHSL(.1+(R()-.5)*.04,.25*R(),.97+R()*.03);s.material=[tm,s.material[1]];g.rotation.y+=(R()-.5)*.018;g.userData.j=[(R()-.5)*.024,(R()-.5)*.024]}return g}
// ---------- figures: wooden meeples, champion, mason and hog ----------
function meepleShape(){const R=[[0,.30],[.06,.10,.12,0],[.26,0,.38,0],[.45,0,.42,.08],[.37,.30,.26,.44],[.33,.51,.46,.53],[.56,.57,.50,.645],[.36,.71,.18,.70],[.115,.70,.11,.75]];
  const s=new THREE.Shape();s.moveTo(0,.30);for(let i=1;i<R.length;i++){const q=R[i];s.quadraticCurveTo(q[0],q[1],q[2],q[3])}
  s.absarc(0,.86,Math.hypot(.11,.11),-Math.PI/4,Math.PI*5/4,false);
  for(let i=R.length-1;i>=1;i--){const q=R[i],pr=R[i-1];const px=pr.length===2?pr[0]:pr[2],py=pr.length===2?pr[1]:pr[3];s.quadraticCurveTo(-q[0],q[1],-px,py)}return s}
function pigShape(){const s=new THREE.Shape();s.moveTo(-.34,0);s.lineTo(-.22,0);s.lineTo(-.2,.15);s.quadraticCurveTo(0,.11,.18,.15);s.lineTo(.2,0);s.lineTo(.32,0);s.lineTo(.34,.2);s.quadraticCurveTo(.43,.25,.47,.34);s.lineTo(.55,.345);s.quadraticCurveTo(.58,.4,.555,.46);s.lineTo(.45,.48);
  s.quadraticCurveTo(.41,.55,.36,.575);s.lineTo(.33,.70);s.lineTo(.25,.585);s.quadraticCurveTo(0,.65,-.30,.56);s.quadraticCurveTo(-.47,.50,-.45,.34);s.lineTo(-.52,.40);s.lineTo(-.5,.33);s.lineTo(-.45,.30);s.quadraticCurveTo(-.44,.17,-.34,.14);s.lineTo(-.34,0);return s}
function figGeo(k){return gq('fg'+k,()=>{const pig=k==='pig';const depth=pig?.24:.28;const g=new THREE.ExtrudeGeometry(pig?pigShape():meepleShape(),{depth,bevelEnabled:true,bevelThickness:.06,bevelSize:.045,bevelSegments:3,curveSegments:pig?5:7});
  smoothNormals(g,f=>Math.abs(f.z)>.9999,Math.cos(58*Math.PI/180));g.translate(0,.045,-depth/2);const P=g.attributes.position,uv=new Float32Array(P.count*2);for(let i=0;i<P.count;i++){uv[i*2]=(P.getX(i)+P.getZ(i)*.8)*.9+.5;uv[i*2+1]=P.getY(i)*.9}g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.computeBoundingSphere();return g})}
const FIGH={f:.62,big:.84,bld:.7,pig:.5};
function woodMat(p,ghost,adv){const R=V3.rng||(V3.rng=seeded(2024));const col=new THREE.Color(PCOL3[p]);if(ghost){return new THREE.MeshStandardMaterial({color:col,emissive:adv?new THREE.Color(0x3fd8f0):col,emissiveIntensity:adv?.9:.45,roughness:.5,transparent:true,opacity:.62,depthTest:false,depthWrite:false})}
  col.offsetHSL(0,(R()-.5)*.04,(R()-.5)*.04);const gt=grainTex().clone();gt.offset.set(R(),R());gt.repeat.set(.9+R()*.3,.9+R()*.3);gt.needsUpdate=true;
  return new THREE.MeshPhysicalMaterial({color:col,map:gt,bumpMap:gt,bumpScale:.22,roughness:.56,metalness:0,clearcoat:.22,clearcoatRoughness:.5,envMapIntensity:.9})}
function blobMesh(sx,sz){const m=new THREE.Mesh(gq('blobG',()=>{const g=new THREE.PlaneGeometry(1,1);g.rotateX(-Math.PI/2);return g}),gq('blobM',()=>new THREE.MeshBasicMaterial({map:blobTex(),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})));m.scale.set(sx,1,sz);m.position.y=.004;m.renderOrder=1;return m}
function figMesh(p,k,ty,ghost,adv){const g=new THREE.Group();const mat=woodMat(p,ghost,adv);const H=FIGH[k]||.62;const body=new THREE.Group();g.add(body);
  if(k==='pig'){const m=new THREE.Mesh(figGeo('pig'),mat);m.scale.setScalar(H/1.06);body.add(m);if(!ghost)g.add(blobMesh(.62,.34))}
  else{const m=new THREE.Mesh(figGeo('m'),mat);const s=H/1.06;m.scale.set(k==='bld'?s*.8:s,k==='bld'?s*1.08:s,s);body.add(m);
    if(k==='bld'){const hat=new THREE.Mesh(gq('bhat',()=>{const pts=[[0,0],[.3,0],[.3,.04],[.17,.06],[.16,.2],[0,.22]].map(q=>new THREE.Vector2(q[0],q[1]));return new THREE.LatheGeometry(pts,16)}),mat);hat.scale.setScalar(H*.62);hat.position.y=H*1.02;body.add(hat)}
    if((ty==='F')&&k!=='bld'){body.rotation.x=-Math.PI/2;body.position.set(0,(.14+.06)*s+.004,H*.5);if(!ghost)g.add(blobMesh(H*1.0,H*1.25))}
    else if(!ghost)g.add(blobMesh(H*1.05,H*.62))}
  body.traverse(o=>{if(o.isMesh){o.castShadow=!ghost;o.receiveShadow=!ghost;if(ghost)o.renderOrder=8}});g.userData.body=body;return g}
function spotWorld(k,l){const T=G.tiles[k];const [x,y]=unkey(k);const sp=rotP(buildGeo(T.t).spots[l],T.r);return new THREE.Vector3(x*TS+L(sp[0]),TH,y*TS+L(sp[1]))}
function spotWorldAt(t,r,x,y,l){const sp=rotP(buildGeo(t).spots[l],r);return new THREE.Vector3(x*TS+L(sp[0]),TH,y*TS+L(sp[1]))}
// ---------- little effects: dust puffs, sparkles ----------
function puff(pos,n,spread,col){if(!V3.on||!ANIM)return;for(let i=0;i<n;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puffTex(),color:col||0xe9d8b4,transparent:true,depthWrite:false,opacity:.0}));const a=i/n*6.283+Math.random()*.5;s.position.set(pos.x+Math.cos(a)*spread*.4,pos.y+.04,pos.z+Math.sin(a)*spread*.4);s.scale.setScalar(.12);s.renderOrder=9;V3.scene.add(s);
  V3.fx.push({s,t:0,life:.75+Math.random()*.3,v:new THREE.Vector3(Math.cos(a)*spread*1.2,.25+Math.random()*.3,Math.sin(a)*spread*1.2),g:.35*spread+.2,a:.55})}}
function sparkle(pos,col,n){if(!V3.on||!ANIM)return;for(let i=0;i<n;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puffTex(),color:new THREE.Color(col).multiplyScalar(2.2),transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,opacity:0}));const a=Math.random()*6.283,sp=.6+Math.random()*1.2;s.position.copy(pos);s.position.y+=.3;s.scale.setScalar(.09);s.renderOrder=11;V3.scene.add(s);
  V3.fx.push({s,t:0,life:.9+Math.random()*.4,v:new THREE.Vector3(Math.cos(a)*sp*.6,1.2+Math.random()*1.4,Math.sin(a)*sp*.6),g:-.02,a:.9,fall:2.2})}}
// ---------- overlays: legal squares, ghost tile, follower spots ----------
function glowMat(col,op,edge){return new THREE.MeshBasicMaterial({map:glowTex(edge),color:col,transparent:true,opacity:op==null?1:op,depthWrite:false})}
function glowGeo(){return gq('glowG',()=>{const g=new THREE.PlaneGeometry(TS*1.02,TS*1.02);g.rotateX(-Math.PI/2);return g})}
function sync3D(){if(!V3.on||!G)return;const sc=V3.scene;
  // tiles
  for(const k in V3.tiles)if(!G.tiles[k]||V3.tiles[k].t!==G.tiles[k].t||V3.tiles[k].r!==G.tiles[k].r){sc.remove(V3.tiles[k].g);delete V3.tiles[k]}
  for(const k of G.order){if(V3.tiles[k])continue;const T=G.tiles[k];const [x,y]=unkey(k);const g=tileObj(T.t,T.r,true);g.position.copy(cellWorld(x,y));const j=g.userData.j||[0,0];g.position.x+=j[0];g.position.z+=j[1];sc.add(g);V3.tiles[k]={g,t:T.t,r:T.r};
    if(ANIM&&!V3.bulk&&G.order.length>1){const ry=g.rotation.y,p0=g.position.clone();g.position.y=1.3;g.rotation.z=.06;V3.tweens.push({t:0,dur:.42,fn:k=>{const e=k<.78?1-Math.pow(1-k/.78,3):1;const b=k<.78?0:Math.sin((k-.78)/.22*Math.PI)*.035;g.position.y=1.3*(1-e)+b;g.rotation.z=.06*(1-e)},done:()=>{g.position.y=0;g.rotation.z=0;for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]])puff(new THREE.Vector3(p0.x+dx*TS*.46,0,p0.z+dz*TS*.46),3,.35)}})}}
  V3.bulk=false;
  // last placed marker
  const lastK=G.cur&&G.cur.k?G.cur.k:G.order[G.order.length-1];if(V3.lastK!==lastK){if(V3.lastM)sc.remove(V3.lastM);const m=new THREE.Mesh(glowGeo(),glowMat(new THREE.Color(1.1,.95,.7),.5,1));const [x,y]=unkey(lastK);m.position.copy(cellWorld(x,y));m.position.y=TH+.0045;m.scale.setScalar(.985);m.renderOrder=2;sc.add(m);V3.lastM=m;V3.lastK=lastK}
  // figures
  const want={};G.figs.forEach(f=>{const id=f.s+':'+f.k;want[id]=f});
  for(const id in V3.figs)if(!want[id]){const o=V3.figs[id];if(ANIM){const y0=o.position.y;V3.tweens.push({t:0,dur:.5,fn:k=>{const e=k*k;o.position.y=y0+e*1.1;o.scale.setScalar(Math.max(.01,1-e))},done:()=>sc.remove(o)});sparkle(o.position,0xfff1c8,5)}else sc.remove(o);delete V3.figs[id]}
  for(const id in want){if(V3.figs[id])continue;const f=want[id];const k=G.sk[f.s],l=G.sl[f.s];const T=G.tiles[k];const ty=TSEG[T.t][l].ty;const m=figMesh(f.p,f.k,ty);const p=spotWorld(k,l);
    if(f.k==='bld'||f.k==='pig')p.x+=.22,p.z+=.14;m.position.copy(p);m.rotation.y=(f.s*1.7)%6-.4;sc.add(m);V3.figs[id]=m;
    if(ANIM){const from=p.clone().add(new THREE.Vector3(-.5,1.5,.9)),b=m.userData.body;V3.tweens.push({t:0,dur:.5,fn:k=>{const e=Math.min(1,k/.72),ee=1-Math.pow(1-e,2);m.position.lerpVectors(from,p,ee);m.position.y+=Math.sin(e*Math.PI)*.35*(1-e);
        const q=k<.72?0:(k-.72)/.28;const sq=Math.sin(q*Math.PI)*.16*(1-q*.5);b.scale.set(1+sq*.6,1-sq,1+sq*.6)},done:()=>{m.position.copy(p);b.scale.set(1,1,1)}});
      setTimeout(()=>puff(p,7,.28),360)}}
  syncOverlays();V3.dirty=true}
function syncOverlays(){const sc=V3.scene;const sig=JSON.stringify([UI.cells,UI.ghost,UI.spotOpts&&UI.spotOpts.map(o=>[o.l,o.k,o.adv]),UI.advice&&UI.advice.place,UI.hl,G.cur&&G.cur.p]);if(sig===V3.osig)return;V3.osig=sig;
  if(V3.marks)sc.remove(V3.marks);if(V3.ghost)sc.remove(V3.ghost);if(V3.spots)sc.remove(V3.spots);V3.marks=V3.ghost=V3.spots=V3.ghostT=null;
  const mk=new THREE.Group();const fm=V3.markM||(V3.markM=glowMat(new THREE.Color(1.15,.98,.66)));V3.hoverM=V3.hoverM||glowMat(new THREE.Color(1.9,1.6,.95));
  for(const k of (UI.cells||[])){if(UI.ghost&&UI.ghost.k===k)continue;const [x,y]=unkey(k);const f=new THREE.Mesh(glowGeo(),fm);f.position.copy(cellWorld(x,y));f.position.y=.012;f.scale.setScalar(.96);f.userData.pulse=1;f.userData.k=k;f.renderOrder=2;mk.add(f)}
  sc.add(mk);V3.marks=mk;
  if(UI.ghost){const gh=UI.ghost;const [x,y]=unkey(gh.k);const g=new THREE.Group();const t=tileObj(G.cur.t,gh.r);g.add(t);const adv=UI.advice&&same(UI.advice.place,{act:'place',x,y,r:gh.r});
    const f=new THREE.Mesh(glowGeo(),glowMat(adv?new THREE.Color(.7,1.9,2.1):new THREE.Color(1.8,1.45,.75),1,1));f.position.y=TH+.012;f.scale.setScalar(1.02);f.renderOrder=3;g.add(f);
    const f2=new THREE.Mesh(glowGeo(),f.material);f2.position.y=.012;f2.scale.setScalar(1.12);f2.userData.under=1;f2.renderOrder=2;
    const sh=blobMesh(TS*1.25,TS*1.25);sh.material=gq('ghostSh',()=>{const m=sh.material.clone();m.opacity=.55;return m});
    const holder=new THREE.Group();holder.add(f2,sh);holder.position.copy(cellWorld(x,y));
    g.position.copy(cellWorld(x,y));g.userData.ghost=1;const wrap=new THREE.Group();wrap.add(g,holder);sc.add(wrap);V3.ghost=wrap;V3.ghostT=g}
  if(UI.spotOpts&&UI.spotOpts.length&&G.cur&&G.cur.k){const sg=new THREE.Group();const T=G.tiles[G.cur.k];for(const o of UI.spotOpts){const p=spotWorld(G.cur.k,o.l);const ty=TSEG[T.t][o.l].ty;
      const ring=new THREE.Mesh(gq('ringG',()=>{const g=new THREE.PlaneGeometry(.62,.62);g.rotateX(-Math.PI/2);return g}),new THREE.MeshBasicMaterial({map:ringTex(),color:o.adv?new THREE.Color(.6,1.8,2):new THREE.Color(1.9,1.6,.8),transparent:true,depthTest:false,depthWrite:false}));ring.position.copy(p);ring.position.y+=.01;ring.userData.pulse=1;ring.renderOrder=6;sg.add(ring);
      const gm=figMesh(G.cur.p,o.k||UI.kind||'f',ty,true,o.adv);gm.position.copy(p);if(o.k==='bld'||o.k==='pig'){gm.position.x+=.0}gm.rotation.y=-.4;gm.userData.bob=1;gm.userData.y0=p.y+.04;sg.add(gm)}sc.add(sg);V3.spots=sg}}
// floating "+N" medallion when a feature scores
function scorePop(text,col,pos){if(!V3.on)return;const c=cvs(256,128);const x=c.getContext('2d');x.translate(128,64);
  const g=x.createLinearGradient(0,-44,0,44);g.addColorStop(0,'#fff6df');g.addColorStop(1,'#ecd3a0');x.fillStyle=g;x.strokeStyle=col;x.lineWidth=7;x.beginPath();x.roundRect?x.roundRect(-78,-40,156,80,40):x.rect(-78,-40,156,80);x.shadowColor='rgba(40,20,5,.5)';x.shadowBlur=10;x.shadowOffsetY=4;x.fill();x.shadowColor='transparent';x.stroke();
  x.font='bold 58px "Marcellus SC",Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#3a2414';x.fillText(text,0,4);
  const tx=tex(c,true);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:false}));s.scale.set(.01,.005,1);s.position.copy(pos);s.position.y+=.7;s.renderOrder=10;V3.scene.add(s);V3.pops.push({s,t:0});sparkle(pos,col,14)}
function loop3D(){requestAnimationFrame(loop3D);const now=performance.now();
  // frame-time watch: 3 s of bad frames (while we are actually drawing every frame) steps the quality down
  if(V3.justDrew&&V3.prevTick){const iv=now-V3.prevTick;V3.ivE=V3.ivE==null?iv:V3.ivE*.8+iv*.2;if(!V3.lockQ){if(iv>70){V3.slowT+=iv;V3.okT=0}else{V3.okT+=iv;if(V3.okT>1500)V3.slowT=0}if(V3.slowT>3000)stepDown()}}
  V3.prevTick=now;V3.justDrew=false;
  const dt=Math.min(.05,V3.clock.getDelta());V3.t+=dt;const t=V3.t;let active=V3.dirty;
  if(V3.camTo){const c=V3.camTo;c.t+=dt*2.2;const k=Math.min(1,c.t);const a=1-Math.pow(.0009,dt);V3.look.lerp(c.look,Math.max(a,k*.3));V3.dist+=(c.dist-V3.dist)*Math.max(a,k*.3);if(k>=1&&V3.look.distanceTo(c.look)<.01&&Math.abs(V3.dist-c.dist)<.01){V3.look.copy(c.look);V3.dist=c.dist;V3.camTo=null}placeCam();active=true}
  for(const tw of V3.tweens){tw.t+=dt;const k=Math.min(1,tw.t/tw.dur);tw.fn(k);if(k>=1&&tw.done)tw.done();active=true}
  V3.tweens=V3.tweens.filter(tw=>tw.t<tw.dur);
  for(const p of V3.pops){p.t+=dt;const k=Math.min(1,p.t/.35);const e=1+2.4*Math.pow(k-1,3)+1.4*Math.pow(k-1,2);p.s.scale.set(1.15*e,.575*e,1);p.s.position.y+=dt*.45;p.s.material.opacity=Math.max(0,1-(p.t-1.3)/.7);if(p.t>2)V3.scene.remove(p.s);active=true}V3.pops=V3.pops.filter(p=>p.t<=2);
  for(const f of V3.fx){f.t+=dt;const k=f.t/f.life;f.s.position.addScaledVector(f.v,dt);f.v.multiplyScalar(Math.pow(.08,dt));f.v.y-=(f.fall||0)*dt;f.s.scale.setScalar(.1+k*f.g);f.s.material.opacity=f.a*Math.sin(Math.min(1,k)*Math.PI);if(k>=1){V3.scene.remove(f.s);f.s.material.dispose()}active=true}V3.fx=V3.fx.filter(f=>f.t<f.life);
  const pulse=(V3.marks&&V3.marks.children.length)||V3.ghost||V3.spots;
  if(pulse){const a=.5+.35*Math.abs(Math.sin(t*2.4));if(V3.marks)for(const c of V3.marks.children)if(c.userData.pulse){const hv=V3.hover===c.userData.k;c.material.opacity=a;c.scale.setScalar(hv?1.0:.96);c.position.y=hv?.03:.012}
    if(V3.marks)for(const c of V3.marks.children)if(c.userData.pulse)c.material=V3.hover===c.userData.k?V3.hoverM:V3.markM;
    if(V3.ghostT&&V3.ghost){V3.ghostT.position.y=.2+.05*Math.sin(t*3.2);V3.ghostT.rotation.z=.012*Math.sin(t*2.1)}
    if(V3.spots)for(const c of V3.spots.children){if(c.userData.pulse){const k=1+.14*Math.sin(t*5);c.scale.set(k,1,k)}if(c.userData.bob)c.position.y=c.userData.y0+.06+.05*Math.sin(t*3.4)}active=true}
  const covered=(typeof GX!=='undefined'&&GX.open)||UI.modal;const idleAnim=GFX[V3.q].anim&&!covered;
  if(!active&&!idleAnim&&V3.idle>0.5&&!(performance.now()<(V3.keepUntil||0))&&!!covered===!!V3.wasCov)return;V3.idle=active?0:(V3.idle||0)+dt;
  // keep the page responsive: idle life (water, trees) at ~24 fps, motion at full rate, only occasional frames while a popup or the start screen covers the map
  if(covered!==V3.wasCov){V3.wasCov=covered;V3.keepUntil=performance.now()+1200}const gap=performance.now()<(V3.keepUntil||0)?0:covered?.5:active?(V3.q==='low'?.033:0):.042;
  // a very slow GPU (software rendering): leave the device as much idle time as a frame takes, so taps and the panel stay responsive
  const slowG=V3.ivE>90?V3.ivE/1000:0;if(V3.t-(V3.lastR||0)<Math.max(gap,slowG)&&(!V3.dirty||slowG))return;
  V3.uTime.value=V3.t;V3.lastR=V3.t;V3.dirty=false;draw();V3.justDrew=true}
function resetScene(){if(!V3.on)return;for(const k in V3.tiles)V3.scene.remove(V3.tiles[k].g);V3.tiles={};for(const k in V3.figs)V3.scene.remove(V3.figs[k]);V3.figs={};if(V3.lastM)V3.scene.remove(V3.lastM);V3.lastK=null;V3.osig='';V3.bulk=true;V3.fitted=false;fitAll(true)}
