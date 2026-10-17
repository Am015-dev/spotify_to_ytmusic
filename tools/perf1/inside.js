// inside.js <cpuprofile> <fnName> : self time of functions running under fnName (and the direct child of fnName on that path)
const P=JSON.parse(require('fs').readFileSync(process.argv[2]));const F=process.argv[3];const by={},par={};for(const n of P.nodes){by[n.id]=n;for(const c of n.children||[])par[c]=n.id}
const cnt={};P.samples.forEach((s,i)=>{cnt[s]=(cnt[s]||0)+(P.timeDeltas[i]||0)});const r={};const key=n=>(n.callFrame.functionName||'(anon)')+':'+n.callFrame.lineNumber;
for(const id in cnt){let c=+id;const st=[];while(c!=null){st.push(by[c]);c=par[c]}const i=st.findIndex(n=>n.callFrame.functionName===F);if(i<0)continue;const k=key(st[0])+'  via '+(i>0?key(st[i-1]):'self');r[k]=(r[k]||0)+cnt[id]}
Object.entries(r).sort((a,b)=>b[1]-a[1]).slice(0,+(process.env.N||15)).forEach(([k,v])=>console.log((v/1e3).toFixed(0).padStart(7)+'ms '+k))
