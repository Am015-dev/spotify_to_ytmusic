// tOB_euro: the Euro-Skulptur in Frankfurt is a € (bbox ~14 m tall, merged = no extra draw call) + a daylight screenshot from ~35 m.
// OUT=shots/ob_euro_after.jpg (default) ; BEFORE=1 skips the hook checks (for the unpatched base build).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const F=require('./fast.js');
const U='http://127.0.0.1:8766/w_euro/local_dbg.html',OUT=process.env.OUT||'shots/ob_euro_after.jpg',BEFORE=!!process.env.BEFORE,D=+(process.env.DIST||34);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fails=0;const ok=(c,m,o)=>{console.log((c?'PASS ':'FAIL ')+m+(o?' '+JSON.stringify(o):''));if(!c)fails++};
 const p=await (await b.newContext({viewport:{width:960,height:540}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.setDefaultTimeout(900000);
 await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1','fra');localStorage.setItem('mho_roam@1','{"tut":1,"otg":{}}')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
 await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:500});await F.on(p);
 await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}try{window.__m1&&__m1.skip&&__m1.skip()}catch(e){}});
 const L=await p.evaluate(()=>__mho.lm().find(l=>l.name==='Euro-Skulptur'));ok(!!L,'Euro-Skulptur landmark exists',L);
 if(!BEFORE){const e=await p.evaluate(()=>window.__ob&&__ob.euro());ok(!!e,'__ob.euro() hook returns the sculpture',e);
  ok(e&&e.size[1]>=13&&e.size[1]<=15,'sculpture bbox height 13-15 m',e&&e.size);ok(e&&Math.abs(e.x-L.x)<.01&&Math.abs(e.z-L.z)<.01,'same position as the landmark');ok(e&&e.drawCalls<=3,'<=3 draw calls',e&&{drawCalls:e.drawCalls,extra:e.extraDrawCalls});
  // collider: drive the car at the plinth from 20 m, it must not pass through
  const c=await p.evaluate(([x,z])=>{const M=__mho,R=M.RO,K=M.K;M.warp(x,z+20,Math.PI,true);M.roamSim(5);K.ArrowUp=true;let minD=1e9;for(let i=0;i<240;i++){M.roamSim(1);minD=Math.min(minD,Math.abs(R.z-z)+(Math.abs(R.x-x)>3.4?99:0))}K.ArrowUp=false;M.roamSim(5);return{minD:+minD.toFixed(2),endZ:+(R.z-z).toFixed(2),endX:+(R.x-x).toFixed(2)}},[L.x,L.z]);
  ok(c.endZ>0&&c.minD>1.5,'car cannot drive through the base',c)}
 const pos=await p.evaluate(([x,z,D])=>{const M=__mho,R=M.RO;M.warp(x-14,z+D+12,Math.PI,true);M.roamSim(20);return{dx:+(R.x-x).toFixed(1),dz:+(R.z-z).toFixed(1),gy:+M.gnd(x,z+D,99).toFixed(2)}},[L.x,L.z,D]);console.log('INFO car',JSON.stringify(pos));
 // pin the camera ~D m in front of the sculpture (the roam chase cam drifts): wrap the real render for this one shot
 await F.off(p);await p.evaluate(([x,z,D,gy])=>{const C=__dbg.composer,o=C.render,cam=__dbg.camera;window.__obR=o;C.render=function(...a){cam.position.set(x+4,gy+4.5,z+D);cam.lookAt(x,gy+7,z);cam.updateMatrixWorld();return o.apply(C,a)}},[L.x,L.z,D,pos.gy]);
 await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.screenshot({path:OUT,type:'jpeg',quality:82,timeout:600000});
 await p.evaluate(()=>{__dbg.composer.render=window.__obR});
 console.log('shot',OUT);
 ok(!errs.length,'no page errors',errs.slice(0,3));console.log(fails?`FAILED ${fails}`:'ALL PASS');await b.close();process.exit(fails?1:0)})();
