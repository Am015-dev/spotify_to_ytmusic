/* ===== QA · human-play fixes (module qa.js, inserted before window.__mho; every global is QA_*) =====
   1) Touch players see keyboard hints in NPC lines ("Hold DRIFT (X)", "(SHIFT)", "(SPACE)"): strip them on touch. */
const QA_KEYS=/\s*\((?:SHIFT|Shift|X|SPACE|Space|Esc|ESC|M|T|R)\)/g;
function QA_untouchKeys(el){if(!el||!document.body.classList.contains('touch'))return;for(const n of el.querySelectorAll('p,small,span'))if(QA_KEYS.test(n.innerHTML)){QA_KEYS.lastIndex=0;n.innerHTML=n.innerHTML.replace(QA_KEYS,'')}}
{const ns=document.getElementById('npcSay');if(ns&&window.MutationObserver)new MutationObserver(()=>QA_untouchKeys(ns)).observe(ns,{childList:true,subtree:true,characterData:true})}
/* 2) Chase camera inside buildings. The bug-sweep guard (BF) only runs in Frankfurt and runs BEFORE the juice camera offsets
      (drop / pull-in / kick), which are added afterwards and can push the camera back into a wall. tPlay measured the camera inside
      a building collider in 40.9 % of Athens frames. This guard is the outermost roamCam wrapper, runs in every city, and slides the
      camera toward the car until it is out of the building (never into the car). */
const QA_S={camFix:0};
roamCam=(f=>function(dt){f(dt);if(state!=='roam'||(typeof M1!=='undefined'&&M1.cs))return;const c=camera.position;if(!roamHit(c.x,c.z,.4,c.y))return;QA_S.camFix++;
  const x0=c.x,z0=c.z,y0=c.y;let ok=0;for(let k=1;k<=12&&!ok;k++){const u=k/12*.85,x=x0+(RO.x-x0)*u,z=z0+(RO.z-z0)*u,y=y0+(RO.y+2.2-y0)*u*.5;if(!roamHit(x,z,.4,y)){c.set(x,y,z);ok=1}}
  if(!ok){c.set(RO.x-Math.sin(RO.h)*2.5,Math.max(y0,RO.y+6),RO.z-Math.cos(RO.h)*2.5)}camera.lookAt(RO.x+Math.sin(RO.h)*6,RO.y+1.5,RO.z+Math.cos(RO.h)*6)})(roamCam);
