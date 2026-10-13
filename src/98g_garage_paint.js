// ---- GP: garage PAINT tab recolours the real LEGO bricks (v87g). Root cause of "paint does not work": BODY/ACCENT/TRIM only set the
// old ship colours d.a/b/c, but the LEGO car is drawn from per-brick colours (d.bricks[].c) and the set's 4×4/boat bricks, so nothing changed.
// Roles: a = most-used colour, b = 2nd, c = 3rd (frame black #1b2a34 always ranks last; wheels never change). Street bricks are tagged once
// (b.pr) and painted in place (saved in mho_build); 4×4 + boat get the same choice per set from mho_gar.pa[set] through GAR_apply.
const GP_K='#1b2a34';
function GP_rank(B){const n={};for(const b of B||[]){if(CR_WH[b.t]||b.t==='drvL'||b.t==='drvR'||b.t==='drvLR')continue;const c=String(GB_BC[b.c]||b.c).toLowerCase();n[c]=(n[c]||0)+1}
 const o=Object.keys(n).filter(c=>c!==GP_K).sort((x,y)=>n[y]-n[x]);if(n[GP_K])o.push(GP_K);return o}
const GP_pa=id=>(GAR_get().pa||{})[id||GAR_get().sel]||{};
function GP_save(k,v){const G=GAR_get();G.pa=G.pa||{};const p=G.pa[G.sel]=G.pa[G.sel]||{};if(v==null)delete G.pa[G.sel];else p[k]=v;GAR_put(G);for(const key in CR_VC)if(key.startsWith('gar|'))delete CR_VC[key]}
// street car: tag roles on first paint, then recolour the tagged bricks
function GP_paintStreet(k,v){const B=GB.d&&GB.d.bricks;if(!B||!B.length)return 0;if(!B.some(b=>b.pr)){const r=GP_rank(B);for(const b of B){if(CR_WH[b.t])continue;const i=r.indexOf(String(GB_BC[b.c]||b.c).toLowerCase());if(i>=0&&i<3)b.pr='abc'[i]}}
 let n=0;for(const b of B)if(b.pr===k){b.c=v;n++}return n}
// 4×4 + boat: map the form's own colour ranking onto the set's paint
GAR_apply=(f=>function(B,u,form){const r=form==='car'?null:GP_rank(B),A=f(B,u,form),p=GP_pa();if(!r||!(p.a||p.b||p.c))return A;
 const m={};r.slice(0,3).forEach((c,i)=>{const v=p['abc'[i]];if(v)m[c]=v});return A.map(b=>{if(CR_WH[b.t])return b;const c=m[String(GB_BC[b.c]||b.c).toLowerCase()];return c?Object.assign({},b,{c}):b})})(GAR_apply);
{const B=$('#gbBody');B.addEventListener('click',e=>{const b=e.target.closest('button[data-k]');if(!b||b.disabled||GB.tab!=='paint')return;const k=b.dataset.k;if(!'abc'.includes(k)||k.length!==1)return;GP_paintStreet(k,b.dataset.v);GP_save(k,b.dataset.v)},true)}
// swatch highlight follows the set's saved paint; one hint line on top of the PAINT tab
gbRender=(f=>function(){if(GB.tab==='paint'&&GB.d){const p=GP_pa();for(const k of'abc')if(p[k])GB.d[k]=p[k]}f();if(GB.tab!=='paint')return;const B=$('#gbBody'),i=document.createElement('div');i.className='gbInfo';i.textContent='Paints your car, off-road and boat';B.insertBefore(i,B.firstChild)})(gbRender);
// STOCK LOOK also clears the set's paint
$('#gbStock').addEventListener('click',()=>GP_save('a',null),true);
window.__gp={rank:GP_rank,pa:GP_pa,build:()=>{const d=store.get('mho_build',null);return d&&d.bricks?GP_rank(d.bricks):null}};
