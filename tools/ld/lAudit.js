// tools/ld/lAudit.js <url> <city fra|ath> [out.json] : land-1 prop audit in roam: per prop type count, tris/instance, total tris, draws, source (kenney/proc/ld)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [URL,CITY,OUT]=process.argv.slice(2);const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:600000});
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath')localStorage.setItem('mho_city@1','ath')},CITY);
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:600000});
 const t0=Date.now();await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{timeout:900000});console.log('roam in',(Date.now()-t0)/1000,'s');
 const r=await p.evaluate(()=>{const H=__mho.HUB,D=H.ptypes,cnt={};for(const q of H.props)cnt[q.t]=(cnt[q.t]||0)+1;const tri=g=>g?(g.index?g.index.count:g.attributes.position.count)/3:0;
  const draws={};H.grp.traverse(o=>{if(o.isInstancedMesh)for(const k in D)if(D[k].g===o.geometry){draws[k]=(draws[k]||0)+1}});
  const out=[];for(const k in cnt){const d=D[k];out.push({t:k,n:cnt[k],tri:tri(d&&d.g),tot:cnt[k]*tri(d&&d.g),draws:draws[k]||0})}out.sort((a,b)=>b.tot-a.tot);
  let ldw=(window.__ld&&__ld.w&&__ld.w.on||[]).map(E=>({id:E.id,tris:E.tris}));return{props:out,n:H.props.length,ldw}});
 console.log(JSON.stringify(r));if(OUT)fs.writeFileSync(OUT,JSON.stringify(r,null,1));console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
