// ---- LDW (build-5 world props, 2026-10-10). Alex: "one model every ~5 minutes". Real LEGO sets (LDraw OMR, CCAL 2.0) as WORLD props:
// city buildings, shops, Athens houses, street props, boats. Each model is its own data module src/98ld_w_<set>.js (LD_MESH/LD_MODELS + one
// LDW_P.push placement). Here: one merged world-space mesh per material (CR_LO 2, like the 1490 bank) + a far LOD (big parts only),
// box collider = footprint of the tall parts, nearest free lot off the road to the city start + a polar offset, front (−z) to the street.
const LDW_P=[],LDW={on:[],lod:60};
// meshes of the w data modules (they load after 98ld_import.js registered LD_MESH): register them as hidden garage parts
function LDW_reg(){for(const k in LD_MESH)if(!GB_PC[k]){const D=LD_MESH[k];GB_PC[k]={n:D.n.replace(/^~/,''),w:D.w,d:D.d,h:D.h,cat:'LDraw',ic:'◆',hide:1,s:D.s.some(q=>!q[3])};G13_ID[k]=D.id}}
function LDW_geo(B){const lo=CR_LO;let G;CR_LO=2;try{G=GB_geo(B,null)}finally{CR_LO=lo}G.m=LD_cull(G.m,B);G.l=LD_cull(G.l,B);/* build-6: hidden studs/faces + slivers, like the bank */return[[G.m,GB_MAT],[G.l,GB_LMAT],[G.g,CR_GM]].filter(q=>q[0]).concat((G.w||[]).map(w=>{const g=CR_wheel(w.t).clone();g.translate(w.o.x,w.o.y,w.o.z);return[g,GB_MAT]}))}// wheels (carts, trailers) as their own meshes
function LDW_build1(P){if(P.city!==CID||!LD_MODELS[P.model])return;const SW=LD_SW*(P.s||(P.water?1:LD_FIG));/* v89w: buildings at minifig scale (LD_FIG, 98ld_import.js) *//* P.s: scale up micro-scale sets */const B=LD_br(P.model),near=LDW_geo(B),
  far=LDW_geo(B.filter(b=>{const Q=GB_PC[b.t];return Q&&Q.w*Q.d*Q.h>=(P.lodv||9)}));
 const box=new THREE.Box3();for(const[g]of near){g.computeBoundingBox();box.union(g.boundingBox)}const c=box.getCenter(new THREE.Vector3());
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const b of B){const Q=GB_PC[b.t];if(!Q||Q.h<(P.colh||3))continue;const w=b.r%2?Q.d:Q.w,d=b.r%2?Q.w:Q.d;x0=Math.min(x0,b.x);x1=Math.max(x1,b.x+w);z0=Math.min(z0,b.z);z1=Math.max(z1,b.z+d)}
 if(x0>x1){x0=box.min.x/GB_U;x1=box.max.x/GB_U;z0=box.min.z/GB_U;z1=box.max.z/GB_U}
 const k=GB_U*SW,hw=Math.max(.3,(x1-x0)*k/2-.2),hd=Math.max(.3,(z1-z0)*k/2-.2),ox=((x0+x1)/2)*GB_U*SW-c.x*SW,oz=((z0+z1)/2)*GB_U*SW-c.z*SW;
 const st=(typeof RO!=='undefined'&&RO&&RO.x!=null&&isFinite(RO.x)&&(RO.x||RO.z))?{x:RO.x,z:RO.z}:(CID==='fra'?{x:2061,z:0}:{x:0,z:0}),a0=(P.a||0)*Math.PI/180;
 if(P.water)return LDW_boat(P,near,far,box,c,hw,hd,st,a0);
 /* v90a: the road setback uses the WHOLE scaled model (baseplate, low parts) as x/z half-sizes, not the tall-part collider: 6362's base slab sat on the kerb */const fw=(box.max.x-box.min.x)*SW/2,fd=(box.max.z-box.min.z)*SW/2,S=LDW_spot(st.x+Math.cos(a0)*(P.r||0),st.z+Math.sin(a0)*(P.r||0),fw+.5,fd+.5,P.road||10);if(!S)return;const best=S.yaw;
 const a=best*Math.PI/2,y=groundY(S.x,S.z)-(P.sink||0)*SW*GB_PH;
 const X=new THREE.Matrix4().makeTranslation(S.x,y,S.z).multiply(new THREE.Matrix4().makeRotationY(a)).multiply(new THREE.Matrix4().makeScale(SW,SW,SW)).multiply(new THREE.Matrix4().makeTranslation(-c.x,-box.min.y,-c.z));
 const E={id:P.model,x:S.x,z:S.z,near:[],far:[],tris:0,ftris:0};
 for(const[L,set,key]of[[near,E.near,'tris'],[far,E.far,'ftris']])for(const[g,mat]of L){g.applyMatrix4(X);g.computeBoundingSphere();const o=new THREE.Mesh(g,mat);o.name='ldw_'+P.model;o.receiveShadow=true;o.userData.cd=P.cd||900;if(mat===CR_GM)o.renderOrder=2;HUB.grp.add(o);hubCullAdd(o);set.push(o);E[key]+=(g.index?g.index.count:g.attributes.position.count)/3}
 const cs=Math.cos(a),sn=Math.sin(a),odd=best%2,col={x:S.x+ox*cs+oz*sn,z:S.z-ox*sn+oz*cs,hw:odd?hd:hw,hd:odd?hw:hd,h:y+(box.max.y-box.min.y)*SW};
 HUB.bld.push(col);hubGridAdd([col]);E.at={x:+S.x.toFixed(1),z:+S.z.toFixed(1),yaw:best,y:+y.toFixed(2)};E.col=col;LDW.on.push(E)}
