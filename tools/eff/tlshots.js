// v89q quick review: night/day roam shot (852x393) + low side view of the player car + rear-3/4 view of the nearest traffic car (camera only).
// usage: node tools/eff/tlshots.js <url local_dbg.html> <outprefix> <night|day>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const[,,url,out,tod]=process.argv;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
await p.goto(url);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(t=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_fl_tod',t==='day'?'0.5':'0.93')},tod);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:200});
await p.evaluate(t=>__oc.ev(`SET.tod="${t}"`),tod);for(let i=0;i<5;i++){const x=await p.$('button:has-text("CONTINUE")');if(x&&await x.isVisible()){await x.click();await p.waitForTimeout(800)}else break}
await p.keyboard.down('ArrowUp');await p.waitForTimeout(20000);await p.keyboard.up('ArrowUp');await p.waitForTimeout(1500);await p.screenshot({path:out+'_drive.png'});
await p.keyboard.down('Space');await p.keyboard.down('ArrowDown');await p.waitForTimeout(4000);await p.keyboard.up('ArrowDown');await p.keyboard.up('Space');await p.waitForTimeout(1500);
const cam=async(js,f)=>{await p.evaluate(js=>__oc.ev(`(()=>{const R0=window.__R0||(window.__R0=__dbg.composer.render);__dbg.composer.render=R0;${js};__dbg.composer.render();__dbg.composer.render=()=>{};return 1})()`),js);await p.screenshot({path:out+f})};
// low side view of the player car, 7 m to its right, 0.9 m up
await cam(`const fx=Math.sin(RO.h),fz=Math.cos(RO.h);camera.position.set(RO.x+fz*7,RO.y+.9,RO.z-fx*7);camera.lookAt(RO.x,RO.y+.6,RO.z)`,'_side.png');
// nearest traffic car, from behind-left 3/4, low
const tc=await p.evaluate(()=>__oc.ev(`(()=>{let best=null,bd=1e9;const m=new THREE.Matrix4(),v=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();for(const c of HUB.cars){if(c.dead>0)continue;const im=HUB.cim[c.k];im.getMatrixAt(c.j,m);m.decompose(v,q,s);if(s.x<.01)continue;const d=Math.hypot(v.x-RO.x,v.z-RO.z);if(d>3&&d<bd){bd=d;best={x:v.x,y:v.y,z:v.z,f:new THREE.Vector3(0,0,1).applyQuaternion(q),k:HCAR[c.k]}}}if(!best)return null;const f=best.f;camera.position.set(best.x-f.x*6.5-f.z*3,best.y+1.3,best.z-f.z*6.5+f.x*3);camera.lookAt(best.x,best.y+.7,best.z);__dbg.composer.render=window.__R0;__dbg.composer.render();__dbg.composer.render=()=>{};return best.k+' d='+bd.toFixed(1)})()`));
await p.screenshot({path:out+'_traffic.png'});
console.log('traffic',tc,'errs',JSON.stringify(errs));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
