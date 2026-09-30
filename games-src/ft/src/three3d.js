// ---------- sunlit 3D bazaar (Three.js r158). The scene only mirrors G; it never owns game state. ----------
// Look: printed, bevelled board tiles in a carved wooden tray on a kilim, turned wooden pawns, carved camels, gilded palaces,
// golden-hour key light with soft shadows, cool rim light, a studio environment map for reflections, and (High) bloom + grade.
const V3={on:false,t:0,tiles:{},stacks:{},tweens:[],hover:null,pick:[],focus:null,flyers:[],fx:[],fxPool:{},anims:[],lift:{},q:''};
const TS=2.2,TH=.34,GAP=.12;       // tile size, tile height, gap
// painted-wood colours for the tribes and the players
const MCOL={vizier:0xf0b72a,elder:0xf3eee2,merchant:0x3a9a48,builder:0x2c62c6,assassin:0xc9312a,artisan:0x8d50c8,thief:0x2a2b30};
const PCOL3=[0x2b2b33,0x119e98,0xff4fa3,0x8b5a2b,0x6d7b8d];
// ---- graphics quality: auto (default) / high / medium / low, remembered in localStorage ----
const GFX={pref:'auto',q:'high'};
const PH=typeof PerfHUD!=='undefined'?PerfHUD:null;
function gfxAuto(){if(V3.soft)return 'low';const small=Math.min(innerWidth,innerHeight)<700||(window.matchMedia&&matchMedia('(pointer:coarse)').matches);return small?'medium':'high'}
try{GFX.pref=localStorage.getItem('soq_gfx')||'auto'}catch(e){}if(!['auto','high','medium','low'].includes(GFX.pref))GFX.pref='auto';
function setGfx(pref){GFX.pref=pref;try{localStorage.setItem('soq_gfx',pref)}catch(e){}GFX.q=pref==='auto'?gfxAuto():pref;if(V3.on)applyQ()}
function gfxLabel(){return {high:'High',medium:'Medium',low:'Low'}[GFX.q]||GFX.q}
function applyQ(){const q=GFX.q,r=V3.r;V3.q=q;const dpr=window.devicePixelRatio||1;const want=q==='high'?Math.min(2,dpr):q==='medium'?Math.min(1.5,dpr):1;r.setPixelRatio(PH?PH.pixelRatio(want):want);
  const sh=q!=='low';const size=q==='high'?2048:1024;if(r.shadowMap.enabled!==sh||V3.sun.shadow.mapSize.x!==size||V3.lastQ!==q){r.shadowMap.enabled=sh;r.shadowMap.type=q==='high'?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;V3.sun.castShadow=sh;V3.sun.shadow.mapSize.set(size,size);if(V3.sun.shadow.map){V3.sun.shadow.map.dispose();V3.sun.shadow.map=null}
    // Low: no environment reflections (cheaper shading), brighter fill instead, no light-pool overlay (CSS vignette does it)
    V3.hemi.intensity=q==='low'?1.2:.85;if(V3.pool)V3.pool.visible=q!=='low';V3.scene.traverse(o=>{if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true})}V3.lastQ=q;swapMats();
  V3.post=q==='high'&&r.capabilities.isWebGL2;if(V3.motes)V3.motes.visible=q==='high';document.body.dataset.gfx=q;resize3D()}
// cheaper shading on Low: PBR materials are swapped for Lambert twins that share their maps and colour objects
function lowTwin(m){if(!m||!m.isMeshStandardMaterial)return m;if(m.userData.low)return m.userData.low;const l=new THREE.MeshLambertMaterial({map:m.map,transparent:m.transparent,opacity:m.opacity,alphaTest:m.alphaTest,side:m.side,vertexColors:m.vertexColors,depthWrite:m.depthWrite,flatShading:m.flatShading});
  l.color=m.metalness>.5?m.color.clone().multiplyScalar(.85):m.color;l.emissive=m.emissive;m.userData.low=l;return l}
// reflections only where they show (metal, glaze, varnish, water): matte print, cloth and wood skip the costly environment lookup
function glossy(m){return m.isMeshPhysicalMaterial||m.metalness>.5}
function swapMats(root){const q=V3.q;const twin=m=>q==='low'||(q==='medium'&&m&&m.isMeshStandardMaterial&&!glossy(m))?lowTwin(m):m;(root||V3.scene).traverse(o=>{if(!o.isMesh)return;const base=o.userData.pbr||o.material;
    for(const m of [].concat(base)){if(m&&m.isMeshStandardMaterial){const want=q!=='low'&&glossy(m)?V3.env:null;if(m.envMap!==want){m.envMap=want;m.needsUpdate=true}}
      if(m&&m.isMeshPhysicalMaterial){if(m.userData.cc==null)m.userData.cc=m.clearcoat;const cc=q==='high'?m.userData.cc:0;if(m.clearcoat!==cc){m.clearcoat=cc;m.needsUpdate=true}}}
    if(!o.userData.pbr)o.userData.pbr=base;const nm=Array.isArray(base)?base.map(twin):twin(base);if(o.material!==nm&&!(Array.isArray(nm)&&Array.isArray(o.material)&&nm.every((x,k)=>x===o.material[k])))o.material=nm})}
// ---- small geometry helpers ----
function rrShape(w,h,r,s){s=s||new THREE.Shape();const x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
function rrPath(w,h,r){const p=new THREE.Path();rrShape(w,h,r,p);return p}
// an extruded, bevelled slab lying flat (top at +y); caps get 0..1 UVs across `uvw`
function slabGeo(shape,depth,bev,uvw,uvh,seg){const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:seg||3,curveSegments:6});
  const p=g.attributes.position,uv=g.attributes.uv,n0=g.groups[0].count;for(let i=0;i<n0;i++)uv.setXY(i,p.getX(i)/uvw+.5,p.getY(i)/(uvh||uvw)+.5);
  g.rotateX(-Math.PI/2);g.translate(0,bev,0);g.computeVertexNormals();return g}
function tex(c,o){const t=new THREE.CanvasTexture(c);o=o||{};if(o.srgb!==false)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=V3.aniso||4;if(o.rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(o.rep[0],o.rep[1])}return t}
const STD=(o)=>new THREE.MeshStandardMaterial(o);const PHYS=(o)=>new THREE.MeshPhysicalMaterial(o);
function init3D(){if(!window.THREE||/jsdom/i.test(navigator.userAgent))return false;const cv=document.getElementById('c3');if(!cv)return false;
  let r;try{r=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});if(!r.getContext())return false}catch(e){return false}
  V3.r=r;try{const gl=r.getContext(),x=gl.getExtension('WEBGL_debug_renderer_info');V3.soft=/swiftshader|llvmpipe|softpipe|software/i.test(String(gl.getParameter(x?x.UNMASKED_RENDERER_WEBGL:gl.RENDERER)))}catch(e){}
  // a software renderer (no GPU) starts on Low in Auto; PerfHUD then lowers the resolution if it is still slow
  r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.0;r.shadowMap.type=THREE.PCFSoftShadowMap;V3.aniso=Math.min(8,r.capabilities.getMaxAnisotropy());
  GFX.q=GFX.pref==='auto'?gfxAuto():GFX.pref;
  const sc=V3.scene=new THREE.Scene();sc.background=new THREE.Color(0x3a2415);sc.fog=new THREE.FogExp2(0x3a2415,.018);
  V3.cam=new THREE.PerspectiveCamera(36,1.6,.5,220);V3.look=new THREE.Vector3(0,0,0);V3.orbit={a:0,e:1.0,d:24};V3.cur={a:0,e:1.0,d:24};placeCam();
  buildEnv();buildMats();
  // golden-hour key light (soft shadows), sky/ground fill, cool rim from behind
  sc.add(V3.hemi=new THREE.HemisphereLight(0xffe6c0,0x4a2c18,.55));
  const sun=V3.sun=new THREE.DirectionalLight(0xffcf98,3.0);sun.position.set(-13,19,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.00025;sun.shadow.normalBias=.025;Object.assign(sun.shadow.camera,{near:5,far:60});sc.add(sun,sun.target);
  const rim=new THREE.DirectionalLight(0xa8c6ff,1.25);rim.position.set(9,7,-16);sc.add(rim);
  buildTable();fxKeepers();
  cv.addEventListener('pointerdown',e=>{V3.drag={x:e.clientX,y:e.clientY,a:V3.orbit.a,e:V3.orbit.e,moved:false}});
  window.addEventListener('pointermove',e=>{const d=V3.drag;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)>6)d.moved=true;if(d.moved){V3.orbit.a=d.a-dx*.006;V3.orbit.e=Math.max(.55,Math.min(1.45,d.e+dy*.004))}});
  window.addEventListener('pointerup',e=>{const d=V3.drag;V3.drag=null;if(d&&!d.moved&&e.target===cv){const id=pickTile(e);if(id!=null&&typeof on3DTile==='function')on3DTile(id)}});
  cv.addEventListener('pointermove',e=>{V3.hover=pickTile(e)});cv.addEventListener('pointerleave',()=>{V3.hover=null});
  cv.addEventListener('wheel',e=>{e.preventDefault();V3.zoom=Math.max(.6,Math.min(1.6,(V3.zoom||1)+e.deltaY*.001));fitDist()},{passive:false});
  buildPieces();buildPlinth();V3.on=true;document.body.classList.add('three');applyQ();new ResizeObserver(()=>resize3D()).observe(cv.parentElement);resize3D(true);
  V3.clock=new THREE.Clock();perfHooks();(PH?PH.raf:requestAnimationFrame)(loop3D);return true}
