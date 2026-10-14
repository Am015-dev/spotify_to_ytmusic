// trk-5 GRAND TOUR acceptance run: every 'trk5' checklist item via its 📍 GO (window.__chk.go -> BX_test) or __bx.test, then the page's own check.
//   node tools/fs/tFs.js <built page url> [ids...]     (PASS/FAIL lines + a JSON summary; V=1 = timings; EV='<js>' = also print an expression)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const BASE=process.argv[2],IDS=process.argv.slice(3),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ALL=['fs-life','fs-biomes','fs-ai','fs-beats','fs-gap','fs-bot','fs-resp','fs-btn'];
(async()=>{const T0=Date.now(),b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(300000);const E=[],R={};
 p.on('pageerror',e=>E.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')E.push('console: '+m.text().slice(0,200))});
 await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__bx,null,{polling:250,timeout:150000});
 console.log('BOOT',((Date.now()-T0)/1000).toFixed(1),'s');
 for(const id of IDS.length?IDS:ALL){const t=Date.now();try{const via=await p.evaluate(i=>{if(window.__chk&&__chk.go&&!/^fs-/.test(i)){__chk.go(i);return'chk'}__bx.test(i.split('/').pop());return'bx'},id);await sleep(1500);
   const r=await p.evaluate(i=>__bx.check(i.split('/').pop()),id);R[id]=r;console.log((r.ok?'PASS ':'FAIL ')+id+' :: '+r.msg)}catch(e){R[id]={ok:false};console.log('FAIL '+id+' :: ERROR '+String(e).slice(0,200))}
  if(process.env.V)console.log('  ',id,((Date.now()-t)/1000).toFixed(1),'s')}
 if(process.env.EV)console.log('EV',JSON.stringify(await p.evaluate(process.env.EV)).slice(0,3000));
 const n=Object.values(R).filter(r=>r.ok).length;console.log(JSON.stringify({pass:n,of:Object.keys(R).length,errors:E.length,err:E.slice(0,5),secs:Math.round((Date.now()-T0)/1000)}));await b.close()})();
