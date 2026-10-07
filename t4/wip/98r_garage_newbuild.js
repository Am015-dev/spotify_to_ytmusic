// ---- GNB: 2K-style "build your own from a chassis" (slice 4). A 5th vehicle "My Build" (Neat) whose street car starts as a bare chassis frame:
// a black frame plate, 4 tyres on axles, the seat with its driver and steering wheel, taken 1:1 from a real set (true 8-wide proportions, tyres already on the road).
// NEW BUILD (builder toolbar or RIDES) → pick a chassis → snap parts on it. The part counter doubles as a build-limit bar plus the 2K weight class.
const GNB_K='#1b2a34',GNB_fr=b=>!!CR_WH[b.t]||/^(drv|drvL|stw|diff)$/.test(b.t)||(String(b.c).toLowerCase()===GNB_K&&/^T\d/.test(b.t));
const GNB_CH=[{id:'sc8',ic:'🏎',n:'SPEED CHAMPION',d:'8 wide · low · 4 sport tyres',src:()=>GAR_set('posei').car()},{id:'hyp',ic:'🚀',n:'HYPERCAR',d:'8 wide · long nose · big tyres',src:()=>GAR_set('gold').car()},{id:'rod',ic:'🛣',n:'HOT ROD',d:'open frame · fat rear tyres',src:()=>GAR_set('rod').car()}];
const GNB_frame=id=>GAR_arr((GNB_CH.find(c=>c.id===id)||GNB_CH[0]).src()).filter(GNB_fr).map(b=>({...b}));
{const R=GAR_set('rod');GAR_SETS.push({id:'mine',n:'My Build',tier:'c',req:null,car:()=>GNB_frame('sc8').map(b=>[b.t,b.x,b.z,b.r,b.c,b.y]),off:R.off,boat:R.boat,
 load:Object.assign(JSON.parse(JSON.stringify(R.load)),{car:Object.assign({},R.load.car,{name:'MY BUILD',k:'Street'})})});try{GPK_GRP.mine='Built by you'}catch(e){}}
const GNB_W=n=>n<20?'Super Light':n<40?'Light':n<60?'Medium':n<80?'Heavy':n<100?'Super Heavy':'Massive';
GB_ui=(f=>function(){f();const n=$('#gbBkN');if(!n||!GB.d)return;const k=GB_list().length,p=Math.round(100*Math.min(1,k/GB_MAX));n.textContent+=' · '+GNB_W(k);n.style.background=`linear-gradient(90deg,rgba(255,209,44,.38) ${p}%,rgba(6,18,31,.9) ${p}%)`})(GB_ui);
function GNB_pick(){let P=$('#gnbP');if(!P){P=document.createElement('div');P.id='gnbP';$('#gbx .gbv').appendChild(P)}
 P.innerHTML=`<div class="gnbB"><b>NEW BUILD · pick a chassis</b><small>Your build becomes the vehicle "My Build" in RIDES.</small><div class="gnbR">${GNB_CH.map(c=>`<button data-ch="${c.id}"><i>${c.ic}</i><b>${c.n}</b><small>${c.d}</small></button>`).join('')}</div><button class="gnbX">CANCEL</button></div>`;P.hidden=false;
 P.onclick=e=>{const b=e.target.closest('button');if(!b)return;try{AU.sfx('pick')}catch(_){}P.hidden=true;if(b.dataset.ch)GNB_new(b.dataset.ch)}}
function GNB_new(id){if(GAR_get().sel!=='mine')GAR_select('mine');if(!GB_.bk)GB_enter();GB_snap();GB.d.bricks=GNB_frame(id);GB.d.bp=1;GB_scanBase();GB_gridMesh();GB_refresh();GB_.mir=1;GB_.tool='add';GB_ui();try{GB_msg('Bare chassis · tap to add parts')}catch(e){}}
GB_enter=(f=>function(){const r=f.apply(this,arguments);const T=$('#gbBkT');if(T&&!T.querySelector('[data-a="gnb"]')){const b=document.createElement('button');b.dataset.a='gnb';b.textContent='🆕 NEW BUILD';b.title='Start from a bare chassis';b.addEventListener('click',e=>{e.stopPropagation();GNB_pick()});T.insertBefore(b,T.querySelector('[data-a="bp"]'))}return r})(GB_enter);
GAR_tab=(f=>function(){f();const B=$('#gbBody'),gs=B.querySelector('.garSets');if(!gs)return;const b=document.createElement('button');b.className='gbP gnbGo';b.innerHTML='<b>🆕 BUILD YOUR OWN</b><small>start from a bare chassis</small>';b.onclick=()=>{try{AU.sfx('pick')}catch(e){}GB_enter();GNB_pick()};gs.appendChild(b)})(GAR_tab);
{const st=document.createElement('style');st.textContent=`#gnbP{position:absolute;inset:0;z-index:5;display:grid;place-items:center;background:rgba(3,8,20,.6)}#gnbP[hidden]{display:none}
.gnbB{background:#0b1626;border:2px solid #4ceaff;border-radius:16px;padding:12px 14px;max-width:96%;color:#fff;font:700 12px system-ui;display:grid;gap:8px;justify-items:center}.gnbB>b{font:900 italic 16px system-ui;color:#ffd12c}
.gnbR{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.gnbR button{width:150px;display:grid;gap:2px;justify-items:center;padding:8px;border-radius:12px;border:2px solid rgba(76,234,255,.5);background:#12304a;color:#fff;cursor:pointer}
.gnbR i{font-style:normal;font-size:24px}.gnbR b{font:900 13px system-ui}.gnbR small,.gnbB small{font:600 12px system-ui;color:#cfe6f5}.gnbX{border:0;background:transparent;color:#8fb3c7;font:800 12px system-ui;min-height:32px;cursor:pointer}
#gbx .gnbGo{border-color:#ffd12c!important;min-width:118px}`;document.head.appendChild(st)}
window.__gnb={frame:GNB_frame,pick:GNB_pick,nw:GNB_new,W:GNB_W};
