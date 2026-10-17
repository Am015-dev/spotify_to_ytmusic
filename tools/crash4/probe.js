// crash-4 probe module (inserted before the game module by tools/crash4/mkprobe.sh): tags attributes with their geometry + the geometry's creating call site, and GL buffers with their attribute
import * as T from 'three';const P=T.BufferGeometry.prototype,sa=P.setAttribute,si=P.setIndex,AR=new WeakMap;window.__BUF=new Map;window.__T=T;
const stk=()=>(new Error().stack||'').split('\n').slice(3).filter(l=>!/three|setAttribute|setIndex|probe/.test(l)).slice(0,3).map(l=>l.trim().replace(/^at /,'').replace(/ \(.*\/(.*?):(\d+):\d+\)/,'@$2').replace(/https?:\S*?:(\d+):\d+/,'@$1')).join(' < ');
const tag=(g,a)=>{if(!a||!a.isBufferAttribute)return;a.__g=new WeakRef(g);if(!g.__stk)g.__stk=stk()+' t'+(performance.now()/1e3|0);if(a.array)AR.set(a.array,a)};
P.setAttribute=function(n,a){tag(this,a);return sa.apply(this,arguments)};P.setIndex=function(i){const r=si.apply(this,arguments);tag(this,this.index);return r};
const gp=WebGL2RenderingContext.prototype,bd=gp.bufferData,bb=gp.bindBuffer,cur={};gp.bindBuffer=function(k,b){cur[k]=b;return bb.apply(this,arguments)};
gp.bufferData=function(k,x){const b=cur[k];if(b&&x&&x.byteLength){const a=AR.get(x);__BUF.set(b,{n:x.byteLength,a:a?new WeakRef(a):null,s:a?'':(x.constructor.name+' '+x.length)})}return bd.apply(this,arguments)};
const db=gp.deleteBuffer;gp.deleteBuffer=function(b){__BUF.delete(b);return db.apply(this,arguments)};
window.__own=scene=>{const inS=new Set,iA=new Set;scene.traverse(o=>{if(o.geometry)inS.add(o.geometry);if(o.instanceMatrix)iA.add(o.instanceMatrix);if(o.instanceColor)iA.add(o.instanceColor)});const by={};let tot=0;
 for(const[b,r]of __BUF){tot+=r.n;const a=r.a&&r.a.deref(),g=a&&a.__g&&a.__g.deref();let k;if(!r.a)k='U '+r.s.split(' ')[0];else if(!a)k='GC attr';else if(iA.has(a))k='S instanceAttr';else if(!g)k='GC geo';else k=(inS.has(g)?'S ':'O ')+(g.__stk||'?').replace(/ t\d+$/,'');const e=by[k]||(by[k]={n:0,mb:0,t:1e9});e.n++;e.mb+=r.n/1048576;if(g&&g.__stk)e.t=Math.min(e.t,+g.__stk.split(' t').pop())}
 return{tot:+(tot/1048576).toFixed(1),gpu:MEM_GPU.mb(),by:Object.entries(by).map(([k,v])=>[+v.mb.toFixed(1),v.n,v.t,k]).sort((a,b)=>b[0]-a[0]).slice(0,30)}};
