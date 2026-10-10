// ---- GS: the builder looks and handles like the 2K Drive Body Shop (garage worker 7, docs/GARAGE2K_GAP.md)
// 1) studio: the car stands on a light-grey tiled platform with blue LED dots and a yellow front arrow, inside a lit LEGO garage hall
//    (roller doors, neon GARAGE sign, shelves, paint cans, mechanic minifigs), with real shadows. Replaces the navy disc + cyan ring.
// 2) held part: on touch a tap shows the part where it will go (real colour, green corner brackets = fits, red = no room);
//    PLACE (or a second tap on the same spot) places it, ROTATE turns it, CANCEL drops it. Mouse hover/click is unchanged.
// 3) pop: a placed part flashes, throws stud confetti and the car bounces. 4) 3D part thumbnails in the palette (rendered once per part + colour).
const GS={on:0,held:null,hit:null,pt:'mouse',pops:[],th:null,thC:new Map(),y0:-.25};
function GS_tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
function GS_build(){if(GS.on||!GB.sc)return;GS.on=1;const S=GB.sc,R=GB.r;
 // hide the old navy disc and the cyan ring
 for(const o of S.children)if(o.isMesh&&o.geometry&&(o.geometry.type==='CylinderGeometry'||o.geometry.type==='TorusGeometry'))o.visible=false;
 for(const o of S.children){if(o.isHemisphereLight)o.intensity=.8;else if(o.isDirectionalLight)o.intensity*=.45}
 R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;S.fog=new THREE.Fog(0x313a4c,45,90);S.background=new THREE.Color(0x313a4c);
 const y0=GS.y0,G=new THREE.Group();G.name='gsStudio';S.add(G);GS.g=G;
 // key light with shadows (from the front-right, high)
 const k=new THREE.DirectionalLight(0xfff4e0,1.8);k.position.set(7,18,9);k.castShadow=true;k.shadow.mapSize.set(1024,1024);const sc=k.shadow.camera;sc.left=-14;sc.right=14;sc.top=14;sc.bottom=-14;sc.near=2;sc.far=50;k.shadow.bias=-.0006;k.shadow.normalBias=.02;G.add(k);G.add(k.target);
 // hall floor: dark polished concrete with big tiles
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.55,metalness:.1,map:GS_tex(512,512,(g,w,h)=>{g.fillStyle='#2b313b';g.fillRect(0,0,w,h);g.strokeStyle='#20252d';g.lineWidth=6;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*w/4,0);g.lineTo(i*w/4,h);g.moveTo(0,i*h/4);g.lineTo(w,i*h/4);g.stroke()}})}));
 fl.material.map.wrapS=fl.material.map.wrapT=THREE.RepeatWrapping;fl.material.map.repeat.set(22,22);fl.rotation.x=-Math.PI/2;fl.position.y=y0-.5;fl.receiveShadow=true;G.add(fl);
 // build platform: light grey tiles, dark rim, blue LED dots along the top edge, yellow front arrow (the car's nose points to -z)
 const PW=14,PL=23,pm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.42,map:GS_tex(512,512,(g,w,h)=>{g.fillStyle='#767c85';g.fillRect(0,0,w,h);g.strokeStyle='#5b616a';g.lineWidth=4;for(let i=0;i<=2;i++){g.beginPath();g.moveTo(i*w/2,0);g.lineTo(i*w/2,h);g.moveTo(0,i*h/2);g.lineTo(w,i*h/2);g.stroke()}})});
 pm.map.wrapS=pm.map.wrapT=THREE.RepeatWrapping;pm.map.repeat.set(PW/6,PL/6);
 const top=new THREE.Mesh(new THREE.PlaneGeometry(PW,PL),pm);top.rotation.x=-Math.PI/2;top.position.y=y0-.004;top.receiveShadow=true;G.add(top);
 const rim=new THREE.Mesh(new THREE.BoxGeometry(PW+.3,.5,PL+.3),new THREE.MeshStandardMaterial({color:0x22262e,roughness:.6}));rim.position.y=y0-.285;/* garage-18: rim top 3 cm under the tiles (was 1 mm: z-fighting, a dark dithered patch on the platform with a far camera) */rim.receiveShadow=true;G.add(rim);
 const dots=[];for(let x=-PW/2+.4;x<=PW/2-.3;x+=.75)dots.push([x,-PL/2+.35],[x,PL/2-.35]);for(let z=-PL/2+1.1;z<=PL/2-1;z+=.75)dots.push([-PW/2+.35,z],[PW/2-.35,z]);
 const led=new THREE.InstancedMesh(new THREE.BoxGeometry(.32,.03,.12),new THREE.MeshBasicMaterial({color:0x6f9bff,toneMapped:false}),dots.length),q=new THREE.Object3D();
 dots.forEach(([x,z],i)=>{q.position.set(x,y0+.012,z);q.rotation.y=Math.abs(Math.abs(z)-(PL/2-.35))<.01?0:Math.PI/2;q.updateMatrix();led.setMatrixAt(i,q.matrix)});G.add(led);
 const ar=new THREE.Mesh(new THREE.PlaneGeometry(4.2,4.2),new THREE.MeshStandardMaterial({transparent:true,roughness:.5,map:GS_tex(256,256,(g,w,h)=>{g.translate(w/2,h/2);g.beginPath();g.arc(0,0,118,0,7);g.fillStyle='#16181d';g.fill();
  g.beginPath();g.moveTo(0,-96);g.lineTo(84,6);g.lineTo(34,6);g.lineTo(34,86);g.lineTo(-34,86);g.lineTo(-34,6);g.lineTo(-84,6);g.closePath();g.fillStyle='#ffd12c';g.fill();g.lineWidth=8;g.strokeStyle='#141413';g.stroke()})}));
 ar.rotation.x=-Math.PI/2;ar.position.set(0,y0+.006,-PL/2+2.6);ar.receiveShadow=true;G.add(ar);
 // hall walls: grey upper panels with windows, a row of blue roller doors with yellow/black posts, red + yellow stripe
 const wt=GS_tex(1024,512,(g,w,h)=>{g.fillStyle='#8d97a8';g.fillRect(0,0,w,h);g.fillStyle='#a7b0bf';for(let i=0;i<8;i++)g.fillRect(i*128+6,8,116,150);g.fillStyle='#54627a';for(let i=0;i<8;i++){g.fillRect(i*128+20,40,40,60);g.fillRect(i*128+68,40,40,60)}
  g.fillStyle='#c4281c';g.fillRect(0,180,w,26);g.fillStyle='#f2c20c';g.fillRect(0,206,w,12);g.fillStyle='#d6dbe3';g.fillRect(0,218,w,h-218);
  for(let i=0;i<4;i++){const x=i*256+38;g.fillStyle='#24427a';g.fillRect(x,250,180,262);g.fillStyle='#2f5291';for(let y=256;y<512;y+=14)g.fillRect(x+4,y,172,8);g.fillStyle='#bcd3ff';g.fillRect(x+30,300,40,22);g.fillRect(x+110,300,40,22);
   for(const px of[x-22,x+186]){for(let y=230;y<512;y+=24){g.fillStyle='#f2c20c';g.fillRect(px,y,16,12);g.fillStyle='#141413';g.fillRect(px,y+12,16,12)}}}});
 wt.wrapS=THREE.RepeatWrapping;wt.repeat.set(3,1);const wm=new THREE.MeshStandardMaterial({map:wt,roughness:.8,side:THREE.BackSide}),HW=30,WH=18;
 const room=new THREE.Mesh(new THREE.BoxGeometry(HW*2,WH,HW*2),[wm,wm,new THREE.MeshStandardMaterial({color:0x272d38,side:THREE.BackSide}),new THREE.MeshStandardMaterial({visible:false}),wm,wm]);room.position.y=y0-.5+WH/2;G.add(room);
 // ceiling light strips (bright) so the hall reads as a lit workshop
 const ls=new THREE.MeshBasicMaterial({color:0xf4f8ff,toneMapped:false});for(let i=-2;i<=2;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(1.5,.2,50),ls);s.position.set(i*11,y0+WH-1.2,0);G.add(s)}
 // neon GARAGE signs on two walls
 const nt=GS_tex(512,128,(g,w,h)=>{g.fillStyle='#1a1030';g.fillRect(0,0,w,h);g.font='900 92px system-ui,Arial';g.textAlign='center';g.textBaseline='middle';g.shadowColor='#c06bff';g.shadowBlur=24;g.fillStyle='#f3e6ff';g.fillText('GARAGE',w/2,h/2+4);g.lineWidth=6;g.strokeStyle='#b05cff';g.strokeRect(6,6,w-12,h-12)});
 const nm=new THREE.MeshBasicMaterial({map:nt,toneMapped:false}),ng=new THREE.PlaneGeometry(9,2.25);for(const o of[-14,14])for(const[x,z,ry]of[[o,-HW+.3,0],[-HW+.3,o,Math.PI/2],[o,HW-.3,Math.PI],[HW-.3,o,-Math.PI/2]]){const s=new THREE.Mesh(ng,nm);s.position.set(x,y0+2,z);s.rotation.y=ry;G.add(s)}
 // props: shelves of paint cans, tool chests, tyre stacks (merged into one mesh)
 const P=[],box=(x0,x1,y1,y2,z0,z1,c)=>P.push(GB_box(x0,x1,y0-.5+y1,y0-.5+y2,z0,z1,c)),cyl=(r,h,x,y,z,c)=>P.push(GB_cyl(r,h,x,y0-.5+y,z,c,12));
 const shelf=(x,z,rot)=>{const A=[];const b=(a,b2,c,d,e,f,col)=>A.push(GB_box(a,b2,c,d,e,f,col));b(-4,4,0,.2,-.8,.8,'#c4281c');b(-4,4,1.6,1.8,-.8,.8,'#c4281c');b(-4,4,3.2,3.4,-.8,.8,'#c4281c');for(const sx of[-4,3.8])b(sx,sx+.2,0,3.6,-.8,.8,'#8a8f99');
  const cs=['#d01712','#0055bf','#fac80a','#00852b','#f4f4f4','#fe8a18','#8a12a8'];for(let i=0;i<10;i++)for(const sy of[.2,1.8]){const c=GB_cyl(.32,.9,-3.4+i*.75,sy,0,cs[(i+sy*3|0)%cs.length],10);A.push(c)}
  const m=mergeGeometries(A);m.scale(.5,.5,.5);m.rotateY(rot);m.translate(x,y0-.5,z);P.push(m)};
 {const e=HW-1.2;for(const x of[-18,-8,8,18])shelf(x,-e,0);for(const z of[-12,10])shelf(-e,z,Math.PI/2);for(const z of[-12,12])shelf(e,z,-Math.PI/2);for(const x of[-10,12])shelf(x,e,Math.PI)}
 for(const[x,z]of[[-18,-14],[19,10],[-20,16]]){box(x-.6,x+.6,0,1.2,z-.4,z+.4,'#c4281c');box(x-.6,x+.6,1.2,1.26,z-.4,z+.4,'#8a8f99');for(let d=.25;d<1.2;d+=.3)box(x-.55,x+.55,d,d+.04,z+.4,z+.43,'#f2f2f2')}
 for(const[x,z]of[[16,-16],[-16,-24],[22,22]])for(let i=0;i<3;i++)cyl(.55,.3,x,i*.31,z,'#1b2a34');
 const pg=mergeGeometries(P),pr=new THREE.Mesh(pg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5}));pr.castShadow=pr.receiveShadow=true;G.add(pr);
 // mechanic minifigs around the platform, same scale as the driver in the car (both from GB_figGeo at scale 1)
 const crew=[[{h:'grin',x:'cap',t:'plain',l:'#2b3a67',c:'#c4281c'},-11,-6,.9],[{h:'smile',x:'short',t:'hoodie',l:'#1b1d22',c:'#36d17a'},11.5,-9,-.6],[{h:'wink',x:'cap',t:'logo',l:'#2b3a67',c:'#2f7bff'},-10.5,8,2.2],[{h:'smile',x:'long',t:'plain',l:'#8a8f99',c:'#ff7a1c'},12,7,-2.4],[{h:'grin',x:'cap',t:'logo',l:'#1b1d22',c:'#fac80a'},-12,14,2.6],[{h:'smile',x:'short',t:'plain',l:'#2b3a67',c:'#0055bf'},-2,16,3.1]];
 GS.crew=[];for(const[f,x,z,ry]of crew){const M=[],L=[];GB_figGeo(f,M,L,false);const o=new THREE.Group();o.add(new THREE.Mesh(mergeGeometries(M),GB_MAT));if(L.length)o.add(new THREE.Mesh(mergeGeometries(L),GB_LMAT));o.traverse(m=>{if(m.isMesh)m.castShadow=true});
  o.position.set(x,y0-.5,z);o.rotation.y=ry;o.userData.ph=Math.random()*6;G.add(o);GS.crew.push(o)}
 // soft studio reflections for the glossy bricks (PERF1: built with the main renderer, the builder draws in its context)
 const cc0=renderer.getClearColor(new THREE.Color()),ca0=renderer.getClearAlpha();try{const pm2=new THREE.PMREMGenerator(renderer),es=new THREE.Scene();es.background=new THREE.Color(0x56607a);const lm=new THREE.MeshBasicMaterial({color:0xffffff});for(let i=-2;i<=2;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(2,.2,30),lm);s.position.set(i*5,8,0);es.add(s)}
  const fm=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshBasicMaterial({color:0x2a2f38}));fm.rotation.x=-Math.PI/2;fm.position.y=-2;es.add(fm);S.environment=pm2.fromScene(es,.04).texture;S.environmentIntensity=.55;pm2.dispose()}catch(e){console.warn('GS env',e)}renderer.setClearColor(cc0,ca0);
 GS_fitY()}
