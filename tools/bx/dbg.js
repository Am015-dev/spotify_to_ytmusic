const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true});const p=await c.newPage();p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text())});p.on('pageerror',e=>console.log('PE',e.message));
 await p.goto('http://127.0.0.1:8766/local_dbg.html'+(process.argv[2]||''));await p.waitForSelector('#bxMenuBtn',{state:'visible',timeout:120000});
 await p.evaluate(()=>__bx.open());await p.waitForTimeout(4000);await p.screenshot({path:'qa_bx/dbg.png'});
 console.log(await p.evaluate(()=>{const r=[];const B=__bx.BX;r.push('t='+B.t+' on='+B.on+' fc='+B.fc+' fastf='+(window.__fast&&window.__fast.f));const cv=document.querySelector('canvas#c')||document.querySelector('canvas');const cs=getComputedStyle(cv);r.push(cv.id+' '+cs.display+' '+cs.visibility+' z'+cs.zIndex+' '+cv.width+'x'+cv.height);
  const els=[...document.body.children].filter(e=>!e.hidden&&getComputedStyle(e).display!=='none').map(e=>e.tagName+'#'+e.id+'.'+e.className+' z'+getComputedStyle(e).zIndex);r.push(els.join('\n'));return r.join('\n')}));await b.close()})();
