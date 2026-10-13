// tools/ld/ld_dump.js <url> <out.json>: our part catalogue (dims, LEGO design ids) + surface points per part, for tools/ld2garage.py calibration.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__ld&&window.__mho,null,{timeout:240000});
 const r=await p.evaluate(()=>{const P=__ld.parts(),o={U:__ld.U,PH:__ld.PH,BC:__ld.BC,parts:[]};for(const q of P){let s=null;try{s=__ld.pts(q.k,2500)}catch(e){s={err:String(e)}}if(s){s.np=s.n;delete s.n}o.parts.push(Object.assign(q,s))}return o});
 require('fs').writeFileSync(process.argv[3],JSON.stringify(r));console.log('parts',r.parts.length,'err',r.parts.filter(q=>q.err).length,errs.slice(0,3));await b.close()})();
