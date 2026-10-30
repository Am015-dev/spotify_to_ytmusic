// census.js <url> <city> <outjson>: phone profile; tracks every BufferAttribute needsUpdate during GO bug/no-jserr-drive, then lists written meshes vs memFree management
const {chromium}=require('playwright');const fs=require('fs');
const [U,CITY,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();const E=(fn,a)=>p.evaluate(([src,a])=>{window.__dbg=1;return window.__oc.ev('('+src+')('+JSON.stringify(a)+')')},[fn.toString(),a===undefined?null:a]);p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto(U+'?test='+CITY+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:500,timeout:180000});
 const info=await E(()=>{const BA=THREE.BufferAttribute.prototype,d=Object.getOwnPropertyDescriptor(BA,'needsUpdate');window.__NU=new Map();
  Object.defineProperty(BA,'needsUpdate',{set(v){if(v===true){const n=(__NU.get(this)||0)+1;__NU.set(this,n);if(n===1||n===50)(window.__ST=window.__ST||new Map()).set(this,(new Error().stack||'').split('\n').slice(2,5).map(l=>l.trim().replace(/\(.*\//,'(').slice(0,70)).join(' < '))}d.set.call(this,v)},configurable:true});
  return {lowmem:typeof LOWMEM!=='undefined'&&LOWMEM,memFree:TUNE.memFree,gpuStr:TUNE.gpuStr,ts:MEMF.ts}});
 await p.evaluate(v=>window.__chk.go('bug/no-jserr-drive',v),CITY==='ath'?1:0);
 await p.waitForFunction(()=>!/…$/.test(window.__chk.said()||''),null,{timeout:900000,polling:1000});
 const said=await p.evaluate(()=>window.__chk.said());
 const rep=await E(()=>{const own=new Map();scene.traverse(o=>{const g=o.geometry;if(!g)return;for(const k in g.attributes)own.set(g.attributes[k],[o,k]);if(o.instanceMatrix)own.set(o.instanceMatrix,[o,'iM']);if(o.instanceColor)own.set(o.instanceColor,[o,'iC']);if(g.index)own.set(g.index,[o,'@i'])});
  const inRO=o=>{for(let q=o;q;q=q.parent)if(q===RO.grp)return true;return false};const S=new Set(MEMF.S.map(e=>e.m)),G=new Set((MEMF.G||[]).map(e=>e.m));
  const rows=[];for(const [a,n] of __NU){if(n<20)continue;const w=own.get(a);if(!w){rows.push({n,orphan:1,usage:a.usage===THREE.StaticDrawUsage?'static':'dyn',inst:!!a.isInstancedBufferAttribute,isz:a.itemSize,cnt:a.count,arr:a.array?a.array.constructor.name:'NULL',st:(window.__ST&&__ST.get(a))||''});continue}const [o,k]=w,g=o.geometry;
   const path=[];for(let q=o;q&&path.length<4;q=q.parent)path.push((q.name||q.type)+(Object.keys(q.userData||{}).length?'{'+Object.keys(q.userData).join(',')+'}':''));
   rows.push({n,k,type:o.type,isMesh:!!o.isMesh,usage:a.usage===THREE.StaticDrawUsage?'static':'dyn',arr:a.array?a.array.constructor.name:'NULL',norm:a.normalized,mfDone:g.userData.mfDone||0,S:S.has(o),G:G.has(o),seen:MEMF.seen.has(o),underCar:inRO(o),st:(window.__ST&&__ST.get(a))||'',vis:o.visible,path:path.join(' < ')})}
  return rows.sort((a,b)=>b.n-a.n)});
 fs.writeFileSync(OUT,JSON.stringify({info,said,errs,rep},null,1));console.log(said.slice(0,300));console.log('rows',rep.length,'errs',errs.length);await b.close()})();