// PerfHUD: overlay, speed test, auto step-down/up and the idle-frame saver (see perf/INTEGRATE.md)
function perfHooks(){if(!PH)return;
  PH.register({game:'Sands of Qamar',renderer:V3.r,levels:['high','medium','low'],names:{high:'High',medium:'Medium',low:'Low'},anchor:'.gx-board',corner:'bl',
    getLevel:()=>GFX.q,isAuto:()=>GFX.pref==='auto',autoTop:()=>gfxAuto(),
    // auto, test and restore changes are not saved; Apply on the result card is a choice by hand (saved, never auto-changed)
    setLevel:(l,w)=>{if(w==='apply')setGfx(l);else{GFX.q=l;applyQ()}if(typeof renderSettings==='function')renderSettings()},
    basePR:()=>{const d=window.devicePixelRatio||1;return GFX.q==='high'?Math.min(2,d):GFX.q==='medium'?Math.min(1.5,d):1},
    onPixelRatio:v=>{V3.r.setPixelRatio(v);resize3D(false)},
    orbit:t=>{if(t==null){if(V3.orb0){Object.assign(V3.orbit,V3.orb0);V3.orb0=null}return}if(!V3.orb0)V3.orb0={a:V3.orbit.a,e:V3.orbit.e};V3.orbit.a=V3.orb0.a+Math.sin(t*Math.PI*2)*.9;V3.orbit.e=Math.max(.55,Math.min(1.45,V3.orb0.e-.18*Math.sin(t*Math.PI)))},
    isAnimating:()=>!!V3.busy,
    beforeTest:()=>{if(typeof GX!=='undefined'&&GX.close)try{GX.close()}catch(e){}}})}
function BW(){return G&&G.W||6}function BH(){return G&&G.H||5}
// ---- studio environment for reflections: warm sky dome, bright sun softbox, cool window ----
function buildEnv(){const es=new THREE.Scene();const geo=new THREE.SphereGeometry(50,32,16);const col=[];const p=geo.attributes.position;const top=new THREE.Color(0xffd9a8),hor=new THREE.Color(0xfff1d8),gnd=new THREE.Color(0x5a3620),c=new THREE.Color();
  for(let i=0;i<p.count;i++){const y=p.getY(i)/50;if(y>0)c.copy(hor).lerp(top,Math.min(1,y*1.6));else c.copy(hor).lerp(gnd,Math.min(1,-y*4));col.push(c.r*.9,c.g*.9,c.b*.9)}geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  es.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
  const box=(w,h,pos,colr,k)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(colr).multiplyScalar(k),side:THREE.DoubleSide}));m.position.copy(pos);m.lookAt(0,0,0);es.add(m)};
  box(18,14,new THREE.Vector3(-26,36,20),0xffe2b0,9);box(10,24,new THREE.Vector3(30,14,-22),0xbfd6ff,3);box(30,5,new THREE.Vector3(0,20,-40),0xffe8c8,2.2);box(8,8,new THREE.Vector3(24,30,26),0xffffff,3);
  const pm=new THREE.PMREMGenerator(V3.r);V3.env=pm.fromScene(es,.035).texture;pm.dispose()}
// shared textures and materials
function buildMats(){const M=V3.M={};V3.T={};
  V3.T.linen=tex(linenCanvas(256),{srgb:false,rep:[3,3]});V3.T.pale=tex(paleGrain(5),{rep:[1,1]});
  V3.T.blob=tex(radialCanvas(128,[[0,'rgba(0,0,0,.62)'],[.45,'rgba(0,0,0,.32)'],[1,'rgba(0,0,0,0)']]));V3.T.soft=tex(radialCanvas(64,[[0,'rgba(255,255,255,1)'],[.4,'rgba(255,255,255,.5)'],[1,'rgba(255,255,255,0)']]));V3.T.spark=tex(sparkleCanvas(64));
  const wn=tex(normalFromHeight(waterHeight(256),3),{srgb:false,rep:[1.5,1.5]});V3.T.waterN=wn;
  M.water=PHYS({color:0x2a8fb0,roughness:.06,metalness:0,clearcoat:1,clearcoatRoughness:.05,normalMap:wn,normalScale:new THREE.Vector2(.35,.35),transparent:true,opacity:.55,depthWrite:false,envMapIntensity:1.4});
  M.blob=new THREE.MeshBasicMaterial({map:V3.T.blob,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,toneMapped:false});
  M.side={b:STD({color:0x1c3a72,roughness:.85,bumpMap:V3.T.linen,bumpScale:.4,envMapIntensity:.25}),r:STD({color:0x8e3618,roughness:.85,bumpMap:V3.T.linen,bumpScale:.4,envMapIntensity:.25})};
  M.brass=STD({color:0xd9a44a,metalness:1,roughness:.28,envMapIntensity:1.2});M.gold=STD({color:0xf0b650,metalness:1,roughness:.2,envMapIntensity:1.3});
  M.stone=STD({color:0xf4ead6,roughness:.62,map:tex(archCanvas())});M.stonePlain=STD({color:0xf1e4cc,roughness:.7});M.glazeTeal=PHYS({color:0x1f8b9a,roughness:.25,clearcoat:1,clearcoatRoughness:.1});
  M.bark=STD({map:tex(barkCanvas(),{rep:[1,2]}),roughness:.9});const lt=tex(leafCanvas());M.leaf=STD({map:lt,alphaTest:.4,side:THREE.DoubleSide,roughness:.6});M.coco=STD({color:0x6b4420,roughness:.7});
  M.rock=STD({vertexColors:true,roughness:.92,flatShading:true});M.hl=new THREE.MeshBasicMaterial({color:0xffd24a,transparent:true,opacity:.95,depthWrite:false,toneMapped:false});
  // painted, lightly varnished wood for pawns and camels
  M.paint=c=>PHYS({color:c,roughness:.46,map:V3.T.pale,clearcoat:.4,clearcoatRoughness:.35,envMapIntensity:.8});}
