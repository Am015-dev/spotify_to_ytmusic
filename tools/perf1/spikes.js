// perf-13: spikes.js <cpuprofile> [minMs=50] : split a tFrame PROF=1 profile into frames (runs of samples under window.__tick) and print,
// for every frame >= minMs, its length and the top self-time functions plus the top inclusive "owner" functions (named game functions on the stack).
const fs=require('fs');const P=JSON.parse(fs.readFileSync(process.argv[2]));const MIN=+(process.argv[3]||50);
const by={};for(const n of P.nodes)by[n.id]=n;const par={};for(const n of P.nodes)for(const c of n.children||[])par[c]=n.id;
const nm=n=>(n.callFrame.functionName||'(anon)')+':'+n.callFrame.lineNumber;
const stk=id=>{const s=[];while(id!=null){s.push(by[id]);id=par[id]}return s};
let fr=null;const frames=[];const dts=P.timeDeltas;let t=P.startTime;
const inTick=s=>s.some(n=>/__tick$/.test(n.callFrame.functionName));
P.samples.forEach((id,i)=>{t+=dts[i]||0;const s=stk(id);const gc=nm(s[0]).startsWith('(garbage');if(inTick(s)||(gc&&fr)){if(!fr)fr={t0:t,t1:t,self:{},inc:{}};fr.t1=t;const d=(dts[i+1]||0)/1000;
 const k=nm(s[0]);fr.self[k]=(fr.self[k]||0)+d;const seen=new Set();for(const n of s){const k2=nm(n);if(seen.has(k2))continue;seen.add(k2);fr.inc[k2]=(fr.inc[k2]||0)+d}}else if(fr){frames.push(fr);fr=null}});
const top=(o,n)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n).map(e=>e[0]+' '+e[1].toFixed(0)).join(', ');
for(const f of frames.filter(f=>(f.t1-f.t0)/1000>=MIN).sort((a,b)=>(b.t1-b.t0)-(a.t1-a.t0)).slice(0,+(process.env.N||8))){
 console.log('FRAME '+((f.t1-f.t0)/1000).toFixed(0)+' ms\n  self: '+top(f.self,8)+'\n  inc:  '+top(Object.fromEntries(Object.entries(f.inc).filter(e=>!/^(\(|__tick|f:|r:|\(anon)/.test(e[0]))),22))}
console.log('frames',frames.length,'>=MIN',frames.filter(f=>(f.t1-f.t0)/1000>=MIN).length);
