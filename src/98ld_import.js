// ---- LD (models-1, 2026-10-10). Alex: "use the taxi as an example to build more complicated items; look on the web for LEGO builds".
// Real LEGO builds come in as LDraw files (LDraw OMR, CCAL 2.0) and are converted OFFLINE by tools/ld2garage.py into garage brick lists
// (part, cell, offsets ox/oy/oz, orientation r + '@xzq' tilt, colour). This module only holds the converted presets and a test hook.
// Pipeline + sources + credits: docs/MODEL_PIPELINE.md.
const LDI={};
// ---------- imported parts (LD_MESH, real LDraw geometry for parts the catalogue lacks): positions on a ½ LDU grid, normals made here (35° crease)
const LD_Q=GB_U/40,LDG={};
const LD_b64=(s,T)=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new T(u.buffer)};
function LD_geo(k){if(LDG[k])return LDG[k];const D=LD_MESH[k],P=LD_b64(D.v,Int16Array),I=LD_b64(D.i,Uint16Array),nf=I.length/3,F=new Float32Array(nf*3),adj=new Map();
 const v=i=>[P[i*3]*LD_Q,P[i*3+1]*LD_Q,P[i*3+2]*LD_Q];
 for(let f=0;f<nf;f++){const a=v(I[f*3]),b=v(I[f*3+1]),c=v(I[f*3+2]),u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],w=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
  let x=u[1]*w[2]-u[2]*w[1],y=u[2]*w[0]-u[0]*w[2],z=u[0]*w[1]-u[1]*w[0];const l=Math.hypot(x,y,z)||1;F[f*3]=x/l;F[f*3+1]=y/l;F[f*3+2]=z/l;
  for(let j=0;j<3;j++){const q=I[f*3+j];let A=adj.get(q);if(!A)adj.set(q,A=[]);A.push(f)}}
 const pos=new Float32Array(nf*9),nor=new Float32Array(nf*9),C=Math.cos(35*Math.PI/180);
 for(let f=0;f<nf;f++)for(let j=0;j<3;j++){const q=I[f*3+j],p=v(q);let x=0,y=0,z=0;for(const g of adj.get(q))if(F[g*3]*F[f*3]+F[g*3+1]*F[f*3+1]+F[g*3+2]*F[f*3+2]>=C){x+=F[g*3];y+=F[g*3+1];z+=F[g*3+2]}
  const l=Math.hypot(x,y,z)||1,o=(f*3+j)*3;pos[o]=p[0];pos[o+1]=p[1];pos[o+2]=p[2];nor[o]=x/l;nor[o+1]=y/l;nor[o+2]=z/l}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));return LDG[k]=g}
for(const k in LD_MESH){const D=LD_MESH[k];GB_PC[k]={n:D.n.replace(/^~/,''),w:D.w,d:D.d,h:D.h,cat:'LDraw',ic:'◆',hide:1,s:D.s.some(q=>!q[3])};G13_ID[k]=D.id}
// the mesh + our studs; tilt ('@xzq') and glass/lit colours are applied here too, because the earlier wrappers call the chain that existed before this one
const LD_SD=[null,[0,0,1,1],[0,0,-1,-1],[1,0,0,-1],[1,0,0,1]];// side studs -x, +x, -z, +z: turn the up-cylinder about z / x
GB_piece=(f=>function(t,c,M,L){const m=typeof t==='string'&&G13_RX.exec(t),b=m?m[1]:t,D=LD_MESH[b];if(!D)return f(t,c,M,L);
 let cc=c,dst=M;if(typeof c==='string'&&(c[0]==='~'||c[0]==='*')){cc=c.slice(1);dst=c[0]==='*'?L:(CR_G||M)}
 const col=GB_BC[cc]||cc,T=[GB_col(LD_geo(b).clone(),col)];
 if(!(CR_LO>=2))for(const[x,y,z,k]of D.s){const g=new THREE.CylinderGeometry(.17,.17,.1,8);g.translate(0,.05,0);const S=LD_SD[k];
  if(S){if(S[0])g.rotateX(S[3]*Math.PI/2);else g.rotateZ(S[3]*Math.PI/2)}g.translate(x*LD_Q,y*LD_Q,z*LD_Q);T.push(GB_col(g,col))}
 if(m){const P=GB_PC[b],Q=GB_PC[t],X=new THREE.Matrix4().makeTranslation(0,-P.h*GB_PH/2,0).premultiply(G13_mat(+m[2],+m[3],+m[4])).premultiply(new THREE.Matrix4().makeTranslation(0,Q.h*GB_PH/2,0));for(const g of T)g.applyMatrix4(X)}
 for(const g of T)dst.push(g)})(GB_piece);
