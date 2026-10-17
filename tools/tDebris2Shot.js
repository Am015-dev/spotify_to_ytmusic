// tDebris2Shot (debris-2): node tools/tDebris2Shot.js <base url> <out png>  portrait; big green+black smash burst over the road beside the car, shot 0.5 s later
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(600000);
 await p.goto(BASE+'?test=fra');await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 await p.evaluate(()=>__tk.q(`(()=>{RO.v=14;K.KeyW=K.ArrowUp=true;const f=V3(Math.sin(RO.vh),0,Math.cos(RO.vh));debris(V3(RO.x,groundY(RO.x,RO.z)+1.5,RO.z).addScaledVector(f,9),V3(0,9,0),30,[new THREE.Color('#2e9b3a'),new THREE.Color('#222'),new THREE.Color('#2e9b3a')],1.5,groundY(RO.x,RO.z));return 1})()`));
 await p.waitForTimeout(500);await p.screenshot({path:OUT});await p.evaluate(()=>__tk.q(`K.KeyW=K.ArrowUp=false`));await b.close()})();
