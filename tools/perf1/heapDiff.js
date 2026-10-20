// heapDiff.js <built page url with ?lowmem=1[&tstream=1]> <fra|ath> [roamSec=30]: heap snapshot by constructor at ready and after a simulated roam (roamStep), diff in MB. ios-r18m.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true});const p=await ctx.newPage();
await p.addInitScript('window.__dbg=1');await p.goto(process.argv[2]+'&test='+process.argv[3]+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__oc,null,{polling:250,timeout:150000});
const cdp=await ctx.newCDPSession(p);
const snap=async()=>{let s='';const f=e=>{s+=e.chunk};cdp.on('HeapProfiler.addHeapSnapshotChunk',f);await cdp.send('HeapProfiler.collectGarbage');await cdp.send('HeapProfiler.takeHeapSnapshot',{reportProgress:false});cdp.off('HeapProfiler.addHeapSnapshotChunk',f);
const J=JSON.parse(s),M=J.snapshot.meta,F=M.node_fields,nf=F.length,iT=F.indexOf('type'),iN=F.indexOf('name'),iS=F.indexOf('self_size'),T=M.node_types[0],S=J.strings,N=J.nodes,agg={};let tot=0;
for(let i=0;i<N.length;i+=nf){const ty=T[N[i+iT]],nm=ty==='object'||ty==='closure'?S[N[i+iN]]:ty==='string'||ty==='concatenated string'?'(string)':ty==='array'?'(array)':ty==='number'?'(heap number)':'('+ty+')';const k=nm.slice(0,40),z=N[i+iS];tot+=z;const a=agg[k]||(agg[k]=[0,0]);a[0]+=z;a[1]++}return{agg,tot}};
const A=await snap();const sec=+(process.argv[4]||30);
await p.evaluate(s=>__oc.ev('K.ArrowUp=true;for(let i=0;i<'+s+'*30;i++){K.ArrowLeft=((i/90|0)%3===0);roamStep(1/30);if(i%300===299)try{__tq.draw()}catch(e){}}K.ArrowUp=K.ArrowLeft=false;'),sec);await p.waitForTimeout(3000);
const B=await snap();console.log('total MB',(A.tot/1048576).toFixed(0),'->',(B.tot/1048576).toFixed(0));
const dif=(A,B)=>{const keys=new Set([...Object.keys(A.agg),...Object.keys(B.agg)]);console.log([...keys].map(k=>[k,((B.agg[k]||[0])[0]-(A.agg[k]||[0])[0])/1048576,(B.agg[k]||[0,0])[1]-(A.agg[k]||[0,0])[1]]).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,8).map(([k,d,n])=>k+' '+d.toFixed(1)+' MB ('+(n>=0?'+':'')+n+')').join('\n'))};
dif(A,B);await p.evaluate(()=>__oc.ev("typeof MEMF!=='undefined'?JSON.stringify(MEMF.zst):''")).then(console.log);
await p.evaluate(s=>__oc.ev('K.ArrowUp=true;for(let i=0;i<'+s+'*30;i++){K.ArrowLeft=((i/90|0)%3===0);roamStep(1/30);if(i%300===299)try{__tq.draw()}catch(e){}}K.ArrowUp=K.ArrowLeft=false;'),sec);await p.waitForTimeout(3000);const C=await snap();console.log('--- 2nd roam, total',(C.tot/1048576).toFixed(0));dif(B,C);await p.evaluate(()=>__oc.ev("typeof MEMF!=='undefined'?JSON.stringify(MEMF.zst):''")).then(console.log);await b.close()})();
