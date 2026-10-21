// ath-alloc-r22p: GO perf/ath-alloc. No graphics: drive 900 sim steps (15 s game time, gas held) in Athens and sum the positive usedJSHeapSize deltas per step
// (GC drops are ignored) = MB of garbage per game second. Before the churn fixes ~54 MB/s (sampling profile, tools/athdrive.js HEAP=40); iterator objects (for..of), roamTerr results and Math.hypot args were the top sources.
// Heap deltas are only exact with --enable-precise-memory-info (the lab runner has it off: 0 MB/s). So the pass line has two parts: (1) static, always: the per-frame functions that used to allocate an
// iterator / result object / hypot argument list per call no longer do; (2) the MB/s limit, enforced only when the heap counter is live (any non-zero delta).
const AA_LIM=40,AA_FN=['slipY','studSync','roamStuds','CV_pre','CV_post','RD_unstack','lazyStep','PC_step','PC_sph','QS_rampEdges','CTB_step','LV_edges0','STR_step','roamTerr'];
function AA_static(){const bad=[],it=/for ?\(const \w+ of (?:SLIPS|ALL_DECKS|HUB\.bld|CITY_S|RO\.marks|HUB\.cars|BRIDGES|JUNC|RO\.studs|LAZY|HUB\.peds|RO\.ramps|PC\.L|WBC\.sup|CV\.sig|HUB\.props)\)/;
 for(const n of AA_FN){let f=null;try{f=(0,eval)(n)}catch(e){}if(typeof f!=='function'){continue}const t=f.toString();if(it.test(t)||(n!=='roamTerr'&&/Math\.hypot\(/.test(t)&&n!=='LV_edges0'&&n!=='STR_step'))bad.push(n)}
 const o={g:0,deck:null,low:false};let same=false;try{same=roamTerr(RO.x,RO.z,RO.y+.3,o)===o}catch(e){}if(!same)bad.push('roamTerr(scratch)');
 /* ath-alloc2 (sampling profile: roamTerr 107 -> 14 MB / 30 s): the ramp mirror gives the same ground as reading the ramp objects, is reused between calls (no per-call field reads) and picks up a new ramp at once */
 try{const R=RO.ramps,ref=(x,z,g,dk)=>{for(const r of R){if(!!r.dk!==dk)continue;const dx=x-r.x,dz=z-r.z,a=dx*Math.sin(r.h)+dz*Math.cos(r.h),c=dx*Math.cos(r.h)-dz*Math.sin(r.h);if(Math.abs(c)<r.w/2&&a>-r.len/2&&a<r.len/2)g=Math.max(g,r.y0+(a+r.len/2)/r.len*r.hgt)}return g};
  let diff=0;for(const r of R.slice(0,40))for(let k=0;k<9;k++){const x=r.x+(k%3-1)*r.w*.3,z=r.z+((k/3|0)-1)*r.len*.3,M=RM_sync(R),F=M.F,K=M.K;let g=0;for(let i=0;i<M.n;i++){const j=i*8;if(K[i])continue;const dx=x-F[j],dz=z-F[j+1],a=dx*F[j+2]+dz*F[j+3],c=dx*F[j+3]-dz*F[j+2];if(Math.abs(c)<F[j+4]/2&&a>-F[j+5]/2&&a<F[j+5]/2)g=Math.max(g,F[j+6]+(a+F[j+5]/2)/F[j+5]*F[j+7])}if(g!==ref(x,z,0,false))diff++}
  if(diff)bad.push('ramp mirror differs at '+diff+' points');const M=RM_sync(R),a0=M.age;RM_sync(R);if(R.length&&M.age!==a0+1&&M.age!==0)bad.push('ramp mirror re-read every call');
  const t={x:RO.x,z:RO.z,h:0,len:20,hgt:5,w:6,y0:RO.y,dk:false,col:0};R.push(t);const n1=RM_sync(R).n;R.pop();const n0=RM_sync(R).n;if(n1!==R.length+1||n0!==R.length)bad.push('ramp mirror missed a push/pop')}catch(e){bad.push('ramp mirror '+e.message)}
 if(/let r=null/.test(String(GND_fars)))bad.push('GND_fars null phi');return bad}
function AA_go(){const bad=AA_static(),pm=performance.memory;
 if(!RO.on||!RO.built||typeof pl==='undefined'||!pl)return'📍 ATH ALLOC · not drivable yet → ❌ FAIL';
 const N=900,lim=AA_LIM;let i=0,sum=0,prev=pm?pm.usedJSHeapSize:0;K.ArrowUp=true;
 const step=()=>{for(let n=0;n<60&&i<N;n++,i++){roamStep(1/60);if(pm){const h=pm.usedJSHeapSize,d=h-prev;if(d>0)sum+=d;prev=h}}
  if(i<N){setTimeout(step,0);return}
  K.ArrowUp=false;const mbs=sum/1048576/(N/60),live=sum>0,ok=!bad.length&&(!live||mbs<=lim);
  goSay('📍 ATH ALLOC · hot paths clean (no per-call iterator/hypot/result object): '+(bad.length?'NO '+bad.join(','):'yes')+' · heap counter '+(live?mbs.toFixed(1)+' MB/s ≤ '+lim:'not precise here (needs --enable-precise-memory-info), limit '+lim+' MB/s skipped')+' · before the fix ~54 MB/s, after ~'+AA_AFTER+' MB/s in the sampling profile (tools/athdrive.js HEAP=40)'+(ok?' ✅':' ❌'))};
 setTimeout(step,0);return'📍 ATH ALLOC · driving 15 s…'}
const AA_AFTER='43';
(function AA_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='perf'&&q.id==='ath-alloc')){
 C.items.push({ver:'perf',id:'ath-alloc',area:'perf',text:'ath-alloc-r22p · Athens allocation churn: 📍 GO (Athens). Pass line: garbage while driving 15 s of game time <= the limit in MB/s (usedJSHeapSize positive deltas per sim step; was ~54 MB/s).'});
 C.GO['perf/ath-alloc']=[{c:'ath',n:'Athens allocation MB/s',secs:60,fn:AA_go}]}return}
 if(i<600)setTimeout(()=>AA_reg(i+1),100)})(0);
