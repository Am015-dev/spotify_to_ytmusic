// ---------- 3D island diorama (Three.js r158): a sculpted, storm-lashed island on a living sea. The scene only mirrors G; it never owns game state.
// Everything WebGL-only is behind init3D (jsdom never gets past its first line), so the 2D map and every test hook keep working.
const V3={on:false,t:0,tiles:{},pawns:{},parts:[],tweens:[],fx:[],weather:{rain:0,snow:0,storm:0},night:0,nightT:0,stormT:0,pick:null,hover:null,flash:0,
  q:'high',pref:'auto',busy:true,U:{time:{value:0},wind:{value:.35}},mist:{}};
const HEXR=2.05,HEXH=.55,HR0=HEXR*.955,HAP=HR0*Math.sqrt(3)/2,TOPY=HEXH/2;
// ---------- graphics quality: High (bloom + grade, 2k soft shadows), Medium (1k shadows, no post), Low (no shadows, no post, lighter water and mist) ----------
const GFX={high:{pr:2,sh:2048,post:true,mist:3,rain:2400,nm:'High'},med:{pr:1.5,sh:1024,post:false,mist:2,rain:1600,nm:'Medium'},low:{pr:1,sh:0,post:false,lite:true,mist:1,rain:800,nm:'Low'}};
const GFXQ=['high','med','low'];
function gfxAuto(){let small=false;try{small=Math.min(innerWidth,innerHeight)<600||(matchMedia('(pointer:coarse)').matches&&Math.max(innerWidth,innerHeight)<1200)}catch(e){}return small?'med':'high'}
function gfxPref(){try{const v=localStorage.getItem('swi_gfx');return GFX[v]?v:'auto'}catch(e){return 'auto'}}
V3.pref=gfxPref();
function gfxLabel(){return V3.pref==='auto'?'Auto'+(V3.on?' · '+GFX[V3.q].nm:''):GFX[V3.pref].nm}
const PH=typeof PerfHUD!=='undefined'?PerfHUD:null;
function setGfx(v){V3.pref=GFX[v]?v:'auto';try{localStorage.setItem('swi_gfx',V3.pref)}catch(e){}if(PH)PH.hitch();applyQ(V3.pref==='auto'?gfxAuto():V3.pref)}
function applyQ(q){V3.q=GFX[q]?q:'high';const lite=V3.q==='low';if(V3.lite!==lite){V3.lite=lite;if(V3.layout&&V3.r)rebuildLite()}if(typeof onGfxChange==='function')try{onGfxChange()}catch(e){}if(!V3.r)return;const c=GFX[V3.q],r=V3.r;
  {const want=Math.min(c.pr,window.devicePixelRatio||1);r.setPixelRatio(PH?PH.pixelRatio(want):want)}
  const sh=c.sh>0;if(r.shadowMap.enabled!==sh){r.shadowMap.enabled=sh;V3.scene.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)})}
  V3.sun.castShadow=sh;if(sh&&V3.sun.shadow.mapSize.x!==c.sh){V3.sun.shadow.mapSize.set(c.sh,c.sh);if(V3.sun.shadow.map){V3.sun.shadow.map.dispose();V3.sun.shadow.map=null}}
  lowMats(V3.q==='low');lowNoise(V3.q==='low');V3.rim.visible=V3.boltL.visible=V3.q!=='low';if(c.post&&!V3.post)V3.post=makePost();if(V3.rain)V3.rain.geometry.setDrawRange(0,c.rain*2);
  V3.mistL&&V3.mistL.forEach((m,i)=>m.visible=i<c.mist);if(V3.seaM)V3.seaM.uniforms.uQ.value=V3.q==='low'?0:V3.q==='med'?1:2;if(V3.sea){const seg=V3.q==='low'?44:V3.q==='med'?110:150;if(V3.sea.userData.seg!==seg){V3.sea.userData.seg=seg;V3.sea.geometry.dispose();const g=new THREE.PlaneGeometry(320,320,seg,seg);g.rotateX(-Math.PI/2);V3.sea.geometry=g}}resize3D()}
// rebuild the geometry-heavy parts (tiles, island skirt, camp, pawns) at the new detail; pawns keep their place
function rebuildLite(){const sc=V3.scene;for(const id in V3.tiles)sc.remove(V3.tiles[id].g);V3.tiles={};if(V3.camp){sc.remove(V3.camp);V3.camp=null}
  const keep={};for(const k in V3.pawns){const o=V3.pawns[k];keep[k]=[o.position.clone(),o.rotation.y];sc.remove(o)}V3.pawns={};
  if(V3.islP)buildIsland(...V3.islP);V3.lowM=null;sync3D();lowMats(V3.q==='low');
  for(const k in keep){const o=V3.pawns[k];if(o){o.position.copy(keep[k][0]);o.rotation.y=keep[k][1]}}if(PH)PH.hitch()}
// Low: no reflections and no bump maps (the costly per-pixel work)
function lowMats(low){if(V3.lowM===low)return;V3.lowM=low;const sc=V3.scene;sc.environment=low?null:V3.env;V3.hemiBase=low?1.0:.62;
  sc.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>{if(m.userData.bump){m.bumpMap=low?null:m.userData.bump;m.needsUpdate=true}})})}
// ---------- PerfHUD hooks: the shared speed overlay, speed test, auto step-down and idle saver (perfhud.js) ----------
function perfHooks(){if(!PH)return;
  PH.register({game:'Shipwreck Isle',renderer:V3.r,levels:GFXQ.slice(),names:{high:'High',med:'Medium',low:'Low'},anchor:'.gx-board',corner:'tl',
    getLevel:()=>V3.q,isAuto:()=>V3.pref==='auto',autoTop:()=>gfxAuto(),
    // auto, test and restore changes are not saved; Apply on the result card is a choice by hand (saved, never auto-changed)
    setLevel:(l,why)=>{if(why==='apply'){setGfx(l);if(typeof gfxBtn==='function')gfxBtn()}else applyQ(l)},
    basePR:()=>Math.min(GFX[V3.q].pr,window.devicePixelRatio||1),onPixelRatio:v=>{V3.r.setPixelRatio(v);resize3D()},
    orbit:t=>{if(t==null){if(V3.orb0){Object.assign(V3.orbit,V3.orb0);V3.orb0=null;placeCam()}return}if(!V3.orb0)V3.orb0={a:V3.orbit.a,e:V3.orbit.e};V3.orbit.a=V3.orb0.a+Math.sin(t*Math.PI*2)*.9;V3.orbit.e=V3.orb0.e-.18*Math.sin(t*Math.PI);placeCam()},
    isAnimating:()=>V3.busy,
    beforeTest:()=>{if(typeof closeMenu==='function')closeMenu();if(typeof closeGfx==='function')closeGfx()}})}
function init3D(){
  if(!window.THREE||/jsdom/i.test(navigator.userAgent))return false;
  const cv=document.getElementById('c3');if(!cv)return false;
  let r;try{r=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});if(!r.getContext())return false}catch(e){return false}
  V3.r=r;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=.92;r.useLegacyLights=false;
  V3.aniso=Math.min(8,r.capabilities.getMaxAnisotropy());V3.texS=gfxAuto()==='high'?384:256;
  const sc=V3.scene=new THREE.Scene();sc.fog=new THREE.Fog(0x9fb0bb,60,200);
  try{V3.env=sc.environment=envMap(r)}catch(e){}
  const cam=V3.cam=new THREE.PerspectiveCamera(40,16/10,.1,900);V3.look=new THREE.Vector3(0,0,1.5);V3.orbit={a:0,e:.95,d:21};
  // storm-muted warm key light (the moon at night), cool sky fill, a pale rim from behind, and a cold light for lightning
  V3.hemi=new THREE.HemisphereLight(0xcfe0f0,0x5a4a36,.62);sc.add(V3.hemi);V3.hemiBase=.62;
  const sun=V3.sun=new THREE.DirectionalLight(0xffe2b8,2.6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;sun.shadow.radius=4;sc.add(sun);sc.add(sun.target);
  V3.rim=new THREE.DirectionalLight(0xbfd6ff,.9);sc.add(V3.rim);sc.add(V3.rim.target);
  V3.boltL=new THREE.DirectionalLight(0xd8e4ff,0);sc.add(V3.boltL);sc.add(V3.boltL.target);
  V3.fire=new THREE.PointLight(0xff8a3d,0,16,1.7);sc.add(V3.fire);
  buildSky();buildSea();buildRain();
  cv.addEventListener('pointerdown',e=>{V3.drag={x:e.clientX,y:e.clientY,a:V3.orbit.a,e:V3.orbit.e,moved:false}});
  window.addEventListener('pointermove',e=>{const d=V3.drag;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)>5)d.moved=true;V3.orbit.a=d.a-dx*.006;V3.orbit.e=Math.max(.35,Math.min(1.35,d.e+dy*.004));placeCam()});
  window.addEventListener('pointerup',e=>{const d=V3.drag;V3.drag=null;if(d&&!d.moved&&e.target===cv)onClick3D(e)});
  cv.addEventListener('wheel',e=>{e.preventDefault();V3.orbit.d=Math.max(12,Math.min(48,V3.orbit.d+e.deltaY*.02));placeCam()},{passive:false});
  cv.addEventListener('pointermove',e=>{V3.hover=pickTile(e)});cv.addEventListener('pointerleave',()=>{V3.hover=null});
  V3.on=true;applyQ(V3.pref==='auto'?gfxAuto():V3.pref);placeCam();
  new ResizeObserver(resize3D).observe(cv.parentElement);resize3D();
  document.body.classList.add('three');V3.clock=new THREE.Clock();perfHooks();(PH?PH.raf:requestAnimationFrame)(loop3D);return true}
function placeCam(){if(!V3.cam)return;const o=V3.orbit;V3.cam.position.set(V3.look.x+Math.sin(o.a)*Math.cos(o.e)*o.d,V3.look.y+Math.sin(o.e)*o.d,V3.look.z+Math.cos(o.a)*Math.cos(o.e)*o.d);V3.cam.lookAt(V3.look);
  // the key light comes low from the west; its shadow box hugs the island
  const c=V3.center||V3.look,e=(V3.rad||10)+3;const s=V3.sun;s.target.position.copy(c);Object.assign(s.shadow.camera,{left:-e,right:e,top:e,bottom:-e,near:2,far:90});s.shadow.camera.updateProjectionMatrix();
  V3.rim.position.set(c.x+14,10,c.z-18);V3.rim.target.position.copy(c);
  const f=V3.scene.fog;f.near=o.d*1.6+14;f.far=o.d*5+110}
function resize3D(){if(!V3.r)return;const el=V3.r.domElement.parentElement;const w=Math.max(50,el.clientWidth),h=Math.max(50,el.clientHeight);V3.r.setSize(w,h,false);V3.r.domElement.style.width=w+'px';V3.r.domElement.style.height=h+'px';V3.cam.aspect=w/h;V3.cam.fov=w/h<1?50:40;V3.cam.updateProjectionMatrix();
  if(V3.post||V3.lt){const v=V3.r.getDrawingBufferSize(new THREE.Vector2());if(V3.post)V3.post.setSize(v.x,v.y);if(V3.lt)V3.lt.setSize(v.x,v.y)}fitDist()}
