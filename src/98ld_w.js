// ---- LDW (build-5 world props, 2026-10-10). Alex: "one model every ~5 minutes". Real LEGO sets (LDraw OMR, CCAL 2.0) as WORLD props:
// city buildings, shops, Athens houses, street props, boats. Each model is its own data module src/98ld_w_<set>.js (LD_MESH/LD_MODELS + one
// LDW_P.push placement). Here: one merged world-space mesh per material (CR_LO 2, like the 1490 bank) + a far LOD (big parts only),
// box collider = footprint of the tall parts, nearest free lot off the road to the city start + a polar offset, front (−z) to the street.
const LDW_P=[],LDW={on:[],lod:60};
// meshes of the w data modules (they load after 98ld_import.js registered LD_MESH): register them as hidden garage parts
function LDW_reg(){for(const k in LD_MESH)if(!GB_PC[k]){const D=LD_MESH[k];GB_PC[k]={n:D.n.replace(/^~/,''),w:D.w,d:D.d,h:D.h,cat:'LDraw',ic:'◆',hide:1,s:D.s.some(q=>!q[3])};G13_ID[k]=D.id}}
function LDW_geo(B){const lo=CR_LO;let G;CR_LO=2;try{G=GB_geo(B,null)}finally{CR_LO=lo}return[[G.m,GB_MAT],[G.l,GB_LMAT],[G.g,CR_GM]].filter(q=>q[0])}
function LDW_build1(P){if(P.city!==CID||!LD_MODELS[P.model])return;const B=LD_br(P.model),near=LDW_geo(B),
  far=LDW_geo(B.filter(b=>{const Q=GB_PC[b.t];return Q&&Q.w*Q.d*Q.h>=(P.lodv||9)}));
 const box=new THREE.Box3();for(const[g]of near){g.computeBoundingBox();box.union(g.boundingBox)}const c=box.getCenter(new THREE.Vector3());
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const b of B){const Q=GB_PC[b.t];if(!Q||Q.h<(P.colh||3))continue;const w=b.r%2?Q.d:Q.w,d=b.r%2?Q.w:Q.d;x0=Math.min(x0,b.x);x1=Math.max(x1,b.x+w);z0=Math.min(z0,b.z);z1=Math.max(z1,b.z+d)}
 if(x0>x1){x0=box.min.x/GB_U;x1=box.max.x/GB_U;z0=box.min.z/GB_U;z1=box.max.z/GB_U}
 const k=GB_U*LD_SW,hw=Math.max(.3,(x1-x0)*k/2-.2),hd=Math.max(.3,(z1-z0)*k/2-.2),ox=((x0+x1)/2)*GB_U*LD_SW-c.x*LD_SW,oz=((z0+z1)/2)*GB_U*LD_SW-c.z*LD_SW;
 const st=(typeof RO!=='undefined'&&RO&&RO.x!=null&&isFinite(RO.x)&&(RO.x||RO.z))?{x:RO.x,z:RO.z}:(CID==='fra'?{x:2061,z:0}:{x:0,z:0}),a0=(P.a||0)*Math.PI/180;
 const S=LD_propSpot(st.x+Math.cos(a0)*(P.r||0),st.z+Math.sin(a0)*(P.r||0),Math.max(hw,hd)+.5,Math.min(hw,hd)+.5);if(!S)return;
 const yaws=[0,1,2,3].filter(q=>q%2===S.rot);let best=yaws[0],bd=1e9;for(const q of yaws){const a=q*Math.PI/2,fx=-Math.sin(a),fz=-Math.cos(a);for(let r=2;r<40;r+=2)if(FL_road(S.x+fx*(hd+r),S.z+fz*(hd+r),0)){if(r<bd){bd=r;best=q}break}}
 const a=best*Math.PI/2,y=groundY(S.x,S.z)-(P.sink||0)*LD_SW*GB_PH;
 const X=new THREE.Matrix4().makeTranslation(S.x,y,S.z).multiply(new THREE.Matrix4().makeRotationY(a)).multiply(new THREE.Matrix4().makeScale(LD_SW,LD_SW,LD_SW)).multiply(new THREE.Matrix4().makeTranslation(-c.x,-box.min.y,-c.z));
 const E={id:P.model,x:S.x,z:S.z,near:[],far:[],tris:0,ftris:0};
 for(const[L,set,key]of[[near,E.near,'tris'],[far,E.far,'ftris']])for(const[g,mat]of L){g.applyMatrix4(X);g.computeBoundingSphere();const o=new THREE.Mesh(g,mat);o.name='ldw_'+P.model;o.receiveShadow=true;o.userData.cd=P.cd||900;if(mat===CR_GM)o.renderOrder=2;HUB.grp.add(o);hubCullAdd(o);set.push(o);E[key]+=(g.index?g.index.count:g.attributes.position.count)/3}
 const cs=Math.cos(a),sn=Math.sin(a),odd=best%2,col={x:S.x+ox*cs+oz*sn,z:S.z-ox*sn+oz*cs,hw:odd?hd:hw,hd:odd?hw:hd,h:y+(box.max.y-box.min.y)*LD_SW};
 HUB.bld.push(col);hubGridAdd([col]);E.at={x:+S.x.toFixed(1),z:+S.z.toFixed(1),yaw:best,y:+y.toFixed(2)};E.col=col;LDW.on.push(E)}
function LDW_build(){if(!HUB.grp||LDW.on.length)return;LDW_reg();for(const P of LDW_P)try{LDW_build1(P)}catch(e){console.warn('LDW prop',P.model,e)}}
buildRoam=(f=>function(){const r=f.apply(this,arguments);LDW_build();return r})(buildRoam);
// LOD: after the hub cull, near mesh within LDW.lod m of the camera, big-parts mesh beyond
hubCullStep=(f=>function(){f.apply(this,arguments);if(!LDW.on.length)return;const cx=camera.position.x,cz=camera.position.z;
 for(const E of LDW.on){const d=Math.hypot(E.x-cx,E.z-cz),n=d<LDW.lod;for(const o of E.near)o.visible=n;for(const o of E.far)o.visible=!n&&d<(o.userData.cd||900)}})(hubCullStep);
window.__ld.w=LDW;window.__ld.wp=LDW_P;window.__ld.wbuild=LDW_build;window.__ld.wreg=LDW_reg;
