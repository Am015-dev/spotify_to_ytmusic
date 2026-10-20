// heapOwn.js <built page url with ?lowmem=1> <fra|ath> [snapshot out]: device-like heap at ready (IOSM_dev, GC'd), top owners by
// constructor/type AND by retainer = first global name on the BFS path from the roots (window property or script-scope let/const). ios-r18s.
// SNAP=<file> reads a saved snapshot instead of booting. N=<rows> (default 15).
const fs=require('fs');const N0=+(process.env.N||15);
async function take(url,city,out){const {chromium}=require('/opt/node22/lib/node_modules/playwright');
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info','--js-flags=--expose-gc']});
 const ctx=await b.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true});const p=await ctx.newPage();
 await p.goto(url+'&test='+city+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:180000});
 const h=await p.evaluate(async()=>{try{IOSM_dev()}catch(e){}gc();await new Promise(r=>setTimeout(r,300));gc();return Math.round(performance.memory.usedJSHeapSize/1048576)});
 console.log('device-like heap at ready (usedJSHeapSize) '+h+' MB');
 const cdp=await ctx.newCDPSession(p);const parts=[];cdp.on('HeapProfiler.addHeapSnapshotChunk',e=>parts.push(e.chunk));
 await cdp.send('HeapProfiler.collectGarbage');await cdp.send('HeapProfiler.takeHeapSnapshot',{reportProgress:false});await b.close();
 const s=parts.join('');if(out)fs.writeFileSync(out,s);return s}