// boats (P.water): moored in the nearest river/harbour reach to the anchor that is wide enough, near the bank, bow along the flow, hull P.sink plates under the water
function LDW_boat(P,near,far,box,c,hw,hd,st,a0){const SW=LD_SW*(P.s||1);const ax=st.x+Math.cos(a0)*(P.r||0),az=st.z+Math.sin(a0)*(P.r||0),bz=box.getSize(new THREE.Vector3()),W=Math.min(bz.x,bz.z)*SW/2;hw=bz.x*SW/2;hd=bz.z*SW/2;// hull size (low parts count for boats)
 let bp=null,bd=1e18;
 for(const S of WATERS)for(let i=0;i<S.pts.length;i+=2){const p=S.pts[i];if(p.hw<W*2+6)continue;const d=(p.x-ax)**2+(p.z-az)**2;if(d<bd){bd=d;bp=p}}if(!bp)return;
 const off=bp.hw-W-2.5,x=bp.x+bp.tz*off,z=bp.z-bp.tx*off;if(!inRiver(x,z,W))return;const a=Math.atan2(-bp.tx,-bp.tz)+(hd>=hw?0:Math.PI/2),y=HWY-.1-(P.sink||3)*GB_PH*SW;
 const X=new THREE.Matrix4().makeTranslation(x,y,z).multiply(new THREE.Matrix4().makeRotationY(a)).multiply(new THREE.Matrix4().makeScale(SW,SW,SW)).multiply(new THREE.Matrix4().makeTranslation(-c.x,-box.min.y,-c.z));
 const E={id:P.model,x,z,near:[],far:[],tris:0,ftris:0,water:1};
 for(const[Lq,set,key]of[[near,E.near,'tris'],[far,E.far,'ftris']])for(const[g,mat]of Lq){g.applyMatrix4(X);g.computeBoundingSphere();const o=new THREE.Mesh(g,mat);o.name='ldw_'+P.model;o.userData.cd=P.cd||900;if(mat===CR_GM)o.renderOrder=2;HUB.grp.add(o);hubCullAdd(o);set.push(o);E[key]+=(g.index?g.index.count:g.attributes.position.count)/3}
 const col={x,z,hw:W,hd:W,h:HWY+(box.max.y-box.min.y)*SW};HUB.bld.push(col);hubGridAdd([col]);E.at={x:+x.toFixed(1),z:+z.toFixed(1),yaw:+a.toFixed(2),y:+y.toFixed(2)};E.col=col;LDW.on.push(E)}
