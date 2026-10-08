// ===== CK: in-game TEST CHECKLIST (Alex 2026-10-08: "I will play, just include a check list inside the game update so I can validate").
// OD_CHECKLIST = items per version; each gets ✅ PASS / ❌ FAIL + an optional note, saved in localStorage 'mho_chk'. "COPY RESULTS" copies
// plain text (version, id, status, note) to paste to the coordinator. Opens from "✔ CHECKLIST" in the ⚙ drawer header and the UPDATES screen.
// The buttons show how many items of the current version are still unanswered. Every deploy adds its own items (newest version first).
const OD_CHECKLIST=[
 {ver:'v88r',id:'pin-fold',text:'Garage RIDES: the checklist shows as a small ✓ chip and does not cover the car; tap it to open. In a race it stays folded during the 3-2-1-GO countdown, then opens again.'},
 {ver:'v88p',id:'life-crowds',text:'Drive 1 minute in Frankfurt and in Athens: at most street corners ahead you see a group of 3-6 people standing together; they turn to look, wave and hop as you come by.'},
 {ver:'v88p',id:'life-dodge',text:'Drive fast past a corner group: the people leap out of the way; nobody stands on the road.'},
 {ver:'v88p',id:'life-stalls',text:'You pass market stalls (striped awnings, fruit boxes) and café tables with umbrellas on the pavements. Drive into one: it bursts into bricks and studs; it does not stop you dead.'},
 {ver:'v88p',id:'life-parked',text:'Parked cars stand half on the kerb on many streets ahead; driving into one slowly bumps you off it, fast smashes it.'},
 {ver:'v88p',id:'pop-ring',text:'While free-roaming, every ~30 s a coloured ring with a sign (RAMP JUMP, DRIFT ZONE, SMASH STREAK, CONE SLALOM) appears on the road ahead in your lane. Only one at a time, no new buttons or panels.'},
 {ver:'v88p',id:'pop-play',text:'Drive through a ring: the objective line shows the challenge, the progress and the seconds left. Finish it: big brick burst and +150 studs. Miss it: a short MISSED message, nothing else.'},
 {ver:'v88p',id:'pop-each',text:'Try all four: the ramp launches you, the drift counts only while drifting, the crates smash, the cones fly when you clip them.'},
 {ver:'v88p',id:'life-fps2',text:'On the phone the game still runs smoothly in a busy street with a pop-up running.'},
 {ver:'v88o',id:'pin-strip',text:'This checklist stays on screen while you drive, race and build: answer with ✅ / ❌, ‹ › to move, tap the counter to fold it to a chip. Steering and gas keep working while you tap it.'},
 {ver:'v88o',id:'clear-base',text:'Garage BUILD → ⋯ MORE → CLEAR on a normal car and on the Bus: only the chassis and wheels stay, with one clean grid and nothing overlapping. UNDO brings the build back.'},
 {ver:'v88o',id:'gx-palette',text:'Garage BUILD (phone): the parts palette shows 2 rows of bigger tiles with names; swipe it sideways to see more. ▾ makes it small again.'},
 {ver:'v88o',id:'gx-chips',text:'Tap the category chips (BRICKS, PLATES, SLOPES…): only those parts show. Pick a few parts, then tap 🕘 RECENT: the parts you just used are first.'},
 {ver:'v88o',id:'gx-fav',text:'Long-press a part tile (right-click on PC): it gets a ★ and shows under ★ FAVS. Long-press again removes it. It is still there after a reload.'},
 {ver:'v88o',id:'gx-make',text:'Tap ☝ SELECT, tap 3–4 parts, then MAKE GROUP: a group "Group 1" appears in the ⛓ GROUPS list. ✎ renames it.'},
 {ver:'v88o',id:'gx-eye',text:'In ⛓ GROUPS tap the 👁 eye: the group disappears and its parts cannot be tapped; tap again to show it. SAVE & DRIVE with it hidden: the car you drive is complete.'},
 {ver:'v88o',id:'gx-ops',text:'Tap a group name: MOVE, COPY, MIRROR and DELETE work on the whole group (UNDO brings a deleted group back).'},
 {ver:'v88o',id:'gx-hideup',text:'Open a big template (Bus), step the LAYER ▼ down and tap HIDE UP: everything above the layer disappears so you can build inside; SHOW UP brings it back.'},
 {ver:'v88n',id:'life-people',text:'Drive 1 minute in Frankfurt: you see people on the pavements most of the time, and some wave both arms as you pass them.'},
 {ver:'v88n',id:'life-traffic',text:'Traffic cars show up on the streets around you (not only far away), including orange and pink street racers; they still do not block the inner lane.'},
 {ver:'v88n',id:'life-pigeons',text:'Drive toward a group of grey pigeons on a pavement: they fly off before you reach them. White gulls circle high above.'},
 {ver:'v88n',id:'life-sky',text:'Look around: red/white flags flap on some rooftops and a LEGO blimp slowly circles over the city (Athens: blue/white flags).'},
 {ver:'v88n',id:'life-boats',text:'Frankfurt: boats sail up and down the Main. Drive the boat into one: you bounce off, you do not pass through it.'},
 {ver:'v88n',id:'life-colours',text:'Frankfurt buildings have bold LEGO colours (red, yellow, blue, green); Athens old-town houses are warm yellow/orange. Nothing looks washed out.'},
 {ver:'v88n',id:'life-fps',text:'On the phone the game runs as smoothly as before in a busy street (no new stutter).'},
 {ver:'v88n',id:'life-knob',text:'⚙ TUNE → Life → "World life (master)" at 0 makes the streets quiet again; at 1.5 they get busier.'},
 {ver:'v88l',id:'sb-open',text:'Garage RIDES: every car card has ▶ GUIDE; tapping it plays that car being built step by step (parts drop in, a parts box on the left, a counter like 1/22 top right).'},
 {ver:'v88l',id:'sb-ctrl',text:'In the guide: ◀ ▶ change the step, PLAY/PAUSE, ×1/×2, the slider jumps; no button covers the car on the phone; EXIT goes back to the garage with your car unchanged.'},
 {ver:'v88l',id:'sb-more',text:'BUILD → ⋯ MORE → BUILD GUIDE works for any car (also the bus or your own build); EXIT returns to BUILD.'},
 {ver:'v88l',id:'sb-diy',text:'In the guide tap ✋ BUILD IT: the next parts show as a green ghost; tapping near it snaps the part in; 💡 PLACE IT places it for you; ✕ before the end restores the car.'},
 {ver:'v88k',id:'su-rides',text:'Garage RIDES → STREET: the row STREET RACER FAMILY shows 4 cars (Orange Street Racer + 3 variations), then TUNER FRIENDS with 3 more.'},
 {ver:'v88k',id:'su-look',text:'Orange Street Racer looks like the LEGO set: orange, open top with blue seats, lime side graphics, grey wing on struts, silver wheels.'},
 {ver:'v88k',id:'su-drive',text:'Equip the Orange Street Racer, SAVE & DRIVE: it drives like the other normal cars (not slow like the bus).'},
 {ver:'v88k',id:'su-tyres',text:'All four tyres of every new car sit on the road, including the Widebody Track Racer and the Black Gold V8 (gold wheels).'},
 {ver:'v88k',id:'su-build',text:'✎ BUILD on a new car: its parts load and you can remove the wing or recolour it.'},
 {ver:'v88i',id:'big-rides',text:'Garage RIDES: the Sightseeing Bus, Box Truck, Stretch Limo and Monster Truck show up and look like LEGO vehicles; equip each one and SAVE & DRIVE.'},
 {ver:'v88i',id:'big-junction',text:'Drive the Bus or the Truck through 3 junctions in Frankfurt: it turns wider than a car but never gets stuck on a corner.'},
 {ver:'v88i',id:'big-feel',text:'A big car picks up speed more slowly than the Hot Rod, and the camera shows the whole vehicle.'},
 {ver:'v88i',id:'big-tyres',text:'All four tyres of each big template sit on the road (no floating, no sinking), including the Monster Truck.'},
 {ver:'v88i',id:'big-build',text:'Garage BUILD on a big template: you can place bricks along the full length and on the roof; the camera shows the whole car.'},
 {ver:'v88i',id:'big-pc-cam',text:'On PC: drive the Bus and the Box Truck; the camera sits above the roof and you can see the road ahead over the vehicle.'},
 {ver:'v88i',id:'big-limo',text:'Drive the Stretch Limo through a few junctions: it turns wider than a car, tyres on the road, nothing stuck.'},
 {ver:'v88i',id:'small-same',text:'Switch back to a normal car: it drives exactly like before.'},
 {ver:'v88h',id:'city-reenter',text:'Leave free roam (menu, a race or garage SAVE & DRIVE), come back, then logbook ALL (TEST) → GO to Hot Drop: the city is fully built around you (road, kerbs, grass, buildings), no floating roofs.'},
 {ver:'v88h',id:'city-far',text:'After coming back to free roam, drive or GO to the far side of town (2+ km): the streets and buildings there are drawn, not a pale empty plane.'},
 {ver:'v88g',id:'turn60',text:'Normal turn at a junction at 50–80 km/h with GAS only: the car turns cleanly where it points, no sliding sideways.'},
 {ver:'v88g',id:'brake-turn',text:'Brake briefly before or in a turn (tap BRAKE, or ↓ while holding ↑ on PC): the car slows down and does NOT start a drift.'},
 {ver:'v88g',id:'drift-btn',text:'DRIFT button (X on PC) while steering at speed: the car still slides on purpose, with the pink trail and a mini-turbo after.'},
 {ver:'v88g',id:'drift-gb',text:'Hold GAS + BRAKE together while steering at 80+ km/h for about a second: it still becomes a drift.'},
 {ver:'v88g',id:'phone-thumb',text:'Phone: rest your thumb near the line between GAS and BRAKE and tap BRAKE in a turn: no accidental drift.'},
 {ver:'v88f',id:'steer-turn',text:'Turn left or right at a junction at 60–80 km/h: the car settles straight within about a second, no wobbling.'},
 {ver:'v88f',id:'steer-tap',text:'Tap ◀ or ▶ briefly on a straight road: the car moves over a little, no jerk and no swinging back and forth.'},
 {ver:'v88f',id:'route-follow',text:'Hot Drop (follow Hilde): the yellow route follows the roads, no sudden U-turns, and the top line says "left/right in … m" a few seconds before each turn.'},
 {ver:'v88f',id:'route-zig',text:'Any mission with a route: no random left-right zig-zags through side streets.'},
 {ver:'v88f',id:'build-layer',text:'Garage BUILD: ▲▼ changes the layer; bricks land on the chosen layer and the layers above are see-through.'},
 {ver:'v88f',id:'build-view',text:'Garage BUILD: the TOP / SIDE / 3D buttons switch the view.'},
 {ver:'v88f',id:'map-chips',text:'Map: the legend chips hide and show garages, races and other icons; your choice is still there after you close and reopen the map.'},
 {ver:'v88f',id:'garage-popup',text:'Garage: a CATEGORY / COLOUR / MORE popup closes after you pick, and no buttons hide under each other or under ⚙.'},
 {ver:'v88f',id:'music',text:'Music plays after your first tap (iPhone and the Claude app).'}];
{const KEY='mho_chk',esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}},save=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}};
 const k=it=>it.ver+'/'+it.id,cur=()=>OD_CHECKLIST.filter(it=>it.ver===OD_CHECKLIST[0].ver);
 const open=()=>{const s=load();return cur().filter(it=>!(s[k(it)]&&s[k(it)].st)).length};
 const st=document.createElement('style');st.textContent=`#odChk{position:fixed;inset:0;z-index:9100;display:flex;align-items:center;justify-content:center;background:rgba(10,14,30,.6);padding:8px;box-sizing:border-box;user-select:none;-webkit-user-select:none}#odChk[hidden]{display:none}
#odChk .cc{width:min(720px,100%);max-height:100%;display:flex;flex-direction:column;background:#0b1626;border:3px solid #3ddc84;border-radius:16px;color:#e8f2fa;font:600 13px system-ui}
#odChk .ch{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:2px solid #1d3550}#odChk .ch b{font:italic 900 20px var(--hud,system-ui)}#odChk .ch small{color:#9fb3c8;font-size:12px}
#odChk .ch button,#odChk .ci button{font:900 13px system-ui;min-width:44px;min-height:44px;border-radius:10px;border:2px solid #4ceaff;background:#12304a;color:#fff;padding:0 10px}#odChk .ch [data-c=copy]{margin-left:auto}body.ckOn #tuG{visibility:hidden}
#odChk .cb{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 10px 10px}#odChk .ci{display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #ffffff14;flex-wrap:wrap}
#odChk .ci p{flex:1 1 300px;margin:0;line-height:1.35;font-size:13px}#odChk .ci .pa.on{background:#3ddc84;border-color:#3ddc84;color:#0b1626}#odChk .ci .fa.on{background:#ff4d6d;border-color:#ff4d6d}
#odChk .ci input{flex:1 1 100%;min-height:36px;font:13px system-ui;background:#0d1a2c;color:#fff;border:1px solid #4ceaff55;border-radius:8px;padding:4px 8px;user-select:text;-webkit-user-select:text}
#odChk .msg{color:#ffd12c;font-size:12px}.ckB{font:800 13px system-ui;min-height:44px;border-radius:10px;border:2px solid #3ddc84;background:#10301f;color:#fff;padding:0 10px}`;document.head.appendChild(st);
 const ov=document.createElement('div');ov.id='odChk';ov.hidden=true;document.body.appendChild(ov);
 for(const ev of['touchstart','touchmove','touchend','pointerdown','mousedown','wheel'])ov.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
 for(const ev of['keydown','keyup'])ov.addEventListener(ev,e=>{if(e.target.tagName==='INPUT')e.stopPropagation()});
 const text=()=>{const s=load();return 'Mainhattan Overdrive checklist '+OD_VER+'\n'+OD_CHECKLIST.map(it=>{const r=s[k(it)]||{};return `${it.ver} ${it.id}: ${r.st||'-'}${r.n?' · '+r.n:''}`}).join('\n')};
 const badge=()=>{try{pinR()}catch(e){}const n=open();document.querySelectorAll('.ckB').forEach(b=>b.textContent='✔ CHECKLIST'+(n?` (${n})`:''))};
 const render=msg=>{const s=load(),v=OD_CHECKLIST[0].ver;let h=`<div class="cc"><div class="ch"><b>TEST CHECKLIST</b><small>${esc(v)} · ${open()} open</small><button data-c="copy">COPY RESULTS</button><button class="x" data-c="x">✕</button></div><div class="cb">${msg?`<div class="msg">${esc(msg)}</div>`:''}`;
  for(const it of OD_CHECKLIST){const r=s[k(it)]||{};h+=`<div class="ci" data-k="${esc(k(it))}"><p>${it.ver===v?'':`<small>${esc(it.ver)} · </small>`}${esc(it.text)}</p><button class="pa ${r.st==='PASS'?'on':''}" data-c="PASS">✅ PASS</button><button class="fa ${r.st==='FAIL'?'on':''}" data-c="FAIL">❌ FAIL</button><input type="text" placeholder="note (optional)" value="${esc(r.n||'')}"></div>`}
  ov.innerHTML=h+'</div></div>';badge()};
 const copy=()=>{const t=text();const done=()=>render('Copied: paste it to the coordinator.');
  const fb=()=>{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:0;top:0;opacity:0';document.body.appendChild(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}a.remove();ok?done():render('Copy blocked here; long-press to select:\n'+t)};
  try{navigator.clipboard.writeText(t).then(done,fb)}catch(e){fb()}};
 ov.addEventListener('click',e=>{if(e.target===ov){ov.hidden=true;document.body.classList.remove('ckOn');return}const b=e.target.closest('button');if(!b)return;const c=b.dataset.c;try{AU.sfx('pick')}catch(er){}
  if(c==='x'){ov.hidden=true;document.body.classList.remove('ckOn')}else if(c==='copy')copy();else if(c==='PASS'||c==='FAIL'){const key=b.closest('.ci').dataset.k,s=load();s[key]=Object.assign(s[key]||{},{st:s[key]&&s[key].st===c?'':c});save(s);render()}});
 ov.addEventListener('change',e=>{const i=e.target;if(i.tagName!=='INPUT')return;const key=i.closest('.ci').dataset.k,s=load();s[key]=Object.assign(s[key]||{},{n:i.value.slice(0,200)});save(s)});
 window.odChkOpen=()=>{render();ov.hidden=false;document.body.classList.add('ckOn')};
 const mk=()=>{const b=document.createElement('button');b.className='ckB';b.addEventListener('click',e=>{e.stopPropagation();try{if(typeof TU_toggle==='function')TU_toggle(false)}catch(er){}document.getElementById('odUpd')&&(document.getElementById('odUpd').hidden=true);odChkOpen()});return b};
 // ⚙ drawer header (re-rendered on every change) and the UPDATES screen header
 if(typeof TU_render==='function'){const r0=TU_render;TU_render=function(){r0.apply(this,arguments);const th=TU.el&&TU.el.querySelector('.th');if(th&&!th.querySelector('.ckB'))th.appendChild(mk());badge()}}
 if(typeof window.odUpdOpen==='function'){const u0=window.odUpdOpen;window.odUpdOpen=function(){u0.apply(this,arguments);const u=document.querySelector('#odUpd .ub');if(u&&!u.querySelector('.ckB')){const b=mk();b.style.cssText='display:block;margin:8px 0 2px';u.insertBefore(b,u.firstChild)}badge()}}
 // ---- PIN (Alex 2026-10-08: "the checklist should be staying while i am playing the game"): a mini checklist pinned on screen in roam, races,
 // missions and the garage. Expanded: counter (tap = fold to a chip), item text (tap = full panel with notes + COPY RESULTS), ✅ / ❌, ‹ ›.
 // Folded: a "✓ 3/8" chip. It can only be dismissed (✕ on the chip) once every item of the version is answered. State lives in mho_chk._pin.
 // Touches on it never reach the controls under it and it never pauses the game.
 const pst=()=>{const s=load(),v=OD_CHECKLIST[0].ver;let P=s._pin;if(!P||P.v!==v)P={v,i:0,col:0,done:0};return P},psave=P=>{const s=load();s._pin=P;save(s)};
 // the strip walks the items of the newest 3 versions (a small hotfix release must not hide the open items of the release before it)
 const pinItems=()=>{const V=[...new Set(OD_CHECKLIST.map(it=>it.ver))].slice(0,3);return OD_CHECKLIST.filter(it=>V.includes(it.ver))};
 let pinBkOpen=0;const pinBk=()=>{const X=document.getElementById('gbx');return !!X&&!X.hidden&&X.getClientRects().length>0};
 // v88o2 (reviewer): folded in every garage mode (it covered the car preview in RIDES) unless opened there, and during the race GO countdown + first 3 s
 const pinCd=()=>{try{return state==='countdown'||(state==='race'&&raceT<3)}catch(e){return false}};
 const pin=document.createElement('div');pin.id='odPin';pin.hidden=true;document.body.appendChild(pin);
 for(const ev of['touchstart','touchmove','touchend','pointerdown','pointerup','pointermove','mousedown','mouseup','wheel','dblclick'])pin.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
 const pinR=()=>{const P=pst(),C=pinItems(),s=load(),n=C.length,ans=C.filter(it=>s[k(it)]&&s[k(it)].st).length;
  const busy=!ov.hidden||!n||P.done&&ans===n||(()=>{const l=document.getElementById('loading');return l&&!l.hidden&&getComputedStyle(l).display!=='none'})();
  pin.hidden=!!busy;if(busy)return;P.i=Math.max(0,Math.min(n-1,P.i|0));const it=C[P.i],r=s[k(it)]||{};let h;const fold=P.col||(pinBk()&&!pinBkOpen)||pinCd();
  if(fold)h=`<button class="pc" data-p="exp" title="Show the checklist">✓ ${ans}/${n}</button>`+(ans===n?`<button class="px" data-p="done" title="Hide (all answered)">✕</button>`:'');
  else h=`<button class="pn" data-p="col" title="Fold"><b>${P.i+1}/${n}</b><small>▴ ${ans}✓</small></button><p data-p="full" title="Open the full checklist (notes, COPY RESULTS)">${esc(it.text)}</p>`+
   `<button class="pa ${r.st==='PASS'?'on':''}" data-p="PASS" title="Pass">✅</button><button class="fa ${r.st==='FAIL'?'on':''}" data-p="FAIL" title="Fail">❌</button>`+
   `<span class="pv"><button data-p="prev" title="Previous">‹</button><button data-p="next" title="Next">›</button></span>`;
  pin.classList.toggle('col',!!fold);if(pin._h!==h){pin._h=h;pin.innerHTML=h}pinPlace()};
 // garage: sit in the free band between the left column (mode rail, selection / groups panels) and the right column (layer views, side panel)
 const pinPlace=()=>{const X=document.getElementById('gbx'),vis=e=>!!e&&!e.hidden&&e.getClientRects().length>0&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0;
  if(!vis(X)){pin.style.left='';pin.style.width='';pin.style.transform='';
   // roam / race / missions: below the objective line (quest tracker, objective pill) when it sits at the top centre
   if(innerWidth>900&&innerHeight>500){const g=document.querySelector('#tuG,#tuB,[id^="tu"][id$="G"]');let t=108;if(vis(g)){const r=g.getBoundingClientRect();if(r.top<160&&r.right>innerWidth-120)t=Math.round(r.bottom)+10}
    pin.style.transform='none';pin.style.left=Math.round(innerWidth-16-pin.offsetWidth)+'px';pin.style.top=t+'px';return}
   const a=pin.getBoundingClientRect();let t=54;for(const e of document.querySelectorAll('#roamArrow,#qTrk,#obj,[id*="Obj"],[class*="Pill"],[class*="pill"]')){if(pin.contains(e)||!vis(e))continue;const r=e.getBoundingClientRect();
    if(r.top<110&&r.bottom<150&&r.right>a.left&&r.left<a.right&&r.height<70)t=Math.max(t,Math.round(r.bottom)+6)}
   pin.style.top=t===54?'':`calc(env(safe-area-inset-top,0px) + ${t}px)`;return}pin.style.top='';let L=0,R=innerWidth;
  for(const q of['#r2R','#gxG','#slBar','#gsBar']){const e=document.querySelector(q);if(vis(e)){const r=e.getBoundingClientRect();if(r.top<120)L=Math.max(L,r.right+6)}}
  for(const q of['#b25 .b25V','#gbx .gbp']){const e=document.querySelector(q);if(vis(e)){const r=e.getBoundingClientRect();if(r.top<120&&r.left>L)R=Math.min(R,r.left-6)}}
  const w=Math.min(340,R-L),x=L+Math.max(0,(R-L-pin.offsetWidth)/2);if(w<200){pin.style.left='';pin.style.width='';pin.style.transform='';return}
  pin.style.transform='none';pin.style.width=P_col()?'':w+'px';pin.style.left=Math.round(P_col()?x:L+(R-L-w)/2)+'px'};
 const P_col=()=>pin.classList.contains('col');
 pin.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-p]');if(!b)return;const a=b.dataset.p,P=pst(),C=pinItems(),n=C.length;try{AU.sfx('pick')}catch(er){}
  if(a==='col'){P.col=1;pinBkOpen=0}else if(a==='exp'){P.col=0;if(pinBk())pinBkOpen=1}else if(a==='done'){P.done=1}else if(a==='prev'){P.i=(P.i-1+n)%n}else if(a==='next'){P.i=(P.i+1)%n}else if(a==='full'){psave(P);odChkOpen();pinR();return}
  else if(a==='PASS'||a==='FAIL'){const s=load(),key=k(C[P.i]),was=s[key]&&s[key].st===a;s[key]=Object.assign(s[key]||{},{st:was?'':a});s._pin=P;save(s);
   if(!was){for(let j=1;j<=n;j++){const q=C[(P.i+j)%n],x=s[k(q)];if(!(x&&x.st)){P.i=(P.i+j)%n;break}}}}
  psave(P);pinR();badge()});
 {const st2=document.createElement('style');st2.textContent=`#odPin{position:fixed;z-index:8990;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 54px);width:min(340px,calc(100vw - 16px));box-sizing:border-box;display:flex;align-items:center;gap:4px;padding:4px;
 background:rgba(11,22,38,.88);border:2px solid #3ddc84;border-radius:12px;color:#e8f2fa;font:600 12px system-ui;user-select:none;-webkit-user-select:none;touch-action:manipulation;box-shadow:0 2px 0 rgba(0,0,0,.35)}#odPin[hidden]{display:none}
#odPin button{min-height:44px;border-radius:9px;border:2px solid #4ceaff;background:#12304a;color:#fff;font:900 12px system-ui;padding:0;cursor:pointer;flex:none}
#odPin .pn{width:46px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-color:#3ddc84}#odPin .pn b{font-size:13px}#odPin .pn small{font-size:12px;color:#9fe8bf;font-weight:800}
#odPin p{flex:1;min-width:0;margin:0;line-height:15px;max-height:30px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;cursor:pointer;font-size:12px}
#odPin .pa,#odPin .fa{width:44px;font-size:17px}#odPin .pa.on{background:#3ddc84;border-color:#3ddc84}#odPin .fa.on{background:#ff4d6d;border-color:#ff4d6d}
#odPin .pv{display:flex;flex-direction:column;gap:2px}#odPin .pv button{width:28px;min-height:21px;height:21px;font-size:15px;line-height:1}
#odPin.col{width:auto;padding:2px;gap:3px}#odPin.col .pc{padding:0 12px;border-color:#3ddc84;background:#10301f;font-size:13px}#odPin.col .px{width:44px}
body.ckOn #odPin{display:none}body:has(#odPin:not([hidden])) #gbx.r2 #gsTip{top:calc(var(--r2hh,52px) + 66px)}`;document.head.appendChild(st2)}
 setInterval(pinR,700);pinR();
 window.__chk={open:()=>odChkOpen(),text,items:OD_CHECKLIST,pin:()=>pinR(),pinSt:()=>pst()}}