function anal(s){const J=JSON.parse(s),M=J.snapshot.meta,F=M.node_fields,nf=F.length,iT=F.indexOf('type'),iN=F.indexOf('name'),iS=F.indexOf('self_size'),iE=F.indexOf('edge_count');
 const T=M.node_types[0],EF=M.edge_fields,ef=EF.length,eT=EF.indexOf('type'),eN=EF.indexOf('name_or_index'),eTo=EF.indexOf('to_node'),ET=M.edge_types[0],S=J.strings,Nd=J.nodes,E=J.edges,n=Nd.length/nf;
 const first=new Uint32Array(n+1);for(let i=0,e=0;i<n;i++){first[i]=e;e+=Nd[i*nf+iE]*ef}first[n]=E.length;
 const kind=i=>{const ty=T[Nd[i*nf+iT]];return ty==='object'||ty==='closure'?S[Nd[i*nf+iN]].slice(0,40):ty==='string'||ty==='concatenated string'||ty==='sliced string'?'(string)':ty==='array'?'(array)':ty==='number'?'(heap number)':'('+ty+')'};
 const ctor={};let tot=0;for(let i=0;i<n;i++){const z=Nd[i*nf+iS];tot+=z;const k=kind(i),a=ctor[k]||(ctor[k]=[0,0]);a[0]+=z;a[1]++}
 // owner: seeds are the names held by global holders (script Context = a Context with > 100 vars, then Window properties; '_' names last),
 // BFS from all seeds at once (first reached wins), then the rest from the root as '(other)'.
 const nctx=i=>{let c=0;for(let e=first[i];e<first[i+1];e+=ef)if(ET[E[e+eT]]==='context')c++;return c};
 const isG=i=>{const ty=T[Nd[i*nf+iT]],nm=S[Nd[i*nf+iN]];return ty==='object'&&/^Window( |$)/.test(nm)||nm==='system / Context'&&nctx(i)>1000};
 const L=[],LI={},li=k=>LI[k]!=null?LI[k]:(L.push(k),LI[k]=L.length-1);const lab=new Int32Array(n).fill(-1),seen=new Uint8Array(n),G=[];
 for(let i=0;i<n;i++)if(isG(i)){G.push(i);seen[i]=1}if(process.env.DBG)console.log('globals',G.map(g=>S[Nd[g*nf+iN]].slice(0,20)+':'+nctx(g)).join(' '));const sd=[[],[],[]];
 for(const g of G)for(let e=first[g];e<first[g+1];e+=ef){const ty=ET[E[e+eT]];if(ty!=='property'&&ty!=='context')continue;const nm=String(S[E[e+eN]]),j=E[e+eTo]/nf;sd[nm[0]==='_'?2:ty==='context'?0:1].push([j,nm])}
 const cl=i=>T[Nd[i*nf+iT]]==='closure';   // a function does not own what its scope holds
 const q=new Int32Array(n);let h=0,t=0;const run=()=>{while(h<t){const i=q[h++];for(let e=first[i];e<first[i+1];e+=ef){const ty=ET[E[e+eT]];if(ty==='weak'||ty==='shortcut'||cl(i)&&S[E[e+eN]]==='context')continue;const j=E[e+eTo]/nf;if(seen[j])continue;seen[j]=1;lab[j]=lab[i];q[t++]=j}}};
 for(const tier of sd){for(const [j,nm] of tier)if(!seen[j]){seen[j]=1;lab[j]=li(nm);q[t++]=j}run()}
 for(const g of G)lab[g]=li('(globals)');seen[0]=1;lab[0]=li('(other)');q[t++]=0;
 {const S0=new Uint8Array(seen);while(h<t){const i=q[h++];for(let e=first[i];e<first[i+1];e+=ef){const j=E[e+eTo]/nf;if(seen[j])continue;seen[j]=1;lab[j]=lab[0];q[t++]=j}}}
 const own={};for(let i=0;i<n;i++){const k=seen[i]?L[lab[i]]:'(unreached)',z=Nd[i*nf+iS],a=own[k]||(own[k]={z:0,c:{}});a.z+=z;const c=kind(i);a.c[c]=(a.c[c]||0)+z}
 const mb=z=>(z/1048576).toFixed(1);console.log('snapshot total MB '+mb(tot));console.log('-- by constructor/type');
 Object.entries(ctor).sort((a,b)=>b[1][0]-a[1][0]).slice(0,N0).forEach(([k,v])=>console.log(mb(v[0]).padStart(7)+' MB  '+k+' ('+v[1]+')'));
 console.log('-- by retainer (first global name on the path)');
 Object.entries(own).sort((a,b)=>b[1].z-a[1].z).slice(0,N0).forEach(([k,v])=>console.log(mb(v.z).padStart(7)+' MB  '+k+'  ['+Object.entries(v.c).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([c,z])=>c+' '+mb(z)).join(', ')+']'))
 // retained: what is no longer reachable from the globals (same rules) when that one global name is dropped = what freeing it gives back.
 const reach=skip=>{const sn=new Uint8Array(n);for(const g of G)sn[g]=1;const qq=new Int32Array(n);let a=0,b=0,z=0;for(const tier of sd)for(const [j,nm] of tier)if(nm!==skip&&!sn[j]){sn[j]=1;qq[b++]=j}
  while(a<b){const i=qq[a++];z+=Nd[i*nf+iS];for(let e=first[i];e<first[i+1];e+=ef){const ty=ET[E[e+eT]];if(ty==='weak'||ty==='shortcut'||cl(i)&&S[E[e+eN]]==='context')continue;const j=E[e+eTo]/nf;if(!sn[j]){sn[j]=1;qq[b++]=j}}}return z};
 const all=reach(null);console.log('-- retained by global (MB freed if that name let go; reachable from globals '+mb(all)+')');
 Object.entries(own).sort((a,b)=>b[1].z-a[1].z).filter(([k])=>k[0]!=='(').slice(0,N0).map(([k])=>[k,all-reach(k)]).sort((a,b)=>b[1]-a[1]).forEach(([k,z])=>console.log(mb(z).padStart(7)+' MB  '+k))}
(async()=>{const s=process.env.SNAP?fs.readFileSync(process.env.SNAP,'utf8'):await take(process.argv[2],process.argv[3],process.argv[4]);anal(s)})();
