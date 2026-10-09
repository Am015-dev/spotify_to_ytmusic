// PERF-2: heap snapshot of roam after a short drive, grouped by constructor (self size) + top retainers' owners for the biggest groups.
// usage: CITY=fra|ath DRIVE=20 node tools/eff/heapsnap.js <url local_dbg.html> [out.json]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2],OUT=process.argv[3]||'heap.json',CITY=process.env.CITY||'fra',DRIVE=+(process.env.DRIVE||20);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info','--js-flags=--expose-gc']});
const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(1800000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,120)));
await p.goto(URL+'?fast=1');await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},CITY);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
let t=Date.now();await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:200});const enter=(Date.now()-t)/1000;
await p.keyboard.down('ArrowUp');for(let i=0;i<DRIVE;i++){await p.waitForTimeout(1000);if(i%5===2){await p.keyboard.down('ArrowLeft');await p.waitForTimeout(300);await p.keyboard.up('ArrowLeft')}}await p.keyboard.up('ArrowUp');
const mem=await p.evaluate(()=>{gc();const r=__dbg.renderer;return{heap:+(performance.memory.usedJSHeapSize/1048576).toFixed(1),geoms:r.info.memory.geometries,tex:r.info.memory.textures}});
const cdp=await ctx.newCDPSession(p);let chunks=[];cdp.on('HeapProfiler.addHeapSnapshotChunk',e=>chunks.push(e.chunk));await cdp.send('HeapProfiler.takeHeapSnapshot',{reportProgress:false,captureNumericValue:false});
const S=JSON.parse(chunks.join(''));chunks=null;const m=S.snapshot.meta,NF=m.node_fields.length,EF=m.edge_fields.length,nt=m.node_types[0],et=m.edge_types[0];
const N=S.nodes,E=S.edges,str=S.strings,iT=m.node_fields.indexOf('type'),iN=m.node_fields.indexOf('name'),iS=m.node_fields.indexOf('self_size'),iE=m.node_fields.indexOf('edge_count'),eT=m.edge_fields.indexOf('type'),eN=m.edge_fields.indexOf('name_or_index'),eTo=m.edge_fields.indexOf('to_node');
const nN=N.length/NF;const grp={};let tot=0;for(let i=0;i<nN;i++){const ty=nt[N[i*NF+iT]],nm=ty==='object'||ty==='native'?str[N[i*NF+iN]]:'('+ty+')',s=N[i*NF+iS];tot+=s;const g=grp[nm]||(grp[nm]={n:0,mb:0});g.n++;g.mb+=s}
for(const k in grp)grp[k].mb=+(grp[k].mb/1048576).toFixed(2);
// properties holding the most self-size directly (owner.prop -> sum of child self sizes, children of arrays/objects one level)
const first=new Uint32Array(nN);for(let i=0,e=0;i<nN;i++){first[i]=e;e+=N[i*NF+iE]*EF}
const prop={};for(let i=0;i<nN;i++){const ty=nt[N[i*NF+iT]];if(ty!=='object'&&ty!=='closure')continue;const own=str[N[i*NF+iN]];for(let e=first[i],c=0;c<N[i*NF+iE];c++,e+=EF){const k=et[E[e+eT]];if(k!=='property'&&k!=='context')continue;const to=E[e+eTo]/NF;const tty=nt[N[to*NF+iT]];if(tty!=='array'&&tty!=='object')continue;
  // size of the target + its direct array elements
  let s=N[to*NF+iS];for(let f=first[to],d=0;d<N[to*NF+iE]&&d<200000;d++,f+=EF){if(et[E[f+eT]]==='element'||et[E[f+eT]]==='internal'){const t2=E[f+eTo]/NF;s+=N[t2*NF+iS];for(let g=first[t2],h=0;h<N[t2*NF+iE]&&h<64;h++,g+=EF){if(et[E[g+eT]]==='element'||et[E[g+eT]]==='property'){const t3=E[g+eTo]/NF;const t3t=nt[N[t3*NF+iT]];if(t3t==='object'||t3t==='array'||t3t==='number')s+=N[t3*NF+iS]}}}}
  if(s<512*1024)continue;const key=(k==='context'?'ctx:':own+'.')+str[E[e+eN]];prop[key]=(prop[key]||0)+s}}
const R={city:CITY,enter_s:enter,mem,errs,totMB:+(tot/1048576).toFixed(1),top:Object.entries(grp).sort((a,b)=>b[1].mb-a[1].mb).slice(0,40),holders:Object.entries(prop).map(([k,v])=>[k,+(v/1048576).toFixed(1)]).sort((a,b)=>b[1]-a[1]).slice(0,60)};
fs.writeFileSync(OUT,JSON.stringify(R,null,1));console.log(JSON.stringify({enter,mem,totMB:R.totMB}));console.log(R.top.slice(0,25).map(x=>x[0]+' '+x[1].n+' '+x[1].mb).join('\n'));console.log('--holders');console.log(R.holders.slice(0,40).map(x=>x.join(' ')).join('\n'));
await b.close()})().catch(e=>{console.error(e);process.exit(1)});
