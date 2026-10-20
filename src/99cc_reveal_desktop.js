// reveal-r21p: GO perf/reveal-desktop (+ -ath). No graphics asserts: boots the city in an iframe like a PC (no touch, no lowmem, ?rvl=1 with rvlcpu=1) and reads the 5 s after the curtain lifts from the reveal probe (98bp RVL) and the
// reveal hold (DREV, 98bp). Pass line: the hold ran (not skipped), programs at reveal == programs at +5 s or at most 1 new (before r21p: 36-49 links / 1.1-1.5 s of link wait after the curtain), no frame gap > 2.5x the window's median gap
// and no stall that coincides with a link/compile/upload; absolute gaps and frame ms are info (lab = software GL blocks the render call on the GPU queue: r989 ms with 0 links seen), no texture upload > 20 ms. Info: max gap, links, hold ms, heap (MB) at hold start / before the GC nudge / after settle / now.
function RD_rows(R,c){const s=R.sum,F=R.fr,g=F.map(q=>q.dt).sort((a,b)=>a-b),med=g[g.length>>1]||0,big=F.filter(q=>q.dt>2.5*med&&q.dt>100),tx=F.filter(q=>q.texMs>20).length,D=R.D||{},nl=R.p5-R.p0,wm=Math.max(0,...F.map(q=>q.fMs)),att=big.filter(q=>q.link||q.comp||q.texMs>20||q.bufMs>20);
 return[['hold ran '+(D.ran|0)+' (gate '+D.gateMs+' ms, prewarm '+D.prewMs+' ms, chunks '+D.xcMs+' ms, settle '+D.settleMs+' ms'+(D.capped?', CAPPED':'')+')',D.ran===1],
  ['programs at reveal '+R.p0+', at +5 s '+R.p5+' → '+nl+' new (<= 1)',R.p5>=0&&nl<=1],
  ['links in the first 3 s '+s.link+' ('+s.linkMs+' ms) (<= 1)',s.link<=1],
  ['stalls caused by a program link / compile / upload (gap > 2.5x median '+Math.round(med)+' ms with L/C>0 or tex/buf > 20 ms): '+att.length+' (0)',att.length===0],
  ['info: worst frame main-thread cost '+Math.round(wm)+' ms (PC budget 250; software GL blocks the render call on the GPU queue, so absolute ms are lab noise)',true],
  ['info: gaps > 2.5x median '+Math.round(med)+' ms: '+big.length+(big.length?' '+big.map(q=>q.t+':'+Math.round(q.dt)+'(js'+Math.round(q.fMs-q.rMs)+' r'+Math.round(q.rMs)+' L'+q.link+' B'+q.buf+(q.xc?' xc '+q.xc:'')+')').join(','):''),true],
  ['tex uploads > 20 ms: '+tx,tx===0],
  ['info: max gap '+s.maxDt+' ms (PC budget 250; lab x'+Math.round(med/16)+' software GL), heap MB '+D.h0+' / '+D.h1+' / '+D.h2+' / now '+(D.hNow|0),true]]}
(function RD_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='perf'&&q.id==='reveal-desktop')){
 C.items.push({ver:'perf',id:'reveal-desktop',area:'perf',text:'reveal-r21p · desktop reveal: 📍 GO boots Frankfurt (-ath: Athens) in a PC iframe and reads the 5 s after the curtain lifts. Pass line: the hold ran; programs at reveal == at +5 s (<= 1 new link); no stall (gap > 2.5x median) that coincides with a program link / compile / big upload (absolute gaps and frame ms are info: software GL blocks on the GPU queue); no texture upload > 20 ms. Absolute ms are info (lab = software GL). Before: 36-49 links and a 1.0-1.2 s gap right after the curtain.'},
  {ver:'perf',id:'reveal-desktop-ath',area:'perf',text:'reveal-r21p · same, Athens.'});
 const run=async c=>{const f=document.createElement('iframe');f.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;border:0;z-index:99999';f.src=location.pathname+'?test='+c+'&rvl=1&rvlcpu=1';document.body.appendChild(f);
  try{const t0=performance.now();let R=null;while(performance.now()-t0<400000){await new Promise(r=>setTimeout(r,1000));try{R=f.contentWindow.RVL}catch(e){}if(R&&R.done)break}
   if(!R||!R.done)return`📍 REVEAL DESKTOP ${c} · no reveal window recorded in ${Math.round((performance.now()-t0)/1000)} s → ❌ FAIL`;
   for(let w=0;w<60&&R.p5<0;w++)await new Promise(r=>setTimeout(r,500));
   const W=f.contentWindow;R.D=Object.assign({},W.DREV,{hNow:W.DREV_heap?W.DREV_heap():-1});const rows=RD_rows(R,c),ok=rows.every(r=>r[1]);
   return`📍 REVEAL DESKTOP ${c} · ${rows.map(r=>(r[1]?'✓ ':'✗ ')+r[0]).join(' · ')} → ${ok?'✅ PASS':'❌ FAIL'}`}
  catch(e){return`📍 REVEAL DESKTOP · threw ${String(e&&e.message).slice(0,80)} → ❌ FAIL`}finally{f.remove()}};
 const go=c=>()=>{run(c).then(r=>goSay(r));return'📍 REVEAL DESKTOP · booting '+c+'…'};
 C.GO['perf/reveal-desktop']=[{c:'fra',n:'desktop reveal (Frankfurt)',fn:go('fra'),secs:420}];C.GO['perf/reveal-desktop-ath']=[{c:'ath',n:'desktop reveal (Athens)',fn:go('ath'),secs:420}]}return}
 if(i<600)setTimeout(()=>RD_reg(i+1),100)})(0);
