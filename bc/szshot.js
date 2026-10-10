// bc/szshot.js <url> <out> [ids]: roam (API), each ride built like a roam ship (shipMesh + SC_ship), parked with a traffic car + a minifig,
// 852x393 low side shot + world W/L/H (m). Lines "SZ id {...}" are the numbers.
const E=require('./enter.js');const OUT=process.argv[3];require('fs').mkdirSync(OUT,{recursive:true});
const IDS=(process.argv[4]||'rod,t_rally,t_bus,t_truck,t_limo,t_mt,t_v3221_1,t_v3180_1,t_v60059_1,t_v60083_1,t_v60017_1,t_v7639_1,t_v4914_1,t_v3179_1,t_v60054_1,t_v7731_1,t_v4436_1,t_v30313_1,t_v30572_1').split(',');
(async()=>{const T=await E(process.argv[2],{gfx:process.env.GFX||'normal'});const{p,ev}=T;await T.roamApi();console.log('roam');await p.evaluate(()=>document.querySelectorAll('body *').forEach(e=>{if(e.tagName!=='CANVAS'&&!e.querySelector('canvas'))e.style.visibility='hidden'}));
 const prep=await ev(`(()=>{const R=RO;let tr=null,bd=1e9;scene.traverse(o=>{if(o.userData&&o.userData.trf&&o.visible){const d=Math.hypot(o.position.x-R.x,o.position.z-R.z);if(d<bd){bd=d;tr=o}}});
  window.__szT=CR_npcVeh("sedan","#c8323c");pl.mesh.visible=false;return {tr:!!tr,x:R.x,z:R.z}})()`);console.log('prep',JSON.stringify(prep));
 for(const id of IDS){const r=await p.evaluate(async id=>{const S=__g9ev('GAR_set('+JSON.stringify(id)+')');if(!S)return{err:'noset'};await __ld.need(__ld.probe(()=>S.car()));
  return __g9ev(`(()=>{const S=GAR_set(${JSON.stringify(id)}),B=G9C_bricks(S,'car');const old=window.__szG;if(old)for(const o of old)o.parent&&o.parent.remove(o);
   const t=gbTeam(TEAMS[teamIdx],Object.assign({},GB.d,{on:1,bricks:B,bp:1}));const g=shipMesh(t);const U=g.userData;U.boat.visible=false;U.wheels.visible=false;U.shield.visible=false;U.under.visible=false;U.shadow.visible=false;for(const rb of U.ribbons||[])rb.visible=false;
   const R=RO,x=R.x,z=R.z,h=R.h,fx=Math.sin(h),fz=Math.cos(h),qx=fz,qz=-fx;g.rotation.y=h;scene.add(g);SC_ship(g,false);g.updateMatrixWorld(true);
   const Bx=new THREE.Box3();g.traverse(o=>{if(o.isMesh&&o.visible){let v=1;for(let q=o;q;q=q.parent)if(!q.visible)v=0;if(v)Bx.expandByObject(o)}});
   const gy=groundY(x,z);g.position.y+=gy-Bx.min.y;g.updateMatrixWorld(true);
   // size in the ride's own axes (local box × world scale)
   const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),L=new THREE.Box3(),ws=new THREE.Vector3();U.m.getWorldScale(ws);
   g.traverse(o=>{if(o.isMesh&&o.visible){let v=1;for(let q=o;q;q=q.parent)if(!q.visible)v=0;if(!v)return;o.geometry.computeBoundingBox();L.union(o.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld)))}});
   const _g2=__ld.grp(B.filter(b=>b.t!=='drvM')),_b2=new THREE.Box3().setFromObject(_g2).getSize(new THREE.Vector3()).multiply(ws);const sz=L.getSize(new THREE.Vector3()),half=sz.z/2;const objs=[g];
   let tc=null;if(window.__szT){tc=window.__szT.clone();tc.visible=true;tc.position.set(x+fx*(half+3.6),0,z+fz*(half+3.6));tc.rotation.y=h;scene.add(tc);tc.updateMatrixWorld(true);const tb=new THREE.Box3().setFromObject(tc);tc.position.y+=groundY(tc.position.x,tc.position.z)-tb.min.y;objs.push(tc);tc.updateMatrixWorld(true);const ts=new THREE.Box3().setFromObject(tc).getSize(new THREE.Vector3());tc={W:+Math.min(ts.x,ts.z).toFixed(2),L:+Math.max(ts.x,ts.z).toFixed(2),H:+ts.y.toFixed(2)}}
   const f=minifig('#2f7de1');f.userData.ex&&(f.userData.ex.visible=false);const mx=x-fx*(half+1.2)+qx*.3,mz=z-fz*(half+1.2)+qz*.3;f.position.set(mx,groundY(mx,mz),mz);f.rotation.y=h+Math.PI/2;{const b0=new THREE.Box3().setFromObject(f);f.scale.multiplyScalar(1.9/(b0.max.y-b0.min.y));}scene.add(f);objs.push(f);
   const fb=new THREE.Box3().setFromObject(f);window.__szG=objs;
   const D=Math.max(9,sz.z*1.05+4);__gnb.cam([x+qx*D,gy+1.1,z+qz*D,x+fx*1.5,gy+Math.min(sz.y*.45,2),z+fz*1.5]);
   return{W:+_b2.x.toFixed(2),L:+_b2.z.toFixed(2),H:+_b2.y.toFixed(2),boxWLH:[sz.x,sz.z,sz.y].map(v=>+v.toFixed(2)),k:U.szK,ws:ws.toArray().map(v=>+v.toFixed(3)),fig:+(fb.max.y-fb.min.y).toFixed(2),traffic:tc}})()`)},id);
  console.log('SZ',id,JSON.stringify(r));await p.waitForTimeout(+process.env.SW||2500);await p.screenshot({path:`${OUT}/${id}.png`})}
 console.log('ERR',JSON.stringify(T.errs.filter(e=>!/GPU stall|GL Driver/.test(e)).slice(0,6)));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
