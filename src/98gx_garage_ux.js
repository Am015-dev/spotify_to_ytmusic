// ---- GX (garage UX). Alex: "the garage is quite unusable although it's in the correct direction; maybe more tiles; allow to group items to show and not show".
// Research: docs/research/BUILDER_2K_UX.md (2K Brick Drawer categories + favourite tabs, Group tool, Select up, mirror; eye/hide from Studio + Mecabricks).
// 1) PARTS palette: 2 rows of bigger tiles with names (scroll sideways), category chips plus ★ FAVS and 🕘 RECENT.
//    Long-press a tile (or right-click) to star it; the last 16 parts you picked are in RECENT. ▾ folds the palette back to one row.
// 2) GROUPS: select parts (SELECT, tap more parts) → MAKE GROUP gives a named group (Group 1, 2…; ✎ renames it). The ⛓ GROUPS list has an 👁 eye
//    per group (hide / show) plus SELECT, MOVE, COPY, MIRROR and DELETE for the whole group. Hidden parts can't be picked or edited, but they stay in the build and save.
// 3) HIDE ABOVE (layer column): the parts above the active layer disappear instead of showing as ghosts, so inner parts can be reached.
// Names live in localStorage mho_gxn per vehicle; palette favourites / recent / fold state in mho_gx. Only the builder view is affected: the car you drive is whole.
const GX={K:'mho_gx',KN:'mho_gxn',fav:[],rec:[],big:1,ha:0,cat:null,open:0,act:0,ren:0,hid:new Set(),hs:null,inR:0,lp:null,lpT:0};
try{const s=JSON.parse(localStorage.getItem(GX.K)||'{}');if(Array.isArray(s.fav))GX.fav=s.fav;if(Array.isArray(s.rec))GX.rec=s.rec;if(s.big===0)GX.big=0;if(s.ha)GX.ha=1}catch(e){}
const GX_save=()=>{try{localStorage.setItem(GX.K,JSON.stringify({fav:GX.fav,rec:GX.rec,big:GX.big,ha:GX.ha}))}catch(e){}};
const GX_phone=()=>innerWidth<=760||innerHeight<=500;
const GX_sid=()=>{try{return GAR_get().sel||'x'}catch(e){return'x'}};
function GX_names(){try{const a=JSON.parse(localStorage.getItem(GX.KN)||'{}');return a[GX_sid()]||{}}catch(e){return{}}}
function GX_setName(g,n){try{const a=JSON.parse(localStorage.getItem(GX.KN)||'{}'),k=GX_sid();a[k]=a[k]||{};if(n==null)delete a[k][g];else a[k][g]=String(n).slice(0,24);localStorage.setItem(GX.KN,JSON.stringify(a))}catch(e){}}
const GX_name=g=>GX_names()[g]||'Group '+g;
const GX_hidB=b=>!!(b&&b.g&&GX.hid.has(b.g));
// groups in the build: [{g,n,name}] in id order
function GX_groups(){const C=new Map();for(const b of GB_list())if(b.g)C.set(b.g,(C.get(b.g)||0)+1);return[...C.keys()].sort((a,b)=>a-b).map(g=>({g,n:C.get(g),name:GX_name(g)}))}
const GX_of=g=>GB_list().filter(b=>b.g===g);
const GX_newG=()=>1+Math.max(0,...GB_list().map(o=>o.g||0));
const GX_sfx=k=>{try{AU.sfx(k)}catch(e){}};
// ---------- hidden parts: the builder mesh skips them (while the builder rebuilds its own car only), so they can't be seen or picked
GB_brickGeo=(f=>function(b){if(GX.inR&&GB_.bk&&GX_hidB(b))return;return f.apply(this,arguments)})(GB_brickGeo);
GB_refresh=(f=>function(){GX.inR=1;let r;try{r=f.apply(this,arguments)}finally{GX.inR=0}GX_ui();return r})(GB_refresh);
// a selection never holds hidden parts
SL_set=(f=>function(list){return f.call(this,(list||[]).filter(b=>!GX_hidB(b)))})(SL_set);
// HIDE ABOVE: drop the see-through ghost of the layers above the active one
B25_look=(f=>function(){const r=f.apply(this,arguments);if(GX.ha&&B25.gh&&GB.mesh){const U=GB.mesh.userData;(U.carG||U.m).remove(B25.gh);B25.gh.geometry.dispose();B25.gh.material.dispose();B25.gh=null}return r})(B25_look);
B25_ui=(f=>function(){const r=f.apply(this,arguments);const E=$('#b25');if(E&&!E.hidden&&!E.querySelector('.gxHa')){const b=document.createElement('button');b.className='gxHa';
  b.addEventListener('click',e=>{e.stopPropagation();if(!B25.on)return;GX.ha=GX.ha?0:1;GX_save();B25_look();GX_sfx('pick');GS_tip(GX.ha?'Layers above hidden':'Layers above shown');B25_ui()});
  const dn=E.querySelector('[data-b25="dn"]');if(dn)dn.after(b);else E.appendChild(b)}
 const b=E&&E.querySelector('.gxHa');if(b){b.disabled=!B25.on;b.classList.toggle('on',!!GX.ha&&!!B25.on);b.innerHTML=GX.ha?'<i>◧</i>SHOW UP':'<i>◨</i>HIDE UP';b.title=GX.ha?'Show the layers above':'Hide the layers above the active layer'}return r})(B25_ui);
