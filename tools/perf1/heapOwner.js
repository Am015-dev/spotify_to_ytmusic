// perf-13: heapOwner.js <heap.json from tFrame HEAP=1 HEAPOUT=...> fn1,fn2,... : sampled MB attributed to the innermost listed function on each stack
const P=JSON.parse(require('fs').readFileSync(process.argv[2]));const A=process.argv[3].split(',');const tot={};let all=0;
const walk=(n,st)=>{const f=n.callFrame.functionName;const s2=st.concat(f);all+=n.selfSize;
 // attribute to the innermost listed ancestor
 for(let i=s2.length-1;i>=0;i--)if(A.includes(s2[i])){tot[s2[i]]=(tot[s2[i]]||0)+n.selfSize;break}
 for(const c of n.children||[])walk(c,s2)};walk(P.head,[]);
console.log('all MB',(all/1048576).toFixed(0));console.log(Object.entries(tot).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+' '+(e[1]/1048576).toFixed(0)).join(', '))
