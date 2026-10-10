// ===== WDOOR · test-only (build-6): doorway check for LDraw buildings. Lists every building prop (LDW + bank + LD_PROPS) with its door
// bricks' world box, and stands a game minifig (scaled to the 1.85 m humanoid height, like quest/pavement figures) in a door.
window.__wdoor={list:()=>{const out=[],q=[];for(const E of(__ld.w.on||[]))if(!E.water)q.push([E.id,E]);if(__ld.prop&&__ld.prop.X)q.push(['bank',__ld.prop]);for(const P of(__ld.props||[]))if(P.X)q.push([P.id,P]);
  for(const[id,E]of q){const D=E.B.filter(b=>{const Q=GB_PC[b.t];return Q&&/door/i.test(Q.n)&&!/frame/i.test(Q.n)}),F=E.B.filter(b=>{const Q=GB_PC[b.t];return Q&&/door/i.test(Q.n)&&/frame/i.test(Q.n)});
   const box=L=>{if(!L.length)return null;const g=__ld.grpLo(L,2),B=new THREE.Box3();g.updateMatrixWorld(true);g.traverse(c=>{if(c.isMesh){c.geometry.applyMatrix4(E.X);c.geometry.computeBoundingBox();B.union(c.geometry.boundingBox)}});return B};
   const d=box(D),f=box(F),src=d||f,dn=D.map(b=>GB_PC[b.t].n),fn=F.map(b=>GB_PC[b.t].n);
   out.push({id,at:E.at,door:src&&{min:src.min.toArray().map(v=>+v.toFixed(2)),max:src.max.toArray().map(v=>+v.toFixed(2)),h:+(src.max.y-src.min.y).toFixed(2)},names:[...new Set(dn.concat(fn))].slice(0,4)})}return out},
 fig:(x,y,z,yaw,h)=>{if(window.__wfig)scene.remove(__wfig);const f=minifig('#d22');if(f.userData.ex)f.userData.ex.visible=false;const B=new THREE.Box3();f.updateMatrixWorld(true);f.traverse(c=>{if(c.isMesh)B.expandByObject(c)});
  const raw=B.max.y-B.min.y,k=(h||1.85)/raw;f.scale.setScalar(k);f.position.set(x,y-B.min.y*k,z);f.rotation.y=yaw||0;scene.add(f);window.__wfig=f;return{raw:+raw.toFixed(2),h:+(raw*k).toFixed(2)}}};
