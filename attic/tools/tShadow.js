// tShadow.js (v90k): checklist 'v90k/shadow' auto-check + before/after shots in ONE browser session (PC 1280×720).
// usage: node tools/tShadow.js <url> <outdir>   → before.jpg (blobs hidden) + after.jpg, prints {n,trees,plUnder}
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('./d24lib.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const {p}=await boot(b,{city:'fra',url:process.argv[2],phone:false});
 await p.setViewportSize({width:1280,height:720});const o=process.argv[3];
 const go=await p.evaluate(()=>window.__chk?__chk.go('v90k/shadow'):'no __chk');for(let i=0;i<4;i++)await p.evaluate(()=>{for(let i=0;i<60;i++){__mho.RO.v=0;__tick(1)}});
 const r=await p.evaluate(()=>window.__sh());console.log(JSON.stringify({go,...r,pass:r.n>0&&r.plUnder}));
 await p.evaluate(()=>{SHB.im.visible=false;__tick(1)});await p.screenshot({path:o+'/before.jpg',quality:80});
 await p.evaluate(()=>{SHB.im.visible=true;__tick(1)});await p.screenshot({path:o+'/after.jpg',quality:80});await b.close()})();
