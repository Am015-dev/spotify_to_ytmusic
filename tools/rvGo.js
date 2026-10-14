// rvGo.js (rev-1): run checklist GOs in PORTRAIT 393×852 and LANDSCAPE 852×393, one browser session per city, PASS/FAIL per line.
//   node tools/rvGo.js <page url, e.g. http://127.0.0.1:8890/hot.html or .../out/<ver>/index.html> [filter=rv14/] [--shots dir]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const A=process.argv.slice(2),URL0=A[0],F=(A[1]&&!A[1].startsWith('--'))?A[1]:'rv14/',si=A.indexOf('--shots'),SH=si>=0?A[si+1]:null;if(SH)fs.mkdirSync(SH,{recursive:true});
const PROF={P:{width:393,height:852},L:{width:852,height:393}};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let nf=0,n=0;
 for(const city of ['fra','ath']){
  const ctx=await b.newContext({viewport:PROF.P,isMobile:true,hasTouch:true,deviceScaleFactor:1}),p=await ctx.newPage();p.setDefaultTimeout(300000);const E=[];p.on('pageerror',e=>E.push(String(e).slice(0,160)));
  await p.goto(URL0+'?test='+city+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__chk,null,{polling:250,timeout:300000});
  const ids=await p.evaluate(([f,c])=>__chk.items.map(q=>q.ver+'/'+q.id).filter(k=>k.startsWith(f)&&__chk.city(k)===c),[F,city]);
  for(const id of ids)for(const pr of ['P','L']){await p.setViewportSize(PROF[pr]);await p.waitForTimeout(300);await p.evaluate(()=>{try{__tq.reset()}catch(e){}});await p.waitForTimeout(300);
   const t0=Date.now();await p.evaluate(k=>__chk.go(k),id);let said='';for(let i=0;i<40;i++){await p.waitForTimeout(250);said=await p.evaluate(()=>__chk.said()||'');if(/[✅❌]|visual check/.test(said)&&!/checking|switching/.test(said))break}
   if(SH){await p.evaluate(()=>{__tq.o.draw=1});await p.waitForTimeout(1200);await p.screenshot({path:`${SH}/${id.replace('/','_')}_${pr}.jpg`,type:'jpeg',quality:70});await p.evaluate(()=>{__tq.o.draw=0})}
   const fail=/❌/.test(said)||!said;n++;if(fail)nf++;console.log(`${fail?'FAIL':'PASS'} ${city} ${pr} ${id} ${((Date.now()-t0)/1000).toFixed(1)}s · ${said}`)}
  if(E.length)console.log('ERRORS '+city+': '+E.slice(0,3).join(' | '));await ctx.close()}
 console.log(`RVGO ${nf?'FAIL':'OK'}: ${n} runs · ${nf} failing`);await b.close();process.exit(nf?1:0)})();
