const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [port,city,vw,vh,out]=process.argv.slice(2);
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--enable-precise-memory-info','--ignore-gpu-blocklist']});
 const mob=+vw<900;
 const c=await b.newContext({viewport:{width:+vw,height:+vh},hasTouch:mob,isMobile:mob});
 await c.addInitScript(([city])=>{try{localStorage.setItem('mho_city@1',city);if(city==='ath')localStorage.setItem('mho_athpre','1')}catch(e){}
  window.__ft=[];let l=0;const f=t=>{if(l)window.__ft.push(t-l);l=t;requestAnimationFrame(f)};requestAnimationFrame(f)},[city]);
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,150)));
 await p.goto(`http://localhost:${port}/mainhattan-overdrive/index.html`);
 await p.waitForTimeout(4000);
 await p.evaluate(()=>{const b=document.getElementById('careerBtn');b&&b.click()});
 await p.waitForTimeout(8000);
 await p.keyboard.down('ArrowUp');await p.keyboard.down('KeyW');
 const S=[];
 for(let s=0;s<25;s++){await p.waitForTimeout(1000);
  S.push(await p.evaluate(()=>{const ft=window.__ft.splice(0);ft.sort((a,b)=>a-b);let n=0;try{scene.traverse(()=>n++)}catch(e){n=-1}
   const r=typeof renderer!=='undefined'?renderer.info:null;
   return{fps:ft.length,ms:ft.length?+(ft.reduce((a,b)=>a+b,0)/ft.length).toFixed(1):null,p95:ft.length?+ft[Math.floor(ft.length*.95)].toFixed(1):null,
    calls:r&&r.render.calls,tris:r&&r.render.triangles,geo:r&&r.memory.geometries,tex:r&&r.memory.textures,objs:n,
    heapMB:performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(1):null,cid:typeof CID!=='undefined'?CID:null}}))}
 const med=k=>{const v=S.slice(5).map(x=>x[k]).filter(x=>x!=null).sort((a,b)=>a-b);return v[Math.floor(v.length/2)]};
 const sum={port,city,vw,vh,cid:S[0].cid,ms:med('ms'),p95:med('p95'),fps:med('fps'),calls:med('calls'),tris:med('tris'),geo:med('geo'),tex:med('tex'),objs:med('objs'),heapMB:med('heapMB'),heapEnd:S[S.length-1].heapMB,errs};
 require('fs').writeFileSync(out,JSON.stringify({sum,samples:S},null,1));console.log(JSON.stringify(sum));await b.close()})();