// ---------- offsets through the CR_grp path (boats, 4×4s and rival cars go through [t,x,z,r,c,y] arrays, which have no offsets):
// GAR_apply hands them on inside the colour ('#hex/ox/oy/oz'), the brick builder unpacks them
GAR_apply=(f=>function(){const A=f.apply(this,arguments);return A.map(b=>b&&(b.ox||b.oy||b.oz||b.R)&&typeof b.c==='string'&&b.c.indexOf('/')<0?Object.assign({},b,{c:b.c+'/'+(b.ox||0)+'/'+(b.oy||0)+'/'+(b.oz||0)+(b.R?'/'+b.R.join(','):'')}):b)})(GAR_apply);
// FREE ROTATION: b.R (3×3 row-major) for LDraw parts off the 90° grid (hinged spoilers, 45° lamps): built upright (mirrored first when m) at its cell,
// then turned about its body centre. Drawn only; footprint and stacking use the upright part.
GB_brickGeo=(f=>function(b,M,L){if(!b.R)return f.apply(this,arguments);const m0=M.length,l0=L.length,G=CR_G,g0=G?G.length:0,Wl=CR_W,w0=Wl?Wl.length:0;
 const o=Object.assign({},b,{r:0});delete o.R;f.call(this,o,M,L);const P=GB_PC[o.t],R=b.R,c=new THREE.Vector3((b.x+P.w/2+(+b.ox||0))*GB_U,(b.y+P.h/2+(+b.oy||0))*GB_PH,(b.z+P.d/2+(+b.oz||0))*GB_U);
 const X=new THREE.Matrix4().makeTranslation(c.x,c.y,c.z).multiply(new THREE.Matrix4().set(R[0],R[1],R[2],0,R[3],R[4],R[5],0,R[6],R[7],R[8],0,0,0,0,1)).multiply(new THREE.Matrix4().makeTranslation(-c.x,-c.y,-c.z));
 for(let i=m0;i<M.length;i++)M[i].applyMatrix4(X);for(let i=l0;i<L.length;i++)L[i].applyMatrix4(X);if(G)for(let i=g0;i<G.length;i++)G[i].applyMatrix4(X);if(Wl)for(let i=w0;i<Wl.length;i++)Wl[i].o.applyMatrix4(X)})(GB_brickGeo);
GB_brickGeo=(f=>function(b,M,L){if(typeof b.c!=='string'||b.c.indexOf('/')<0)return f.apply(this,arguments);const q=b.c.split('/'),o=Object.assign({},b,{c:q[0]});
 if(+q[1])o.ox=+q[1];if(+q[2])o.oy=+q[2];if(+q[3])o.oz=+q[3];if(q[4])o.R=q[4].split(',').map(Number);return f.call(this,o,M,L)})(GB_brickGeo);
// ---------- converted models → brick lists
function LD_br(id){const Mo=LD_MODELS[id];return Mo.B.map(([t,x,z,y,r,m,ci,ox,oy,oz,R])=>{CR_reg(t.split('@')[0]);const b={t,x,z,y,r,m,c:Mo.C[ci]};if(ox)b.ox=ox;if(oy)b.oy=oy;if(oz)b.oz=oz;if(R)b.R=R;return b})}
// test hook: surface points of one part as the garage builds it (upright, r 0), used by tools/ld_dump.js to calibrate LDraw parts
function LD_pts(t,n){const M=[],L=[],g0=CR_G,w0=CR_W;CR_G=[];CR_W=[];let G=[];
 try{GB_piece(t,'#888888',M,L);G=M.concat(L,CR_G);for(const w of CR_W){const g=CR_wheel(w.t).clone();g.translate(w.o.x,w.o.y,w.o.z);G.push(g)}}finally{CR_G=g0;CR_W=w0}
 const T=[];let A=0;const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),u=new THREE.Vector3(),v=new THREE.Vector3();
 for(const g of G){const q=g.index?g.toNonIndexed():g,p=q.attributes.position;for(let i=0;i+2<p.count;i+=3){a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);
  const s=u.subVectors(b,a).cross(v.subVectors(c,a)).length()/2;if(s>1e-7){A+=s;T.push([a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z,A])}}}
 const out=[];let s=12345;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let k=0;k<n&&T.length;k++){const r=rnd()*A;let lo=0,hi=T.length-1;while(lo<hi){const m=(lo+hi)>>1;if(T[m][9]<r)lo=m+1;else hi=m}const t=T[lo];let x=rnd(),y=rnd();if(x+y>1){x=1-x;y=1-y}
  out.push([t[0]+x*(t[3]-t[0])+y*(t[6]-t[0]),t[1]+x*(t[4]-t[1])+y*(t[7]-t[1]),t[2]+x*(t[5]-t[2])+y*(t[8]-t[2])].map(z=>Math.round(z*1000)/1000))}
 return{n:out.length,area:Math.round(A*1000)/1000,p:out}}
