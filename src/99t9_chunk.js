// tr9-chunk-r22d6 (review #18): TR9_cap (src/53_terrain_roads.js) used to be ONE boot task (244 ms fra / 339 ms ath in the lab, ~2 s frozen on a 6x phone). It is now a generator run in ~14 ms
// boot steps (TR9_queue, RFS.S) where the city build can yield (Frankfurt). GO why/tr9-chunk: (a) chunked == one-task heights on a seeded synthetic grid (hash of h), (b) the live W.h hash and the
// longest TR9 step (fra: steps; ath: the one task, no yield point in AB_auto). State asserts only. ?t9ch=0 = one task, ?t9c=0 = no cap.
function T9_hash(h){const u=new Uint32Array(h.buffer,h.byteOffset,h.length);let a=2166136261>>>0;for(let i=0;i<u.length;i++){a=Math.imul(a^u[i],16777619)>>>0}return a.toString(16)}
function T9_synth(){const r=12,nx=70,nz=70,h=new Float32Array(nx*nz);let s=777;const q=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)h[j*nx+i]=Math.sin(i/6)*14+Math.cos(j/5)*11+q()*3;
  const R=[{P:[[WX0+60,WZS+80],[WX0+400,WZS+150],[WX0+520,WZS+600]],hw:5},{P:[[WX0+100,WZS+700],[WX0+700,WZS+640]],hw:4}];return{W:{r,nx,nz,h},R,pads:[[WX0+300,WZS+400,8]]}}
function T9_go(){const out=[];let bad=0;
  const a=T9_synth(),b=T9_synth();TR9_cap(a.W,a.R,a.pads);const g=TR9_gen(b.W,b.R,b.pads);let n=0;while(!g.next().done)n++;
  const ha=T9_hash(a.W.h),hb=T9_hash(b.W.h),eq=ha===hb&&n>3;if(!eq)bad++;out.push('synthetic grid: one task '+ha+' vs '+(n+1)+' slices '+hb+(eq?'':' FAIL'));
  const W=TR_W||TR_init(),t9=W.tr9,s=W.tr9s;
  if(!TR9_ON)out.push('t9c=0: cap off');
  else if(!t9){bad++;out.push('no W.tr9 (cap did not run) FAIL')}
  else{const max=s?s.max:0,ok=max<=50;if(!ok)bad++;out.push('live W.h '+T9_hash(W.h)+' band '+t9.band+' changed '+t9.changed+' · '+(s?s.steps+' steps, longest '+s.max.toFixed(1)+' ms, sum '+s.sum.toFixed(0)+' ms':'one task '+t9.ms+' ms (Athens grades inside AB_auto, no yield point: not chunked, reported only)')+(ok?'':' FAIL > 50 ms'))}
  return'📍 why/tr9-chunk · '+CID+' · '+out.join(' · ')+(bad?' → ❌ FAIL':' → ✅ PASS')}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'why',id:'tr9-chunk',area:'perf',text:'tr9-chunk-r22d6 (review #18): the terrain slope cap runs in ~14 ms boot steps (Frankfurt) with bit-identical heights: chunked == one-task hash on a seeded grid, no TR9 step > 50 ms. 📍 GO.'});
 __chk.GO['why/tr9-chunk']=['fra','ath'].map(c=>({c,n:'tr9-chunk '+(c==='fra'?'Frankfurt':'Athens'),secs:20,fn:()=>T9_go()}))},500)}
