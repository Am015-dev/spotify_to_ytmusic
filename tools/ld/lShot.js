// tools/ld/lShot.js <url> <outdir> <type,type,..> : land-3 driver-view before/after shots of LDS prop swaps at 852×393 (CITY=ath for Athens).
// Per type: an instance near the start with a clear view (ray camera->prop hits that instance first, ray prop->camera hits nothing: not inside a
// building), camera 1.5 m above the prop's base, 6-10 m away (more for tall props), prop centred; AFTER, then BEFORE (__ld.ldsAB(1)), HUD hidden.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [URL,OUT,TY]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});const city=process.env.CITY||'fra';
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();p.setDefaultTimeout(1500000);const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'||/LDS/.test(m.text()))errs.push(m.text().slice(0,200))});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:600000});
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_roam.ath@1',JSON.stringify({tut:1,otg:{}}))}},city);
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:600000});
 await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{timeout:1500000});
 await p.evaluate(()=>{__mho.storyClose&&__mho.storyClose();try{__ju.autoClose(true)}catch(e){}});await p.waitForFunction(()=>__ld.lds&&__ld.lds.st,null,{timeout:300000});
 await p.setViewportSize({width:852,height:393});await p.waitForTimeout(2000);
 await p.evaluate(()=>{const cv=__art.renderer.domElement;for(const e of document.body.querySelectorAll('*'))if(e!==cv&&!e.contains(cv))e.style.visibility='hidden'});
 for(const t of TY.split(',')){
  const r=await p.evaluate(([t,camy])=>{const THREE=__art.THREE,D=__mho.HUB.ptypes[t];if(!D||!D.lds)return{err:'no swap '+t};const ms=[];__mho.HUB.grp.traverse(o=>{if(o.isInstancedMesh&&(o.geometry===D.g||o.geometry===D.gFar))ms.push(o)});
   D.g.computeBoundingBox();const h=D.g.boundingBox.max.y-D.g.boundingBox.min.y,sz=Math.max(D.g.boundingBox.max.x-D.g.boundingBox.min.x,D.g.boundingBox.max.z-D.g.boundingBox.min.z);
   const x0=__mho.RO?__mho.RO.x:2061,z0=__mho.RO?__mho.RO.z:0,M=new THREE.Matrix4(),S=new THREE.Vector3(),Q=new THREE.Quaternion(),c=[];
   for(const o of ms)for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);const P=new THREE.Vector3();M.decompose(P,Q,S);if(S.x<.05)continue;c.push({o,i,P,Q:Q.clone(),s:S.y,d:Math.hypot(P.x-x0,P.z-z0)})}
   c.sort((a,b)=>a.d-b.d);const R=new THREE.Raycaster(),objs=[];R.camera=__ld.lds.cam();__art.scene.traverseVisible(o=>{const g=o.geometry;if(!o.isMesh||!g||!g.attributes.position||!g.attributes.position.array||(g.index&&!g.index.array))return;for(const k in g.attributes)if(!g.attributes[k].array)return;objs.push(o)});// meshes with CPU data (some arrays are freed after upload)
   let tried=0;
   for(const q of c.slice(0,80)){const H=h*q.s,Dd=Math.max(7,H*1.3,sz*q.s*2),ty=q.P.y+Math.min(H*.45,1.2+H*.3),tgt=new THREE.Vector3(q.P.x,ty,q.P.z);
    const bx=D.g.boundingBox,lx=bx.max.x-bx.min.x>bx.max.z-bx.min.z,yaw=new THREE.Euler().setFromQuaternion(Q.copy(q.Q)).y,a0=-yaw+(lx?Math.PI/2:0);// long props (barrier): look across the long side first
    for(let k=0;k<12;k++){tried++;const a=a0+[0,6,1,5,7,11,2,4,8,10,3,9][k]*Math.PI/6,cam=new THREE.Vector3(q.P.x+Math.cos(a)*Dd,q.P.y+camy,q.P.z+Math.sin(a)*Dd),dir=tgt.clone().sub(cam),L=dir.length();dir.normalize();
     R.set(cam,dir);R.far=L+sz*q.s;const h1=R.intersectObjects(objs,false).find(x=>x.object.visible);if(!h1||h1.object!==q.o||h1.instanceId!==q.i)continue;
     R.set(tgt,dir.clone().negate());R.far=L;const h2=R.intersectObjects(objs,false).filter(x=>x.object!==q.o&&x.object.visible&&!x.object.isSprite);if(h2.length)continue;
     return{cam:[cam.x,cam.y,cam.z,tgt.x,tgt.y,tgt.z],at:[q.P.x,q.P.y,q.P.z].map(v=>+v.toFixed(1)),H:+H.toFixed(2),D:+Dd.toFixed(1),tried,n:c.length}}}
   return{err:'no clear view',tried,n:c.length}},[t,+process.env.CAMY||1.5]);
  console.log('SPOT',t,JSON.stringify(r));if(r.err)continue;
  for(const[off,nm]of[[0,'after'],[1,'before']]){await p.evaluate(o=>__ld.ldsAB(o),off);await p.evaluate(c=>__gnb.cam(c),r.cam);await p.waitForTimeout(2500);await p.screenshot({path:`${OUT}/${t}_${nm}.png`});console.log('shot',`${OUT}/${t}_${nm}.png`)}
  await p.evaluate(()=>__ld.ldsAB(0))}
 console.log('ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
