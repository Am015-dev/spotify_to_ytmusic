// tLiveGo (art-2): runs the lf1 checklist GOs (src/99c_checklist.js) exactly as Alex's 📍 GO does, reads the in-page pass line, one 852×393 shot per item.
//   node tools/tLiveGo.js <base url> <outdir> [tag]      (fra spots + hill drive, then ath spots; ~2 min)
// The hill drive uses REAL input: ArrowUp held down until the in-page check reports.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [BASE,OUT,TAG]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T0=Date.now(),b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(120000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 const res=[];
 for(const c of['fra','ath','fra0']){const cc=c.slice(0,3);await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+cc+(c==='fra0'?'&draw=0':''));await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:100000});
  // the hill drive runs on a draw=0 page (no pictures, so the physics runs at full rate under software GL), one picture forced for the shot
  const ids=c==='fra0'?['mound']:await p.evaluate(c=>Object.keys(__lvf.SP).filter(k=>__lvf.SP[k].c===c),c);
  for(const id of ids){const said=await p.evaluate(id=>__chk.go('lf1/'+id)||'',id);let m=null;
   if(id==='mound'){await p.waitForTimeout(800);await p.keyboard.down('ArrowUp');await p.waitForFunction(()=>__lvf.LF.lastM,null,{polling:200,timeout:30000}).catch(()=>{});await p.keyboard.up('ArrowUp');m=await p.evaluate(()=>__lvf.LF.lastM)}
   else{await p.waitForFunction(()=>__lvf.LF.last,null,{polling:200,timeout:10000}).catch(()=>{});m=await p.evaluate(()=>__lvf.LF.last)}
   if(c==='fra0')await p.evaluate(()=>__tq.draw()).catch(()=>{});const f=`${OUT}/${TAG||'go'}_${id}.png`;await p.screenshot({path:f});const ok=!!(m&&m.pass);res.push({id,ok,m,said});
   console.log(`${ok?'PASS':'FAIL'} lf1/${id} · ${m?JSON.stringify(m):'(no result) '+said}`)}}
 console.log(JSON.stringify({pass:res.filter(r=>r.ok).length,total:res.length,errors:errs.length,firstError:errs[0]||'',secs:Math.round((Date.now()-T0)/1000)}));
 fs.writeFileSync(`${OUT}/${TAG||'go'}.json`,JSON.stringify({res,errs},null,1));await b.close()})();
