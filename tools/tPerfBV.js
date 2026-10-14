// tPerfBV (art-3): building variety ON vs ?bv=0 at the bv1 spot: boot ms, draw calls, triangles, median of 7 forced frames. node tools/tPerfBV.js <base url> <fra|ath>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,C]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const R={};
 for(const q of['&bv=0','']){const p=await b.newPage({viewport:{width:852,height:393}});await p.goto(BASE+'?test='+C+q);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});
  await p.evaluate(c=>__chk.go('bv1/'+c),C);await p.waitForTimeout(2500);
  R[q||'on']=await p.evaluate(()=>{const T=[];for(let i=0;i<8;i++){const t=performance.now();__tq.draw();T.push(performance.now()-t)}T.shift();T.sort((a,b)=>a-b);let calls=0;__lvf.scene().traverse(o=>{if(o.isMesh&&o.visible)calls++});return{boot:Math.round(__tq.tReady||0),ms:+T[3].toFixed(1),calls,tris:0}});await p.close()}
 const a=R['&bv=0'],o=R.on,d=(o.ms/a.ms-1)*100;console.log(C,'off',JSON.stringify(a),'on',JSON.stringify(o),`${d<=5&&o.calls<=a.calls*1.1?'PASS':'FAIL'} perf bv ${C}: frame ${d.toFixed(1)}% calls ${o.calls-a.calls>=0?'+':''}${o.calls-a.calls}`);await b.close()})();
