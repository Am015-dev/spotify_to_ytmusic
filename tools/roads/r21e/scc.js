const d=require(process.argv[2]);const ng=d.ng,N=d.n;
// iterative Tarjan over nodes <ng
const idx=new Int32Array(ng).fill(-1),low=new Int32Array(ng),on=new Uint8Array(ng),comp=new Int32Array(ng).fill(-1);let c=0,nc=0;const st=[];
for(let s=0;s<ng;s++){if(idx[s]>=0)continue;const cs=[[s,0]];idx[s]=low[s]=c++;st.push(s);on[s]=1;
 while(cs.length){const f=cs[cs.length-1],u=f[0],nb=N[u][2];if(f[1]<nb.length){const v=nb[f[1]++];if(v>=ng)continue;if(idx[v]<0){idx[v]=low[v]=c++;st.push(v);on[v]=1;cs.push([v,0])}else if(on[v])low[u]=Math.min(low[u],idx[v])}
 else{if(low[u]===idx[u]){let v;do{v=st.pop();on[v]=0;comp[v]=nc}while(v!==u);nc++}cs.pop();if(cs.length){const p=cs[cs.length-1][0];low[p]=Math.min(low[p],low[u])}}}}
const sz={};for(let i=0;i<ng;i++)sz[comp[i]]=(sz[comp[i]]||0)+1;
const big=Object.entries(sz).sort((a,b)=>b[1]-a[1]);console.log('sccs',nc,'top',big.slice(0,5).map(x=>x.join(':')).join(' '));
const main=+big[0][0];const small=Object.entries(sz).filter(([k])=>+k!==main);
// per small comp: bbox, size, whether it can reach main (exit) or is reachable from main (entry)
const out=[];for(const [k,s] of small){const m=[];for(let i=0;i<ng;i++)if(comp[i]==k)m.push(i);let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const i of m){x0=Math.min(x0,N[i][0]);x1=Math.max(x1,N[i][0]);z0=Math.min(z0,N[i][1]);z1=Math.max(z1,N[i][1])}
 let exitsMain=false,exitsOther=false;for(const i of m)for(const v of N[i][2]){if(v>=ng)continue;if(comp[v]===main)exitsMain=true;else if(comp[v]!=k)exitsOther=true}
 out.push({k:+k,s,bb:[x0,z0,x1,z1].map(Math.round),exitsMain,exitsOther,sample:m[0]})}
out.sort((a,b)=>b.s-a.s);console.log(out.length,'small comps; total nodes',out.reduce((a,o)=>a+o.s,0));
console.log(out.filter(o=>!o.exitsMain).slice(0,25).map(o=>JSON.stringify(o)).join('\n'));
require('fs').writeFileSync(process.argv[2]+'.comp',JSON.stringify({comp:Array.from(comp),main}));
