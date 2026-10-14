// ---- AS world assets (asset-1, 2026-10-14): trees/bushes built from real LEGO parts (LDraw library, CCAL 2.0). Code + part data live in
// models/as.js (src/assets/as/code.js + parts.js, packed by tools/as/pack.sh) and load only with ?asset=1 or localStorage od_asset=1 (?asset=0 off);
// the code is evaluated in this module's scope (it wraps buildHubProps, lzPropsG, propRevive, hubCullStep). Test hook window.__as.
const AS_ON=/[?&]asset=1\b/.test(location.search)||(!/[?&]asset=0\b/.test(location.search)&&(()=>{try{return localStorage.getItem('od_asset')==='1'}catch(e){return false}})());
if(AS_ON){const s=document.createElement('script');s.src='models/as.js';s.onload=()=>{try{eval(window.__ASJ)}catch(e){console.warn('AS load',e)}};document.head.appendChild(s)}
