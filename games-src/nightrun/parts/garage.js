/* ---------- garage: permanent unlocks bought with banked Neon (saved in localStorage) ----------
   Unlocks add options, not raw power: ships with their own rhythm, extra upgrades for the pit-stop pool, colour themes. */
const SHIPS=[
  {id:'std',n:'Courier',t:'Steady stream on the beat',ic:'M2 12l19-7-3 7 3 7z'},
  {id:'tri',n:'Triplet',t:'Fires in beat triplets',p:80,ic:'M5 9.6a2.4 2.4 0 110 4.8 2.4 2.4 0 010-4.8zM12 9.6a2.4 2.4 0 110 4.8 2.4 2.4 0 010-4.8zM19 9.6a2.4 2.4 0 110 4.8 2.4 2.4 0 010-4.8z'},
  {id:'hv',n:'Half-time Heavy',t:'Piercing blast every 2 beats',p:110,ic:'M14 4a8 8 0 110 16 8 8 0 010-16zM1 11h6v2H1z'},
  {id:'ec',n:'Echo',t:'Every shot repeats one beat later',p:140,ic:'M2 6l7 6-7 6zM11 8l5 4-5 4zM18 10l4 2-4 2z'}];
const THEMES=[
  {id:'neon',n:'Neon',t:'The original night',f:''},
  {id:'dusk',n:'Dusk',t:'Amber and violet glow',p:60,f:'hue-rotate(95deg) saturate(1.1)'},
  {id:'lagoon',n:'Lagoon',t:'Teal and orange glow',p:60,f:'hue-rotate(205deg) saturate(1.15)'},
  {id:'ghost',n:'Ghost',t:'Cold, washed-out glow',p:60,f:'hue-rotate(20deg) saturate(.35) brightness(1.05)'}];
const CREW=[
  {id:'up_db',n:'Dash Blast',t:'Dashing hurts enemies you pass',p:70,ic:'M12 1l2.5 7.5L22 12l-7.5 2.5L12 23l-2.5-8.5L2 12l7.5-3.5z'},
  {id:'up_sb',n:'Sharp Beat',t:'Gold pulse shots hit 50% harder',p:90,ic:'M12 1l9 11-9 11L3 12z'},
  {id:'up_nx',n:'Neon Boost',t:'Kills drop 50% more Neon',p:110,ic:'M12 2l8.5 5v10L12 22l-8.5-5V7z'}];
const GA={bank:0,own:{},ship:'std',theme:'neon',runs:0,tab:'ships',from:'title'};
(()=>{const b=+load('mnr_bank',0),o=load('mnr_own',{}),s=load('mnr_ship','std'),t=load('mnr_theme','neon'),r=+load('mnr_runs',0);
  GA.bank=b>0&&isFinite(b)?Math.floor(b):0;GA.runs=r>0&&isFinite(r)?Math.floor(r):0;
  if(o&&typeof o==='object'&&!Array.isArray(o))for(const k in o)if(o[k]===true)GA.own[k]=true;
  if(SHIPS.some(x=>x.id===s)&&(s==='std'||GA.own['ship_'+s]))GA.ship=s;
  if(THEMES.some(x=>x.id===t)&&(t==='neon'||GA.own['th_'+t]))GA.theme=t;})();
const gsave=()=>{save('mnr_bank',GA.bank);save('mnr_own',GA.own);save('mnr_ship',GA.ship);save('mnr_theme',GA.theme);save('mnr_runs',GA.runs);};
const shipDef=()=>SHIPS.find(s=>s.id===GA.ship)||SHIPS[0];
function applyTheme(){const th=THEMES.find(x=>x.id===GA.theme)||THEMES[0];cv.style.filter=th.f||'';}
applyTheme();

