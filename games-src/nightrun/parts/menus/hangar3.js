// PURPOSE: MORE becomes a page inside the hangar frame (big illustrated tiles, one per section, no pop-up) and FORGE sits in the same
//          3-column frame (left = slots A + B and the result drawn big, middle = owned items as tiles with WEAPONS/MODS/PRESETS chips, right = merge panel / recipes / item info)
// FLAG: hangar3 (?hangar3=0 = the MORE pop-up and the stand-alone forge screen)
// TEST: qa/hangar2-test.js (H3 section: MORE has no role=dialog, FORGE keeps #gaBack visible, BACK hides the hangar from every tab and MORE section)
/* ---------- HANGAR3: owner, 22 Oct 2026: "the MORE section is ugly and FORGE is even the old structure". Every id the tests use stays: the MORE tiles
   click the old mfI_* buttons, the forge DOM is forgeone.js's own (#fuMerge, #fuRec, #fuSlotA...), this layer only moves its panels into the frame. ---------- */
(function(){
if(RET.hangar3===undefined)RET.hangar3=!/[?&]hangar3=0/.test(location.search);
if(!RET.hangar3||!RET.hangar2||typeof garageEl==='undefined'||!window.__menufix)return;
document.documentElement.classList.add('h3');
const st=document.createElement('style');st.id='h3css';
st.textContent=`
html.h3 #mfSheet{display:none!important}
#h3More{display:none}
html.h3 #garage.h3m #gaCards{display:none!important}
html.h3 #garage.h3m:not([hidden]) #h3More{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;align-content:start;overflow-y:auto;min-height:0;padding:2px 4px 12px;font-family:var(--display);color:var(--ink)}
#h3More h2{grid-column:1/-1;margin:0;font:700 15px var(--display);letter-spacing:.14em;color:var(--dim)}
#h3More .mt{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 10px 12px;min-height:176px;border-radius:14px;background:#120b28;border:2px solid color-mix(in srgb,var(--c) 40%,#2a2050);text-align:center;position:relative}
#h3More .mt:hover,#h3More .mt:focus-visible,#h3More .mt.on{border-color:var(--c);background:color-mix(in srgb,var(--c) 14%,#120b28)}
#h3More .mt svg{width:80px;height:80px;flex:0 0 auto;color:var(--c);filter:drop-shadow(0 0 10px color-mix(in srgb,var(--c) 45%,transparent))}
#h3More .mt b{font-size:18px;letter-spacing:.06em;color:var(--c)}
#h3More .mt span{font-size:15px;line-height:1.3;color:#e4e0ff}
#h3More .mt em:empty{visibility:hidden;border-color:transparent}
#h3More .mt em{order:-1;align-self:flex-end;min-height:1.4em;margin:-6px -2px -4px 0;font:700 14px var(--display);font-style:normal;padding:2px 8px;border-radius:9px;background:#1a1236;border:1.5px solid var(--c);color:var(--c)}
html.h3 #garage .tabs #mfMore.h3on{opacity:1;background:linear-gradient(180deg,#ff5fb8,#c42a80)!important;border-color:#ffd0ea!important;color:#fff!important}
html.h3 #garage.h3m .tabs button[data-t].on{background:#140d2e!important;color:var(--ink)!important;border-color:#3a2b5c!important;box-shadow:none!important}
html.h3 #gaCards.f2 .h3R .f2-sheet .hd{flex-wrap:wrap}
/* FORGE in the frame: the hangar header and tabs stay (forgeone hides every sibling of the cards) */
@media (max-width:1023px),(max-height:599px){
 html.h3 #h3More .mt{min-height:150px}html.h3 #h3More .mt svg{width:72px;height:72px}
 html.h3 #garage.h3m:not([hidden]) #h3More{grid-template-columns:1fr 1fr;grid-auto-rows:max-content;flex:1 1 0}
 html.h3 #h3More .mt{height:auto;min-height:0}
}
@media (min-width:1024px) and (min-height:600px){
 html.h3 #h3More{grid-area:cards}
 html.h3 #garage.f2:not([hidden]){display:grid!important;grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto minmax(0,1fr);grid-template-areas:"top" "tabs" "cards";gap:14px!important;padding:18px 28px!important}
 html.h3 #garage#garage.f2:not([hidden])>.top{display:flex!important}
 html.h3 #garage#garage.f2:not([hidden])>.tabs{display:flex!important}
 html.h3 #gaCards.f2 .f2-top .f2-tab{min-height:44px;font-size:15px}
 html.h3 #garage.f2>.top{grid-area:top}html.h3 #garage.f2>.tabs{grid-area:tabs}
 html.h3 #gaCards.f2{grid-area:cards;max-width:none!important;margin:0!important;display:grid!important;grid-template-columns:minmax(340px,30%) minmax(0,1fr) minmax(300px,25%);
   grid-template-rows:auto minmax(0,1fr) auto;grid-template-areas:"bench top pane" "bench inv pane" "lo inv pane";gap:14px 18px!important;overflow:hidden!important}
 html.h3 #gaCards.f2 .f2-top{grid-area:top}html.h3 #gaCards.f2 .f2-bench{grid-area:bench;align-self:start}html.h3 #gaCards.f2 .f2-lo{grid-area:lo}
 html.h3 #gaCards.f2 .f2-inv,html.h3 #gaCards.f2 .f2-pre{grid-area:inv;min-height:0}
 html.h3 #gaCards.f2 .f2-tabs{flex:0 1 auto;gap:0;border:1.5px solid #3a2b5c;border-radius:12px;overflow:hidden}
 html.h3 #gaCards.f2 .f2-tab{flex:0 0 auto;padding:0 18px;border:0;border-radius:0;background:#140d2e}
 html.h3 #gaCards.f2 .f2-tab.on{background:#ff5fb8;color:#fff}
 html.h3 #gaCards.f2 .f2-bk{display:none}
 html.h3 #gaCards.f2 .f2-row{grid-template-columns:minmax(0,1fr) 22px minmax(0,1fr);row-gap:6px}
 html.h3 #gaCards.f2 .f2-row>.f2-op:nth-child(4){grid-column:1/-1}
 html.h3 #gaCards.f2 .f2-row>.out{grid-column:1/-1;height:200px!important}
 html.h3 #gaCards.f2 button.f2-slot{height:170px;gap:6px;font-size:16px}
 html.h3 #gaCards.f2 .f2-slot canvas{width:104px!important;height:104px!important;flex:0 0 104px!important}
 html.h3 #gaCards.f2 .f2-row>.out canvas{width:128px!important;height:128px!important;flex:0 0 128px!important}
 html.h3 #gaCards.f2 .f2-slot span{font-size:17px}html.h3 #gaCards.f2 .f2-slot small{font-size:15px}
 html.h3 #gaCards.f2 .f2-bench{padding:14px}
 html.h3 #gaCards.f2 .f2-lo{grid-template-columns:1fr 1fr;padding:10px}
 html.h3 #gaCards.f2 .fgslot.f2-ls>button{height:64px;flex-direction:row;gap:8px}
 html.h3 #gaCards.f2 .f2-inv{padding:10px}
 html.h3 #gaCards.f2 .f2-pg{display:none!important}
 html.h3 #gaCards.f2 .f2-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));grid-auto-rows:min-content;align-content:start;gap:12px;max-height:none;min-height:0;overflow-x:hidden;overflow-y:auto;scroll-snap-type:none;padding:4px}
 html.h3 #gaCards.f2 button.fgt.f2-card{flex:none;height:auto;min-height:196px;gap:6px;padding:14px 10px 12px;border:2px solid #3a2b5c;border-radius:14px;background:#120b28;justify-content:flex-start}
 html.h3 #gaCards.f2 button.fgt.f2-card.sel{border-color:#ff5fb8;background:color-mix(in srgb,#ff5fb8 14%,#120b28);transform:none}
 html.h3 #gaCards.f2 .f2-card canvas{width:72px!important;height:72px!important;flex:0 0 72px!important}
 html.h3 #gaCards.f2 .f2-card .n{font-size:17px;white-space:normal}html.h3 #gaCards.f2 .f2-card small{font-size:15px}html.h3 #gaCards.f2 .f2-card small.vs{display:block}
 html.h3 #gaCards.f2 .h3R{grid-area:pane;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding:20px 18px;background:#0d0820;border:1.5px solid color-mix(in srgb,#ff5fb8 55%,#3a2b5c);border-radius:14px;font-family:var(--display)}
 html.h3 #gaCards.f2 .h3R h3{margin:0;font-size:24px;letter-spacing:.06em;text-align:center}
 html.h3 #gaCards.f2 .h3R .f2-st{height:auto;flex-direction:column;align-items:stretch}
 html.h3 #gaCards.f2 .h3R .f2-msg{max-height:none;-webkit-line-clamp:4;font-size:16px;line-height:22px}
 html.h3 #gaCards.f2 .h3R .f2-wal{text-align:left;font-size:16px;line-height:22px}
 html.h3 #gaCards.f2 .h3R .f2-prev{height:auto;font-size:16px;line-height:22px}html.h3 #gaCards.f2 .h3R .f2-dl{flex-wrap:wrap}
 html.h3 #gaCards.f2 .h3R .f2-go{flex-direction:column;margin-top:auto}
 html.h3 #gaCards.f2 .h3R button.f2-merge{height:72px;font-size:22px}html.h3 #gaCards.f2 .h3R button.f2-merge small{font-size:16px}
 html.h3 #gaCards.f2 .h3R .f2-go .f2-b{height:52px}
 html.h3 #gaCards.f2 .h3R .f2-scrim{position:static;inset:auto;background:none;display:block;overflow:visible}
 html.h3 #gaCards.f2 .h3R .f2-sheet{max-width:none;max-height:none;border-radius:12px;border:1.5px solid #5cecff;animation:none;padding:12px}
 html.h3 #gaCards.f2 .h3R .f2-sheet .lst{grid-template-columns:1fr;overflow:visible}
 html.h3 #gaCards.f2 .h3R .f2-sheet p{font-size:16px;line-height:22px}
}`;
document.head.appendChild(st);

/* ----- the MORE page: one illustrated tile per section; a tile opens its section in the middle column (the old mfI_* button does the work) ----- */
const I=p=>'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const fgOk=()=>typeof FG!=='undefined'&&FG.st&&typeof FGR!=='undefined';
const SEC=[
 ['abil','ABILITY','The special move on your second button','#c08aff',I('<path d="M36 6L14 36h16l-4 22 24-32H34z" fill="currentColor" fill-opacity=".25"/>'),null],
 ['crew','CREW','Helpers who boost every run','#ffb020',I('<circle cx="22" cy="22" r="8"/><circle cx="42" cy="22" r="8"/><path d="M8 52c2-10 8-14 14-14s12 4 14 14M30 52c2-10 6-14 12-14s12 4 14 14"/>'),null],
 ['looks','LOOKS','Colours and trails for your ship','#c08aff',I('<path d="M32 8c13 0 24 9 24 21 0 8-6 11-12 11h-5c-3 0-5 3-3 6 2 4 0 9-5 9C18 55 8 44 8 31 8 18 19 8 32 8z"/><circle cx="21" cy="28" r="3" fill="currentColor"/><circle cx="31" cy="19" r="3" fill="currentColor"/><circle cx="43" cy="24" r="3" fill="currentColor"/>'),null],
 ['load','LOAD','Pick the perks you take into a run','#8c86b8',I('<rect x="10" y="12" width="44" height="40" rx="6"/><path d="M18 24h28M18 32h28M18 40h16"/>'),null],
 ['mkt','SHOP','Spend Neon on one-run boosts','#8c86b8',I('<path d="M10 14h6l6 28h28l6-20H20"/><circle cx="26" cy="50" r="4"/><circle cx="46" cy="50" r="4"/>'),()=>window.fmtN(GA.bank)+' Neon'],
 ['pick','PICK WEAPONS','Choose the two guns on your ship','#ff5fb8',I('<circle cx="32" cy="32" r="18"/><path d="M32 6v14M32 44v14M6 32h14M44 32h14"/><circle cx="32" cy="32" r="4" fill="currentColor"/>'),
   ()=>{try{return WP.eqIds().length+' on ship';}catch(e){return '';}}],
 ['forge','FORGE','Merge two weapons into a stronger hybrid','#3dffb0',I('<path d="M8 40h34c0-10 8-14 14-14V20H20c-6 0-12 6-12 12z" fill="currentColor" fill-opacity=".2"/><path d="M20 40v10M38 40v10M14 50h30"/><path d="M44 8l-6 8M52 12l-8 6"/>'),
   ()=>{try{return Object.keys(FG.st().hy).length+' of '+FGR.length+' forged';}catch(e){return '';}}]];
const M3={on:false,sel:'forge'};
const page=document.createElement('div');page.id='h3More';page.setAttribute('aria-label','More in the hangar');
$('gaCards').after(page);
const pane=$('h2Pane');
function moreDraw(){page.innerHTML='<h2>MORE IN HANGAR</h2>';
  for(const [k,n,p,c,svg,bd] of SEC){const b=document.createElement('button');b.type='button';b.className='mt'+(M3.sel===k?' on':'');b.id='h3M_'+k;b.style.setProperty('--c',c);
    let badge='';try{badge=bd?bd():'';}catch(e){}
    b.innerHTML=svg+'<b>'+n+'</b><span>'+p+'</span>'+'<em>'+badge+'</em>';   // an empty badge keeps every icon on the same line
    b.addEventListener('click',()=>{M3.on=false;garageEl.classList.remove('h3m');const o=$('mfI_'+k);if(o)o.click();else gaDraw();});
    for(const ev of['pointerenter','focus'])b.addEventListener(ev,()=>{if(M3.sel===k)return;M3.sel=k;for(const x of page.querySelectorAll('.mt'))x.classList.toggle('on',x===b);paneMore();});
    page.append(b);}
  paneMore();}
function paneMore(){if(!pane)return;const s=SEC.find(x=>x[0]===M3.sel)||SEC[0];pane.innerHTML='';pane.style.setProperty('--h2c',s[3]);
  const ic=document.createElement('div');ic.className='ic';ic.innerHTML=s[4];const h=document.createElement('h3');h.textContent=s[1];h.style.color=s[3];
  const ef=document.createElement('div');ef.className='ef';ef.textContent=s[2];
  const b=document.createElement('button');b.type='button';b.className='buy';b.id='h2Buy';b.textContent='OPEN '+s[1];b.addEventListener('click',()=>{const t=$('h3M_'+s[0]);if(t)t.click();});
  pane.append(ic,h,ef);let bd='';try{bd=s[5]?s[5]():'';}catch(e){}if(bd){const l=document.createElement('div');l.className='lvl';l.textContent=bd;pane.append(l);}pane.append(b);}
/* MORE opens the page, never the pop-up sheet (capture phase: menufix's own handler does not run) */
let bound=null;   // menufix puts its MORE button in the tab row on the first draw
function bindMore(){const m=$('mfMore');if(!m||m===bound)return;bound=m;m.setAttribute('aria-haspopup','false');
  m.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();M3.on=true;gaDraw();},true);}
