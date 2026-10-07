// ---- GPK: 2K-style vehicle groups + perks in the garage RIDES tab (slice 2). Rarity uses the 2K names (Neat · Cool · Awesome · Super Awesome);
// every set card shows its group; a PERKS row shows driver level, class C/B/A and the 1–3 slots (same rules + store as the pause card: mho_perks).
// Two 2K-style trade-off perks (race only, like Kaiser's Crown): Tank Mode and Glass Cannon.
GAR_TIER.c[0]='NEAT';GAR_TIER.r[0]='COOL';GAR_TIER.e[0]='AWESOME';GAR_TIER.l[0]='SUPER AWESOME';
const GPK_GRP={rod:'Hot rod',ebbel:'Street racer',posei:'Speed Champion',gold:'Hypercar'};
PERKS.push({id:'tank',icon:'🚜',name:'Tank Mode',d:'+30% health, −3% top speed',lvl:3},{id:'glass',icon:'💎',name:'Glass Cannon',d:'+4% top speed, −20% health',lvl:14});
setupRace=(f=>function(cfg){const r=f.apply(this,arguments);try{if(pl&&pl.stats){const s=pl.stats;if(PK.has('tank')){s.hull*=1.3;s.top*=.97;s.top0*=.97}if(PK.has('glass')){s.hull*=.8;s.top*=1.04;s.top0*=1.04}}}catch(e){}return r})(setupRace);
const GPK_={pk:null};
const GPK_cls=L=>L>=20?'A':L>=10?'B':'C';
function GPK_eq(slot,id){let e=perkEq0().filter(x=>x!==id);if(slot<e.length)e.splice(slot,1,id);else e.push(id);store.set('mho_perks',e.slice(0,perkSlots()))}
function GPK_html(){const L=carStat().lvl,n=perkSlots(),e=perkEq0(),P=id=>PERKS.find(p=>p.id===id)||{};
 let h=`<h5>PERKS · DRIVER LEVEL ${L} · CLASS ${GPK_cls(L)} · ${n}/3 SLOTS</h5><div class="gbRow">`;
 for(let i=0;i<3;i++){const p=e[i]&&P(e[i]);h+=i<n?`<button class="gbP gpkS ${GPK_.pk===i?'on':''}" data-gslot="${i}"><b>${p?p.icon+' '+p.name:'＋ EMPTY SLOT'}</b><small>${p?p.d:'tap to pick a perk'}</small></button>`:`<button class="gbP gpkS" disabled><b>🔒 SLOT ${i+1}</b><small>driver level ${i===1?8:16}</small></button>`}
 h+='</div>';if(GPK_.pk!=null&&GPK_.pk<n){h+=`<div class="gbRow">`;for(const p of PERKS){const ok=perkUnlocked(p),on=e.includes(p.id);h+=`<button class="gbP ${on?'on':''}" ${ok?'':'disabled'} data-gpk="${p.id}"><b>${ok?'':'🔒 '}${p.icon} ${p.name}</b><small>${ok?p.d:perkReq(p)}</small></button>`}h+='</div>'}return h}
GAR_tab=(f=>function(){f();const B=$('#gbBody');
 B.querySelectorAll('[data-gset]').forEach(b=>{const s=b.querySelector('small'),g=GPK_GRP[b.dataset.gset];if(s&&g)s.textContent=g+' · '+s.textContent});
 const d=document.createElement('div');d.innerHTML=GPK_html();B.appendChild(d);
 const re=()=>{const sc=B.scrollTop;gbRender();$('#gbBody').scrollTop=sc};
 d.querySelectorAll('[data-gslot]').forEach(b=>b.onclick=()=>{const i=+b.dataset.gslot;GPK_.pk=GPK_.pk===i?null:i;try{AU.sfx('pick')}catch(e){}re()});
 d.querySelectorAll('[data-gpk]').forEach(b=>b.onclick=()=>{const id=b.dataset.gpk;if(perkEq0().includes(id))store.set('mho_perks',perkEq0().filter(x=>x!==id));else GPK_eq(GPK_.pk,id);GPK_.pk=null;try{AU.sfx('brick')}catch(e){}re()})})(GAR_tab);
{const st=document.createElement('style');st.textContent='#gbx .garSet em{font-size:12px!important;letter-spacing:.04em!important}#gbx .gpkS{min-width:150px}';document.head.appendChild(st)}
window.__gpk={html:GPK_html,eq:GPK_eq,cls:GPK_cls};
