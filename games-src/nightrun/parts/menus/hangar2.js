// PURPOSE: the hangar as a game screen: the player's ship large in a bay with stat bars and equipment slots, 4 big tabs, square upgrade tiles,
//          one accent colour per tab, and (PC) a right-hand panel for the selected item with ONE buy button
// FLAG: hangar2 (?hangar2=0 = the old card grid)
// TEST: qa/hangar2-test.js (no page errors, bay + pane + tiles, a pressed tile selects, the panel button = the old card click; .click() from code is unchanged); looks reviewed in HANGAR2-REVIEW.md
/* ---------- HANGAR2: owner, 22 Oct 2026: "hangar menu is like a web page, not a game; unreadable content on PC". The cards stay the source of
   truth (every id, data-kind and click handler is untouched): this layer only lays them out as tiles, hides the filter chips, puts a ship bay
   beside them and, on PC, turns the first click on a tile into "select" so the right panel shows it; the panel's button clicks the tile. ---------- */
(function(){
if(RET.hangar2===undefined)RET.hangar2=!/[?&]hangar2=0/.test(location.search);
if(!RET.hangar2||typeof garageEl==='undefined')return;
document.documentElement.classList.add('h2');
const ACC={ships:'#19e3ff',weapons:'#ff5fb8',tune:'#ffb020',pilot:'#3dffb0',crew:'#ffb020',abil:'#c08aff',looks:'#c08aff',load:'#8c86b8',mkt:'#8c86b8'};
const st=document.createElement('style');st.id='h2css';
st.textContent=`
html.h2 #garage{--h2c:#ffb020}
html.h2 #garage .tabs button[data-t=forge]{display:none!important}
html.h2 #garage .tabs button:not(.hubSec){font-size:clamp(14px,3.6vw,20px)!important;min-height:48px;letter-spacing:.06em!important}
html.h2 #garage .tabs #mfMore{flex:0 0 auto!important;padding:0 14px!important;font-size:14px!important;opacity:.85}
html.h2 #garage:not(.h2x) #gaCards .gfBar{display:none!important}
html.h2 #garage #hubLoad,html.h2 #garage #gaPic{display:none!important}
html.h2 #garage:not(.h2x) #gaCards .gfSec{color:var(--h2c)!important;border-color:var(--h2c)!important}
html.h2 #garage:not(.h2x) #gaCards .card{border:2px solid color-mix(in srgb,var(--h2c) 38%,#2a2050)!important;box-shadow:none!important;background:#120b28!important}
html.h2 #garage:not(.h2x) #gaCards .card.sel,html.h2 #garage:not(.h2x) #gaCards .card.h2on{border-color:var(--h2c)!important;background:color-mix(in srgb,var(--h2c) 14%,#120b28)!important;box-shadow:0 0 0 2px color-mix(in srgb,var(--h2c) 45%,transparent)!important}
html.h2 #garage:not(.h2x) #gaCards .card .t,html.h2 #garage:not(.h2x) #gaCards .card .n,html.h2 #garage:not(.h2x) #gaCards .card .lv,html.h2 #garage:not(.h2x) #gaCards .card .chips b{font-size:max(14px,1em)!important}
#h2Bay{display:flex;align-items:center;gap:12px;flex:0 0 auto;background:radial-gradient(ellipse at 50% 60%,color-mix(in srgb,var(--h2c) 18%,#120b28),#0a0619 70%);border:1.5px solid #3a2b5c;border-radius:12px;padding:8px 12px;font-family:var(--display);color:var(--ink)}
#h2Bay .shipW{flex:0 0 auto;width:112px;height:96px;display:flex;align-items:center;justify-content:center;position:relative}
#h2Bay .shipW::after{content:'';position:absolute;left:12%;right:12%;bottom:2px;height:12px;border-radius:50%;background:radial-gradient(color-mix(in srgb,var(--h2c) 55%,transparent),transparent 70%);animation:h2sh 3.2s ease-in-out infinite}
#h2Bay .shipW img{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 0 14px color-mix(in srgb,var(--h2c) 50%,transparent));animation:h2hv 3.2s ease-in-out infinite}
@keyframes h2hv{50%{transform:translateY(-6px)}}@keyframes h2sh{50%{transform:scaleX(.82);opacity:.6}}
#h2Bay .bi{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:6px}
#h2Bay .sn{font-weight:700;font-size:18px;letter-spacing:.08em}
#h2Bay .stats{display:grid;grid-template-columns:auto 1fr;gap:3px 8px;align-items:center;font-size:14px;color:#cfc9f2}
#h2Bay .stats i{display:block;height:8px;border-radius:4px;background:#ffffff18;overflow:hidden}#h2Bay .stats i b{display:block;height:100%;border-radius:4px}
#h2Bay .slots{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}
#h2Bay .slot{flex:0 0 auto;min-height:48px;min-width:96px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:1px;padding:4px 10px;background:#140d2e;border:1.5px solid #3a2b5c;border-radius:10px;color:var(--ink);font:600 14px var(--display);text-align:left;cursor:pointer}
#h2Bay .slot small{font-size:14px;letter-spacing:.1em;color:var(--dim);font-weight:700}
#h2Bay .slot:hover,#h2Bay .slot.on{border-color:var(--h2c)}
#h2Pane{display:none}
html.h2 #garage:not(.h2x) #gaCards .card,html.h2 #garage:not(.h2x) #gaCards .card *,html.h2 #garage:not(.h2x) #gaCards .clsN,html.h2 #garage:not(.h2x) #gaCards .clsC{opacity:1!important;filter:none!important}
html.h2 #garage:not(.h2x) #gaCards .card{position:relative}
html.h2 #garage .msg{font-size:15px!important}html.h2 #garage:not(.h2x) #gaCards .gfSec{font-size:max(14px,1em)!important}html.h2 #garage:not(.h2x) #gaCards .gfRec .rt{font-size:14px!important}
html.h2 #garage:not(.h2x) #gaCards .card>canvas[data-w]{aspect-ratio:1;object-fit:contain}
html.h2 #garage:not(.h2x) #gaCards .card .t2{display:none!important}
html.h2 #garage:not(.h2x) #gaCards .card.h2lk .n small{display:none!important}
html.h2 #garage #gaCards .card>.h2lock{position:absolute!important;top:8px!important;right:8px!important;left:auto!important;width:30px!important;height:30px!important;border-radius:9px!important;background:#1a1236!important;border:1.5px solid #ffb020!important;color:#ffb020!important;display:flex!important;align-items:center;justify-content:center;pointer-events:none;padding:0!important;margin:0!important}
html.h2 #garage #gaCards .card>.h2lock svg{width:18px!important;height:18px!important;padding:0!important;background:none!important;position:static!important}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsL{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsC{display:flex!important;flex-direction:column;align-items:center;justify-content:flex-start;gap:8px;text-align:center;min-height:150px;padding:14px 10px!important;border-radius:14px!important;background:#120b28!important;border:2px solid color-mix(in srgb,var(--c) 40%,#2a2050)!important}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsC.on{border-color:var(--c)!important;background:color-mix(in srgb,var(--c) 14%,#120b28)!important;box-shadow:0 0 0 2px color-mix(in srgb,var(--c) 45%,transparent)!important}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsC svg{width:64px!important;height:64px!important;padding:10px;border-radius:50%;background:radial-gradient(color-mix(in srgb,var(--c) 30%,transparent),transparent 72%)}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsC .n{font-size:18px!important;font-weight:700;color:var(--c)}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsC .p{font-size:15px!important;color:#e4e0ff;line-height:1.3}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsC .sb{display:none!important}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsH{font-size:16px!important}html.h2 #garage:not(.h2x) #gaCards.clsbox .clsH b{font-size:16px!important}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsT{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsN{display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:104px;padding:10px!important;border-radius:14px!important;background:#120b28!important;border:2px solid color-mix(in srgb,var(--c) 40%,#2a2050)!important;color:var(--ink)!important;text-align:center;position:relative}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsN svg{width:30px!important;height:30px!important}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsN span{font-size:16px!important;font-weight:700;color:var(--ink)!important}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsN small{font-size:15px!important;color:var(--amber)!important}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsN.on,html.h2 #garage:not(.h2x) #gaCards.clsbox .clsN.sel{border-color:var(--c)!important}
html.h2 #garage:not(.h2x) #gaCards.clsbox .clsI,html.h2 #garage:not(.h2x) #gaCards.clsbox .clsD p{font-size:16px!important;line-height:1.4}
html.h2 #garage.h2x #h2Bay,html.h2 #garage.h2x #h2Pane{display:none!important}
@media (max-width:1023px),(max-height:599px){
 #h2Bay .stats{display:none}
 html.h2 #garage #gaCards .card>.h2lock{left:8px!important;right:auto!important}
 html.h2 #garage:not(.h2x) #gaCards .card>canvas[data-w]{width:72px!important;height:72px!important;justify-self:center}
 html.h2 #garage .tabs button:not(.hubSec){font-size:14px!important;letter-spacing:0!important;padding:0 6px!important}
 html.h2 #garage .tabs #mfMore{padding:0 8px!important}
 #h2Bay{padding:6px 10px;gap:10px}#h2Bay .shipW{width:96px;height:76px}#h2Bay .bi{gap:4px}#h2Bay .sn{font-size:16px}
 html.h2 #garage:not(.h2x) #gaCards .card .t,html.h2 #garage:not(.h2x) #gaCards .card .n small{font-size:14px!important}
}
@media (min-width:1024px) and (min-height:600px){
 html.h2 #garage.pg:not(.h2x){display:grid!important;grid-template-columns:minmax(340px,30%) minmax(0,1fr) minmax(300px,25%);grid-template-rows:auto auto minmax(0,1fr) auto;
   grid-template-areas:"top top top" "tabs tabs tabs" "bay cards pane" "bay msg pane";gap:14px 18px!important;padding:18px 28px!important}
 html.h2 #garage .top{grid-area:top}html.h2 #garage .tabs{grid-area:tabs}html.h2 #garage #gaMsg{grid-area:msg}
 html.h2 #garage:not(.h2x) #gaCards{grid-area:cards;overflow-y:auto!important;min-height:0}
 html.h2 #garage .tabs button:not(.hubSec){min-height:60px;font-size:20px!important}
 html.h2 #garage .tabs #mfMore{font-size:16px!important}
 html.h2 #garage:not(.h2x) #gaCards .gfRec{display:none!important}
 html.h2 #garage:not(.h2x) #gaCards.gfg,html.h2 #garage:not(.h2x) #gaCards.wpt{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(168px,1fr))!important;grid-auto-rows:auto;align-content:start;gap:12px!important;padding:2px 4px 12px!important}
 html.h2 #garage:not(.h2x) #gaCards .gfSec{grid-column:1/-1;font-size:15px!important}
 html.h2 #garage:not(.h2x) #gaCards .card{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;text-align:center!important;gap:6px!important;padding:14px 10px 12px!important;min-height:180px;aspect-ratio:auto;border-radius:14px!important;height:auto!important}
 html.h2 #garage:not(.h2x) #gaCards .card>svg,html.h2 #garage:not(.h2x) #gaCards .card>img,html.h2 #garage:not(.h2x) #gaCards .card>canvas,html.h2 #garage:not(.h2x) #gaCards .card>.sw{align-self:center!important;width:72px!important;height:72px!important;object-fit:contain;flex:0 0 auto;max-width:none!important;color:var(--h2c)}
 html.h2 #garage:not(.h2x) #gaCards .card>img.shp{width:96px!important;height:72px!important}
 html.h2 #garage:not(.h2x) #gaCards .card .tx{align-items:center;width:100%;flex:1 1 auto!important}
 html.h2 #garage:not(.h2x) #gaCards .card .n{font-size:17px!important;display:flex;flex-wrap:wrap;justify-content:center;align-items:baseline;gap:2px 6px;line-height:1.15}
 html.h2 #garage:not(.h2x) #gaCards .card .n .pc{display:none}
 html.h2 #garage:not(.h2x) #gaCards .card .n small,html.h2 #garage:not(.h2x) #gaCards .card .lv{font-size:15px!important;color:var(--dim)}
 html.h2 #garage:not(.h2x) #gaCards .card .t,html.h2 #garage:not(.h2x) #gaCards .card .t2,html.h2 #garage:not(.h2x) #gaCards .card .rh,html.h2 #garage:not(.h2x) #gaCards .card .chips,html.h2 #garage:not(.h2x) #gaCards .card .pv{display:none!important}
 html.h2 #garage:not(.h2x) #gaCards .card .pp,html.h2 #garage:not(.h2x) #gaCards .card .pb{width:86%;max-width:none;margin:2px auto 0}
 html.h2 #garage:not(.h2x) #gaCards .card .pr{all:unset;font:700 15px var(--display);color:var(--amber);display:flex;align-items:center;justify-content:center;gap:4px;margin-top:auto;white-space:nowrap}
 html.h2 #garage:not(.h2x) #gaCards .card .pr br{display:none}
 html.h2 #garage:not(.h2x) #gaCards .card .pr *{border:0!important;background:none!important;padding:0!important;font-size:inherit!important;color:inherit}
 html.h2 #garage:not(.h2x) #gaCards .card .n .nm{white-space:normal!important;overflow:visible!important;text-overflow:clip!important}
 html.h2 #garage:not(.h2x) #gaCards .card .tx{display:flex!important;flex-direction:column}
 html.h2 #garage:not(.h2x) #gaCards .card.no .pr{color:var(--dim)}
 #h2Bay{grid-area:bay;flex-direction:column;align-items:stretch;justify-content:flex-start;gap:14px;padding:18px;min-height:0;overflow:hidden}
 #h2Bay .shipW{width:100%;height:auto;flex:1 1 220px;min-height:150px;max-height:300px}
 #h2Bay .shipW img{width:78%;height:auto;border-radius:14px}
 #h2Bay .sn{font-size:24px;text-align:center}
 #h2Bay .stats{font-size:15px;gap:7px 12px}#h2Bay .stats i{height:10px}
 #h2Bay .slots{display:grid;grid-template-columns:1fr 1fr;gap:8px;overflow:visible}
 #h2Bay .slot{min-width:0;min-height:58px;font-size:16px}#h2Bay .slot small{font-size:15px}
 #h2Pane{grid-area:pane;display:flex;flex-direction:column;align-items:center;gap:12px;padding:22px 18px;min-height:0;overflow:auto;background:#0d0820;border:1.5px solid color-mix(in srgb,var(--h2c) 55%,#3a2b5c);border-radius:14px;font-family:var(--display);color:var(--ink);text-align:center}
 #h2Pane .ic{width:132px;height:132px;display:flex;align-items:center;justify-content:center;border-radius:18px;background:radial-gradient(color-mix(in srgb,var(--h2c) 22%,transparent),transparent 70%)}
 #h2Pane .ic>*{max-width:100%;max-height:100%;width:112px;height:112px;object-fit:contain;color:var(--h2c)}
 #h2Pane h3{margin:0;font-size:26px;line-height:1.1;letter-spacing:.04em}
 #h2Pane .lvl{font-size:16px;color:var(--dim)}
 #h2Pane .ef{font-size:18px;line-height:1.35;color:#e4e0ff;max-width:32ch}
 #h2Pane .pp,#h2Pane .pb{display:flex;gap:3px;width:90%}#h2Pane .pp i,#h2Pane .pb i{flex:1 1 0;height:10px;border-radius:5px;background:#ffffff22}
 #h2Pane .pp i:not(.nx):not([class=""]),#h2Pane .pb i.on{background:var(--h2c)}#h2Pane .pp i.on{background:var(--h2c)}
 #h2Pane .buy{margin-top:auto;width:100%;min-height:64px;font:700 22px var(--display)!important;letter-spacing:.08em;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:12px!important;cursor:pointer;
   background:linear-gradient(180deg,#ff5fb8,#c42a80)!important;border:1.5px solid #ffd0ea!important;color:#fff!important}
 #h2Pane .buy[disabled]{background:#1a1236!important;border-color:#3a2b5c!important;color:var(--dim)!important;cursor:default;font-size:18px!important}
 #h2Pane .buy.eq{background:color-mix(in srgb,var(--h2c) 18%,#120b28)!important;border-color:var(--h2c)!important;color:var(--h2c)!important}
 #h2Pane .hint{font-size:15px;color:var(--dim)}
 #h2Pane .ic>svg{padding:14px}
 #h2Pane .ps{display:grid;grid-template-columns:auto 1fr auto;gap:8px 10px;align-items:center;width:92%;font-size:16px;text-align:left}
 #h2Pane .ps i{display:block;height:10px;border-radius:5px;background:#ffffff18;overflow:hidden}#h2Pane .ps i b{display:block;height:100%;border-radius:5px;background:var(--h2c)}
 #h2Pane .ps em{font-style:normal;color:var(--dim);font-size:15px}
 #h2Pane p{margin:0;font-size:17px;line-height:1.35;color:#e4e0ff;max-width:32ch}#h2Pane p b{color:var(--h2c)}
 html.h2 #garage:not(.h2x) #gaCards.clsbox .clsD{display:none!important}
 html.h2 #garage.h2np:not(.h2x) #h2Pane{display:none!important}html.h2 #garage.h2np:not(.h2x) #gaCards{grid-column:2/4!important}
 html.h2 #garage:not(.h2x) #gaCards.clsbox{display:flex!important;flex-direction:column;gap:14px}
}`;
document.head.appendChild(st);

/* ----- the ship bay: ship art with a slow hover, stat bars, equipment slots (each opens its tab) ----- */
const bay=document.createElement('div');bay.id='h2Bay';
bay.innerHTML='<div class="shipW"><img id="h2Ship" alt="" decoding="async"></div><div class="bi"><div class="sn" id="h2Sn"></div><div class="stats" id="h2St"></div><div class="slots" id="h2Sl"></div></div>';
const pane=document.createElement('div');pane.id='h2Pane';pane.setAttribute('aria-live','polite');
const cards=$('gaCards');cards.before(bay);cards.after(pane);
const tabBtn=t=>garageEl.querySelector('.tabs button[data-t="'+t+'"]');
const lv=id=>{try{const d=TP_DEF.find(x=>x.id===id);return d?TP.raw(id)/d.max:0;}catch(e){return 0;}};
function bayDraw(){const sh=shipDef();$('h2Ship').src='media/ship-'+sh.id+'.webp';$('h2Sn').textContent=sh.n.toUpperCase();
  /* the starter ship with no upgrades reads about a third full; every upgrade level fills the rest (ships differ in their shot, not in these four stats) */
  const S=[['Hull',(lv('hul')*2+lv('shd'))/3,'#3dffb0'],['Damage',(lv('dmg')*2+lv('crt'))/3,'#ff5a3d'],['Fire rate',lv('rof'),'#ffe14d'],['Dash',lv('dsh'),'#19e3ff']];
  $('h2St').innerHTML=S.map(([n,v,c])=>`<span>${n}</span><i><b style="width:${Math.round(34+66*Math.min(1,v))}%;background:${c}"></b></i>`).join('');
  let w=[];try{w=typeof WP!=='undefined'&&WP.eqIds?WP.eqIds().map(i=>WPD[i]?WPD[i].n:i):[];}catch(e){}
  let bought=0;try{for(const d of TP_DEF)bought+=TP.raw(d.id);}catch(e){}
  const c=typeof CLS!=='undefined'&&CLS.on&&CLS.cur?CLS.cur():null;
  const SL=[['weapons','WEAPON A',w[0]||'empty'],['weapons','WEAPON B',w[1]||'empty'],['ships','SHIP',sh.n],['tune','UPGRADES',bought+' levels'],['pilot','PILOT',c?c.n:'none'],['crew','KITS','crew + abilities']];
  const sl=$('h2Sl');sl.innerHTML='';
  for(const [t,k,v] of SL){const b=document.createElement('button');b.type='button';b.className='slot'+(GA.tab===t?' on':'');b.innerHTML='<small>'+k+'</small>'+v;
    b.addEventListener('click',()=>{const o=tabBtn(t);if(o)o.click();});sl.append(b);}}

/* ----- tiles: a weapon without painted art gets an emblem (its colour + its projectile art), never the debug placeholder; locked = full contrast + a lock badge ----- */
const LOCK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0110 0v3h1.5c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5h-13c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5zm2.5 0h5V7a2.5 2.5 0 00-5 0z" fill="currentColor"/></svg>';
function wpIcon(cv,id){const d=typeof WPD!=='undefined'&&WPD[id];if(!d)return;cv.width=cv.height=128;const c=cv.getContext('2d'),n='wp-'+id,b='fx-w-'+id+'-bullet';
  if(ART.have(n)&&ART.isReal(n)){c.drawImage(ART.bm[n],0,0,128,128);return;}
  const g=c.createRadialGradient(64,64,4,64,64,60);g.addColorStop(0,d.c+'66');g.addColorStop(1,d.c+'00');c.fillStyle=g;c.fillRect(0,0,128,128);
  c.lineWidth=5;c.strokeStyle=d.c;c.beginPath();c.arc(64,64,54,0,7);c.stroke();
  if(ART.have(b)&&ART.isReal(b)){const im=ART.bm[b],k=Math.min(84/im.width,84/im.height);c.drawImage(im,64-im.width*k/2,64-im.height*k/2,im.width*k,im.height*k);}
  else if(WPX.demoFn){const o=document.createElement('canvas');o.width=108;o.height=52;WPX.demoFn(id,o.getContext('2d'),.7,d.c);c.drawImage(o,10,38);}}
function tileFix(){for(const k of cards.querySelectorAll('.card')){
  const cv=k.querySelector(':scope>canvas[data-w]');if(cv&&cv.width!==128)try{wpIcon(cv,cv.dataset.w);}catch(e){}
  const sm=k.querySelector('.n small'),lk=!!sm&&/^\s*LOCKED\s*$/i.test(sm.textContent);k.classList.toggle('h2lk',lk);
  const bd=k.querySelector(':scope>.h2lock');if(lk&&!bd)k.insertAdjacentHTML('beforeend','<span class="h2lock" title="Locked">'+LOCK+'</span>');else if(!lk&&bd)bd.remove();}}

/* ----- PC: the selected item panel. A real click on a tile selects it; the panel button (or a 2nd click) is the old card click ----- */
const wide=()=>innerWidth>=1024&&innerHeight>=600;
let selKey=null;
const keyOf=c=>c.dataset.kind+':'+c.dataset.id;
const vis=()=>[...cards.querySelectorAll('.card')].filter(c=>c.offsetParent!==null);   // the hidden 'recommended next' strip holds a card too
const findSel=()=>selKey&&vis().find(c=>keyOf(c)===selKey);
function pilotPane(){const c=cards.querySelector('.clsC.on')||cards.querySelector('.clsC');if(!c){pane.innerHTML='<div class="hint">Pick a pilot class</div>';return;}
  const ic=document.createElement('div');ic.className='ic';const sv=c.querySelector('svg');if(sv)ic.append(sv.cloneNode(true));
  const h=document.createElement('h3');h.textContent=(c.querySelector('.n')||{}).textContent||'';pane.style.setProperty('--h2c',c.style.getPropertyValue('--c'));h.style.color='var(--h2c)';
  const ef=document.createElement('div');ef.className='ef';ef.textContent=(c.querySelector('.p')||{}).textContent||'';
  const ps=document.createElement('div');ps.className='ps';const W=['Power','Speed','Guard'];
  [...c.querySelectorAll('.sb s')].forEach((x,i)=>{const w=parseFloat(x.style.width)||0;ps.insertAdjacentHTML('beforeend',`<span>${W[i]||''}</span><i><b style="width:${w}%"></b></i><em>${w>=80?'high':w>=60?'medium':'low'}</em>`);});
  pane.append(ic,h,ef,ps);for(const q of cards.querySelectorAll('.clsD p'))pane.append(q.cloneNode(true));
  const pk=$('clsPick'),b=document.createElement('button');b.type='button';b.className='buy';b.id='h2Buy';
  if(pk){b.textContent=pk.textContent;b.disabled=pk.disabled;if(pk.disabled)b.classList.add('eq');b.addEventListener('click',()=>{const k=$('clsPick');if(k)k.click();});}else{b.textContent='YOUR PILOT';b.classList.add('eq');}
  pane.append(b);}
function paneDraw(){pane.innerHTML='';pane.style.removeProperty('--h2c');
  garageEl.classList.toggle('h2np',!cards.classList.contains('clsbox')&&!vis().length);   // a tab without tiles (perk loadout, market) uses the panel's width instead of an empty panel
  if(cards.classList.contains('clsbox')){pilotPane();return;}
  let c=findSel();
  if(!c){const v=vis().map(x=>[x,x.getBoundingClientRect()]).sort((a,b)=>a[1].top-b[1].top||a[1].left-b[1].left).map(x=>x[0]);   // first on screen (sections are re-ordered by CSS)
    c=v.find(x=>x.classList.contains('sel'))||v.find(x=>!x.classList.contains('no'))||v[0];if(!c){pane.innerHTML='<div class="hint">Nothing here yet</div>';return;}selKey=keyOf(c);}
  for(const x of cards.querySelectorAll('.card.h2on'))x.classList.remove('h2on');c.classList.add('h2on');
  const ic=document.createElement('div');ic.className='ic';const src=c.querySelector(':scope>svg,:scope>img,:scope>canvas,:scope>.sw');
  if(src){let k;if(src.tagName==='CANVAS'){k=document.createElement('canvas');k.width=src.width;k.height=src.height;try{k.getContext('2d').drawImage(src,0,0);}catch(e){}}else k=src.cloneNode(true);ic.append(k);}
  const nEl=c.querySelector('.n'),nm=nEl?(nEl.querySelector('.nm')||nEl).cloneNode(true):null;if(nm)for(const x of nm.querySelectorAll('.pc,.lv,small'))x.remove();
  const lvT=(c.querySelector('.n .lv')||c.querySelector('.n small')||{}).textContent||'';
  const h=document.createElement('h3');h.textContent=nm?nm.textContent.trim():'';
  const l=document.createElement('div');l.className='lvl';l.textContent=lvT?(/^lv/i.test(lvT)?lvT:'Level '+lvT):'';
  const ef=document.createElement('div');ef.className='ef';ef.textContent=(c.querySelector('.t')||{}).textContent||'';
  const pips=c.querySelector('.pp,.pb');
  const prT=((c.querySelector('.pr')||{}).textContent||'').replace(/\s+/g,' ').trim(),price=+((prT.match(/(\d[\d,]*)\s*$/)||[])[1]||'').replace(/,/g,'')||0;
  const b=document.createElement('button');b.type='button';b.className='buy';b.id='h2Buy';
  const need=price&&price>GA.bank&&/\d\s*$/.test(prT);
  if(need){b.disabled=true;b.innerHTML='Need '+window.fmtN(price-GA.bank)+' '+neonI;}
  else if(price){const v=prT.replace(/\s*\d[\d,]*\s*$/,'').trim();b.innerHTML=(/[a-z]/i.test(v)?v:'BUY')+' '+neonI+' '+window.fmtN(price);}
  else{b.textContent=prT||'SELECT';if(/EQUIPPED|IN POOL|ON SHIP|OWNED|MAX/i.test(prT))b.classList.add('eq');}
  b.addEventListener('click',()=>{const cc=findSel();if(cc)cc.click();});
  pane.append(ic,h);if(l.textContent)pane.append(l);if(ef.textContent)pane.append(ef);if(pips)pane.append(pips.cloneNode(true));pane.append(b);const ht=document.createElement('div');ht.className='hint';ht.textContent='Click a tile to see it here';pane.append(ht);}
/* every tap reaches a button as a synthetic click from the pointerup handler (qa-hooks/g.js), so 'the player pressed a tile' = a pointerdown on it just before */
let pd=-1e9;addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('#gaCards .card'))pd=performance.now();},true);
cards.addEventListener('click',e=>{if(performance.now()-pd>1500||!wide())return;pd=-1e9;const c=e.target.closest&&e.target.closest('.card');if(!c||!cards.contains(c))return;
  if(keyOf(c)===selKey&&c.classList.contains('h2on'))return;   // second click on the shown tile = the old action
  e.stopImmediatePropagation();e.preventDefault();auto=false;selKey=keyOf(c);paneDraw();},true);
