// stk.js <url>: roam, drive onto grass, stop, then test steering at rest / with gas / reverse; prints heading deltas
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [URL]=process.argv.slice(2);const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(600000);
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(2500);
await p.evaluate(()=>{for(const id of['m1Next','m1Skip']){const b=document.getElementById(id);if(b&&b.getClientRects().length)b.click()}});await p.waitForTimeout(1500);
await p.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true)});
const K=p.keyboard;const st=n=>p.evaluate(n=>{__ju.step(n);const R=__dbg.RO;return{kmh:+(R.v*3.6).toFixed(1),h:+R.h.toFixed(3),terr:R.terr,x:+R.x.toFixed(1),z:+R.z.toFixed(1),wk:!!R.wk,stk:+(R.stkT||0).toFixed(2),ct:R.crTurn!=null}},n);
await K.down('ArrowUp');for(let i=0;i<20;i++)await st(15);await K.down('ArrowLeft');await st(40);await K.up('ArrowLeft');for(let i=0;i<10;i++)await st(15);await K.up('ArrowUp');
console.log('offroad',JSON.stringify(await st(1)));
await K.down('ArrowDown');for(let i=0;i<8;i++)await st(15);await K.up('ArrowDown');for(let i=0;i<4;i++)await st(15);
const t=async(lbl,keys,n)=>{const a=await st(1);for(const k of keys)await K.down(k);let b;for(let i=0;i<n;i++)b=await st(6);for(const k of keys)await K.up(k);console.log(lbl,'dh',(b.h-a.h).toFixed(3),'in',(n*6/60).toFixed(1)+'s',JSON.stringify(b));await st(30)};
const z0=()=>p.evaluate(()=>{const R=__dbg.RO;R.v=0;R.yr=0;R.dl=0});
for(const [lbl,keys,n] of [['rest+L',['ArrowLeft'],10],['gas+L',['ArrowUp','ArrowLeft'],10],['rev+L',['ArrowDown','ArrowLeft'],10]]){await z0();await t(lbl,keys,n)}
// per-step trace gas+L from 0
await z0();await K.down('ArrowUp');await K.down('ArrowLeft');const tr=[];const h0=(await st(0)).h;for(let i=0;i<12;i++){const b=await st(3);tr.push([(i+1)*3/60, b.kmh, +(b.h-h0).toFixed(3)])}await K.up('ArrowUp');await K.up('ArrowLeft');console.log('trace t,kmh,dh',JSON.stringify(tr));
await br.close()})();