// spot: like LD_propSpot (free lot, no road or building under the footprint) AND a road within `road` m in front, so the prop is seen from the street
// (Athens blocks have hidden back courtyards); yaw = the quarter turn whose front (−z) looks at that road
function LDW_spot(x0,z0,hw,hd,road){for(let r=12;r<400;r+=6)for(let a=0;a<36;a++){const t=a/36*Math.PI*2,x=x0+Math.cos(t)*r,z=z0+Math.sin(t)*r;
  for(const rot of[0,1]){const w=rot?hd:hw,d=rot?hw:hd;if(!rfFree(x,z,3)||roamHit(x,z,Math.max(w,d)+1.5))continue;let ok=1;
   for(const sx of[-1,-.5,0,.5,1])for(const sz of[-1,-.5,0,.5,1])if(ok&&(FL_road(x+sx*w,z+sz*d,2.5)||roamHit(x+sx*w,z+sz*d,.8)))ok=0;if(!ok)continue;
   for(const q of[0,1,2,3]){if(q%2!==rot)continue;const A=q*Math.PI/2,fx=-Math.sin(A),fz=-Math.cos(A);let hit=0;
    for(let k=1;k<=road;k++){const px=x+fx*(hd+k),pz=z+fz*(hd+k);if(roamHit(px,pz,.5))break;if(FL_road(px,pz,0)){hit=1;break}}if(hit)return{x,z,rot,yaw:q}}}}return null}
// v89z: the city's prop models load first (models/<id>.js, 98ld_run.js), then build; a city switch meanwhile drops the stale build
function LDW_build(){if(!HUB.grp||LDW.on.length||LDW.busy===HUB.grp)return;const g=HUB.grp,cid=CID;LDW.busy=g;
 LD_need(LDW_P.filter(P=>P.city===cid).map(P=>P.model)).then(()=>{if(LDW.busy===g)LDW.busy=0;if(HUB.grp!==g||CID!==cid||LDW.on.length)return;LDW_reg();for(const P of LDW_P)try{LDW_build1(P)}catch(e){console.warn('LDW prop',P.model,e)}})}
buildRoam=(f=>function(){const r=f.apply(this,arguments);LDW_build();return r})(buildRoam);
// LOD: after the hub cull, near mesh within LDW.lod m of the camera, big-parts mesh beyond
hubCullStep=(f=>function(){f.apply(this,arguments);if(!LDW.on.length)return;const cx=camera.position.x,cz=camera.position.z;
 for(const E of LDW.on){const d=Math.hypot(E.x-cx,E.z-cz),n=d<LDW.lod;for(const o of E.near)o.visible=n;for(const o of E.far)o.visible=!n&&d<(o.userData.cd||900)}})(hubCullStep);
window.__ld.w=LDW;window.__ld.wp=LDW_P;window.__ld.wbuild=LDW_build;window.__ld.wreg=LDW_reg;
// test hook (v90a): every LEGO prop's world box (all parts, baseplate included) vs the road: samples on the road (FL_road, 0 / 1.5 m margin)
window.__ld.wroad=()=>{const out=[],chk=(id,objs)=>{if(!objs||!objs.length)return;const B=new THREE.Box3();for(const o of objs){o.geometry.computeBoundingBox();B.union(o.geometry.boundingBox)}let n=0,on=0,near=0;
 for(let x=B.min.x;x<=B.max.x;x+=.5)for(let z=B.min.z;z<=B.max.z;z+=.5){n++;if(FL_road(x,z,0))on++;else if(FL_road(x,z,1.5))near++}out.push({id,x0:+B.min.x.toFixed(1),x1:+B.max.x.toFixed(1),z0:+B.min.z.toFixed(1),z1:+B.max.z.toFixed(1),n,on,near})};
 for(const E of LDW.on)if(!E.water)chk(E.id,E.near);if(typeof LDP!=='undefined')chk('bank',LDP.g);if(typeof LD_PROPS!=='undefined')for(const q of LD_PROPS)chk(q.id,q.g);return out};