// ---- the table, the rug and props around the board ----
function buildTable(){const sc=V3.scene;
  const wt=tex(woodCanvas(1024,1024,'#6a3f22','#2a140a',11,{planks:5,lines:90,knots:3}),{rep:[3,3]});
  const table=new THREE.Mesh(new THREE.PlaneGeometry(140,140),STD({map:wt,roughness:.55,envMapIntensity:.5}));table.rotation.x=-Math.PI/2;table.position.y=-.56;table.receiveShadow=true;sc.add(table);
  // light pool: darken the table towards the edges (a soft vignette falloff)
  const pool=new THREE.Mesh(new THREE.PlaneGeometry(90,90),new THREE.MeshBasicMaterial({map:tex(radialCanvas(256,[[0,'rgba(20,8,2,0)'],[.28,'rgba(20,8,2,0)'],[.6,'rgba(20,8,2,.55)'],[1,'rgba(20,8,2,.92)']])),transparent:true,depthWrite:false}));
  pool.rotation.x=-Math.PI/2;pool.position.y=-.545;sc.add(pool);V3.pool=pool;
  V3.rugTex=tex(rugCanvas(1024,896));V3.rug=new THREE.Mesh(new THREE.BoxGeometry(1,.03,1),[STD({color:0x6b1a16,roughness:1}),STD({color:0x6b1a16,roughness:1}),STD({map:V3.rugTex,roughness:.95,bumpMap:V3.T.linen,bumpScale:2}),STD({color:0x6b1a16}),STD({color:0x6b1a16}),STD({color:0x6b1a16})]);
  V3.rug.position.y=-.545;V3.rug.receiveShadow=true;sc.add(V3.rug);const ft=tex(fringeCanvas(),{rep:[10,1]});ft.wrapT=THREE.ClampToEdgeWrapping;V3.fringe=[];for(const s of [-1,1]){const f=new THREE.Mesh(new THREE.PlaneGeometry(1,.45),new THREE.MeshStandardMaterial({map:ft,transparent:true,alphaTest:.3,roughness:1,side:THREE.DoubleSide}));f.rotation.x=-Math.PI/2;f.rotation.z=s<0?Math.PI:0;f.position.y=-.535;f.userData.s=s;sc.add(f);V3.fringe.push(f)}
  // props: a brass oil lamp, a pile of coins, a deck of goods cards
  const lamp=new THREE.Group();const prof=[[0,0],[.34,0],[.36,.04],[.3,.08],[.22,.1],[.5,.26],[.62,.42],[.6,.56],[.46,.66],[.2,.72],[.16,.8],[.24,.84],[.1,.9],[.05,1.05],[0,1.12]].map(([a,b])=>new THREE.Vector2(a,b));
  const body=new THREE.Mesh(new THREE.LatheGeometry(prof,40),V3.M.brass);body.scale.set(1,.8,.75);lamp.add(body);
  const sp=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.45,.4,0),new THREE.Vector3(.85,.46,0),new THREE.Vector3(1.15,.62,0),new THREE.Vector3(1.3,.76,0)]),20,.07,10),V3.M.brass);lamp.add(sp);
  const hd=new THREE.Mesh(new THREE.TorusGeometry(.28,.05,10,24,Math.PI*1.3),V3.M.brass);hd.position.set(-.62,.46,0);hd.rotation.z=Math.PI*.35;lamp.add(hd);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:V3.T.soft,color:0xffb050,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));glow.position.set(1.32,.86,0);glow.scale.set(.5,.7,1);glow.userData.flame=1;lamp.add(glow);V3.flame=glow;
  const flame=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1.0,.45),toneMapped:false}));flame.scale.set(1,2,1);flame.position.set(1.32,.86,0);lamp.add(flame);V3.flameCore=flame;
  lamp.traverse(o=>{if(o.isMesh){o.castShadow=true}});lamp.scale.setScalar(1.25);V3.lamp=lamp;sc.add(lamp);
  const coins=new THREE.Group();const cg=new THREE.CylinderGeometry(.22,.22,.05,28);const R=artRnd(9);for(let i=0;i<16;i++){const m=new THREE.Mesh(cg,V3.M.gold);const st=i<7;m.position.set(st?0:(R()-.5)*1.4,st?.03+i*.052:.03,st?0:(R()-.5)*1.1);if(!st){m.rotation.set((R()-.5)*.3,R()*3,(R()-.5)*.3);m.position.y=.03+(R()<.3?.05:0)}m.castShadow=true;m.receiveShadow=true;coins.add(m)}V3.coins=coins;sc.add(coins);
  const deck=new THREE.Group();const cgeo=slabGeo(rrShape(1.1,1.55,.1),.12,.015,1.1,1.55,1);const cm=[STD({map:tex(cardBackCanvas()),roughness:.5}),STD({color:0xf3e4c2,roughness:.8})];
  for(let i=0;i<4;i++){const m=new THREE.Mesh(cgeo,cm);m.position.y=i*.15;m.rotation.y=(R()-.5)*.12;m.castShadow=m.receiveShadow=true;deck.add(m)}V3.deck=deck;sc.add(deck);
  // floating dust in the light (High only)
  const n=160,pos=new Float32Array(n*3);for(let i=0;i<n;i++){pos[i*3]=(R()-.5)*30;pos[i*3+1]=R()*9;pos[i*3+2]=(R()-.5)*24}const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  V3.motes=new THREE.Points(pg,new THREE.PointsMaterial({map:V3.T.soft,size:.12,transparent:true,opacity:.55,depthWrite:false,color:0xffe0a8,blending:THREE.AdditiveBlending}));sc.add(V3.motes)}
// the carved wooden tray under the board, sized to the board (6x5, 6x6 or 6x7)
function buildPlinth(){const sc=V3.scene;if(V3.plinth)for(const m of V3.plinth)sc.remove(m);const W=BW(),H=BH();const iw=W*(TS+GAP)+.2,ih=H*(TS+GAP)+.2,ow=iw+1.3,oh=ih+1.3;
  if(!V3.trayWood){V3.trayWood=tex(woodCanvas(1024,1024,'#5a2e17','#1e0c05',21,{lines:120}),{rep:[.07,.07]});V3.trayWood.rotation=.02}
  const wood=PHYS({map:V3.trayWood,roughness:.42,clearcoat:.5,clearcoatRoughness:.3,envMapIntensity:.7});
  const fs=rrShape(ow,oh,.5);fs.holes.push(rrPath(iw,ih,.12));const frame=new THREE.Mesh(slabGeo(fs,.52,.08,1,1,4),wood);frame.position.y=-.5;frame.castShadow=frame.receiveShadow=true;
  const base=new THREE.Mesh(slabGeo(rrShape(ow-.1,oh-.1,.45),.3,.04,1,1,2),wood);base.position.y=-.54;base.receiveShadow=true;
  // brass inlay on the frame top
  const bs=rrShape(ow-.36,oh-.36,.36);bs.holes.push(rrPath(ow-.5,oh-.5,.3));const inlay=new THREE.Mesh(new THREE.ExtrudeGeometry(bs,{depth:.02,bevelEnabled:false,curveSegments:8}),V3.M.brass);inlay.rotation.x=-Math.PI/2;inlay.position.y=.172;
  // printed field between the tiles
  const fld=new THREE.Mesh(new THREE.PlaneGeometry(iw,ih),STD({map:tex(fieldCanvas(1024,Math.round(1024*ih/iw),W,H)),roughness:.7,bumpMap:V3.T.linen,bumpScale:1}));fld.rotation.x=-Math.PI/2;fld.position.y=-.003;fld.receiveShadow=true;
  const plq=new THREE.Mesh(new THREE.PlaneGeometry(5.2,.65),STD({map:tex(plaqueCanvas()),metalness:.5,roughness:.35,transparent:true}));plq.rotation.x=-Math.PI/2;plq.position.set(0,.196,oh/2-.33);plq.renderOrder=1;
  frame.userData.frame=1;V3.plinth=[frame,base,inlay,fld,plq];sc.add(frame,base,inlay,fld,plq);
  // tiles sit on the field: lift the tile layer so bottoms touch it
  V3.rug.scale.set(ow+7.5,1,oh+6);for(const f of V3.fringe){f.scale.set(ow+7.3,1,1);f.position.z=f.userData.s*((oh+6)/2+.2)}
  V3.lamp.position.set(-ow/2-2.6,-.53,oh*.12);V3.lamp.rotation.y=.5;V3.coins.position.set(ow/2+2.2,-.53,oh*.22);V3.deck.position.set(ow/2+2.4,-.53,-oh*.2);V3.deck.rotation.y=-.25;
  const s=Math.max(ow,oh)/2+1.2;Object.assign(V3.sun.shadow.camera,{left:-s,right:s,top:s,bottom:-s});V3.sun.shadow.camera.updateProjectionMatrix();
  if(V3.walls)sc.remove(V3.walls);V3.walls=null;V3.wk=''}
