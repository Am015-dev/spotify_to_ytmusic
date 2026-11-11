// forces a 6-glaze courtyard (prisms on) and checks every rack button is fully on screen
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [w,h] of [[360,740],[740,360],[390,844],[844,390]]){const c=await b.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true});const p=await c.newPage();
await p.goto('file://'+__dirname+'/sunglaze.html');await p.waitForTimeout(1000);
await p.evaluate(()=>{localStorage.setItem('sgz_gfx','low');setSeed(11);AIDELAY=60;ANIM=0;UI.setup.np=2;UI.setup.seats[1]='ai';UI.setup.ex.prism=true;UI.coach=true});await p.click('[data-ui=start]');await p.click('[data-ui=story-ok]');
await p.waitForFunction(()=>!!me());await p.waitForTimeout(600);
await p.evaluate(()=>{PHN.seen.p1=1;G.ctr=[0,1,2,3,4,5,0];upd()});await p.waitForTimeout(500);
await p.evaluate(()=>{on3DPick({k:'ctr'})});await p.waitForTimeout(500);await p.evaluate(()=>{pickSel({src:-1,c:0,j:1})});await p.waitForTimeout(600);
const r=await p.evaluate(()=>{const o=[...document.querySelectorAll('#ph-pop button')].map(e=>{const r=e.getBoundingClientRect();return {n:(e.textContent||'').trim().slice(0,10),b:Math.round(r.bottom),min:Math.round(Math.min(r.width,r.height))}});return {mode:PHN.mode,vh:innerHeight,maxB:Math.max(...o.map(x=>x.b)),minT:Math.min(...o.map(x=>x.min)),n:o.length,chips:document.querySelectorAll('#ph-pop .ph-g').length}});
console.log(w+'x'+h,JSON.stringify(r),r.maxB<=r.vh&&r.minT>=44?'OK':'FAIL');await p.screenshot({path:`shots/many_${w}x${h}.png`});await c.close()}
await b.close()})()
