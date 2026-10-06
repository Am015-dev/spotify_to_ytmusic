// offroad.js <url> <out>: start the first mission (Hot Drop) with real taps, cruise at full throttle, then steer off the road onto grass; log speed + off-route factor
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [URL,OUT]=process.argv.slice(2);const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(600000);
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(2500);
await p.tap('#m1Next');await p.waitForTimeout(2500);for(let i=0;i<3;i++){await p.evaluate(()=>{const b=document.getElementById('m1Skip');if(b&&b.getClientRects().length)b.click()});await p.waitForTimeout(1500)}
await p.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true)});
const K=p.keyboard;const st=n=>p.evaluate(n=>{__ju.step(n);const R=__dbg.RO;return{kmh:+(R.v*3.6).toFixed(0),off:+(R.v85o??1).toFixed(2),terr:R.terr,veh:R.veh,fit:R.fit,ch:!!R.ch}},n);let si=0;const shot=async tag=>{await p.evaluate(()=>{__dbg.SS&&__dbg.SS();try{__dbg.composer.render()}catch(e){}});await p.screenshot({path:`${OUT}_${String(si++).padStart(2,'0')}_${tag}.png`})};
await K.down('ArrowUp');const L=[];for(let i=0;i<40;i++){const r=await st(15);L.push(r)}// on route 10 s
await shot('onroute');await K.down('ArrowLeft');await st(40);await K.up('ArrowLeft');for(let i=0;i<24;i++){const r=await st(15);L.push(r);const pc=await p.evaluate(()=>JSON.stringify(__lk.pools())+' vm '+__dbg.PL.vmode);if(i>=14&&i<=22){console.log(i,pc);await shot('off')}}
await K.up('ArrowUp');console.log('L',JSON.stringify(L.map(r=>[r.kmh,r.off,r.terr,r.veh,r.fit,r.ch?1:0])));await br.close()})();