function placeCam(){const o=V3.cur;V3.cam.position.set(V3.look.x+Math.sin(o.a)*Math.cos(o.e)*o.d,V3.look.y+Math.sin(o.e)*o.d,V3.look.z+Math.cos(o.a)*Math.cos(o.e)*o.d);V3.cam.lookAt(V3.look)}
function resize3D(snap){if(!V3.r)return;V3.dirty=true;const el=V3.r.domElement.parentElement;const w=Math.max(50,el.clientWidth),h=Math.max(50,el.clientHeight);V3.r.setSize(w,h,false);V3.r.domElement.style.width=w+'px';V3.r.domElement.style.height=h+'px';V3.cam.aspect=w/h;V3.cam.updateProjectionMatrix();
  if(V3.post)postSize(w,h);fitDist();if(snap!==false){Object.assign(V3.cur,V3.orbit);placeCam()}}
// fit the whole board (plus stacks) for the current aspect ratio; the camera eases there
function fitDist(){const a=V3.cam.aspect;const W=BW()*(TS+GAP)+2.6,D=BH()*(TS+GAP)+2.6;const vf=V3.cam.fov*Math.PI/180;const hf=2*Math.atan(Math.tan(vf/2)*a);
  const e=V3.orbit.e;const needH=(D*Math.sin(e)+3)/2,needW=W/2;const d=Math.max(needH/Math.tan(vf/2),needW/Math.tan(hf/2))*1.06+3;V3.orbit.d=d*(V3.zoom||1)}
function tilePos(i){const W=BW(),H=BH();const c=i%W,r=Math.floor(i/W);return new THREE.Vector3((c-(W-1)/2)*(TS+GAP),0,(r-(H-1)/2)*(TS+GAP))}
function seeded(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
// ---- a tile: a thick printed board tile with bevelled edges; the art is printed on top, the core colour shows on the edges ----
function tileMesh(t,i){const g=new THREE.Group();const R=seeded(i*131+7);
  if(!V3.tileGeo)V3.tileGeo=slabGeo(rrShape(TS-.12,TS-.12,.16),TH-.1,.05,TS,TS,3);
  const S=V3.q==='high'?512:384;const top=STD({map:tex(tileArt(t,i,tileCoord(i),S)),roughness:.58,bumpMap:V3.T.linen,bumpScale:.8,envMapIntensity:.55,emissive:0x000000});
  top.color.setHSL(0,0,.95+R()*.05);
  const slab=new THREE.Mesh(V3.tileGeo,[top,t.blue?V3.M.side.b:V3.M.side.r]);slab.castShadow=slab.receiveShadow=true;slab.userData.tile=i;slab.rotation.y=(R()-.5)*.03;g.add(slab);g.userData.top=top;
  if(t.k==='oasis'||t.k==='lake'){const w=new THREE.Mesh(new THREE.CircleGeometry(1,40),V3.M.water);w.rotation.x=-Math.PI/2;if(t.k==='oasis'){w.scale.set(.44,.34,1);w.position.set(-.3,TH+.004,-.34)}else{w.scale.set(.98,.82,1);w.position.set(0,TH+.004,-.14)}w.renderOrder=2;g.add(w)}
  // highlight: a glowing rounded frame around the tile
  if(!V3.hlGeo){const s=rrShape(TS+.12,TS+.12,.24);s.holes.push(rrPath(TS-.1,TS-.1,.16));V3.hlGeo=new THREE.ShapeGeometry(s,6);V3.hlGeo.rotateX(-Math.PI/2)}
  const hl=new THREE.Mesh(V3.hlGeo,V3.M.hl.clone());hl.position.y=TH+.012;hl.visible=false;hl.userData.hl=1;hl.renderOrder=3;g.add(hl);g.userData.hl=hl;
  return g}
function blobUnder(r,op){const m=new THREE.Mesh(V3.blobGeo,V3.M.blob);m.scale.set(r,r,r);m.position.y=.006;if(op!=null){m.material=V3.M.blob.clone();m.material.opacity=op}m.renderOrder=1;return m}
// ---- shared piece geometry ----
function buildPieces(){V3.blobGeo=new THREE.PlaneGeometry(1,1);V3.blobGeo.rotateX(-Math.PI/2);
  // turned wooden pawn: foot, flared skirt, waist, collar bead, neck, round head
  const P=[[0,0],[.165,0],[.178,.012],[.18,.03],[.17,.05],[.15,.058],[.135,.07],[.118,.12],[.098,.2],[.082,.262],[.1,.272],[.112,.285],[.1,.3],[.07,.308],[.062,.33]];
  for(let a=-70;a<=90;a+=10){const t=a*Math.PI/180;P.push([Math.cos(t)*.105,.425+Math.sin(t)*.105])}P.push([0,.53]);
  V3.pawnGeo=new THREE.LatheGeometry(P.map(([x,y])=>new THREE.Vector2(Math.max(0.0001,x),y)),28);V3.pawnGeo.scale(1.18,1.18,1.18);
  V3.pawnMat=PHYS({color:0xffffff,roughness:.44,map:V3.T.pale,clearcoat:.45,clearcoatRoughness:.3,envMapIntensity:.8});
  V3.pawns=new THREE.InstancedMesh(V3.pawnGeo,V3.pawnMat,180);V3.pawns.castShadow=true;V3.pawns.receiveShadow=true;V3.pawns.frustumCulled=false;V3.pawns.count=0;
  V3.pawns.setColorAt(0,new THREE.Color(1,1,1));V3.scene.add(V3.pawns);
  V3.pblobs=new THREE.InstancedMesh(V3.blobGeo,V3.M.blob,180);V3.pblobs.frustumCulled=false;V3.pblobs.count=0;V3.pblobs.renderOrder=1;V3.scene.add(V3.pblobs);
  // carved camel: a bevelled silhouette cut from a thick wooden board
  const s=new THREE.Shape();s.moveTo(-.36,0);s.lineTo(-.28,0);s.lineTo(-.25,.27);s.lineTo(.15,.27);s.lineTo(.19,0);s.lineTo(.27,0);s.lineTo(.3,.34);
  s.quadraticCurveTo(.4,.44,.48,.64);s.lineTo(.6,.66);s.quadraticCurveTo(.67,.7,.63,.76);s.lineTo(.55,.8);s.lineTo(.5,.86);s.lineTo(.46,.8);s.quadraticCurveTo(.4,.7,.35,.56);s.quadraticCurveTo(.3,.5,.22,.52);
  s.bezierCurveTo(.14,.72,-.02,.86,-.12,.8);s.bezierCurveTo(-.24,.74,-.3,.6,-.36,.52);s.quadraticCurveTo(-.42,.46,-.43,.3);s.lineTo(-.39,.3);s.closePath();
  const cg=new THREE.ExtrudeGeometry(s,{depth:.13,bevelEnabled:true,bevelThickness:.03,bevelSize:.022,bevelSegments:3,curveSegments:8});cg.translate(0,.022,-.065);cg.computeVertexNormals();V3.camelGeo=cg;
  // palace: arcaded base, cornice, drum, onion dome, finial and four little corner domes
  const onion=[[0,0],[.13,0],[.15,.03],[.17,.08],[.165,.14],[.13,.2],[.08,.25],[.04,.29],[.02,.32],[0,.34]].map(([x,y])=>new THREE.Vector2(x,y));V3.onionGeo=new THREE.LatheGeometry(onion,24);
  V3.palBase=new THREE.BoxGeometry(.36,.26,.36);V3.palCorn=slabGeo(rrShape(.42,.42,.05),.03,.012,1,1,2);V3.palDrum=new THREE.CylinderGeometry(.13,.14,.08,20);V3.palFin=new THREE.ConeGeometry(.018,.12,8);V3.palTow=new THREE.CylinderGeometry(.035,.04,.34,10);V3.palSmall=new THREE.SphereGeometry(.045,12,8,0,Math.PI*2,0,Math.PI/2);
  // palm: bent tapered trunk + drooping fronds
  const tg=new THREE.CylinderGeometry(.035,.06,1,8,8);tg.translate(0,.5,0);const tp=tg.attributes.position;for(let i=0;i<tp.count;i++){const y=tp.getY(i);tp.setX(i,tp.getX(i)+y*y*.18)}tg.computeVertexNormals();V3.trunkGeo=tg;
  const lg=new THREE.PlaneGeometry(.56,.26,8,2);lg.translate(.28,0,0);const lp=lg.attributes.position;for(let i=0;i<lp.count;i++){const x=lp.getX(i),z=lp.getY(i);lp.setXYZ(i,x,-x*x*.9+Math.abs(z)*.25,z*(1-x/.75))}lg.computeVertexNormals();V3.leafGeo=lg;
  V3.tentGeo=new THREE.LatheGeometry([[0,.62],[.06,.56],[.16,.4],[.3,.16],[.42,.02],[.44,0]].map(([x,y])=>new THREE.Vector2(x,y)),6);
  V3.camelMat={};V3.pennant={}}
function palmMesh(g,x,z,y,s){s=s||1;const p=new THREE.Group();p.position.set(x,y,z);p.scale.setScalar(s);const R=seeded(Math.round((x+5)*97+(z+5)*31));
  const tr=new THREE.Mesh(V3.trunkGeo,V3.M.bark);tr.castShadow=true;p.add(tr);const crown=new THREE.Group();crown.position.set(.18,1,0);p.add(crown);
  for(let k=0;k<8;k++){const l=new THREE.Mesh(V3.leafGeo,V3.M.leaf);l.rotation.set(0,k/8*Math.PI*2+R()*.3,.25+R()*.25);l.castShadow=true;crown.add(l)}
  for(let k=0;k<3;k++){const c=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),V3.M.coco);c.position.set(Math.cos(k*2.1)*.05,-.05,Math.sin(k*2.1)*.05);crown.add(c)}
  crown.userData.sway=R()*6;p.rotation.y=R()*6;p.add(blobUnder(.6/s));g.add(p);return p}
