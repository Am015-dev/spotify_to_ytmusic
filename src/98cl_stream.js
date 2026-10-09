// ===== STR (v89b): streaming. Owner: stream worker (alex/od-stream). =====
// Measured live v89a: the JS heap after GC is flat (~140 MB Athens, ~75 MB Frankfurt) but geometry buffers grow from 68 → 222 MB (Athens) and
// 114 → 215 MB (Frankfurt) in a tour, because the WB far city (2×2 "super cells", 54 B per far triangle, CPU copy + GPU copy) was built for the
// whole map and never freed, and the Frankfurt LAZY outskirts were never disposed either.
// Now: a super cell's far buffer is built only while its rectangle is within draw range + TUNE.strLoad of the camera (built in ≤ STR.sl ms
// slices, at most STR.ms per frame) and disposed beyond draw range + TUNE.strUnload (hysteresis, no thrash); its CPU copy is dropped right after the
// GPU upload. The items (shared model templates + one Float32 matrix per instance) stay, so a rebuild needs no source geometry.
// LAZY regions (Frankfurt outskirts): meshes + props are disposed beyond draw range + TUNE.strLzOut (load at draw range + TUNE.strLzIn, was a fixed 2200 m) and rebuilt by lazyStep on return (colliders, map roads,
// ramps and spots are plan data and stay, so collisions, missions and the minimap never depend on what is loaded).
for(const [k,v] of Object.entries({strOn:1,strFree:1,strLoad:300,strUnload:900,strLzIn:100,strLzOut:800}))if(TUNE[k]===undefined)TUNE[k]=v;
const STR={it:null,S:null,sl:2,ms:4,msC:12,lzT:0,st:{b:0,f:0,max:0,over:0,relMB:0,lzF:0,lzB:0,hist:[]}};
const STR_on=()=>!!TUNE.strOn;
const STR_R=()=>SET.q==='high'?2100:1600;
const STR_d=(S,x,z)=>Math.hypot(Math.max(S.x0-x,0,x-S.x1),Math.max(S.z0-z,0,z-S.z1));
function STR_step(){if(!STR_on()||!WBC.on||state!=='roam'||!WBC.sup||typeof camera==='undefined')return;const t0=performance.now(),cx=camera.position.x,cz=camera.position.z,R=STR_R(),LD=R+TUNE.strLoad,UL=R+TUNE.strUnload;
  if(STR.S&&(STR.S.grp!==WBC.grp||!WBC.sup.includes(STR.S))){STR.S=null;STR.it=null}
  let nf=0;for(const S of WBC.sup)if(S.built&&S!==STR.S&&STR_d(S,cx,cz)>UL){WB_supFree(S);STR.st.f++;if(++nf>=2)break}
  // catch-up: a missing cell INSIDE draw range (after a warp, flight, garage or roam start) gets up to STR.msC minus this frame's LAZY time (instead of STR.ms), so the frame's stream work stays under 16 ms
  let n=0,bud=STR.ms;while(performance.now()-t0<bud){if(!STR.it){let b=null,bd=LD;for(const S of WBC.sup){if(S.built||!S.nt)continue;const d=STR_d(S,cx,cz);if(d<bd){bd=d;b=S}}if(!b)break;if(bd<R)bud=Math.max(STR.ms,STR.msC-STR.lzT);STR.S=b;STR.it=WB_supMk(b,true)}else if(STR_d(STR.S,cx,cz)<R)bud=Math.max(STR.ms,STR.msC-STR.lzT);
    n++;if(STR.it.next().done){STR.it=null;STR.S=null;STR.st.b++;WBC.sig=''}}
  if(!n)return;const dt=performance.now()-t0;if(dt>STR.st.max)STR.st.max=dt;if(dt>8)STR.st.over++;STR.st.hist.push(+dt.toFixed(2));if(STR.st.hist.length>600)STR.st.hist.shift()}
{const _ls=lazyStep;lazyStep=function(){const t=performance.now(),r=_ls.apply(this,arguments);STR.lzT=performance.now()-t;try{STR_step()}catch(e){console.warn('STR',e);TUNE.strOn=0}return r}}
window.__str={st:STR.st,sup:()=>{let b=0,mb=0;for(const S of WBC.sup||[])if(S.built){b++;mb+=S.mb}return{sup:(WBC.sup||[]).length,built:b,mb:+mb.toFixed(1),lodT:WBC.st.lodT}}};
// LAZY unload: only regions built by the plain lzBuildG (their build has no side effects beyond L.root + props); Taunus/Wald/Attiki corridors stay
// (their builders add terrain, colliders or lanes while building). Colliders were added once at the first finish and are kept.
const STR_lzOk=L=>L.build===lzBuildG&&!L.pre&&L.done&&!L.it&&L.root&&LZ.cur!==L;
function STR_lzFree(L){const R=L.root,inR=o=>{for(let q=o;q;q=q.parent)if(q===R)return true;return false};
  if(HUB.props){const keep=[],gone=[];for(const p of HUB.props)(p.im&&inR(p.im)?gone:keep).push(p);if(gone.length){HUB.props.length=0;HUB.props.push(...keep);const PG=HUB.pgrid;if(PG)for(const p of gone){const k=Math.floor(p.x/16)*10000+Math.floor(p.z/16),A=PG.get(k);if(A){const i=A.indexOf(p);if(i>=0)A.splice(i,1)}}}}
  if(HUB.cull){const C=HUB.cull.filter(c=>!inR(c.o));HUB.cull.length=0;HUB.cull.push(...C)}
  R.removeFromParent();R.traverse(o=>{if(o.isInstancedMesh)o.dispose();else if(o.isMesh&&o.geometry)o.geometry.dispose()});
  L.root=null;L.done=false;L.qd=false;L.it=null;L.bt=null;L.strRe=1;if(L.pN!=null)L.props.length=L.pN;HUB.cpos=null;STR.st.lzF++}
