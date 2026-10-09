// ath/v89b/heap.js <url> fra|ath [driveSec] : JS heap after GC (CDP), typed-array breakdown of scene geometry, renderer.info
const enter=require('../../bc/enter.js');const URL=process.argv[2],CITY=process.argv[3]||'fra',DRIVE=+(process.argv[4]||0);
const seed=CITY==='ath'?`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`:`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))`;
(async()=>{const t0=Date.now();const E=await enter(URL,{gfx:process.env.GFX||'normal',seed,desk:false});const {p,errs,ctx}=E;p.setDefaultTimeout(900000);await E.roamApi();const tLoad=(Date.now()-t0)/1000;
 const cdp=await ctx.newCDPSession(p);await cdp.send('HeapProfiler.enable');
 const heap=async()=>{const u0=await cdp.send('Runtime.getHeapUsage');console.log('preGC used/total MB',(u0.usedSize/1048576).toFixed(0),(u0.totalSize/1048576).toFixed(0));await cdp.send('HeapProfiler.collectGarbage');await cdp.send('HeapProfiler.collectGarbage');const u=await cdp.send('Runtime.getHeapUsage');return +(u.usedSize/1048576).toFixed(1)};
 const brk=()=>p.evaluate(()=>{const sc=__g9ev('scene'),r=__g9ev('renderer');const seen=new Set();let geo=0,geoB=0,inst=0,instB=0;const byP={};
  const ab=a=>{if(!a||!a.array||seen.has(a.array))return 0;seen.add(a.array);return a.array.byteLength};
  sc.traverse(o=>{if(!o.geometry)return;const g=o.geometry;let b=0;if(!seen.has(g)){seen.add(g);geo++;for(const k in g.attributes)b+=ab(g.attributes[k]);b+=ab(g.index)}if(o.isInstancedMesh){inst++;b+=ab(o.instanceMatrix)+ab(o.instanceColor)}geoB+=b;
   const ch=[];let q=o;while(q&&q!==sc){ch.unshift(q);q=q.parent}const nm=x=>x?(x.name||x.userData.lz||(x.userData.wbLod?'wbLod':'')||(x.userData.wbM?'wbM':'')||(x.userData.wbP?'wbP':'')||x.type)+'':'';const top=nm(ch[0])+'/'+nm(ch[1])+'/'+nm(ch[2]);byP[top]=(byP[top]||0)+b});
  const top=Object.entries(byP).sort((a,b)=>b[1]-a[1]).slice(0,25).map(([k,v])=>k+':'+(v/1048576).toFixed(1));
  const S=window.__str?{str:__str.sup(),sst:{b:__str.st.b,f:__str.st.f,max:+__str.st.max.toFixed(1),over:__str.st.over,relMB:+__str.st.relMB.toFixed(0),lzF:__str.st.lzF,lzB:__str.st.lzB,fr:__str.st.fr}}:{};const LZ=__g9ev('LZ');return {...S,lzMax:+LZ.max.toFixed(1),lzOver:LZ.over,geos:geo,sceneGeoMB:+(geoB/1048576).toFixed(1),inst,rGeo:r.info.memory.geometries,rTex:r.info.memory.textures,calls:r.info.render.calls,top}});
 const h0=await heap(),b0=await brk();console.log(JSON.stringify({city:CITY,load_s:tLoad,heapMB:h0,...b0}));
 if(DRIVE){const M=await p.evaluate(()=>{const N=__mho.HUB.nodes;return N.filter(a=>a&&a.nb&&a.nb.length).map(a=>[a.x,a.z])});
  // warp tour across the whole city (spread points) as a streaming stress; real drive is tPlay
  const pts=[];for(let i=0;i<DRIVE;i++)pts.push(M[Math.floor((i*7919)%M.length)]);let mx=0;
  for(const [x,z] of pts){await p.evaluate(([x,z])=>{const M=__mho,R=M.RO;M.warp(x,z,0,performance.now());R.x=x;R.z=z;R.y=M.gnd(x,z,R.y+60);R.v=0},[x,z]);await p.waitForTimeout(2500);const h=await p.evaluate(()=>performance.memory?performance.memory.usedJSHeapSize/1048576:0);if(h>mx)mx=h}
  const h1=await heap(),b1=await brk();console.log(JSON.stringify({after:DRIVE,heapMB:h1,peakNoGC:+mx.toFixed(0),...b1}))}
 console.log('errors',errs.length,errs.slice(0,2).join('|').slice(0,300));await E.b.close()})();