const NEON_D='M12 1l9 11-9 11L3 12z';
const svgI=(d,c)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="${c||'currentColor'}" fill-rule="evenodd"/></svg>`;
const neonI='<svg class="nI" viewBox="0 0 24 24" aria-hidden="true"><path d="'+NEON_D+'" fill="currentColor"/></svg>';

/* ----- styles shared by the pit stop and the garage (injected, so head.html stays untouched) ----- */
{const st=document.createElement('style');st.textContent=`
.pg{--u:min(1cqh,1cqw);display:flex!important;flex-direction:column;align-items:stretch!important;gap:calc(var(--u)*1.6);padding:calc(var(--u)*2.4) calc(var(--u)*3)!important;container-type:size;overflow:hidden!important;font-family:var(--display)}
.pg[hidden]{display:none!important}
.pg .top{display:flex;align-items:center;gap:calc(var(--u)*2.4);min-height:44px;flex:0 0 auto}
.pg .ttl{font-weight:700;letter-spacing:.14em;color:var(--cyan);font-size:clamp(13px,calc(var(--u)*4.4),24px);white-space:nowrap}
.pg .neon{display:inline-flex;align-items:center;gap:4px;font-family:var(--mono);color:var(--cyan);font-size:clamp(14px,calc(var(--u)*4.6),26px);font-variant-numeric:tabular-nums;white-space:nowrap}
.nI{width:.9em;height:.9em;display:inline-block;vertical-align:-.1em}
.pg .cards{display:flex;gap:calc(var(--u)*2);flex:1 1 0;min-height:0}
.pg .card{flex:1 1 0;min-width:0;min-height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--u)*1);padding:calc(var(--u)*1.2);
  text-align:center;color:var(--ink);background:#140c26;border:2px solid var(--c,#3a2b5c);border-radius:12px;font-family:var(--display);cursor:pointer;
  box-shadow:0 0 calc(4px + 14px*var(--pul,0)) var(--c,transparent);touch-action:manipulation;position:relative}