// the platform sits exactly under the tyres (measured from the wheel meshes; the old disc top was -0.25)
function GS_fitY(){if(!GS.g||!GB.mesh)return;GB.mesh.updateMatrixWorld(true);let y=null;const P=new THREE.Vector3(),Sc=new THREE.Vector3();
 GB.mesh.traverse(o=>{if(o.isMesh&&o.userData&&o.userData.r&&o.userData.gb){let v=1;for(let q=o;q;q=q.parent)if(!q.visible)v=0;if(!v)return;o.getWorldPosition(P);o.getWorldScale(Sc);const b=P.y-o.userData.r*Sc.y;y=y==null?b:Math.min(y,b)}});
 GS.g.position.y=y==null?0:clamp(y-GS.y0,-1,1);GS.gy=y}
// the garage car is its own copy (gbRender builds a new mesh), so the roam no-cast lock (ART6_noCast) is lifted here only
function GS_shadows(){if(!GB.mesh)return;GB.mesh.traverse(o=>{if(!o.isMesh||o.userData.gbG||o.isInstancedMesh)return;const m=o.material;if(!m||Array.isArray(m)||m.transparent||m.isShaderMaterial||m.isSpriteMaterial||m.blending!==THREE.NormalBlending)return;const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();if(g.boundingSphere&&g.boundingSphere.radius>7)return;Object.defineProperty(o,'castShadow',{value:true,writable:true,configurable:true})})}
// ---------- held part (touch): ghost in real colours + corner brackets + PLACE / ROTATE / CANCEL
GB_ghostSet=(f=>function(b){f(b);const g=GB_.ghost;if(!g||!b)return;g.material.dispose();g.material=new THREE.MeshStandardMaterial({vertexColors:true,transparent:true,opacity:b.bad?.45:.82,roughness:.35,depthWrite:false,emissive:b.bad?0x801010:0x103010,color:b.bad?0xff8080:0xffffff});g.renderOrder=3})(GB_ghostSet);
function GS_ui(){let B=$('#gsBar');if(!B){const v=$('#gbx .gbv');if(!v)return;B=document.createElement('div');B.id='gsBar';B.innerHTML=`<button data-g="place" class="gsPl"><i>✔</i>PLACE</button><button data-g="rot"><i>⟳</i>ROTATE</button><button data-g="cancel"><i>✕</i>CANCEL</button>`;v.appendChild(B);
  B.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();const a=b.dataset.g;if(a==='place')GS_place();else if(a==='rot'){try{AU.sfx('pick')}catch(_){}GB_.rot=(GB_.rot+1)%4;GS_reheld()}else{try{AU.sfx('pick')}catch(_){}GS_drop()}});
  const K=document.createElement('div');K.id='gsBr';K.innerHTML='<i></i><i></i><i></i><i></i>';v.appendChild(K);const T=document.createElement('div');T.id='gsTip';v.appendChild(T)}
 B.hidden=!GS.held;const pl=B.querySelector('.gsPl');if(pl)pl.disabled=!!(GS.held&&GS.held.bad)}
