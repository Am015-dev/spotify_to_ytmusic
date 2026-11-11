// ---------- TR game side: ground mesh resolution, buildings on the terrain, drivable slopes, slope tilt, camera, summit rewards, minimap relief
// ground cells refine by terrain curvature (bilinear error <= 5 cm, 8 m at most fine) and sit 10 cm low, so the draped streets (+4.5 cm) always show; rivers keep their own refinement in gndBuild
function TR_res(a,b,c,d){const N=6,h00=tH(a,c),h10=tH(b,c),h01=tH(a,d),h11=tH(b,d);let e=0;
  for(let i=1;i<N;i++)for(let j=1;j<N;j++){const u=i/N,v=j/N,l=(h00*(1-u)+h10*u)*(1-v)+(h01*(1-u)+h11*u)*v;e=Math.max(e,Math.abs(tH(a+(b-a)*u,c+(d-c)*v)-l))}
  if(e<.05)return false;const n=Math.min(Math.ceil((b-a)/8),Math.ceil(Math.sqrt(e/.05)));return n<=1?false:(b-a)/n}
{const _g=gndBuild;gndBuild=(grp,x0,x1,z0,z1,o)=>{const out=_g(grp,x0,x1,z0,z1,{...o,hilly:TR_res,y0:(o.y0||0)-.1});for(const m of out)m.userData.trG=1;return out}}
// buildings: most city builders place bodies at y=0. Right after the city merge (first hubGrid) every collider footprint gets its ground
// (min/max over corners, edges, centre). Bodies that start below their ground are lifted to max(lowest corner, highest corner - 0.8 m)
// (vertices of merged meshes and instance origins inside the footprint, + 1.6 m for balconies/eaves); a stone plinth fills down to the
// lowest corner. Colliders move with them. Pieces already placed on the ground keep their height (plinth only if they float).
const TR_PL=[];
function TR_bldFix(){const B=HUB.bld,C=new Map(),CS=8,K=(i,j)=>i*100000+j;
  for(const b of B){const c=b.c??1,s=b.s??0,P=[];for(const u of[-1,0,1])for(const v of[-1,0,1]){const lx=u*b.hw,lz=v*b.hd;P.push(groundY(b.x+lx*c+lz*s,b.z-lx*s+lz*c))}
    b.trMin=Math.min(...P);b.trMax=Math.max(...P);b.trY=1e9;const R=Math.hypot(b.hw,b.hd)+1.8;
    for(let i=Math.floor((b.x-R)/CS);i<=Math.floor((b.x+R)/CS);i++)for(let j=Math.floor((b.z-R)/CS);j<=Math.floor((b.z+R)/CS);j++){const k=K(i,j);let L=C.get(k);if(!L)C.set(k,L=[]);L.push(b)}}
  const find=(x,z,m)=>{const L=C.get(K(Math.floor(x/CS),Math.floor(z/CS)));if(!L)return null;let best=null,bo=1e9;for(const b of L){const dx=x-b.x,dz=z-b.z,lx=b.c==null?dx:dx*b.c-dz*b.s,lz=b.c==null?dz:dx*b.s+dz*b.c,o=Math.max(Math.abs(lx)-b.hw,Math.abs(lz)-b.hd);if(o<=m&&o<bo){bo=o;best=b}}return best};
  const meshes=HUB.grp.children.filter(o=>(o.isMesh||o.isInstancedMesh)&&!o.userData.trG&&o.geometry&&o.geometry.attributes.position),_M=new THREE.Matrix4(),_p=V3();
  for(const o of meshes){if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,_M);_p.setFromMatrixPosition(_M);const b=find(_p.x,_p.z,.4);if(b&&_p.y<b.trY)b.trY=_p.y}continue}
    const p=o.geometry.attributes.position.array;for(let i=0;i<p.length;i+=3){const b=find(p[i],p[i+2],.4);if(b&&p[i+1]<b.trY)b.trY=p[i+1]}}
  for(const b of B){b.trBot=b.trMin;if(b.trY===1e9){b.trOff=0;continue}const base=Math.max(b.trMin,b.trMax-.8),lo=b.trY<Math.max(b.trMin-1,.3)&&b.trMin>-1&&base>.05;if(lo){b.trOff=base;
      b.h+=base;b.y0=b.y0!=null?b.y0+base:b.trMin-1;b.trBase=b.trY+base;b.trDoor=base}else{const up=b.trMin>-1?base-b.trY:0;b.trOff=up>.05&&up<6?up:0;if(b.trOff){b.h+=up;if(b.y0!=null)b.y0+=up}b.trBase=b.trY+b.trOff;b.trDoor=b.trBase}
    if(b.trBase>b.trMin+.06){TR_PL.push(b);b.trBot=b.trMin-.4}else b.trBot=Math.min(b.trBase,b.trMin)}
  for(const o of meshes){let ch=false;if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,_M);_p.setFromMatrixPosition(_M);const b=find(_p.x,_p.z,1.6);if(b&&b.trOff){_M.elements[13]+=b.trOff;o.setMatrixAt(i,_M);ch=true}}if(ch){o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere&&o.computeBoundingSphere()}continue}
    const A=o.geometry.attributes.position,p=A.array;for(let i=0;i<p.length;i+=3){const b=find(p[i],p[i+2],1.6);if(!b||!b.trOff)continue;
      const core=find(p[i],p[i+2],.4)===b;if(!core){const gv=groundY(p[i],p[i+2]);if(p[i+1]>gv-.15&&p[i+1]<gv+.35)continue}p[i+1]+=b.trOff;ch=true}
    if(ch){A.needsUpdate=true;o.geometry.computeBoundingSphere();o.geometry.computeBoundingBox()}}
  // plinths: 4 stone sides per lifted/floating building, merged per 800 m tile
  const T=new Map();for(const b of TR_PL){const k=hubTile(b.x,b.z);let a=T.get(k);if(!a)T.set(k,a={p:[],n:[]});const c=b.c??1,s=b.s??0,hw=b.hw+.35,hd=b.hd+.35,y0=b.trMin-.4,y1=b.trBase+.05,
      Q=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([lx,lz])=>[b.x+lx*c+lz*s,b.z-lx*s+lz*c]);
    for(let e=0;e<4;e++){const A=Q[e],Bq=Q[(e+1)%4],nx=Bq[1]-A[1],nz=-(Bq[0]-A[0]),l=Math.hypot(nx,nz)||1,N=[nx/l,0,nz/l],cx=(A[0]+Bq[0])/2-b.x,cz=(A[1]+Bq[1])/2-b.z,f=cx*N[0]+cz*N[2]<0?-1:1;
      const V=[[A[0],y0,A[1]],[Bq[0],y0,Bq[1]],[Bq[0],y1,Bq[1]],[A[0],y1,A[1]]],I=f>0?[0,2,1,0,3,2]:[0,1,2,0,2,3];for(const t of I){a.p.push(...V[t]);a.n.push(N[0]*f,0,N[2]*f)}}}
  const pm=new THREE.MeshStandardMaterial({color:'#b5a68c',roughness:.92,metalness:0});for(const a of T.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(a.n,3));const m=new THREE.Mesh(g,pm);m.receiveShadow=true;m.userData.trPl=1;HUB.grp.add(m)}
  HUB.trB={n:B.length,lifted:B.filter(b=>b.trOff).length,plinths:TR_PL.length}}
