# CAR4: LEGO traffic everywhere. City traffic (every Frankfurt kind + Athens cars) and race traffic become LEGO cars: opaque glossy bodies,
# tyres + rims as their own instances (on the road, gap 0), body pitches on accel/brake and rolls in turns. Needs pCAR1.
exec(open('P.py').read())
if 'CR_cityGeo' in s:
    print('OK');raise SystemExit
assert 'CR_SPEED' in s, 'apply pCAR1 first'
JS=r'''
// wheels stay on the road: each wheel keeps its tyre bottom at a fixed height below the car's root, so pitch/roll moves only the body
const _crWP=new THREE.Vector3();
function CR_clamp(w){let R=w.userData.root;if(!R){R=w;while(R.parent&&!R.parent.isScene)R=R.parent;w.userData.root=R}if(R===w||typeof state==='undefined'||state!=='roam')return;
 const e=w.matrixWorld.elements,s=Math.hypot(e[4],e[5],e[6])||1;w.getWorldPosition(_crWP);let g;try{g=groundY(_crWP.x,_crWP.z)}catch(x){return}if(!(g>-1e4)||Math.abs(g-R.position.y)>4)return;
 const bot=_crWP.y-w.userData.r*s,d=Math.max(-.35,Math.min(.35,g+.03-bot));if(Math.abs(d)>.004)w.position.y+=d/s;else if(Math.abs(w.position.y-w.userData.by)>.6/s)w.position.y=w.userData.by}
CR_spin=(f=>function(o){f(o);o.userData.by=o.position.y;const ob=o.onBeforeRender;o.onBeforeRender=function(...a){CR_clamp(this);return ob.apply(this,a)}})(CR_spin);
// ---------- city traffic in LEGO (instanced, body parts in white so each instance's paint tints them)
function CR_van(o){const A=[],B=o.body,K=CR_K,add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(.12-GB_PC.wM.h*GB_PH/2)/GB_PH;
 add('T8x20',-4,-10,0,K,0);for(const z of[-9,5])sym('arch',-4,z,0,B,0),sym('wM',-4,z,0,K,wy);sym('B1x10',-4,-5,0,B,1);sym('B1x10',-4,-5,0,B,4);sym('B1x1',-4,-10,0,B,1);sym('hl',-4,-10,0,B,3);add('B6x1',-3,-10,0,K,1);add('C8x1',-4,-10,0,B,6);
 add('ws6',-3,-9,0,B,6);sym('B1x14',-4,-9,0,B,6);sym('B1x14',-4,-9,0,B,9);add('B6x11',-3,-6,0,B,6);add('B6x11',-3,-6,0,B,9);add('T8x16',-4,-6,0,B,12);sym('tl',-4,9,2,B,3);add('B6x1',-3,9,0,B,1);sym('B1x1',-4,9,0,B,1);
 add('T6x1',-3,9,0,K,4);return A}
function CR_truck(o){const A=[],B=o.body,K=CR_K,W='#f4f4f4',add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(.12-GB_PC.wL.h*GB_PH/2)/GB_PH;
 add('T8x32',-4,-16,0,K,0);for(const z of[-15,5,10])sym('arch',-4,z,0,K,0),sym('wL',-4,z,0,K,wy);add('bump',-4,-17,0,'#d8dde4',1);
 add('B8x6',-4,-16,0,B,1);add('B8x6',-4,-16,0,B,4);add('ws6',-3,-16,0,B,7);sym('B1x3',-4,-16,0,B,7);add('B8x3',-4,-13,0,B,7);add('T8x6',-4,-16,0,B,12);sym('hl',-4,-17,0,B,2);sym('stack',-4,-11,0,'#d8dde4',7);
 add('B8x21',-4,-10,0,W,3);add('B8x21',-4,-10,0,W,6);add('B8x21',-4,-10,0,W,9);add('B8x21',-4,-10,0,W,12);add('T8x21',-4,-10,0,W,15);sym('tl',-4,11,2,K,1);return A}
function CR_trParts(k){if(k>3)return null;const T=TRT[k],Wt='#ffffff';let A=k===0?CR_car({body:Wt,acc:Wt,wing:CR_K,noWing:1}):k===1?CR_car({body:Wt,acc:CR_K,noWing:1,x:[['sign',-1,-1,0,'#ffd12c',13]]}):k===2?CR_van({body:Wt}):CR_truck({body:Wt});
 const br=A.map(([t,x,z,r,c,y])=>({t:t==='drv'?'drvR':t,x,z,y,r:r%4,m:0,c})).filter(b=>!['drvR','stw','mir','lp'].includes(b.t));CR_LO=1;CR_G=[];CR_W=[];const M=[],L=[];for(const b of br)GB_brickGeo(b,M,L);const G=CR_G;CR_G=null;
 for(const w of CR_W){const g=CR_wheel(w.t).clone();g.translate(w.o.x,w.o.y,w.o.z);M.push(g)}CR_W=null;
 const box=new THREE.Box3().setFromBufferAttribute(mergeGeometries(M).attributes.position),wid=box.max.x-box.min.x,s=T.wid/wid,fix=g=>{g.translate(0,-box.min.y,0);g.scale(s,s,s);return g};
 CR_LO=0;const tiny=y=>GB_col(new THREE.BoxGeometry(.01,.01,.01).translate(0,y,0),'#ffffff');return{body:fix(mergeGeometries(M)),glass:G.length?fix(mergeGeometries(G)):tiny(-.5),lamp:L.length?fix(mergeGeometries(L)):tiny(-.5),neon:tiny(-.5)}}

// ---------- LEGO city traffic (all kinds): opaque glossy bodies, separate tyre/rim instances, suspension pitch + roll
const CR_CM=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.2,metalness:0,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.7});
const CR_CG={};
function CR_cityGeo(nm){if(!nm||nm[0]==='#')return null;if(CR_CG[nm]!==undefined)return CR_CG[nm];const W='#ffffff',K=CR_K,ath=CID!=='fra';let A,wid=2.0;
 try{switch(nm){case'sedan':A=CR_car({body:W,acc:W,noWing:1});break;case'sedan-sports':A=CR_car({body:W,acc:K,wing:K});break;
  case'taxi':A=CR_car({body:ath?'#f5d000':W,acc:ath?'#f5d000':K,noWing:1,x:[['sign',-1,-1,0,ath?'#f4f4f4':'#ffd12c',13]]});break;
  case'police':A=CR_car({body:'#f4f4f4',acc:'#0055bf',noWing:1,x:[['bar',-2,-1,0,K,13]]});break;
  case'suv':A=CR_car({body:W,acc:K,noWing:1,x:[['T6x4',-3,-2,0,K,13]]});wid=2.15;break;
  case'van':A=CR_van({body:W});wid=2.2;break;case'delivery':A=CR_truck({body:W});wid=2.4;break;case'truck':A=CR_truck({body:W});wid=2.55;break;
  case'garbage-truck':A=CR_truck({body:'#2c8a5a'});wid=2.6;break;default:return CR_CG[nm]=null}
  if(['sedan','sedan-sports','taxi','police','suv'].includes(nm))A.push(['T1x6',-4,-3,0,K,-1],['T1x6',3,-3,0,K,-1],['T8x1',-4,-8,0,K,-1],['T8x1',-4,7,0,K,-1]);
  const br=A.map(([t,x,z,r,c,y])=>({t,x,z,y,r:r%4,m:0,c})).filter(b=>!['drv','drvR','stw','mir','lp','pipes','flag'].includes(b.t));CR_LO=2;CR_G=[];CR_W=[];const M=[],L=[];for(const b of br)GB_brickGeo(b,M,L);
  const Wg=CR_W.map(w=>{const g=CR_wheel(w.t).clone();g.translate(w.o.x,w.o.y,w.o.z);return g});const body=mergeGeometries(M.concat(L)),wheels=mergeGeometries(Wg),glass=CR_G.length?mergeGeometries(CR_G):null;
  const box=new THREE.Box3().setFromBufferAttribute(body.attributes.position),bw=new THREE.Box3().setFromBufferAttribute(wheels.attributes.position),s=wid/(box.max.x-box.min.x),y0=Math.min(box.min.y,bw.min.y);
  for(const g of[body,wheels,glass].filter(Boolean)){g.translate(0,-y0,0);g.scale(s,s,s);g.rotateY(Math.PI);g.translate(0,.04,0)}return CR_CG[nm]={body,wheels,glass}}
 catch(e){console.warn('CR city',nm,e);return CR_CG[nm]=null}finally{CR_LO=0;CR_G=null;CR_W=null}}
function CR_cityPost(im,nm,k,n){const G=CR_cityGeo(nm);if(!G)return;const w=new THREE.InstancedMesh(G.wheels,CR_CM,n);w.frustumCulled=false;w.instanceMatrix.setUsage(THREE.DynamicDrawUsage);_m.makeScale(0,0,0);for(let j=0;j<n;j++)w.setMatrixAt(j,_m);im.userData.w=w;im.parent&&im.parent.add(w);if(G.glass){const gl=new THREE.InstancedMesh(G.glass,CR_GM,n);gl.frustumCulled=false;gl.instanceMatrix.setUsage(THREE.DynamicDrawUsage);for(let j=0;j<n;j++)gl.setMatrixAt(j,_m);gl.renderOrder=2;im.userData.g=gl;im.parent&&im.parent.add(gl)}
 const cc=new THREE.Color();for(let j=0;j<n;j++){cc.set(HCOL[(j*3+k)%HCOL.length]).lerp(new THREE.Color('#ffffff'),.08);im.setColorAt(j,cc)}im.instanceColor&&(im.instanceColor.needsUpdate=true);
 if(nm==='police'||nm==='garbage-truck'||(nm==='taxi'&&CID!=='fra')){const c=new THREE.Color('#ffffff');for(let j=0;j<n;j++)im.setColorAt(j,c);im.instanceColor&&(im.instanceColor.needsUpdate=true)}}
const _crM=new THREE.Matrix4(),_crR=new THREE.Matrix4(),_crE=new THREE.Euler(),_crT1=new THREE.Matrix4().makeTranslation(0,.45,0),_crT2=new THREE.Matrix4().makeTranslation(0,-.45,0);
function CR_susp(c,dx,dz,dt,im,M){const w=im.userData.w;if(!w){im.setMatrixAt(c.j,M);return}w.setMatrixAt(c.j,M);const h=Math.atan2(dx,dz);if(c.hh==null)c.hh=h;let dh=h-c.hh;dh=Math.atan2(Math.sin(dh),Math.cos(dh));c.hh=h;const d=Math.max(dt,1e-3),v=c.cv||0,ac=(v-(c.pv??v))/d;c.pv=v;
 const tr=clamp(dh/d*v*.012,-.06,.06),tp=clamp(-ac*.015,-.045,.045),k=Math.min(1,dt*5);c.rl=(c.rl||0)+(tr-(c.rl||0))*k;c.pt=(c.pt||0)+(tp-(c.pt||0))*k;
 _crR.makeRotationFromEuler(_crE.set(c.pt,0,c.rl));_crM.copy(M).multiply(_crT1).multiply(_crR).multiply(_crT2);im.setMatrixAt(c.j,_crM);if(im.userData.g)im.userData.g.setMatrixAt(c.j,_crM)}
'''
# low-detail mode for instanced traffic (plain boxes, no studs, simple wheels)
R("let CR_G=null,CR_W=null;","let CR_G=null,CR_W=null,CR_LO=0;")
R("const CR_bb=(x0,x1,y0,y1,z0,z1,c,e=CR_E)=>{","const CR_bb=(x0,x1,y0,y1,z0,z1,c,e=CR_E)=>{if(CR_LO===1)return GB_box(x0,x1,y0,y1,z0,z1,c);")
R("function CR_side(P,x0,x1,c,e=CR_E){","function CR_side(P,x0,x1,c,e=CR_E){if(CR_LO===1)e=0;")
R("bevelSegments:1,curveSegments:8});g.rotateY","bevelSegments:1,curveSegments:CR_LO?4:8});g.rotateY")
R("function CR_top(P,y0,y1,c,e=CR_E){","function CR_top(P,y0,y1,c,e=CR_E){if(CR_LO===1)e=0;")
R("const CR_stud=(M,x,y,z,c)=>{","const CR_stud=(M,x,y,z,c)=>{if(CR_LO===1)return;if(CR_LO){M.push(GB_cyl(.18,.11,x,y,z,c,6));return}")
R("function CR_wheel(t){if(CR_wgeo[t])return CR_wgeo[t];","function CR_wheel(t){if(CR_LO){const k=t+'lo';if(CR_wgeo[k])return CR_wgeo[k];const W=CR_WH[t],a=new THREE.CylinderGeometry(W.r,W.r,W.w,12);a.rotateZ(Math.PI/2);const b=new THREE.CylinderGeometry(W.rim,W.rim,W.w*1.04,10);b.rotateZ(Math.PI/2);const h=new THREE.CylinderGeometry(W.rim*.35,W.rim*.35,W.w*1.08,8);h.rotateZ(Math.PI/2);return CR_wgeo[k]=mergeGeometries([GB_col(a,'#17191c'),GB_col(b,'#b9c0c8'),GB_col(h,'#2a2f36')])}if(CR_wgeo[t])return CR_wgeo[t];")
i=s.index('const GB_PRE=[')
s=s[:i]+JS+'\n'+s[i:]
# race traffic
R("function buildTrafficMeshes(){const mats={body:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.28,metalness:.75,envMapIntensity:1.6}),",
  "function buildTrafficMeshes(){const mats={body:new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.3,metalness:0,clearcoat:.8,clearcoatRoughness:.1,envMapIntensity:1.3}),")