for(const b of garageEl.querySelectorAll('.tabs button[data-t]'))b.addEventListener('click',()=>{M3.on=false;},true);

/* ----- FORGE: weapon emblems instead of a colour dot when the weapon has no picture; the bench panels move into the frame ----- */
if(typeof FG!=='undefined'&&FG.icon){const i0=FG.icon;FG.icon=function(c,it,S){const ty=it&&it.split(':')[0],id=it&&it.split(':')[1];
  if(ty==='w'&&typeof WPD!=='undefined'&&WPD[id]&&!(typeof ART==='object'&&ART.img('fg-'+it.replace(':','-')))){const d=WPD[id],m=S/2,wp=typeof ART==='object'&&ART.img('wpmount-'+id);
    c.clearRect(0,0,S,S);const g=c.createRadialGradient(m,m,S*.03,m,m,S*.47);g.addColorStop(0,d.c+'66');g.addColorStop(1,d.c+'00');c.fillStyle=g;c.fillRect(0,0,S,S);
    c.lineWidth=Math.max(2,S/26);c.strokeStyle=d.c;c.beginPath();c.arc(m,m,S*.42,0,7);c.stroke();
    if(wp){c.drawImage(wp,S*.16,S*.16,S*.68,S*.68);return;}
    const b='fx-w-'+id+'-bullet',im=typeof ART==='object'&&ART.img(b);
    if(im){const k=Math.min(S*.62/im.width,S*.62/im.height);c.drawImage(im,m-im.width*k/2,m-im.height*k/2,im.width*k,im.height*k);return;}
    if(typeof WPX!=='undefined'&&WPX.demoFn){const o=document.createElement('canvas');o.width=108;o.height=52;WPX.demoFn(id,o.getContext('2d'),.7,d.c);c.drawImage(o,S*.08,S*.3,S*.84,S*.4);return;}
    c.fillStyle=d.c;c.beginPath();c.moveTo(m,S*.2);c.lineTo(S*.78,S*.72);c.lineTo(S*.22,S*.72);c.closePath();c.fill();return;}
  return i0.apply(this,arguments);};}