function palaceMesh(){const g=new THREE.Group();const M=V3.M;const add=(geo,mat,y,x,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y,z||0);m.castShadow=true;m.receiveShadow=true;g.add(m);return m};
  add(V3.palBase,M.stone,.13);add(V3.palCorn,M.stonePlain,.26);add(V3.palDrum,M.stonePlain,.35);add(V3.onionGeo,M.gold,.39);add(V3.palFin,M.gold,.78);
  for(const [x,z] of [[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]]){add(V3.palTow,M.stonePlain,.17,x,z);add(V3.palSmall,M.glazeTeal,.34,x,z)}g.add(blobUnder(.75));return g}
function meepleMesh(color){const g=new THREE.Object3D();g.userData.color=color;return g}
function paintMat(c){return V3.camelMat[c]||(V3.camelMat[c]=V3.M.paint(c))}
function tentMesh(p){const g=new THREE.Group();const m=new THREE.Mesh(V3.tentGeo,STD({map:tex(stripeCanvas('#'+PCOL3[p%5].toString(16).padStart(6,'0'))),roughness:.8}));m.rotation.y=Math.PI/6;m.castShadow=true;g.add(m);
  const f=new THREE.Mesh(V3.palFin,V3.M.brass);f.position.y=.66;g.add(f);g.add(blobUnder(1));return g}
// small silk pennant on a brass pole so the owner reads from far away
function flagMesh(p){const g=new THREE.Group();const pole=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.7,6),V3.M.brass);pole.position.y=.35;pole.castShadow=true;g.add(pole);
  const fg=new THREE.PlaneGeometry(.26,.15,6,1);fg.translate(.13,0,0);const f=new THREE.Mesh(fg,V3.pennant[p]||(V3.pennant[p]=PHYS({color:PCOL3[p%5],roughness:.5,sheen:1,sheenColor:new THREE.Color(0xffffff),side:THREE.DoubleSide})));f.position.y=.62;f.userData.flag=Math.random()*6;f.castShadow=true;g.add(f);return g}
function camelMesh(p){const g=new THREE.Group();const m=new THREE.Mesh(V3.camelGeo,paintMat(PCOL3[p%5]));m.castShadow=true;m.receiveShadow=true;g.add(m);g.scale.setScalar(1.05);g.add(blobUnder(.9));return g}
function badgeSprite(parts,opt,w){const tx=tex(badgeCanvas(parts,opt));const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:false,toneMapped:false}));sp.scale.set(w||1.6,(w||1.6)*.375,1);sp.renderOrder=5;return sp}
function countBadge(txt){return badgeSprite([{t:txt}])}
// crags of carved sandstone between two tiles (Crafters mountains)
function rockMesh(R,h){const g=new THREE.IcosahedronGeometry(1,1);const p=g.attributes.position;const col=[];const c=new THREE.Color(),lo=new THREE.Color(0x3e2418),hi=new THREE.Color(0x9a7a60);const sd=R()*100;
  const hsh=(x,y,z)=>{const v=Math.sin(x*12.99+y*78.23+z*37.72+sd)*43758.55;return v-Math.floor(v)};
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const f=.8+hsh(x,y,z)*.4;const yy=y>0?y*h*f:y*.12;const tp=1-Math.max(0,y)*.3;p.setXYZ(i,x*f*.46*tp,yy+.02,z*f*.4*tp);
    c.copy(lo).lerp(hi,Math.min(1,Math.max(0,y)*.9+hsh(z,x,y)*.25));col.push(c.r,c.g,c.b)}g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();const m=new THREE.Mesh(g,V3.M.rock);m.castShadow=m.receiveShadow=true;return m}
