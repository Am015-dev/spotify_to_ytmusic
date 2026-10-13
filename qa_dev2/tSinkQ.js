// dev2 sink probe: ?test=fra&car=<id> fast start, REAL keys: gas 5 s, brake to stop, F (exit), wait 3 s on foot -> 4 tyre gaps (wheel bottom - road),
// lowest body corner gap (OF_gap), pitch/roll, + one shot per car.  node qa_dev2/tSinkQ.js <url .../local_dbg.html> <outdir> <car ids...>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const M=`(()=>{const ud=pl.mesh.userData,W=[];pl.mesh.updateMatrixWorld(true);ud.m.traverse(w=>{if(w.isMesh&&w.userData.r){let v=true,q=w;while(q&&q!==ud.m){if(!q.visible)v=false;q=q.parent}if(v)W.push(w)}});const A=new THREE.Vector3(),S=new THREE.Vector3();
 const e=new THREE.Euler().setFromQuaternion(pl.mesh.quaternion,'YXZ');const og=typeof OF_gap==='function'?OF_gap():null;
 return {foot:RO.foot,n:W.length,pitch:+(e.x*57.3).toFixed(1),roll:+(e.z*57.3).toFixed(1),tyre:W.map(w=>{w.getWorldPosition(A);w.getWorldScale(S);return +(A.y-w.userData.r*S.y-groundAt(A.x,A.z,A.y+1)).toFixed(3)}),body:og&&{min:og.min,max:og.max},settle:OF.n&&OF.n.settle}})()`;
(async()=>{const [,,url,out,...cars]=process.argv;fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const car of cars){const p=await (await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
  await p.goto(url+(url.includes('?')?'&':'?')+'test=fra'+(car==='default'?'':'&car='+car));for(let i=0;i<400;i++){if(await p.evaluate(()=>{if(window.__tick)try{__tick(20)}catch(e){}return !!(window.__tq&&__tq.ready)}))break;await p.waitForTimeout(300)}
  const tk=n=>p.waitForTimeout(n*1000/30);const hasT=await p.evaluate(()=>!!window.__tick);await tk(30);await p.mouse.click(426,40);await tk(10);await p.keyboard.down('ArrowUp');await tk(240);await p.keyboard.up('ArrowUp');const v0=await p.evaluate(()=>__mho.RO.v);
  await p.keyboard.down('ArrowDown');for(let i=0;i<60;i++){await tk(6);if(Math.abs(await p.evaluate(()=>__mho.RO.v))<.4)break}await p.keyboard.up('ArrowDown');await tk(30);
  const inCar=await p.evaluate(m=>__oc.ev(m),M);await p.keyboard.down('KeyF');await tk(2);await p.keyboard.up('KeyF');await tk(180);const foot=await p.evaluate(m=>__oc.ev(m),M);
  await p.screenshot({path:`${out}/sink_${car}.png`});console.log(car,'tick',hasT,'v',(v0*3.6).toFixed(0),'km/h | car',JSON.stringify(inCar),'| foot3s',JSON.stringify(foot),'| errs',errs.length);await p.close()}
 await b.close()})();
