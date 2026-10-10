// ===== FB (garage-17, Alex 2026-10-10: "the build guide and build does not work for the boats and off road").
// Root cause: BUILD and the BUILD GUIDE only ever edit GB.d.bricks = the street car of the selected set. OFF-ROAD / WATER rides come straight from
// S.off() / S.boat() (no edit path), their RIDES cards got no ✎ BUILD / ▶ GUIDE, and the BUILD tab on the WATER/OFF-ROAD tab opened the street car.
// Fix: a form session. Entering BUILD or the guide for an off-road / water ride swaps GB.d.bricks to that form's bricks (saved edits or the preset),
// and leaving BUILD / the guide / the garage saves them to mho_gar.fb['<set>|off|boat'] and puts the street car back. S.off / S.boat return the edits,
// so the drive, the cards and the guide all use them. The street car's mho_build is never written while a form is open.
const FB={s:null,keep:0,no:0};
const FB_K=(id,f)=>id+'|'+f;
// S.off / S.boat → saved edits first (each set wrapped once; a shared preset function is unwrapped first so one set's edits never leak to another)
function FB_wrap(){for(const S of GAR_SETS)for(const f of['off','boat']){const fn=S[f];if(typeof fn!=='function'||fn.fbId===S.id)continue;const o=fn.fbO||fn;
 const w=function(){const e=(GAR_get().fb||{})[FB_K(S.id,f)];return e&&e.length?e.map(b=>({...b})):o.apply(this,arguments)};w.fbO=o;w.fbId=S.id;S[f]=w}}
FB_wrap();
const FB_pre=(S,f)=>{FB_wrap();const fn=S[f];return GAR_arr((fn.fbO||fn)())};
const FB_cur=(S,f)=>{FB_wrap();return GAR_arr(S[f]()).map(b=>({...b}))};
const FB_form=()=>GAR_.pv==='4x4'?'off':GAR_.pv==='boat'?'boat':null;
function FB_drop(){for(const k in CR_VC)if(k.indexOf('gar|')===0)delete CR_VC[k];try{for(const k of[...G9C.th.keys()])if(!/\|car\|/.test(k))G9C.th.delete(k)}catch(e){}}
// start editing a form (S = the set, f = 'off' | 'boat')
function FB_begin(S,f){if(!GB.d||!S||!S[f])return 0;if(FB.s)FB_end(1);const d=GB.d;
 FB.s={id:S.id,f,car:d.bricks||[],bp:d.bp,pv:GAR_.pv,dist:GB_.dist};d.bricks=FB_cur(S,f);d.bp=1;GAR_.pv='car';
 if(!$('#gbx').hidden)gbRender();FB_tag();try{R2_hdr()}catch(e){}return 1}
// save the form's bricks (only when they differ from the preset; an empty form falls back to the preset)
function FB_save(){const s=FB.s;if(!s||!GB.d)return;const S=GAR_set(s.id),B=JSON.parse(JSON.stringify(GB.d.bricks||[])),G=GAR_get(),F=G.fb=G.fb||{},k=FB_K(s.id,s.f),
 same=B.length===0||JSON.stringify(B)===JSON.stringify(FB_pre(S,s.f));if(same){if(!F[k])return;delete F[k]}else{if(JSON.stringify(F[k]||0)===JSON.stringify(B))return;F[k]=B}GAR_put(G);FB_drop()}
function FB_end(noR){const s=FB.s;if(!s)return;FB_save();FB.s=null;const d=GB.d;if(d){d.bricks=s.car;d.bp=s.bp;store.set('mho_build',d)}GAR_.pv=s.pv;GB_.dist=s.dist;
 try{if(pl&&pl.mesh&&pl.mesh.userData.gbV){CR_attachV(pl.mesh,null);CR_vis(pl,pl.mesh.userData)}}catch(e){}FB_tag();try{R2_hdr()}catch(e){}if(!noR&&!$('#gbx').hidden&&!GB_.bk)gbRender()}
// a small label in BUILD / the guide: which ride is being edited
function FB_tag(){let t=$('#fbTag');const s=FB.s;if(!s){if(t)t.hidden=true;return}if(!t){t=document.createElement('div');t.id='fbTag';$('#gbx').appendChild(t)}
 const S=GAR_set(s.id);t.textContent=(s.f==='boat'?'🚤 WATER · ':'🛻 OFF-ROAD · ')+G9C_name(S,s.f);t.hidden=false}