// distance that fits the whole island for this aspect ratio
function fitDist(){if(!V3.rad)return;const a=V3.cam.aspect;const vf=V3.cam.fov*Math.PI/180;const hf=2*Math.atan(Math.tan(vf/2)*a);const need=V3.rad*1.12;const d=Math.max(need/Math.tan(vf/2)*.78,need/Math.tan(hf/2))+4;V3.d0=Math.max(14,d);if(V3.focus==null){V3.orbit.d=V3.d0;placeCam()}}
// ---------- small helpers ----------
// Low builds a lighter scene (V3.lite): the same shapes with fewer segments, cached under their own keys.
// At phone size SwiftShader spent ~80% of a Low frame on vertices (119k triangles), not on pixels.
const LITEK={frond:1,fern:1,sph:1,dome:1,leaf:1,cyl:1,cylS:1,cone:1,baseL:1,ringL:1,legsL:1,torsoL:1,loinL:1,beltT:1,collar:1,coalG:1,eyeG:1};
const GEOS={};function gq(k,f){if(V3.lite&&LITEK[k.replace(/\d+$/,'')])k+='~';return GEOS[k]||(GEOS[k]=f())}
const LO=(a,b)=>V3.lite?b:a;
function cvs(w,h){const c=document.createElement('canvas');c.width=w;c.height=h||w;return c}
function tex(c,srgb,rep){const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=V3.aniso||1;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping}return t}
function seeded(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
const NZ=(()=>{const R=seeded(4242);return Float32Array.from({length:64*64},()=>R())})();
function vnoise(x,y){const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;const m=v=>((v%64)+64)%64;const a=NZ[m(y0)*64+m(x0)],b=NZ[m(y0)*64+m(x0+1)],c=NZ[m(y0+1)*64+m(x0)],d=NZ[m(y0+1)*64+m(x0+1)];const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}
function fbm(x,y){return vnoise(x,y)*.5+vnoise(x*2.03+5.1,y*2.03+1.7)*.28+vnoise(x*4.1+2.3,y*4.1+7.9)*.14+vnoise(x*8.3+9.4,y*8.3+3.3)*.08}
const sst=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const hexd=(x,z)=>{const ax=Math.abs(x),az=Math.abs(z);return Math.max(ax,ax*.5+az*.8660254)};// = apothem on a pointy-top (along z) hex edge
function blobTex(){return gq('blob',()=>{const c=cvs(64),x=c.getContext('2d');const g=x.createRadialGradient(32,32,2,32,32,31);g.addColorStop(0,'rgba(0,0,0,.7)');g.addColorStop(.5,'rgba(0,0,0,.35)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return tex(c,false)})}
function puffTex(){return gq('puff',()=>{const c=cvs(64),x=c.getContext('2d');const g=x.createRadialGradient(32,32,1,32,32,31);g.addColorStop(0,'rgba(255,250,235,.9)');g.addColorStop(.5,'rgba(240,230,210,.35)');g.addColorStop(1,'rgba(240,230,210,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return tex(c,true)})}
const GLN=`float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+1.),f.x),f.y);}
#ifdef LOWQ
uniform sampler2D uNz;
float fbm(vec2 p){return texture2D(uNz,p*.0625).r*.9375;}
#else
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+17.1;a*=.5;}return s;}
#endif
`;
// the same 4-octave value noise baked once into a 256px tile that repeats every 16 units (Low only)
function nzTex(){return gq('nzT',()=>{const S=256,d=new Uint8Array(S*S*4);const w=(i,P)=>((i%P)+P)%P%64,h=(i,j,P)=>NZ[w(j,P)*64+w(i,P)];
  const pn=(x,y,P)=>{const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);const a=h(i,j,P),b=h(i+1,j,P),c=h(i,j+1,P),e=h(i+1,j+1,P);return (a+(b-a)*sx)*(1-sy)+(c+(e-c)*sx)*sy};
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const u=i/S*16,v=j/S*16;let s=0,a=.5,f=1;for(let o=0;o<4;o++){s+=a*pn(u*f+o*5,v*f+o*3,16*f);a*=.5;f*=2}const k=(j*S+i)*4;d[k]=d[k+1]=d[k+2]=Math.min(255,s/.9375*255);d[k+3]=255}
  const t=new THREE.DataTexture(d,S,S,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t})}
function lowNoise(on){if(!V3.scene)return;V3.scene.traverse(o=>{const m=o.material;if(!m||!m.isShaderMaterial||!/float fbm/.test(m.fragmentShader))return;m.defines=m.defines||{};const had='LOWQ' in m.defines;
  if(on===had)return;if(on){m.defines.LOWQ='';m.uniforms.uNz={value:nzTex()}}else delete m.defines.LOWQ;m.needsUpdate=true})}
const GLEND='\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n';
// ---------- environment: a stormy sky dome with a bright break in the clouds, pre-filtered for reflections ----------
function envMap(r){const s=new THREE.Scene();const g=new THREE.SphereGeometry(20,48,24);const pos=g.attributes.position,col=new Float32Array(pos.count*3);
  const top=new THREE.Color('#6d8196'),hor=new THREE.Color('#d8d4c6'),bot=new THREE.Color('#3a3f38'),c=new THREE.Color();
  for(let i=0;i<pos.count;i++){const y=pos.getY(i)/20;if(y>0)c.copy(hor).lerp(top,Math.pow(y,.5));else c.copy(hor).lerp(bot,Math.min(1,-y*3));c.toArray(col,i*3)}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));s.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
  const sunM=new THREE.Mesh(new THREE.SphereGeometry(2.4,16,8),new THREE.MeshBasicMaterial({color:new THREE.Color(9,7.5,6)}));sunM.position.set(-12,9,8);s.add(sunM);
  const box=new THREE.Mesh(new THREE.PlaneGeometry(16,16),new THREE.MeshBasicMaterial({color:new THREE.Color(1.3,1.35,1.45),side:THREE.DoubleSide}));box.position.set(0,17,0);box.rotation.x=Math.PI/2;s.add(box);
  const pm=new THREE.PMREMGenerator(r);const rt=pm.fromScene(s,.04);pm.dispose();return rt.texture}
// ---------- post-processing (High only): MSAA HDR target, soft bloom, ACES, a storm-cool grade, vignette ----------
function makePost(){const r=V3.r;const P={};const mk=()=>new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,depthBuffer:false});
  P.rt=new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,samples:r.capabilities.isWebGL2?4:0});P.a=mk();P.b=mk();
  P.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);P.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));P.quad.frustumCulled=false;P.sc=new THREE.Scene();P.sc.add(P.quad);
  const vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';const sm=(u,f)=>new THREE.ShaderMaterial({uniforms:u,vertexShader:vs,fragmentShader:f,depthTest:false,depthWrite:false});
  P.bright=sm({t:{value:null},th:{value:1.0}},'uniform sampler2D t;uniform float th;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(th,th*2.4,l),1.);}');
  P.blur=sm({t:{value:null},d:{value:new THREE.Vector2()}},'uniform sampler2D t;uniform vec2 d;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb*.2270;c+=(texture2D(t,vUv+d*1.3846).rgb+texture2D(t,vUv-d*1.3846).rgb)*.3162;c+=(texture2D(t,vUv+d*3.2308).rgb+texture2D(t,vUv-d*3.2308).rgb)*.0703;gl_FragColor=vec4(c,1.);}');
  P.fin=sm({t:{value:null},b:{value:null},ex:{value:1},bk:{value:.7},asp:{value:1},cool:{value:0},vig:{value:.72}},`uniform sampler2D t,b;uniform float ex,bk,asp,cool,vig;varying vec2 vUv;
vec3 RRT(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 q=v*(.983729*v+.4329510)+.238081;return a/q;}
vec3 aces(vec3 c){const mat3 I=mat3(vec3(.59719,.07600,.02840),vec3(.35458,.90834,.13383),vec3(.04823,.01566,.83777));const mat3 O=mat3(vec3(1.60475,-.10208,-.00327),vec3(-.53108,1.10813,-.07276),vec3(-.07367,-.00605,1.07602));c*=ex/.6;c=I*c;c=RRT(c);c=O*c;return clamp(c,0.,1.);}
vec3 srgb(vec3 c){return mix(pow(c,vec3(.41666))*1.055-.055,c*12.92,vec3(lessThanEqual(c,vec3(.0031308))));}
void main(){vec3 c=texture2D(t,vUv).rgb+texture2D(b,vUv).rgb*bk;c=aces(c);
 float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.1-cool*.25);
 vec3 sh=vec3(.93,1.,1.06),hi=vec3(1.04,1.,.94);c*=mix(sh,hi,smoothstep(.15,.7,l));c=mix(c,c*vec3(.9,.97,1.08),cool*.5);c=mix(c,c*c*(3.-2.*c),.14);
 vec2 q=(vUv-.5)*vec2(asp,1.);float v=smoothstep(1.05,.3,length(q)*1.05);c*=mix(vig,1.,v);
 gl_FragColor=vec4(srgb(clamp(c,0.,1.)),1.);}`);
  P.setSize=(w,h)=>{P.rt.setSize(w,h);const hw=Math.max(2,w>>1),hh=Math.max(2,h>>1);P.a.setSize(hw,hh);P.b.setSize(hw,hh);P.fin.uniforms.asp.value=w/h};
  P.pass=(m,to)=>{P.quad.material=m;r.setRenderTarget(to);r.render(P.sc,P.cam)};
  P.render=()=>{r.setRenderTarget(P.rt);r.render(V3.scene,V3.cam);
    P.bright.uniforms.t.value=P.rt.texture;P.pass(P.bright,P.a);
    const hw=1/P.a.width,hh=1/P.a.height;for(const k of [1,2.4]){P.blur.uniforms.t.value=P.a.texture;P.blur.uniforms.d.value.set(hw*k,0);P.pass(P.blur,P.b);P.blur.uniforms.t.value=P.b.texture;P.blur.uniforms.d.value.set(0,hh*k);P.pass(P.blur,P.a)}
    const F=P.fin.uniforms;F.t.value=P.rt.texture;F.b.value=P.a.texture;F.ex.value=r.toneMappingExposure;F.cool.value=Math.min(1,V3.stormT*.8+V3.nightT);F.vig.value=.74-V3.nightT*.14-V3.stormT*.08;P.pass(P.fin,null)};
  const v=r.getDrawingBufferSize(new THREE.Vector2());P.setSize(v.x,v.y);return P}
// Low renders the scene into a plain 8-bit target without MSAA, then copies it to the canvas: 4x fewer samples to rasterise and blend.
// isXRRenderTarget makes three.js tone-map and sRGB-encode into this target exactly as it does on screen, so blending and colours match the other levels.
function makeLite(){const r=V3.r,v=r.getDrawingBufferSize(new THREE.Vector2());const L={rt:new THREE.WebGLRenderTarget(v.x,v.y,{samples:0})};L.rt.texture.colorSpace=THREE.SRGBColorSpace;L.rt.isXRRenderTarget=true;
  L.sc=new THREE.Scene();L.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:{t:{value:L.rt.texture}},depthTest:false,depthWrite:false,toneMapped:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:'uniform sampler2D t;varying vec2 vUv;void main(){gl_FragColor=vec4(texture2D(t,vUv).rgb,1.);}'}));
  q.frustumCulled=false;L.sc.add(q);L.setSize=(w,h)=>L.rt.setSize(w,h);L.render=()=>{r.setRenderTarget(L.rt);r.render(V3.scene,V3.cam);r.setRenderTarget(null);r.render(L.sc,L.cam)};return L}
function draw(){const r=V3.r,c=GFX[V3.q];r.info.autoReset=false;r.info.reset();/* PerfHUD reads draws and triangles for the whole frame */if(c.post&&V3.post){V3.post.render()}else if(c.lite){(V3.lt||(V3.lt=makeLite())).render()}else{r.setRenderTarget(null);r.render(V3.scene,V3.cam)}}
// ---------- sky: a shader dome with drifting storm clouds, a sun break by day, moon and stars by night, lightning inside the clouds ----------
function buildSky(){const m=V3.skyM=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{uTime:V3.U.time,uStorm:{value:0},uNight:{value:0},uFlash:{value:0},uFD:{value:new THREE.Vector3(1,.3,0)},uSun:{value:new THREE.Vector3(-.6,.35,.45).normalize()},uMoon:{value:new THREE.Vector3(.45,.5,-.7).normalize()},uFog:{value:new THREE.Color()}},
  vertexShader:'varying vec3 vD;void main(){vD=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}',
  fragmentShader:GLN+`uniform float uTime,uStorm,uNight,uFlash;uniform vec3 uFD,uSun,uMoon,uFog;varying vec3 vD;
void main(){vec3 d=normalize(vD);float y=d.y;float yy=max(y,0.);
 vec3 dayT=vec3(.16,.30,.50),dayH=vec3(.62,.66,.66),stT=vec3(.035,.045,.06),stH=vec3(.20,.23,.25),nT=vec3(.004,.008,.022),nH=vec3(.02,.035,.07);
 vec3 top=mix(mix(dayT,stT,uStorm),nT,uNight),hor=mix(mix(dayH,stH,uStorm),nH,uNight);
 vec3 c=mix(hor,top,pow(yy,.55));
 float sd=max(dot(d,uSun),0.);c+=vec3(1.,.72,.42)*(pow(sd,8.)*.55+pow(sd,90.)*1.6)*(1.-uStorm*.8)*(1.-uNight);
 vec2 p=d.xz/(yy+.18)*1.2;p+=vec2(uTime*.018,uTime*.006)*(1.+uStorm*2.);
 float n=fbm(p*1.1)+.5*fbm(p*2.7+3.);float cov=mix(.62,.28,uStorm);float cl=smoothstep(cov,cov+.35,n*.7)*smoothstep(-.02,.12,y);
 vec3 lit=mix(mix(vec3(.85,.84,.82),vec3(.26,.29,.33),uStorm),vec3(.05,.07,.12),uNight);vec3 shd=mix(mix(vec3(.45,.48,.52),vec3(.09,.10,.12),uStorm),vec3(.012,.018,.035),uNight);
 vec3 cc=mix(lit,shd,smoothstep(.4,1.1,n));cc+=vec3(1.,.8,.6)*pow(sd,6.)*.5*(1.-uNight)*(1.-uStorm*.6);
 float md=max(dot(d,uMoon),0.);cc+=vec3(.35,.42,.6)*pow(md,10.)*uNight*.8;
 c=mix(c,cc,cl);
 float st=step(.9975,h21(floor(d.xz/(yy+.6)*260.)))*smoothstep(.1,.4,y)*(1.-cl)*uNight*(1.-uStorm*.8);c+=vec3(st)*(.6+.4*sin(uTime*3.+d.x*90.));
 c+=vec3(.9,.92,1.)*smoothstep(.9990,.9996,md)*uNight*(1.-cl*.85)*1.6+vec3(.3,.38,.55)*pow(md,60.)*uNight*.5;
 float fl=uFlash*(.35+pow(max(dot(d,uFD),0.),6.)*2.5);c+=vec3(.75,.8,1.)*fl*(cl*.9+.1);
 c=mix(c,uFog,smoothstep(.14,-.02,y));
 gl_FragColor=vec4(c,1.);`+GLEND+'}'});
  const s=V3.sky=new THREE.Mesh(new THREE.SphereGeometry(400,24,12),m);s.frustumCulled=false;s.renderOrder=-10;V3.scene.add(s)
  // low storm scud racing between the camera and the island
  const vg=new THREE.PlaneGeometry(140,140);vg.rotateX(-Math.PI/2);V3.veil=new THREE.Mesh(vg,new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,uniforms:{uTime:V3.U.time,uStorm:m.uniforms.uStorm,uFlash:m.uniforms.uFlash,uNight:m.uniforms.uNight},
    vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:GLN+`uniform float uTime,uStorm,uFlash,uNight;varying vec3 vW;void main(){vec2 p=vW.xz*.045+vec2(uTime*.06,uTime*.025);float n=fbm(p)+.5*fbm(p*2.7+vec2(uTime*.05,0.));
 float a=uStorm*smoothstep(.55,1.05,n)*.5;vec3 c=mix(vec3(.16,.18,.2),vec3(.03,.04,.06),uNight)*(.7+.5*n)+vec3(.7,.75,.9)*uFlash*.5;gl_FragColor=vec4(c,a);`+GLEND+'}'}));
  V3.veil.renderOrder=7;V3.veil.frustumCulled=false;V3.veil.visible=false;V3.scene.add(V3.veil)}
