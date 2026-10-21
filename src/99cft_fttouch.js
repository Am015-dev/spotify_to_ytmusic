// fasttravel-touch-r22f (2026-10-21): GO travel/ft-touch. A real touch tap (pointerdown + pointerup + click, pointerType touch) on the centre of the map's ⚡ FAST TRAVEL button must start the travel
// and move the player. State assert, no graphics. Also checks what the finger would hit (the button itself, not another element) and that the target is phone-sized (>= 44 px, not a map-high slab).
function FTT_tap(x,y){const e=document.elementFromPoint(x,y);if(!e)return null;const o={bubbles:true,cancelable:true,composed:true,clientX:x,clientY:y,pointerId:77,pointerType:'touch',isPrimary:true,button:0};
 e.dispatchEvent(new PointerEvent('pointerdown',{...o,buttons:1}));e.dispatchEvent(new PointerEvent('pointerup',{...o,buttons:0}));e.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0}));return e}
function FTT_go(){const say=t=>window.__chk.goSay(t);if(!RO.on)return'📍 FT TOUCH · not in free roam ❌';
 const gs=RO.marks.filter(m=>m.kind==='garage'&&m.id&&m.id!=='g_city'&&markKnown(m)).sort((a,b)=>Math.hypot(a.x-RO.x,a.z-RO.z)-Math.hypot(b.x-RO.x,b.z-RO.z)),m=gs[0];
 if(!m)return'📍 FT TOUCH · no known garage ❌';
 RO.ftT=0;RO.card=null;if(!RO.mapOpen)toggleMap(true);ftShow(m);const b=$('#roamFT');if(!RO.ftSel||b.hidden)return'📍 FT TOUCH · button did not appear ❌';
 const r=b.getBoundingClientRect(),cx=r.x+r.width/2,cy=r.y+r.height/2,hit=document.elementFromPoint(cx,cy),onBtn=hit===b||b.contains(hit),sizeOk=r.width>=44&&r.height>=44&&r.height<=90,x0=RO.x,z0=RO.z,t0=performance.now();
 FTT_tap(cx,cy);
 (function w(){const d=Math.hypot(RO.x-x0,RO.z-z0),done=d>100&&state==='roam'&&!RO.mapOpen;if(!done&&performance.now()-t0<45000)return setTimeout(w,400);const ok=onBtn&&sizeOk&&done;
  say(`📍 FT TOUCH · tap at the button centre (${Math.round(cx)},${Math.round(cy)}) hit ${onBtn?'the button':'<'+(hit&&(hit.id||hit.tagName))+'>'}, size ${Math.round(r.width)}×${Math.round(r.height)} (≥ 44, ≤ 90 high), moved ${d.toFixed(0)} m to ${m.id} (> 100) in ${((performance.now()-t0)/1000).toFixed(1)} s, map closed ${!RO.mapOpen} ${ok?'✅':'❌'}`)})();
 return'📍 FT TOUCH · tapping…'}
(function FTT_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='travel'&&q.id==='ft-touch')){
 C.items.push({ver:'travel',id:'ft-touch',area:'ui',text:'fasttravel-touch-r22f:2026-10-21 · FAST TRAVEL ON PHONE: tap a garage on the map, then tap the ⚡ FAST TRAVEL button. 📍 GO opens the map, selects a garage, taps the button centre with a touch pointer + click and checks the finger hits the button (phone-sized) and you arrive at the garage.'});
 C.GO['travel/ft-touch']=[{c:'fra',n:'Fast travel touch tap',secs:50,fn:FTT_go}]}return}
 if(i<600)setTimeout(()=>FTT_reg(i+1),100)})(0);
