// foliage-cam-1 (review 2K #9): instanced/AS trees whose crown (cylinder over the trunk, +2 m margin) holds the chase camera or a point 50-75 % of the way
// to the car are hidden (prop alive:false: AS LODs, smash and respawn skip it; tile instance zeroed, matrix remembered) and put back once the line has been
// clear 0.4 s. Throttled to 8 Hz, 3x3 prop-grid cells, roam car camera only. ?fcam=0 turns it off. NOT a wall/terrain fix: the 'foliage' GO hits on the
// Messe -> Mainkai road are building/road meshes without a roamHit collider (see docs/HANDOFF_fcam1.md).
const FC={on:!/[?&]fcam=0/.test(location.search),t:0,hid:[],M:new THREE.Matrix4(),Z:new THREE.Matrix4().makeScale(0,0,0),n:0,lift:0,hide:0};
function FC_crown(p){let c=p._fc;if(c)return c;const A=window.__as&&__as.A;let V=A&&p.av&&A.V&&A.V[p.av];if(V&&V.H&&V.rx&&V.cls!=='keep'){const a=p.cvs?p.cvs[0]:1,b=p.cvs?p.cvs[1]:1;return p._fc=[V.rx*a+2,p.y+V.H*b*.2,p.y+V.H*b]}
  const g=p.im&&p.im.geometry;if(!g)return p._fc=[0,0,0];if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;p.im.getMatrixAt(p.i,FC.M);const e=FC.M.elements,s=Math.hypot(e[4],e[5],e[6])||1,sx=Math.hypot(e[0],e[1],e[2])||1;
  const h=(b.max.y-b.min.y)*s;return p._fc=[Math.max(b.max.x-b.min.x,b.max.z-b.min.z)*.5*sx*.85,p.y+b.min.y*s+h*.35,p.y+b.max.y*s]}
// hidden = alive:false for the prop (the AS tree LODs, smash and respawn all skip dead props), its tile instance zeroed; AS_step is forced to refill
function FC_kick(){const A=window.__as&&__as.A;if(A)A.cx=1e9}
function FC_restore(all){let k=0;for(let i=FC.hid.length-1;i>=0;i--){const h=FC.hid[i],p=h.p;if(!all&&FC.t-h.t<.4)continue;FC.hid.splice(i,1);
  if(!p.im||p.im.count<=p.i)continue;try{p.alive=true;p.im.setMatrixAt(p.i,h.m);p.im.instanceMatrix.needsUpdate=true;k++}catch(e){}}if(k)FC_kick()}
function FC_step(){const c=camera.position,ox=RO.x,oy=RO.y+1,oz=RO.z;
  // sample points on the car -> camera line: camera, 75 %, 50 % of the way back (the 25 % point stays out: trunks near the car remain solid)
  const S=[[c.x,c.y,c.z],[ox+(c.x-ox)*.75,oy+(c.y-oy)*.75,oz+(c.z-oz)*.75],[ox+(c.x-ox)*.5,oy+(c.y-oy)*.5,oz+(c.z-oz)*.5]];
  const kx=Math.floor(c.x/16),kz=Math.floor(c.z/16);let k=0;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=HUB.pgrid&&HUB.pgrid.get((kx+a)*10000+kz+b);if(!l)continue;
    for(const p of l){if(!CVF_RX.test(p.t))continue;const f=p.alive===false?FC.hid.find(h=>h.p===p):null;if(p.alive===false&&!f)continue;const cr=FC_crown(p);if(!cr[0])continue;let hit=0;
      if((p.x-ox)**2+(p.z-oz)**2<9)continue;
      for(let q=0;q<3&&!hit;q++){const w=S[q];if(w[1]>cr[1]&&w[1]<cr[2]+.6&&(w[0]-p.x)**2+(w[2]-p.z)**2<cr[0]*cr[0])hit=1}
      if(!hit)continue;if(f){f.t=FC.t;continue}
      p.im.getMatrixAt(p.i,FC.M);FC.hid.push({p,m:FC.M.clone(),t:FC.t});p.alive=false;p.rt=1e9;p.im.setMatrixAt(p.i,FC.Z);p.im.instanceMatrix.needsUpdate=true;FC.hide++;k++}}
  if(k)FC_kick();FC_restore(false)}
roamCam=(f=>function(dt){f(dt);if(!FC.on||state!=='roam'||(RO.foot&&RO.foot!=='car')||(typeof M1!=='undefined'&&M1.cs)){if(FC.hid.length)FC_restore(true);return}
  // foliage over / around the camera
  FC.t+=dt;FC.n+=dt;if(FC.n>=.125){FC.n=0;try{FC_step()}catch(e){}}})(roamCam);
window.__fcam=FC;
