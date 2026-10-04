/* ===== QA · human-play fixes (module qa.js, inserted before window.__mho; every global is QA_*) =====
   1) Touch players see keyboard hints in NPC lines ("Hold DRIFT (X)", "(SHIFT)", "(SPACE)"): strip them on touch. */
const QA_KEYS=/\s*\((?:SHIFT|Shift|X|SPACE|Space|Esc|ESC|M|T|R)\)/g;
function QA_untouchKeys(el){if(!el||!document.body.classList.contains('touch'))return;for(const n of el.querySelectorAll('p,small,span'))if(QA_KEYS.test(n.innerHTML)){QA_KEYS.lastIndex=0;n.innerHTML=n.innerHTML.replace(QA_KEYS,'')}}
{const ns=document.getElementById('npcSay');if(ns&&window.MutationObserver)new MutationObserver(()=>QA_untouchKeys(ns)).observe(ns,{childList:true,subtree:true,characterData:true})}
