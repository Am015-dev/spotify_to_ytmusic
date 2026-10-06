// pilot close-ups on the player car: node t/pi.js <prefix> [page]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const pre=process.argv[2]||'shots/PI',page=process.argv[3]||'local_dbg.html',fig=process.argv[4];
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
 await p.goto('http://127.0.0.1:8766/'+page);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(f=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(f)localStorage.setItem('mho_gbfig@1',f)},fig);
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>{__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam',null,{timeout:300000});await p.evaluate(()=>{__mho.storyClose&&__mho.storyClose();window.__m1&&__m1.skip&&__m1.skip()});
 await p.evaluate(()=>{window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{};__mho.roamSim(30);window.requestAnimationFrame=()=>0});await p.waitForTimeout(500);
 const V={front:[3.2,2.0,.2],fq:[2.4,2.3,-1.9],side:[.2,1.9,-3.4],back34:[-2.6,3.0,2.0],car:[.6,1.5,-6.5],face:[2.2,1.8,-.5]};const TT={car:[.6,1.0,0]};
 for(const k in V){await p.evaluate(([v,k,t])=>{const m=__mho.pl.mesh;m.updateMatrixWorld(true);const c=__dbg.camera,T=new __dbg.THREE.Vector3(...(t||[.1,1.75,0]));const P=new __dbg.THREE.Vector3(...v);m.localToWorld(P);m.localToWorld(T);c.position.copy(P);c.lookAt(T);c.fov=k==='face'?20:40;c.updateProjectionMatrix();window.__fastR.call(__dbg.composer)},[V[k],k,TT[k]||(k==='face'?[.2,1.62,0]:null)]);
  await p.screenshot({path:`${pre}_${k}.png`})}
 console.log('errs',JSON.stringify(errs));await b.close()})();
