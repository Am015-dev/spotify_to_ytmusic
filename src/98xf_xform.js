// ---- XF (xform-1, 2026-10-14): LEGO 2K-style automatic vehicle transformation (street car / off-road / boat by surface) + body tilt to all wheel contacts.
// Code lives in models/xf.js (src/assets/xf/code.js, packed by tools/xf/pack.sh), eval'd here in the module scope, so the page grows by this stub only.
// ?xf=0 = off for one visit. Test hook window.__xf (GOS = checklist xf1/* GOs, tools/tXf.js).
if(!/[?&]xf=0\b/.test(location.search)){const s=document.createElement('script');s.src='models/xf.js';s.onload=()=>{try{eval(window.__XFJ)}catch(e){console.warn('XF load',e)}};document.head.appendChild(s)}
