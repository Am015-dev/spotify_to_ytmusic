// heap.js <builddir> <city> [driveSec]: phone profile, built page, no throttle. Drives N s then buckets CPU typed-array bytes of scene geometry.
const {chromium}=require('/opt/node22/lib/node_modules/playwright'),http=require('http'),fs=require('fs'),path=require('path');
const [DIR,C,DS='60']=process.argv.slice(2);
const s=http.createServer((q,r)=>{let f=path.join(path.resolve(DIR),decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':'application/octet-stream'});r.end(b)})}).listen(0,'127.0.0.1',async()=>{
 const b=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'},args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info','--js-flags=--expose-gc']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 await ctx.addInitScript(()=>{const st0=window.setTimeout;window.setTimeout=function(f,d,...a){if(d===120000&&typeof f==='function'&&/clearInterval\(iv\)/.test(String(f)))d=1800000;return st0.call(window,f,d,...a)}});const p=await ctx.newPage();p.setDefaultTimeout(1200000);const EV=(fn,a)=>p.evaluate(([c,a])=>__xc.ev('('+c+')('+JSON.stringify(a)+')'),[fn.toString(),a]);
 await p.goto('http://127.0.0.1:'+s.address().port+'/index.html?test='+C+'&draw=0'+(process.env.Q||''));await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:500,timeout:600000});
 const r=await EV(n=>new Promise(res=>{let i=0;const st=()=>{for(let k=0;k<150&&i<n*30;k++,i++){K.ArrowUp=true;K.ArrowLeft=((i/90|0)%3===0);roamStep(1/30);if(i%300===0)try{__tq.draw()}catch(e){}}if(i<n*30)return setTimeout(st,0);K.ArrowUp=K.ArrowLeft=false;try{__tq.draw()}catch(e){}
  setTimeout(()=>{try{gc();gc()}catch(e){}const B={},seenA=new Set(),seenG=new Set(),add=(k,b)=>{B[k]=(B[k]||0)+b};
  const TAGS=['trG','gk','dr','cd','keep','lz','P','simp','lf','bmk','gb','sim','ramp','sky','nr','pc'];
  scene.traverse(o=>{const g=o.geometry;if(!g||!g.attributes||seenG.has(g))return;seenG.add(g);const u=o.userData;let t=TAGS.find(x=>u[x])||'-';if(o.isInstancedMesh)t='IM:'+t;const md=g.userData.mfDone||0;
   let vis=o.visible;for(let q=o.parent;q&&vis;q=q.parent)vis=q.visible;const k=t+'|mf'+md+'|'+(vis?'v':'h')+(o.layers.mask&1?'':'L');
   for(const a of[...Object.values(g.attributes),g.index])if(a&&a.array&&!seenA.has(a.array.buffer)){seenA.add(a.array.buffer);add(k,a.array.buffer.byteLength)}
   if(o.isInstancedMesh){const pc=u.pc;if(pc){add('PCsrc',pc.src.byteLength+(pc.col?pc.col.byteLength:0)+pc.c.byteLength)}const ia=o.instanceMatrix.array;if(!seenA.has(ia.buffer)){seenA.add(ia.buffer);add('IMmat',ia.byteLength)}}});
  const out=Object.entries(B).map(([k,v])=>[k,Math.round(v/1048576)]).filter(x=>x[1]>=2).sort((a,b)=>b[1]-a[1]);
  res({heap:Math.round(performance.memory.usedJSHeapSize/1048576),gpu:typeof MEM_GPU!=='undefined'?Math.round(MEM_GPU.mb()):0,geoMB:Math.round(Object.values(B).reduce((a,b)=>a+b,0)/1048576),out,memf:MEMF.st,zst:MEMF.zst})},500)};st()}),+DS);
 console.log(C,JSON.stringify(r));await b.close();s.close()});
