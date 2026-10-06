// coupe.js <url> <out.png>: roam, a red coupe (CR_car) parked beside the player, low side + 3/4 views of its glass and driver
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [URL,OUT]=process.argv.slice(2);const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);
await p.goto(URL);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam',null,{polling:500});await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(2500);
await p.evaluate(()=>{for(const id of['m1Next','m1Skip']){const b=document.getElementById(id);if(b&&b.getClientRects().length)b.click()}window.requestAnimationFrame=()=>0;__ju.autoClose(true);__ju.step(5)});
const views=[[3.6,.9,0],[3.0,1.4,2.6],[2.2,1.0,-3.2]];
for(let k=0;k<views.length;k++){await p.evaluate(v=>{const D=__dbg,R=D.RO,T=D.THREE,fx=Math.sin(R.h),fz=Math.cos(R.h),rx=Math.cos(R.h),rz=-Math.sin(R.h);
 if(!window.__cp){const x=R.x+rx*4,z=R.z+rz*4;window.__cp=__cr25.demo(x,D.GY(x,z),z,R.h+Math.PI)}const g=window.__cp,c=D.camera;const ctr=g.position.clone().add(new T.Vector3(0,.7,0));
 c.position.set(ctr.x+rx*v[0]+fx*v[2],ctr.y+v[1]-.4,ctr.z+rz*v[0]+fz*v[2]);c.lookAt(ctr);c.fov=48;c.updateProjectionMatrix();D.SS();D.composer.render()},views[k]);await p.screenshot({path:OUT.replace('.png','_'+k+'.png')})}
await br.close()})();
