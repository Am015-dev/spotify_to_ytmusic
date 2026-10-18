// tR8cyan (r8c): bisect the near-camera cyan at the Athens spawn. node tools/tR8cyan.js <base url> <outdir> [ath|fra]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const [BASE,OUT,city='ath']=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(900000);
 p.on('pageerror',e=>console.log('ERR',String(e).slice(0,160)));
 await p.goto(BASE+'?test='+city);await p.waitForFunction(()=>window.__tk&&window.__tq&&__tq.ready,null,{timeout:600000});await p.waitForTimeout(3000);
 await p.screenshot({path:OUT+'/'+city+'_spawn.jpg',type:'jpeg',quality:80});
 const r=await p.evaluate(s=>__tk.q(s),'('+(()=>{const cv=renderer.domElement,W=200,H=92,c2=document.createElement('canvas');c2.width=W;c2.height=H;const g=c2.getContext('2d',{willReadFrequently:true});
  const cy=()=>{composer.render();g.drawImage(cv,0,0,W,H);const d=g.getImageData(0,0,W,H).data;let n=0,m=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(d[i+2]>200&&d[i+1]>180&&d[i]<190){n++;if(y>H*2/3)m++}}return[n,m]};
  const out={base:cy()},cp=camera.position;const L=[];scene.traverseVisible(o=>{if(!(o.isMesh||o.isPoints||o.isSprite||o.isLine))return;L.push(o)});
  const kind=o=>o.isInstancedMesh?'IM':o.isPoints?'P':o.isSprite?'S':o.isLine?'L':o.material&&o.material.transparent?'MT':'M';
  const groups={};for(const o of L){const k=kind(o);(groups[k]=groups[k]||[]).push(o)}
  for(const k in groups){groups[k].forEach(o=>o.visible=false);out['hide_'+k+'_'+groups[k].length]=cy();groups[k].forEach(o=>o.visible=true)}
  // per-object: objects whose hiding changes the count
  const hits=[];const b0=out.base[0];for(const o of L){o.visible=false;const v=cy();o.visible=true;if(b0-v[0]>b0*.05+3){const s=o.geometry&&(o.geometry.boundingSphere||(o.geometry.computeBoundingSphere(),o.geometry.boundingSphere));const wp=o.getWorldPosition(new THREE.Vector3());
    hits.push({name:o.name,kind:kind(o),drop:b0-v[0],ud:JSON.stringify(o.userData).slice(0,80),par:o.parent&&(o.parent.name||o.parent.type),r:s&&+s.radius.toFixed(1),dist:+wp.distanceTo(cp).toFixed(1),col:o.material&&o.material.color&&o.material.color.getHexString(),op:o.material&&o.material.opacity,tr:o.material&&o.material.transparent,geo:o.geometry&&o.geometry.type,cnt:o.count})}}
  out.hits=hits.sort((a,b)=>b.drop-a.drop).slice(0,8);out.n=L.length;return out}).toString()+')()');
 console.log(JSON.stringify(r));await b.close()})();
