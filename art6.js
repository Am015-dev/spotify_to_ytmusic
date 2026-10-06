// ==== ART pART6 · no dark blobs under cars; only a faint footprint-tight contact patch (1.1× footprint, 35 %) for player, race cars, race and city traffic.
// Visual only: grounding (ART4_base, CR ground contact) is untouched.
const ART6={};
const ART6_off=o=>{if(!o||o.userData.art6)return;o.userData.art6=1;Object.defineProperty(o,'visible',{configurable:true,get(){return false},set(v){}})};
const ART6_op=m=>{if(m&&!m.userData.art6o){m.userData.art6o=1;Object.defineProperty(m,'opacity',{configurable:true,get(){return .35},set(v){}})}};
const ART6_raceOnly=o=>{if(!o||o.userData.art6r)return;o.userData.art6r=1;let v=o.visible;Object.defineProperty(o,'visible',{configurable:true,get(){return v&&state!=='roam'},set(x){v=x}});ART6_op(o.material)};
const ART6_noCast=root=>{if(root)root.traverse(o=>{if(o.isMesh&&!o.userData.art6c){o.userData.art6c=1;Object.defineProperty(o,'castShadow',{configurable:true,get(){return false},set(v){}})}})};
shipMesh=(f=>function(){const g=f.apply(this,arguments);try{ART6_raceOnly(g.userData.shadow);ART6_noCast(g)}catch(e){}return g})(shipMesh);
ART4_tyres=(f=>function(){const im=f.apply(this,arguments);ART6_off(im);return im})(ART4_tyres);
let ART6_t=0;function ART6_sweep(){const t=performance.now();if(t-ART6_t<500)return;ART6_t=t;
  try{if(trShadow)ART6_op(trShadow.material);if(trGlow)ART6_off(trGlow)}catch(e){}try{if(CR_SH)ART6_op(CR_SH.material)}catch(e){}if(ART4.ty)ART6_off(ART4.ty);
  for(const s of[pl,...ships])if(s&&s.mesh){const ud=s.mesh.userData;if(ud&&ud.shadow)ART6_raceOnly(ud.shadow);ART6_noCast(s.mesh)}
  for(const o of TRM||[])for(const k in o)if(o[k]&&o[k].isMesh)ART6_noCast(o[k]);for(const k in HUB.cim||{})ART6_noCast(HUB.cim[k])}
// city traffic: one instanced footprint patch per car within 140 m, from the car's own instance matrix and model bounds
const ART6_M=new THREE.Matrix4(),ART6_L=new THREE.Matrix4(),ART6_bb={};
function ART6_traffic(){const C=HUB.cars,I=HUB.cim;if(!C||!I)return;if(!ART6.tp){const tex=(typeof CR_shTex==='function')?CR_shTex():ART_blobTex();
    ART6.tp=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:tex,color:0,transparent:true,opacity:.35,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),160);
    ART6.tp.renderOrder=1;ART6.tp.frustumCulled=false;ART6.tp.userData.keep=1;scene.add(ART6.tp)}
  const T=ART6.tp;let n=0;if(RO.on&&state==='roam')for(const c of C){if(n>=160)break;if(c.dead>0||c.x==null)continue;const dx=c.x-RO.x,dz=c.z-RO.z;if(dx*dx+dz*dz>140*140)continue;const im=I[c.k];if(!im)continue;
    let b=ART6_bb[c.k];if(!b){im.geometry.computeBoundingBox();const g=im.geometry.boundingBox;b=ART6_bb[c.k]=[(g.min.x+g.max.x)/2,g.min.y+.03,(g.min.z+g.max.z)/2,(g.max.x-g.min.x)*1.1,(g.max.z-g.min.z)*1.05]}
    im.getMatrixAt(c.j,ART6_M);ART6_L.makeScale(b[3],1,b[4]).setPosition(b[0],b[1],b[2]);ART6_M.multiply(ART6_L);T.setMatrixAt(n++,ART6_M)}
  T.count=n;T.instanceMatrix.needsUpdate=true}
posShip=(f=>function(s,dt,snap){f(s,dt,snap);if(s===pl)ART6_sweep()})(posShip);
roamStep=(f=>function(dt){f(dt);ART6_sweep();try{ART6_traffic()}catch(e){}})(roamStep);