function GS_reheld(){if(!GS.hit)return;const b=GB_cand(GS.hit);GS.held=b;GB_ghostSet(b);GS_ui()}
function GS_drop(){GS.held=null;GS.hit=null;GB_ghostSet(null);GS_ui()}
function GS_place(){const b=GS.held;if(!b||b.bad){try{AU.sfx('bump')}catch(_){}return 0}const n=GB_add(b.t,b.x,b.z,b.r,b.c);GS.held=null;GS.hit=null;if(n){try{AU.sfx('brick')}catch(_){}GB_refresh();GS_pop(b)}else{try{AU.sfx('bump')}catch(_){}GB_ghostSet(null)}GS_ui();return n}
addEventListener('pointerdown',e=>{GS.pt=e.pointerType||'mouse'},true);
GB_act=(f=>function(cx,cy,del){if(del||GB_.tool!=='add'||GS.pt==='mouse'){if(GS.held)GS_drop();const n0=GB_list().length,n=f(cx,cy,del);if(GB_.tool==='add'&&!del&&GB_list().length>n0){const L=GB_list();GS_pop(L[L.length-1])}return n}
 const h=GB_pick(cx,cy),b=GB_cand(h);if(!b){try{AU.sfx('bump')}catch(_){}GS_tip('No room here · try a stud next to the car');return 0}
 const o=GS.held;if(o&&o.t===b.t&&o.x===b.x&&o.z===b.z&&o.y===b.y&&o.r===b.r)return GS_place();
 GS.hit=h;GS.held=b;GB_ghostSet(b);try{AU.sfx('pick')}catch(_){}GS_ui();GS_tip(b.bad?'Build limit full':'✔ PLACE or tap again · ⟳ to turn it');return 0})(GB_act);