// ---------- the sea: a shader plane with rolling waves, shallow lagoon colours, surf lines and foam where it meets the shore, whitecaps in a storm ----------
function buildSea(){const g=new THREE.PlaneGeometry(320,320,150,150);g.rotateX(-Math.PI/2);
  const m=V3.seaM=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
    uniforms:{uTime:V3.U.time,uAmp:{value:.16},uStorm:{value:0},uNight:{value:0},uFlash:{value:0},uQ:{value:2},uDist:{value:null},uBox:{value:new THREE.Vector4(-30,-30,1/60,0)},
      uSunD:{value:new THREE.Vector3()},uSunC:{value:new THREE.Color()},uSky:{value:new THREE.Color()},uFogC:{value:new THREE.Color()},uFogN:{value:60},uFogF:{value:200}},
    vertexShader:`uniform float uTime,uAmp;uniform sampler2D uDist;uniform vec4 uBox;varying vec3 vW;varying vec3 vN;varying float vH,vD;
vec3 W(vec2 p,float t){vec2 d1=normalize(vec2(1.,.35)),d2=normalize(vec2(-.4,1.)),d3=normalize(vec2(.8,-.7)),d4=normalize(vec2(-1.,-.2));
 float a1=sin(dot(d1,p)*.33+t*1.05),a2=sin(dot(d2,p)*.47+t*1.3),a3=sin(dot(d3,p)*.8+t*1.9),a4=sin(dot(d4,p)*1.25+t*2.4);
 float h=a1*1.+a2*.6+a3*.32+a4*.16;
 vec2 g=d1*.33*cos(dot(d1,p)*.33+t*1.05)+d2*.47*.6*cos(dot(d2,p)*.47+t*1.3)+d3*.8*.32*cos(dot(d3,p)*.8+t*1.9)+d4*1.25*.16*cos(dot(d4,p)*1.25+t*2.4);return vec3(h,g);}
void main(){vec4 w=modelMatrix*vec4(position,1.);vec2 uv=(w.xz-uBox.xy)*uBox.z;float dd=(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.)?16.:texture2D(uDist,uv).r*16.;vD=dd;
 float at=.25+.75*smoothstep(.0,4.,dd);vec3 hw=W(w.xz,uTime)*uAmp*at;w.y+=hw.x;vH=hw.x/max(uAmp,.01);vN=normalize(vec3(-hw.y,1.,-hw.z));vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:GLN+`uniform float uTime,uStorm,uNight,uFlash,uQ,uFogN,uFogF;uniform vec3 uSunD,uSunC,uSky,uFogC;uniform sampler2D uDist;uniform vec4 uBox;varying vec3 vW;varying vec3 vN;varying float vH,vD;
void main(){vec2 uv=(vW.xz-uBox.xy)*uBox.z;float d=(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.)?16.:texture2D(uDist,uv).r*16.;vec3 N=vN;
 if(uQ>.5){vec2 q=mat2(.8,.6,-.6,.8)*vW.xz*.8+vec2(uTime*.3,uTime*.2),q2=mat2(.6,-.8,.8,.6)*vW.xz*1.9-vec2(uTime*.4,-uTime*.1);float e=.2;float n0=vn(q)+.5*vn(q2),nx=vn(q+vec2(e,0.))+.5*vn(q2+vec2(e,0.)),nz=vn(q+vec2(0.,e))+.5*vn(q2+vec2(0.,e));N=normalize(N+vec3(n0-nx,0.,n0-nz)*(.7+uStorm*.8));}
 vec3 V=normalize(cameraPosition-vW);
 vec3 shallow=mix(vec3(.09,.36,.35),vec3(.10,.2,.2),uStorm),deep=mix(vec3(.008,.045,.075),vec3(.015,.03,.04),uStorm);
 float sh=smoothstep(.2,7.,d);vec3 col=mix(shallow,deep,sh);col=mix(col,col*vec3(.12,.2,.35),uNight*.85);
 float df=max(dot(N,uSunD),0.);col*=.55+.6*df;
 float fr=pow(1.-max(dot(N,V),0.),4.);col=mix(col,uSky,.15+fr*.65);
 vec3 H=normalize(uSunD+V);float sp=pow(max(dot(N,H),0.),mix(180.,60.,uStorm));col+=uSunC*sp*(1.4-uStorm*.9)*(1.-uNight*.6);
 float n=fbm(vW.xz*.7+vec2(uTime*.12,-uTime*.08));
 float edge=smoothstep(.45,.0,d)*(.5+.5*n);
 float sl=sin(d*3.1-uTime*1.55+n*4.);float surf=smoothstep(.8,.98,sl)*smoothstep(3.,.35,d)*smoothstep(.5,.75,fbm(vW.xz*1.6-uTime*.2));
 float cap=smoothstep(.6,.78,fbm(vW.xz*vec2(.8,2.)+vec2(uTime*.35,0.)))*smoothstep(.3,1.2,vH)*uStorm*smoothstep(1.,4.,d);
 float foam=clamp(max(edge,max(surf*.85,cap*.8)),0.,1.);
 vec3 fc=mix(vec3(.92,.95,.95),vec3(.10,.13,.2),uNight*.8)*(.6+.5*df);col=mix(col,fc,foam);
 col+=vec3(.6,.68,.85)*uFlash*(.25+fr);
 float a=mix(.5,.97,smoothstep(0.,3.2,d));a=max(a,foam*.95);
 float fd=smoothstep(uFogN,uFogF,length(vW-cameraPosition));col=mix(col,uFogC,fd);a=mix(a,1.,fd);
 gl_FragColor=vec4(col,a);`+GLEND+'}'});
  const s=V3.sea=new THREE.Mesh(g,m);s.position.y=-.55;s.renderOrder=1;s.frustumCulled=false;V3.scene.add(s)}
// ---------- rain (streaks falling in the vertex shader) and snow ----------
function buildRain(){const n=2400;const pos=new Float32Array(n*6),e=new Float32Array(n*2);const R=seeded(99);for(let i=0;i<n;i++){const x=(R()-.5)*56,y=R()*32,z=(R()-.5)*56;pos.set([x,y,z,x,y,z],i*6);e[i*2+1]=1}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aEnd',new THREE.BufferAttribute(e,1));
  const u={uTime:V3.U.time,uRain:{value:0},uC:{value:new THREE.Vector3()},uWind:V3.U.wind,uCol:{value:new THREE.Color(.62,.7,.8)}};
  V3.rain=new THREE.LineSegments(g,new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:u,
    vertexShader:'attribute float aEnd;uniform float uTime;uniform vec3 uC;uniform float uWind;varying float vA;void main(){vec3 p=position;p.y=mod(p.y-uTime*26.,32.)-1.;p.x+=p.y*uWind*.35;p.x+=aEnd*(.12+uWind*.3);p.y+=aEnd*1.1;p.xz+=uC.xz;vA=aEnd;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}',
    fragmentShader:'uniform float uRain;uniform vec3 uCol;varying float vA;void main(){gl_FragColor=vec4(uCol,uRain*(.12+.5*vA));'+GLEND+'}'}));
  V3.rain.frustumCulled=false;V3.rain.renderOrder=5;V3.scene.add(V3.rain);
  const sp=new Float32Array(900*3);for(let i=0;i<900;i++)sp.set([(R()-.5)*50,R()*30,(R()-.5)*50],i*3);const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
  V3.snow=new THREE.Points(sg,new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:V3.U.time,uSnow:{value:0},uC:u.uC},
    vertexShader:'uniform float uTime;uniform vec3 uC;void main(){vec3 p=position;p.y=mod(p.y-uTime*2.2,30.);p.x+=sin(uTime*.7+p.z)*.6;p.xz+=uC.xz;vec4 mv=viewMatrix*vec4(p,1.);gl_PointSize=clamp(90./-mv.z,1.,6.);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform float uSnow;void main(){vec2 q=gl_PointCoord-.5;float a=smoothstep(.5,.1,length(q));gl_FragColor=vec4(vec3(.95),a*uSnow);'+GLEND+'}'}));V3.snow.frustumCulled=false;V3.scene.add(V3.snow)}
// ---------- geometry builders: vertex-coloured parts merged into one mesh per tile ----------
const _m4=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_v=new THREE.Vector3(),_s=new THREE.Vector3(),_c=new THREE.Color();
function M(x,y,z,rx,ry,rz,sx,sy,sz){_e.set(rx||0,ry||0,rz||0);_q.setFromEuler(_e);return new THREE.Matrix4().compose(_v.set(x,y,z),_q,_s.set(sx==null?1:sx,sy==null?(sx==null?1:sx):sy,sz==null?(sx==null?1:sx):sz))}
function segM(a,b,r){const d=_v.copy(b).sub(a);const L=d.length();_q.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return new THREE.Matrix4().compose(a.clone(),_q.clone(),new THREE.Vector3(r,L,r))}
function mergeVerts(g){const p=g.attributes.position;const map=new Map(),pos=[],idx=[];for(let i=0;i<p.count;i++){const k=Math.round(p.getX(i)*1e3)+','+Math.round(p.getY(i)*1e3)+','+Math.round(p.getZ(i)*1e3);let j=map.get(k);if(j==null){j=pos.length/3;map.set(k,j);pos.push(p.getX(i),p.getY(i),p.getZ(i))}idx.push(j)}const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setIndex(idx);return o}
// weld identical vertices of a flat triangle soup into an indexed mesh: same picture, but the GPU shades each shared corner once (3-5x fewer vertex-shader runs)
function indexGeo(g){if(g.index)return g;const at=Object.keys(g.attributes).map(k=>g.attributes[k]),n=at[0].count,map=new Map(),rem=new Int32Array(n);let u=0;const keep=[];
  for(let i=0;i<n;i++){let k='';for(const a of at){const A=a.array,s=a.itemSize;for(let c=0;c<s;c++)k+=Math.round(A[i*s+c]*2048)+','}let j=map.get(k);if(j===undefined){j=u++;map.set(k,j);keep.push(i)}rem[i]=j}
  if(u>n*.8)return g;const o=new THREE.BufferGeometry();for(const name in g.attributes){const a=g.attributes[name],s=a.itemSize,A=new Float32Array(u*s);keep.forEach((i,j)=>{for(let c=0;c<s;c++)A[j*s+c]=a.array[i*s+c]});o.setAttribute(name,new THREE.BufferAttribute(A,s))}
  o.setIndex(Array.from(rem));return o}
function ni(g){g=g.index?g.toNonIndexed():g;g.computeBoundingBox();return g}
function Parts(){this.p=[];this.n=[];this.c=[];this.w=[]}
Parts.prototype.add=function(g,col,m,sway,ao){const P=g.attributes.position.array,N=g.attributes.normal.array,bb=g.boundingBox;const y0=bb.min.y,yh=Math.max(1e-4,bb.max.y-bb.min.y);
  const nm=new THREE.Matrix3().getNormalMatrix(m);const c=_c.set(col);const a=ao==null?.3:ao;const v=new THREE.Vector3(),n=new THREE.Vector3();
  for(let i=0;i<P.length;i+=3){const ty=(P[i+1]-y0)/yh;v.set(P[i],P[i+1],P[i+2]).applyMatrix4(m);n.set(N[i],N[i+1],N[i+2]).applyMatrix3(nm).normalize();this.p.push(v.x,v.y,v.z);this.n.push(n.x,n.y,n.z);const k=1-a+a*ty;this.c.push(c.r*k,c.g*k,c.b*k);this.w.push((sway||0)*ty)}return this};
Parts.prototype.mesh=function(mat){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));g.setAttribute('sway',new THREE.Float32BufferAttribute(this.w,1));const gi=indexGeo(g);gi.computeBoundingSphere();const o=new THREE.Mesh(gi,mat||propMat());o.castShadow=true;o.receiveShadow=true;return o};
// prop material: painted resin with a soft sheen; fronds and leaves sway with the wind
function propMat(){return gq(V3.lite?'propL':'propM',()=>{const m=V3.lite?new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}):new THREE.MeshStandardMaterial({vertexColors:true,roughness:.72,metalness:0,side:THREE.DoubleSide,envMapIntensity:.6});
  m.onBeforeCompile=s=>{s.uniforms.uTime=V3.U.time;s.uniforms.uWind=V3.U.wind;s.vertexShader='attribute float sway;uniform float uTime,uWind;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 wp0=modelMatrix*vec4(position,1.);float ph=wp0.x*.7+wp0.z*.9;transformed.x+=sway*uWind*(sin(uTime*1.9+ph)*.6+sin(uTime*3.7+ph*1.3)*.3)*.14;transformed.z+=sway*uWind*cos(uTime*1.4+ph)*.07;')};return m})}
const G_={cyl:()=>gq('cyl',()=>{const g=new THREE.CylinderGeometry(.8,1,1,LO(7,5),1);g.translate(0,.5,0);return ni(g)}),
  cylS:()=>gq('cylS',()=>{const g=new THREE.CylinderGeometry(1,1,1,LO(8,6),1);g.translate(0,.5,0);return ni(g)}),
  cone:()=>gq('cone',()=>{const g=new THREE.ConeGeometry(1,1,LO(7,4));g.translate(0,.5,0);return ni(g)}),
  ball:()=>gq('ball',()=>ni(new THREE.IcosahedronGeometry(1,1))),
  sph:()=>gq('sph',()=>ni(new THREE.SphereGeometry(1,LO(12,7),LO(9,5)))),
  dome:()=>gq('dome',()=>ni(new THREE.SphereGeometry(1,LO(12,7),LO(6,3),0,Math.PI*2,0,Math.PI/2))),
  box:()=>gq('box',()=>ni(new THREE.BoxGeometry(1,1,1))),
  rock:k=>gq('rock'+k,()=>{const g=new THREE.IcosahedronGeometry(1,1);const p=g.attributes.position;for(let i=0;i<p.count;i++){_v.fromBufferAttribute(p,i).normalize();const f=.7+.6*fbm(_v.x*1.3+k*4.7,_v.z*1.3+_v.y*1.9+k*2.3);p.setXYZ(i,_v.x*f,_v.y*f*.85,_v.z*f)}g.computeVertexNormals();g.computeBoundingBox();return g}),
  leaf:k=>gq('leaf'+k,()=>{const ge=new THREE.IcosahedronGeometry(1,LO(2,1));const p=ge.attributes.position;for(let i=0;i<p.count;i++){_v.fromBufferAttribute(p,i).normalize();const f=.8+.38*fbm(_v.x*1.6+k*3.1+5,_v.z*1.6+_v.y*1.3+k);p.setXYZ(i,_v.x*f,_v.y*f*.82,_v.z*f)}const m=mergeVerts(ge);m.computeVertexNormals();return ni(m)}),
  // a drooping palm frond along +x, folded along its spine
  frond:()=>gq('frond',()=>{const pos=[],N=LO(7,4);for(let i=0;i<N;i++){const x0=i/N,x1=(i+1)/N;const w0=Math.sin(Math.PI*Math.min(.97,x0+.03))*.2,w1=Math.sin(Math.PI*Math.min(.97,x1))*.2;const y0=-x0*x0*.55,y1=-x1*x1*.55;
      for(const s of [-1,1]){pos.push(x0,y0,0, x1,y1,0, x1,y1-.05,s*w1, x0,y0,0, x1,y1-.05,s*w1, x0,y0-.05,s*w0)}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();g.computeBoundingBox();return g}),
  fern:()=>gq('fern',()=>{const g=G_.frond().clone();g.scale(1,1.4,1.3);g.computeBoundingBox();return g})};
function palm(P,x,y,z,R,s){s=s||1;const h=(1.15+R()*.55)*s,la=R()*6.28,lean=(.25+R()*.35)*h;let prev=new THREE.Vector3(x,y,z);const n=6;
  for(let k=1;k<=n;k++){const f=k/n;const p=new THREE.Vector3(x+Math.cos(la)*lean*f*f,y+h*f,z+Math.sin(la)*lean*f*f);P.add(G_.cyl(),k%2?0x8a6a45:0x6f5236,segM(prev,p,(.075-.03*f)*s),.0,.15);prev=p}
  const top=prev;for(let k=0;k<3;k++)P.add(G_.sph(),0x5a3e22,M(top.x+Math.cos(k*2.1)*.07*s,top.y-.07*s,top.z+Math.sin(k*2.1)*.07*s,0,0,0,.065*s),0,.2);
  const fc=[0x3f8a3a,0x4f9a42,0x2f7033,0x5aa347];const nf=7+Math.floor(R()*2);for(let k=0;k<nf;k++){const a=k/nf*6.28+R()*.3;const L=(.85+R()*.3)*s;P.add(G_.frond(),fc[k%4],M(top.x,top.y,top.z,0,-a,(R()-.3)*.35,L,L,L),1,.25)}}
function jtree(P,x,y,z,R,s,dark){s=s||1;const h=(.75+R()*.5)*s;const tc=dark?0x1f2622:0x5b4630;P.add(G_.cyl(),tc,M(x,y,z,0,0,0,.09*s,h,.09*s),0,.3);
  const cols=dark?[0x34463e,0x3c5048,0x2f4038,0x46584e]:[0x245c2a,0x2f6f30,0x3d8237,0x4f9440,0x1d4d24];const L=3+Math.floor(R()*3);
  for(let i=0;i<L;i++){const f=i/L;const a=R()*6.28,o=(.05+R()*.22)*s*(1-f*.5);const r=(.5-f*.22+R()*.12)*s;P.add(G_.leaf(i%3),cols[Math.min(cols.length-1,i+(R()<.4?1:0))],M(x+Math.cos(a)*o,y+h+(f*.55-.05)*s,z+Math.sin(a)*o,R()*3,R()*3,0,r,r*.78,r),.35+f*.4,.45)}}
function acacia(P,x,y,z,R,s){s=s||1;const h=(.7+R()*.3)*s;P.add(G_.cyl(),0x6b5540,M(x,y,z,(R()-.5)*.2,0,(R()-.5)*.2,.06*s,h,.06*s),0,.2);const c=[0x6d9a3a,0x7fa846,0x5e8a34];for(let i=0;i<3;i++){const a=i*2.1+R(),o=.2*s;P.add(G_.leaf(i),c[i],M(x+Math.cos(a)*o,y+h+.02*i,z+Math.sin(a)*o,0,R()*3,0,.42*s,.16*s,.42*s),.5,.4)}}
function bush(P,x,y,z,R,s,cols){s=s||1;cols=cols||[0x3d7a34,0x4a8a3a,0x5d9a45];for(let i=0;i<3;i++){const a=R()*6.28,o=.14*s;const r=(.2+R()*.12)*s;P.add(G_.leaf(i),cols[i%cols.length],M(x+Math.cos(a)*o,y+r*.4,z+Math.sin(a)*o,R()*3,R()*3,0,r,r*.8,r),.3,.5)}}
function tuft(P,x,y,z,R,col){for(let i=0;i<4;i++){const a=R()*6.28;P.add(G_.cone(),col||0xa9b85a,M(x+Math.cos(a)*.06,y,z+Math.sin(a)*.06,(R()-.5)*.6,0,(R()-.5)*.6,.03,.22+R()*.12,.03),.8,.5)}}
function rock(P,x,y,z,R,s,col){const k=Math.floor(R()*3);P.add(G_.rock(k),col||0x7d766c,M(x,y+s*.25,z,R()*3,R()*3,R()*3,s,s*(.6+R()*.3),s),0,.45)}
function fern(P,x,y,z,R,s,col){for(let k=0;k<6;k++){const a=k/6*6.28+R()*.4;P.add(G_.fern(),col||0x3b7f34,M(x,y+.05,z,0,-a,.35+R()*.2,.32*s,.32*s,.32*s),.8,.4)}}
// ---------- terrain: every tile is a thick painted board tile with a sculpted relief on top ----------
const TPAL={beach:{side:'#b89a66'},river:{side:'#6a5a3e'},plains:{side:'#7a6a44'},hills:{side:'#6e6450'},mountains:{side:'#6f6a62'},unknown:{side:'#2c3431'},down:{side:'#3a3530'}};
// the height field (local tile units) for a terrain; rim=0 at the tile edge so the relief meets the board
function terrainField(terr,seed){const R=seeded(seed*31+11);const ox=R()*40,oz=R()*40;const pk=[];
  const np=terr==='mountains'?3:terr==='hills'?3:terr==='unknown'?2:0;
  for(let i=0;i<np;i++){const a=R()*6.28,d=terr==='mountains'?(i?.55+R()*.35:R()*.25):.35+R()*.6;pk.push({x:Math.cos(a)*d,z:Math.sin(a)*d,h:terr==='mountains'?(i?.65+R()*.4:1.25+R()*.35):terr==='hills'?.28+R()*.22:.22+R()*.12,w:terr==='mountains'?(i?.42:.55)+R()*.15:.5+R()*.25})}
  const ang=R()*Math.PI,ca=Math.cos(ang),sa=Math.sin(ang),ph=R()*6;const pool={x:(R()-.5)*1.2,z:(R()-.5)*1.2};
  const F={terr,ox,oz,pk,chan:(x,z)=>Math.abs(-sa*x+ca*z+.28*Math.sin((ca*x+sa*z)*1.7+ph)),pool};
  F.h=(x,z)=>{const e=Math.max(0,1-hexd(x,z)/HAP);const rim=sst(0,.2,e);const n=fbm(x*.8+ox,z*.8+oz);let h=0;
    let g=0;for(const p of pk){g+=p.h*Math.exp(-((x-p.x)**2+(z-p.z)**2)/(p.w*p.w))}
    if(terr==='beach'){h=.05+.07*(n-.5)+.02*Math.sin(x*5.5+z*2+n*5);h-=.14*Math.exp(-((x-pool.x)**2+(z-pool.z)**2)/.18)}
    else if(terr==='plains'){h=.07+.16*(n-.5)}
    else if(terr==='river'){h=.12+.14*(n-.5)-.3*sst(.42,.12,F.chan(x,z))*sst(0,.1,e)}
    else if(terr==='hills'){h=.08+g+.2*Math.abs(n-.5)}
    else if(terr==='mountains'){const rn=1-Math.abs(fbm(x*1.6+ox,z*1.6+oz)*2-1);h=g*(.8+.35*rn)+.1*rn}
    else if(terr==='unknown'){h=.06+g*.6+.12*(n-.5)}
    return h*(terr==='mountains'||terr==='hills'?Math.pow(rim,.7):rim)};
  return F}
// paint the top of a tile from its height field: colour, soft baked light, wet sand, snow, riverbanks
function paintTile(F,S){const c=cvs(S),x=c.getContext('2d'),id=x.createImageData(S,S),D=id.data;const rc=cvs(S/2),rx=rc.getContext('2d'),rid=rx.createImageData(S/2,S/2),RD=rid.data;
  const G1=S+1,H=new Float32Array(G1*G1);for(let j=0;j<G1;j++)for(let i=0;i<G1;i++){H[j*G1+i]=F.h((i/S*2-1)*HR0,(j/S*2-1)*HR0)}F.H=H;F.S=S;
  const T=F.terr,cell=2*HR0/S;const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];const hx=h=>[(h>>16&255),(h>>8&255),(h&255)];
  const C={sand:hx(0xe2cc98),sand2:hx(0xd2b57c),wet:hx(0x9c845a),foam:hx(0xf2efe4),g1:hx(0x86ad4e),g2:hx(0xb1b45c),g3:hx(0x5f8f3a),dry:hx(0xc4ae6a),j1:hx(0x2c5e2a),j2:hx(0x3f7a33),j3:hx(0x1f4a24),mud:hx(0x6b5a3a),bed:hx(0x3d4e48),
    r1:hx(0x857d70),r2:hx(0x9d9587),r3:hx(0x5f5a52),snow:hx(0xeef2f5),u1:hx(0x2f4038),u2:hx(0x1f2b27),u3:hx(0x3a3048),dirt:hx(0x8a7450)};
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const k=j*G1+i;const h=H[k];const gx=(H[k+1]-h)/cell,gz=(H[k+G1]-h)/cell;const slope=Math.hypot(gx,gz);
    const X=(i/S*2-1)*HR0,Z=(j/S*2-1)*HR0;const e=Math.max(0,1-hexd(X,Z)/HAP);const n=fbm(X*1.7+F.ox,Z*1.7+F.oz),n2=vnoise(X*9+F.oz,Z*9+F.ox);let col,ro=.9;
    if(T==='beach'){col=mix(C.sand,C.sand2,n);col=mix(col,C.sand2,.35*sst(.3,.9,Math.sin(X*7+Z*2.5+n*6)*.5+.5));const wet=Math.max(sst(.2,.03,e+(n-.5)*.08),sst(-.03,-.1,h-.02));col=mix(col,C.wet,wet*.85);ro=.9-wet*.55;
      if(e<.05&&n2>.45)col=mix(col,C.foam,.7);if(n2>.93)col=mix(col,[240,228,210],.8)}
    else if(T==='plains'){col=mix(C.g1,C.g2,sst(.35,.7,n));col=mix(col,C.g3,sst(.55,.8,n2)*.5);col=mix(col,C.dry,sst(.6,.8,fbm(X*.9+3,Z*.9))*.6);if(n2>.96)col=[230,220,120];if(n2<.03)col=[220,120,140]}
    else if(T==='river'){col=mix(C.j1,C.j2,n);col=mix(col,C.j3,sst(.5,.85,n2)*.6);const ch=F.chan(X,Z);col=mix(col,C.mud,sst(.62,.36,ch)*sst(0,.1,e));if(h<.02)col=mix(C.mud,C.bed,sst(.02,-.08,h));ro=h<.03?.4:.85}
    else if(T==='hills'){col=mix(C.g3,C.g1,n);const rk=sst(.45,1.1,slope+(n2-.5)*.4)+sst(.3,.5,h)*.4;col=mix(col,mix(C.r1,C.r2,n2),Math.min(1,rk))}
    else if(T==='mountains'){col=mix(C.r1,C.r2,n);col=mix(col,C.r3,.35*sst(.3,.8,Math.sin(h*22+n*5)*.5+.5));col=mix(col,C.g3,sst(.22,.05,h)*.7);const sn=sst(.9,1.05,h+(n2-.5)*.25-slope*.12);col=mix(col,C.snow,sn);ro=.85-sn*.35}
    else if(T==='down'){col=mix([58,52,46],[44,40,36],n);if(Math.abs(Math.sin(X*3+Z*5+n*6))<.04)col=[24,22,20]}
    else{col=mix(C.u1,C.u2,n);col=mix(col,C.u3,sst(.6,.9,n2)*.5)}
    const L=Math.max(0,Math.min(1.4,1+(gx*.55-gz*.45)*.9));const sh=.78+.22*L;const edge=e<.012?.72:1;
    const o=(j*S+i)*4;D[o]=Math.min(255,col[0]*sh*edge);D[o+1]=Math.min(255,col[1]*sh*edge);D[o+2]=Math.min(255,col[2]*sh*edge);D[o+3]=255;
    if(!(i&1)&&!(j&1)){const q=((j>>1)*(S/2)+(i>>1))*4;RD[q]=RD[q+1]=RD[q+2]=Math.round(ro*255);RD[q+3]=255}}
  x.putImageData(id,0,0);rx.putImageData(rid,0,0);return {map:tex(c,true),rough:tex(rc,false)}}
function sampleH(F,x,z){if(!F||!F.H)return 0;const S=F.S,G1=S+1;const u=(x/HR0+1)/2*S,v=(z/HR0+1)/2*S;const i=Math.max(0,Math.min(S-1,Math.floor(u))),j=Math.max(0,Math.min(S-1,Math.floor(v)));const fu=Math.min(1,Math.max(0,u-i)),fv=Math.min(1,Math.max(0,v-j));const H=F.H;
  return (H[j*G1+i]*(1-fu)+H[j*G1+i+1]*fu)*(1-fv)+(H[(j+1)*G1+i]*(1-fu)+H[(j+1)*G1+i+1]*fu)*fv}
// the sculpted cap: a hex fan subdivided into triangles, displaced by the height field, normals from its slope
function capGeo(F,N){const pos=[],nor=[],uv=[];const cs=[];for(let i=0;i<6;i++){const a=i/6*Math.PI*2;cs.push([Math.sin(a)*HR0,Math.cos(a)*HR0])}const e=.02;
  const P=(x,z)=>{const h=sampleH(F,x,z);const hx=sampleH(F,x+e,z)-sampleH(F,x-e,z),hz=sampleH(F,x,z+e)-sampleH(F,x,z-e);pos.push(x,TOPY+.004+h,z);const n=_v.set(-hx/(2*e),1,-hz/(2*e)).normalize();nor.push(n.x,n.y,n.z);uv.push((x/HR0+1)/2,1-(z/HR0+1)/2)};
  for(let s=0;s<6;s++){const A=cs[s],B=cs[(s+1)%6];const pt=(a,b)=>[A[0]*a/N+B[0]*b/N,A[1]*a/N+B[1]*b/N];
    for(let a=0;a<N;a++)for(let b=0;a+b<N;b++){const p0=pt(a,b),p1=pt(a+1,b),p2=pt(a,b+1);P(...p0);P(...p1);P(...p2);if(a+b<N-1){const p3=pt(a+1,b+1);P(...p1);P(...p3);P(...p2)}}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return indexGeo(g)}
function hexShape(r){const s=new THREE.Shape();for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const x=Math.sin(a)*r,y=Math.cos(a)*r;i?s.lineTo(x,y):s.moveTo(x,y)}s.closePath();return s}
// the board tile: a bevelled hex slab
function slabGeo(){return gq('slab',()=>{const t=.07,D=HEXH-2*t;const g=new THREE.ExtrudeGeometry(hexShape(HR0-.02),{depth:D,bevelEnabled:true,bevelThickness:t,bevelSize:.07,bevelSegments:3,curveSegments:1});g.rotateX(-Math.PI/2);g.translate(0,TOPY-D-t,0);return g})}
function strataTex(col){return gq('strata'+col,()=>{const S=256,c=cvs(S,64),x=c.getContext('2d');const b=new THREE.Color(col);const R=seeded(col.length*7+parseInt(col.slice(1),16)%997);
  for(let y=0;y<64;y++){const k=.78+.3*vnoise(y*.35,3.1)+(R()-.5)*.06;x.fillStyle=`rgb(${b.r*255*k|0},${b.g*255*k|0},${b.b*255*k|0})`;x.fillRect(0,y,S,1)}
  for(let i=0;i<260;i++){x.fillStyle=R()<.5?'rgba(0,0,0,.18)':'rgba(255,240,210,.12)';x.fillRect(R()*S,R()*64,2+R()*8,1+R()*2)}
  x.fillStyle='rgba(255,245,220,.25)';x.fillRect(0,0,S,3);const t=tex(c,true,true);t.repeat.set(.25,1.6);return t})}
function sideMat(terr){if(V3.lite)return gq('sideL'+terr,()=>new THREE.MeshLambertMaterial({map:strataTex(TPAL[terr].side)}));return gq('side'+terr,()=>{const m=new THREE.MeshStandardMaterial({map:strataTex(TPAL[terr].side),roughness:.88});m.userData.bump=m.map;m.bumpMap=m.map;m.bumpScale=.6;return m})}
function waterMat(){if(V3.lite)return gq('waterL',()=>new THREE.MeshPhongMaterial({color:0x2f7f96,transparent:true,opacity:.78,shininess:90,specular:0x6a8a96}));return gq('waterM',()=>new THREE.MeshPhysicalMaterial({color:0x2f7f96,roughness:.08,metalness:0,transparent:true,opacity:.78,clearcoat:1,envMapIntensity:1.2}))}
function tileMesh(t){const grp=new THREE.Group();const terr=t.down?'down':t.terr;const T=TERR_OK[terr]?terr:'unknown';const F=terrainField(T==='down'?'plains':T,t.id*977+3+(T==='unknown'?0:(t.no||0)*131));if(T==='down')F.h=()=>0;F.terr=T;
  const tS=T==='unknown'||T==='down'?Math.min(256,V3.texS):V3.texS,tk=T+'|'+(t.id*977+3+(T==='unknown'?0:(t.no||0)*131))+'|'+tS;V3.txC=V3.txC||{};const tx=V3.txC[tk]||(V3.txC[tk]=paintTile(F,tS));
  const top=V3.lite?new THREE.MeshLambertMaterial({map:tx.map}):new THREE.MeshStandardMaterial({map:tx.map,roughnessMap:tx.rough,roughness:1,bumpMap:V3.lowM?null:tx.map,bumpScale:T==='mountains'?2.2:1.4,envMapIntensity:.55});if(!V3.lite)top.userData.bump=tx.map;
  const slab=new THREE.Mesh(slabGeo(),[gq('hideM',()=>new THREE.MeshBasicMaterial({visible:false})),sideMat(T)]);slab.castShadow=slab.receiveShadow=true;grp.add(slab);
  const cap=new THREE.Mesh(capGeo(F,T==='mountains'||T==='hills'?LO(18,9):LO(12,6)),top);cap.castShadow=cap.receiveShadow=true;cap.userData.tile=t.id;grp.add(cap);grp.userData.top=top;grp.userData.F=F;
  if(T==='river'||T==='beach'){const w=new THREE.Mesh(gq('waterG',()=>{const g=new THREE.ShapeGeometry(hexShape(HR0*.97));g.rotateX(-Math.PI/2);return g}),waterMat());w.position.y=TOPY-.03;w.receiveShadow=true;grp.add(w)}
  const R=seeded(t.id*977+3);const P=new Parts();const gy=(x,z)=>TOPY+sampleH(F,x,z)-.01;
  const spots=(n,ok,dmin)=>{const o=[];for(let k=0;k<n*8&&o.length<n;k++){const a=R()*Math.PI*2,d=.35+R()*1.15;const x=Math.cos(a)*d,z=Math.sin(a)*d;if(hexd(x,z)>HAP*.8)continue;if(ok&&!ok(x,z))continue;if(o.some(p=>Math.hypot(p[0]-x,p[1]-z)<(dmin||.45)))continue;if(Math.hypot(x+1.1,z+1.15)<.5||Math.hypot(x-1.2,z+.9)<.45)continue;o.push([x,z])}return o};
  if(T==='beach'){for(const [x,z] of spots(3,(x,z)=>Math.hypot(x-F.pool.x,z-F.pool.z)>.6))palm(P,x,gy(x,z),z,R);for(const [x,z] of spots(3,null,.3))rock(P,x,gy(x,z),z,R,.1+R()*.08,0x9a9082);
    const [dx,dz]=spots(1)[0]||[.6,.4];P.add(G_.cylS(),0xb9aa90,M(dx,gy(dx,dz)+.05,dz,Math.PI/2,R()*3,0,.05,.8,.05),0,.1)}
  if(T==='river'){const off=(x,z)=>F.chan(x,z)>.45;for(const [x,z] of spots(7,off,.42))jtree(P,x,gy(x,z),z,R,.9+R()*.4);for(const [x,z] of spots(5,off,.3))fern(P,x,gy(x,z),z,R,.8+R()*.5);for(const [x,z] of spots(3,off,.3))bush(P,x,gy(x,z),z,R,.9)}
  if(T==='plains'){for(const [x,z] of spots(2))acacia(P,x,gy(x,z),z,R);for(const [x,z] of spots(10,null,.22))tuft(P,x,gy(x,z),z,R,R()<.5?0xb7bb62:0x93ad50);for(const [x,z] of spots(3,null,.3))bush(P,x,gy(x,z),z,R,.7,[0x6d9a3a,0x7fa846,0x5a8a34])}
  if(T==='hills'){for(const [x,z] of spots(4,null,.4))rock(P,x,gy(x,z),z,R,.16+R()*.14);for(const [x,z] of spots(3,null,.5))jtree(P,x,gy(x,z),z,R,.8+R()*.3);for(const [x,z] of spots(4,null,.25))tuft(P,x,gy(x,z),z,R,0x8aa34c)}
  if(T==='mountains'){for(const [x,z] of spots(5,null,.35))rock(P,x,gy(x,z),z,R,.12+R()*.15,0x736d64);for(const [x,z] of spots(2,(x,z)=>sampleH(F,x,z)<.35,.5))jtree(P,x,gy(x,z),z,R,.6,false)}
  if(T==='unknown'){for(const [x,z] of spots(2,null,.8))rock(P,x,gy(x,z)-.05,z,R,.18+R()*.12,0x3e4642);for(const [x,z] of spots(2,null,.8)){const h=.5+R()*.3;P.add(G_.cyl(),0x2a2622,M(x,gy(x,z),z,(R()-.5)*.3,0,(R()-.5)*.3,.045,h,.045),0,.3);P.add(G_.cyl(),0x2a2622,M(x,gy(x,z)+h*.6,z,0,R()*3,1.1,.025,.3,.025),0,.2)}}
  // resource and marker props: wood and food sources, the totem, a natural cave
  const tok=(x,z,col)=>{const y=gy(x,z);P.add(G_.cylS(),col,M(x,y,z,0,0,0,.26,.07,.26),0,.35);return y+.07};
  (t.src||[]).forEach((s,i)=>{const x=-1.1+i*.7,z=-1.15;const y=tok(x,z,s==='food'?0x7a2a22:0x5a3a1c);
    if(s==='food'){for(let k=0;k<5;k++)P.add(G_.sph(),k%2?0xd8443a:0xe86a3c,M(x+Math.cos(k*1.3)*.1,y+.06+(k>2?.07:0),z+Math.sin(k*1.3)*.1,0,0,0,.075),0,.25);P.add(G_.leaf(0),0x3f8a3a,M(x+.08,y+.14,z,0,0,0,.07,.03,.1),0,.2)}
    else{for(let k=0;k<3;k++)P.add(G_.cylS(),k%2?0x8a5a2b:0x7a4d24,M(x,y+.06+(k===2?.09:0),z-.06+(k===2?.06:k*.12),0,0,Math.PI/2,.05,.42,.05),0,.2)}});
  if(t.totem){const x=1.2,z=-.9,y=gy(x,z);P.add(G_.cylS(),0x4a3526,M(x,y,z,0,0,0,.1,.95,.1),0,.3);for(let k=0;k<3;k++)P.add(G_.box(),0x3a2a20,M(x,y+.25+k*.25,z,0,k*.4,0,.24,.14,.24),0,.2);P.add(G_.box(),0x6a4a2a,M(x,y+.9,z,0,0,0,.5,.07,.1),0,.2);grp.userData.totem=[x,y+.62,z]}
  if(t.shelter){const x=1.1,z=1,y=gy(x,z);P.add(G_.rock(1),0x6d675d,M(x,y,z,0,.4,0,.62,.5,.55),0,.5);P.add(G_.rock(2),0x5d5850,M(x+.3,y,z-.2,0,1,0,.35,.3,.35),0,.5);P.add(G_.dome(),0x0c0b0a,M(x,y,z+.42,-.25,0,0,.26,.3,.1),0,0)}
  if(P.p.length){const pm=P.mesh();grp.add(pm);grp.userData.props=pm}
  if(t.totem){const eye=new THREE.Mesh(gq('eyeG',()=>new THREE.SphereGeometry(.035,LO(8,5),LO(6,4))),gq('eyeM',()=>new THREE.MeshBasicMaterial({color:new THREE.Color(3,1.2,5)})));const [x,y,z]=grp.userData.totem;for(const s of [-1,1]){const e2=eye.clone();e2.position.set(x+s*.05,y,z+.13);grp.add(e2)}}
  // glowing rim for tiles you can pick
  const ring=new THREE.Mesh(gq('ringG',()=>{const s=hexShape(HR0+.07);s.holes.push(hexShape(HR0-.06));const g=new THREE.ShapeGeometry(s);g.rotateX(-Math.PI/2);return g}),new THREE.MeshBasicMaterial({color:new THREE.Color(2.4,1.5,.45),transparent:true,opacity:0,depthWrite:false,fog:false}));ring.position.y=TOPY+.03;ring.visible=false;ring.renderOrder=3;grp.add(ring);grp.userData.ring=ring;
  return grp}
const TERR_OK={beach:1,river:1,plains:1,hills:1,mountains:1,unknown:1,down:1};
// ---------- the island itself: a sandy skirt that runs from under the tiles down into the lagoon, a reef, sea stacks and the wreck ----------
function islandSDF(x,z){let d=1e9;for(const t of MAP){const p=hexPos(t.q,t.r);d=Math.min(d,hexd(x-p.x,z-p.z)-HAP*1.04)}return d}
function buildIsland(cx,cz,rad){const L=(rad+14)*2;V3.box={x0:cx-L/2,z0:cz-L/2,L};
  // distance-to-land texture for the sea (foam, lagoon colours) and a shore field for the ground
  const S=192,dd=new Uint8Array(S*S*4);const DF=new Float32Array(S*S);for(let j=0;j<S;j++)for(let i=0;i<S;i++){const x=V3.box.x0+(i+.5)/S*L,z=V3.box.z0+(j+.5)/S*L;const n=fbm(x*.25,z*.25);const d=islandSDF(x,z)+(n-.5)*2.2;DF[j*S+i]=d}
  V3.shoreW=2.3;for(let k=0;k<S*S;k++){const d=Math.max(0,DF[k]-V3.shoreW);dd[k*4]=Math.min(255,d/16*255);dd[k*4+3]=255}
  const dt=new THREE.DataTexture(dd,S,S,THREE.RGBAFormat);dt.magFilter=dt.minFilter=THREE.LinearFilter;dt.needsUpdate=true;V3.seaM.uniforms.uDist.value=dt;V3.seaM.uniforms.uBox.value.set(V3.box.x0,V3.box.z0,1/L,0);
  V3.sea.position.x=cx;V3.sea.position.z=cz;
  V3.islP=[cx,cz,rad];const N=LO(140,52),g=new THREE.PlaneGeometry(L,L,N,N);g.rotateX(-Math.PI/2);const p=g.attributes.position,col=new Float32Array(p.count*3);const c=new THREE.Color(),dry=new THREE.Color(0xc4a877),wet=new THREE.Color(0x7d6947),sub=new THREE.Color(0x6f7a5e),deep=new THREE.Color(0x2a3c40),grass=new THREE.Color(0x6f8a45);
  const samp=(x,z)=>{const u=(x-V3.box.x0)/L*S-.5,v=(z-V3.box.z0)/L*S-.5;const i=Math.max(0,Math.min(S-2,Math.floor(u))),j=Math.max(0,Math.min(S-2,Math.floor(v)));const fu=Math.max(0,Math.min(1,u-i)),fv=Math.max(0,Math.min(1,v-j));return (DF[j*S+i]*(1-fu)+DF[j*S+i+1]*fu)*(1-fv)+(DF[(j+1)*S+i]*(1-fu)+DF[(j+1)*S+i+1]*fu)*fv};
  for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=p.getZ(i)+cz;const d=samp(x,z);const n=fbm(x*.6,z*.6);
    let h=d<0?-.2:d<V3.shoreW?-.2-.35*sst(0,V3.shoreW,d)+.05*(n-.5):-.55-Math.min(1.6,(d-V3.shoreW)*.28)-.1*n;p.setY(i,h);
    if(h>-.3)c.copy(dry).lerp(grass,d<.2?.25*sst(.6,.4,n):0);else if(h>-.62)c.copy(dry).lerp(wet,sst(-.3,-.55,h));else c.copy(sub).lerp(deep,sst(-.7,-1.8,h));c.multiplyScalar(.9+.2*n);c.toArray(col,i*3)}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
  {const ix=g.index.array,keep=[];const under=new Uint8Array(p.count);for(let i=0;i<p.count;i++)under[i]=islandSDF(p.getX(i)+cx,p.getZ(i)+cz)<-.45?1:0;
   for(let i=0;i<ix.length;i+=3)if(!(under[ix[i]]&&under[ix[i+1]]&&under[ix[i+2]]))keep.push(ix[i],ix[i+1],ix[i+2]);g.setIndex(keep)}
  if(V3.isl){V3.scene.remove(V3.isl);V3.isl.geometry.dispose()}
  const isl=V3.isl=new THREE.Mesh(g,(V3.lite?gq('islL',()=>new THREE.MeshLambertMaterial({vertexColors:true})):gq('islM',()=>{const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,bumpMap:sandTex(),bumpScale:1.2});m.userData.bump=m.bumpMap;m.map=null;return m})));isl.position.set(cx,0,cz);isl.receiveShadow=true;V3.scene.add(isl);
  // reef rocks, sea stacks and the wreck of the ship that brought you here
  if(V3.deco)V3.scene.remove(V3.deco);const P=new Parts();const R=seeded(17);
  for(let i=0;i<14;i++){const a=R()*6.28;let r=rad+1.2;for(let k=0;k<30&&islandSDF(cx+Math.cos(a)*r,cz+Math.sin(a)*r)<V3.shoreW+.8;k++)r+=.4;r+=R()*1.5;rock(P,cx+Math.cos(a)*r,-.72,cz+Math.sin(a)*r,R,.22+R()*.3,R()<.5?0x6f6a60:0x5d5a52)}
  for(let i=0;i<5;i++){const a=i/5*6.28+R()*.8,r=rad+10+R()*12;const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;const h=2.5+R()*4;P.add(G_.rock(i%3),0x6a665d,M(x,-1,z,0,R()*3,0,1.1+R()*.8,h,1.1+R()*.8),0,.65);P.add(G_.rock((i+1)%3),0x5d5a52,M(x+.8,-.8,z+.3,0,R()*3,0,.7,h*.45,.7),0,.6);P.add(G_.leaf(0),0x3a5a32,M(x,-1+h*1.5,z,0,0,0,.8,.25,.8),0,.3)}
  const sm=P.mesh();sm.castShadow=false;const deco=V3.deco=new THREE.Group();deco.add(sm);
  // the sandy skirt: leaning palms, dune grass, driftwood and shells between the tiles and the surf
  const B=new Parts();for(let i=0,n=0;i<900&&n<70;i++){const x=cx+(R()-.5)*L*.9,z=cz+(R()-.5)*L*.9;const d=samp(x,z);if(d<.35||d>V3.shoreW-.35)continue;const y=-.2-.35*sst(0,V3.shoreW,d);n++;
    if(n%5===0)palm(B,x,y,z,R,.85);else if(n%5===1)B.add(G_.cylS(),0xb3a58c,M(x,y+.03,z,Math.PI/2,R()*3,0,.04,.5+R()*.4,.04),0,.1);else if(n%5===2)rock(B,x,y-.03,z,R,.08+R()*.1,0x8a8274);else{const tc=R()<.5?0xa7a55a:0x8f9a4a;if(!V3.lite)tuft(B,x,y,z,R,tc)}}
  const bm=B.mesh();deco.add(bm);
  const wp=hexPos(MAP[START_POS].q,MAP[START_POS].r);const wa=Math.atan2(wp.z-cz,wp.x-cx);let wr=Math.hypot(wp.x-cx,wp.z-cz)+2;for(let k=0;k<40&&islandSDF(cx+Math.cos(wa)*wr,cz+Math.sin(wa)*wr)<V3.shoreW+1.4;k++)wr+=.3;
  const wreck=wreckMesh();wreck.position.set(cx+Math.cos(wa)*(wr+1.2),-.55,cz+Math.sin(wa)*(wr+1.2));wreck.rotation.y=-wa+.9;deco.add(wreck);V3.scene.add(deco)}
function sandTex(){return gq('sandT',()=>{const S=256,c=cvs(S),x=c.getContext('2d'),id=x.createImageData(S,S),D=id.data;for(let j=0;j<S;j++)for(let i=0;i<S;i++){const v=fbm(i/S*16,j/S*16)*.7+vnoise(i*.9,j*.9)*.3;const o=(j*S+i)*4;D[o]=D[o+1]=D[o+2]=v*255;D[o+3]=255}x.putImageData(id,0,0);const t=tex(c,false,true);t.repeat.set(10,10);return t})}
function plankTex(){return gq('plankT',()=>{const c=cvs(256),x=c.getContext('2d');const R=seeded(8);for(let i=0;i<16;i++){const k=.6+R()*.35;x.fillStyle=`rgb(${92*k|0},${66*k|0},${44*k|0})`;x.fillRect(0,i*16,256,16);x.fillStyle='rgba(20,12,6,.6)';x.fillRect(0,i*16,256,1.5);for(let k2=0;k2<30;k2++){x.fillStyle='rgba(30,20,10,.25)';x.fillRect(R()*256,i*16+R()*14,20+R()*60,1)}}
  x.fillStyle='rgba(70,90,70,.35)';x.fillRect(0,200,256,56);const t=tex(c,true,true);t.repeat.set(2,1);return t})}
function wreckMesh(){const g=new THREE.Group();const wood=V3.lite?gq('wreckL',()=>new THREE.MeshLambertMaterial({map:plankTex(),side:THREE.DoubleSide})):gq('wreckM',()=>new THREE.MeshStandardMaterial({map:plankTex(),roughness:.85,side:THREE.DoubleSide}));
  const pts=[];for(let i=0;i<=12;i++){const y=-2.6+i/12*5.2;const r=1.05*Math.pow(Math.max(0,1-Math.pow(y/2.7,2)),.6)+.02;pts.push(new THREE.Vector2(r,y))}
  const hg=new THREE.LatheGeometry(pts,14,Math.PI,Math.PI*.82);hg.rotateZ(Math.PI/2);hg.scale(1,.8,.62);const hull=new THREE.Mesh(hg,wood);hull.rotation.x=.32;hull.rotation.z=.1;hull.position.y=.55;hull.castShadow=true;g.add(hull);
  const P=new Parts();P.add(G_.cylS(),0x5a4230,M(.3,0,-.1,.35,0,-.25,.08,3.4,.08),0,.2);P.add(G_.cylS(),0x5a4230,M(.9,2.4,-.9,.35,0,1.3,.05,1.6,.05),0,.2);g.add(P.mesh());
  const sg=new THREE.PlaneGeometry(1.4,1.5,6,6);const sp=sg.attributes.position;for(let i=0;i<sp.count;i++){const x=sp.getX(i),y=sp.getY(i);sp.setZ(i,Math.sin(x*2.4+y*1.3)*.15);if(y<-.4&&x>.2)sp.setY(i,y+(x-.2)*.6)}sg.computeVertexNormals();
  const sail=new THREE.Mesh(sg,gq('sailM',()=>new THREE.MeshStandardMaterial({color:0xcfc4a8,roughness:.95,side:THREE.DoubleSide,vertexColors:false})));sail.position.set(.75,1.9,-.62);sail.rotation.set(.35,.4,-.25);sail.castShadow=true;g.add(sail);return g}
// ---------- the mist of the unexplored island: stacked shader layers that read a mask of the tiles nobody has seen ----------
function buildMist(){if(V3.mistL)return;const b=V3.box;V3.mistC=cvs(128);V3.mistC2=cvs(128);V3.mistT=tex(V3.mistC2,false);V3.mistT.anisotropy=1;V3.mistT.flipY=false;
  V3.mistL=[];for(let i=0;i<3;i++){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,
    uniforms:{uTime:V3.U.time,uMask:{value:V3.mistT},uBox:{value:new THREE.Vector4(b.x0,b.z0,1/b.L,0)},uLayer:{value:i},uCol:{value:new THREE.Color(.78,.82,.84)},uFlash:{value:0},uNight:{value:0}},
    vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:GLN+`uniform sampler2D uMask;uniform vec4 uBox;uniform float uTime,uLayer,uFlash,uNight;uniform vec3 uCol;varying vec3 vW;
void main(){vec4 mk=texture2D(uMask,(vW.xz-uBox.xy)*uBox.z);float m=mk.r;if(m<.01)discard;
 vec2 p=vW.xz*(.28+uLayer*.07)+vec2(uTime*.07,uTime*.04)*(1.+uLayer*.5)+uLayer*7.3;float n=fbm(p)+.45*fbm(p*2.4-vec2(uTime*.05,0.));
 float w=smoothstep(.58,1.12,n);float a=m*(.09+w*.58)*(1.-uLayer*.2);
 vec3 c=mix(uCol*vec3(.5,.52,.6),uCol*1.05,w)+vec3(.3,.2,.5)*mk.g*.1;c+=vec3(.6,.65,.8)*uFlash*.6;
 gl_FragColor=vec4(c,a);`+GLEND+'}'});
    const pl=new THREE.Mesh(gq('mistG',()=>{const g=new THREE.PlaneGeometry(1,1);g.rotateX(-Math.PI/2);return g}),m);pl.scale.set(b.L,1,b.L);pl.position.set(b.x0+b.L/2,TOPY+.5+i*.32,b.z0+b.L/2);pl.renderOrder=4+i;pl.frustumCulled=false;V3.scene.add(pl);V3.mistL.push(pl)}
  V3.mistL.forEach((m,i)=>m.visible=i<GFX[V3.q].mist)}
function paintMist(){const b=V3.box;if(!b||!V3.mistC)return;const x=V3.mistC.getContext('2d');const S=128,k=S/b.L;x.fillStyle='#000';x.fillRect(0,0,S,S);
  for(const id in V3.mist){const v=V3.mist[id];if(v.v<.01)continue;const p=hexPos(MAP[id].q,MAP[id].r);const cx=(p.x-b.x0)*k,cz=(p.z-b.z0)*k;x.fillStyle=`rgb(${Math.round(v.v*255)},${Math.round(v.c*255)},0)`;x.beginPath();for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const r=HEXR*1.02*k;i?x.lineTo(cx+Math.sin(a)*r,cz+Math.cos(a)*r):x.moveTo(cx+Math.sin(a)*r,cz+Math.cos(a)*r)}x.closePath();x.fill()}
  const y=V3.mistC2.getContext('2d');y.clearRect(0,0,S,S);y.filter='blur(2.5px)';y.drawImage(V3.mistC,0,0);y.filter='none';V3.mistT.needsUpdate=true}
// ---------- camp: a crackling fire with embers, the tarp or the shelter, a thatched roof, palisade stakes and the wood pile ----------
function flameMat(){return gq('flameM',()=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,uniforms:{uTime:V3.U.time,uI:{value:1}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(0.,0.,0.,1.);vec2 s=vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz));mv.xy+=position.xy*s;gl_Position=projectionMatrix*mv;}',
  fragmentShader:GLN+`uniform float uTime,uI;varying vec2 vUv;void main(){vec2 p=vUv;float n=fbm(vec2(p.x*3.,p.y*2.-uTime*2.6))*.9+fbm(vec2(p.x*6.,p.y*4.-uTime*4.))*.3;
 float w=(1.-p.y)*.55+.05;float d=abs(p.x-.5)/w;float f=smoothstep(1.,.2,d+p.y*.6-n*.55)*smoothstep(0.,.08,p.y);
 vec3 c=mix(vec3(3.2,.9,.12),vec3(4.,2.6,.8),smoothstep(.2,.8,f));gl_FragColor=vec4(c*f*uI,f*uI);}`}))}
function campMesh(){const g=new THREE.Group();const P=new Parts();const R=seeded(5);
  for(let i=0;i<9;i++){const a=i/9*6.28;P.add(G_.rock(i%3),i%2?0x77716a:0x5f5a55,M(Math.cos(a)*.34,0,Math.sin(a)*.34,R()*3,R()*3,0,.1,.08,.1),0,.4)}
  for(let i=0;i<5;i++){const a=i/5*6.28;P.add(G_.cylS(),i%2?0x4a3322:0x3a2618,M(Math.cos(a)*.2,.02,Math.sin(a)*.2,Math.cos(a)*.9,0,-Math.sin(a)*.9+1.57*0,.035,.42,.035),0,.3)}
  P.add(G_.sph(),0x1a1310,M(0,0,0,0,0,0,.22,.03,.22),0,0);const base=P.mesh();g.add(base);
  const fire=new THREE.Group();g.add(fire);g.userData.fire=fire;const fl=[];for(let i=0;i<3;i++){const s=new THREE.Mesh(gq('flameG',()=>{const q=new THREE.PlaneGeometry(1,1);q.translate(0,.5,0);return q}),flameMat());s.position.set((i-1)*.06,.02,(i-1)*.03);s.scale.set(.5-i%2*.12,.8+i*.08,1);s.renderOrder=8;s.frustumCulled=false;fire.add(s);fl.push(s)}fire.userData.fl=fl;
  const coal=new THREE.Mesh(gq('coalG',()=>new THREE.SphereGeometry(.16,LO(10,6),LO(6,3),0,Math.PI*2,0,Math.PI/2)),gq('coalM',()=>new THREE.MeshStandardMaterial({color:0x2a1208,emissive:new THREE.Color(2.2,.6,.1),roughness:.9})));coal.scale.y=.4;fire.add(coal);fire.userData.coal=coal;
  // embers: points that rise, drift and fade in the shader
  const n=40,ep=new Float32Array(n*3),es=new Float32Array(n);for(let i=0;i<n;i++){ep.set([(R()-.5)*.25,0,(R()-.5)*.25],i*3);es[i]=R()}const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.BufferAttribute(ep,3));eg.setAttribute('seed',new THREE.BufferAttribute(es,1));
  const em=new THREE.Points(eg,gq('emberM',()=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,uniforms:{uTime:V3.U.time,uWind:V3.U.wind},
    vertexShader:'attribute float seed;uniform float uTime,uWind;varying float vA;void main(){float t=fract(uTime*.35+seed);vec3 p=position;p.y+=t*2.2;p.x+=sin(t*7.+seed*20.)*.18*t+t*uWind*.8;p.z+=cos(t*5.+seed*13.)*.15*t;vA=(1.-t)*smoothstep(0.,.08,t);vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(28./-mv.z,1.,4.);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'varying float vA;void main(){vec2 q=gl_PointCoord-.5;float a=smoothstep(.5,0.,length(q))*vA;gl_FragColor=vec4(vec3(3.,1.1,.25)*a,a);}'})));em.frustumCulled=false;fire.add(em);
  const smoke=[];for(let i=0;i<4;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puffTex(),color:0x8a8a88,transparent:true,depthWrite:false,opacity:0}));s.userData.ph=i/4;fire.add(s);smoke.push(s)}fire.userData.smoke=smoke;
  const tent=new Parts();tent.add(gq('tarpG',()=>{const s=new THREE.Shape();s.moveTo(-.55,0);s.lineTo(.55,0);s.lineTo(0,.72);s.closePath();const e=new THREE.ExtrudeGeometry(s,{depth:1.2,bevelEnabled:false});e.translate(0,0,-.6);return ni(e)}),0xcdbd98,M(-.95,0,-.35,0,.5,0),0,.35);
  tent.add(G_.cylS(),0x5a4230,M(-.95+Math.sin(.5)*.62,0,-.35+Math.cos(.5)*.62,0,0,0,.025,.8,.025),0,.2);tent.add(G_.cylS(),0x5a4230,M(-.95-Math.sin(.5)*.62,0,-.35-Math.cos(.5)*.62,0,0,0,.025,.8,.025),0,.2);
  const tm=tent.mesh();g.add(tm);g.userData.tent=tm;
  for(const k of ['shel','pal','roof','pile']){const q=new THREE.Group();g.add(q);g.userData[k]=q}return g}
function syncCamp(g,G){const u=g.userData;const sh=G.camp.shelter;const key=[!!sh,Math.min(4,G.camp.roof),Math.min(4,G.camp.pal),Math.min(15,G.pileWood||0)].join();if(u.key===key)return;u.key=key;
  u.tent.visible=!sh;for(const k of ['shel','roof','pal','pile'])u[k].clear();const R=seeded(9);
  if(sh){const P=new Parts();for(let i=0;i<6;i++){P.add(G_.cylS(),i%2?0x7a5a36:0x6b4b2a,M(-1.55,.05+i*.13,-.4,Math.PI/2,0,0,.065,1.1,.065),0,.25);P.add(G_.cylS(),i%2?0x6b4b2a:0x7a5a36,M(-.05,.05+i*.13,-.4,Math.PI/2,0,0,.065,1.1,.065),0,.25)}
    for(let i=0;i<5;i++)P.add(G_.cylS(),i%2?0x6f5030:0x7f5f3a,M(-1.55+i*.37,.05+.02*i,-.95,0,0,Math.PI/2*0,.06,.85,.06),0,.25);
    P.add(G_.cylS(),0x5a4028,M(-1.6,.8,-.95,0,0,-Math.PI/2,.05,1.6,.05),0,.2);u.shel.add(P.mesh())}
  const rl=Math.min(4,G.camp.roof);if(rl){const P=new Parts();const th=[0x9a8a4a,0xa89a58,0x8a7a40,0xb0a060];for(let i=0;i<rl;i++){for(let k=0;k<7;k++)P.add(G_.box(),th[(i+k)%4],M(-1.55+k*.25,(sh?.86:.78)+i*.09,-.62+i*.06,-.38,R()*.1-.05,0,.34,.05,1.15),.3,.3)}u.roof.add(P.mesh())}
  const n=Math.min(4,G.camp.pal)*7;if(n){const P=new Parts();for(let i=0;i<n;i++){const a=i/28*Math.PI*2-1;const x=Math.cos(a)*1.6,z=Math.sin(a)*1.6;const h=.55+R()*.15;P.add(G_.cylS(),i%2?0x7a5a33:0x6b4b2a,M(x,0,z,0,0,0,.055,h,.055),0,.3);P.add(G_.cone(),0x9a7a50,M(x,h,z,0,0,0,.055,.14,.055),0,.1)}
    for(let i=0;i<n-1;i++){const a=(i+.5)/28*Math.PI*2-1;P.add(G_.cylS(),0x5a4028,M(Math.cos(a)*1.6,.28,Math.sin(a)*1.6,Math.PI/2,-a,0,.02,.36,.02),0,.2)}u.pal.add(P.mesh())}
  const pw=Math.min(15,G.pileWood||0);if(pw){const P=new Parts();for(let i=0;i<pw;i++){const row=Math.floor(i/4),k=i%4;P.add(G_.cylS(),i%2?0x8a5a2b:0x7a4d24,M(1.05,.06+row*.11,.25+k*.13-row*.05,Math.PI/2,0,0,.055,.62,.055),0,.25)}u.pile.add(P.mesh())}}
// ---------- pawns: painted resin miniatures on round bases ----------
const PCOL3=[0xd9534f,0x3c7dd9,0x49a35a,0xe0a13a,0x9a6cd6,0x7a7a7a];
function miniMat(){if(V3.lite)return gq('miniL',()=>new THREE.MeshPhongMaterial({vertexColors:true,shininess:45,specular:0x3a3a3a}));return gq('miniM',()=>new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.5,metalness:0,clearcoat:.8,clearcoatRoughness:.3,envMapIntensity:.9}))}
function lathe(pts,seg){return ni(new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),Math.round((seg||14)*LO(1,.5))))}
function pawnMesh(col,kind,ck){const g=new THREE.Group();const P=new Parts();const skin=kind==='fri'?0x7a4a2c:0xe2b08a;
  P.add(gq('baseL',()=>lathe([[0,0],[.3,0],[.32,.025],[.31,.075],[.27,.09],[0,.09]],20)),0x2a2018,M(0,0,0),0,.2);P.add(gq('ringL',()=>ni(new THREE.TorusGeometry(.305,.022,LO(6,3),LO(24,12)))),col,M(0,.055,0,Math.PI/2,0,0),0,0);
  if(kind==='dog'){const fur=0xb07a48,dark=0x6a4526;P.add(G_.sph(),fur,M(0,.33,0,0,0,0,.13,.12,.24),0,.3);for(const [x,z] of [[-.07,.14],[.07,.14],[-.07,-.14],[.07,-.14]])P.add(G_.cylS(),dark,M(x,.09,z,0,0,0,.035,.2,.035),0,.2);
    P.add(G_.sph(),fur,M(0,.47,.22,0,0,0,.1,.095,.11),0,.2);P.add(G_.sph(),dark,M(0,.44,.33,0,0,0,.05,.045,.06),0,.1);P.add(G_.cone(),dark,M(-.06,.53,.2,0,0,-.3,.035,.1,.03),0,.1);P.add(G_.cone(),dark,M(.06,.53,.2,0,0,.3,.035,.1,.03),0,.1);
    P.add(G_.cylS(),fur,M(0,.36,-.22,-.9,0,0,.025,.2,.025),.5,.1);P.add(gq('collar',()=>ni(new THREE.TorusGeometry(.085,.02,LO(6,3),LO(14,8)))),col,M(0,.42,.16,1.2,0,0),0,0)}
  else{const cloth=kind==='fri'?0xe8e0cc:col;const pants=kind==='fri'?skin:0x4a3a2a;
    P.add(gq('legsL',()=>lathe([[.0,.09],[.15,.09],[.16,.25],[.17,.42],[0,.42]])),pants,M(0,0,0),0,.35);
    P.add(gq('torsoL',()=>lathe([[0,.4],[.2,.4],[.215,.52],[.2,.66],[.17,.74],[.08,.79],[0,.8]])),kind==='fri'?skin:cloth,M(0,0,0),0,.3);
    if(kind==='fri')P.add(gq('loinL',()=>lathe([[0,.36],[.185,.36],[.19,.47],[0,.47]])),cloth,M(0,0,0),0,.2);
    P.add(gq('beltT',()=>ni(new THREE.TorusGeometry(.2,.022,LO(5,3),LO(18,10)))),0x3a2616,M(0,.44,0,Math.PI/2,0,0),0,0);
    for(const s of [-1,1]){P.add(G_.cylS(),kind==='fri'?skin:cloth,M(s*.2,.73,0,0,0,s*.22,.05,-.3,.05),0,.1);P.add(G_.sph(),skin,M(s*.265,.43,0,0,0,0,.045),0,0)}
    P.add(G_.sph(),skin,M(0,.9,0,0,0,0,.13,.14,.13),0,.2);for(const s of [-1,1])P.add(G_.sph(),0x1a1210,M(s*.05,.9,.122,0,0,0,.02,.026,.012),0,0);P.add(G_.sph(),0x2a1a10,M(0,.935,-.012,0,0,0,.135,.11,.13),0,.1);
    if(ck==='explorer'){P.add(G_.cylS(),0x8a6a3a,M(0,.97,0,0,0,0,.22,.02,.22),0,.1);P.add(G_.cylS(),0x7a5a30,M(0,.97,0,0,0,0,.12,.1,.12),0,.1)}
    else if(ck==='soldier'){P.add(G_.dome(),0x9aa0a6,M(0,.95,0,0,0,0,.15,.1,.15),0,.1);P.add(G_.cylS(),0x5a4028,M(.27,.1,.03,0,0,0,.02,1.05,.02),0,.1);P.add(G_.cone(),0xb0b4ba,M(.27,1.15,.03,0,0,0,.035,.12,.035),0,.1)}
    else if(ck==='cook'){P.add(G_.cylS(),0xf2eee4,M(0,.98,0,0,0,0,.11,.1,.11),0,.1);P.add(G_.sph(),0xf2eee4,M(0,1.08,0,0,0,0,.14,.06,.14),0,.1)}
    else if(ck==='carpenter'){P.add(G_.box(),0x7a5a36,M(.28,.5,.06,0,0,0,.03,.26,.03),0,.1);P.add(G_.box(),0x8a8e92,M(.28,.64,.06,0,0,0,.1,.05,.05),0,.1);P.add(G_.dome(),0x6a3a28,M(0,.96,0,0,0,0,.14,.07,.14),0,.1)}
    else if(ck==='ada'){P.add(G_.dome(),0xc94f6a,M(0,.95,0,0,0,0,.145,.09,.145),0,.1)}}
  const m=P.mesh(miniMat());g.add(m);
  const bl=new THREE.Mesh(gq('blobG',()=>{const q=new THREE.PlaneGeometry(.95,.95);q.rotateX(-Math.PI/2);return q}),gq('blobM',()=>new THREE.MeshBasicMaterial({map:blobTex(),transparent:true,depthWrite:false,opacity:.7})));bl.position.y=.012;bl.renderOrder=2;g.add(bl);
  g.scale.setScalar(kind==='dog'?1.3:1.42);return g}
// ---------- sync from G ----------
function spaceView(m){const t=tileAt(m.id);if(!t)return {id:m.id,terr:'unknown',down:!!m.down};return {id:m.id,no:t.no,terr:t.terr,src:t.src.map(x=>x==='wood'?'wood':'food'),totem:t.totem,shelter:t.shelter}}
function hexPos(q,r){return new THREE.Vector3(HEXR*Math.sqrt(3)*q*1.02,0,HEXR*1.5*r*1.02)}
function groundY(x,z){let best=null,bd=1e9;for(const id in V3.tiles){const o=V3.tiles[id];const p=o.g.position;const d=Math.hypot(x-p.x,z-p.z);if(d<bd){bd=d;best=o}}if(!best||bd>HEXR)return TOPY;const p=best.g.position;return p.y+TOPY+sampleH(best.g.userData.F,x-p.x,z-p.z)}
function overlayMesh(m){const g=new THREE.Group();const t=tileAt(m.id);const o=V3.tiles[m.id];const F=o&&o.g.userData.F;const gy=(x,z)=>TOPY+sampleH(F,x,z);const P=new Parts();const add=[];
  if(t){t.src.forEach((s,i)=>{if(m.exh[i]){const x=-1.1+i*.7,z=-1.15,y=gy(x,z)+.02;P.add(G_.cylS(),0x24221f,M(x,y,z,0,0,0,.3,.2,.3),0,.3);P.add(G_.box(),0x8a8580,M(x,y+.21,z,0,.785,0,.34,.02,.06),0,0);P.add(G_.box(),0x8a8580,M(x,y+.21,z,0,-.785,0,.34,.02,.06),0,0)}})}
  if(G.sc&&G.sc.crosses&&G.sc.crosses.includes(m.id)){const x=.9,z=.9,y=gy(x,z);P.add(G_.box(),0x5a3e28,M(x,y+.62,z,0,0,0,.12,1.24,.12),0,.3);P.add(G_.box(),0x5a3e28,M(x,y+.92,z,0,0,0,.62,.12,.12),0,.2);P.add(G_.rock(0),0x6d675d,M(x,y,z,0,0,0,.22,.14,.22),0,.3);
    const gl=new THREE.Mesh(gq('crossGlow',()=>{const q=new THREE.RingGeometry(.25,.45,24);q.rotateX(-Math.PI/2);return q}),gq('crossGM',()=>new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,.9,2.8),transparent:true,opacity:.55,depthWrite:false})));gl.position.set(x,y+.04,z);gl.userData.pulse=1;add.push(gl)}
  if(m.tok.beast){const x=-1.2,z=.8,y=gy(x,z);P.add(G_.cylS(),0x8a1f18,M(x,y,z,0,0,0,.22,.06,.22),0,.3);for(let k=0;k<3;k++)P.add(G_.cone(),0xf0e6d0,M(x-.08+k*.08,y+.06,z,0,0,0,.035,.2,.035),0,.2)}
  if(m.tok.time){const x=-1.2,z=.3,y=gy(x,z);const d=new THREE.Mesh(gq('timeG',()=>new THREE.TorusGeometry(.2,.06,10,24)),gq('timeM',()=>new THREE.MeshStandardMaterial({color:0xe0b040,metalness:.9,roughness:.28})));d.rotation.x=Math.PI/2;d.position.set(x,y+.07,z);d.castShadow=true;add.push(d)}
  if(m.waste||m.cov){const d=new THREE.Mesh(gq('wasteG',()=>{const q=new THREE.ShapeGeometry(hexShape(HR0*.9));q.rotateX(-Math.PI/2);return q}),gq('wasteM',()=>new THREE.MeshBasicMaterial({color:0x1a140c,transparent:true,opacity:.5,depthWrite:false})));d.position.y=TOPY+.2;d.renderOrder=3;add.push(d)}
  if(G.scen==='hexed'&&G.sc.temple===m.id&&!G.sc.templeDone){const d=new THREE.Mesh(gq('templeG',()=>new THREE.OctahedronGeometry(.3)),gq('templeM',()=>new THREE.MeshStandardMaterial({color:0xe0b43a,metalness:.85,roughness:.25,emissive:new THREE.Color(.9,.55,.1)})));d.position.set(1.2,gy(1.2,-.9)+1.2,-.9);d.userData.spin=1;d.castShadow=true;add.push(d)}
  if(P.p.length)g.add(P.mesh());add.forEach(a=>g.add(a));return g}
function overlayKey(m){return JSON.stringify([m.exh,m.tok,m.waste,m.cov,G.sc&&G.sc.crosses&&G.sc.crosses.includes(m.id),G.sc&&G.sc.temple===m.id&&!G.sc.templeDone])}
function pawnSpot(act){if(!act)return null;if(act.type==='gather')return act.tgt.pos;if(act.type==='explore')return act.tgt;if(act.type==='build'&&act.tgt.k==='cross')return act.tgt.cross;if(act.type==='special'){const s=SPEC(act.tgt);return s&&s.pos?s.pos():null}return null}
function sync3D(){if(!V3.on||!G)return;if(PH)PH.wake();const sc=V3.scene;if(!V3.layout){V3.layout=1;fitIsland()}
  for(const m of G.map){const v=spaceView(m);let o=V3.tiles[m.id];const key=v.terr+(v.no||'')+(v.src||[]).join()+(v.totem?1:0)+(v.shelter?1:0)+(v.down?'d':'');
    if(!o||o.key!==key){const was=o;if(o){sc.remove(o.g)}const g=tileMesh(v);const p=hexPos(MAP[m.id].q,MAP[m.id].r);g.position.copy(p);g.userData.id=m.id;
      if(was&&v.terr!=='unknown'){g.position.y=-2.5;tween(g.position,'y',0,.9,()=>puff(p.clone().setY(TOPY+.1),14))}sc.add(g);o=V3.tiles[m.id]={g,key,ov:null,ok:''}}
    o.g.userData.id=m.id;const ok=overlayKey(m);if(o.ok!==ok){if(o.ov)o.g.remove(o.ov);o.ov=overlayMesh(m);o.g.add(o.ov);o.ok=ok}
    const mv=V3.mist[m.id]||(V3.mist[m.id]={v:0,c:0,to:0});mv.to=v.terr==='unknown'&&!v.down?1:m.fog?.62:0;mv.fog=!!m.fog;if(mv.init==null){mv.init=1;mv.v=mv.to}}
  // camp on the camp tile
  if(!V3.camp){V3.camp=campMesh();sc.add(V3.camp);if(V3.q==='low')lowNoise(true)}const cp=hexPos(MAP[G.camp.pos].q,MAP[G.camp.pos].r);V3.camp.position.set(cp.x+.3,groundY(cp.x+.3,cp.z+.2),cp.z+.2);syncCamp(V3.camp,{camp:G.camp,pileWood:G.sc&&G.sc.pile||0});
  // pawns: one figure per character pawn, Friday and the dog; they walk to where the plan sends them
  const want=[];for(const c of G.chars){const n=c.dead?0:(c.npc?1:2);for(let k=0;k<n;k++)want.push({id:'c'+c.i+'_'+k,col:PCOL3[c.i%6],out:!!c.out,ck:c.k})}if(G.fri&&!G.fri.dead)want.push({id:'fri',col:0xf4f4f4,kind:'fri'});if(G.dog)want.push({id:'dog',col:0x9b6bd6,kind:'dog'});
  const acts={};for(const a of (G.plan&&G.plan.acts)||[])for(const p of a.pw)acts[p]=a;
  want.forEach((w,i)=>{let o=V3.pawns[w.id];if(!o){o=V3.pawns[w.id]=pawnMesh(w.col,w.kind,w.ck);o.position.set(cp.x,TOPY,cp.z);sc.add(o)}o.userData.seen=1;
    const pos=G.phase==='plan'||G.phase==='act'?pawnSpot(acts[w.id]):null;const tp=pos!=null?hexPos(MAP[pos].q,MAP[pos].r):cp;const ang=i*1.1+(pos!=null?.5:0),rad=pos!=null?.55+(i%2)*.3:1.1+(i%3)*.25;
    const tx=tp.x+Math.cos(ang)*rad,tz=tp.z+Math.sin(ang)*rad;o.userData.to=new THREE.Vector3(tx,groundY(tx,tz),tz);o.visible=!w.out||G.phase!=='night'});
  for(const k in V3.pawns){if(!want.some(w=>w.id===k)){sc.remove(V3.pawns[k]);delete V3.pawns[k]}}
  // weather and night: the forecast while planning, the real clouds in the weather phase
  const S=SCENARIOS[G.scen];const dice=S.wx[G.round]||[];const w=G.phase==='weather'&&G.wxNow?G.wxNow:{rain:(dice.includes('rain')?1.2:0)+G.wx.rain,snow:(dice.includes('snow')?1.2:0)+G.wx.snow,storm:G.wx.storm};
  V3.weather.rain=Math.min(1,(w.rain||0)/2);V3.weather.snow=Math.min(1,(w.snow||0)/2);V3.weather.storm=Math.min(1,(w.rain||0)*.25+(w.snow||0)*.25+(w.storm?0.5:0));V3.night=G.phase==='night'||G.over&&!G.over.win?1:0;
  V3.pickable=UI.pick||null;syncLabels()}
function fitIsland(){let m=0,cx=0,cz=0;const ts=MAP;for(const t of ts){const p=hexPos(t.q,t.r);cx+=p.x/ts.length;cz+=p.z/ts.length}for(const t of ts){const p=hexPos(t.q,t.r);m=Math.max(m,Math.hypot(p.x-cx,p.z-cz))}
  const rad=m+HEXR*1.6;buildIsland(cx,cz,rad);buildMist();V3.look.set(cx,0,cz+.6);V3.center=V3.look.clone();V3.rad=rad;V3.orbit.d=Math.max(20,rad*2.2);V3.d0=V3.orbit.d;fitDist();V3.orbit.e=1.12;placeCam()}
// ---------- floating labels over every tile you can read or act on ----------
const TICON={beach:'🏖️',river:'🏞️',plains:'🌾',hills:'⛰️',mountains:'🏔️'};const SICON={wood:'🪵',fish:'🐟',parrot:'🦜'};
function syncLabels(){const box=document.getElementById('labels');if(!box)return;V3.lab=V3.lab||{};
  for(const m of G.map){const t=tileAt(m.id);let h='';const reach=!t&&!m.down&&MAP[m.id].adj.some(p=>tileAt(p));
    if(t){const cr=G.sc&&G.sc.crosses&&G.sc.crosses.includes(m.id);h=`<b><s class="pn">${m.id+1}</s>${TICON[t.terr]||''} ${t.terr}</b><i>${t.src.map((s,i)=>`<u class="${m.exh[i]?'gone':''}">${SICON[s]||s}</u>`).join('')}</i>${m.id===G.camp.pos?'<em class="camp">🏕️ camp</em>':''}${t.shelter?'<em>⛰ cave</em>':''}${m.fog?'<em>🌫 fog</em>':''}${cr?'<em>✝️</em>':''}${m.waste?'<em>barren</em>':''}`}
    else if(reach)h=`<b class="unk">❔${m.id+1} explore</b>${m.fog?'<em>🌫</em>':''}`;
    let el=V3.lab[m.id];if(!h){if(el)el.hidden=true;continue}
    if(!el){el=V3.lab[m.id]=document.createElement('button');el.className='tl';el.dataset.tile=m.id;box.appendChild(el)}
    el.hidden=false;if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}el.classList.toggle('sel',UI.tileSel===m.id);el.classList.toggle('pulse',UI.hoverPos===m.id);el.setAttribute('aria-label',`Place ${m.id+1}: ${t?t.terr:'unexplored'}`);el.classList.toggle('far',!t)}}
function placeLabels(){if(!V3.lab)return;const cv=V3.r.domElement;const w=cv.clientWidth,h=cv.clientHeight;const v=new THREE.Vector3();
  for(const id in V3.lab){const el=V3.lab[id];if(el.hidden)continue;const p=hexPos(MAP[id].q,MAP[id].r);v.set(p.x,HEXH+.2,p.z+HEXR*.55).project(V3.cam);
    if(v.z>1){el.style.opacity=0;continue}el.style.opacity='';const tr=`translate(${((v.x+1)/2*w).toFixed(1)}px,${((1-v.y)/2*h).toFixed(1)}px) translate(-50%,-50%)`;if(el._tr!==tr){el._tr=tr;el.style.transform=tr}}}
function tween(obj,k,to,dur,done){V3.tweens.push({obj,k,from:obj[k],to,t:0,dur,done})}
// a little dust puff where a tile lands or a pawn arrives
function puff(pos,n,col){if(!V3.on||V3.q==='low')return;for(let i=0;i<(n||8);i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puffTex(),color:col||0xd8c8a8,transparent:true,depthWrite:false,opacity:0}));const a=Math.random()*6.28;s.position.copy(pos);s.position.x+=Math.cos(a)*.3;s.position.z+=Math.sin(a)*.3;s.scale.setScalar(.2);V3.scene.add(s);
  V3.fx.push({s,t:0,life:.7+Math.random()*.5,v:new THREE.Vector3(Math.cos(a)*1.2,.5+Math.random()*.6,Math.sin(a)*1.2),g:.9,a:.55})}}
// a jagged lightning bolt far out over the sea
function bolt(){const R=Math.random;const c=V3.center||V3.look;const a=R()*6.28,r=(V3.rad||10)+14+R()*20;const x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r;
  const pts=[[0,34]];let px=0,py=34;while(py>-.5){py-=1.2+R()*2.2;px+=(R()-.5)*2.4;pts.push([px,Math.max(-.5,py)])}
  const ribbon=(p,w)=>{const pos=[];for(let i=0;i<p.length-1;i++){const [x0,y0]=p[i],[x1,y1]=p[i+1];pos.push(x0-w,y0,0,x1-w,y1,0,x1+w,y1,0,x0-w,y0,0,x1+w,y1,0,x0+w,y0,0)}return pos};
  let pos=ribbon(pts,.2);for(let b=0;b<2;b++){const s=2+Math.floor(R()*(pts.length-4));let [bx,by]=pts[s];const bp=[[bx,by]];for(let k=0;k<4;k++){by-=1+R()*1.5;bx+=(R()<.5?-1:1)*(.6+R()*1.2);bp.push([bx,by])}pos=pos.concat(ribbon(bp,.08))}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:new THREE.Color(6,6.5,9),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  m.position.set(x,-.55,z);m.lookAt(V3.cam.position.x,-.55,V3.cam.position.z);m.frustumCulled=false;V3.scene.add(m);if(V3.boltM){V3.scene.remove(V3.boltM);V3.boltM.geometry.dispose()}V3.boltM=m;V3.boltT=0;
  V3.skyM.uniforms.uFD.value.set(x-V3.cam.position.x,18,z-V3.cam.position.z).normalize();V3.boltL.position.set(x,30,z);V3.boltL.target.position.copy(c)}
function loop3D(){(PH?PH.raf:requestAnimationFrame)(loop3D);
  // the frame-time watch and step-down now live in PerfHUD (p95 over 2 s; see perfhud.js); PerfHUD.raf also throttles this loop to 10 fps when idle
  const covered=UI.modal==='start';const moving=V3.tweens.length||V3.fx.length||V3.flash>0||V3.drag||PH&&PH.testing;
  // ~30 fps of idle life, full rate while things move, a slow trickle behind the start screen
  const gap=covered?.25:moving?0:.03;const el=V3.clock.getElapsedTime();if(el-(V3.lastR||0)<gap)return;
  const dtR=Math.min(.6,Math.max(.001,el-(V3.lastR||el)));const dt=Math.min(.05,dtR);V3.lastR=el;V3.t+=dt;const t=V3.t;V3.U.time.value=t;
  // tweens
  V3.tweens=V3.tweens.filter(w=>{w.t+=dtR;const f=Math.min(1,w.t/w.dur);const e=f<1?1-Math.pow(1-f,3)*(1-Math.sin(f*Math.PI)*.0):1;const b=f<.75?1-Math.pow(1-f/.75,3):1+Math.sin((f-.75)/.25*Math.PI)*.04;w.obj[w.k]=w.from+(w.to-w.from)*(w.k==='y'?b:e);if(f>=1&&w.done)w.done();return f<1});
  for(const f of V3.fx){f.t+=dt;const k=f.t/f.life;f.s.position.addScaledVector(f.v,dt);f.v.multiplyScalar(Math.pow(.1,dt));f.s.scale.setScalar(.2+k*f.g);f.s.material.opacity=f.a*Math.sin(Math.min(1,k)*Math.PI);if(k>=1){V3.scene.remove(f.s);f.s.material.dispose()}}V3.fx=V3.fx.filter(f=>f.t<f.life);
  let camMv=false;
  // camera glides to the scene being told, and back to the whole island for planning
  if(V3.center&&!V3.drag){const f=V3.focus!=null&&MAP[V3.focus]?hexPos(MAP[V3.focus].q,MAP[V3.focus].r).add(new THREE.Vector3(0,0,1.2)):V3.center;const k=Math.min(1,dtR*2);if(V3.look.distanceTo(f)>.02||Math.abs(V3.orbit.d-(V3.focus!=null?V3.d0*.72:V3.d0))>.05){camMv=true;V3.look.lerp(f,k);V3.orbit.d+=((V3.focus!=null?V3.d0*.72:V3.d0)-V3.orbit.d)*k;placeCam()}}
  placeLabels();
  // pawns walk to their spots on little hops, and land with a puff
  let pi=0,walk=false;for(const k in V3.pawns){const o=V3.pawns[k];pi++;const to=o.userData.to;if(to){const dx=to.x-o.position.x,dz=to.z-o.position.z,dist=Math.hypot(dx,dz);const mv=dist>.06;if(mv){walk=true;const st=Math.min(dist,dt*Math.max(1.6,dist*2.2));o.position.x+=dx/dist*st;o.position.z+=dz/dist*st;o.rotation.y=Math.atan2(dx,dz);o.userData.w=true}
      else if(o.userData.w){o.userData.w=false;puff(o.position.clone().setY(to.y+.05),6)}const gy=mv?groundY(o.position.x,o.position.z):to.y;o.position.y=gy+(mv?Math.abs(Math.sin(t*9+pi))*.2:0);o.rotation.z=mv?Math.sin(t*9+pi)*.08:0}}
  for(const id in V3.tiles){const ov=V3.tiles[id].ov;if(ov)for(const c of ov.children){if(c.userData.spin){c.rotation.y+=dt*1.5;c.position.y+=Math.sin(t*2)*.002}if(c.userData.pulse)c.material.opacity=.35+.3*Math.sin(t*3)}}
  // weather: wind, rain, snow and lightning
  const rw=V3.weather;V3.nightT+=((V3.night)-V3.nightT)*Math.min(1,dtR*1.5);V3.stormT+=((rw.storm)-V3.stormT)*Math.min(1,dtR*1.5);const N=V3.nightT,S=V3.stormT;
  V3.U.wind.value=.35+S*1.3+rw.rain*.4;const ru=V3.rain.material.uniforms;ru.uRain.value+=((rw.rain?.85:0)-ru.uRain.value)*Math.min(1,dtR*2);ru.uC.value.copy(V3.look);V3.rain.visible=ru.uRain.value>.01;
  const su=V3.snow.material.uniforms;su.uSnow.value+=((rw.snow?.95:0)-su.uSnow.value)*Math.min(1,dtR*2);V3.snow.visible=su.uSnow.value>.01;
  if(S>.55&&Math.random()<dt*.22)V3.flash=1;if(V3.flash>=1&&!V3.flashing){V3.flashing=true;bolt()}if(V3.flash<.5)V3.flashing=false;
  const fl=V3.flash>0?V3.flash*(.55+.45*Math.max(0,Math.sin(V3.flash*38))):0;V3.flash=Math.max(0,V3.flash-dtR*2.6);
  if(V3.boltM){V3.boltT+=dt;V3.boltM.material.opacity=Math.max(0,1-V3.boltT*4)*(V3.boltT<.12?1:.5+.5*Math.sin(V3.boltT*80));if(V3.boltT>.35){V3.scene.remove(V3.boltM);V3.boltM.geometry.dispose();V3.boltM=null}}
  // day, storm and night light; the moon takes the sun's place at night
  const sky=V3.skyM.uniforms;sky.uStorm.value=S;V3.veil.visible=S>.03&&V3.q!=='low';V3.veil.position.set(V3.look.x,Math.min(9,V3.orbit.d*.45),V3.look.z);sky.uNight.value=N;sky.uFlash.value=fl;V3.sky.position.copy(V3.cam.position);
  const c=V3.center||V3.look;const sd=new THREE.Vector3(-.62,.62,.47).normalize(),md=new THREE.Vector3(.45,.72,-.55).normalize();const ld=sd.clone().lerp(md,N).normalize();V3.sun.position.copy(c).addScaledVector(ld,40);
  V3.sun.color.setRGB(1-.25*S-.45*N,.88-.18*S-.28*N,.72-.08*S+.25*N);V3.sun.intensity=(2.7-S*1.9)*(1-N*.78);
  V3.hemi.intensity=(V3.hemiBase||.62)*(1-N*.6-S*.35)+(V3.q==='low'?fl*1.6:0);V3.hemi.color.setRGB(.8-.5*N,.86-.45*N,.94-.25*N);V3.hemi.groundColor.setRGB(.36-.28*N,.3-.22*N,.22-.12*N);V3.rim.intensity=.9-S*.3-N*.4;
  V3.boltL.intensity=fl*3.2;V3.r.toneMappingExposure=.92-N*.14-S*.1;
  const fogC=new THREE.Color().setRGB(.55-.3*S-.5*N,.6-.32*S-.53*N,.62-.3*S-.5*N);V3.scene.fog.color.copy(fogC);sky.uFog.value.copy(fogC);
  const sw=V3.seaM.uniforms;sw.uAmp.value=.16+S*.34;sw.uStorm.value=S;sw.uNight.value=N;sw.uFlash.value=fl;sw.uSunD.value.copy(ld);sw.uSunC.value.copy(V3.sun.color).multiplyScalar(V3.sun.intensity*.5);sw.uSky.value.setRGB(.42-.22*S-.38*N,.5-.26*S-.44*N,.56-.26*S-.44*N);sw.uFogC.value.copy(fogC);sw.uFogN.value=V3.scene.fog.near;sw.uFogF.value=V3.scene.fog.far;
  // the mist: fades off explored tiles, thins under the pointer on a tile you can explore, and glows faintly with lightning
  let mc=false;for(const id in V3.mist){const v=V3.mist[id];const hv=V3.pickable&&V3.pickable.includes(+id)&&V3.hover===+id;const to=hv?v.to*.55:v.to;const tc=v.fog?1:0;if(Math.abs(v.v-to)>.004||Math.abs(v.c-tc)>.01){v.v+=(to-v.v)*Math.min(1,dtR*2.2);v.c+=(tc-v.c)*Math.min(1,dtR*2);mc=true}}if((mc||!V3.mistPainted)&&V3.mistC){V3.mistPainted=1;paintMist()}
  if(V3.mistL)for(const l of V3.mistL){const u=l.material.uniforms;u.uFlash.value=fl;u.uCol.value.setRGB(.8-.35*S-.62*N,.84-.36*S-.6*N,.88-.33*S-.5*N)}
  // the campfire: flicker, embers, a curl of smoke
  if(V3.camp){const f=V3.camp.userData.fire;const fk=.82+.18*Math.sin(t*11)*Math.sin(t*7.3+1)+.08*Math.sin(t*23);f.userData.fl.forEach((s,i)=>{s.scale.y=(.8+i*.08)*(.9+.2*Math.sin(t*(9+i*2)+i))*(1-rw.rain*.25);s.scale.x=(.5-i%2*.12)*(.95+.1*Math.sin(t*13+i))});
    f.userData.coal.material.emissive.setRGB(2.2*fk,.6*fk,.1);V3.fire.position.set(V3.camp.position.x,V3.camp.position.y+.7,V3.camp.position.z);V3.fire.intensity=(3+N*16)*fk*(1-rw.rain*.3);
    f.userData.smoke.forEach(s=>{const k=(t*.25+s.userData.ph)%1;s.position.set(k*V3.U.wind.value*1.2,.5+k*2.2,0);s.scale.setScalar(.25+k*.9);s.material.opacity=.32*Math.sin(k*Math.PI)*(1-N*.5)})}
  // pickable tiles: a pulsing amber rim, brighter under the pointer
  for(const id in V3.tiles){const o=V3.tiles[id].g;const hot=V3.pickable&&V3.pickable.includes(+id);const hv=V3.hover===+id&&hot;const r=o.userData.ring;if(r){r.visible=!!hot;if(hot)r.material.opacity=hv?.95:.4+.25*Math.sin(t*3.2)}const tm=o.userData.top;if(tm){const e=hv?.16:0;if(tm.emissive.r!==e)tm.emissive.setRGB(e,e*.7,e*.3)}}
  V3.busy=!!(moving||camMv||walk||mc||V3.boltM||V3.rain.visible||V3.snow.visible||S>.55||Math.abs(V3.nightT-V3.night)>.01||Math.abs(V3.stormT-rw.storm)>.01);
  draw()}
function pickTile(e){const rc=V3.r.domElement.getBoundingClientRect();const m=new THREE.Vector2(((e.clientX-rc.left)/rc.width)*2-1,-((e.clientY-rc.top)/rc.height)*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(m,V3.cam);
  const hits=ray.intersectObjects(Object.values(V3.tiles).map(o=>o.g),true);if(!hits.length)return null;for(const h of hits){let o=h.object;while(o&&o.userData.id===undefined)o=o.parent;if(o)return o.userData.id}return null}
function onClick3D(e){const id=pickTile(e);if(id==null)return;if(typeof on3DTile==='function')on3DTile(id)}