// ---------- palette: chips (★ FAVS, 🕘 RECENT, categories), 2 rows of named tiles, long-press = favourite
function GX_tiles(){return[...document.querySelectorAll('#gbBkPc .gbPc')]}
function GX_cat(c){const S=$('#gbBkPc');if(!S)return;if(c==='fav'||c==='rec'){GX.cat=c;const L=c==='fav'?GX.fav:GX.rec;for(const b of GX_tiles()){const i=L.indexOf(b.dataset.p);b.style.display=i<0?'none':'';b.style.order=i<0?'':i}
  try{GS_thumbs()}catch(e){}}else{GX.cat=null;for(const b of GX_tiles())b.style.order='';CR_cat(c)}S.scrollLeft=0;GX_pal()}
CR_cat=(f=>function(ct){GX.cat=null;for(const b of GX_tiles())b.style.order='';const r=f.apply(this,arguments);GX_pal();return r})(CR_cat);
function GX_star(p){const i=GX.fav.indexOf(p);if(i<0)GX.fav.unshift(p);else GX.fav.splice(i,1);GX_save();GX_sfx(i<0?'brick':'pick');
 const P=GB_PC[p];GS_tip(i<0?'★ '+(P?P.n:p)+' added to FAVS':'Removed from FAVS');if(GX.cat==='fav')GX_cat('fav');else GX_pal()}
