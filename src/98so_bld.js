/* soab-1 (ios-r18w): HUB.bld rows live in typed columns. After buildHubG finishes, every collider row reachable from HUB.bld / HUB.grid / LZ.g / L.bld / TR_PL is replaced
   by a BldRow (one field, _i) whose x/z/hw/hd/h/y0/c/s/trMin... are accessors over shared Float32Arrays (NaN = unset -> undefined), so every reader keeps working unchanged.
   Non-numeric or rare fields stay as own properties of the row. The old row objects are dropped (~19 MB at Athens). ?soab=0 = off switch (plain objects as before). */
const SOAB={on:false,n:0,cols:[],own:0,pre:null,post:null,ms:0};
try{SOAB.on=new URLSearchParams(location.search).get('soab')==='1'}catch(e){}
class BldRow{constructor(i){this._i=i}}
function SOAB_sig(){/* fixed queries: collision hits on a lattice, rows by window, ground-plinth count; compared before/after the freeze */
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const b of HUB.bld){if(b.x<x0)x0=b.x;if(b.x>x1)x1=b.x;if(b.z<z0)z0=b.z;if(b.z>z1)z1=b.z}
 const hits=[];let nh=0;for(let i=0;i<30;i++)for(let j=0;j<30;j++){const x=x0+(x1-x0)*(i+.37)/30,z=z0+(z1-z0)*(j+.61)/30;for(const y of[0,12]){const h=roamHit(x,z,2.5,y);if(h){nh++;if(hits.length<400)hits.push(Math.round(h.x)+'|'+Math.round(h.z)+'|'+Math.round(h.hw)+'|'+Math.round(h.hd))}}}
 const st=Math.max(1,Math.floor(HUB.bld.length/700));for(let i=0;i<HUB.bld.length;i+=st){const b=HUB.bld[i];for(const[dx,dz,y]of[[.5,.3,b.h-2],[b.hw+1.2,0,b.h-2],[0,-(b.hd+3),(b.y0??b.h-6)+1]]){const h=roamHit(b.x+dx,b.z+dz,2,y);if(h){nh++;if(hits.length<1500)hits.push(Math.round(h.x)+'|'+Math.round(h.z)+'|'+Math.round(h.hw)+'|'+Math.round(h.hd))}}}
 let sa=0,tm=0,mm=0,cull=0;for(const b of HUB.bld){sa+=b.hw*b.hd;if(b.trMin!=null)tm++;if(b.x>x0+(x1-x0)*.4&&b.x<x0+(x1-x0)*.6&&b.z>z0+(z1-z0)*.4&&b.z<z0+(z1-z0)*.6){mm++;if(Math.hypot(b.x-(x0+x1)/2,b.z-(z0+z1)/2)<300)cull++}}
 let gc=0,gl=0;for(const[,A]of HUB.grid||[]){gc++;gl+=A.length}
 return{n:HUB.bld.length,nh,hits:hits.join(','),sa:Math.round(sa),tm,mm,cull,gc,gl,tp:TR_PL.length}}
function SOAB_freeze(){if(!SOAB.on||!HUB.bld||!HUB.bld.length||HUB.bld._soab)return;const t0=performance.now();
 const seen=new Map(),rows=[],add=b=>{if(b&&typeof b==='object'&&!(b instanceof BldRow)&&!seen.has(b)){seen.set(b,rows.length);rows.push(b)}};
 for(const b of HUB.bld)add(b);const G=[HUB.grid,LZ.g];for(const g of G)if(g)for(const A of g.values())for(const b of A)add(b);for(const L of LAZY)if(L.bld)for(const b of L.bld)add(b);for(const b of TR_PL)add(b);if(typeof CTB!=='undefined'){for(const e of CTB.pl)if(e[0]&&e[0].b)add(e[0].b);for(const K of Object.values(CTB.K))if(K.L)for(const e of K.L)if(e&&e.b)add(e.b)}
 SOAB.pre=SOAB_sig();const N=rows.length,cnt=new Map(),bad=new Set();
 for(const b of rows)for(const k in b){cnt.set(k,(cnt.get(k)||0)+1);const v=b[k];if(typeof v!=='number')bad.add(k)}
 const keys=[...cnt].filter(([k,n])=>n>=N*.01&&!bad.has(k)&&k!=='_i').map(([k])=>k);
 const col={};for(const k of keys)col[k]=new Float32Array(N).fill(NaN);
 const P=BldRow.prototype;for(const k of keys){const C=col[k];Object.defineProperty(P,k,{get(){const v=C[this._i];return v!==v?undefined:v},set(v){C[this._i]=v==null?NaN:v},enumerable:true,configurable:true})}
 if(/[?&]soabdbg=1\b/.test(location.search)){SOAB.wr=rows.filter((_,i)=>i%50===0).map(b=>new WeakRef(b))};
 const nw=new Array(N);let own=0;
 for(let i=0;i<N;i++){const b=rows[i],r=new BldRow(i);for(const k in b){if(col[k])col[k][i]=b[k];else{r[k]=b[k];own++}}nw[i]=r}
 const mp=b=>{const i=seen.get(b);return i===undefined?b:nw[i]};
 const rm=A=>{for(let j=0;j<A.length;j++)A[j]=mp(A[j])};
 rm(HUB.bld);for(const g of G)if(g)for(const A of g.values())rm(A);for(const L of LAZY)if(L.bld)rm(L.bld);rm(TR_PL);if(typeof CTB!=='undefined'){for(const e of CTB.pl){const o=e[0];if(o&&o.b)o.b=mp(o.b)}for(const K of Object.values(CTB.K))if(K.L)for(const e of K.L)if(e&&e.b)e.b=mp(e.b)}HUB.bld._soab=1;
 SOAB.n=N;SOAB.cols=keys;SOAB.own=own;SOAB.post=SOAB_sig();SOAB.ms=Math.round(performance.now()-t0);
 SOAB.same=JSON.stringify(SOAB.pre)===JSON.stringify(SOAB.post);if(!SOAB.same)console.warn('SOAB sig differs',SOAB.pre,SOAB.post)}
{const _b=buildHubG;buildHubG=function*(){yield*_b.apply(this,arguments);try{SOAB_freeze()}catch(e){console.warn('SOAB',e)}}}
SOAB.stat=()=>({on:SOAB.on,rows:SOAB.n,cols:SOAB.cols.length,own:SOAB.own,ms:SOAB.ms,same:SOAB.same,colMB:+(SOAB.n*SOAB.cols.length*4/1048576).toFixed(2),pre:SOAB.pre&&{n:SOAB.pre.n,nh:SOAB.pre.nh},post:SOAB.post&&{n:SOAB.post.n,nh:SOAB.post.nh}});
