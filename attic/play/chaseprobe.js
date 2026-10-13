// play/chaseprobe.js <url> : Athens: how far GPS / chase paths (qvPath = what the van rides and the arrow follows) leave the road.
// For N random main-graph routes 600-2000 m: samples every 3 m on the cleaned path P and on the raw node chain (P.ids); off = athRoad edge distance > 1 m.
// Also prints the road edge distance at the tPlay wall-hit points (HITS env, JSON [[x,z],...]).
const enter=require('../bc/enter.js');const [URL]=process.argv.slice(2);const HITS=JSON.parse(process.env.HITS||'[]'),N=+(process.env.N||40);
(async()=>{const seed=`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`;
 const E=await enter(URL,{seed});const {p}=E;p.setDefaultTimeout(900000);await E.roamApi();
 const r=await p.evaluate(([HITS,N])=>{const M=__mho,G=M.qv.G();let s=12345;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  const E=(x,z)=>{const r=M.athRoad(x,z,48);return r?r.e:99};
  const samp=P=>{let n=0,off=0,mx=0;const w=[];for(let i=0;i<P.length-1;i++){const [ax,az]=P[i],[bx,bz]=P[i+1],L=Math.hypot(bx-ax,bz-az);for(let d=0;d<L;d+=3){const x=ax+(bx-ax)*d/L,z=az+(bz-az)*d/L,e=E(x,z);n++;if(e>1){off++;if(e>mx)mx=e;if(w.length<4)w.push([Math.round(x),Math.round(z),+e.toFixed(1),i])}}}return{n,off,mx:+mx.toFixed(1),w}};
  const out=[];let T={n:0,off:0},R={n:0,off:0},hb=0;
  for(let k=0;k<N*4&&out.length<N;k++){const a=G.list[Math.floor(rnd()*G.list.length)],b=G.list[Math.floor(rnd()*G.list.length)],d=Math.hypot(G.X[a]-G.X[b],G.Z[a]-G.Z[b]);if(d<600||d>2000)continue;
   const q=M.qv.path(G.X[a],G.Z[a],G.X[b],G.Z[b]);const P=q.P,raw=(q.ids||[]).map(i=>[G.X[i],G.Z[i]]);const c=samp(P),rr=samp(raw);T.n+=c.n;T.off+=c.off;R.n+=rr.n;R.off+=rr.off;out.push({a:[Math.round(G.X[a]),Math.round(G.Z[a])],np:P.length,nraw:raw.length,clean:c,raw:{off:rr.off,n:rr.n,mx:rr.mx}})}
  const hits=HITS.map(([x,z])=>{const r=M.athRoad(x,z,64);return[x,z,r?+r.e.toFixed(1):null,r&&r.w,r&&r.cls]});
  return{T:{...T,pct:+(100*T.off/T.n).toFixed(2)},R:{...R,pct:+(100*R.off/R.n).toFixed(2)},worst:out.sort((x,y)=>y.clean.off-x.clean.off).slice(0,8),hits}},[HITS,N]);
 console.log(JSON.stringify(r));await E.b.close()})();
