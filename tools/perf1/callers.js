// callers.js <cpuprofile> <fnName> [depth] : who calls fnName (self+children time aggregated by caller chain)
const P=JSON.parse(require('fs').readFileSync(process.argv[2]));const F=process.argv[3],D=+(process.argv[4]||4);const by={},par={};for(const n of P.nodes){by[n.id]=n;for(const c of n.children||[])par[c]=n.id}
const cnt={};P.samples.forEach((s,i)=>{cnt[s]=(cnt[s]||0)+(P.timeDeltas[i]||0)});const incl={};
const key=n=>n.callFrame.functionName||'(anon)';
for(const id in cnt){let c=+id;const stack=[];while(c!=null){stack.push(by[c]);c=par[c]}const i=stack.findIndex(n=>key(n)===F);if(i<0)continue;const ch=stack.slice(i+1,i+1+D).map(n=>key(n)+':'+n.callFrame.lineNumber).join(' < ');incl[ch]=(incl[ch]||0)+cnt[id]}
Object.entries(incl).sort((a,b)=>b[1]-a[1]).slice(0,+(process.env.N||12)).forEach(([k,v])=>console.log((v/1e3).toFixed(0).padStart(7)+'ms '+k))
