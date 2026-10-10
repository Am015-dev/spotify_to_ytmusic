// tools/ld/lWorld.js <url> <outdir> [tag] : land-1 in-world check, Frankfurt roam at 852×393: waits for the LDS land swap, prints per type
// count / tris old→new (near, far) / draws, then shoots the densest tree spot near the start AFTER and BEFORE (same camera, LDS_ab).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [URL,OUT,TAG]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});const tg=TAG||'trees';const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:1280,height:720}})/* loads at 852×393 stall under swiftshader here; shots are taken after resizing */).newPage();p.setDefaultTimeout(1500000);const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'||/LDS/.test(m.text()))errs.push(m.text().slice(0,200))});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:600000});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:600000});const t0=Date.now();
 await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{timeout:1500000});
 console.log('roam in',(Date.now()-t0)/1000|0,'s');await p.evaluate(()=>{__mho.storyClose&&__mho.storyClose();try{__ju.autoClose(true)}catch(e){}});
 await p.waitForFunction(()=>__ld.lds&&__ld.lds.st,null,{timeout:300000});
 const r=await p.evaluate(()=>{const H=__mho.HUB,D=H.ptypes,S=__ld.lds.st,c={};for(const q of H.props)c[q.t]=(c[q.t]||0)+1;const tr=g=>g?(g.index?g.index.count:g.attributes.position.count)/3:0;
  const out={};for(const t in S){const d=D[t];out[t]=Object.assign({},S[t],{props:c[t],totOld:c[t]*S[t].old,totNear:c[t]*S[t].near,totFar:c[t]*S[t].far})}
  const T=H.props.filter(q=>/^tree/.test(q.t)),x0=window.__mho.RO?__mho.RO.x:2061,z0=window.__mho.RO?__mho.RO.z:0,G=new Map();
  for(const q of T){if(Math.hypot(q.x-x0,q.z-z0)>400)continue;const k=Math.floor(q.x/30)+','+Math.floor(q.z/30);G.set(k,(G.get(k)||0)+1)}let best=null,bn=0;for(const[k,n]of G)if(n>bn){bn=n;best=k}
  const all={};for(const t in c){const g=D[t]&&(D[t].gOld||D[t].g);let dr=0;H.grp.traverse(o=>{if(o.isInstancedMesh&&D[t]&&(o.geometry===D[t].g||o.geometry===D[t].gFar||o.geometry===D[t].gOld))dr++});all[t]={n:c[t],tri:tr(g),draws:dr}}
  const[a,bq]=best.split(',').map(Number);return{out,all,spot:{x:a*30+15,z:bq*30+15,n:bn}}});
 console.log('LDS',JSON.stringify(r));await p.setViewportSize({width:852,height:393});await p.waitForTimeout(2000);const{x,z}=r.spot;const y=await p.evaluate(([x,z])=>__art.gY(x,z),[x,z]);
 const cam=[x+26,y+7,z+18,x,y+3,z];
 for(const[off,nm]of[[0,'after'],[1,'before']]){await p.evaluate(o=>__ld.ldsAB(o),off);await p.evaluate(c=>__gnb.cam(c),cam);await p.waitForTimeout(3000);const fr=await p.evaluate(()=>{const R=__art.renderer,i=R.info;i.autoReset=false;i.reset();__mho.HUB&&0;return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const o={tris:i.render.triangles,calls:i.render.calls};i.autoReset=true;r(o)})))});await p.screenshot({path:`${OUT}/${tg}_${nm}.png`});console.log('shot',nm,`${OUT}/${tg}_${nm}.png`,'frame',JSON.stringify(fr))}
 await p.evaluate(()=>__ld.ldsAB(0));console.log('ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