function GX_recent(p){if(!GB_PC[p])return;const i=GX.rec.indexOf(p);if(i===0)return;if(i>0)GX.rec.splice(i,1);GX.rec.unshift(p);GX.rec.length=Math.min(GX.rec.length,16);GX_save()}
function GX_pal(){const P=$('#gbBkP'),S=$('#gbBkPc');if(!P||!S)return;let C=$('#gxCh');
 if(!C){C=document.createElement('div');C.id='gxCh';C.className='gbBkR';P.insertBefore(C,S);
  C.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();GX_sfx('pick');const k=b.dataset.gxc;
   if(k==='fold'){GX.big=GX.big?0:1;GX_save();GX_lay();return}GX_cat(k)});
  // long-press a tile = ★ favourite (touch and mouse); right-click too. The click after a long-press does not pick the part.
  const clr=()=>{clearTimeout(GX.lp);GX.lp=null};
  S.addEventListener('pointerdown',e=>{const b=e.target.closest('.gbPc');if(!b)return;clr();const x=e.clientX,y=e.clientY;GX.lpXY=[x,y];GX.lp=setTimeout(()=>{GX.lp=null;GX.lpT=performance.now();GX.lpP=b.dataset.p;GX_star(b.dataset.p)},550)});
  S.addEventListener('pointermove',e=>{if(GX.lp&&GX.lpXY&&Math.hypot(e.clientX-GX.lpXY[0],e.clientY-GX.lpXY[1])>10)clr()});
  for(const k of['pointerup','pointercancel','pointerleave'])S.addEventListener(k,clr);S.addEventListener('scroll',clr,{passive:true});
  S.addEventListener('contextmenu',e=>{const b=e.target.closest('.gbPc');if(!b||!GB_.bk)return;e.preventDefault();GX_star(b.dataset.p)});
  S.addEventListener('click',e=>{const b=e.target.closest('.gbPc');if(!b)return;const lp=GX.lpP===b.dataset.p&&performance.now()-GX.lpT<900;GX.lpP=null;if(lp){e.stopPropagation();e.preventDefault();return}GX_recent(b.dataset.p);setTimeout(GX_pal,0)},true);
  for(const b of GX_tiles())b.dataset.n=(GB_PC[b.dataset.p]||{}).n||b.dataset.p}
 const cur=GX.cat||GB_.ct||'Bricks',chip=(k,t)=>`<button class="gxC ${cur===k?'on':''}" data-gxc="${k}">${t}</button>`;
 const h=`<button class="gxC gxF" data-gxc="fold" title="${GX.big?'Smaller palette':'Bigger palette'}">${GX.big?'▾':'▴'}</button>`+chip('fav','★ FAVS')+chip('rec','🕘 RECENT')+CR_CATS.map(c=>chip(c,c.toUpperCase())).join('');
 if(C._h!==h){C._h=h;C.innerHTML=h}
 for(const b of GX_tiles()){const f=GX.fav.includes(b.dataset.p);b.classList.toggle('gxSt',f)}
 let em=S.querySelector('.gxEm');const empty=(GX.cat==='fav'&&!GX.fav.length)||(GX.cat==='rec'&&!GX.rec.length);
 if(empty&&!em){em=document.createElement('div');em.className='gxEm';S.appendChild(em)}if(em){em.hidden=!empty;em.textContent=GX.cat==='fav'?'Long-press a part to ★ it':'Parts you pick show up here'}}
// ---------- groups panel
function GX_grpBtn(){const z=$('#gbBkP .r2BkT');if(z&&!z.querySelector('[data-gx="grp"]')){const b=document.createElement('button');b.className='r2T';b.dataset.gx='grp';b.innerHTML='<i>⛓</i>GROUPS';
  b.addEventListener('click',e=>{e.stopPropagation();GX_sfx('pick');GX.open=GX.open?0:1;GX.ren=0;if(GX.open){try{R2_pop(null)}catch(_){}if(GS.held)GS_drop()}else GX.act=0;GX_ui()});
  const m=z.querySelector('[data-r2b="more"]');z.insertBefore(b,m||null)}}
function GX_panel(){let E=$('#gxG');if(E)return E;E=document.createElement('div');E.id='gxG';$('#gbx').appendChild(E);E.addEventListener('pointerdown',e=>e.stopPropagation());
 E.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();const a=b.dataset.ga,g=+(b.closest('[data-g]')||{dataset:{}}).dataset.g||0;GX_do(a,g,b)});
 E.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();GX_do('ok',GX.ren)}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();GX.ren=0;GX_ui()}e.stopPropagation()});return E}