let TR_bf=0;{const _hg=hubGrid;hubGrid=()=>{if(!TR_bf&&HUB.grp){TR_bf=1;TR_bldFix()}return _hg()}}
// ---------- drivable slopes (2K-Drive style): gravity along the slope, full grip up to ~29°, fading to none at ~38° (the car then slides back
// down the fall line, never stuck); the car stays glued to the terrain (no airborne frames on terrain), never sinks below it
function TR_pre(dt){RO.trSlope=null;const T=roamTerr(RO.x,RO.z,RO.y+.3);if(RO.y>T.g+.5||T.deck||T.g<-1.5){RO.trSl=Math.max(0,(RO.trSl||0)-12*dt);return}
  const[gx,gz]=TR_grad(RO.x,RO.z,2),s=Math.hypot(gx,gz),th=Math.atan(s),fx=Math.sin(RO.vh??RO.h),fz=Math.cos(RO.vh??RO.h),a=gx*fx+gz*fz;RO.trSlope={gx,gz,th,a};
  RO.v-=9.8*.75*a/Math.sqrt(1+a*a)*dt;const grip=clamp((.665-th)/(.665-.5),0,1);RO.trGrip=grip;
  if(grip<1){if(a>0&&RO.v>-2&&CTL&&(CTL.thr||CTL.boost))RO.v-=(1-grip)*58*dt;RO.trSl=Math.min(9,(RO.trSl||0)+(1-grip)*16*dt)}else RO.trSl=Math.max(0,(RO.trSl||0)-12*dt)}
