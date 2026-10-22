// PURPOSE: HANGAR shows 5 tabs + a MORE sheet (every label fits a 375 px phone); the other menu defects of review 8 live in stats.js (toast slot, achievement glyphs), map.js and ret.js (glyphs)
// FLAG: none (always on)
// TEST: menufix-test.js
/* ---------- MENUFIX (flag RET.menufix, default ON; ?menufix=0 = the old HANGAR with ten tabs). Review 8, fix list 13: the HANGAR tab row had ten tabs and a PICK button in a scroller,
   labels were cut at 375 px. Now the row holds SHIP, WEAPONS, FORGE, PILOT, UPGRADES and one MORE button; MORE opens a sheet titled "MORE IN HANGAR" with ABILITY, CREW, LOOKS, LOAD, SHOP
   and PICK WEAPONS (each button clicks the original tab, so every id and hook keeps working). The original buttons stay in the row, hidden. ---------- */
(function(){
if(!RET.hub||typeof garageEl==='undefined')return;
document.documentElement.classList.add('mfx');
const st=document.createElement('style');st.textContent=`
html.mfx #garage.gfx .tabs{overflow:visible!important;gap:4px!important;flex-wrap:nowrap!important;-webkit-mask-image:none!important;mask-image:none!important}
html.mfx #garage .tabs button.hubSec,html.mfx #garage .tabs .hubMoreL{display:none!important}
html.mfx #garage .tabs button:not(.hubSec){flex:1 1 auto!important;min-width:0!important;padding:0 4px!important;font-size:13px!important;letter-spacing:0!important;white-space:nowrap;overflow:hidden}
#mfSheet{position:fixed;inset:0;z-index:60;background:#05020fd9;display:flex;align-items:flex-end;justify-content:center}
#mfSheet[hidden]{display:none}
#mfSheet .mfBox{width:min(100%,420px);box-sizing:border-box;padding:14px 12px calc(14px + env(safe-area-inset-bottom));background:#120a26;border:1px solid #3a2b5c;border-radius:16px 16px 0 0;display:grid;grid-template-columns:1fr 1fr;gap:8px}
#mfSheet h2{grid-column:1/-1;margin:0 0 2px;font:700 14px var(--display);letter-spacing:.14em;color:var(--dim)}
#mfSheet button{min-height:48px;font-size:14px;letter-spacing:.04em}
#mfSheet .mfX{grid-column:1/-1}
`;document.head.appendChild(st);
const tabs=garageEl.querySelector('.tabs'),NAMES={abil:'ABILITY',crew:'CREW',looks:'LOOKS',load:'LOAD',mkt:'SHOP'},ML=['abil','crew','looks','load','mkt'];
const more=document.createElement('button');more.type='button';more.id='mfMore';more.className='go dim';more.textContent='MORE';more.setAttribute('aria-haspopup','dialog');
const sheet=document.createElement('div');sheet.id='mfSheet';sheet.hidden=true;sheet.setAttribute('role','dialog');sheet.setAttribute('aria-label','More in the hangar');
const box=document.createElement('div');box.className='mfBox';const h=document.createElement('h2');h.textContent='MORE IN HANGAR';box.append(h);
const mfShut=()=>{sheet.hidden=true;more.setAttribute('aria-expanded','false');};
function item(label,id,go){const b=document.createElement('button');b.type='button';b.className='go dim';b.id=id;b.textContent=label;b.addEventListener('click',()=>{mfShut();go();});box.append(b);}
const orig=t=>tabs.querySelector('button[data-t="'+t+'"]');
for(const t of ML)item(NAMES[t],'mfI_'+t,()=>{const o=orig(t);if(o)o.click();});
item('PICK WEAPONS','mfI_pick',()=>{const w=$('hubWpPick');if(w)w.click();});
const x=document.createElement('button');x.type='button';x.className='go alt mfX';x.id='mfClose';x.textContent='CLOSE';x.addEventListener('click',mfShut);box.append(x);
sheet.append(box);let t0=0;   // the game turns a touch into a click at once and the browser sends its own a moment later: that second click must not hit what just appeared
sheet.addEventListener('click',e=>{if(e.target!==sheet)return;if(performance.now()-t0>=450)mfShut();},true);garageEl.append(sheet);
more.addEventListener('click',()=>{if(!sheet.hidden)return;t0=performance.now();sheet.hidden=false;more.setAttribute('aria-expanded','true');$('mfI_'+(ML.includes(GA.tab)?GA.tab:'abil')).focus();});
addEventListener('keydown',e=>{if(!sheet.hidden&&e.code==='Escape'){mfShut();e.stopImmediatePropagation();e.preventDefault();}},true);
function mfDraw(){const ml=tabs.querySelector('.hubMoreL');if(more.parentNode!==tabs||(ml&&more.nextSibling!==ml))tabs.insertBefore(more,ml||null);
  more.classList.toggle('on',ML.includes(GA.tab));}
{let busy=0;new MutationObserver(()=>{if(busy)return;busy=1;mfDraw();busy=0;}).observe(tabs,{childList:true});}
{const g1=gaDraw;gaDraw=function(){const r=g1.apply(this,arguments);mfDraw();return r;};}
{const old=window.__hub;if(old)old.mfShut=mfShut;}
window.__menufix={sheet:()=>sheet,mfShut};
})();