function GX_selG(g){GB_.tool='sel';SL_set(GX_of(g));GX.act=g;try{R2_bkSync()}catch(e){}}
function GX_do(a,g,btn){GX_sfx('pick');
 if(a==='close'){GX.open=0;GX.act=0;GX.ren=0;GX_ui();return}
 if(a==='all'){GX.hid.clear();GB_refresh();GS_tip('All parts shown');return}
 if(a==='mk'){if(SL.sel.length<1){GS_tip('SELECT parts first, then MAKE GROUP');return}GX_make();return}
 if(a==='eye'){if(GX.hid.has(g)){GX.hid.delete(g);GS_tip(GX_name(g)+' shown')}else{GX.hid.add(g);if(GX.act===g)GX.act=0;SL_set(SL.sel);GS_tip(GX_name(g)+' hidden · it still saves')}GB_refresh();return}
 if(!g)return;
 if(GX.hid.has(g)&&a!=='ok'&&a!=='ren'){GS_tip('Hidden · tap 👁 to show it first');GX_sfx('bump');return}
 if(a==='pick'){if(GX.act===g){GX.act=0;SL_set([])}else GX_selG(g);GX_ui();return}
 if(a==='ren'){GX.ren=g;GX_ui();const i=$('#gxG input');if(i){i.focus();i.select()}return}
 if(a==='ok'){const i=$('#gxG input');const v=i&&i.value.trim();if(v)GX_setName(g,v);GX.ren=0;GX_ui();return}
 if(a==='mv'||a==='dup'){GX_selG(g);GX.open=1;const nm=GX_name(g);SL_lift(a==='dup'?1:0);if(a==='dup'&&SL.carry)SL.carry.gxN=nm+' copy';GX_ui();return}
 if(a==='mir'){GX_mirror(g);return}
 if(a==='del'){const nm=GX_name(g);GX_selG(g);SL_delete();GX_setName(g,null);GX.act=0;GS_tip(nm+' deleted · UNDO brings it back');GX_ui();return}}
// MAKE GROUP from the selection (the existing GROUP tool, with a name and the list)
function GX_make(){const S=SL.sel.slice();if(!S.length)return 0;const g0=S[0].g;if(g0&&S.every(o=>o.g===g0)){GX.open=1;GX.act=g0;GX_ui();return g0}
 GB_snap();const g=GX_newG();for(const o of S)o.g=g;const n=GX_groups().length;GX_setName(g,'Group '+n);GX.open=1;GX.act=g;SL_set(S);GX_sfx('brick');GS_tip('Group '+n+' made · '+S.length+' parts');GX_ui();return g}
// MIRROR a group: a mirrored copy on the other side; a group across the middle is flipped in place
function GX_mirror(g){const L=GB_list(),G=GX_of(g),T=G.map(b=>({...GB_twin(b),g}));if(!G.length)return 0;
 const ovl=(a,b)=>SL_ov(a,b)&&a.y<b.y+SL_h(b)&&a.y+SL_h(a)>b.y;const self=T.some(w=>G.some(o=>ovl(w,o)));
 const rest=L.filter(b=>b.g!==g),clash=T.some(w=>SL_clash(w,self?rest:L));
 if(clash){GX_sfx('bump');GS_tip('No room on the other side');return 0}
 if(!self&&L.length+T.length>GB_MAX){GB_msg('Brick budget full · '+GB_MAX);GX_sfx('bump');return 0}
 GB_snap();if(self){G.forEach((b,i)=>{b.x=T[i].x;b.r=T[i].r;b.m=T[i].m});GB_refresh();GX_selG(g);GS_tip(GX_name(g)+' flipped')}
 else{const ng=GX_newG();for(const w of T){w.g=ng;L.push(w)}GX_setName(ng,GX_name(g)+' ⇋');GB_refresh();GX_selG(ng);GS_tip('Mirrored copy · '+GX_name(ng))}
 GX_sfx('brick');GX_ui();return 1}