// the street car's save slot is never written while a form is open (autosave goes to the form instead)
store.set=(f=>function(k,v){if(k==='mho_build'&&FB.s){FB_save();return}return f.apply(this,arguments)})(store.set);
GAR_select=(f=>function(){if(FB.s)FB_end(1);return f.apply(this,arguments)})(GAR_select);
GAR_frm=(f=>function(){FB_wrap();return f.apply(this,arguments)})(GAR_frm);
// BUILD YOUR OWN (bare chassis) and MY PARTS always mean the street car
GNB_new=(f=>function(){FB.no=1;try{return f.apply(this,arguments)}finally{FB.no=0}})(GNB_new);
PA_enter=(f=>function(){FB.no=1;try{return f.apply(this,arguments)}finally{FB.no=0}})(PA_enter);
// BUILD on the OFF-ROAD / WATER tab edits the equipped off-road / water ride (not the street car)
GB_enter=(f=>function(){if(!FB.s&&!GB_.bk&&!FB.no){const fm=FB_form();if(fm)FB_begin(GAR_frm(fm),fm)}const r=f.apply(this,arguments);FB_tag();return r})(GB_enter);
GB_exit=(f=>function(){const r=f.apply(this,arguments);if(!FB.keep&&!GB_.bk&&!SB.on)FB_end();return r})(GB_exit);
SB_open=(f=>function(from){if(!FB.s&&!GB_.bk){const fm=FB_form();if(fm)FB_begin(GAR_frm(fm),fm)}FB.keep=1;try{return f.apply(this,arguments)}finally{FB.keep=0;FB_tag()}})(SB_open);
SB_close=(f=>function(){const r=f.apply(this,arguments);if(!GB_.bk&&!SB.on)FB_end();return r})(SB_close);
gbClose=(f=>function(){if(FB.s){if(GB_.bk){FB.keep=1;try{GB_exit()}finally{FB.keep=0}}FB_end(1)}return f.apply(this,arguments)})(gbClose);
// build grid for a form: every cell the ride covers (wheels excluded), at its lowest brick (boat hulls sit below the street car's plate line),
// so LAYER mode starts on the ride's own deck instead of the floor between the wheels
GB_scanBase=(f=>function(){const r=f.apply(this,arguments);if(!FB.s||!GB.d)return r;const L=GB_list().filter(b=>!CR_WH[b.t]);if(!L.length)return r;let y0=1e9;for(const b of L)y0=Math.min(y0,b.y);
 const B={};for(const b of L){const[fw,fd]=GB_dims(b);for(let i=Math.max(GB_N0,b.x);i<=Math.min(GB_N1,b.x+fw-1);i++)for(let j=Math.max(GB_Z0,b.z);j<=Math.min(GB_Z1,b.z+fd-1);j++)B[i+','+j]=Math.floor(y0)}
 if(Object.keys(B).length)GB_.base=B;return r})(GB_scanBase);
// names: the garage header and the guide title show the ride being edited (not the street car)
const FB_nm=()=>FB.s&&G9C_name(GAR_set(FB.s.id),FB.s.f);
R2_hdr=(f=>function(){const r=f.apply(this,arguments);const n=FB_nm(),e=$('#r2Name');if(n&&e)e.textContent=n;return r})(R2_hdr);
SB_ui=(f=>function(){const r=f.apply(this,arguments);const n=FB_nm(),e=$('#sbG .sbNm');if(n&&e)e.textContent=n;return r})(SB_ui);
// no bare street chassis plate under a boat / off-road ride
GB_attach=(f=>function(g,bricks,fig,cache,bp){const r=f.apply(this,arguments);if(FB.s&&bp&&g===GB.mesh&&!(bricks||[]).some(CR_isW)){const U=g.userData,o=U.gbM&&U.gbM[0];
 if(o&&o.userData.gb&&!o.userData.gbc&&o.material===GB_MAT){(U.carG||U.m).remove(o);U.gbM.shift()}}return r})(GB_attach);
// RIDES cards: ✎ BUILD + ▶ GUIDE on owned OFF-ROAD / WATER cards too
GAR_tab=(f=>function(){FB_wrap();f();try{const C=$('#g9Col'),fm=G9C.type;if(!C||fm==='car')return;for(const c of C.querySelectorAll('.g9Card:not(.lock)')){if(c.querySelector('[data-fbb]'))continue;
  c.insertAdjacentHTML('beforeend',`<button class="g9Ed" data-fbb="${c.dataset.gc}">✎ BUILD</button><button class="g9Ed sbGo" data-fbg="${c.dataset.gc}">▶ GUIDE</button>`)}
 if(C.dataset.fb)return;C.dataset.fb=1;C.addEventListener('click',e=>{const t=e.target.closest('[data-fbb],[data-fbg]');if(!t)return;e.stopPropagation();const fm=G9C.type;if(fm==='car')return;
  const S=GAR_set(t.dataset.fbb||t.dataset.fbg);if(!G9C_equip(S,fm))return;GAR_.pv=fm==='off'?'4x4':'boat';FB_begin(S,fm);if(t.dataset.fbb)GB_enter();else SB_open('rides')})}catch(e){console.warn('FB',e)}})(GAR_tab);
{const st=document.createElement('style');st.textContent=`#fbTag{position:absolute;left:50%;top:58px;transform:translateX(-50%);z-index:30;pointer-events:none;padding:4px 12px;border-radius:10px;background:#141413;color:#ffd400;font:900 12px system-ui;white-space:nowrap}
#gbx:not(.gbBk):not(.sbOn) #fbTag{display:none}#gbx.sbOn #fbTag{top:52px}`;document.head.appendChild(st)}
window.__fb={st:()=>FB.s&&{id:FB.s.id,f:FB.s.f,n:GB_list().length},saved:()=>Object.keys(GAR_get().fb||{}),begin:(id,f)=>FB_begin(GAR_set(id),f),end:()=>FB_end(),
 cur:(id,f)=>FB_cur(GAR_set(id),f).length,pre:(id,f)=>FB_pre(GAR_set(id),f).length};
