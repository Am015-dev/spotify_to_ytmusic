// tXfProbe: boot ?test=fra, print parks/river samples and the surface/vehicle state at a few spots (xform-1 recon).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto(process.argv[2]+'?test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});
 const r=await p.evaluate(()=>{const g=__fl.geo();const out={parks:g.parks.slice(0,6),riv:g.riv[0]&&g.riv[0].slice(0,6),ride:GAR_set().id,off:GAR_frm('off').id,boat:GAR_frm('boat').id,pos:[RO.x,RO.z,RO.h],surf:__fl.surf(),vmode:pl.vmode};return out});
 console.log(JSON.stringify(r));console.log('ERR',errs.length,errs.slice(0,3));await b.close()})();
