// reviewer probe: real title -> PLAY on the built page, phone profile; shots of the first drivable frame, then the garage fast-travel spot
const {chromium}=require('playwright');
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const [url,out,city]=process.argv.slice(2);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:UA});
 if(city==='ath')await ctx.addInitScript(()=>{try{if(!localStorage.getItem('mho_city@1')){localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1','ath')}}catch(e){}});
 const p=await ctx.newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
 await p.goto(url);await p.waitForSelector('#ob2Play',{state:'visible'});await p.waitForTimeout(800);
 const bx=await p.locator('#ob2Play').boundingBox();await p.touchscreen.tap(bx.x+bx.width/2,bx.y+bx.height/2);
 await p.waitForFunction(()=>window.__tk&&__tk.q('typeof RO!=="undefined"&&RO.on&&!RO.frozen&&!RO.bootHold'),null,{polling:100});
 await p.screenshot({path:out+'_first.jpg',quality:80});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
 const INFO=String((()=>{const r={x:+RO.x.toFixed(0),z:+RO.z.toFixed(0),cid:CID,vis:0,near:0};
   HUB.grp.traverse(o=>{if(o.isMesh&&o.visible){r.vis++;}});
   const g=RO.marks.find(m=>m.kind==='garage');if(g){r.garage=[+g.x.toFixed(0),+g.z.toFixed(0),+Math.hypot(g.x-RO.x,g.z-RO.z).toFixed(0)];const P=new THREE.Vector3();g.sp.getWorldPosition(P);r.iconUp=+(P.y-groundY(g.x,g.z)).toFixed(2);r.shadow=!!(g.sh&&g.sh.parent===g.g)}
   // what is high in the sky near the car: instanced meshes with an instance > 12 m above the ground within 120 m
   const M=new THREE.Matrix4(),V=new THREE.Vector3(),hi={};scene.traverse(o=>{if(!o.isInstancedMesh||!o.visible)return;const n=Math.min(o.count,4000);for(let i=0;i<n;i++){o.getMatrixAt(i,M);if(M.elements[0]===0&&M.elements[5]===0)continue;V.setFromMatrixPosition(M).applyMatrix4(o.matrixWorld);const d=Math.hypot(V.x-RO.x,V.z-RO.z);if(d>120)continue;const gy=groundY(V.x,V.z);if(V.y-gy>12&&V.y-gy<60){const k=(o.name||o.parent&&o.parent.name||'?')+':'+(o.geometry.attributes.position.count);hi[k]=(hi[k]||0)+1}}});r.hi=hi;return r}));const info=()=>p.evaluate(c=>__tk.q('('+c+')()'),INFO);
 const i0=await info();console.log('FIRST',JSON.stringify(i0));
 await p.waitForTimeout(4000);await p.screenshot({path:out+'_first4s.jpg',quality:80});
 // garage fast travel (the ⚡ FAST TRAVEL button handler; the garage is known from the start)
 const ft=await p.evaluate(()=>__tk.q("(()=>{const g=RO.marks.find(m=>m.kind==='garage');return g?String(fastTravel(g)):'no garage'})()"));console.log('FT',ft);
 await p.waitForFunction(()=>!document.querySelector('#ld2')||getComputedStyle(document.querySelector('#ld2')).display==='none',null,{polling:200,timeout:120000}).catch(()=>{});
 await p.waitForTimeout(1500);await p.screenshot({path:out+'_garage_ft.jpg',quality:80});console.log('GARAGE',JSON.stringify(await info()));
 await p.waitForTimeout(6000);await p.screenshot({path:out+'_garage_ft6s.jpg',quality:80});console.log('GARAGE6',JSON.stringify(await info()));
 console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close()})().catch(e=>{console.log('PROBE ERR',e.message);process.exit(1)});