R("function carParts(k){","function carParts(k){try{const q=CR_trParts(k);if(q)return q}catch(e){console.warn('CR traffic',e)}finally{CR_LO=0;CR_G=null;CR_W=null}")
# city traffic
R("const cu=nm[0]==='#',im=new THREE.InstancedMesh(cu?athVeh(nm):kmGeo(nm,2.3),cu?(","const cu=nm[0]==='#',cg=CR_cityGeo(nm),im=new THREE.InstancedMesh(cg?cg.body:cu?athVeh(nm):kmGeo(nm,2.3),cg?CR_CM:cu?(")
R("HUB.grp.add(im);return im});pedInit()}","HUB.grp.add(im);CR_cityPost(im,nm,k,per[k]);return im});pedInit()}")
R("if(c.dead>0){c.dead-=dt;_m.makeScale(0,0,0);im.setMatrixAt(c.j,_m);","if(c.dead>0){c.dead-=dt;_m.makeScale(0,0,0);im.setMatrixAt(c.j,_m);if(im.userData.w)im.userData.w.setMatrixAt(c.j,_m);if(im.userData.g)im.userData.g.setMatrixAt(c.j,_m);")
R("_m.makeBasis(_hrt.set(dz,0,-dx),_hup,_hfw.set(dx,0,dz)).setPosition(x,c.y,z);im.setMatrixAt(c.j,_m);","_m.makeBasis(_hrt.set(dz,0,-dx),_hup,_hfw.set(dx,0,dz)).setPosition(x,c.y,z);CR_susp(c,dx,dz,dt,im,_m);")
R("for(const im of HUB.cim)im.instanceMatrix.needsUpdate=true}","for(const im of HUB.cim){im.instanceMatrix.needsUpdate=true;if(im.userData.w)im.userData.w.instanceMatrix.needsUpdate=true;if(im.userData.g)im.userData.g.instanceMatrix.needsUpdate=true}}")
# Athens: no parked cars on verges or in grass car parks (traffic stays on the street graph)
R("const put=(t,x,z,ry,si)=>{","const put=(t,x,z,ry,si)=>{if(t==='CE_car'||t==='CE_car2'||t==='CE_taxi')return false;")
R("function CE_lots(add,rnd,D){","function CE_lots(add0,rnd,D){const add=(t,...a)=>{if(t==='CE_car'||t==='CE_car2'||t==='CE_taxi')return;return add0(t,...a)};")
save()
print('OK')
