// ---- LIFE (life-1, 2026-10-14): streets that move and react (set pieces, people groups, smashables, pop-up bubbles, landmarks). Spec docs/research/LIFE_2K.md.
// Code lives in models/lx.js (src/assets/lx/code.js, packed by tools/lx/pack.sh) so the page grows ~0.5 KB; evaluated in this module's scope (wraps LV_step).
// On by default; ?life=0 or localStorage od_life=0 = off. Test hook window.__life (GOS = checklist life1/* GOs).
if(!/[?&]life=0\b/.test(location.search)&&(()=>{try{return localStorage.getItem('od_life')!=='0'}catch(e){return true}})()){const s=document.createElement('script');s.src='models/lx.js';s.onload=()=>{try{eval(window.__LXJ)}catch(e){console.warn('LIFE load',e)}};document.head.appendChild(s)}