let lastTab=null,auto=true;   // auto: no tile picked by the player on this tab yet, so the panel follows the first tile on screen once the sections settle
{const g0=gaDraw;gaDraw=function(){const r=g0.apply(this,arguments);try{
  if(GA.tab!==lastTab){selKey=null;lastTab=GA.tab;auto=true;}
  garageEl.classList.toggle('h2x',GA.tab==='forge'||garageEl.classList.contains('f2')||cards.classList.contains('fu'));   // the forge screens keep their own layout
  garageEl.style.setProperty('--h2c',ACC[GA.tab]||'#ffb020');tileFix();bayDraw();paneDraw();if(auto)requestAnimationFrame(()=>{if(!auto)return;selKey=null;paneDraw();});}catch(e){}return r;};}
/* FORGE leaves the tab row (4 big tabs + MORE): it opens from the MORE sheet */
{const box=document.querySelector('#mfSheet .mfBox'),x=$('mfClose'),f=tabBtn('forge');
 if(box&&x&&f){const b=document.createElement('button');b.type='button';b.className='go dim';b.id='mfI_forge';b.textContent='FORGE';
   b.addEventListener('click',()=>{if(window.__menufix)window.__menufix.mfShut();f.click();});box.insertBefore(b,x);}}
window.__h2={bayDraw,paneDraw,tileFix,sel:()=>selKey};
})();
