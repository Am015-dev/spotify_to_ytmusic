# pSM3: Athens static city geometry goes to the GPU during the loading screen and its CPU copies are freed.
# Every non-instanced mesh of the city group whose geometry is used once (merged street/building batches, ground tiles)
# is drawn once with draw count 0 through a proxy mesh into a 1x1 target: three.js uploads its buffers and the
# onUpload callback drops the JS arrays (bounding volumes are computed first). Also: no first-sight upload hitches
# while driving, because nothing static is uploaded mid-drive any more. Instanced meshes (smashable props) are untouched.
exec(open('P.py').read())
R("async function roamLoad(atMark){","""const SM3={n:0,mb:0,ms:0,on:CID==='ath'&&(()=>{try{return localStorage.getItem('mho_sm3')!=='0'}catch(e){return true}})()};
async function SM_upload(a,b){if(!SM3.on||!HUB.grp||SM3.done)return;SM3.done=1;const t0=performance.now(),use=new Map(),L=[];
  HUB.grp.traverse(o=>{if(o.isMesh&&o.geometry)use.set(o.geometry,(use.get(o.geometry)||0)+1)});
  HUB.grp.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||o.userData.pw||!o.geometry||use.get(o.geometry)!==1)return;const g=o.geometry;
    if(g.morphAttributes&&Object.keys(g.morphAttributes).length)return;const P=g.attributes.position;if(!P||!P.array||P.isInterleavedBufferAttribute)return;L.push(g)});
  const sc=new THREE.Scene(),mt=new THREE.MeshBasicMaterial(),rt=new THREE.WebGLRenderTarget(1,1),prev=renderer.getRenderTarget(),rel=function(){SM3.mb+=this.array.byteLength;this.array=null};
  let t=performance.now(),i=0;
  try{while(i<L.length){const B=L.slice(i,i+120),dr=[];i+=B.length;
    for(const g of B){if(!g.boundingSphere)g.computeBoundingSphere();if(!g.boundingBox)g.computeBoundingBox();for(const k in g.attributes)g.attributes[k].onUpload(rel);if(g.index)g.index.onUpload(rel);
      dr.push(g.drawRange.count);g.drawRange.count=0;const m=new THREE.Mesh(g,mt);m.frustumCulled=false;sc.add(m)}
    renderer.setRenderTarget(rt);renderer.render(sc,camera);renderer.setRenderTarget(prev);
    B.forEach((g,k)=>{g.drawRange.count=dr[k]});sc.clear();SM3.n+=B.length;
    if(performance.now()-t>12){if(a!=null)ldSet(a+(b-a)*i/L.length,'Loading the city into the GPU');await nextFrame();t=performance.now()}}}
  finally{renderer.setRenderTarget(prev);rt.dispose();mt.dispose()}SM3.ms=Math.round(performance.now()-t0)}
async function roamLoad(atMark){""")
R("ldSet(.8,'Painting the sky');await nextFrame();await ldPrewarm(.82,.98);",
  "ldSet(.8,'Painting the sky');await nextFrame();await ldPrewarm(.82,.95);await SM_upload(.95,.99);")
R("window.__mho={","window.__sm3=SM3;\nwindow.__mho={")
save()
