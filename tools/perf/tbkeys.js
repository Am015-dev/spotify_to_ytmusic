// tbkeys.js (tb1, 2026-10-30): per-key vertex counts (TB.rec = material#hubTile) + a hash of the building rows (HUB.bld x,z,hw,hd,h,trY,trOff,trBase) from a flag-OFF and a flag-ON page, and the diff.
//   node tools/perf/tbkeys.js <base url of the build, e.g. http://127.0.0.1:8841/index.html> [out.json]
// Same `?test=fra&draw=0` start as tools/tChkGo.js; with ?tb1=1 the deferred queue is drained first (TB_drain). Read-only.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const BASE=process.argv[2],OUT=process.argv[3]||'';
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const run=async(b,q)=>{const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:UA}),p=await ctx.newPage();p.setDefaultTimeout(120000);
  await p.goto(BASE+'?'+q+'test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});
  const R=await p.evaluate(()=>__tk.q(`(()=>{if(TB.on)TB_drain();const h=a=>{let x=2166136261;for(const s of a){for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}}return(x>>>0).toString(16)},f=v=>typeof v==='number'?v.toFixed(3):String(v),
      rows=HUB.bld.map(b=>[b.x,b.z,b.hw,b.hd,b.h,b.trY,b.trOff,b.trBase].map(f).join(',')).sort();return{dbg:TB.dbg,cat:TB.cat,on:TB.on,rec:[...TB.rec].map(([k,n])=>k.replace(/^[^#]*#/,'#')+':'+n).sort(),bldN:rows.length,bld:h(rows),rows:rows.length<20000?rows:[]}})()`));
  await ctx.close();return R};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const A=await run(b,'tbdbg=1&'),B=await run(b,'tb1=1&tbdbg=1&');await b.close();
  const cnt=a=>{const m=new Map();for(const s of a)m.set(s,(m.get(s)||0)+1);return m},ma=cnt(A.rec),mb=cnt(B.rec),d=[];for(const k of new Set([...ma.keys(),...mb.keys()]))if(ma.get(k)!==mb.get(k))d.push(k+' off x'+ma.get(k)+' on x'+mb.get(k));
  const rd=[];if(A.rows.length&&B.rows.length){const sa=new Set(A.rows),sb=new Set(B.rows);for(const r of A.rows)if(!sb.has(r)){rd.push('off only '+r);if(rd.length>6)break}}
  console.log('cat off',JSON.stringify(A.cat),'on',JSON.stringify(B.cat));console.log('on flags',A.on,B.on,'· keys off',ma.size,'on',mb.size,'· key diffs',d.length,'· buildings off',A.bldN,A.bld,'on',B.bldN,B.bld,A.bld===B.bld?'EQUAL':'DIFFER');d.slice(0,12).forEach(x=>console.log(' key',x));rd.forEach(x=>console.log(' ',x));
  if(A.dbg&&B.dbg){const m=new Map();for(const s of A.dbg)m.set(s,(m.get(s)||0)+1);for(const s of B.dbg)m.set(s,(m.get(s)||0)-1);const x=[...m].filter(([s,n])=>n);console.log('piece diffs',x.length);x.slice(0,24).forEach(([s,n])=>console.log('  ',n>0?'off only':'on only',s))}
  if(OUT)fs.writeFileSync(OUT,JSON.stringify({A,B,d}))})();
