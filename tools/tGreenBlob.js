// GO v90m/green-blob: ?test=fra; in the car on the Messe road south of the Festhalle (Alex's b4 shot) 15 s so the on-the-go markers spawn,
// GO (40 m from the nearest district collectible = OG.imC 'ogCollectible', facing it, out of the car), wait, ART_blobChk():
// lone marker glows (beaconGlow without its ring) = 0 AND on-the-go markers drawn on foot = 0.  node tools/tGreenBlob.js <url .../local_dbg.html>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [,,url]=process.argv;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await (await b.newContext({viewport:{width:393,height:852}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,120)));
 await p.goto(url+'?test=fra');for(let i=0;i<400;i++){if(await p.evaluate(()=>!!(window.__tq&&__tq.ready&&window.__chk)))break;await p.waitForTimeout(300)}
 await p.waitForTimeout(1500);await p.evaluate(()=>__oc.ev("(()=>{const q=rfSnap(2160,-200,60);roamWarp(q[0],q[1],0);RO.v=0})()"));await p.waitForTimeout(15000);
 const near=await p.evaluate(()=>__oc.ev("(()=>{let best=null,bd=1e9;for(const Q of OG.grid.values())for(const sp of Q)if(sp.k==='col'&&OG_done(sp)<3){const d=Math.hypot(sp.x-2160,sp.z+200);if(d<bd){bd=d;best=sp}}if(!best)return 'no col';const h=Math.atan2(best.x-2160,best.z+200),q=rfSnap(best.x-Math.sin(h)*60,best.z-Math.cos(h)*60,40);if(q)roamWarp(q[0],q[1],h);RO.v=0;return best.t+' @'+(best.x|0)+','+(best.z|0)+' '+Math.round(bd)+'m from the Messe road'})()"));await p.waitForTimeout(12000);
 const col=await p.evaluate(()=>__oc.ev("(OG.vis||[]).filter(s=>s.k==='col').map(s=>s.t+' '+Math.round(Math.hypot(s.x-RO.x,s.z-RO.z))+'m').join(',')"));
 let said='';for(let i=0;i<20;i++){said=await p.evaluate(()=>__chk.go('v90m/green-blob'));if(!/jump|Can/.test(said))break;await p.waitForTimeout(500)}
 await p.waitForTimeout(8000);const r=await p.evaluate(()=>__oc.ev("(()=>{const r=ART_blobChk();return Object.assign(r,{foot:RO.foot,imC:OG.imC?OG.imC.count:-1,grp:OG.grp?OG.grp.visible:null})})()"));
 await p.screenshot({path:'qa_dev5/green_blob.png'});const ok=r.ok&&r.foot!=='car';
 console.log((ok?'PASS':'FAIL'),'green-blob | lone glows',r.lone,'of',r.glow,'| OG drawn on foot',r.og,'(imC',r.imC,'grp',r.grp+')','| foot',r.foot,'| target:',near,'| collectibles in view before exit:',col||'none','| errs',errs.length);await b.close()})();
