// low side views at 852x393: player car and nearest traffic car. node t/side.js <prefix> [page]
const {chromium,devices}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const pre=process.argv[2]||'shots/SD',page=process.argv[3]||'dev1/local_dbg.html';const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await (await b.newContext({...devices['iPhone 13'],viewport:{width:852,height:393},deviceScaleFactor:1})).newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8766/'+page);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
 await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>{__mho.storyClose&&__mho.storyClose();__mho.roamSim(20);window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{};window.requestAnimationFrame=()=>0});
 const r=await p.evaluate(()=>{const T=__dbg.THREE,c=__dbg.camera,m=__dbg.PL.mesh;m.updateMatrixWorld(true);const P=new T.Vector3(.3,.6,-7).applyMatrix4(m.matrixWorld),L=new T.Vector3(0,.6,0).applyMatrix4(m.matrixWorld);c.position.copy(P);c.lookAt(L);c.fov=40;c.updateProjectionMatrix();window.__fastR.call(__dbg.composer);return 1});
 await p.screenshot({path:pre+'_player.png'});
 const t=await p.evaluate(()=>{const T=__dbg.THREE,c=__dbg.camera,H=__mho.HUB,R=__mho.RO,m4=new T.Matrix4(),V=new T.Vector3(),Q=new T.Quaternion(),S=new T.Vector3();
  const cs=(H.cars||[]).filter(k=>!k.dead&&H.cim&&H.cim[k.k]).map(k=>({k,d:Math.hypot(k.x-R.x,k.z-R.z)})).sort((a,b)=>a.d-b.d);if(!cs.length)return 'notraffic';const k=cs[0].k,im=H.cim[k.k];
  im.getMatrixAt(k.j,m4);m4.premultiply(im.matrixWorld);m4.decompose(V,Q,S);const side=new T.Vector3(1,0,0).applyQuaternion(Q);c.position.copy(V).addScaledVector(side,7);c.position.y=V.y+.7;c.lookAt(V.x,V.y+.6,V.z);c.fov=40;c.updateProjectionMatrix();window.__fastR.call(__dbg.composer);return cs[0].d.toFixed(1)});
 await p.screenshot({path:pre+'_traffic.png'});console.log('traffic',t,'errs',JSON.stringify(errs));await b.close()})();
