/* soa-1 (ios-r18f): HUB.props rows live in typed columns. A prop is a tiny SOA_Row (id + im + col) whose x/y/z/ry/rt/alive/t/i/gp/cvs are accessors over
   shared typed arrays, so every reader (p.x, p.alive, p.t ...) keeps working unchanged and a row costs ~60 B instead of ~135 B + a THREE.Color + a cvs array.
   Colours: one shared THREE.Color per prop def / asset variant (debris and SM2_bump only read them). cvs (foliage-mix scale pair) = 2 floats in one Float32Array.
   ?soa=0 = off switch (plain object literals, per-prop colours and cvs arrays as before). Nothing writes into a shared colour (grep: debris reads cols[k]). */
const SOA={on:true,n:0,cap:0,K:[],KM:new Map(),cvn:0,cvcap:0};
try{SOA.on=new URLSearchParams(location.search).get('soa')!=='0'}catch(e){}
let SOA_x=new Float32Array(0),SOA_y=SOA_x,SOA_z=SOA_x,SOA_ry=SOA_x,SOA_rt=new Float64Array(0),SOA_al=new Uint8Array(0),SOA_gp=SOA_al,SOA_t=new Uint16Array(0),SOA_i=new Int32Array(0),SOA_ci=SOA_i,SOA_cv=new Float32Array(0);
const SOA_S=[1,1];
function SOA_grow(c){const g=(A,T)=>{const B=new T(c);B.set(A);return B};SOA_x=g(SOA_x,Float32Array);SOA_y=g(SOA_y,Float32Array);SOA_z=g(SOA_z,Float32Array);SOA_ry=g(SOA_ry,Float32Array);SOA_rt=g(SOA_rt,Float64Array);SOA_al=g(SOA_al,Uint8Array);SOA_gp=g(SOA_gp,Uint8Array);SOA_t=g(SOA_t,Uint16Array);SOA_i=g(SOA_i,Int32Array);SOA_ci=g(SOA_ci,Int32Array);SOA.cap=c}
function SOA_k(s){let k=SOA.KM.get(s);if(k===undefined){k=SOA.K.length;SOA.K.push(s);SOA.KM.set(s,k)}return k}
class SOA_Row{
 constructor(id){this.id=id;this.im=null;this.col=null}
 get x(){return SOA_x[this.id]}set x(v){SOA_x[this.id]=v}
 get y(){return SOA_y[this.id]}set y(v){SOA_y[this.id]=v}
 get z(){return SOA_z[this.id]}set z(v){SOA_z[this.id]=v}
 get ry(){return SOA_ry[this.id]}set ry(v){SOA_ry[this.id]=v}
 get rt(){return SOA_rt[this.id]}set rt(v){SOA_rt[this.id]=v}
 get alive(){return SOA_al[this.id]===1}set alive(v){SOA_al[this.id]=v?1:0}
 get gp(){const v=SOA_gp[this.id];return v===2?undefined:v===1}set gp(v){SOA_gp[this.id]=v===undefined?2:v?1:0}
 get t(){return SOA.K[SOA_t[this.id]]}set t(v){SOA_t[this.id]=SOA_k(v)}
 get i(){const v=SOA_i[this.id];return v<0?undefined:v}set i(v){SOA_i[this.id]=v==null?-1:v}
 /* cvs: scratch pair, valid until the next read of any row (callers destructure or read [0]/[1] of the same p at once) */
 get cvs(){const j=SOA_ci[this.id];if(j<0)return undefined;SOA_S[0]=SOA_cv[j];SOA_S[1]=SOA_cv[j+1];return SOA_S}
 set cvs(a){if(!a){SOA_ci[this.id]=-1;return}let j=SOA_ci[this.id];if(j<0){j=SOA.cvn;SOA.cvn+=2;if(SOA.cvn>SOA_cv.length){const B=new Float32Array(Math.max(1024,SOA_cv.length*2));B.set(SOA_cv);SOA_cv=B}SOA_ci[this.id]=j}SOA_cv[j]=a[0];SOA_cv[j+1]=a[1]}
}
const SOA_CORE={t:1,x:1,y:1,z:1,ry:1,rt:1,alive:1,gp:1,i:1,im:1,col:1};
function SOA_mk(o){if(!SOA.on)return o;const id=SOA.n++;if(id>=SOA.cap)SOA_grow(Math.max(4096,SOA.cap*2));const r=new SOA_Row(id);
 SOA_t[id]=SOA_k(o.t);SOA_x[id]=o.x;SOA_y[id]=o.y;SOA_z[id]=o.z;SOA_ry[id]=o.ry;SOA_rt[id]=o.rt||0;SOA_al[id]=o.alive?1:0;SOA_gp[id]=o.gp===undefined?2:o.gp?1:0;SOA_i[id]=o.i==null?-1:o.i;SOA_ci[id]=-1;
 if(o.im)r.im=o.im;if(o.col)r.col=o.col;for(const k in o)if(!SOA_CORE[k])r[k]=o[k];return r}
function SOA_col(def){return SOA.on?(def._pc||(def._pc=new THREE.Color(def.cols[0]))):new THREE.Color(def.cols[0])}
SOA.stat=()=>{const P=(typeof HUB!=='undefined'&&HUB.props)||[],cs=new Set();let rows=0;for(const p of P){if(p instanceof SOA_Row)rows++;if(p.col)cs.add(p.col)}
 return{on:SOA.on,props:P.length,rows,colors:cs.size,cvPairs:SOA.cvn/2,colMB:+((SOA_x.byteLength*4+SOA_rt.byteLength+SOA_al.byteLength*2+SOA_t.byteLength+SOA_i.byteLength*2+SOA_cv.byteLength)/1048576).toFixed(2)}};
