// roots.js <cpuprofile> : inclusive time of each task entry (children of (root)) -> first named frame below
const P=JSON.parse(require('fs').readFileSync(process.argv[2]));const by={},par={};for(const n of P.nodes){by[n.id]=n;for(const c of n.children||[])par[c]=n.id}
const cnt={};P.samples.forEach((s,i)=>{cnt[s]=(cnt[s]||0)+(P.timeDeltas[i]||0)});const r={};const key=n=>(n.callFrame.functionName||'(anon)')+':'+n.callFrame.lineNumber;
for(const id in cnt){let c=+id;const st=[];while(c!=null){st.push(by[c]);c=par[c]}st.reverse();const k=st.slice(1,4).map(key).join(' > ');r[k]=(r[k]||0)+cnt[id]}
Object.entries(r).sort((a,b)=>b[1]-a[1]).slice(0,+(process.env.N||14)).forEach(([k,v])=>console.log((v/1e3).toFixed(0).padStart(7)+'ms '+k))