GB_hover=(f=>function(){if(GS.held&&GB_.bk&&GB_.tool==='add')return GS_reheld();if(GS.held&&GB_.tool!=='add')GS_drop();return f()})(GB_hover);
GB_refresh=(f=>function(){f();if(GS.held&&GB_.bk){const b=GS.held;GB_ghostSet(b)}GS_fitY();GS_shadows()})(GB_refresh);
GB_exit=(f=>function(){GS.held=null;GS.hit=null;GS_ui();GS_br(null);return f.apply(this,arguments)})(GB_exit);
function GS_tip(t){const e=$('#gsTip');if(!e)return;e.textContent=t;e.classList.add('on');clearTimeout(GS_tip.t);GS_tip.t=setTimeout(()=>e.classList.remove('on'),2200)}
// screen-space corner brackets around the ghost (green = fits, red = no room / limit)
const GS_bb=new THREE.Box3(),GS_v=new THREE.Vector3();
function GS_br(g){const K=$('#gsBr');if(!K)return;if(!g||!GB_.bk){K.style.display='none';return}g.geometry.computeBoundingBox();GS_bb.copy(g.geometry.boundingBox).applyMatrix4(g.matrixWorld);const c=$('#gbC').getBoundingClientRect(),v=$('#gbx .gbv').getBoundingClientRect();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 for(let i=0;i<8;i++){GS_v.set(i&1?GS_bb.max.x:GS_bb.min.x,i&2?GS_bb.max.y:GS_bb.min.y,i&4?GS_bb.max.z:GS_bb.min.z).project(GB.cam);const x=(GS_v.x+1)/2*c.width,y=(1-GS_v.y)/2*c.height;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
 const p=10;K.style.display='block';K.style.left=(c.left-v.left+x0-p)+'px';K.style.top=(c.top-v.top+y0-p)+'px';K.style.width=Math.max(24,x1-x0+2*p)+'px';K.style.height=Math.max(24,y1-y0+2*p)+'px';K.classList.toggle('bad',!!(GB_.hov&&GB_.hov.bad));
 // v89k: keep the brackets inside the 3D view: they drew over SELECT/PAINT (bottom toolbar) and the layer buttons (right)
 {const kb=K.getBoundingClientRect(),tb=document.querySelector('#gbx .r2BkT'),rb=document.querySelector('#b25'),vis=e=>e&&e.getBoundingClientRect().width>0,cb=vis(tb)?Math.max(0,kb.bottom-(tb.getBoundingClientRect().top-4)):0,cr=vis(rb)?Math.max(0,kb.right-(rb.getBoundingClientRect().left-4)):0;K.style.clipPath=cb>0||cr>0?`inset(0 ${cr}px ${cb}px 0)`:'none'}}
// ---------- pop: white flash shell + stud confetti + a small car bounce
function GS_pop(b){if(!b||!GB.mesh)return;const U=GB.mesh.userData,host=U.carG||U.m,list=[b];if(GB_.mir){const w=GB_twin(b);if(w.x!==b.x)list.push(w)}
 for(const q of list){const M=[],L=[];try{GB_brickGeo(q,M,L)}catch(e){continue}if(!M.length)continue;const g=mergeGeometries(M.concat(L));g.computeBoundingBox();const c=g.boundingBox.getCenter(new THREE.Vector3());g.translate(-c.x,-c.y,-c.z);
  const fm=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending}));fm.position.copy(c);fm.userData.gbG=1;host.add(fm);
  const N=10,cf=new THREE.InstancedMesh(new THREE.CylinderGeometry(.09,.09,.08,8),new THREE.MeshStandardMaterial({color:GB_BC[q.c]||q.c,roughness:.3}),N);cf.userData.gbG=1;host.add(cf);
  const vs=[];for(let i=0;i<N;i++){const a=i/N*6.283+Math.random()*.4;vs.push([Math.cos(a)*(1.6+Math.random()),2.4+Math.random()*1.6,Math.sin(a)*(1.6+Math.random()),Math.random()*6])}
  GS.pops.push({t:0,fm,cf,vs,c,host})}
 GS.bounce=0}
