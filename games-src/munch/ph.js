// ---------- phone layout (html.ph): table first, rivals as chips, card pop-up, one action card ----------
// Rules, engine, AI and the online protocol are untouched. This file only sets classes / CSS variables, builds the
// compact player chips (same data-opp handler as the old rival boxes) and mirrors the status text into the top bar.
const PH={on:false,
  want(){let f=null;try{const m=location.search.match(/[?&]phone=(\d)/);if(m)f=m[1]==='1'}catch(e){}if(f!=null)return f;
    const s=Math.min(innerWidth,innerHeight);let co=false;try{co=matchMedia('(pointer:coarse)').matches}catch(e){}return s<=500||(co&&s<=600)},
  apply(){const h=document.documentElement,on=this.want(),l=innerWidth>innerHeight;this.on=on;
    h.classList.toggle('ph',on);h.classList.toggle('ph-p',on&&!l);h.classList.toggle('ph-l',on&&l);
    if(on){const a=document.querySelector('.gx-app');if(a)a.classList.remove('gx-dock-min','gx-sheet-full')}
    this.metrics()},
  metrics(){const h=document.documentElement;if(!this.on){h.style.removeProperty('--ph-tb');return}
    const t=document.querySelector('.table');if(t){const r=t.getBoundingClientRect();h.style.setProperty('--ph-tb',Math.round(r.bottom+4)+'px')}},
  chips(){return '';/* the rival seats are on the table now (ui.js oppsHTML) */const me=viewSeat();
    const chip=(p,mine)=>{const act=p.i===G.active;const nm=esc(p.nm);
      const lab=`${p.nm}${mine?' (you)':''}, level ${p.lvl}, strength ${pStr(p)}, ${p.hand.length} cards in hand, ${p.eq.length} items in play${act?', their turn':''}`;
      const inner=`<span class="n">${ptok(p.i)}<b>${mine?'You':nm}</b></span><span class="s" aria-hidden="true"><i class="l">Lv ${p.lvl}</i> ⚔${pStr(p)}<span class="hc"> ✋${p.hand.length}</span>${p.curse&&p.curse.length?' ☁'+p.curse.length:''}${p.dead?' 💀':''}</span>`;
      return mine?`<div class="phc me ${act?'act':''}" style="--c:${PCOL[p.i]}" role="group" aria-label="${esc(lab)}">${inner}</div>`
        :`<button class="phc ${act?'act':''}" data-opp="${p.i}" style="--c:${PCOL[p.i]}" aria-label="${esc(lab)}. Tap for their cards.">${inner}</button>`};
    const mp=me>=0&&G.pl[me]?G.pl[me]:null;
    return (mp?chip(mp,true):'')+G.pl.filter(p=>p.i!==me).map(p=>chip(p,false)).join('')},
  after(){if(!this.on)return;const o=document.getElementById('phopps');if(o){const sl=o.scrollLeft;const h=emo(this.chips());if(o._h!==h){o._h=h;o.innerHTML=h;o.scrollLeft=sl}}
    const c=document.getElementById('phchip');if(c&&typeof G!=='undefined'){const me=viewSeat();const t=!G?'Doorkick Dungeon':(me>=0&&G.pl[me]&&G.mode!=='ai'?`Lv ${G.pl[me].lvl}/10 · `:'')+dockTitle(me).replace(/ · turn \d+$/,'').replace(/ is thinking…$/,'’s turn').replace(/’s move$/,'’s turn');if(c.textContent!==t)c.textContent=t}
    this.metrics()}};
(function(){const r0=render;render=function(){const x=r0.apply(this,arguments);try{PH.after()}catch(e){UI.lastErr='ph '+e}return x};
  // One debounced relayout fed by resize, orientationchange, visualViewport and the table's ResizeObserver; a second pass at ~400 ms because
  // iOS reports the old size for a moment after a rotation. Only a changed size signature does work.
  let t1=0,t2=0,sig='';const relayout=force=>{const tb=document.querySelector('.table');const s=innerWidth+'x'+innerHeight+'|'+(tb?tb.clientWidth+'x'+tb.clientHeight:'');
    if(!force&&s===sig)return;sig=s;try{PH.apply();PH.after()}catch(e){UI.lastErr='ph '+e}};
  const re=()=>{clearTimeout(t1);clearTimeout(t2);t1=setTimeout(()=>relayout(),60);t2=setTimeout(()=>relayout(),420)};
  addEventListener('resize',re);addEventListener('orientationchange',re);
  try{if(window.visualViewport){visualViewport.addEventListener('resize',re)}}catch(e){}
  try{const tb=document.querySelector('.table');if(tb&&window.ResizeObserver)new ResizeObserver(re).observe(tb)}catch(e){}
  PH.apply();PH.after();requestAnimationFrame(()=>PH.metrics())})();