// a COPY placed from the groups list becomes its own named group
SL_place=(f=>function(){const C=SL.carry,r=f.apply(this,arguments);if(r&&C&&C.gxN){const g=GX_newG();for(const b of SL.sel)b.g=g;GX_setName(g,C.gxN);GX.act=g;GS_tip(C.gxN+' placed')}GX_ui();return r})(SL_place);
SL_cancel=(f=>function(){const r=f.apply(this,arguments);GX_ui();return r})(SL_cancel);
// the GROUP button of the selection bar is MAKE GROUP (UNGROUP when the selection is one group)
SL_group=(f=>function(){const S=SL.sel,g0=S.length&&S[0].g;if(S.length&&!(g0&&S.every(o=>o.g===g0)))return GX_make();const r=f.apply(this,arguments);if(g0)GX_setName(g0,null);GX.act=0;GX_ui();return r})(SL_group);
const GX_esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function GX_ui(){const X=$('#gbx');if(!X||!GB_.bk||X.hidden){const E=$('#gxG');if(E)E.hidden=true;if(X)X.classList.remove('gxGO','gxBig');return}
 GX_pal();GX_grpBtn();GX_lay();const E=GX_panel(),gb=$('#gbBkP [data-gx="grp"]');if(gb)gb.classList.toggle('on',!!GX.open);
 const carry=typeof SL!=='undefined'&&SL.carry,show=GX.open&&!carry&&!GS.held;E.hidden=!show;X.classList.toggle('gxGO',!!show);if(!show)return;
 const G=GX_groups();if(GX.act&&!G.some(o=>o.g===GX.act))GX.act=0;if(GX.ren&&!G.some(o=>o.g===GX.ren))GX.ren=0;
 const hidN=G.filter(o=>GX.hid.has(o.g)).length,g0=SL.sel.length&&SL.sel[0].g,one=g0&&SL.sel.every(o=>o.g===g0),ns=one?0:SL.sel.length;
 let h=`<div class="gxH"><b>⛓ GROUPS · ${G.length}</b><button data-ga="close" title="Close">✕</button></div>`+
  `<div class="gxTop"><button data-ga="mk" class="${ns?'go':''}">＋ MAKE GROUP${ns?' ('+ns+')':''}</button>${hidN?`<button data-ga="all">👁 SHOW ALL</button>`:''}</div>`;
 if(!G.length)h+=`<p class="gxNo">No groups yet. Tap ☝ SELECT, tap the parts you want, then ＋ MAKE GROUP.</p>`;
 h+='<div class="gxL">'+G.map(o=>{const hd=GX.hid.has(o.g),on=GX.act===o.g;
  const nm=GX.ren===o.g?`<input maxlength="24" value="${GX_esc(o.name)}" aria-label="Group name"><button data-ga="ok" class="gxOk">✔</button>`:
   `<button data-ga="pick" class="gxN">${GX_esc(o.name)}<small>${o.n} parts${hd?' · hidden':''}</small></button><button data-ga="ren" title="Rename">✎</button>`;
  return`<div class="gxR ${hd?'hd':''} ${on?'on':''}" data-g="${o.g}"><button data-ga="eye" class="gxE" title="${hd?'Show':'Hide'}">${hd?'🚫':'👁'}</button>${nm}</div>`+
   (on&&!hd?`<div class="gxA" data-g="${o.g}"><button data-ga="mv"><i>✥</i>MOVE</button><button data-ga="dup"><i>⧉</i>COPY</button><button data-ga="mir"><i>⇋</i>MIRROR</button><button data-ga="del" class="gxD"><i>🗑</i>DELETE</button></div>`:'')}).join('')+'</div>';
 if(E._h!==h){const ae=document.activeElement,keep=ae&&ae.tagName==='INPUT'&&E.contains(ae)?ae.value:null;E._h=h;E.innerHTML=h;if(keep!=null){const i=E.querySelector('input');if(i){i.value=keep;i.focus()}}const A=E.querySelector('.gxA')||E.querySelector('.gxR.on');if(A&&A.scrollIntoView)try{A.scrollIntoView({block:'nearest'})}catch(_){}}}
// fold / unfold the big palette (the groups list folds it: less on screen)
function GX_lay(){const X=$('#gbx');if(!X)return;const big=!!GX.big&&GB_.bk&&!GX.open;if(X.classList.contains('gxBig')!==big){X.classList.toggle('gxBig',big);try{R2.area=null}catch(e){}}}
R2_calc=(f=>function(){const A=f.apply(this,arguments),c=$('#gbC'),C=$('#gxCh'),E=$('#gxG');if(!A||!c||!GB_.bk)return A;const r=c.getBoundingClientRect();
 if(C&&C.offsetParent&&$('#gbx').classList.contains('gxBig')){const y=C.getBoundingClientRect().top-r.top-4;if(y>A.t+60)A.b=Math.min(A.b,y)}
 if(E&&!E.hidden&&E.offsetParent){const x=E.getBoundingClientRect().right-r.left+6;if(A.r-x>160)A.l=Math.max(A.l,x)}return A})(R2_calc);
