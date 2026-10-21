// PURPOSE: one-screen phone forge: bench + ship slot bar + swipe strip, info and recipes as bottom sheets
// FLAG: forge2 (?forge2=0)
// TEST: forge2-test.js
/* ---------- FORGE 2 (flag RET.forge2, default ON; ?forge2=0 = the forgeui.js screen). Owner, 21 Oct 2026: "the forge looks like shit, we need to scroll up
   and down, not user friendly." The whole forge fits one phone screen, nothing scrolls but the card strip:
   top = back + tab chips (WEAPONS / MODS / PRESETS); status line + Neon/scrap; BENCH = slot A + slot B = output, live stat deltas, MERGE (cost on it), UNDO,
   RECIPES; SHIP bar = 2 weapon slots + core + passive (tap with a card selected = equip/socket, tap empty-handed = slot sheet with mods); STRIP = one row of
   big cards, swipe sideways, counter 3/18, chips type / tier / on ship. Tap a weapon card = it lifts into the next free forge slot; tap again or hold =
   info sheet (all actions: level up, scrap, craft, socket, sell). Same rules, data and lesson hooks as forgeui.js (FGU.why/merge/unmerge/put). Existing
   art only (FG.icon). Test: nightrun/forge2-test.js. */
if(RET.forge2===undefined)RET.forge2=!/[?&]forge2=0/.test(location.search);
const FG2=window.FG2={tab:'w',sheet:null,sx:0,fl:null,prev:'ships',eqOnly:false};
{const st=document.createElement('style');st.textContent=`
#garage.f2{padding:8px 12px!important;gap:0!important}
#garage.f2>:not(#gaCards){display:none!important}
#gaCards.f2{display:flex!important;flex-direction:column;gap:8px;flex:1 1 0;min-height:0;overflow:hidden!important;font:14px var(--mono,monospace);color:#efeaff;position:relative;width:100%;max-width:760px;margin:0 auto}
#gaCards.f2 *{box-sizing:border-box}
#gaCards.f2 button{font:700 14px var(--mono,monospace);color:#efeaff;min-height:44px;min-width:44px;border-radius:10px;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
#gaCards.f2 button[disabled]{cursor:not-allowed}
#gaCards.f2 .f2-p{border:1px solid rgba(160,154,210,.45);border-radius:12px;background:rgba(11,8,32,.82);padding:8px 12px;min-width:0}
#gaCards.f2 .f2-top{display:flex;gap:8px;align-items:center;flex:0 0 auto}
#gaCards.f2 .f2-bk{flex:0 0 44px;width:44px;padding:0;border:1px solid #5cecff;background:#16304a;font:700 24px var(--display,sans-serif);line-height:1}
#gaCards.f2 .f2-tabs{display:flex;gap:8px;flex:1 1 auto;min-width:0}
#gaCards.f2 .f2-tab{flex:1 1 0;min-width:0;padding:0 4px;border:1px solid #6a6490;background:#1a1440;letter-spacing:.04em}
#gaCards.f2 .f2-tab.on{background:#5cecff;border-color:#5cecff;color:#0b0820}
#gaCards.f2 .f2-st{display:flex;gap:8px;align-items:center;flex:0 0 auto;height:40px}
#gaCards.f2 .f2-msg{flex:1 1 auto;min-width:0;color:#ffe14d;line-height:20px;max-height:40px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
#gaCards.f2 .f2-wal{flex:0 0 auto;text-align:right;line-height:20px;color:#d6d0f5;white-space:nowrap}
#gaCards.f2 .f2-wal b{color:#fff}#gaCards.f2 .f2-wal .nI{width:14px;height:14px;vertical-align:-2px;color:#5cecff}
#gaCards.f2 .f2-bench{flex:0 0 auto;display:flex;flex-direction:column;gap:8px}
#gaCards.f2 .f2-row{display:grid;grid-template-columns:minmax(0,1fr) 16px minmax(0,1fr) 16px minmax(0,1.15fr);align-items:stretch;gap:4px}
#gaCards.f2 .f2-op{align-self:center;text-align:center;font:700 18px var(--mono,monospace);color:#8c86b8}
#gaCards.f2 button.f2-slot{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;height:76px;padding:4px;border:2px dashed #6a6490;background:#120d2e;line-height:18px;overflow:hidden}
#gaCards.f2 .f2-slot canvas{width:36px;height:36px;flex:0 0 36px}
#gaCards.f2 .f2-slot span,#gaCards.f2 .f2-ls span,#gaCards.f2 .f2-card .n,#gaCards.f2 .f2-card small{display:block;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#gaCards.f2 .f2-slot small{font:400 14px var(--mono,monospace);color:#a9a3cf}
#gaCards.f2 button.f2-slot.full{border-style:solid;border-color:#5cecff}
#gaCards.f2 button.f2-slot.arm{border-style:solid;border-color:#ffe14d;background:#231a52}
#gaCards.f2 button.f2-slot.out{border-color:#3dffb0}
#gaCards.f2 button.f2-slot.out.full{background:#0e2a2a}
#gaCards.f2 .f2-prev{height:44px;display:flex;flex-direction:column;justify-content:center;gap:2px;line-height:20px;color:#d6d0f5;overflow:hidden}
#gaCards.f2 .f2-dl{display:flex;gap:4px 12px;flex-wrap:nowrap;overflow:hidden;white-space:nowrap}
#gaCards.f2 .up{color:#3dffb0;font-weight:700}#gaCards.f2 .dn{color:#ff8fa8;font-weight:700}
#gaCards.f2 .f2-good{color:#5cecff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#gaCards.f2 .f2-go{display:flex;gap:8px}
#gaCards.f2 button.f2-merge{flex:1 1 auto;height:52px;border:0;background:#3dffb0;color:#0b0820;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:20px;letter-spacing:.08em;font-size:16px}
#gaCards.f2 button.f2-merge small{font:400 14px var(--mono,monospace);letter-spacing:0;color:#0b0820}
#gaCards.f2 button.f2-merge[disabled] small{color:#c9c3e6}
#gaCards.f2 button.f2-merge[disabled]{background:#2a2450;color:#c9c3e6;border:1px dashed #8c86b8}
#gaCards.f2 button.f2-b{padding:0 12px;border:1px solid #5cecff;background:#16304a}
#gaCards.f2 button.f2-b.on{background:#5cecff;color:#0b0820}
#gaCards.f2 button.f2-b[disabled]{border-color:#6a6490;background:#241e44;color:#c9c3e6}
#gaCards.f2 .f2-go .f2-b{flex:0 0 auto;height:52px}
#gaCards.f2 .f2-lo{flex:0 0 auto;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:8px}
#gaCards.f2 .fgslot.f2-ls{display:block;min-width:0;border:0;padding:0}
#gaCards.f2 .fgslot.f2-ls>button{width:100%;height:56px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:2px 4px;border:1px solid #6a6490;background:#120d2e;line-height:18px;overflow:hidden}
#gaCards.f2 .fgslot.f2-ls canvas{width:28px;height:28px;flex:0 0 28px}
#gaCards.f2 .fgslot.f2-ls.no>button{border-style:dashed;color:#a9a3cf}
#gaCards.f2 .fgslot.f2-ls.hot>button{border:2px solid #ffe14d;background:#231a52}
#gaCards.f2 .fgslot.f2-ls.arm>button{border:2px solid #ffe14d}
#gaCards.f2 .f2-inv{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:8px;padding:8px}
#gaCards.f2 .f2-chips{display:flex;gap:8px;align-items:center;flex:0 0 auto}
#gaCards.f2 .f2-chips .f2-b{padding:0 10px;border-color:#6a6490;background:#1a1440}
#gaCards.f2 .f2-chips .f2-b.on{background:#5cecff;border-color:#5cecff;color:#0b0820}
#gaCards.f2 .f2-cnt{margin-left:auto;color:#d6d0f5;white-space:nowrap}
#gaCards.f2 .f2-pg{display:none}
@media (hover:hover) and (pointer:fine){#gaCards.f2 .f2-pg{display:inline-flex;align-items:center;justify-content:center;padding:0}}
#gaCards.f2 .f2-strip{flex:1 1 auto;min-height:100px;max-height:240px;display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;overscroll-behavior:contain;touch-action:pan-x pan-y;scrollbar-width:none;-webkit-overflow-scrolling:touch}
#gaCards.f2 .f2-strip::-webkit-scrollbar{display:none}
#gaCards.f2 button.fgt.f2-card{flex:0 0 128px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;height:100%;padding:6px;border:1px solid #6a6490;background:#120d2e;line-height:18px;overflow:hidden;position:relative;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
#gaCards.f2 .f2-card canvas{width:40px;height:40px;flex:0 0 40px}
#gaCards.f2 .f2-card .n{color:#fff}
#gaCards.f2 .f2-card small{font:400 14px var(--mono,monospace);color:#a9a3cf}
#gaCards.f2 .f2-card small.vs{display:none;white-space:normal;color:#5cecff;line-height:18px;max-height:36px}
#gaCards.f2 .f2-card small.eq{color:#5cecff;font-weight:700}#gaCards.f2 .f2-card small.rec{color:#ffe14d;font-weight:700}
#gaCards.f2 button.fgt.f2-card.sel{border:2px solid #ffe14d;background:#231a52;transform:translateY(-4px)}
#gaCards.f2 button.fgt.f2-card.no{border-style:dashed;background:#0d0a22}
#gaCards.f2 button.fgt.f2-card.no canvas{opacity:.55}
#gaCards.f2 .f2-empty{align-self:center;color:#a9a3cf}
#gaCards.f2 .f2-pre{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:8px;padding:8px 12px}
#gaCards.f2 .f2-pre .r{display:flex;gap:8px;align-items:center}
#gaCards.f2 .f2-pre input{flex:1 1 auto;min-width:0;height:44px;font:14px var(--mono,monospace);background:#0b0820;color:#efeaff;border:1px solid #8c86b8;border-radius:10px;padding:0 8px}
#gaCards.f2 .f2-pre small{color:#a9a3cf}
#gaCards.f2 .f2-scrim{position:absolute;inset:0;z-index:40;overflow:hidden;background:rgba(5,3,12,.6);display:flex;align-items:flex-end;justify-content:center}
#gaCards.f2 .f2-sheet{width:100%;max-width:760px;max-height:min(78%,560px);display:flex;flex-direction:column;gap:8px;padding:12px 16px 16px;border-radius:16px 16px 0 0;border:1px solid #5cecff;border-bottom:0;background:#120d2e;animation:f2up .2s ease-out}
#gaCards.f2 .f2-sheet .hd{display:flex;gap:12px;align-items:center}
#gaCards.f2 .f2-sheet .hd b{display:block;font-size:16px;color:#fff}
#gaCards.f2 .f2-sheet .hd canvas{width:48px;height:48px;flex:0 0 48px}
#gaCards.f2 .f2-sheet .hd .x{margin-left:auto}
#gaCards.f2 .f2-sheet p{margin:0;line-height:20px;color:#d6d0f5}
#gaCards.f2 .f2-sheet .acts{display:flex;flex-wrap:wrap;gap:8px}
#gaCards.f2 .f2-sheet .lst{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;overflow-y:auto;min-height:0;overscroll-behavior:contain}
#gaCards.f2 .f2-sheet .lst .f2-b{text-align:left;padding:4px 10px;font-weight:400;line-height:18px}
#gaCards.f2 .f2-sheet .lst .f2-b b{color:#fff}
#gaCards.f2 .f2-sheet .lst .f2-b.ok{border-color:#3dffb0}
#gaCards.f2 .f2-sheet .lst .f2-b.lock{border-style:dashed;border-color:#6a6490;background:#0d0a22;color:#a9a3cf}
#gaCards.f2 .pop{animation:f2pop .22s ease-out}
#gaCards.f2 .flash{animation:f2fl .24s ease-out}
@keyframes f2up{from{transform:translateY(24px);opacity:.4}to{transform:none;opacity:1}}
@keyframes f2pop{0%{transform:scale(.92)}100%{transform:none}}
@keyframes f2fl{0%{box-shadow:0 0 0 0 #3dffb0;background:#2a6a52}100%{box-shadow:0 0 0 8px rgba(61,255,176,0);background:#0e2a2a}}
@media (prefers-reduced-motion:reduce){#gaCards.f2 .pop,#gaCards.f2 .flash,#gaCards.f2 .f2-sheet{animation:none}}
@media (orientation:landscape) and (max-height:560px){
 #gaCards.f2{display:grid!important;max-width:none;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto auto minmax(0,1fr);grid-template-areas:"top lo" "st inv" "bench inv";column-gap:12px}
 #gaCards.f2 .f2-top{grid-area:top}#gaCards.f2 .f2-st{grid-area:st}#gaCards.f2 .f2-bench{grid-area:bench;align-self:start}#gaCards.f2 .f2-lo{grid-area:lo}
 #gaCards.f2 .f2-inv,#gaCards.f2 .f2-pre{grid-area:inv}
 #gaCards.f2 .f2-row{grid-template-columns:minmax(0,1fr) 16px minmax(0,1fr) 16px minmax(0,1.15fr)}
 #gaCards.f2 button.f2-slot{height:68px}
 #gaCards.f2 .f2-lo{padding:4px 8px}#gaCards.f2 .fgslot.f2-ls>button{height:52px;flex-direction:row;gap:6px}
}
@media (max-height:620px) and (orientation:portrait){#gaCards.f2 .f2-bench{gap:6px}#gaCards.f2 .f2-prev{height:40px}#gaCards.f2 button.f2-merge,#gaCards.f2 .f2-go .f2-b{height:48px}
 #gaCards.f2 .f2-st{height:36px}#gaCards.f2 .f2-msg{line-height:18px;max-height:36px}#gaCards.f2 .f2-wal{line-height:18px}#gaCards.f2 .f2-lo{padding:6px}
 #gaCards.f2 .f2-card canvas{width:32px;height:32px;flex-basis:32px}#gaCards.f2 button.fgt.f2-card{padding:4px 6px}}
@media (min-height:700px) and (orientation:portrait){#gaCards.f2 .f2-card small.vs{display:block}#gaCards.f2 .f2-card canvas{width:56px;height:56px;flex-basis:56px}#gaCards.f2 button.fgt.f2-card{flex-basis:136px;gap:4px}#gaCards.f2 button.f2-slot{height:96px}#gaCards.f2 .f2-slot canvas{width:48px;height:48px;flex-basis:48px}
 #gaCards.f2 .fgslot.f2-ls>button{height:68px}#gaCards.f2 .fgslot.f2-ls canvas{width:32px;height:32px;flex-basis:32px}#gaCards.f2 .f2-prev{height:64px}
 #gaCards.f2 .f2-prev .f2-dl{flex-wrap:wrap}}
@media (min-width:1024px){#gaCards.f2,#gaCards.f2 button,#gaCards.f2 small,#gaCards.f2 input{font-size:16px}}`;document.head.appendChild(st);}
/* the screen */
FG2.draw=function(box){const s=FG.st(),lo=s.lo,U=FGU,F=this,own=WP_IDS.filter(id=>WP.has(id));FG.sync();
  const old=box.querySelector('.f2-strip');if(old&&this.sx>=0)this.sx=old.scrollLeft;
  box.classList.remove('fu');box.classList.add('f2');box.innerHTML='';
  if(U.a&&!own.includes(U.a))U.a=null;if(U.b&&!own.includes(U.b))U.b=null;
  if(this.tab!=='p')this.tab=/^(m|k|p)$/.test(INV.f)?'m':'w';
  const el=(tag,cls,html,attrs)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;for(const k in attrs||{})e.setAttribute(k,attrs[k]);return e;};
  const btn=(cls,html,fn,attrs)=>{const b=el('button',cls,html,Object.assign({type:'button'},attrs||{}));b.addEventListener('click',fn);return b;};
  const ic=(cv,it,S)=>{if(it&&cv)FG.icon(cv.getContext('2d'),it,S);};
  const cv=S=>'<canvas width="'+S+'" height="'+S+'"></canvas>';
  const act=(f,fl)=>{INV.say(f()||'');if(fl)F.fl=fl;gaDraw();};
  const why=U.why(),R=U.a&&U.b&&U.a!==U.b?FG.rec(U.a,U.b):null;
  // ---- top: back, tab chips
  const top=el('div','f2-top');box.appendChild(top);
  top.appendChild(btn('f2-bk','‹',()=>{F.sheet=null;GA.tab=F.prev||'ships';gaDraw();},{'aria-label':'Back to the hangar',id:'fuBack'}));
  const tb=el('div','f2-tabs',null,{role:'tablist'});top.appendChild(tb);
  for(const[k,l]of[['w','WEAPONS'],['m','MODS'],['p','PRESETS']])tb.appendChild(btn('f2-tab'+(this.tab===k?' on':''),l,()=>{F.tab=k;F.sx=-2;if(k==='w')INV.f='w';else if(k==='m')INV.f='m';INV.sel=null;U.arm=null;act(()=>'');},{role:'tab','aria-selected':String(this.tab===k),'data-tab':k}));
  // ---- status line + wallet
  const st=el('div','f2-st');box.appendChild(st);
  const hint=this.tab==='p'?'SAVE keeps your ship slots and mods; LOAD puts them back':INV.sel?U.name(INV.sel)+': tap a ship slot, or tap again for info':!U.a&&!U.b?'Tap 2 weapon cards: they fill A and B':why||'Ready: press MERGE';
  st.appendChild(el('div','f2-msg',fgEsc(INV.msg||hint),{id:'fgMsg',role:'status','aria-live':'polite'}));
  st.appendChild(el('div','f2-wal',neonI+' <b>'+GA.bank+'</b><br><b id="fuScrap">'+s.scrap+'</b> scrap'));
  // ---- bench
  const Z=el('section','f2-p f2-bench',null,{'data-lesson':'forge-zone',id:'fuForge','aria-label':'Forge bench'});box.appendChild(Z);
  const row=el('div','f2-row');Z.appendChild(row);
  const fslot=k=>{const id=k==='a'?U.a:U.b,b=btn('f2-slot'+(id?' full':'')+(U.arm===k?' arm':'')+(F.fl===k?' pop':''),'',()=>{const x=INV.sel;
      if(x&&U.ty(x)==='w')return act(()=>U.put(k,x),k);if(x)return act(()=>'Only plain weapons go in the forge');
      if(id&&U.arm!==k){if(k==='a')U.a=null;else U.b=null;U.arm=k;return act(()=>'Slot '+k.toUpperCase()+' cleared: tap a weapon card');}
      U.arm=U.arm===k?null:k;F.tab='w';INV.f='w';act(()=>U.arm?'Now tap a weapon card for slot '+k.toUpperCase():'');},{id:'fuSlot'+k.toUpperCase(),'data-lesson':'forge-slot-'+k,'aria-label':'forge slot '+k.toUpperCase()+(id?': '+WPD[id].s:' empty')});
    b.innerHTML=(id?cv(48):'')+'<span>'+(id?fgEsc(WPD[id].s):'SLOT '+k.toUpperCase())+'</span>'+(id?'':'<small>empty</small>');ic(b.querySelector('canvas'),'w:'+id,48);return b;};
  row.appendChild(fslot('a'));row.appendChild(el('div','f2-op','+'));row.appendChild(fslot('b'));row.appendChild(el('div','f2-op','='));
  const ob=btn('f2-slot out'+(R?' full':'')+(F.fl==='out'?' flash':''),'',()=>{if(R){F.sheet='h:'+R[2];gaDraw();}else act(()=>why);},{id:'fuOut','data-lesson':'forge-out','aria-label':'forge output'+(R?': '+R[3]:'')});
  ob.innerHTML=R?cv(48)+'<span>'+fgEsc(R[3].toUpperCase())+(s.hy[R[2]]?' ✓':'')+'</span>':'<span>?</span><small>result</small>';
  if(R)ic(ob.querySelector('canvas'),'h:'+R[2],48);row.appendChild(ob);
  // live preview: the stats that change against the ship slot it would replace, and what it is good against
  const pv=el('div','f2-prev',null,{id:'fuPrev','data-lesson':'forge-preview'});Z.appendChild(pv);
  if(R){const it='h:'+R[2],cs=U.cmpSlot(R[0]),cur=U.slotItem(cs),a=U.stats(it),c=U.stats(cur),L=[];
    for(const[k,lab,fmt]of[['dmg','DMG',x=>x+'%'],['px','PIERCE',x=>x],['rc','BOUNCE',x=>x],['hk','SEEK',x=>x?'yes':'no'],['fx','FX',x=>x]]){const v=a[k]-c[k];if(!v&&k!=='dmg')continue;
      L.push('<span data-delta="'+k+'">'+lab+' '+fmt(a[k])+' <span class="'+(v>0?'up':v<0?'dn':'')+'">'+(v>0?'▲'+v:v<0?'▼'+(-v):'=')+'</span></span>');}
    pv.innerHTML='<div class="f2-dl" title="against SLOT '+(cs+1)+'">'+L.join('')+'</div><div class="f2-good">Good vs '+fgEsc(U.good(it)||'all foes')+'</div>';}
  else pv.innerHTML='<div>'+(U.a&&U.b&&U.a!==U.b?'These two do not merge: see RECIPES':'Hold any card for its info')+'</div><div class="f2-good">'+Object.keys(s.hy).length+' of '+FGR.length+' hybrids forged</div>';
  const gr=el('div','f2-go');Z.appendChild(gr);
  const go=btn('f2-merge','MERGE<small>'+FG_COST.scrap+' scrap + '+FG_COST.neon+' Neon</small>',()=>act(()=>{const m=U.merge();if(!m){F.fl='out';F.sx=-1;}return m;}),{id:'fuMerge','data-lesson':'forge-merge'});
  if(why){go.disabled=true;go.setAttribute('aria-describedby','fgMsg');}gr.appendChild(go);
  if(U.undo)gr.appendChild(btn('f2-b','UNDO',()=>act(()=>U.unmerge()),{id:'fuUndo','data-lesson':'forge-undo','aria-label':'undo the last merge, get '+U.undo.scrap+' scrap and '+U.undo.bank+' Neon back'}));
  gr.appendChild(btn('f2-b','RECIPES',()=>{F.sheet='recipes';gaDraw();},{id:'fuRec','aria-label':'recipes list'}));
  // ---- ship slot bar
  const L=el('section','f2-p f2-lo',null,{'data-lesson':'loadout',id:'fuLoad','aria-label':'Ship slots'});box.appendChild(L);
  const sel=INV.sel,sty=sel&&U.ty(sel);
  for(const sl of[0,1,'core','pas']){const q=INV.slotHtml(sl),fits=sel&&((sl===0||sl===1)?/[whm]/.test(sty):sl==='core'?sty==='k':sty==='p');
    const d=el('div','fgslot f2-ls'+(q.it?'':' no')+(fits?' hot':'')+(U.arm===sl?' arm':''),null,{'data-slot':String(sl),'data-lesson':'loadout-slot'});
    const short=sl===0?'SLOT 1':sl===1?'SLOT 2':sl==='core'?'CORE':'PASSIVE',nm=q.it?(U.ty(q.it)==='w'?WPD[U.id(q.it)].s:q.n):short;
    const mods=(sl===0||sl===1)?(lo.m[sl]||[]).filter(Boolean).length:0;
    const b=btn(F.fl==='s'+sl?'pop':'',cv(32)+'<span title="'+fgEsc(q.n)+'">'+fgEsc(nm)+(mods?' +'+mods:'')+'</span>',()=>{const x=INV.sel;
      if(x)return act(()=>{const m=U.put(sl,x);if(!/^Only|^Craft/.test(m||''))INV.sel=null;return m;},'s'+sl);
      F.sheet='slot:'+sl;gaDraw();},{'aria-label':short+': '+q.n+(mods?', '+mods+' mod(s)':'')});
    ic(b.querySelector('canvas'),q.it,32);if(!q.it)b.querySelector('canvas').remove();d.appendChild(b);L.appendChild(d);}
  // ---- bottom: the card strip, or the presets
  const rec=U.recs(),stg=U.stage();
  if(this.tab==='p'){const P=el('section','f2-p f2-pre',null,{id:'fuPre'});box.appendChild(P);
    for(let i=0;i<3;i++){const p=s.pre[i],r=el('div','r');r.innerHTML='<input maxlength="14" aria-label="build '+(i+1)+' name" value="'+fgEsc(p?p.n:'BUILD '+(i+1))+'">';
      const ld=btn('f2-b','LOAD',()=>act(()=>FG.usePre(i)||(p.n+' loaded')));if(!p)ld.disabled=true;r.appendChild(ld);
      r.appendChild(btn('f2-b','SAVE',()=>{const n=r.querySelector('input').value;act(()=>FG.savePre(i,n)||'Saved as '+(n||'BUILD '+(i+1)));}));P.appendChild(r);}}
  else{const I=el('section','f2-p f2-inv',null,{'data-lesson':'forge-inventory',id:'fuInv'});box.appendChild(I);
    const ch=el('div','f2-chips',null,{'data-lesson':'forge-filter'});I.appendChild(ch);
    const TY=this.tab==='w'?[['w','WEAPONS'],['h','HYBRIDS'],['all','ALL']]:[['m','MODS'],['k','CORES'],['all','ALL']],ti=Math.max(0,TY.findIndex(t=>t[0]===INV.f));
    ch.appendChild(btn('f2-b on',TY[ti][1]+' ▾',()=>{INV.f=TY[(ti+1)%TY.length][0];F.sx=-2;gaDraw();},{'data-f':'type','aria-label':'show: '+TY[ti][1]+' (tap to change)'}));
    ch.appendChild(btn('f2-b'+(INV.sort==='level'?' on':''),'TIER',()=>{INV.sort=INV.sort==='level'?'type':'level';F.sx=-2;gaDraw();},{'data-f':'sort','aria-pressed':String(INV.sort==='level')}));
    ch.appendChild(btn('f2-b'+(this.eqOnly?' on':''),'ON SHIP',()=>{F.eqOnly=!F.eqOnly;F.sx=-2;gaDraw();},{'data-f':'eq','aria-pressed':String(this.eqOnly)}));
    const cnt=el('span','f2-cnt','',{id:'fuCnt','aria-live':'polite'});ch.appendChild(cnt);
    const strip=el('div','f2-strip',null,{id:'fuStrip',role:'list'});
    ch.appendChild(btn('f2-b f2-pg','‹',()=>strip.scrollBy({left:-strip.clientWidth,behavior:'smooth'}),{'aria-label':'previous cards'}));
    ch.appendChild(btn('f2-b f2-pg','›',()=>strip.scrollBy({left:strip.clientWidth,behavior:'smooth'}),{'aria-label':'next cards'}));
    I.appendChild(strip);
    let items=INV.items();if(this.eqOnly)items=items.filter(x=>U.equipped(x.it));
    if(!items.length)strip.appendChild(el('div','f2-empty',this.eqOnly?'Nothing of this kind on the ship.':'Nothing here yet.'));
    for(const x of items){const eq=U.equipped(x.it),inA=x.ty==='w'&&(U.a===U.id(x.it)||U.b===U.id(x.it));
      const b=btn('fgt f2-card'+(INV.sel===x.it?' sel':'')+(x.own?'':' no'),'',()=>{if(b._lp)return;F.tapCard(x);},{'data-it':x.it,role:'listitem','aria-pressed':String(INV.sel===x.it),'aria-label':x.n+(eq?', on ship':'')+(inA?', in forge':'')});
      const sub=x.ty==='m'?(x.own?'owned x'+x.lv:FG_MODC+' scrap'):(x.ty==='k'||x.ty==='p')?(x.own?(x.ty==='k'?'core':'passive'):FG_CORC+' scrap'):(x.ty==='h'?'hybrid ':'')+'LV'+x.lv;
      const tag=!x.own?'<small>TO CRAFT</small>':eq?'<small class="eq">ON SHIP</small>':rec.has(x.it)?'<small class="rec" title="good for the next stage">★ STAGE '+stg+'</small>':inA?'<small class="eq">IN FORGE</small>':'<small>&nbsp;</small>';
      b.innerHTML=cv(40)+'<span class="n">'+fgEsc(x.n)+'</span><small>'+sub+'</small>'+tag+(U.good(x.it)?'<small class="vs">vs '+fgEsc(U.good(x.it))+'</small>':'');ic(b.querySelector('canvas'),x.it,40);
      // hold = info sheet (touch and mouse); right click too
      let t=0;const clr=()=>{clearTimeout(t);t=0;};b._clr=clr;
      b.addEventListener('pointerdown',()=>{b._lp=0;clr();t=setTimeout(()=>{b._lp=1;F.sheet=x.it;gaDraw();},450);});
      for(const ev of['pointerup','pointercancel','pointerleave'])b.addEventListener(ev,clr);
      b.addEventListener('contextmenu',e=>{e.preventDefault();clr();F.sheet=x.it;gaDraw();});
      strip.appendChild(b);}
    const upd=()=>{const c=strip.querySelector('.f2-card');const n=items.length;if(!c||!n){cnt.textContent='0/0';return;}const w=c.offsetWidth+8,first=Math.min(n,Math.round(strip.scrollLeft/w)+1),last=Math.min(n,Math.floor((strip.scrollLeft+strip.clientWidth+8)/w));
      cnt.textContent=(last>first?first+'-'+last:first)+'/'+n;};
    strip.addEventListener('scroll',()=>{upd();for(const c of strip.children)if(c._clr)c._clr();},{passive:true});
    upd();requestAnimationFrame(()=>{const sc=strip.querySelector('.f2-card.sel');if(F.sx===-1&&sc)strip.scrollLeft=Math.max(0,sc.offsetLeft-strip.offsetLeft-8);else if(F.sx>0)strip.scrollLeft=F.sx;else strip.scrollLeft=0;F.sx=strip.scrollLeft;upd();});}
  // ship slot labels: the full name when it fits, else its first word
  for(const sp of L.querySelectorAll('button span'))if(sp.scrollWidth>sp.clientWidth+1){const w=sp.textContent.split(' ');sp.textContent=w[0]+(/^\+\d/.test(w[w.length-1])?' '+w[w.length-1]:'');}
  this.fl=null;
  if(this.sheet)this.drawSheet(box,{el,btn,ic,cv,act});};
