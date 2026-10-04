// boots the real deploy files (out/overdrive.html + km.js, three.js from CDN), enters roam, reports errors
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];
p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
await p.route('https://cdn.jsdelivr.net/npm/three@0.164.1/**',r=>{const u=r.request().url().replace('https://cdn.jsdelivr.net/npm/three@0.164.1/','');r.fulfill({path:'/home/user/spotify_to_ytmusic/node_modules/three/'+u,contentType:'application/javascript'})});p.setDefaultTimeout(900000);await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
const km=await p.evaluate(()=>(window.__KM_BIN||'').length);
await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:500});
await p.evaluate(()=>{__mho.K.ArrowUp=true;__mho.roamSim(120);__mho.K.ArrowUp=false});const v=await p.evaluate(()=>__mho.RO.v);
await p.screenshot({path:process.argv[3]||'out_boot.jpg',type:'jpeg',quality:70,timeout:600000});
console.log((km>1e6&&v>5&&!errs.length?'OUTBOOT PASS':'OUTBOOT FAIL'),JSON.stringify({km,v:+v.toFixed(1),errs}));await b.close()})();
