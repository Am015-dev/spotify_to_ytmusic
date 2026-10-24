// fastload-r24g: GO perf/fastload. A second load serves every lazy chunk from the persistent store (src/10zf_fastload.js + the page head), nothing graphical:
// (1) every lazy code chunk this page loaded (XCV) and every model chunk it ingested is in the store, and asking for it again is a store hit with the network bytes unchanged;
// (2) the read-ahead (equipped car + next 3 + music) ends with its files in the store; (3) with the storage API throwing the same request still returns the file from the network (no throw).
(function FL_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='perf'&&q.id==='fastload'))C.items.push({ver:'perf',id:'fastload',area:'perf',text:'fastload-r24g · perf/fastload: lazy chunks (xc, models, music, tune.json) live in a persistent store keyed by build id; the 2nd load serves them from it (hit, same bytes), read-ahead fills the garage cars, storage errors fall back to the network. ?fc=0 off'});
  C.GO['perf/fastload']=[{c:'fra',n:'2nd load serves chunks from the store',secs:90,fn:async()=>{const F=window.__fc;if(!F)return'📍 FASTLOAD · window.__fc missing ❌ FAIL';
   const S=F.FST,R=[];
   if(!F.use())return`📍 FASTLOAD · store off (on=${S.on} backend=${S.be||'none'}): plain network path, nothing to serve → ✅ PASS (fallback)`;
   try{await F.flush();const be=F.be[S.be],xc=window.__xc.ev('XCV'),urls=Object.keys(xc).map(n=>'xc/'+n+'.js?'+(xc[n]||0)),lg=window.__xc.ev('[...LDL.got].slice(0,6).map(id=>LDL.X.c[id].f)').filter(u=>S.src[u]);   // only chunks this page took through the store (the boot document.write ones are parser tags)
    const have=await Promise.all(urls.concat(lg).map(u=>be.has(u).catch(()=>false))),miss=urls.concat(lg).filter((u,k)=>!have[k]);
    R.push([`${urls.length} lazy chunks + ${lg.length} model chunks in the store (missing ${miss.length}${miss.length?' '+miss[0]:''})`,!miss.length]);
    const u0=urls[0],h0=S.st.hit,b=await F.get(u0),net=await fetch(u0).then(r=>r.arrayBuffer());
    R.push([`re-request ${u0.slice(0,28)}: ${S.src[u0]}, +${S.st.hit-h0} hit, ${b&&b.byteLength} B vs network ${net.byteLength} B`,S.src[u0]==='store'&&S.st.hit>h0&&b&&b.byteLength===net.byteLength]);
    const a=await F.ahead();for(let k=0;k<150&&!a.fin;k++)await new Promise(r=>setTimeout(r,200));const ah=await Promise.all(a.urls.map(u=>be.has(u).catch(()=>false)));
    R.push([`read-ahead ${a.urls.length} files (${a.urls.filter(u=>/^models/.test(u)).length} car chunks) done=${a.fin}, in store ${ah.filter(Boolean).length}`,a.fin&&ah.every(Boolean)]);
    const e0=S.st.err;S.sim='throw';let t,thrown='';try{t=await F.get(u0)}catch(e){thrown=String(e)}finally{S.sim=''}
    R.push([`storage throws: file ${t?t.byteLength+' B from '+S.src[u0]:'null'}, errors +${S.st.err-e0}${thrown?' THREW '+thrown:''}`,!thrown&&!!t&&t.byteLength===net.byteLength&&S.st.err>e0])}
   catch(e){R.push(['threw '+e,false])}
   const ok=R.every(r=>r[1]);return`📍 FASTLOAD · ${S.be} store · ${R.map(r=>(r[1]?'✓ ':'✗ ')+r[0]).join(' · ')} → ${ok?'✅ PASS':'❌ FAIL'}`}}];return}
 if(i<600)setTimeout(()=>FL_reg(i+1),100)})(0);
