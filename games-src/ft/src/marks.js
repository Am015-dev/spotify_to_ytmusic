// ===== Djinn inspect (owner, 24 Nov): hold / hover / right-click / the "i" on every djinn card opens a readable card =====
// Says: what it does, WHEN it works, what it costs, and (market) whether you can buy it NOW and exactly what is missing,
// or (owned) whether it is ready or used. Plus the "My djinns" row under the market and list in the Djinns panel.
// Reads G only; never changes it. Rules text is untouched (the one-line effects come from DJ[k].x).
const DJ_COST={EF:'1 Sage or 1 Mystic',EEF:'1 Sage + 1 Sage-or-Mystic',F:'1 Mystic','F+':'Mystics, while bidding'};
const DJ_WHEN={zarifa:'Counted once, when the game ends.',nakhla:'Counted once, when the game ends.',wazira:'Counted once, when the game ends.',hikma:'Counted once, when the game ends.',majlis:'Counted once, when the game ends.',jawhar:'Counted once, when the game ends.',sana:'Counted once, when the game ends.',
  harith:'Automatic, each time any djinn is summoned.',qasra:'Automatic, each time a palace is built.',khanjar:'Automatic, each time Shadows remove a person.',amir:'Automatic, each time Advisors are taken.',tariq:'Automatic, whenever someone drops on a tile you hold.',dukkan:'Automatic, when a rival finishes on a Bazaar.',
  sadim:'Always on: protects you when rivals use Shadows.',hafiz:'Always on: Cutpurses cannot touch you.',sirra:'Automatic, whenever your Shadows remove a person.',
  qirsh:'Your turn, before you use the Masons.',ghulam:'Your turn, before you use the Shadows.',burhan:'Your turn, before you finish your move.',rawda:'Your turn, before you finish your move.',dalil:'While bidding for turn order.'};
function djWhen(d){return DJ_WHEN[d.k]||(d.cost?'Your turn, once per turn.':'Always on.')}
function djHave(p){return `you have ${p.el} Sage${p.el===1?'':'s'} and ${p.fk} Mystic${p.fk===1?'':'s'}`}
function djBuy(p,k){
  if(G.over)return {ok:0,t:'The game is over.'};
  if(!p)return {ok:0,t:'Summoned at a Shrine: 2 Sages, or 1 Sage and 1 Mystic.'};
  const enough=p.el>=2||(p.el>=1&&p.fk>=1);
  if(G.phase==='turn'&&G.step==='tile'&&!G.q&&sideToAct()===p.i&&validMoves(p.i).some(m=>m.act==='tile'&&m.dj===k))return {ok:1,t:'You can buy it NOW: pay 2 Sages, or 1 Sage and 1 Mystic.'};
  if(!enough){const miss=p.el===0&&p.fk===0?'needs 2 Sages (or 1 Sage and 1 Mystic)':p.el===1&&p.fk===0?'needs 1 more Sage or 1 Mystic':'needs 1 more Sage';
    return {ok:0,t:`Not yet: ${miss} (${djHave(p)}).`}}
  if(sideToAct()!==p.i||G.phase!=='turn')return {ok:0,t:'You have enough. Wait for your turn, then end your move on a Shrine.'};
  return {ok:0,t:'You have enough. End your move on a Shrine to buy it.'}}
function djOwned(p,k){const d=DJ[k];
  if(!d.cost)return {ok:1,t:'Always on: nothing to press.'};
  if(d.cost==='F+')return {ok:1,t:'Ready: spend Mystics when you bid.'};
  if(p.used&&p.used[k])return {ok:0,t:'Used this turn. It is ready again next turn.'};
  if(G.over||G.phase!=='turn'||sideToAct()!==p.i)return {ok:1,t:`Ready: use it on your turn (costs ${DJ_COST[d.cost]}).`};
  if(!costOpts(p,d.cost).length)return {ok:0,t:`Ready, but you cannot pay now: needs ${DJ_COST[d.cost]} (${djHave(p)}).`};
  if(!djinnTargets(p,k).length)return {ok:0,t:'Ready, but nothing to aim at right now.'};
  return {ok:1,t:'Ready: use it now from the power buttons.'}}
function djShort(p,k){const d=DJ[k];if(!d.cost)return 'on';if(d.cost==='F+')return 'ready';return p.used&&p.used[k]?'used':'ready'}
function ownedDjHtml(){const p=typeof me==='function'?me():null;if(!G||!p||!p.dj.length)return '';
  return `<div class="orow" aria-label="My djinns"><button class="dcard omy" type="button" data-gx="djd" aria-label="My djinns, open the list">🧞 My djinns · ${p.dj.length}</button>`+
    p.dj.map(k=>`<button class="dcard odj ${djShort(p,k)}" type="button" data-odj="${k}" style="--dj:url(media/djinn-${k}.webp)" aria-label="${esc(DJ[k].n)}, ${djShort(p,k)}. Tap to read"><b>${esc(DJ[k].n)}</b><em>${djShort(p,k)}</em><span class="dinfo" data-info="${k}" data-own="1" aria-label="About ${esc(DJ[k].n)}">i</span></button>`).join('')+'</div>'}
function myDjSection(){const p=typeof me==='function'?me():null;if(!p)return '';
  return `<h3>My djinns</h3>`+(p.dj.length?`<ul class="mydj">${p.dj.map(k=>{const d=DJ[k],s=djOwned(p,k);return `<li><b>${esc(d.n)}</b> <small>${d.vp} pts</small> <span class="st ${s.ok?'ok':'no'}">${esc(djShort(p,k))}</span><br>${esc(d.x)}</li>`}).join('')}</ul>`:'<p class="muted small">You have no djinns yet. Summon one at a Shrine.</p>')}

