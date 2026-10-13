// tLive (art-2, 2026-10-13): EMPTY-SPOT finder + per-spot liveliness metrics + one shot per spot (852×393), via the fast test start.
//   node tools/tLive.js <base url> <outdir> find <fra|ath> [n]          -> lists the n emptiest road-side views (x,z,heading) as JSON
//   node tools/tLive.js <base url> <outdir> shot <fra|ath> <spots.json> [tag] -> per spot: props≤50 m, height range in view, shot <tag>_<i>.png
// The flat-green % is measured from the PNG by tools/tLiveGreen.py (8×8 blocks: green hue AND stdev < 9 = flat uniform green).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [BASE,OUT,MODE,CITY,ARG,TAG]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(120000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+CITY+(MODE==='find'?'&draw=0':''));await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:100000});
 if(MODE==='find'){const n=+ARG||6;const r=await p.evaluate(n=>window.__lvf.find(n),n);console.log(JSON.stringify(r));fs.writeFileSync(OUT+'/spots_'+CITY+'.json',JSON.stringify(r))}
 else{const S=JSON.parse(fs.readFileSync(ARG));const res=[];
  for(let i=0;i<S.length;i++){const s=S[i];
   await p.evaluate(s=>window.__lvf.go(s),s);await p.waitForTimeout(2500);
   const m=await p.evaluate(s=>window.__lvf.metrics(s),s);const f=OUT+'/'+(TAG||'s')+'_'+CITY+i+'.png';await p.screenshot({path:f});m.shot=f;m.i=i;res.push(m);console.log(JSON.stringify(m))}
  fs.writeFileSync(OUT+'/metrics_'+(TAG||'s')+'_'+CITY+'.json',JSON.stringify(res))}
 console.log('ERRORS '+errs.length+(errs[0]?' '+errs[0]:''));await b.close()})();