/* tap a card: weapons lift into the next free forge slot; a selected card's second tap opens its info sheet */
FG2.tapCard=function(x){const U=FGU,id=U.id(x.it);
  if(U.arm!=null&&x.own){const w=U.arm;INV.say(U.put(w,x.it)||'');this.fl=w==='a'||w==='b'?w:'s'+w;return gaDraw();}
  if(INV.sel===x.it){this.sheet=x.it;return gaDraw();}
  INV.sel=x.it;let m='';
  if(x.ty==='w'&&U.a!==id&&U.b!==id&&(!U.a||!U.b)){const k=U.a?'b':'a';m=U.put(k,x.it);INV.sel=x.it;this.fl=k;
    m=m||(U.why()?'':'Ready: press MERGE');}
  else if(x.ty==='w'&&U.a&&U.b&&U.a!==id&&U.b!==id)m='Forge full: tap A or B to swap in '+WPD[id].s;
  else if(!x.own)m=x.n+' is not crafted yet: tap again for CRAFT';
  INV.say(m);gaDraw();};
/* bottom sheets: an item's info and actions, a ship slot with its mods, the recipe list */
FG2.drawSheet=function(box,h){const{el,btn,ic,cv,act}=h,U=FGU,s=FG.st(),lo=s.lo,F=this,k=this.sheet,close=()=>{F.sheet=null;gaDraw();};
  const scr=el('div','f2-scrim',null,{id:'fuSheet'});scr.addEventListener('click',e=>{if(e.target===scr)close();});
  const sh=el('div','f2-sheet',null,{role:'dialog','aria-modal':'true'});scr.appendChild(sh);
  const head=(it,title,sub)=>{const d=el('div','hd',(it?cv(48):'')+'<div><b>'+fgEsc(title)+'</b>'+(sub?'<p>'+fgEsc(sub)+'</p>':'')+'</div>');ic(d.querySelector('canvas'),it,48);
    d.appendChild(btn('f2-b x','CLOSE',close,{id:'fuClose'}));sh.appendChild(d);sh.setAttribute('aria-label',title);};
  const acts=L=>{const r=el('div','acts');for(const[l,f,fl]of L)r.appendChild(btn('f2-b',l,()=>{F.sheet=null;act(f,fl);}));sh.appendChild(r);};
  const all=INV.items.call({f:'all',sort:INV.sort});
  if(k==='recipes'){head(null,'RECIPES',Object.keys(s.hy).length+' of '+FGR.length+' forged · ✓ forged · dashed = buy a weapon first');
    const lst=el('div','lst');sh.appendChild(lst);
    const R0=FGR.slice().sort((a,b)=>{const o=r=>(s.hy[r[2]]?2:WP.has(r[0])&&WP.has(r[1])?0:1);return o(a)-o(b);});
    for(const R of R0){const ok=WP.has(R[0])&&WP.has(R[1]),done=!!s.hy[R[2]];
      lst.appendChild(btn('f2-b'+(done?' ok':ok?'':' lock'),'<b>'+fgEsc(R[3].toUpperCase())+(done?' ✓':'')+'</b><br>'+fgEsc(WPD[R[0]].s+' + '+WPD[R[1]].s),()=>{
        if(!ok)return act(()=>'Buy '+[R[0],R[1]].filter(w=>!WP.has(w)).map(w=>WPD[w].s).join(' and ')+' first (HANGAR > WEAPONS)');
        U.a=R[0];U.b=R[1];U.arm=null;INV.sel=null;F.sheet=null;F.fl='a';act(()=>U.why()?'':R[3]+' on the bench: press MERGE');},{'aria-label':R[3]+': '+WPD[R[0]].s+' plus '+WPD[R[1]].s+(done?', forged':ok?'':', locked')}));}}
  else if(/^slot:/.test(k)){const v=k.slice(5),sl=v==='core'||v==='pas'?v:+v,q=INV.slotHtml(sl);head(q.it,q.sub,q.n+(q.it?' · '+(U.good(q.it)?'good vs '+U.good(q.it):''):''));
    const L=[];if(sl===0||sl===1){const n=FG.sockets(lo.w[sl]);
      for(let i=0;i<n;i++){const m=(lo.m[sl]||[])[i];if(m)L.push(['TAKE OUT '+FGM.find(x=>x[0]===m)[1],()=>FG.socket(sl,m)||'Mod taken out']);
        else L.push(['+ MOD',()=>{F.tab='m';INV.f='m';U.arm=sl;return'Tap a mod card for SLOT '+(sl+1);}]);}
      L.push(['PICK A WEAPON',()=>{F.tab='w';INV.f='w';U.arm=sl;return'Tap a weapon or hybrid card for SLOT '+(sl+1);}]);}
    else{if(q.it)L.push(['UNEQUIP',()=>FG.equip(sl,U.id(q.it))]);L.push(['PICK '+(sl==='core'?'A CORE':'A PASSIVE'),()=>{F.tab='m';INV.f='k';U.arm=sl;return'Tap a card for '+q.sub;}]);}
    acts(L);}
  else{const x=all.find(q=>q.it===k);if(!x){this.sheet=null;return;}const ty=x.ty,id=U.id(k),g=U.good(k),rec=U.recs().has(k);
    head(k,x.n,(ty==='h'?'hybrid LV'+x.lv:ty==='w'?'weapon LV'+x.lv:ty==='m'?'mod · owned x'+x.lv:ty==='k'?'ability core':'passive')+(U.equipped(k)?' · ON SHIP':''));
    sh.appendChild(el('p',null,fgEsc(x.d)));if(g)sh.appendChild(el('p','f2-gd','<span style="color:#5cecff">Good against: '+fgEsc(g)+'</span>'));
    if(rec)sh.appendChild(el('p',null,'<span style="color:#ffe14d">★ Good for STAGE '+U.stage()+'</span>'));
    const B=[];
    if(ty==='w')B.push(['TO FORGE A',()=>U.put('a',k),'a'],['TO FORGE B',()=>U.put('b',k),'b']);
    if(ty==='w'||ty==='h')B.push(['EQUIP SLOT 1',()=>{INV.sel=null;return U.put(0,k);},'s0'],['EQUIP SLOT 2',()=>{INV.sel=null;return U.put(1,k);},'s1']);
    if(ty==='h'){const lv=FG.hlv(id);if(lv<FG_MAXLV)B.push(['LEVEL UP: '+FG.lvCost(id)+' scrap',()=>FG.levelUp(id)||'Now LV'+FG.hlv(id)]);B.push(['SCRAP IT: +'+(1+lv)+' scrap',()=>{INV.sel=null;return FG.scrapIt('h',id)||'Scrapped';}]);}
    if(ty==='m'){if(x.own)B.push(['SOCKET SLOT 1',()=>FG.socket(0,id)||'Socketed in SLOT 1','s0'],['SOCKET SLOT 2',()=>FG.socket(1,id)||'Socketed in SLOT 2','s1'],['SELL: +30 Neon',()=>FG.scrapIt('m',id)]);B.push(['CRAFT: '+FG_MODC+' scrap',()=>FG.craft('m',id)||'Crafted']);}
    if(ty==='k'||ty==='p'){if(x.own)B.push([(ty==='k'?lo.core:lo.pas)===id?'UNEQUIP':'EQUIP',()=>FG.equip(ty==='k'?'core':'pas',id),ty==='k'?'score':'spas'],['SCRAP IT: +2 scrap',()=>{INV.sel=null;return FG.scrapIt(ty,id)||'Scrapped';}]);else B.push(['CRAFT: '+FG_CORC+' scrap',()=>FG.craft(ty,id)||'Crafted']);}
    acts(B);}
  box.appendChild(scr);const c=sh.querySelector('#fuClose');if(c)try{c.focus({preventScroll:true});}catch(e){}};
{const d0=INV.draw;INV.draw=function(box){if(!RET.forge2){box.classList.remove('f2');return d0.call(this,box);}return FG2.draw(box);};
 const g0=gaDraw;gaDraw=function(){const on=RET.forge2&&GA.tab==='forge';garageEl.classList.toggle('f2',on);if(!on){$('gaCards').classList.remove('f2');FG2.sheet=null;if(GA.tab)FG2.prev=GA.tab;}return g0.apply(this,arguments);};}
NR.on('runStart',()=>{FG2.sheet=null;});
window.__fg2=FG2;
