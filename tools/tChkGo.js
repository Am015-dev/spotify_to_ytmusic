// tChkGo: tap 📍 GO on EVERY checklist item, in ONE warm page per city (__tq.reset() between items, no reload), via the fast test start (?test=fra|ath&draw=0, src/98tq_test_quick.js).
// Frankfurt items, then the builder (bx) items, then Athens items. Prints one line per item (PASS/FAIL + what GO said) and a JSON summary
// with boot times and console errors. Target: whole run < 3 min.
//   SHOTS=1 saves jpgs of the first 3 items + shadow (each first frame costs ~10 s of software-GL shaders; off by default).
//   QUIET=1 prints only FAIL lines + the summary (token saver).
//   TAG=foot,v90k/park-sit  only items whose id starts with / contains one of these (the merged lanes' GO tags).
//   SMOKE=1  only a ~20-item smoke set (both city boots, drive, on foot, errors). Frankfurt and Athens run IN PARALLEL (two pages); fixed sleeps are short.
//   CITY=fra|ath  run only that city (tools/tGo.sh starts both at once).
//   FULL suite: no TAG/SMOKE (hourly / release only).
//   node tools/tChkGo.js <base url of the build, e.g. http://localhost:8811/index.html> <outdir> [filter substring]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const BASE=process.argv[2],OUT=process.argv[3]||'.',FIL=process.argv[4]||'';fs.mkdirSync(OUT,{recursive:true});
const BAD=/❌|can't|no .* nearby|loading a test drive|first|get back|works while/i;
(async()=>{const T0=Date.now(),b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const errs=[],boots={},res=[],RS={n:0,ms:0};let nav=0,p=null;const FC={};
 const newPage=async()=>{p=await ctx.newPage();p.setDefaultTimeout(120000);p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});p.on('framenavigated',f=>{if(f===p.mainFrame())nav++})};await newPage();
 const open=async c=>{const t=Date.now();await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+c+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:90000});if(!open.warm){open.warm=1;await p.evaluate(()=>__tq.draw()).catch(()=>{})}  // one picture up front: the first draw compiles the shaders (~5 s) and would be billed to the first GO that needs a render
  const s=(Date.now()-t)/1000;(boots[c]=boots[c]||[]).push(s);if(!process.env.QUIET)console.log(`BOOT ${c} ${s.toFixed(1)} s`);nav=0};
 const shot=async f=>{await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.screenshot({path:OUT+'/'+f,type:'jpeg',quality:70})};
 await open(process.env.CITY||'fra');
 const all=await p.evaluate(()=>window.__chk.items.map(it=>it.ver+'/'+it.id).filter(id=>window.__chk.GO[id]).map(id=>[id,window.__chk.city(id)]));
 // items whose GO only opens the garage (or says "drive here") all do the same thing: run the first, report the rest as the same
 const kind=await p.evaluate(ids=>Object.fromEntries(ids.map(id=>{const T=window.__chk.GO[id][0];return[id,T.gar?'gar':T.here?'here':'']})),all.map(a=>a[0]));
 // a GO may declare its own time budget (secs, e.g. sink1/start-sink: the real parachute start + 15 s): wait for it and judge SLOW against it
 const BUD=await p.evaluate(ids=>Object.fromEntries(ids.map(id=>[id,+window.__chk.GO[id][0].secs||0])),all.map(a=>a[0]));const seen={},same={};
 const SM=['v90n/foot-go-walk','v90n/foot-go-npc','v90n/foot-go-jump','v90k/rv-human','v90k/no-hollow','v90k/shadow','v90k/lag','v90k/ramp-seam','v90k/fra-net','v90g/fra-props','v90m/ath-boot','v90k/ath-kriezi','v90g/ath-display','v90k/rv-scale','v90k/ww-card'],TG=(process.env.TAG||'').split(',').filter(Boolean);
 const want=id=>id.includes(FIL)&&(!process.env.SMOKE||SM.includes(id))&&(!TG.length||TG.some(t=>id.startsWith(t)||id.includes('/'+t)||id.split('/')[0]===t));
 const LAST=['v90k/rv-scale','v90k/ww-card','v90k/park-sit'],pick=c=>all.filter(([id,cc])=>cc===c&&want(id)).map(([id])=>id).sort((a,b)=>(process.env.SMOKE?LAST.includes(a)-LAST.includes(b):0)).filter(id=>{const k=kind[id]&&c+kind[id];if(!k)return true;if(seen[k]){same[id]=seen[k];return false}seen[k]=id;return true});
 const run=async(c,ids)=>{for(const id of ids){const e0=errs.length;let said='';
   const t1=Date.now();try{const LONG=BUD[id]>=25&&id.startsWith('rv2k/')&&id!=='rv2k/race-handsoff'&&!process.env.SMOKE;   // race-handsoff drives its own fake clock (tkRun), real timers   // long GOs (race 240 s, walls 60 s, objectives 30 s): drive them on a fake clock (sim time, not software-GL wall time) and WAIT until they say a verdict, so a combined run judges them like a solo run
    if(LONG&&!FC.on){await p.clock.install().catch(()=>{});FC.on=1}
    said=await p.evaluate(id=>window.__chk.go(id)||'',id);
    if(LONG&&/…$/.test(said)){let sim=0;const cap=BUD[id]*1000+60000;while(sim<cap){await p.clock.runFor(1000);sim+=1000;const s=await p.evaluate(()=>window.__chk.said()||'');if(!/…$/.test(s))break}await p.clock.resume().catch(()=>{});said=await p.evaluate(()=>window.__chk.said()||'')}
    else if(/…$/.test(said)){await p.waitForFunction(()=>!/…$/.test(window.__chk.said()||''),null,{timeout:process.env.SMOKE?4000:Math.max(20000,(BUD[id]+10)*1000),polling:250}).catch(()=>{});said=await p.evaluate(()=>window.__chk.said()||'')}}catch(e){said='EVAL '+String(e).slice(0,80)}
   await p.waitForTimeout(c==='bx'?1500:process.env.SMOKE?150:500);
   const st=await p.evaluate(()=>({state:typeof __mho!=='undefined'?__mho.state:'?',gar:!!(document.getElementById('gbx')&&!document.getElementById('gbx').hidden)})).catch(()=>({state:'nav'}));
   if(!said&&st.state==='race')said='(race started)';const ok=!!said&&!BAD.test(said)&&errs.length===e0&&!nav;const secs=(Date.now()-t1)/1000,slow=secs>Math.max(10,BUD[id]||0)&&c!=='bx'&&!(BUD[id]>=25&&id.startsWith('rv2k/')&&id!=='rv2k/race-handsoff');if(slow)said+=' · SLOW '+secs.toFixed(1)+' s > 10 s ❌';const spawnOnly=c==='bx'&&ok,fin=(spawnOnly||slow)?false:ok;res.push({id,c,ok:fin,spawnOnly,secs,said,state:st.state,errs:errs.slice(e0)});
   if(!process.env.QUIET||!fin||spawnOnly)console.log(`${spawnOnly?'SPAWN-ONLY(laps NOT checked, run tools/bx/tTracks.js)':fin?'PASS':'FAIL'} ${c} ${id} ${((Date.now()-t1)/1000).toFixed(1)}s · ${said||'(no message)'}${errs.length>e0?' · ERR '+errs[e0]:''}`);
   if(process.env.SHOTS&&(res.length<=3||id.endsWith('/shadow')))await shot(`go_${res.length}_${id.replace(/\W/g,'_')}.jpg`);
   if(c==='bx')continue;
   if(st.gar)await p.evaluate(()=>{try{gbClose(false)}catch(e){}});
   // warm page: reset to a clean roam in the same page (no reload); reload only when the reset can't (navigation, no __tq.reset, still not roam)
   if(!nav){const r=await p.evaluate(()=>window.__tq&&__tq.reset?__tq.reset():null).catch(()=>null);if(r&&r.state==='roam'){RS.n++;RS.ms+=r.ms;continue}}
   if(!(process.env.SMOKE&&id===ids[ids.length-1]))await open(c==='ath'?'ath':'fra')}};
 const runSafe=async(c,ids)=>{let i=0;while(i<ids.length){const n0=res.length;try{await run(c,ids.slice(i));return}catch(e){const d=res.length-n0,bad=ids[i+d];if(bad)res.push({id:bad,c,ok:false,said:'PAGE LOST',errs:[]});i+=d+1;console.log('PAGE LOST at '+bad+' '+String(e).slice(0,100)+' → reopen');try{if(p.isClosed())await newPage();await open(c==='bx'?'fra':c)}catch(e2){}}}};
 const ath=pick('ath'),CY=process.env.CITY||'';
 if(CY!=='ath'){await runSafe('fra',pick('fra'));await runSafe('bx',pick('bx'))}
 if(CY!=='fra'&&ath.length){if(CY!=='ath')await open('ath');await runSafe('ath',ath)}
 for(const id in same){const r=res.find(q=>q.id===same[id]);if(r)res.push({...r,id,said:'same as '+same[id]+': '+r.said})}
 const pass=res.filter(r=>r.ok).length;
 console.log(JSON.stringify({pass,total:res.length,resets:RS.n,resetMs:RS.ms,slowest:res.slice().sort((x,y)=>y.secs-x.secs).slice(0,5).map(r=>r.id+' '+(r.secs||0).toFixed(1)+'s'),fail:res.filter(r=>!r.ok).map(r=>r.id),boots,errors:errs.length,firstErrors:errs.slice(0,5),secs:Math.round((Date.now()-T0)/1000)}));
 fs.writeFileSync(OUT+'/tChkGo.json',JSON.stringify({res,boots,errs},null,1));await b.close()})();