// a model as a THREE.Group straight from brick objects (keeps offsets and free rotations; CR_grp takes arrays)
function LD_grp(B){const G=GB_geo(B,null),g=new THREE.Group(),mk=(geo,mat)=>{const o=new THREE.Mesh(geo,mat);g.add(o);return o};if(G.m)mk(G.m,GB_MAT);if(G.l)mk(G.l,GB_LMAT);if(G.g)mk(G.g,CR_GM).renderOrder=2;
 for(const w of G.w||[]){const o=mk(CR_wheel(w.t),GB_MAT);o.position.copy(w.o)}return g}
window.__ld={pts:LD_pts,br:LD_br,grp:LD_grp,fix:B=>B.map(b=>{CR_reg(b.t.split('@')[0]);return b}),M:LD_MODELS,THREE,PC:GB_PC,ID:G13_ID,AL:G13_AL,BC:GB_BC,U:GB_U,PH:GB_PH,
 parts:()=>Object.keys(GB_PC).map(k=>{const P=GB_PC[k];return{k,n:P.n,w:P.w,d:P.d,h:P.h,cat:P.cat||'',id:G13_ID[k]||null,wh:!!(typeof CR_WH!=='undefined'&&CR_WH[k])}})};
// the speedboat: hull bottom 5 plates down (w8boat: sits IN the water like the other boats), driver behind the wheel (the set's minifig is not converted)
function LD_boat(){const A=LD_br('boat').map(b=>Object.assign(b,{y:b.y-5}));A.push({t:'drv',x:-1,z:2,y:-3,r:0,m:0,c:'#0055bf'});return A}
// ---------- presets (names are generic like the other RIDES; the LEGO set number is the ref)
{const R=GAR_set('rod'),L=n=>JSON.parse(JSON.stringify(R.load[n]));
 GAR_SETS.push({id:'t_rally',n:'Rally S1 (76897)',tier:'r',req:null,car:()=>LD_br('audi'),off:R.off,boat:R.boat,tpl:1,ref:'76897',forms:['car'],
  load:{car:{name:'RALLY S1',k:'Rally',st:{top:1.05,acc:1.06,han:1.05,hull:1},w:'Medium',perk:'drift'},'4x4':L('4x4'),boat:L('boat')}});
 GAR_SETS.push({id:'t_speedboat',n:'Harbour Speedboat (4641)',tier:'c',req:null,car:R.car,off:R.off,boat:LD_boat,tpl:1,ref:'4641',forms:['boat'],
  load:{car:L('car'),'4x4':L('4x4'),boat:{name:'SPEEDBOAT',k:'Water',st:{top:1.04,acc:1.05,han:1.04,hull:.98},w:'Light',perk:'refill'}}})}
// ---------- the 1490 Town Bank as a Frankfurt world prop ("Mainhattan" is the bank city). Minifig scale = the same stud size as the cars
// (LD_SW = 0.408 m per garage unit, measured on the player car in roam). One merged world-space mesh per material (3 draws, hub distance culling),
// box collider = the walls' footprint (bricks above the baseplate), placed on the nearest free lot to the start, front to the street.
const LD_SW=.408,LDP={g:null,at:null,col:null};
function LD_propSpot(x0,z0,hw,hd){for(let r=24;r<300;r+=8)for(let a=0;a<32;a++){const t=a/32*Math.PI*2,x=x0+Math.cos(t)*r,z=z0+Math.sin(t)*r;
  for(const rot of[0,1]){const w=rot?hd:hw,d=rot?hw:hd;if(!rfFree(x,z,3)||roamHit(x,z,Math.max(w,d)+1.5))continue;let ok=1;
   for(const sx of[-1,-.5,0,.5,1])for(const sz of[-1,-.5,0,.5,1])if(ok&&(FL_road(x+sx*w,z+sz*d,2.5)||roamHit(x+sx*w,z+sz*d,.8)))ok=0;
   if(ok)return{x,z,rot}}}return null}