GB_ui=(f=>function(){const r=f.apply(this,arguments);GX_ui();return r})(GB_ui);
GS_ui=(f=>function(){const r=f.apply(this,arguments);GX_ui();return r})(GS_ui);
GB_enter=(f=>function(){const was=GB_.bk;if(!was&&GX.hs!==GX_sid()){GX.hid.clear();GX.hs=GX_sid()}GX.act=0;GX.ren=0;const r=f.apply(this,arguments);GX_ui();return r})(GB_enter);
// leaving the builder: the car is whole again (hidden groups only hide in the builder)
GB_exit=(f=>function(){const was=GB_.bk,r=f.apply(this,arguments);if(was){GX.open=0;GX.act=0;GX_ui();if(GX.hid.size&&GB.mesh&&GB.d)try{GB_refresh()}catch(e){}}return r})(GB_exit);
addEventListener('keydown',e=>{if(!GB_.bk||$('#gbx').hidden||e.ctrlKey||e.metaKey||e.altKey||(e.target&&e.target.tagName==='INPUT'))return;if(e.code==='KeyG'){GX.open=GX.open?0:1;GX_ui();e.preventDefault()}},true);
{const st=document.createElement('style');st.textContent=`
#gxCh{display:none}#gbx.r2.gbBk.gxBig #gxCh,#gbx.r2.gbBk #gxCh{display:flex;align-items:center}
#gxCh .gxC{flex:none;height:44px;padding:0 12px;border-radius:12px;border:2px solid #141413;background:#fff;color:#141413;font:italic 900 12px system-ui;white-space:nowrap;box-shadow:0 2px 0 #141413;cursor:pointer}
#gxCh .gxC.on{background:#ffd400}#gxCh .gxF{width:44px;padding:0;font-size:16px;font-style:normal}
#gbx.r2.gbBk.gxBig #gbBkP .r2Cat{display:none}
#gbx.r2.gbBk:not(.gxBig) #gxCh{flex:none;height:100%;overflow:visible}#gbx.r2.gbBk:not(.gxBig) #gxCh .gxC:not(.gxF){display:none}#gbx.r2.gbBk.gxGO #gxCh{display:none!important}
#gbx.r2.gbBk.gxBig #gbBkP{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:44px auto;row-gap:5px;height:auto;right:68px;align-items:center}
#gbx.r2.gbBk.gxBig #gxCh{grid-row:1;grid-column:1;min-width:0;height:48px}#gbx.r2.gbBk.gxBig .r2BkT{grid-row:1;grid-column:2}
#gbx.r2.gbBk.gxBig #gbBkPc{grid-row:2;grid-column:1/3;display:grid;grid-auto-flow:column;grid-template-rows:repeat(2,58px);grid-auto-columns:72px;gap:5px;height:auto;overflow-x:auto;overflow-y:hidden;padding:2px 2px 4px;justify-content:start;align-items:stretch}
#gbx.r2.gbBk.gxBig #gbBkPc .gbPc{width:72px;height:58px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:0}
#gbx.r2.gbBk.gxBig #gbBkPc .gbPc.gsTh img{width:50px;height:36px}
#gbx.r2.gbBk.gxBig #gbBkPc .gbPc::after{content:attr(data-n);display:block;max-width:66px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:900 12px system-ui;line-height:14px;color:#141413}
#gbx.r2 #gbBkPc .gbPc{position:relative;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
#gbx.r2 #gbBkPc .gbPc.gxSt::before{content:'★';position:absolute;top:1px;right:3px;font:900 13px system-ui;color:#e8a400;text-shadow:0 0 2px #fff;line-height:1}
#gbx.r2 #gbBkPc .gxEm{grid-row:1/3;align-self:center;font:900 12px system-ui;color:#fff;background:rgba(20,20,19,.7);border-radius:10px;padding:10px 12px;white-space:nowrap}#gbx.r2 #gbBkPc .gxEm[hidden]{display:none}
#gbx.r2.gbBk:not(.gxBig) #gbBkPc .gxEm{padding:6px 10px}
#gbx.r2 #gbBkP [data-gx="grp"].on{background:#ffd400}
#gbx.r2.gbBk.gxBig .r2BkT{gap:4px}#gbx.r2.gbBk.gxBig .r2BkT .r2T{flex-direction:column;justify-content:center;width:60px;height:46px;padding:0;gap:1px;font-size:12px;line-height:1}#gbx.r2.gbBk.gxBig .r2BkT .r2T i{margin:0}
#gbx.r2 .r2BkT .r2T{white-space:nowrap}
#gxG{position:absolute;left:calc(var(--r2rw,72px) + 6px);top:calc(var(--r2hh,52px) + 6px);bottom:calc(var(--r2ch,56px) + 14px);width:270px;z-index:5;display:flex;flex-direction:column;gap:5px;
 background:rgba(22,38,86,.94);border:2px solid #141413;border-radius:14px;padding:6px;box-shadow:0 4px 0 rgba(0,0,0,.35);color:#fff;font:900 12px system-ui}
#gxG[hidden]{display:none}#gxG button{min-height:44px;border-radius:10px;border:2px solid #141413;background:#fff;color:#141413;font:italic 900 12px system-ui;cursor:pointer;box-shadow:0 2px 0 #141413}
#gxG .gxH{display:flex;align-items:center;justify-content:space-between;gap:6px;padding-left:4px}#gxG .gxH b{font-size:13px;letter-spacing:.02em}#gxG .gxH button{width:44px}
#gxG .gxTop{display:flex;gap:5px;flex:none}#gxG .gxTop button{flex:1;height:44px}#gxG .gxH{flex:none}#gxG .gxTop .go{background:#7dff8a}
#gxG .gxNo{margin:2px 4px;font-weight:700;line-height:1.35;color:#dfe8ff}
#gxG .gxL{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:5px;scrollbar-width:thin}
#gxG .gxR{display:flex;gap:5px;align-items:stretch}#gxG .gxR .gxE{width:44px;flex:none;font-size:17px;font-style:normal}#gxG .gxR [data-ga="ren"],#gxG .gxR .gxOk{width:44px;flex:none;font-size:15px;font-style:normal}
#gxG .gxR .gxN{flex:1;min-width:0;text-align:left;padding:2px 8px;display:flex;flex-direction:column;justify-content:center;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
#gxG .gxR .gxN small{font:700 12px system-ui;color:#4a5468}#gxG .gxR.on .gxN{background:#ffd400}#gxG .gxR.hd .gxN{background:#c9ced8;color:#555}#gxG .gxR.hd .gxE{background:#c9ced8}
#gxG .gxR input{flex:1;min-width:0;height:44px;border-radius:10px;border:2px solid #141413;padding:0 8px;font:900 14px system-ui;color:#141413}
#gxG .gxA{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:0 0 4px}#gxG .gxA button{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0;gap:1px;font-size:12px}
#gxG .gxA button i{font-style:normal;font-size:14px}#gxG .gxA .gxD{background:#ff8a8a}
#gbx.r2.gxGO #slBar{display:none!important}
#b25{pointer-events:none}#b25 button,#b25 em,#b25 .b25V{pointer-events:auto}#b25 .b25V{pointer-events:none}#b25 .b25V button{pointer-events:auto}
#b25 .gxHa{height:44px;min-width:56px;font-size:12px}#b25 .gxHa.on{background:#ffd12c}
@media (max-width:760px),(max-height:500px){#gbx.r2 .r2BkT{gap:4px}#gbx.r2 .r2BkT .r2T{padding:0 7px}#gxG{width:258px}}
@media (min-height:501px) and (min-width:900px){#gbx.r2.gbBk.gxBig #gbBkPc{grid-template-rows:repeat(2,70px);grid-auto-columns:86px}#gbx.r2.gbBk.gxBig #gbBkPc .gbPc{width:86px;height:70px}#gbx.r2.gbBk.gxBig #gbBkPc .gbPc.gsTh img{width:62px;height:44px}#gxG{width:320px}}`;document.head.appendChild(st)}
window.__gx={S:GX,groups:()=>GX_groups(),hid:()=>[...GX.hid],make:()=>GX_make(),mirror:g=>GX_mirror(g),star:p=>GX_star(p),cat:c=>GX_cat(c),
 vis:()=>{const s=$('#gbBkPc');if(!s)return null;const r=s.getBoundingClientRect();return GX_tiles().filter(b=>{if(b.style.display==='none')return false;const q=b.getBoundingClientRect();return q.width>0&&q.left>=r.left-1&&q.right<=r.right+1&&q.bottom<=r.bottom+1}).map(b=>b.dataset.p)},
 cat:k=>GB_PC[k]&&GB_PC[k].cat,ev:c=>__g9ev(c),
 cand:()=>{const t0=GB_.tool;GB_.tool='sel';try{return __gx._cand()}finally{GB_.tool=t0}},
 _cand:()=>{const L=GB_list(),out=[],C=$('#gbC').getBoundingClientRect(),H=b=>b.y+GB_PC[b.t].h;for(const b of L.slice().sort((a,c)=>H(c)-H(a))){const[w,d]=GB_dims(b),q=__b25.scr(b.x+w/2,b.z+d/2,H(b));
  const el=document.elementFromPoint(q.x,q.y);if(!el||(el.closest&&el.closest('#gbBkP,#b25,#r2H,#r2R,#gxG,#slBar,#gsBar,#gsTip,#odPin')))continue;const i=__sl.pick(q.x,q.y);if(i>=0&&!out.some(o=>o.i===i))out.push({i,x:q.x,y:q.y,t:b.t});if(out.length>=6)break}return out},
 tris:()=>{const U=GB.mesh&&GB.mesh.userData;let n=0;for(const o of(U&&U.gbM)||[])if(o.geometry&&o.geometry.attributes.position)n+=o.geometry.attributes.position.count/3;return n|0}};
