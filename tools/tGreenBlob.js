// GO v90m/green-blob: ?test=fra, GO (Messe road at the Hot Drop start, out of the car), wait, ART_blobChk(): visible beacon glows whose ground ring is hidden must be 0.
// node tools/tGreenBlob.js <url .../local_dbg.html>   prints PASS/FAIL + the nearest lone glows, one 393x852 shot qa_dev5/green_blob.png
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [,,url]=process.argv;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await (await b.newContext({viewport:{width:393,height:852}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,120)));
 await p.goto(url+'?test=fra');for(let i=0;i<400;i++){if(await p.evaluate(()=>!!(window.__tq&&__tq.ready&&window.__chk)))break;await p.waitForTimeout(300)}
 await p.waitForTimeout(1500);let said='';for(let i=0;i<20;i++){said=await p.evaluate(()=>__chk.go('v90m/green-blob'));if(!/jump|Can/.test(said))break;await p.waitForTimeout(500)}
 await p.waitForTimeout(8000);const r=await p.evaluate(()=>__oc.ev(`(()=>{const r=ART_blobChk(),V=new THREE.Vector3(),L=[];for(const o of ART3.bl){if(!o.parent||!o.visible)continue;const rg=o.parent.children.find(c=>c!==o&&c.geometry&&c.geometry.type==='TorusGeometry');if(rg&&!rg.visible){o.getWorldPosition(V);L.push(Math.round(Math.hypot(V.x-RO.x,V.z-RO.z))+'m #'+o.material.color.getHexString())}}L.sort((a,b)=>parseInt(a)-parseInt(b));return Object.assign(r,{foot:RO.foot,at:[RO.x|0,RO.z|0],near:L.slice(0,4).join(' ')})})()`));
 await p.screenshot({path:'qa_dev5/green_blob.png'});console.log((r.ok?'PASS':'FAIL'),'green-blob | lone',r.lone,'of',r.glow,'| foot',r.foot,'at',r.at.join(','),'| nearest lone:',r.near||'-','| go:',String(said).slice(0,50),'| errs',errs.length);await b.close()})();