function LD_propBuild(){if(CID!=='fra'||LDP.g||!HUB.grp)return;const B=LD_br('bank'),lo=CR_LO;let G;CR_LO=2;try{G=GB_geo(B,null)}finally{CR_LO=lo}// CR_LO 2: 6-sided studs, imported parts without studs
 const parts=[[G.m,GB_MAT],[G.l,GB_LMAT],[G.g,CR_GM]].filter(q=>q[0]),box=new THREE.Box3();for(const[g]of parts){g.computeBoundingBox();box.union(g.boundingBox)}
 const c=box.getCenter(new THREE.Vector3());let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
 // walls: footprint of the bricks standing on the baseplate
 for(const b of B){if(b.y<1||!GB_PC[b.t]||GB_PC[b.t].h<3)continue;const P=GB_PC[b.t],w=b.r%2?P.d:P.w,d=b.r%2?P.w:P.d;x0=Math.min(x0,b.x);x1=Math.max(x1,b.x+w);z0=Math.min(z0,b.z);z1=Math.max(z1,b.z+d)}
 const k=GB_U*LD_SW,hw=(x1-x0)*k/2-.2,hd=(z1-z0)*k/2-.2,ox=((x0+x1)/2)*GB_U*LD_SW-c.x*LD_SW,oz=((z0+z1)/2)*GB_U*LD_SW-c.z*LD_SW;
 const st=(typeof RO!=='undefined'&&RO&&RO.x!=null&&isFinite(RO.x)&&(RO.x||RO.z))?{x:RO.x,z:RO.z}:{x:2061,z:0};// the story start (measured) when the car is not placed yet
 const S=LD_propSpot(st.x,st.z,Math.max(hw,hd)+.5,Math.min(hw,hd)+.5);if(!S)return;
 // front (−z of the model) to the nearest road
 const yaws=[0,1,2,3].filter(q=>q%2===S.rot);let best=yaws[0],bd=1e9;for(const q of yaws){const a=q*Math.PI/2,fx=-Math.sin(a),fz=-Math.cos(a);for(let r=2;r<40;r+=2)if(FL_road(S.x+fx*(hd+r),S.z+fz*(hd+r),0)){if(r<bd){bd=r;best=q}break}}
 const a=best*Math.PI/2,y=groundY(S.x,S.z);
 // world-space geometry straight under HUB.grp, so the hub distance culling (hubCull*) handles it like every other building
 const X=new THREE.Matrix4().makeTranslation(S.x,y,S.z).multiply(new THREE.Matrix4().makeRotationY(a)).multiply(new THREE.Matrix4().makeScale(LD_SW,LD_SW,LD_SW)).multiply(new THREE.Matrix4().makeTranslation(-c.x,-box.min.y,-c.z));
 LDP.g=[];LDP.tris=0;for(const[g,mat]of parts){g.applyMatrix4(X);g.computeBoundingSphere();const o=new THREE.Mesh(g,mat);o.name='ld_bank';o.receiveShadow=true;if(mat===CR_GM)o.renderOrder=2;HUB.grp.add(o);hubCullAdd(o);LDP.g.push(o);LDP.tris+=(g.index?g.index.count:g.attributes.position.count)/3}
 const cs=Math.cos(a),sn=Math.sin(a),cx=S.x+ox*cs+oz*sn,cz=S.z-ox*sn+oz*cs,odd=best%2,col={x:cx,z:cz,hw:odd?hd:hw,hd:odd?hw:hd,h:y+(box.max.y-box.min.y)*LD_SW};
 HUB.bld.push(col);hubGridAdd([col]);LDP.at={x:+S.x.toFixed(1),z:+S.z.toFixed(1),yaw:best,y:+y.toFixed(2)};LDP.col=col}
buildRoam=(f=>function(){const r=f.apply(this,arguments);try{LD_propBuild()}catch(e){console.warn('LD prop',e)}return r})(buildRoam);
window.__ld.prop=LDP;window.__ld.propBuild=LD_propBuild;
