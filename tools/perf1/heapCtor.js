// heapCtor.js <built page url with ?lowmem=1> <fra|ath>: heap snapshot at ready, top owners by constructor/type (self size, MB). ios-r18f.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true});const p=await ctx.newPage();
await p.goto(process.argv[2]+'&test='+process.argv[3]+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});
const cdp=await ctx.newCDPSession(p);let s='';cdp.on('HeapProfiler.addHeapSnapshotChunk',e=>{s+=e.chunk});await cdp.send('HeapProfiler.collectGarbage');await cdp.send('HeapProfiler.takeHeapSnapshot',{reportProgress:false});
const J=JSON.parse(s),M=J.snapshot.meta,F=M.node_fields,nf=F.length,iT=F.indexOf('type'),iN=F.indexOf('name'),iS=F.indexOf('self_size'),T=M.node_types[0],S=J.strings,N=J.nodes,agg={};let tot=0;
for(let i=0;i<N.length;i+=nf){const ty=T[N[i+iT]],nm=ty==='object'||ty==='closure'?S[N[i+iN]]:ty==='string'||ty==='concatenated string'?'(string)':ty==='array'?'(array)':ty==='number'?'(heap number)':'('+ty+')';const k=nm.slice(0,40),z=N[i+iS];tot+=z;const a=agg[k]||(agg[k]=[0,0]);a[0]+=z;a[1]++}
console.log('total MB',(tot/1048576).toFixed(0));console.log(Object.entries(agg).sort((a,b)=>b[1][0]-a[1][0]).slice(0,12).map(([k,v])=>k+' '+(v[0]/1048576).toFixed(1)+' MB ('+v[1]+')').join('\n'));await b.close()})();
