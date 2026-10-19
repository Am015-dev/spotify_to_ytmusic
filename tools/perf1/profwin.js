// perf-r10e: inclusive callers inside tBoot's long-frame windows. node tools/perf1/profwin.js <PROFOUT json> [fnName] [minMs]
// no fnName: top inclusive functions over all windows; with fnName: the caller chains (3 up) of samples under fnName.
const fs=require('fs');const D=JSON.parse(fs.readFileSync(process.argv[2]));const P=D.profile,FN=process.argv[3],MIN=+(process.argv[4]||50);
const by={},par={};for(const n of P.nodes)by[n.id]=n;for(const n of P.nodes)for(const c of n.children||[])par[c]=n.id;
let ts=P.startTime;const T=P.samples.map((s,i)=>ts+=P.timeDeltas[i]);const nm=id=>{const c=by[id].callFrame;return(c.functionName||'(anon)')+':'+(c.lineNumber+1)};
const inc={},ch={};let N=0;
for(const [i,a,b] of D.win){if(D.out[i][1]<MIN)continue;for(let k=0;k<T.length;k++){const t=T[k]/1000-D.off;if(t<a||t>b)continue;N++;const st=[];for(let q=P.samples[k];q!=null;q=par[q])st.push(nm(q));
 const seen=new Set();for(const m of st)if(!seen.has(m)){seen.add(m);inc[m]=(inc[m]||0)+1}
 if(FN){const j=st.findIndex(m=>m.startsWith(FN+':'));if(j>=0){const key=st.slice(j,j+5).join(' < ');ch[key]=(ch[key]||0)+1}}}}
const top=o=>Object.entries(o).sort((x,y)=>y[1]-x[1]).slice(0,+(process.env.N||25)).forEach(([k,v])=>console.log((v/N*100).toFixed(1).padStart(5)+'% '+k.slice(0,220)));
console.log('samples '+N);top(FN?ch:inc);