// ---- sync the scene with G (read-only) ----
function sync3D(){if(!V3.on||!G||!G.board)return;if(PH)PH.wake();V3.dirty=true;const sc=V3.scene;
  G.board.forEach((t,i)=>{let o=V3.tiles[i];const key=t.k+t.v+(t.blue?1:0)+(t.gone?'x':'');
    if(!o||o.key!==key){if(o)sc.remove(o.g);const g=t.gone?new THREE.Group():tileMesh(t,i);g.position.copy(tilePos(i));sc.add(g);o=V3.tiles[i]={g,key,deco:null,dk:'',was:{camel:t.camel,tent:t.tent,palm:t.palm||0,pal:t.pal||0}}}
    o.g.userData.id=i;
    // camel, palms, palaces
    const dk=JSON.stringify([t.camel,t.tent,t.palm,t.pal]);if(o.dk!==dk){if(o.deco)o.g.remove(o.deco);const d=new THREE.Group();const y=TH+.004;const was=o.was||{};
      if(t.camel!=null){const c=camelMesh(t.camel);const fl=flagMesh(t.camel);fl.position.set(-.34,0,-.02);c.add(fl);c.position.set(.58,y,-.55);c.rotation.y=-.5;d.add(c);if(was.camel==null)animIn(c,'drop',i)}
      if(t.tent!=null){const c=tentMesh(t.tent);c.position.set(.6,y,-.55);d.add(c);if(was.tent==null)animIn(c,'drop',i)}
      for(let k=0;k<Math.min(3,t.palm||0);k++){const p=palmMesh(d,.05+k*.36,-.8,y,.8);if(k>=(was.palm||0))animIn(p,'pop',i)}
      if(t.palm>1||t.pal>1){const parts=[];if(t.palm)parts.push({icon:'palm'},{t:'×'+t.palm});if(t.pal)parts.push({icon:'palace'},{t:'×'+t.pal});const bd=badgeSprite(parts,null,1.5);bd.position.set(0,y+1.55,-.2);d.add(bd)}
      for(let k=0;k<Math.min(3,t.pal||0);k++){const p=palaceMesh();p.scale.setScalar(1.3);p.position.set(-.7+k*.5,y,.4);p.rotation.y=(k-1)*.12;d.add(p);if(k>=(was.pal||0))animIn(p,'pop',i)}
      o.g.add(d);o.deco=d;o.dk=dk;o.was={camel:t.camel,tent:t.tent,palm:t.palm||0,pal:t.pal||0}}});
  const wk=Object.keys(G.walls||{}).join(',');if(V3.wk!==wk){if(V3.walls)sc.remove(V3.walls);const wg=new THREE.Group();
    for(const k of Object.keys(G.walls||{})){const [a,b]=k.split('_').map(Number);const pa=tilePos(a),pb=tilePos(b);const horiz=Math.abs(a-b)===1;const R=seeded(a*37+b*11+3);
      for(let j=-2;j<=2;j++){const m=rockMesh(R,(j%2?.55:.95)-Math.abs(j)*.12);const cx=(pa.x+pb.x)/2,cz=(pa.z+pb.z)/2;m.position.set(cx+(horiz?(R()-.5)*.12:j*.36),0,cz+(horiz?j*.36:(R()-.5)*.12));m.scale.multiplyScalar(.8-Math.abs(j)*.1);m.rotation.y=R()*6;wg.add(m)}}
    sc.add(wg);V3.walls=wg;V3.wk=wk}
  syncStacks();V3.pick=UI.pick||[];V3.faint=UI.pickFaint||[];const bk=JSON.stringify(UI.badges||null);if(V3.bk!==bk){V3.bk=bk;showBadges3D(UI.badges)}
  swapMats();scorePops()}
// score pops: when a player's total rises, a "+N" rises from the tile where the action happened
function scorePops(){if(typeof scoreOf!=='function')return;let tot;try{tot=G.pl.map(p=>scoreOf(p).total)}catch(e){return}const prev=V3.scores;V3.scores=tot;if(!prev||prev.length!==tot.length)return;
  const at=G.act&&G.act.tile!=null?G.act.tile:null;if(at==null||tot.filter((v,i)=>v>prev[i]).length!==1)return;tot.forEach((v,i)=>{const d=v-prev[i];if(d>0){const col='#'+PCOL3[i%5].toString(16).padStart(6,'0');const sp=badgeSprite([{t:'+'+d}],{fill:col,fill2:'#1a0f08'},1.2);const p=tilePos(at);sp.position.set(p.x,TH+1.1,p.z);V3.scene.add(sp);V3.fx.push({o:sp,t:0,dur:1.8,vy:.7,pop:1});burst(p,'spark',10)}})}
function animIn(o,kind,i){o.userData.anim={kind,t:-(Math.random()*.08),base:o.position.clone(),tile:i};V3.anims.push(o);if(kind==='pop'){o.userData.s0=o.scale.x;o.scale.setScalar(.001)}}
// meeples: drawn as one instanced mesh of turned pawns; each keeps its own position, arcs to its target and lands with a bounce
function syncStacks(){const want={};
  G.board.forEach((t,i)=>{(t.m||[]).forEach((c,k)=>{want['b'+i+'_'+k]={c,i,k,n:t.m.length}})});
  const mv=G.move;if(mv&&mv.hand)mv.hand.forEach((c,k)=>{want['h'+k]={c,i:mv.at,k,n:mv.hand.length,hand:1}});
  for(const id in V3.stacks){const s=V3.stacks[id];if(!want[id]||want[id].c!==s.c){delete V3.stacks[id]}}
  let born=0;for(const id in want){const w=want[id];let s=V3.stacks[id];if(!s){const g=meepleMesh(w.c);const p0=tilePos(w.i);g.position.set(p0.x+(Math.random()-.5)*.3,TH+2.4,p0.z+(Math.random()-.5)*.3);const col=new THREE.Color(MCOL[w.c]||0x888888);col.offsetHSL(0,(Math.random()-.5)*.04,(Math.random()-.5)*.05);
      s=V3.stacks[id]={g,c:w.c,col,rot:Math.random()*6,delay:Math.min(1.2,born++*.012)}}
    const p=tilePos(w.i);const cols=Math.min(4,Math.ceil(Math.sqrt(w.n)));const row=Math.floor(w.k/cols),col=w.k%cols;s.i=w.i;s.hand=!!w.hand;
    s.to=w.hand?new THREE.Vector3(p.x-.4+w.k*.28,TH+1.1,p.z-.2):new THREE.Vector3(p.x-.5+col*.33,TH+.004,p.z-.3+row*.3)}}
function tween(obj,k,to,dur){V3.tweens.push({obj,k,from:obj[k],to,t:0,dur})}
const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
// ---- particles: dust puffs on landing, sparkles on claims and builds ----
const FXCFG={spark:()=>({map:V3.T.spark,color:0xffe6a0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}),dust:()=>({map:V3.T.soft,color:0xe9cfa0,transparent:true,depthWrite:false,opacity:.7,toneMapped:true}),
  badge:()=>({map:V3.T.soft,transparent:true,depthTest:false,toneMapped:false})};
// particle sprites are pooled so no material (and no shader program) is created or released during play
function fxSprite(kind){const pool=V3.fxPool[kind]||(V3.fxPool[kind]=[]);const sp=pool.pop()||new THREE.Sprite(new THREE.SpriteMaterial(FXCFG[kind]()));sp.userData.kind=kind;V3.scene.add(sp);return sp}
// keep one tiny sprite of each kind drawn at all times (hidden under the table) so their programs stay compiled
function fxKeepers(){for(const k in FXCFG){const sp=new THREE.Sprite(new THREE.SpriteMaterial(FXCFG[k]()));sp.scale.setScalar(.001);sp.position.set(0,-3,0);sp.frustumCulled=false;V3.scene.add(sp)}}
function burst(p,kind,n){if(!V3.on)return;if(V3.q==='low')n=Math.ceil(n/2);if(V3.fx.length>140)return;for(let k=0;k<n;k++){const sp=fxSprite(kind);sp.material.opacity=kind==='spark'?1:.7;
  const a=Math.random()*Math.PI*2,sp0=kind==='spark'?.6+Math.random()*.8:.5+Math.random()*.4;sp.position.set(p.x+Math.cos(a)*.1,(p.y||TH)+.08+(kind==='spark'?.3:0),p.z+Math.sin(a)*.1);const s=kind==='spark'?.22+Math.random()*.2:.18;sp.scale.set(s,s,1);
  V3.fx.push({o:sp,t:0,dur:kind==='spark'?.9+Math.random()*.5:.65,vx:Math.cos(a)*sp0,vz:Math.sin(a)*sp0,vy:kind==='spark'?1.2+Math.random():.25,grow:kind==='spark'?-.1:1.8,s})}}
function stepFx(dt){for(let k=V3.fx.length-1;k>=0;k--){const f=V3.fx[k];f.t+=dt;const u=f.t/f.dur;const o=f.o;
    if(f.pop){o.position.y+=f.vy*dt*(1-u);o.material.opacity=u<.7?1:1-(u-.7)/.3;const s=u<.12?u/.12:1;o.scale.set(1.2*s,.45*s,1)}
    else{o.position.x+=f.vx*dt*(1-u);o.position.z+=f.vz*dt*(1-u);o.position.y+=f.vy*dt;f.vy-=dt*(f.grow<0?1.8:0);const s=f.s*(1+f.grow*u);o.scale.set(s,s,1);o.material.opacity=(f.grow<0?1:.7)*(1-u)*(1-u)}
    if(u>=1){V3.scene.remove(o);if(f.pop){o.material.map.dispose();o.material.dispose()}else V3.fxPool[o.userData.kind].push(o);V3.fx.splice(k,1)}}}
