// tGlossSweep (glossy-cars-r22e5): node tools/tGlossSweep.js <base url> <out prefix> <json list of GL.P overrides>  one boot, close + street shot per variant
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,VJ]=process.argv.slice(2);const V=JSON.parse(VJ);
const Q=(p,s)=>p.evaluate(src=>__tk.q(src),s);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(400000);
 await p.goto(BASE+'?test=fra');await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 await Q(p,`(()=>{window.__gsM=0;const cs=HUB.cars.filter(c=>!(c.dead>0)&&!c.pk).sort((a,b)=>Math.hypot(a.x-RO.x,a.z-RO.z)-Math.hypot(b.x-RO.x,b.z-RO.z));window.__gsC=cs[0];
  roamCam=(g=>function(){g.apply(this,arguments);if(__gsM===0){const h=RO.h,d=4.2;camera.position.set(RO.x+Math.sin(h+.75)*d,RO.y+1.55,RO.z+Math.cos(h+.75)*d);camera.lookAt(RO.x,RO.y+.55,RO.z)}else{const c=__gsC,h=Math.atan2(c.hdx,c.hdz);camera.position.set(c.x+Math.sin(h+.9)*7,c.y+2.6,c.z+Math.cos(h+.9)*7);camera.lookAt(c.x,c.y+.6,c.z)}})(roamCam);return 1})()`);
 for(let i=0;i<V.length;i++){await Q(p,`(()=>{Object.assign(__gl.GL.P,${JSON.stringify(V[i])});__gl.GL.id='';__gl.apply();__gsM=0;return 1})()`);await p.waitForTimeout(1200);await p.screenshot({path:OUT+i+'_car.png'});
  await Q(p,'(()=>{__gsM=1;return 1})()');await p.waitForTimeout(1200);await p.screenshot({path:OUT+i+'_street.png'})}await b.close();console.log('done',V.length)})();