SL_ui=(f=>function(){const r=f.apply(this,arguments);const s=$('#slBar [data-s="grp"] span');if(s&&s.textContent==='GROUP')s.textContent='MAKE GROUP';return r})(SL_ui);
// ---- CLEAR (Alex, v88i: "the garage clear button on build is not clearing to an empty template or the base is showing weird overlaps").
// Root cause: CLEAR emptied the brick list but kept the old base scan (GB_.base: stud grid + layer heights of the cleared body) and the old
// chassis mode. A brick car (templates, big templates, My Build) lost its frame and wheels, so the builder fell back to the small 8×12
// blueprint plate under a grid that still had the cleared body's heights: dots and the layer grid floated above an empty plate.
// Now CLEAR keeps ONE clean chassis: the frame plates, tyres, seat/driver and steering wheel of the current build (same rule as NEW BUILD),
// at the build's own length, then rescans the base. A hull car (bricks only decorate a fixed body) clears to its bare body as before,
// with a fresh scan. UNDO restores everything.
function GB_clear(){if(!GB.d)return;const L=GB_list(),brick=L.some(CR_isW);GB_snap();try{if(SL.carry)SL_cancel();SL_set([])}catch(e){}if(GS.held)try{GS_drop()}catch(e){}
 GB.d.bricks=brick?L.filter(GNB_fr).map(b=>{const o={...b};delete o.g;return o}):[];GX.hid.clear();
 GB_scanBase();GB_gridMesh();GB_refresh();GB_ui();try{GS_tip(brick?'Cleared · chassis and wheels kept · UNDO brings it back':'Cleared · UNDO brings it back')}catch(e){}return GB.d.bricks.length}