function TR_post(dt){const S=RO.trSlope;if(RO.trSl>.05&&S){const s=Math.hypot(S.gx,S.gz)||1,dx=-S.gx/s*RO.trSl*dt,dz=-S.gz/s*RO.trSl*dt;if(!roamHit(RO.x+dx,RO.z+dz,2.2,RO.y)){RO.x+=dx;RO.z+=dz}}
  TR_snap();TR_summitStep()}
function TR_snap(){const dt=1/60,T=roamTerr(RO.x,RO.z,RO.y+.3),g=T.g;RO.trDeck=!!T.deck;
  if(RO.y<g){RO.y=g;if(RO.vy<0)RO.vy=0}else if(RO.y>g&&RO.vy<=.01&&RO.vy>-8&&!RO.lastRamp&&RO.y-g<Math.abs(RO.v)*dt*1.2+.6){RO.y=g;RO.vy=0;if(pl)pl.air=null}}
function TR_tilt(s,dt){const ud=s.mesh&&s.mesh.userData;if(!ud||!ud.m)return;let nx=0,ny=1,nz=0;if(!s.air&&!RO.trDeck&&RO.y<groundY(RO.x,RO.z)+.6){const[gx,gz]=TR_grad(RO.x,RO.z,2.2),l=Math.hypot(gx,1,gz);nx=-gx/l;ny=1/l;nz=-gz/l}
  const N=RO.trN||(RO.trN=V3(0,1,0)),k=Math.min(1,dt*9);N.x+=(nx-N.x)*k;N.y+=(ny-N.y)*k;N.z+=(nz-N.z)*k;N.normalize();if(N.y>.9999)return;TR_q.setFromUnitVectors(TR_up,N);ud.m.quaternion.premultiply(TR_q)}
const TR_q=new THREE.Quaternion(),TR_up=V3(0,1,0);
const TR_live=()=>!!pl&&!RO.wk&&(RO.on||state==='roam');
{const _rs=roamStep;roamStep=dt=>{const on=TR_live();if(on)TR_pre(dt);_rs(dt);if(on&&TR_live())TR_post(dt)}}
{const _rp=roamPose;roamPose=(s,dt)=>{if(TR_live())TR_snap();_rp(s,dt);if(TR_live())TR_tilt(s,dt)}}
// chase camera: lifted over the hillside between camera and car (fast up, slow down) so it never clips into the slope
{const _rc=roamCam;roamCam=dt=>{_rc(dt);if(!TR_live())return;const c=camera.position;let need=0;for(const t of[1,.7,.4]){const x=RO.x+(c.x-RO.x)*t,z=RO.z+(c.z-RO.z)*t,yl=RO.y+2+(c.y-RO.y-2)*t,gq=groundY(x,z)+1.7;need=Math.max(need,(gq-yl)/t)}
  const L=RO.trCL||0;RO.trCL=L+(need-L)*Math.min(1,dt*(need>L?10:1.8));if(RO.trCL>.02){c.y+=RO.trCL;camera.lookAt(RO.x,RO.y+2,RO.z)}}}
// ---------- summit rewards: Lycabettus (district B) and Filopappou (district A): viewpoint ring + flag + a stud cluster, one-time photo bonus
const TR_SUM=[];function TR_summits(){if(CID==='fra'||TR_SUM.length)return TR_SUM;for(const[id,name]of[['lyka','LYCABETTUS'],['phil','FILOPAPPOU']]){const h=HILL_BY[id];if(!h||h.cx<WX0+40||h.cx>WX1-40||h.cz<WZS+40||h.cz>WZN-40)continue;let bx=h.cx,bz=h.cz,by=-1;
    for(let r=0;r<=260;r+=6)for(let k=0;k<Math.max(1,r/3);k++){const a=k/Math.max(1,r/3)*Math.PI*2,x=h.cx+Math.cos(a)*r,z=h.cz+Math.sin(a)*r,y=TR_G(x,z);if(y>by){by=y;bx=x;bz=z}}TR_SUM.push({id,name,x:bx,z:bz,y:groundY(bx,bz)})}return TR_SUM}