const wide=()=>innerWidth>=1024&&innerHeight>=600;
function forgeFrame(){const box=$('gaCards');if(!box.classList.contains('f2')||!wide())return;
  /* sharper bench art: the slots' canvases are redrawn at the size they are shown */
  for(const [sel,it] of [['#fuSlotA',FGU.a&&'w:'+FGU.a],['#fuSlotB',FGU.b&&'w:'+FGU.b]]){const cv=box.querySelector(sel+' canvas');if(cv&&it){cv.width=cv.height=128;FG.icon(cv.getContext('2d'),it,128);}}
  {const R=FGU.a&&FGU.b&&FGU.a!==FGU.b?FG.rec(FGU.a,FGU.b):null,cv=box.querySelector('#fuOut canvas');if(cv&&R){cv.width=cv.height=160;FG.icon(cv.getContext('2d'),'h:'+R[2],160);}}
  for(const cv of box.querySelectorAll('.f2-card canvas')){const it=cv.closest('[data-it]');if(it){cv.width=cv.height=96;FG.icon(cv.getContext('2d'),it.dataset.it,96);}}
  const R=document.createElement('section');R.className='h3R';R.id='h3Forge';R.setAttribute('aria-label','Merge');
  const h=document.createElement('h3');h.textContent='MERGE';R.append(h);
  for(const s of ['.f2-st','#fuPrev','.f2-go','#fuSheet']){const e=box.querySelector(s);if(e)R.append(e);}
  const sc=R.querySelector('#fuSheet');if(sc)R.prepend(sc);   // an open recipe list or item info is the panel's view, above the merge button
  box.append(R);}

const g0=gaDraw;gaDraw=function(){if(garageEl.hidden)M3.on=false;const r=g0.apply(this,arguments);try{
  garageEl.classList.toggle('h3m',M3.on);const cd=$('gaCards');if(M3.on)cd.style.setProperty('display','none','important');else cd.style.removeProperty('display');
  if(M3.on){garageEl.classList.remove('f2','h2x','h2np');moreDraw();requestAnimationFrame(()=>{if(M3.on){garageEl.classList.remove('h2np');paneMore();}});}
  bindMore();const mb=$('mfMore');if(mb)mb.classList.toggle('h3on',M3.on||GA.tab==='forge'||['abil','crew','looks','load','mkt'].includes(GA.tab));
  if(!M3.on)forgeFrame();}catch(e){}return r;};
addEventListener('resize',()=>{if(!garageEl.hidden&&GA.tab==='forge')gaDraw();});
window.__h3={M3,moreDraw,open:()=>{M3.on=true;gaDraw();}};
})();
