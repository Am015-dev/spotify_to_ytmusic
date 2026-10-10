// ===== GF (garage-18, Alex 2026-10-10: "lot of bugs in the garage: some are inside the floor ...").
// Root cause (audit g18/audit.js, docs/GARAGE_AUDIT.md): GS_fitY (98s) puts the platform under the lowest VISIBLE wheel, and it runs on the first
// garage frame after a new ride shows. Since v90b that frame is the build-up (98ba): the real ride meshes are hidden and the first batches are still
// falling 1.8 units up, so the platform was set from a wheel in mid-air (up to +1 m, ride sunk into the floor) or, with no wheel batch visible yet,
// reset to 0 (rides sunk 0.19 m; boats, which have no wheels, always). Only the ride opened first on a fresh garage stood right.
// Fix: measure the ride at rest (the hidden real meshes, never the falling batches), and with no wheel (boats, wheel-less builds) use the lowest
// point of the ride's own geometry.
const GF={n:0};
GS_fitY=(f=>function(){if(!GS.g||!GB.mesh)return f.apply(this,arguments);const sw=[];
 if(BA.on){for(const o of BA.hid)if(!o.visible){o.visible=true;sw.push([o,false])}for(const d of BA.G)if(d.g.visible){d.g.visible=false;sw.push([d.g,true])}}
 try{f.apply(this,arguments);if(GS.gy==null){GB.mesh.updateMatrixWorld(true);const B=new THREE.Box3(),b=new THREE.Box3();let k=0;
  GB.mesh.traverse(o=>{if(!o.isMesh||!o.userData||!o.userData.gb||o.userData.gbG||!o.geometry)return;for(let q=o;q;q=q.parent)if(!q.visible)return;
   const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();b.copy(g.boundingBox).applyMatrix4(o.matrixWorld);B.union(b);k++});
  if(k){const y=B.min.y;GS.g.position.y=clamp(y-GS.y0,-1,1);GS.gy=y}}GF.n++}
 finally{for(const[o,v]of sw)o.visible=v}})(GS_fitY);
// 2) "some have a dummy base": GB_attach (92) draws the bare-chassis plate under every build that has no catalogue wheel (CR_isW). A converted LDraw
// ride with its own LDraw tyres (3180 Tanker Cab) got that dark plate under its chassis, and the platform was fitted to the plate. A ride with
// imported LDraw parts carries its own chassis: no plate (the base ship stays hidden as before).
GB_plate=(f=>function(){const g=f.apply(this,arguments);GF.pg=g;return g})(GB_plate);
GB_attach=(f=>function(g,bricks,fig,cache,bp){GF.pg=null;const r=f.apply(this,arguments);try{if(bp&&GF.pg&&(bricks||[]).some(b=>b&&typeof b.t==='string'&&LD_MESH[b.t.split('@')[0]])){const U=g.userData,host=U.carG||U.m;
 U.gbM=(U.gbM||[]).filter(o=>{if(o.geometry!==GF.pg)return true;host.remove(o);o.geometry.dispose();GF.np=(GF.np||0)+1;return false})}}catch(e){console.warn('GF',e)}GF.pg=null;return r})(GB_attach);
window.__gf={st:()=>({n:GF.n,np:GF.np||0,gy:GS.gy,top:GS.g?GS.y0+GS.g.position.y:null})};
