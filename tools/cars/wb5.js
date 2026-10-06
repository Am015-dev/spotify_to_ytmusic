// wb5.js <url> <out>: race, at speed put opponents at the chase camera (8-10.5 m behind the player) and shoot
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){window.__err=String(e)}}}return t};
 setInterval(()=>{if(window.__dbg&&!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
(async()=>{const [URL,OUT]=process.argv.slice(2);const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true});await ctx.addInitScript(INIT);const p=await ctx.newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{window.__auto=false});await p.evaluate(()=>__dbg.RS('quick'));
const tick=n=>p.evaluate(n=>__tick(n),n);const K=p.keyboard;await K.down('ArrowUp');await tick(240);for(let i=0;i<8;i++)await tick(60);
for(const [k,back,lat] of [[0,9.5,0],[1,8,.8],[2,6.5,-.6],[3,5,0]]){const d=await p.evaluate(([back,lat])=>{const P=__dbg.PL,A=__dbg.SH.filter(s=>!s.isPlayer)[0];A.dist=P.dist-back;A.x=P.x+lat;A.v=P.v;__tick(1);A.dist=P.dist-back;A.x=P.x+lat;__tick(1);__dbg.SS();__fastR.call(__dbg.composer);return{cam:A.mesh.position.distanceTo(__dbg.camera.position),vis:A.mesh.visible}},[back,lat]);
 await p.screenshot({path:`${OUT}_${k}_b${back}.png`});console.log(k,back,JSON.stringify(d))}
console.log('errs',errs);await br.close()})();
