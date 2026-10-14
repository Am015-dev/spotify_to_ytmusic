// tBV (art-3): bv1 checklist GOs (building variety), state asserts only (no driving), one 852×393 shot per city. ~1 min per city.
//   node tools/tBV.js <base url> <outdir> [tag] [fra,ath]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const [BASE,OUT,TAG,ONLY]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T0=Date.now(),b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});p.setDefaultTimeout(120000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));const res=[];
 for(const c of(ONLY||'fra,ath').split(',')){await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+c);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:200000});
  const said=await p.evaluate(c=>__chk.go('bv1/'+c)||'',c);await p.waitForFunction(()=>__bv.BV.last,null,{polling:200,timeout:20000}).catch(()=>{});await p.waitForTimeout(1500);
  const m=await p.evaluate(()=>__bv.BV.last);await p.screenshot({path:`${OUT}/${TAG||'bv'}_${c}.png`});const ok=!!(m&&m.pass);res.push({c,ok,m});
  console.log(`${ok?'PASS':'FAIL'} bv1/${c} · ${m?JSON.stringify(m):'(no result) '+said}`)}
 console.log(JSON.stringify({pass:res.filter(r=>r.ok).length,total:res.length,errors:errs.length,firstError:errs[0]||'',secs:Math.round((Date.now()-T0)/1000)}));await b.close()})();