.pg .card svg{height:clamp(22px,calc(var(--u)*9),56px);width:auto;aspect-ratio:1;color:var(--c,#fff);flex:0 0 auto}
.pg .card .tx{display:flex;flex-direction:column;gap:2px;min-width:0}
.pg .card .n{font-weight:700;font-size:clamp(13px,calc(var(--u)*4.4),22px);line-height:1.05}
.pg .card .t{font-size:clamp(11px,calc(var(--u)*3.3),17px);line-height:1.15;color:#cfc9f2}
.pg .card .pr{font-family:var(--mono);font-weight:700;font-size:clamp(13px,calc(var(--u)*4.2),22px);color:var(--amber);white-space:nowrap}
.pg .card .pr .nI{height:.9em;width:.9em;color:inherit;aspect-ratio:auto}
.pg .card.no{opacity:.55}.pg .card.sold{opacity:.4;border-style:dashed;cursor:default}.pg .card.sel{background:#22123f}
.pg .card.shake{animation:pgsh .3s}
@keyframes pgsh{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.pg .bar{flex:1 1 30px;height:6px;background:#ffffff18;border-radius:3px;overflow:hidden;min-width:24px}
.pg .bar i{display:block;height:100%;background:var(--pink);width:100%}
.pg .own{display:flex;gap:calc(var(--u)*2);align-items:center;min-height:22px;flex:0 0 auto;flex-wrap:wrap;font-family:var(--mono);color:var(--dim);font-size:clamp(11px,calc(var(--u)*3),15px)}
.pg .own span{display:inline-flex;align-items:center;gap:2px;color:var(--c)}.pg .own svg{height:clamp(16px,calc(var(--u)*5),24px);width:auto;aspect-ratio:1}
.pg .bot{display:flex;gap:calc(var(--u)*2.4);flex:0 0 auto;align-items:center}
.pg .bot button{flex:1 1 0;min-width:0;white-space:nowrap;padding:.4em .6em}
.pg .msg{font-family:var(--mono);color:var(--amber);font-size:clamp(11px,calc(var(--u)*3.2),15px);text-align:center;min-height:1.2em;flex:0 0 auto}
.pg .tabs{display:flex;gap:calc(var(--u)*1.6);flex:0 0 auto}
.pg .tabs button{flex:1 1 0;min-width:0;padding:.35em .3em;letter-spacing:.06em}
.pg .tabs button.on{background:var(--cyan);color:var(--void)}
.pg .sw{height:clamp(22px,calc(var(--u)*9),56px);aspect-ratio:1;border-radius:50%;background:linear-gradient(135deg,#ff2d95,#19e3ff);flex:0 0 auto}
.pg .sp{flex:1 1 0}
@container (max-aspect-ratio:1/1){
 .pg .cards{flex-direction:column}
 .pg .card{flex-direction:row;text-align:left;gap:calc(var(--u)*3);padding:calc(var(--u)*2) calc(var(--u)*3)}
 .pg .card .tx{flex:1 1 0}
 .pg .card .pr{margin-left:auto}
 .pg .card svg,.pg .card .sw{height:clamp(30px,calc(var(--u)*11),56px)}
}
`;document.head.appendChild(st);}

/* ----- the garage screen ----- */
const garageEl=document.createElement('div');garageEl.id='garage';garageEl.className='ov solid pg';garageEl.hidden=true;
garageEl.innerHTML='<div class="top"><span class="ttl">GARAGE</span><span class="neon" id="gaBank"></span><span class="sp"></span><button class="go alt" id="gaBack" type="button" style="padding:.3em 1.1em">BACK</button></div>'
  +'<div class="tabs"><button class="go dim" data-t="ships" type="button">SHIPS</button><button class="go dim" data-t="crew" type="button">CREW</button><button class="go dim" data-t="looks" type="button">LOOKS</button></div>'
  +'<div class="cards" id="gaCards"></div><div class="msg" id="gaMsg"></div>';
stage.appendChild(garageEl);
const gaMsg=t=>{$('gaMsg').textContent=t;clearTimeout(gaMsg.h);gaMsg.h=setTimeout(()=>{$('gaMsg').textContent='';},1800);};
function gaItems(){return GA.tab==='ships'?SHIPS.map(s=>({k:s.id==='std'?null:'ship_'+s.id,id:s.id,n:s.n,t:s.t,p:s.p||0,ic:s.ic,eq:GA.ship===s.id,kind:'ship'}))
  :GA.tab==='crew'?CREW.map(c=>({k:c.id,id:c.id,n:c.n,t:c.t,p:c.p,ic:c.ic,kind:'crew'}))
  :THEMES.map(h=>({k:h.id==='neon'?null:'th_'+h.id,id:h.id,n:h.n,t:h.t,p:h.p||0,f:h.f,eq:GA.theme===h.id,kind:'theme'}));}
function gaDraw(){const bank=$('gaBank');bank.innerHTML=neonI+' <b id="gaBankN">'+GA.bank+'</b>';
  for(const b of garageEl.querySelectorAll('.tabs button'))b.classList.toggle('on',b.dataset.t===GA.tab);
  const box=$('gaCards');box.innerHTML='';
  for(const it of gaItems()){const own=!it.k||GA.own[it.k],b=document.createElement('button');b.type='button';
    b.className='card'+(it.eq?' sel':'')+(!own&&GA.bank<it.p?' no':'');b.style.setProperty('--c',it.eq?'#19e3ff':own?'#8c86b8':'#ffb020');b.dataset.id=it.id;b.dataset.kind=it.kind;
    const ic=it.kind==='theme'?`<div class="sw" style="filter:${it.f||'none'}"></div>`:svgI(it.ic);
    const pr=own?(it.kind==='crew'?'IN POOL':it.eq?'EQUIPPED':'EQUIP'):neonI+' '+it.p;
    b.innerHTML=`${ic}<div class="tx"><div class="n">${it.n}</div><div class="t">${it.t}</div></div><div class="pr">${pr}</div>`;
    b.addEventListener('click',()=>gaTap(it,b));box.appendChild(b);}
  $('gaBtn').innerHTML='GARAGE '+neonI.replace('class="nI"','class="nI" style="color:#fff"')+' '+GA.bank;}
function gaTap(it,b){const own=!it.k||GA.own[it.k];
  if(!own){if(GA.bank<it.p){b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');gaMsg('Need '+(it.p-GA.bank)+' more Neon');return;}
    GA.bank-=it.p;GA.own[it.k]=true;gaMsg(it.n+' unlocked');}
  if(it.kind==='ship')GA.ship=it.id;else if(it.kind==='theme'){GA.theme=it.id;applyTheme();}
  gsave();gaDraw();}
function openGarage(from){GA.from=from||'title';titleEl.hidden=true;overEl.hidden=true;garageEl.hidden=false;gaDraw();}
function closeGarage(){garageEl.hidden=true;if(GA.from==='over')overEl.hidden=false;else{titleEl.hidden=false;}showBest();gaDraw();}
for(const b of garageEl.querySelectorAll('.tabs button'))b.addEventListener('click',()=>{GA.tab=b.dataset.t;gaDraw();});
$('gaBack').addEventListener('click',closeGarage);
// entry points: title menu and game-over screen
{const g=document.createElement('button');g.className='go dim';g.id='gaBtn';g.type='button';$('dailyBtn').after(g);g.addEventListener('click',()=>openGarage('title'));
  const g2=document.createElement('button');g2.className='go dim';g2.id='gaBtn2';g2.type='button';g2.textContent='GARAGE';$('againBtn').after(g2);g2.addEventListener('click',()=>openGarage('over'));}
gaDraw();
