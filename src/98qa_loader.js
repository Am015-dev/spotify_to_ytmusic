// ===== QA KIT loader (qa-1, 2026-10-14): runtime invariants (window.__bugs), error hooks, 🐞 BUG report button in the roam pause menu, ?repro=<b64> spawn,
// monkey-bot stepping (window.__qa.step). The code is src/assets/qa/code.js, packed by tools/qa/pack.sh into models/qa.js (a string) and eval'd here in
// the module scope, so the page itself grows by this stub only. ?qa=0 = off for one visit.
if(!/[?&]qa=0\b/.test(location.search)){FST_js('models/qa.js').then(ok=>{if(!ok)return;try{eval(window.__QAJ)}catch(e){console.warn('QA load',e)}})}
