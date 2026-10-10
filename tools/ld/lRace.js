// tools/ld/lRace.js <url> <outdir> [track=synt] : land-2 race-track palm check. Loads the track's race at 1280×720, resizes to 852×393, finds the
// palm instances (TInst of LDS.palm), shoots the nearest palm to the start AFTER, then BEFORE (old geometry swapped in, same camera); frame tris/calls.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [URL,OUT,TR]=process.argv.slice(2);const trk=TR||'synt';fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'||/LDS/.test(m.text()))errs.push(m.text().slice(0,200))});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:600000});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:600000});
 await p.evaluate(t=>__ld.lds.race(t),trk);await p.waitForFunction(()=>__ld.lds&&__ld.lds.palm,null,{timeout:600000});await p.waitForTimeout(8000);
 const r=await p.evaluate(()=>{const L=__ld.lds,THREE=__art.THREE,camera=L.cam(),ms=[];__art.scene.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.userData.ldsPalm)ms.push(o)});const M=new THREE.Matrix4(),v=new THREE.Vector3(),cp=camera.position;let best=null,bd=1e9,n=0;
  for(const o of ms)for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);v.setFromMatrixPosition(M);n++;const d=v.distanceTo(cp);if(d>8&&d<bd){bd=d;best=v.toArray()}}let ni=0;__art.scene.traverse(o=>{if(o.isInstancedMesh)ni++});return{meshes:ms.length,inst:ni,n,best,cp:cp.toArray(),st:L.st.palm}});
 console.log('PALM',JSON.stringify(r));if(!r.best){console.log('ERR no palm',JSON.stringify(errs.slice(0,6)));await b.close();return}await p.setViewportSize({width:852,height:393});await p.waitForTimeout(2000);const[x,y,z]=r.best;const cam=[x+14,y+5,z+10,x,y+6,z];
 for(const[off,nm]of[[0,'after'],[1,'before']]){await p.evaluate(o=>{const L=__ld.lds;L.palmOld=L.palmOld||L.palm0();__art.scene.traverse(m=>{if(m.isInstancedMesh&&m.geometry&&(m.geometry.userData.ldsPalm||m.geometry===L.palmOld)){m.userData.pNew=m.userData.pNew||m.geometry;m.geometry=o?L.palmOld:m.userData.pNew}})},off);
  await p.evaluate(c=>__gnb.cam(c),cam);await p.waitForTimeout(3000);const fr=await p.evaluate(()=>{const i=__art.renderer.info;i.autoReset=false;i.reset();return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const o={tris:i.render.triangles,calls:i.render.calls};i.autoReset=true;r(o)})))});
  await p.screenshot({path:`${OUT}/palm_${nm}.png`});console.log('shot',nm,`${OUT}/palm_${nm}.png`,'frame',JSON.stringify(fr))}
 console.log('ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
