// ---- LDM runner (v89z: lazy per-model loading). models.js is now a small INDEX (tools/ld/mkmodels.py): the presets + placements of every data module
// (window.__LDQ, run here at boot) and window.__LDX (chunk urls, mesh key -> chunk, preset -> models). The meshes + brick lists of each model live in
// models/<id>.js and load on demand: a ride when it is selected/equipped or its thumbnail is drawn, world props when their city builds, and at boot
// (models.js document.write) whatever the saved garage needs, so saved rides still build at boot. A chunk calls __LDC -> __LDD -> LD_ingest.
const LDL={X:window.__LDX||{c:{},k:{},s:{}},got:new Set(),wait:new Map(),miss:null,rd:0};
function LD_redraw(){try{if(GB&&GB.d&&!$('#gbx').hidden)gbRender()}catch(e){console.warn('LDM redraw',e)}}
function LD_done(){if(LDL.rd&&!LDL.wait.size){LDL.rd=0;setTimeout(LD_redraw,0)}}
function LD_ingest(id){const D=(window.__LDD||{})[id];if(!D||LDL.got.has(id))return;Object.assign(LD_MESH,D[0]);Object.assign(LD_MODELS,D[1]);LDL.got.add(id);LDW_reg();
 window.__ldm.models=Object.keys(LD_MODELS).length;const w=LDL.wait.get(id);if(w){LDL.wait.delete(id);w.r()}LD_done()}
function LD_load(id){if(LDL.got.has(id)||!LDL.X.c[id]||LDL.bad.has(id))return Promise.resolve();let w=LDL.wait.get(id);if(w)return w.p;w={};w.p=new Promise(r=>{w.r=r});LDL.wait.set(id,w);
 FST_js(LDL.X.c[id].f).then(ok=>{if(ok)return;console.warn('LDM load',id);LDL.bad.add(id);LDL.wait.delete(id);w.r();LD_done()});return w.p}
function LD_need(ids){return Promise.all([...new Set(ids)].map(LD_load))}// ids = model ids (= chunk ids)
// chunks a brick list needs (saved rides name mesh keys like 'ld3037' or 'ld60614@020')
function LD_brMiss(B){const m=[];for(const b of B||[]){const t=b&&(b.t||b[0]);if(typeof t!=='string'||t.slice(0,2)!=='ld')continue;const k=t.split('@')[0],c=LDL.X.k[k];if(c&&!LD_MESH[k])m.push(c)}return m}
// run fn and return the chunks it asked LD_br for that are not loaded yet (fn's brick list is scanned too)
function LD_probe(fn){const p=LDL.miss;LDL.miss=new Set();let B=null;try{B=fn()}catch(e){}const m=[...LDL.miss].concat(Array.isArray(B)?LD_brMiss(B):[]);LDL.miss=p;return[...new Set(m)]}
// a model not loaded yet: LD_br starts its load and gives [] (callers below wait for it first; presets and props never see the [])
LD_br=(f=>function(id){if(!LD_MODELS[id]&&LDL.X.c[id]){if(LDL.miss)LDL.miss.add(id);LD_load(id)}return f(id)})(LD_br);
{const Q=window.__LDQ||[];let n=0;window.__ldm={mods:0,models:0};for(const f of Q){try{f(LD_MESH,LD_MODELS,GB_PC,G13_ID,GAR_SETS,GAR_set,LD_br,LDW_P,LDW_reg);n++}catch(e){console.warn('LDM',e)}}
 window.__LDH=LD_ingest;for(const id in window.__LDD||{})LD_ingest(id);LDW_reg();window.__ldm.mods=n}
// garage-cars (22 Oct): a model chunk that fails to load (404: missing from the deploy, offline) never gives a dead ride: the current ride stays, a toast says so
LDL.bad=new Set();
function LD_toast(t){let e=document.getElementById('ldToast');if(!e){e=document.createElement('div');e.id='ldToast';e.setAttribute('role','status');e.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 10px);transform:translateX(-50%);z-index:2147483000;background:rgba(10,24,72,.94);color:#fff;font:700 14px system-ui,sans-serif;padding:9px 16px;border-radius:12px;pointer-events:none;max-width:80vw;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,.35)';document.body.appendChild(e)}e.textContent=t;e.hidden=false;clearTimeout(LD_toast.t);LD_toast.t=setTimeout(()=>{e.hidden=true},3500)}
function LD_okRide(S,fn){const m=LD_probe(fn).filter(id=>LDL.bad.has(id));if(!m.length)return true;let cur='';try{cur=GAR_set(GAR_get().sel).n}catch(e){}
 LD_toast('Could not load '+(S&&S.n||'this ride')+(cur?' · still driving '+cur:''));try{AU.sfx('bump')}catch(e){}window.__ldBad=(window.__ldBad||0)+1;return false}
// garage: selecting / equipping a ride waits for its model; a thumbnail of an unloaded ride is drawn when it arrives
GAR_select=(f=>function(id){const S=GAR_set(id),G=GAR_get();if(!GAR_owned(S))return f.apply(this,arguments);
 const m=LD_probe(()=>[].concat(GAR_arr(S.car()),GAR_arr(S.off()),GAR_arr(S.boat()),G.br[id]||[]));if(!m.length)return f.apply(this,arguments);LD_need(m).then(()=>{if(!LD_okRide(S,()=>[].concat(GAR_arr(S.car()),G.br[id]||[])))return;f(id);LD_redraw()})})(GAR_select);
G9C_equip=(f=>function(S,fm){if(!GAR_owned(S))return f.apply(this,arguments);const m=LD_probe(()=>G9C_bricks(S,fm));if(!m.length)return f.apply(this,arguments);LD_need(m).then(()=>{if(LD_okRide(S,()=>G9C_bricks(S,fm)))f(S,fm)});return 1})(G9C_equip);
// the first unloaded thumbnail fetches every ride at once (one redraw when all are in, not one per ride)
G9C_render=(f=>function(S,fm){const m=LD_probe(()=>G9C_bricks(S,fm));if(m.length){LDL.rd=1;LD_need(m.concat(...Object.values(LDL.X.s)));return null}return f.apply(this,arguments)})(G9C_render);
// BUILD on a ride whose model is still loading: enter once it is in (GAR_select above swaps the bricks first)
GB_enter=(f=>function(){if(!LDL.wait.size)return f.apply(this,arguments);const t=this,a=arguments;Promise.all([...LDL.wait.values()].map(w=>w.p)).then(()=>setTimeout(()=>f.apply(t,a),0))})(GB_enter);
// garage-17 (98fb_form_build.js): BUILD on an OFF-ROAD / WATER ride copies S.off() / S.boat() into the builder; wait for its model first
FB_begin=(f=>function(S,fm){const m=S&&typeof S[fm]==='function'?LD_probe(()=>GAR_arr(S[fm]())):[];if(!m.length)return f.apply(this,arguments);LD_need(m).then(()=>{f(S,fm);LD_redraw()});return 1})(FB_begin);
window.__ld.equip=id=>{gbOpen();return LD_need(LD_probe(()=>GAR_arr(GAR_set(id).car()))).then(()=>{GAR_select(id);gbClose(true);return GAR_get().sel})};// test hook: equip a ride and SAVE & DRIVE
window.__ld.need=LD_need;window.__ld.L=LDL;window.__ld.probe=LD_probe;window.__ld.sel=id=>GAR_select(id);window.__ld.set=id=>GAR_set(id);window.__ld.gar=()=>GAR_get();// test hooks
