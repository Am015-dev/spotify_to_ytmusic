/* proto-1 (2026-10-24, ?proto=1, default OFF): a 2K-Drive-look prototype of ONE small stretch: the Westend Split (TK_C) start grid + the first ~380 m.
   Alex 24 Oct: "focus with the benchmark one small part to make it pretty as a prototype". Benchmark: docs/shots/library/any/race/ref2k_any_race_street_01.jpg.
   Adds, only while that race runs: red/white studded kerbs on both road edges, a low red/white brick barrier behind them (gaps at side streets), flag poles,
   tyre stacks, glowing yellow chevron boards on the outside of the bend, a start gantry with banner + 5 start lights (red during the countdown, green at GO),
   painted grid slots + a checkered start line, a staggered 2-wide grid (rivals in front, the player at the back, like 2K), glowing purple bubbles on the ? bricks.
   Everything is merged per material (one draw per colour); materials are MeshStandard (no map / map) and MeshBasic like the arches, items and pads, so no new
   shader program; they are cached and never disposed (OBJ_free disposes materials, so the props live in their own group, removed in sprintEnd). */
const PROTO={on:OD_FLAG('proto'),n:0,g:null,M:null,lights:null,hw:11};window.PROTO=PROTO;   // lazy chunk (src/LAZY): const is eval-local, tests read window.PROTO
function PR_mats(){if(PROTO.M)return PROTO.M;const A=tkArchMats(),S=c=>new THREE.MeshStandardMaterial({color:c,roughness:.35,metalness:0});
  const tx=(w,h,f)=>{const[c,g]=cv(w,h);f(g);const t=tex(c);KEEP_TEX.add(t);return t};
  const chev=tx(128,128,g=>{g.fillStyle='#ffcd03';g.fillRect(0,0,128,128);g.fillStyle='#1b1c22';for(const o of[0,52]){g.beginPath();g.moveTo(14+o,18);g.lineTo(44+o,18);g.lineTo(78+o,64);g.lineTo(44+o,110);g.lineTo(14+o,110);g.lineTo(48+o,64);g.closePath();g.fill()}g.strokeStyle='#1b1c22';g.lineWidth=8;g.strokeRect(4,4,120,120)});
  const chk=tx(256,32,g=>{for(let i=0;i<32;i++)for(let j=0;j<4;j++){g.fillStyle=(i+j)%2?'#111':'#fff';g.fillRect(i*8,j*8,8,8)}});
  const ban=tx(512,96,g=>{g.fillStyle='#0a5fbf';g.fillRect(0,0,512,96);for(let i=0;i<64;i++){g.fillStyle=i%2?'#111':'#fff';g.fillRect(i*8,0,8,8);g.fillStyle=i%2?'#fff':'#111';g.fillRect(i*8,88,8,8)}
    g.fillStyle='#ffcd03';g.font='italic 900 38px system-ui';g.textAlign='center';g.textBaseline='middle';g.strokeStyle='#1b1c22';g.lineWidth=8;g.strokeText('WESTEND GRAND PRIX',256,50);g.fillText('WESTEND GRAND PRIX',256,50)});
  return PROTO.M={red:A.red,wht:A.wht,yel:A.yel,blu:A.blu,grn:A.grn,blk:S(0x1d1e24),org:S(0xff7a1a),chev:new THREE.MeshBasicMaterial({map:chev,color:new THREE.Color(1.6,1.6,1.6)}),
    chk:new THREE.MeshStandardMaterial({map:chk,roughness:.4}),ban:new THREE.MeshStandardMaterial({map:ban,roughness:.4}),bub:neonMat('#b44cff',1.6,{transparent:true,opacity:.33,depthWrite:false}),
    ring:neonMat('#c070ff',2.4),lr:neonMat('#ff2a1c',2.6),lg:neonMat('#36ff6a',2.6),off:S(0x2a2b33),asp:new THREE.MeshStandardMaterial({color:0x3b3c44,roughness:.8,metalness:0})}}
