// truck.js <url> <out>: free roam Frankfurt, build the LEGO city truck kinds next to the player (orange / green paint) and shoot side, 3/4 front, rear
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){window.__err=String(e)}}}return t};
 setInterval(()=>{if(window.__dbg&&!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
(async()=>{const [URL,OUT]=process.argv.slice(2);const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true});await ctx.addInitScript(INIT);const p=await ctx.newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(3000);await p.evaluate(()=>{window.__auto=false});
const info=await p.evaluate(()=>{const {THREE,scene,RO}=__dbg;const out=[];window.__TR=[];let i=0;for(const [nm,col] of [['truck','#ff7a1c'],['delivery','#2a7ad8'],['garbage-truck','#ffffff']]){const G=__CG(nm);if(!G){out.push(nm+' null');continue}const grp=new THREE.Group();
  const mk=(g,m,c)=>{const im=new THREE.InstancedMesh(g,m,1);im.setMatrixAt(0,new THREE.Matrix4());if(c){im.setColorAt(0,new THREE.Color(c))}grp.add(im)};const WM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:0});
  mk(G.body,__CCM,col);mk(G.wheels,WM);if(G.glass)mk(G.glass,WM);const h=RO.h;grp.position.set(RO.x+Math.sin(h)*30+Math.cos(h)*i*6,RO.y+.02,RO.z+Math.cos(h)*30-Math.sin(h)*i*6);grp.rotation.y=h;scene.add(grp);window.__TR.push(grp);i++;
  out.push(nm+' tris '+((G.body.index?G.body.index.count:G.body.attributes.position.count)/3|0))}return out});console.log(info);
const shot=async(tag,fn,a)=>{await p.evaluate(fn,a);await p.evaluate(()=>__fastR.call(__dbg.composer));await p.screenshot({path:`${OUT}_${tag}.png`})};
await p.evaluate(()=>{document.querySelectorAll('#hud,.hud,#tc,#touch').forEach(e=>e.style.visibility='hidden')});
for(let k=0;k<3;k++){
 await shot(k+'side',k=>{const {camera,RO}=__dbg;const g=__TR[k];const h=RO.h,rx=Math.cos(h),rz=-Math.sin(h);camera.position.set(g.position.x-rx*11,g.position.y+2.2,g.position.z-rz*11);camera.lookAt(g.position.x,g.position.y+1.6,g.position.z)},k);
 await shot(k+'front34',k=>{const {camera,RO}=__dbg;const g=__TR[k];const h=RO.h,fx=Math.sin(h),fz=Math.cos(h),rx=Math.cos(h),rz=-Math.sin(h);camera.position.set(g.position.x+fx*9-rx*6,g.position.y+3,g.position.z+fz*9-rz*6);camera.lookAt(g.position.x,g.position.y+1.5,g.position.z)},k);
}
console.log('errs',errs);await br.close()})();
