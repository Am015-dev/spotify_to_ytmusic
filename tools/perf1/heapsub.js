// perf-r10e: sampled allocation (tBoot HEAP=1 HEAPOUT=file) for one subsystem: top self functions whose stack contains SUB, with 2 callers.
// node tools/perf1/heapsub.js <heapout.json> <SUB> [topN]
const fs=require('fs');const P=JSON.parse(fs.readFileSync(process.argv[2])),SUB=process.argv[3],N=+(process.argv[4]||25);const self={};let tot=0;
const walk=(n,st)=>{const k=(n.callFrame.functionName||'(anon)')+':'+(n.callFrame.lineNumber+1);const s2=st.concat(k);if(s2.some(x=>x.startsWith(SUB+':'))){const key=k+' <'+st.slice(-2).reverse().join('<');self[key]=(self[key]||0)+n.selfSize;tot+=n.selfSize}for(const c of n.children)walk(c,s2)};walk(P.head,[]);
console.log(SUB+' total '+(tot/1048576).toFixed(0)+' MB');Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,N).forEach(([k,v])=>console.log((v/1048576).toFixed(1).padStart(6)+'MB '+k.slice(0,170)));