// the start leg of the course at distance s (m); s<0 extrapolates back along the first heading. lateral +ln = (cos h, -sin h) (the driver's left)
function PR_at(P,L,s){const q=tkAt(P,clamp(s,0,L)/L);if(s>=0)return q;return{x:q.x+Math.sin(q.h)*s,z:q.z+Math.cos(q.h)*s,h:q.h}}
function PR_build(sp){const M=PR_mats(),Gm=tkGeoOf(sp.C),P=Gm.seg.start,L=tkLen(P),B=new Map(),m4=new THREE.Matrix4(),qn=new THREE.Quaternion(),e=new THREE.Euler(),one=new THREE.Vector3(1,1,1);
  const put=(mat,geo,x,y,z,h,rx=0)=>{e.set(rx,h,0,'YXZ');qn.setFromEuler(e);m4.compose(new THREE.Vector3(x,y,z),qn,one);geo.applyMatrix4(m4);(B.get(mat)||B.set(mat,[]).get(mat)).push(geo)};
  const c0=cityAt(PR_at(P,L,40).x,PR_at(P,L,40).z),hw=PROTO.hw=clamp(((c0&&c0.road&&c0.road.w)||22)/2,6,16),S1=Math.min(380,L-20);
  const pt=(s,ln)=>{const q=PR_at(P,L,s);const x=q.x+Math.cos(q.h)*ln,z=q.z-Math.sin(q.h)*ln;return{x,z,h:q.h,y:groundAt(x,z,99)}};
  // side street at (x,z): the nearest street is another one and we are inside its carriageway -> leave a gap
  const gap=(x,z)=>{const c=cityAt(x,z,-1,true);return c&&c0&&c.si!==c0.si&&c.road&&Math.abs(c.d)<(c.road.w||12)/2};
  let n=0;
  for(const sd of[-1,1]){
    for(let s=-28,k=0;s<S1;s+=2,k++){const a=pt(s,sd*(hw-.45));put(k%2?M.wht:M.red,new THREE.BoxGeometry(.9,.22,1.96),a.x,a.y+.11,a.z,a.h);n++;   // kerb + 2 studs
      for(const o of[-.5,.5])put(k%2?M.wht:M.red,new THREE.CylinderGeometry(.24,.24,.16,8),a.x+Math.sin(a.h)*o,a.y+.3,a.z+Math.cos(a.h)*o,a.h)}
    for(let s=-28,k=0;s<S1;s+=4,k++){const a=pt(s,sd*(hw+1.1));if(gap(a.x,a.z))continue;const mt=k%2?M.wht:M.red;put(mt,new THREE.BoxGeometry(.8,1.1,3.9),a.x,a.y+.55,a.z,a.h);n++;   // brick barrier, 2 studs on top
      for(const o of[-1,1])put(mt,new THREE.CylinderGeometry(.26,.26,.18,8),a.x+Math.sin(a.h)*o,a.y+1.19,a.z+Math.cos(a.h)*o,a.h)}
    const fc=[M.yel,M.blu,M.red,M.grn];for(let s=sd<0?6:16,k=0;s<S1;s+=20,k++){const a=pt(s,sd*(hw+2.6));if(gap(a.x,a.z))continue;put(M.wht,new THREE.CylinderGeometry(.14,.14,7.5,6),a.x,a.y+3.75,a.z,a.h);   // flag pole + banner
      put(fc[k%4],new THREE.BoxGeometry(.12,2.4,1.7),a.x+Math.sin(a.h)*.85,a.y+6.2,a.z+Math.cos(a.h)*.85,a.h);n+=2}
    for(let s=sd<0?30:50;s<S1;s+=45){const a=pt(s,sd*(hw+2.2));if(gap(a.x,a.z))continue;for(let j=0;j<3;j++)for(const o of[-.6,.6]){put(j%2?M.wht:M.blk,new THREE.CylinderGeometry(.55,.55,.42,12),a.x+Math.sin(a.h)*o,a.y+.21+j*.42,a.z+Math.cos(a.h)*o,a.h)}n++}}
  // chevrons on the outside of the bend, facing the driver (heading falls -> the road bends to lateral -, outside is +)
  for(let s=60;s<S1;s+=10){const h0=PR_at(P,L,s-15).h,h1=PR_at(P,L,s+15).h,dh=h1-h0;if(Math.abs(dh)<.035)continue;const sd=dh<0?1:-1,a=pt(s,sd*(hw+1.3));
    const pl=new THREE.PlaneGeometry(2.4,2.4);if(sd<0){const u=pl.attributes.uv;for(let i=0;i<u.count;i++)u.setX(i,1-u.getX(i))}put(M.chev,pl,a.x,a.y+2.6,a.z,a.h+Math.PI);put(M.blk,new THREE.BoxGeometry(.18,1.5,.18),a.x,a.y+.75,a.z,a.h);n++}
  // start line, grid slots, gantry
  const sL=38;for(let s=-24;s<sL+6;s+=6){const a=pt(s+3,0);put(M.asp,new THREE.BoxGeometry(hw*2-1.2,.05,6.1),a.x,a.y+.02,a.z,a.h)}{const a=pt(sL,0);put(M.chk,new THREE.BoxGeometry(hw*2-1.2,.05,1.6),a.x,a.y+.05,a.z,a.h)}
  const nA=sp.ai.length,slots=[[4,4]];sp.ai.forEach((ai,i)=>{const r=nA-1-i;ai.s=11+7*r;ai.lane=r%2?4:-4;slots.push([ai.s,ai.lane])});
  for(const[s,ln]of slots){for(const o of[-1.7,1.7]){const a=pt(s,ln+o);put(M.wht,new THREE.BoxGeometry(.22,.05,4.6),a.x,a.y+.05,a.z,a.h)}const f=pt(s+2.5,ln);put(M.wht,new THREE.BoxGeometry(3.6,.05,.25),f.x,f.y+.05,f.z,f.h)}
  {const gs=sL+4;for(const sd of[-1,1]){const a=pt(gs,sd*(hw+1.6));for(let k=0;k<6;k++)put(k%2?M.yel:M.red,new THREE.BoxGeometry(2.4,1.4,2.4),a.x,a.y+.7+k*1.4,a.z,a.h);for(const o of[-.6,.6])for(const p of[-.6,.6])put(M.yel,new THREE.CylinderGeometry(.42,.42,.3,10),a.x+Math.cos(a.h)*o+Math.sin(a.h)*p,a.y+8.55,a.z-Math.sin(a.h)*o+Math.cos(a.h)*p,a.h)}
    const c=pt(gs,0),bw=hw*2+5.6;put(M.blu,new THREE.BoxGeometry(bw,2.6,1.2),c.x,c.y+9.7,c.z,c.h);
    const pl=new THREE.PlaneGeometry(bw*.8,2.3);put(M.ban,pl,c.x-Math.sin(c.h)*.62,c.y+9.7,c.z-Math.cos(c.h)*.62,c.h+Math.PI);   // banner faces the grid
    const Lg=new THREE.Group();PROTO.lights=[];for(let i=0;i<5;i++){const o=(i-2)*1.6,x=c.x+Math.cos(c.h)*o-Math.sin(c.h)*.7,z=c.z-Math.sin(c.h)*o-Math.cos(c.h)*.7;put(M.blk,new THREE.BoxGeometry(1.2,1.4,.4),x,c.y+7.7,z,c.h);
      const l=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.2,12),M.off);l.position.set(x-Math.sin(c.h)*.25,c.y+7.7,z-Math.cos(c.h)*.25);l.rotation.set(Math.PI/2,c.h,0,'YXZ');Lg.add(l);PROTO.lights.push(l)}
    PROTO.lg=Lg}
  // ? bricks in the stretch: a purple glowing bubble + ring (2K item bubbles)
  for(const it of sp.items){const d=Math.hypot(it.x-P[0][0],it.z-P[0][1]);if(d>S1+10)continue;const y=it.g.position.y,a=PR_at(P,L,0);put(M.bub,new THREE.SphereGeometry(2.3,16,12),it.x,y,it.z,0);put(M.ring,new THREE.TorusGeometry(2.4,.16,8,28),it.x,y,it.z,it.g.rotation.y||a.h);n++}
  const G=new THREE.Group();G.name='proto1';for(const[mat,L2]of B){const g=mergeGeometries(L2.map(x=>x),false);for(const x of L2)x.dispose();const me=new THREE.Mesh(g,mat);me.matrixAutoUpdate=false;me.updateMatrix();G.add(me)}G.add(PROTO.lg);
  // the stretch is the show: traffic and parked cars on the race line go (race-only, at start)
  try{if(typeof SIMP_clearTraffic==='function')for(let _k=0,_c=HUB.cars||[],c;_k<_c.length&&(c=_c[_k],true);_k++){if(c.dead||c.route||c.x==null)continue;for(let s=-30;s<S1;s+=10){const q=PR_at(P,L,s);if(Math.hypot(c.x-q.x,c.z-q.z)<hw+4){SIMP_clearTraffic(c.x,c.z,1);break}}}}catch(err){}
  if(PROTO.g)PR_drop();RO.grp.add(G);PROTO.g=G;PROTO.n=n;PROTO.draws=G.children.length;return G}
function PR_drop(){const G=PROTO.g;if(!G)return;RO.grp.remove(G);G.traverse(m=>{if(m.geometry)m.geometry.dispose()});PROTO.g=null;PROTO.n=0}
function PR_lights(sp){if(!PROTO.lights)return;const cd=sp.cd||0;PROTO.lights.forEach((l,i)=>{l.material=cd<=0?PROTO.M.lg:(3-cd)>=i*.55?PROTO.M.lr:PROTO.M.off})}
if(PROTO.on&&typeof tkStart==='function'){const _st=tkStart,_step=tkStep,_end=sprintEnd;
  tkStart=function(m,C0){const sp=_st.apply(this,arguments);try{if(sp&&sp.C===TK_C)PR_build(sp);else PR_drop()}catch(err){console.warn('proto1',err)}return sp};
  tkStep=function(dt){const r=_step.apply(this,arguments);try{const sp=RO.sp;if(PROTO.g&&sp)PR_lights(sp)}catch(err){}return r};
  sprintEnd=function(){PR_drop();return _end.apply(this,arguments)}}
