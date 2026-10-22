// reveal-stall-r22e12: tRvlTop.js <trace.json> [minMs=300] [lastSec=10] : long top-level tasks per thread in the last <lastSec> s of the trace, with the biggest nested events
// inside each (streams the one-event-per-line trace that Tracing ReturnAsStream writes; whole-file JSON is too big)
const fs=require('fs'),rl=require('readline');const MIN=+(process.argv[3]||300)*1000,LAST=+(process.argv[4]||10)*1e6;
const tn={},pn={},X=[];let tmax=0;
rl.createInterface({input:fs.createReadStream(process.argv[2])}).on('line',l=>{l=l.replace(/^[\[{"traceEvents:]*(?=\{)/,'').replace(/[,\]}]*$/,'');if(l[0]!=='{')return;let e;try{e=JSON.parse(l.endsWith('}')?l:l+'}')}catch(_){try{e=JSON.parse(l)}catch(__){return}}
 if(e.ph==='M'){if(e.name==='thread_name')tn[e.pid+':'+e.tid]=e.args.name;if(e.name==='process_name')pn[e.pid]=e.args.name;return}
 if(e.ph!=='X'||!e.dur)return;tmax=Math.max(tmax,e.ts+e.dur);if(e.dur>MIN/10)X.push({n:e.name,c:e.cat,ts:e.ts,dur:e.dur,pid:e.pid,tid:e.tid,a:e.args&&e.args.data?(e.args.data.functionName||'')+(e.args.data.url?'['+String(e.args.data.url).split('/').pop().slice(0,24)+']':'')+(e.args.data.type?'{'+e.args.data.type+'}':''):''})}).on('close',()=>{
 const top=X.filter(e=>(e.n==='ThreadControllerImpl::RunTask'||e.n==='RunTask'||e.c==='toplevel')&&e.dur>MIN&&e.ts>tmax-LAST&&(!process.env.GPU||/Gpu/.test(tn[e.pid+':'+e.tid]))).sort((a,b)=>a.ts-b.ts);const seen=new Set();
 for(const t of top){const k=t.pid+':'+t.tid;if(seen.has(k+':'+t.ts))continue;seen.add(k+':'+t.ts);if(top.some(o=>o!==t&&o.pid===t.pid&&o.tid===t.tid&&o.ts<=t.ts&&o.ts+o.dur>=t.ts+t.dur&&o.dur>t.dur))continue;
  const agg={};for(const c of X)if(c.pid===t.pid&&c.tid===t.tid&&c.ts>=t.ts&&c.ts+c.dur<=t.ts+t.dur&&c!==t&&c.n!==t.n&&!/RunTask|Scheduler|ExecuteDeferred|GPUTask|^WebGL$|Flush|PutChanged|BeginMainFrame|Animate|serviceScripted|FrameCallbacks|AsyncTask|v8.callFunction/.test(c.n)){const n=c.n+(c.a?'('+c.a+')':'');agg[n]=(agg[n]||0)+c.dur}
  console.log(`${((t.ts-tmax)/1e6).toFixed(2)}s ${(t.dur/1000|0)}ms ${pn[t.pid]||t.pid}/${tn[k]||t.tid} :: `+Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,9).map(([n,d])=>n+' '+(d/1000|0)).join(', '))}})