const _m4=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_s=new THREE.Vector3(),_v=new THREE.Vector3();
function stepPieces(dt,t){let n=0;const P=V3.pawns,B=V3.pblobs;
  for(const id in V3.stacks){const s=V3.stacks[id];const pos=s.g.position;
    if(s.to&&(!s.arc||!s.arc.to.equals(s.to))&&pos.distanceTo(s.to)>.02){const d=pos.distanceTo(s.to);s.arc={from:pos.clone(),to:s.to.clone(),t:-(s.delay||0),dur:.34+Math.min(.3,d*.05),h:Math.min(1.2,.35+d*.12)};s.delay=0}
    if(s.arc){const a=s.arc;a.t+=dt;if(a.t>=0){const k=Math.min(1,a.t/a.dur),e=ease(k);pos.lerpVectors(a.from,a.to,e);pos.y+=Math.sin(Math.PI*k)*a.h;if(k>=1){s.arc=null;pos.copy(a.to);if(!s.hand){s.sq=0;if(Math.random()<.5||V3.q!=='low')burst(pos,'dust',3)}}}}
    let sq=0;if(s.sq!=null){s.sq+=dt;const u=s.sq/.32;if(u>=1)s.sq=null;else sq=Math.sin(u*Math.PI)*.16*(1-u)}
    const lift=V3.lift[s.i]||0;_v.copy(pos);_v.y+=lift+(s.hand&&!s.arc?Math.sin(t*3+s.rot)*.06:0);_s.set(1+sq*.6,1-sq,1+sq*.6);_q.setFromEuler(_e.set(0,s.rot+(s.hand?t*.8:0),0));_m4.compose(_v,_q,_s);P.setMatrixAt(n,_m4);P.setColorAt(n,s.col);
    const hgt=Math.max(0,_v.y-TH);const bs=.5*Math.max(.35,1-hgt*.45);_v.set(pos.x,TH+.006+lift,pos.z);_s.set(bs,1,bs);_q.identity();_m4.compose(_v,_q,_s);B.setMatrixAt(n,_m4);n++;if(n>=180)break}
  V3.moving=Object.values(V3.stacks).some(s=>s.arc||s.sq!=null);P.count=B.count=n;P.instanceMatrix.needsUpdate=B.instanceMatrix.needsUpdate=true;if(P.instanceColor)P.instanceColor.needsUpdate=true}
function stepAnims(dt){for(let k=V3.anims.length-1;k>=0;k--){const o=V3.anims[k];const a=o.userData.anim;a.t+=dt;const u=Math.max(0,Math.min(1,a.t/.55));
    if(a.kind==='drop'){const e=u<.7?Math.pow(u/.7,2):1;o.position.y=a.base.y+(1-e)*1.6+(u>.7?Math.sin((u-.7)/.3*Math.PI)*.12*(1-u):0);if(u>=.7&&!a.hit){a.hit=1;const p=tilePos(a.tile);burst(new THREE.Vector3(p.x+o.position.x,TH,p.z+o.position.z),'dust',6);burst(new THREE.Vector3(p.x+o.position.x,TH,p.z+o.position.z),'spark',8)}}
    else{const e=u<1?1+Math.sin(u*Math.PI*1.5)*(1-u)*.35:1;o.scale.setScalar(Math.max(.001,o.userData.s0*Math.min(1,u*2.2)*e));if(!a.hit&&u>.2){a.hit=1;const p=tilePos(a.tile);burst(new THREE.Vector3(p.x+o.position.x,TH,p.z+o.position.z),'spark',7)}}
    if(u>=1){o.position.y=a.base.y;if(a.kind==='pop')o.scale.setScalar(o.userData.s0||1);delete o.userData.anim;V3.anims.splice(k,1)}}}
function loop3D(){(PH?PH.raf:requestAnimationFrame)(loop3D);const raw=V3.clock.getDelta();const dt=Math.min(.05,raw);V3.t+=dt;const t=V3.t;
  // camera eases to its target orbit
  const c=V3.cur,o=V3.orbit,k=1-Math.exp(-dt*(V3.drag?16:6));c.a+=(o.a-c.a)*k;c.e+=(o.e-c.e)*k;c.d+=(o.d-c.d)*k;placeCam();
  stepPieces(dt,t);stepAnims(dt);stepFx(dt);
  let lifting=false;for(const id in V3.tiles){const o=V3.tiles[id];const i=+id;const hot=V3.pick.includes(i);const hv=V3.hover===i&&hot;const top=o.g.userData.top;
    const lt=hv?.07:0;const l=(V3.lift[i]||0)+(lt-(V3.lift[i]||0))*Math.min(1,dt*12);if(Math.abs(lt-l)>.002)lifting=true;V3.lift[i]=l;o.g.position.y=l;
    if(top){const em=hv?.26:hot?.1+.06*Math.sin(t*3):0;if(Math.abs((o.em||0)-em)>.004){o.em=em;top.emissive.setRGB(em*1.0,em*.62,em*.2)}}
    const hl=o.g.userData.hl;const faint=!hot&&V3.faint&&V3.faint.includes(i);if(hl){hl.visible=hot||faint;if(faint){hl.material.opacity=.13;hl.material.color.setHex(0xffe2a0)}if(hot){hl.material.opacity=.6+.35*Math.abs(Math.sin(t*3));hl.material.color.setHex(hv?0xffffff:0xffc93a)}}
    if(o.deco)o.deco.traverse(x=>{if(x.userData.sway!=null)x.rotation.z=Math.sin(t*1.3+x.userData.sway)*.05;if(x.userData.flag!=null){x.rotation.y=Math.sin(t*3+x.userData.flag)*.35}})}
  if(V3.T.waterN)V3.T.waterN.offset.set(t*.02,t*.013);
  if(V3.flame){const f=1+Math.sin(t*13)*.08+Math.sin(t*7.3)*.06;V3.flame.scale.set(.5*f,.75*f,1);V3.flameCore.scale.set(1,2*f,1)}
  if(V3.motes&&V3.motes.visible){V3.motes.rotation.y=t*.01;V3.motes.position.y=Math.sin(t*.3)*.2}
  if(V3.pathG)for(const c of V3.pathG.children){if(c.userData.pulse){const k=1+.12*Math.sin(t*4);c.scale.set(k,k,k)}if(c.userData.step!=null){c.material.opacity=.5+.5*Math.max(0,Math.sin(t*4-c.userData.step*.7))}}
  // PerfHUD's idle saver slows the loop to 10 fps only while none of this moves (ambient sway, water and flame keep going at 10 fps)
  const busy=V3.dirty||V3.drag||V3.fx.length||V3.anims.length||V3.moving||lifting||Math.abs(o.a-c.a)+Math.abs(o.e-c.e)+Math.abs(o.d-c.d)>.002||V3.hover!==V3.lastHover;
  V3.busy=!!busy||!!(PH&&PH.testing);
  V3.dirty=false;V3.lastHover=V3.hover;V3.lastR=V3.clock.elapsedTime;V3.rendered=true;V3.r.info.autoReset=false;V3.r.info.reset();
  if(V3.post)renderPost();else{V3.r.setRenderTarget(null);V3.r.render(V3.scene,V3.cam)}}
