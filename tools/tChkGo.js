// tChkGo: tap 📍 GO on EVERY checklist item, in one browser, via the fast test start (?test=fra|ath&draw=0, src/98tq_test_quick.js).
// Frankfurt items, then the builder (bx) items, then Athens items. Prints one line per item (PASS/FAIL + what GO said) and a JSON summary
// with boot times and console errors. Target: whole run < 3 min.
//   QUIET=1 prints only FAIL lines + the summary (token saver).
//   node tools/tChkGo.js <base url of the build, e.g. http://localhost:8811/index.html> <outdir> [filter substring]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const BASE=process.argv[2],OUT=process.argv[3]||'.',FIL=process.argv[4]||'';fs.mkdirSync(OUT,{recursive:true});
const BAD=/❌|can't|no .* nearby|loading a test drive|first|get back|works while/i;
(async()=>{const T0=Date.now(),b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const errs=[],boots={},res=[];let nav=0,p=null;
 const newPage=async()=>{p=await ctx.newPage();p.setDefaultTimeout(120000);p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});p.on('framenavigated',f=>{if(f===p.mainFrame())nav++})};await newPage();
 const open=async c=>{const t=Date.now();await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+c+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:90000});
  const s=(Date.now()-t)/1000;(boots[c]=boots[c]||[]).push(s);if(!process.env.QUIET)console.log(`BOOT ${c} ${s.toFixed(1)} s`);nav=0};
 const shot=async f=>{await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.screenshot({path:OUT+'/'+f,type:'jpeg',quality:70})};
 await open('fra');
 const all=await p.evaluate(()=>window.__chk.items.map(it=>it.ver+'/'+it.id).filter(id=>window.__chk.GO[id]).map(id=>[id,window.__chk.city(id)]));
 // items whose GO only opens the garage (or says "drive here") all do the same thing: run the first, report the rest as the same
 const kind=await p.evaluate(ids=>Object.fromEntries(ids.map(id=>{const T=window.__chk.GO[id][0];return[id,T.gar?'gar':T.here?'here':'']})),all.map(a=>a[0]));const seen={},same={};
 const pick=c=>all.filter(([id,cc])=>cc===c&&id.includes(FIL)).map(([id])=>id).filter(id=>{const k=kind[id]&&c+kind[id];if(!k)return true;if(seen[k]){same[id]=seen[k];return false}seen[k]=id;return true});
 const run=async(c,ids)=>{for(const id of ids){const e0=errs.length;let said='';
   const t1=Date.now();try{said=await p.evaluate(id=>window.__chk.go(id)||'',id);if(/…$/.test(said)){await p.waitForFunction(()=>!/…$/.test(window.__chk.said()||''),null,{timeout:60000,polling:500}).catch(()=>{});said=await p.evaluate(()=>window.__chk.said()||'')}}catch(e){said='EVAL '+String(e).slice(0,80)}
   await p.waitForTimeout(c==='bx'?2500:1200);
   const st=await p.evaluate(()=>({state:typeof __mho!=='undefined'?__mho.state:'?',gar:!!(document.getElementById('gbx')&&!document.getElementById('gbx').hidden)})).catch(()=>({state:'nav'}));
   if(!said&&st.state==='race')said='(race started)';const ok=!!said&&!BAD.test(said)&&errs.length===e0&&!nav;const spawnOnly=c==='bx'&&ok;res.push({id,c,ok:spawnOnly?false:ok,spawnOnly,said,state:st.state,errs:errs.slice(e0)});
   if(!process.env.QUIET||!ok||spawnOnly)console.log(`${spawnOnly?'SPAWN-ONLY(laps NOT checked, run tools/bx/tTracks.js)':ok?'PASS':'FAIL'} ${c} ${id} ${((Date.now()-t1)/1000).toFixed(1)}s · ${said||'(no message)'}${errs.length>e0?' · ERR '+errs[e0]:''}`);
   if(res.length<=3||id.endsWith('/shadow'))await shot(`go_${res.length}_${id.replace(/\W/g,'_')}.jpg`);
   if(c==='bx')continue;
   if(st.gar)await p.evaluate(()=>{try{gbClose(false)}catch(e){}});
   if(nav||(st.state!=='roam'))await open(c==='ath'?'ath':'fra')}};
 const runSafe=async(c,ids)=>{let i=0;while(i<ids.length){const n0=res.length;try{await run(c,ids.slice(i));return}catch(e){const d=res.length-n0,bad=ids[i+d];if(bad)res.push({id:bad,c,ok:false,said:'PAGE LOST',errs:[]});i+=d+1;console.log('PAGE LOST at '+bad+' '+String(e).slice(0,100)+' → reopen');try{if(p.isClosed())await newPage();await open(c==='bx'?'fra':c)}catch(e2){}}}};
 await runSafe('fra',pick('fra'));await runSafe('bx',pick('bx'));
 const ath=pick('ath');if(ath.length){await open('ath');await runSafe('ath',ath)}
 for(const id in same){const r=res.find(q=>q.id===same[id]);if(r)res.push({...r,id,said:'same as '+same[id]+': '+r.said})}
 const pass=res.filter(r=>r.ok).length;
 console.log(JSON.stringify({pass,total:res.length,fail:res.filter(r=>!r.ok).map(r=>r.id),boots,errors:errs.length,firstErrors:errs.slice(0,5),secs:Math.round((Date.now()-T0)/1000)}));
 fs.writeFileSync(OUT+'/tChkGo.json',JSON.stringify({res,boots,errs},null,1));await b.close()})();
