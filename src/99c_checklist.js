// ===== CK: in-game TEST CHECKLIST (Alex 2026-10-08: "I will play, just include a check list inside the game update so I can validate").
// OD_CHECKLIST = items per version; each gets ✅ PASS / ❌ FAIL + an optional note, saved in localStorage 'mho_chk'. "COPY RESULTS" copies
// plain text (version, id, status, note) to paste to the coordinator. Opens from "✔ CHECKLIST" in the ⚙ drawer header and the UPDATES screen.
// The buttons show how many items of the current version are still unanswered. Every deploy adds its own items (newest version first).
const OD_CHECKLIST=[
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
 const badge=()=>{const n=open();document.querySelectorAll('.ckB').forEach(b=>b.textContent='✔ CHECKLIST'+(n?` (${n})`:''))};
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
 window.__chk={open:()=>odChkOpen(),text,items:OD_CHECKLIST}}