// ---- post-processing (High): MSAA HDR scene -> bright pass -> 2-level blur -> bloom + ACES + vignette + warm grade ----
const FSV='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
function postInit(){const P=V3.P={};const o={type:THREE.HalfFloatType};P.rt=new THREE.WebGLRenderTarget(4,4,Object.assign({samples:4},o));P.a=new THREE.WebGLRenderTarget(4,4,o);P.b=new THREE.WebGLRenderTarget(4,4,o);P.c=new THREE.WebGLRenderTarget(4,4,o);P.d=new THREE.WebGLRenderTarget(4,4,o);
  P.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);P.scene=new THREE.Scene();P.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));P.quad.frustumCulled=false;P.scene.add(P.quad);
  const sm=(fs,u)=>new THREE.ShaderMaterial({uniforms:u,vertexShader:FSV,fragmentShader:fs,depthTest:false,depthWrite:false});
  P.bright=sm('uniform sampler2D t;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));float k=smoothstep(.85,1.6,l);gl_FragColor=vec4(c*k,1.);}',{t:{value:null}});
  P.blur=sm('uniform sampler2D t;uniform vec2 d;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb*.227;c+=(texture2D(t,vUv+d*1.385).rgb+texture2D(t,vUv-d*1.385).rgb)*.316;c+=(texture2D(t,vUv+d*3.231).rgb+texture2D(t,vUv-d*3.231).rgb)*.07;gl_FragColor=vec4(c,1.);}',{t:{value:null},d:{value:new THREE.Vector2()}});
  P.comp=sm(`uniform sampler2D t,b1,b2;uniform float ex;varying vec2 vUv;
vec3 RRT(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 b=v*(.983729*v+.4329510)+.238081;return a/b;}
vec3 aces(vec3 c){const mat3 I=mat3(vec3(.59719,.07600,.02840),vec3(.35458,.90834,.13383),vec3(.04823,.01566,.83777));const mat3 O=mat3(vec3(1.60475,-.10208,-.00327),vec3(-.53108,1.10813,-.07276),vec3(-.07367,-.00605,1.07602));c*=ex/.6;c=I*c;c=RRT(c);c=O*c;return clamp(c,0.,1.);}
vec3 srgb(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(vec3(.0031308),c));}
void main(){vec3 c=texture2D(t,vUv).rgb;c+=texture2D(b1,vUv).rgb*.35+texture2D(b2,vUv).rgb*.55;c=aces(c);
 float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.06);c=mix(c,c*vec3(1.04,.99,.9),.5*(1.-l));c=c*vec3(1.01,1.,.97);
 vec2 q=vUv-.5;float v=smoothstep(.95,.25,length(q*vec2(1.1,1.)));c*=mix(.72,1.,v);gl_FragColor=vec4(srgb(c),1.);}`,{t:{value:null},b1:{value:null},b2:{value:null},ex:{value:1}})}
function postSize(w,h){if(!V3.P)postInit();const P=V3.P;const pr=V3.r.getPixelRatio();const W=Math.round(w*pr),H=Math.round(h*pr);P.rt.setSize(W,H);P.a.setSize(W>>1,H>>1);P.b.setSize(W>>1,H>>1);P.c.setSize(W>>2,H>>2);P.d.setSize(W>>2,H>>2);P.W=W;P.H=H}
function renderPost(){const P=V3.P,r=V3.r;if(!P||!P.W)return postSize(r.domElement.clientWidth,r.domElement.clientHeight);const pass=(m,to)=>{P.quad.material=m;r.setRenderTarget(to);r.render(P.scene,P.cam)};
  r.setRenderTarget(P.rt);r.render(V3.scene,V3.cam);
  P.bright.uniforms.t.value=P.rt.texture;pass(P.bright,P.a);
  P.blur.uniforms.t.value=P.a.texture;P.blur.uniforms.d.value.set(2/P.W,0);pass(P.blur,P.b);P.blur.uniforms.t.value=P.b.texture;P.blur.uniforms.d.value.set(0,2/P.H);pass(P.blur,P.a);
  P.blur.uniforms.t.value=P.a.texture;P.blur.uniforms.d.value.set(4/P.W,0);pass(P.blur,P.c);P.blur.uniforms.t.value=P.c.texture;P.blur.uniforms.d.value.set(0,4/P.H);pass(P.blur,P.d);
  const u=P.comp.uniforms;u.t.value=P.rt.texture;u.b1.value=P.a.texture;u.b2.value=P.d.texture;u.ex.value=r.toneMappingExposure;pass(P.comp,null)}
function pickTile(e){const rc=V3.r.domElement.getBoundingClientRect();const m=new THREE.Vector2(((e.clientX-rc.left)/rc.width)*2-1,-((e.clientY-rc.top)/rc.height)*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(m,V3.cam);
  const hits=ray.intersectObjects(Object.values(V3.tiles).map(o=>o.g),true);for(const h of hits){if(h.object.isSprite)continue;let o=h.object;while(o&&o.userData.id===undefined)o=o.parent;if(o)return o.userData.id}return null}
// screen position of a tile, for anchored labels
function tileScreen(i){const p=tilePos(i);const v=new THREE.Vector3(p.x,TH+.2,p.z+TS*.42).project(V3.cam);const cv=V3.r.domElement;return {x:(v.x+1)/2*cv.clientWidth,y:(1-v.y)/2*cv.clientHeight,vis:v.z<1}}
// the path of a planned move: glowing footprints from tile to tile, with a ring on the landing tile
function showPath3D(path){if(!V3.on)return;V3.dirty=true;if(V3.pathG){V3.scene.remove(V3.pathG);V3.pathG=null}if(!path||path.length<2)return;const g=new THREE.Group();
  const col=new THREE.Color(1.5,1.25,.55);const mk=()=>new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.95,depthWrite:false,toneMapped:false});const y=TH+.62;let n=0;
  for(let k=0;k<path.length-1;k++){const a=tilePos(path[k]),b=tilePos(path[k+1]);const off=(k%2?.18:-.18);const dx=b.x-a.x,dz=b.z-a.z;const len=Math.hypot(dx,dz);const nx=-dz/len*off,nz=dx/len*off;
    for(let s=1;s<=3;s++){const t=s/4;const d=new THREE.Mesh(new THREE.CircleGeometry(.1,16),mk());d.rotation.x=-Math.PI/2;d.position.set(a.x+dx*t+nx,y,a.z+dz*t+nz);d.userData.step=n++;d.renderOrder=6;g.add(d)}
    const ar=new THREE.Mesh(new THREE.ConeGeometry(.2,.42,3),mk());ar.position.set(a.x+dx*.82+nx,y,a.z+dz*.82+nz);ar.rotation.order='YXZ';ar.rotation.y=Math.atan2(dx,dz);ar.rotation.x=Math.PI/2;ar.renderOrder=6;g.add(ar)}
  const s=tilePos(path[0]),e=tilePos(path[path.length-1]);
  const st=new THREE.Mesh(new THREE.RingGeometry(.35,.5,32),new THREE.MeshBasicMaterial({color:new THREE.Color(1.3,1.3,1.2),side:THREE.DoubleSide,toneMapped:false,transparent:true,depthWrite:false}));st.rotation.x=-Math.PI/2;st.position.set(s.x,y,s.z);g.add(st);
  const en=new THREE.Mesh(new THREE.RingGeometry(.55,.8,40),new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1.2,.35),side:THREE.DoubleSide,toneMapped:false,transparent:true,depthWrite:false}));en.rotation.x=-Math.PI/2;en.position.set(e.x,y,e.z);en.userData.pulse=1;g.add(en);
  V3.pathG=g;V3.scene.add(g)}
// value badges over the start tiles of the best plans
function showBadges3D(list){if(!V3.on)return;V3.dirty=true;if(V3.badgeG){V3.scene.remove(V3.badgeG);V3.badgeG.traverse(o=>{if(o.material){o.material.map&&o.material.map.dispose();o.material.dispose()}});V3.badgeG=null}if(!list||!list.length)return;const g=new THREE.Group();
  for(const b of list){const sp=badgeSprite([{t:b.txt}],{fill:'#2f7d46',fill2:'#123a1f'},1.5);const p=tilePos(b.i);sp.position.set(p.x,TH+1.9,p.z);g.add(sp)}V3.badgeG=g;V3.scene.add(g)}
