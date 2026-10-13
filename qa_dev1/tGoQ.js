// dev1: ?test= fast start, tap GO items, print one PASS/FAIL line per item (+ shot). node qa_dev1/tGoQ.js <base url .../local_dbg.html> <outdir> <city> <id>[=key[=ticks]] ...
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [,,url,o,c,...ids]=process.argv;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await (await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
 const t0=Date.now();await p.goto(url+(url.includes('?')?'&':'?')+'test='+c);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{timeout:240000,polling:1000});const boot=(Date.now()-t0)/1000;
 for(const s of ids){const [id,key,w]=s.split('=');const m=await p.evaluate(id=>__chk.go(id),id);await p.waitForTimeout(+(w||1500));const r=key?await p.evaluate(k=>__chk[k],key):null;
  if(process.env.DRIVE){await p.evaluate(()=>{window.__D={hits:0,cd:0,ab:0,n:0};const R=__mho.RO;window.__Di=setInterval(()=>{if(R.hitCd>__D.cd+.1)__D.hits++;__D.cd=R.hitCd||0;__D.n++;const a=__mho.ab&&__mho.ab(R.x,R.z);if(a&&a.d<a.w/2)__D.ab++},100)});
   await p.keyboard.down('ArrowUp');await p.waitForTimeout(+process.env.DRIVE*1000);await p.keyboard.up('ArrowUp');console.log('DRIVE',JSON.stringify(await p.evaluate(()=>{clearInterval(__Di);return Object.assign(__D,{v:Math.round(__mho.RO.v*3.6)})})))}
  await p.evaluate(()=>__tq.draw());await p.screenshot({path:`${o}/go_${id.replace(/\W/g,'_')}.jpg`,type:'jpeg',quality:70});
  console.log(/✅/.test(m)?'PASS':/❌/.test(m)?'FAIL':'INFO',id,m,r?JSON.stringify(r).slice(0,600):'')}
 console.log('boot',boot,'s errs',errs.length,errs.slice(0,2).join(' | '));await b.close()})();
