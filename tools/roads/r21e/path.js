const d=require(process.argv[2]);const N=d.n,ng=d.ng;
const near=(x,z)=>{let b=0,bd=1e18;for(let i=0;i<ng;i++){const e=(N[i][0]-x)**2+(N[i][1]-z)**2;if(e<bd){bd=e;b=i}}return b};
const [x0,z0,x1,z1]=process.argv.slice(3).map(Number);const s=near(x0,z0),t=near(x1,z1);
const dist=new Float64Array(ng).fill(1e18),prev=new Int32Array(ng).fill(-1);dist[s]=0;const H=[[0,s]];const done=new Uint8Array(ng);
while(H.length){H.sort((a,b)=>a[0]-b[0]);const[du,u]=H.shift();if(done[u])continue;done[u]=1;if(u===t)break;for(const v of N[u][2]){if(v>=ng)continue;const nd=du+Math.hypot(N[v][0]-N[u][0],N[v][1]-N[u][1]);if(nd<dist[v]){dist[v]=nd;prev[v]=u;H.push([nd,v])}}}
const out=[];for(let u=t;u>=0;u=prev[u])out.push(u);out.reverse();console.log('start',s,'end',t,'len',Math.round(dist[t]));
console.log(out.map(i=>i+'('+Math.round(N[i][0])+','+Math.round(N[i][1])+')').join(' '));