const TR_VPK='mho_trvp@'+SLOT;function TR_vp(){try{return JSON.parse(localStorage.getItem(TR_VPK)||'{}')}catch(e){return{}}}
function TR_summitStep(){for(const S of TR_SUM){if(Math.hypot(RO.x-S.x,RO.z-S.z)>16||RO.y>S.y+4)continue;const V=TR_vp();if(V[S.id])continue;V[S.id]=1;try{localStorage.setItem(TR_VPK,JSON.stringify(V))}catch(e){}
    studGain(250);hitPop('📷 VIEWPOINT · '+S.name+' +250','#5dffb0');AU.sfx('pick');if(S.m)S.m.material=neonMat('#ffd12c',2.4)}}
{const _br=buildRoam;buildRoam=(...a)=>{const r=_br(...a);try{TR_summitBuild()}catch(e){console.warn('TR summit',e)}return r}}
function TR_summitBuild(){const L=TR_summits();if(!L.length||!RO.grp)return;const src=(RO.sim||[])[0],V=TR_vp();
  for(const S of L){const g=new THREE.Group();g.position.set(S.x,S.y,S.z);const ring=new THREE.Mesh(new THREE.TorusGeometry(9,.6,8,40),neonMat(V[S.id]?'#ffd12c':'#5dffb0',2.4));ring.rotation.x=Math.PI/2;ring.position.y=.4;g.add(ring);S.m=ring;
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,14,8).translate(0,7,0),new THREE.MeshStandardMaterial({color:0xeeeeee})));const fl=new THREE.Mesh(new THREE.BoxGeometry(4,2.4,.2),neonMat('#2f9bff',2));fl.position.set(2,12.6,0);g.add(fl);RO.grp.add(g);
    if(src){const n=13,im=new THREE.InstancedMesh(src.geometry,src.material,n);im.frustumCulled=false;RO.grp.add(im);RO.sim.push(im);for(let i=0;i<n;i++){const a=i/12*Math.PI*2,r=i<12?11:0,x=S.x+Math.cos(a)*r,z=S.z+Math.sin(a)*r,y=groundY(x,z)+1.4;
      RO.studs.push({x,y,z,v:i<12?10:40,big:i===12,m:{position:V3(x,y,z),rotation:{z:0},visible:true},alive:true,t:0,im,i})}}}}
// ---------- minimap relief: hillshade (light from the north-west) multiplied over the painted map
{const _mp=miniPaint;miniPaint=(x0,x1,z0,z1,k,wt)=>{const R=_mp(x0,x1,z0,z1,k,wt);try{TR_shade(R.c,x1,z1,k)}catch(e){console.warn('TR shade',e)}return R}}
function TR_shade(c,x1,z1,k){const W=c.width,H=c.height,st=4,sw=Math.ceil(W/st),sh=Math.ceil(H/st),[c2,g2]=cv(sw,sh),im=g2.createImageData(sw,sh),d=im.data,cs=st/k,L=[.55,.64,-.55],ll=Math.hypot(...L);
  for(let j=0;j<sh;j++)for(let i=0;i<sw;i++){const x=x1-(i+.5)*cs,z=z1-(j+.5)*cs,hx=(tH(x-cs,z)-tH(x+cs,z))/(2*cs),hz=(tH(x,z-cs)-tH(x,z+cs))/(2*cs),nl=Math.hypot(hx,1,hz),
      l=(-hx*L[0]+L[1]-hz*L[2])/(nl*ll)-L[1]/ll,o=(j*sw+i)*4;if(l<0){d[o]=d[o+1]=d[o+2]=30;d[o+3]=Math.min(95,-l*300)}else{d[o]=d[o+1]=d[o+2]=255;d[o+3]=Math.min(55,l*180)}}
  g2.putImageData(im,0,0);const g=c.getContext('2d');g.save();g.imageSmoothingEnabled=true;g.drawImage(c2,0,0,W,H);g.restore()}
window.__tr={B:[HX0,HX1,HZS,HZN],hit:(x,z)=>!!roamHit(x,z,3),real:(e,n)=>TR_real(e,n),G:(x,z)=>TR_G(x,z),Y:(x,z)=>groundY(x,z),datum:TR_DATUM,ex:TR_EX,RW:(x,z)=>RW(x,z),WP:(e,n)=>WP(e,n),grad:(x,z)=>TR_grad(x,z),
  summits:()=>TR_summits().map(S=>({id:S.id,x:S.x,z:S.z,y:S.y})),vp:()=>TR_vp(),bstat:()=>HUB.trB,
  blds:()=>HUB.bld.filter(b=>b.trMin!=null).map(b=>[+b.x.toFixed(1),+b.z.toFixed(1),+b.trMin.toFixed(2),+b.trMax.toFixed(2),+(b.trBase??0).toFixed(2),+(b.trBot??0).toFixed(2),+(b.trDoor??0).toFixed(2),b.trOff?1:0,b.trY<1e9?1:0,+b.hw.toFixed(1),+b.hd.toFixed(1)]),
  slope:()=>RO.trSlope&&{th:+(RO.trSlope.th*57.3).toFixed(1),grip:+(RO.trGrip??1).toFixed(2),sl:+(RO.trSl||0).toFixed(2)}};