function GS_step(dt){for(let i=GS.pops.length-1;i>=0;i--){const P=GS.pops[i];P.t+=dt;const k=P.t/.45;P.fm.scale.setScalar(1+.25*Math.max(0,1-P.t/.18)+.04);P.fm.material.opacity=Math.max(0,.9*(1-k));
  const q=new THREE.Object3D();P.vs.forEach((v,j)=>{q.position.set(P.c.x+v[0]*P.t,P.c.y+v[1]*P.t-4.9*P.t*P.t,P.c.z+v[2]*P.t);q.rotation.set(v[3]+P.t*8,v[3],0);q.scale.setScalar(Math.max(0,1-P.t/.7));q.updateMatrix();P.cf.setMatrixAt(j,q.matrix)});P.cf.instanceMatrix.needsUpdate=true;
  if(P.t>.7){P.host.remove(P.fm);P.host.remove(P.cf);P.fm.geometry.dispose();P.fm.material.dispose();P.cf.geometry.dispose();P.cf.material.dispose();GS.pops.splice(i,1)}}
 if(GS.bounce!=null&&GB.mesh){if(GS.bm!==GB.mesh){GS.bm=GB.mesh;GS.bs=GB.mesh.scale.y}GS.bounce+=dt;const t=GS.bounce;GB.mesh.scale.y=GS.bs*(t<.3?1-.035*Math.sin(Math.PI*t/.3):1);if(t>=.3)GS.bounce=null}
 if(GS.crew)for(const o of GS.crew){o.userData.ph+=dt;o.rotation.y+=Math.sin(o.userData.ph*.7)*.004}}
