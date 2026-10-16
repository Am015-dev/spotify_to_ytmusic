// boot-2 (2026-10-16): shorter STORY boot (rv2k/onboard). ?boot2=0 = old path.
// (1) ?boot2g=1: the outer land and the Autobahn/periptera meshes are built after the first roam frame, in ≤ 8 ms slices, nearest batch first. Physics never
//     reads these meshes (groundY is analytic; GND_far only refines the outer land, outside the start district), so the car stands right before they exist.
// (2) the street graph (QV) is no longer built inside the loader: qvTick already advances it in roam, and the idle pump below finishes it faster.
// (3) racer avatars are drawn while the menu idles, so the first roam dialogue never waits on a canvas readback queued behind program links.
const BOOT2=!/[?&]boot2=0/.test(location.search);
const BOOT2G=!/[?&]boot2g=0/.test(location.search);// ground/Autobahn deferral, ON (boot-3: the outer land is a generator, one ground cell per step, nearest 1 km tile first; ?boot2g=0 = in the loader)
const B2={q:[],on:false,defer:false,ms:{},t0:0,done:0};
function B2_slice(gen,first){if(first)B2.q.unshift(gen);else B2.q.push(gen)}
function B2_pump(){if(!B2.q.length){B2.on=false;B2.done=performance.now();return}const t=performance.now();
  try{while(B2.q.length&&performance.now()-t<8){const g=B2.q[0];let r;try{r=g.next()}catch(e){console.error(e);r={done:true}}if(r.done)B2.q.shift()}}catch(e){console.error(e)}
  (window.requestIdleCallback?f=>requestIdleCallback(f,{timeout:60}):requestAnimationFrame)(B2_pump)}
function B2_start(){if(B2.on||!B2.q.length)return;B2.on=true;B2.t0=performance.now();requestAnimationFrame(()=>requestAnimationFrame(B2_pump))}
if(BOOT2){
  // (1) deferred city pieces: each one gets its own batch so the start district's batch flushes without them
  for(const nm of['worldGroundBuild','abBuild']){const f=nm==='abBuild'?abBuild:worldGroundBuild;const w=function(grp,bt,BM,M){if(!B2.defer)return f.apply(this,arguments);const a=arguments;
      B2_slice((function*(){yield;let t=performance.now(),w=0;const b=new TBatch();a[1]=b;
        if(nm==='worldGroundBuild'){const near=()=>typeof RO!=='undefined'&&isFinite(RO.x)?[RO.x,RO.z]:[0,0],g=worldGroundGen(a[0],b,a[2],near);for(;;){const r=g.next();w+=performance.now()-t;if(r.done)break;yield;t=performance.now()}}
        else{f.apply(null,a);w=performance.now()-t}B2.ms[nm]=Math.round(w);for(const[k,e]of[...b.m]){const one=new TBatch();one.m.set(k,e);one.flush(grp);yield}})())};
    if(nm==='abBuild')abBuild=w;else worldGroundBuild=w}
  {const _b=buildHubG;buildHubG=function*(){B2.defer=BOOT2G&&CID==='fra'&&!!(state==='loading'||state==='roam')/* boot-3: Athens reads its ground quadtree cache (QTC) as one ordered stream: deferring or reordering its land desyncs it */;try{yield*_b()}finally{B2.defer=false}}}
  // (2) street graph after the first frame
  {const _q=SM_qvLoad;SM_qvLoad=async function(a,b){if(state!=='loading')return _q.apply(this,arguments);const N=HUB.nodes;if(!N||!N.length||(QV.g&&QV.g.N===N))return _q.apply(this,arguments);
    B2_slice((function*(){const t=performance.now();if(!QV.gi||QV.giN!==N){QV.gi=qvGraphGen(N);QV.giN=N}while(!(QV.g&&QV.g.N===N)&&HUB.nodes===N){if(QV.gi.next().done)break;yield}B2.ms.qv=Math.round(performance.now()-t);
      try{if(HUB.built&&SM_ON)SMM_grids();else if(!MINI&&HUB.built)MINI=miniBase()}catch(e){console.error(e)}})(),1)}}// boot-3: the street graph runs before the deferred ground
  {const _p=roamPost;roamPost=function(){const r=_p.apply(this,arguments);B2_start();return r}}
  // (3) avatars while the menu idles
  {const L=Object.keys(PD);let i=0;const step=d=>{while(i<L.length&&(!d||d.timeRemaining()>4))try{avatar(L[i++])}catch(e){i++}if(i<L.length)(window.requestIdleCallback||setTimeout)(step)};setTimeout(()=>(window.requestIdleCallback||setTimeout)(step),1500)}
}