(function(){
  let box=null,openK=null,holdT=0,hoverT=0,supp=0,sx=0,sy=0,byHover=false;
  const land=()=>document.documentElement.classList.contains('land');
  function ensure(){if(box)return box;box=document.createElement('div');box.id='dinspect';box.setAttribute('role','dialog');box.setAttribute('aria-label','Djinn details');box.hidden=true;document.body.appendChild(box);
    box.addEventListener('mouseenter',()=>{clearTimeout(hoverT)});box.addEventListener('mouseleave',()=>{if(byHover)close()});
    box.addEventListener('click',e=>{if(e.target.closest('.dix'))close()});return box}
  function close(){clearTimeout(hoverT);if(box)box.hidden=true;openK=null;byHover=false}
  function open(k,own,anchor,hover){if(!G||!DJ[k])return;const d=DJ[k],p=typeof me==='function'?me():null,b=ensure();const owned=own||(p&&p.dj.includes(k));
    const st=owned&&p?djOwned(p,k):djBuy(p,k);
    b.className=owned?'dio':'dim';byHover=!!hover;openK=k;
    b.innerHTML=`<button class="dix" type="button" aria-label="Close">×</button><h4>${esc(d.n)} <small>${d.vp} point${d.vp===1?'':'s'}</small></h4>
     <p class="dx">${esc(d.x)}</p>
     <p><b>When:</b> ${esc(djWhen(d))}</p>
     <p><b>Cost:</b> ${d.cost&&d.cost!=='F+'?'to use: '+esc(DJ_COST[d.cost]):d.cost?esc(DJ_COST[d.cost]):'nothing, it is always on'}${owned?'':' · to summon: 2 Sages, or 1 Sage and 1 Mystic'}</p>
     <p class="ds ${st.ok?'ok':'no'}"><b>${owned?'Status:':'Buy:'}</b> ${esc(st.t)}</p>`;
    b.hidden=false;
    if(!land()){const g=document.getElementById('grid'),gb=g?Math.max(...[...g.querySelectorAll('.tile')].map(t=>t.getBoundingClientRect().bottom)):innerHeight*.6;
      b.style.cssText=`left:0;right:0;bottom:0;top:auto;width:auto;max-height:${Math.max(150,Math.round(innerHeight-gb-6))}px`}
    else{const m=document.getElementById('mkt'),r=(anchor||m||document.body).getBoundingClientRect(),mr=m?m.getBoundingClientRect():r;
      const w=Math.min(380,Math.max(300,mr.width));let top=r.bottom+14;const h=b.offsetHeight||230;top=Math.max(8,Math.min(top,innerHeight-h-8));
      b.style.cssText=`left:${Math.max(8,Math.min(mr.left,innerWidth-w-8))}px;top:${top}px;width:${w}px;right:auto;bottom:auto;max-height:none`}}
  window.djInspect={open,close};
  const tgt=e=>e.target.closest&&e.target.closest('[data-dj],[data-odj]');
  const keyOf=el=>el.dataset.odj||el.dataset.dj;
  document.addEventListener('pointerdown',e=>{
    if(box&&!box.hidden&&!box.contains(e.target)&&!e.target.closest('.dinfo')&&e.pointerType!=='mouse')close();
    if(e.pointerType==='mouse'){if(box&&!box.hidden&&!box.contains(e.target)&&!e.target.closest('.dinfo'))close();return}
    const el=tgt(e);if(!el)return;sx=e.clientX;sy=e.clientY;clearTimeout(holdT);
    holdT=setTimeout(()=>{holdT=0;supp=Date.now()+900;open(keyOf(el),!!el.dataset.odj,el,false)},400)},true);
  const cancel=()=>{clearTimeout(holdT);holdT=0};
  document.addEventListener('pointerup',cancel,true);document.addEventListener('pointercancel',cancel,true);
  document.addEventListener('pointermove',e=>{if(holdT&&Math.hypot(e.clientX-sx,e.clientY-sy)>10)cancel()},true);
  document.addEventListener('contextmenu',e=>{const el=tgt(e);if(!el)return;e.preventDefault();open(keyOf(el),!!el.dataset.odj,el,false)},true);
  document.addEventListener('mouseover',e=>{if(e.pointerType==='touch'||matchMedia('(hover:none)').matches)return;const el=tgt(e);if(!el||el.contains(e.relatedTarget))return;clearTimeout(hoverT);hoverT=setTimeout(()=>open(keyOf(el),!!el.dataset.odj,el,true),380)});
  document.addEventListener('mouseout',e=>{const el=tgt(e);if(!el||el.contains(e.relatedTarget))return;clearTimeout(hoverT);if(byHover&&box&&!box.contains(e.relatedTarget))hoverT=setTimeout(close,220)});
  // capture: the long-press must not also summon / the i and owned chips only inspect
  document.addEventListener('click',e=>{
    if(supp&&Date.now()<supp&&tgt(e)){supp=0;e.stopImmediatePropagation();e.preventDefault();return}
    const dc=e.target.closest&&e.target.closest('.dcard[data-dj]:not(.th)');if(dc){const r=dc.getBoundingClientRect();if(e.clientX>r.right-44){e.stopImmediatePropagation();e.preventDefault();open(dc.dataset.dj,false,dc,false);return}}
    const i=e.target.closest&&e.target.closest('.dinfo');if(i){e.stopImmediatePropagation();e.preventDefault();const c=i.closest('[data-dj],[data-odj]');open(i.dataset.info,!!i.dataset.own,c||i,false);return}
    const o=e.target.closest&&e.target.closest('[data-odj]');if(o){e.stopImmediatePropagation();e.preventDefault();open(o.dataset.odj,true,o,false);return}
    if(box&&!box.hidden&&!box.contains(e.target))close()},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();