// ---------- framing: on a phone the toolbar + palette leave ~54 % of the height; pull the camera back so the whole car fits between them
GB_cam=(f=>function(){f();if(!GB_.bk||innerHeight>500)return;const C=GB.cam,k=1.2;C.position.set(C.position.x*k,.5+(C.position.y-.5)*k,C.position.z*k);C.lookAt(0,.5,0);C.updateMatrixWorld()})(GB_cam);
let GS_t0=0;gbLoop=(f=>function(){const now=performance.now(),dt=Math.min(.05,GS_t0?(now-GS_t0)/1000:.016);GS_t0=now;if(GB.sc&&!GS.on)GS_build();if(GB.mesh&&GB.d&&GS.sm!==GB.mesh.uuid+GB_list().length){GS.sm=GB.mesh.uuid+GB_list().length;GS_shadows();GS_fitY()}GS_step(dt);if(GB_.bk&&!$('#gbx').hidden){GS_br(GB_.ghost)}return f()})(gbLoop);
gbRender=(f=>function(){const r=f.apply(this,arguments);GS_fitY();GS_shadows();return r})(gbRender);
// ---------- 3D part thumbnails: one small offscreen renderer, each part drawn once per colour, only for the open category
function GS_thumb(t,c){const key=t+'|'+c;if(GS.thC.has(key))return GS.thC.get(key);let T=GS.th;
 if(!T){const cv=null,r=P1_off(112,112);r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.setPixelRatio(1);r.setSize(112,112,false);
  const s=new THREE.Scene();s.add(new THREE.HemisphereLight(0xffffff,0x606878,2.2));const d=new THREE.DirectionalLight(0xffffff,2.2);d.position.set(3,6,4);s.add(d);T=GS.th={r,s,cam:new THREE.PerspectiveCamera(30,1,.01,100),cv}}
 let url=null;try{const M=[],L=[];GB_brickGeo({t,x:0,z:0,y:0,r:0,m:0,c},M,L);if(M.length||L.length){const o=new THREE.Group();if(M.length)o.add(new THREE.Mesh(mergeGeometries(M),GB_MAT));if(L.length)o.add(new THREE.Mesh(mergeGeometries(L),GB_LMAT));
  const bb=new THREE.Box3().setFromObject(o),ce=bb.getCenter(new THREE.Vector3()),rad=Math.max(.2,bb.getSize(new THREE.Vector3()).length()/2);o.position.sub(ce);T.s.add(o);
  const d=rad/Math.sin(15*Math.PI/180)*1.02;T.cam.position.set(d*.55,d*.55,d*.63);T.cam.lookAt(0,0,0);T.r.setClearColor(0,0);T.r.render(T.s,T.cam);url=T.r.url();T.s.remove(o);o.traverse(m=>{if(m.isMesh)m.geometry.dispose()})}}catch(e){url=null}
 GS.thC.set(key,url);return url}
