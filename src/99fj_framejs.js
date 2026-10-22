// ==== frame-js-r22e21: per-frame style cost (GO perf/frame-js) ====
// Profile (built page, 6x CPU, render stubbed): ~22% of a roam frame was forced style recalcs of the whole HUD (145 elements, 2.5 ms each at 1x),
// read by W13_lines (innerWidth) and miniDraw (offsetParent). Cause: CSS :has() rules on body/#roam. A [style] attribute inside one :has() (garage
// tray hint) made every inline-style write in the page re-match them, and huT swapped text nodes (a child-list change does the same).
// Fixes at the source: the tray rule is a class kept by an observer (98gb), huT edits the text node's data (71). Pass line below.
async function FJ_go(){const R=[],ok=(c,m)=>R.push((c?'✓ ':'✗ ')+m);
 // 1) no :has() argument looks at the style attribute (any rule, any sheet)
 let bad=[];for(const s of document.styleSheets){let L;try{L=s.cssRules}catch(e){continue}const walk=l=>{for(const r of l){if(r.cssRules&&!r.selectorText)walk(r.cssRules);else if(r.selectorText&&/:has\([^{]*\[style/.test(r.selectorText))bad.push(r.selectorText.slice(0,60))}};walk(L)}
 ok(!bad.length,'no :has([style…]) rules'+(bad.length?' ('+bad[0]+')':''));
 // 2) the tray empty hint still follows "any visible non-paC part" (hidden all -> hint shows, restored -> hint hidden)
 const S=document.getElementById('gbBkPc');if(!S)ok(false,'#gbBkPc missing');else{const P=[...S.querySelectorAll('.gbPc:not(.paC)')],sv=P.map(e=>e.style.display),want=()=>!!S.querySelector('.gbPc:not(.paC):not([style*="none"])'),tick=()=>new Promise(r=>setTimeout(r,0));
  try{await tick();const a=S.classList.contains('paHas')===want();P.forEach(e=>e.style.display='none');await tick();const b=!S.classList.contains('paHas');if(P[0])P[0].style.display='';await tick();const c=!P[0]||S.classList.contains('paHas');
   ok(a&&b&&c,`tray hint class in step (now ${a}, all hidden ${b}, one shown ${c})`)}finally{P.forEach((e,i)=>e.style.display=sv[i])}}
 // 3) huT keeps the text node (data edit), same text as textContent would give, '' still empties
 const sp=document.createElement('span');huT(sp,'12');const n0=sp.firstChild;huT(sp,'13');const n1=sp.firstChild;huT(sp,7);const t7=sp.textContent;sp.innerHTML='<b>x</b>';huT(sp,'y');const tY=sp.innerHTML;huT(sp,'');
 ok(n0&&n0===n1&&n1.data==='13'&&t7==='7'&&tY==='y'&&sp.childNodes.length===0,'huT edits the text node in place');
 const pass=R.every(r=>r[0]==='✓');return'📍 perf/frame-js · '+R.join(' · ')+' → '+(pass?'✅ PASS':'❌ FAIL')}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.push({ver:'perf',id:'frame-js',area:'perf',text:'frame-js-r22e21: no CSS :has() looks at the style attribute (inline-style writes re-matched the whole HUD, ~22% of a 6x roam frame); the garage tray hint keeps its rule via a class; huT edits text in place. 📍 GO.'});
 __chk.GO['perf/frame-js']=['fra','ath'].map(c=>({c,n:'frame js '+(c==='fra'?'Frankfurt':'Athens'),secs:20,fn:()=>FJ_go()}))},500)}