// probe: the 3 biggest single LAZY build steps (ms, region, step index) in STR.st.lzBig
STR.st.lzBig=[];
{const _st=lzStart;lzStart=function(L){if(!L.it&&L.pN==null)L.pN=L.props.length;const fresh=!L.it,r=_st.apply(this,arguments);if(fresh&&L.it){const it=L.it;let k=0;L.it={next(){const t=performance.now(),q=it.next(),d=performance.now()-t;k++;if(d>6){const B=STR.st.lzBig;B.push([+d.toFixed(1),L.id,k,q.done?'end':'']);B.sort((a,b)=>b[0]-a[0]);B.length=Math.min(B.length,3)}return q},[Symbol.iterator](){return this}}}return r}}
{const _fi=lzFinish;lzFinish=function(L){if(!L.strRe)return _fi.apply(this,arguments);const b=L.bld;L.bld=[];try{return _fi.apply(this,arguments)}finally{L.bld=b;STR.st.lzB++}}}
function STR_lzStep(){if(!STR_on()||!HUB.built||!LAZY.length||!RO.on)return;const x=RO.x,z=RO.z;for(const L of LAZY)if(STR_lzOk(L)&&lzD(L,x,z)>STR_R()+TUNE.strLzOut)STR_lzFree(L)}
// per-frame cost of all streaming work (LAZY build + LAZY unload + far-cell build/free): STR.st.fr = frames, max ms, over 8/16/50 ms
STR.st.fr={n:0,max:0,o8:0,o16:0,o50:0};
{const _ls=lazyStep;lazyStep=function(){const t0=performance.now();try{STR_lzStep();LZ.inR=STR_on()?STR_R()+TUNE.strLzIn:2200;return _ls.apply(this,arguments)}finally{const dt=performance.now()-t0,F=STR.st.fr;if(dt>.05){F.n++;if(dt>F.max)F.max=+dt.toFixed(1);if(dt>8)F.o8++;if(dt>16)F.o16++;if(dt>50)F.o50++}}}}
// SM3 (drop the CPU copy of single-use city meshes after the GPU upload) was Athens-only; Frankfurt kept ~106 MB of copies nobody reads
if(TUNE.strSm3===undefined)TUNE.strSm3=1;
if(TUNE.strSm3&&!SM3.on)try{SM3.on=localStorage.getItem('mho_sm3')!=='0'}catch(e){SM3.on=true}
