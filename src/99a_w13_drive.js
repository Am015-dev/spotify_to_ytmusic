// ==== W13 (worker 13, v87o): see-through traffic + speed feel ====
// 1) "Traffic cars are transparent": SC real-scale (96) shrinks a too-big traffic model by cloning+scaling ONLY the body geometry
//    (im.geometry). The dark parts (windows, black chassis/frame, CR_isDark bricks → im.userData.g) and the tyres (im.userData.w) kept
//    the full size, so trucks, delivery and garbage trucks (body ×0.63-0.66) drove around as a full-size black skeleton + wheels with a small
//    white box floating inside: you look straight through them. Vans/SUVs had the same mismatch, only smaller. Fix: give the glass and wheel
//    instances exactly the body's per-axis scale+offset (measured from the original CR_cityGeo body), right after the traffic is built,
//    before ART8 makes its shadow twins from those geometries.
function W13_trafFit(){if(!HUB.cim)return;const b0=new THREE.Box3(),b1=new THREE.Box3();
 HCAR.forEach((nm,k)=>{const im=HUB.cim[k];if(!im||im.userData.w13)return;im.userData.w13=1;const G=nm[0]==='#'?null:CR_cityGeo(nm);if(!G||im.geometry===G.body)return;
  b0.setFromBufferAttribute(G.body.attributes.position);b1.setFromBufferAttribute(im.geometry.attributes.position);
  const s=new THREE.Vector3(),t=new THREE.Vector3();for(const a of['x','y','z']){const d=b0.max[a]-b0.min[a];s[a]=d>1e-6?(b1.max[a]-b1.min[a])/d:1;t[a]=b1.min[a]-b0.min[a]*s[a]}
  if(Math.abs(s.x-1)+Math.abs(s.y-1)+Math.abs(s.z-1)+t.length()<1e-4)return;
  for(const q of[im.userData.w,im.userData.g])if(q&&q.geometry){q.geometry=q.geometry.clone().scale(s.x,s.y,s.z).translate(t.x,t.y,t.z);q.geometry.computeBoundingBox();q.geometry.computeBoundingSphere()}
  W13.fit.push([nm,+s.x.toFixed(3),+s.y.toFixed(3),+s.z.toFixed(3)])})}
const W13={fit:[]};
buildHubTraffic=(f=>function(){const r=f.apply(this,arguments);try{W13_trafFit()}catch(e){console.warn('W13 traffic fit',e)}return r})(buildHubTraffic);