function GS_thumbs(){if(!GB_.bk)return;const c=GB_.col;document.querySelectorAll('#gbBkPc .gbPc').forEach(b=>{if(b.style.display==='none')return;if(b.dataset.tc===String(c))return;const u=GS_thumb(b.dataset.p,c);if(!u)return;b.dataset.tc=c;let im=b.querySelector('img');if(!im){im=document.createElement('img');im.alt='';b.insertBefore(im,b.firstChild)}im.src=u;b.classList.add('gsTh')})}
CR_cat=(f=>function(ct){const r=f(ct);try{GS_thumbs()}catch(e){}return r})(CR_cat);
GB_ui=(f=>function(){const r=f.apply(this,arguments);if(GB_.bk&&GS.lastCol!==GB_.col){GS.lastCol=GB_.col;try{GS_thumbs()}catch(e){}}GS_ui();return r})(GB_ui);
GB_enter=(f=>function(){const r=f.apply(this,arguments);GS.lastCol=null;try{GS_thumbs()}catch(e){}GS_ui();return r})(GB_enter);
{const st=document.createElement('style');st.textContent=`#gbx{background:#313a4c}
#gsBar{position:absolute;left:8px;top:calc(56px + env(safe-area-inset-top,0px));display:grid;gap:6px;z-index:4}#gsBar[hidden]{display:none}
#gsBar button{width:104px;height:46px;border-radius:12px;border:2px solid rgba(255,255,255,.75);background:#1b2433;color:#fff;font:900 13px system-ui;letter-spacing:.04em;display:flex;align-items:center;gap:8px;padding:0 10px;cursor:pointer;box-shadow:0 3px 0 rgba(0,0,0,.35)}
#gsBar button i{font-style:normal;font-size:18px;width:20px;text-align:center}#gsBar .gsPl{background:linear-gradient(#38d16a,#1f9c48);border-color:#bfffd0}#gsBar .gsPl:disabled{opacity:.45}
#gsBr{position:absolute;display:none;pointer-events:none;z-index:3}#gsBr i{position:absolute;width:16px;height:16px;border:4px solid #4dff7c;filter:drop-shadow(0 0 3px rgba(0,0,0,.6))}
#gsBr i:nth-child(1){left:0;top:0;border-right:0;border-bottom:0;border-top-left-radius:8px}#gsBr i:nth-child(2){right:0;top:0;border-left:0;border-bottom:0;border-top-right-radius:8px}
#gsBr i:nth-child(3){left:0;bottom:0;border-right:0;border-top:0;border-bottom-left-radius:8px}#gsBr i:nth-child(4){right:0;bottom:0;border-left:0;border-top:0;border-bottom-right-radius:8px}#gsBr.bad i{border-color:#ff3b3b}
#gsTip{position:absolute;left:50%;top:calc(52px + env(safe-area-inset-top,0px));transform:translateX(-50%);padding:6px 12px;border-radius:10px;background:#f2c20c;color:#141413;font:900 12px system-ui;border:2px solid #141413;opacity:0;transition:opacity .2s;pointer-events:none;white-space:nowrap;z-index:4}#gsTip.on{opacity:1}
#gbx .gbPc.gsTh{background:linear-gradient(#2a3446,#151c28);gap:0;padding:1px 2px}#gbx .gbPc.gsTh img{width:40px;height:30px;object-fit:contain;display:block}#gbx .gbPc.gsTh i{display:none}
@media (max-width:760px),(max-height:500px){#gbx .gbPc.gsTh{height:50px}#gbx .gbPc.gsTh img{width:38px;height:28px}}`;document.head.appendChild(st)}
window.__gs={S:GS,GB:()=>GB,held:()=>GS.held&&{t:GS.held.t,x:GS.held.x,z:GS.held.z,bad:!!GS.held.bad},on:()=>GS.on,gy:()=>GS.gy,thumbs:()=>document.querySelectorAll('#gbBkPc .gbPc.gsTh').length,pops:()=>GS.pops.length};
// 2K frames the build at a 3/4 view (about 35° down), so the hall shows behind the car; NEW BUILD used to look almost straight down
GNB_new=(f=>function(){const r=f.apply(this,arguments);GB_.pit=.42;GB_.dist=12;return r})(GNB_new);
