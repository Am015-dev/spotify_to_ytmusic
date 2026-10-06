(()=>{const M=__mho,D=__dbg,T=D.THREE,R=M.RO;
window.__A6={
 road(){const N=M.HUB.nodes;let best=null;for(let i=0;i<N.length;i++){const a=N[i];if(!a||!a.nb||!a.nb.length)continue;const d=Math.hypot(a.x-R.x,a.z-R.z);if(d<120||d>700)continue;for(const j of a.nb){const b=N[j];const L=Math.hypot(b.x-a.x,b.z-a.z);if(L>90&&(!best||d<best.d))best={d,a,b,L}}}
   const {a,b}=best,h=Math.atan2(b.x-a.x,b.z-a.z),x=a.x+(b.x-a.x)*.4,z=a.z+(b.z-a.z)*.4;M.warp(x,z,h,true);R.x=x;R.z=z;R.h=h;R.v=0;return{x,z,h,L:best.L}},
 tyres(){const s=M.pl;s.mesh.updateMatrixWorld(true);const ms=[];s.mesh.traverse(o=>{let v=true;for(let a=o;a;a=a.parent)if(!a.visible){v=false;break}if(!o.isMesh||!v||!o.geometry||(o.material&&o.material.transparent))return;const b=new T.Box3().setFromObject(o,true);ms.push({o,b})});
   const minY=Math.min(...ms.map(m=>m.b.min.y));const low=ms.filter(m=>m.b.min.y<minY+.08);
   // cluster the lowest meshes into tyres by position
   const cl=[];for(const m of low){const c=m.b.getCenter(new T.Vector3());let k=cl.find(q=>Math.hypot(q.x-c.x,q.z-c.z)<.6);if(!k){k={x:c.x,z:c.z,y:m.b.min.y,n:0};cl.push(k)}k.y=Math.min(k.y,m.b.min.y);k.n++}
   const rc=new T.Raycaster();rc.far=3;const objs=[];D.scene.traverse(o=>{if(o.isMesh&&o.visible&&!o.material.transparent){let c=false;for(let a=o;a;a=a.parent)if(a===s.mesh){c=true;break}if(!c)objs.push(o)}});
   return cl.map(k=>{rc.set(new T.Vector3(k.x,k.y+.6,k.z),new T.Vector3(0,-1,0));const h=rc.intersectObjects(objs,false)[0];return{x:+k.x.toFixed(2),z:+k.z.toFixed(2),tyreY:+k.y.toFixed(3),roadY:h?+h.point.y.toFixed(3):null,gap:h?+(k.y-h.point.y).toFixed(3):null,hit:h?(h.object.name||h.object.type):null}})},
 cam(mode){if(!D.__or){D.__or=D.composer.render.bind(D.composer);D.composer.render=function(){const c=window.__cam;if(c){const P=c();D.camera.position.set(P[0],P[1],P[2]);D.camera.lookAt(P[3],P[4],P[5]);D.camera.updateMatrixWorld()}return D.__or.apply(this,arguments)}}
   const gy=(x,z)=>M.gnd(x,z,R.y+2);
   if(mode==='player')window.__cam=()=>{const s=Math.sin(R.h),c=Math.cos(R.h),x=R.x+c*4,z=R.z-s*4;return[x,gy(x,z)+.5,z,R.x,R.y+.45,R.z]};
   else if(mode==='traffic'){const m4=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),sc=new T.Vector3();let b=null,bd=1e9;for(const c of M.HUB.cars){if(c.dead>0)continue;const d=Math.hypot(c.x-R.x,c.z-R.z);if(d<bd&&d>10&&d<200){bd=d;b=c}}window.__tc=b;
     window.__cam=()=>{const c=window.__tc,im=M.HUB.cim[c.k];im.getMatrixAt(c.j,m4);m4.decompose(p,q,sc);const r=new T.Vector3(1,0,0).applyQuaternion(q).setY(0).normalize(),x=p.x+r.x*4,z=p.z+r.z*4;return[x,gy(x,z)+.5,z,p.x,p.y+.5,p.z]}}
   else if(mode==='high')window.__cam=()=>{const s=Math.sin(R.h),c=Math.cos(R.h);return[R.x-s*7+c*3,R.y+3.2,R.z-c*7-s*3,R.x,R.y+.3,R.z]};
   else window.__cam=null;return mode}};return 'ok'})()
