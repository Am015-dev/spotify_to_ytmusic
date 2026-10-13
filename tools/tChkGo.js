// tChkGo: tap 📍 GO on EVERY checklist item, in one browser, via the fast test start (?test=fra|ath&draw=0, src/98tq_test_quick.js).
// Frankfurt items, then the builder (bx) items, then Athens items. Prints one line per item (PASS/FAIL + what GO said) and a JSON summary
// with boot times and console errors. Target: whole run < 3 min.
//   node tools/tChkGo.js <base url of the build, e.g. http://localhost:8811/index.html> <outdir> [filter substring]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const BASE=process.argv[2],OUT=process.argv[3]||'.',FIL=process.argv[4]||'';fs.mkdirSync(OUT,{recursive:true});
const BAD=/can't|no .* nearby|loading a test drive|first|get back|works while/i;
(async()=>{const T0=Date.now(),b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(120000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 const boots={},res=[];let nav=0;p.on('framenavigated',f=>{if(f===p.mainFrame())nav++});
 const open=async c=>{const t=Date.now();await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+c+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:90000});
  const s=(Date.now()-t)/1000;(boots[c]=boots[c]||[]).push(s);console.log(`BOOT ${c} ${s.toFixed(1)} s`);nav=0};
 const shot=async f=>{await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.screenshot({path:OUT+'/'+f,type:'jpeg',quality:70})};
 await open('fra');
 const all=await p.evaluate(()=>window.__chk.items.map(it=>it.ver+'/'+it.id).filter(id=>window.__chk.GO[id]).map(id=>[id,window.__chk.city(id)]));
 const pick=c=>all.filter(([id,cc])=>cc===c&&id.includes(FIL)).map(([id])=>id);
 const run=async(c,ids)=>{for(const id of ids){const e0=errs.length;let said='';
   try{said=await p.evaluate(id=>window.__chk.go(id)||'',id)}catch(e){said='EVAL '+String(e).slice(0,80)}
   await p.waitForTimeout(c==='bx'?2500:1200);
   const st=await p.evaluate(()=>({state:typeof __mho!=='undefined'?__mho.state:'?',gar:!!(document.getElementById('gbx')&&!document.getElementById('gbx').hidden)})).catch(()=>({state:'nav'}));
   const ok=!!said&&!BAD.test(said)&&errs.length===e0&&!nav;res.push({id,c,ok,said,state:st.state,errs:errs.slice(e0)});
   console.log(`${ok?'PASS':'FAIL'} ${c} ${id} · ${said||'(no message)'}${errs.length>e0?' · ERR '+errs[e0]:''}`);
   if(res.length<=3||id.endsWith('/shadow'))await shot(`go_${res.length}_${id.replace(/\W/g,'_')}.jpg`);
   if(c==='bx')continue;
   if(st.gar)await p.evaluate(()=>{try{gbClose(false)}catch(e){}});
   if(nav||(st.state!=='roam'))await open(c==='ath'?'ath':'fra')}};
 await run('fra',pick('fra'));await run('bx',pick('bx'));
 const ath=pick('ath');if(ath.length){await open('ath');await run('ath',ath)}
 const pass=res.filter(r=>r.ok).length;
 console.log(JSON.stringify({pass,total:res.length,fail:res.filter(r=>!r.ok).map(r=>r.id),boots,errors:errs.length,firstErrors:errs.slice(0,5),secs:Math.round((Date.now()-T0)/1000)}));
 fs.writeFileSync(OUT+'/tChkGo.json',JSON.stringify({res,boots,errs},null,1));await b.close()})();
