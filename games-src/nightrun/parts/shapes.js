/* ---------- vector SHAPES for every item that still waits for painted art (see ASSETS-NEEDED.md). Each draws a simple shape now and switches to the painted file as soon as it is
   listed in media/ready.json (make-placeholders.py writes that list when it finds real art). Nothing here ever shows the placeholder pictures. ---------- */
ART.rd=new Set();ART.isReal=n=>ART.rd.has(n+'.webp');
fetch(ART.base+'ready.json').then(r=>r.json()).then(a=>{if(!Array.isArray(a))return;ART.rd=new Set(a);for(const f of a)ART.load(f.replace(/\.webp$/,''));if(typeof garageEl!=='undefined'&&!garageEl.hidden)gaDraw();}).catch(()=>{});
const SVGW=(inner,vb)=>`<svg viewBox="0 0 ${vb||24} ${vb||24}" aria-hidden="true">${inner}</svg>`;
/* ----- difficulty badges ----- */
const DIFFC={easy:'#8c86b8',normal:'#19e3ff',hard:'#ffb020',vhard:'#ff5a3d',legend:'#ff2d95'};
const DIFFP={easy:'<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/>',normal:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" fill="currentColor"/>',
  hard:'<path d="M12 2l3 7 7 1-5.5 4.5L18 22l-6-4-6 4 1.5-7.5L2 10l7-1z" fill="currentColor"/>',
  vhard:'<path d="M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-4 3-7 1 2 2 2 3-5z" fill="currentColor"/>',
  legend:'<path d="M3 8l4 4 5-8 5 8 4-4-2 12H5z" fill="currentColor"/>'};
function diffBadge(k){if(ART.isReal('diff-'+k))return `<img class="db" src="media/diff-${k}.webp" alt="">`;return `<span class="db" style="color:${DIFFC[k]||'#fff'}">${SVGW(DIFFP[k]||DIFFP.normal)}</span>`;}
/* ----- stage medals ----- */
function medalHTML(t){const n=['bronze','silver','gold'][t],c=['#cd7f32','#c8d0e0','#ffd23d'][t];if(ART.isReal('medal-'+n))return `<img class="md" src="media/medal-${n}.webp" alt="">`;
  return `<span class="md">${SVGW(`<path d="M16 2h6l2 14h-6zM32 2h-6l-2 14h6z" fill="${t?'#3a6bff':'#8a2a2a'}"/><circle cx="24" cy="30" r="14" fill="${c}" stroke="#fff6" stroke-width="2"/><circle cx="24" cy="30" r="9" fill="none" stroke="#0006" stroke-width="2"/><text x="24" y="35" text-anchor="middle" font-size="14" font-weight="700" fill="#0008" font-family="sans-serif">${t+1}</text>`,48)}</span>`;}
/* ----- SOON cards ----- */
const SOONP={'weapon-forge':'M3 18h18v3H3zM6 9h12l2 4H4z','contracts':'M6 3h12v18H6zM9 8h6v2H9zM9 12h6v2H9z','pilot-ranks':'M12 3l8 6v4l-8-6-8 6V9zM12 11l8 6v4l-8-6-8 6v-4z','boss-trophies':'M7 3h10v5a5 5 0 01-10 0zM9 17h6v2H9zM11 13h2v4h-2z',
  'ship-skins':'M12 3l7 9a7 7 0 11-14 0z','squad-roster':'M12 4l3 6h-6zM5 14l3 6H2zM19 14l3 6h-6z','leaderboards':'M3 12h5v9H3zM9.5 6h5v15h-5zM16 15h5v6h-5z'};
function soonIcon(slug){if(ART.isReal('soon-'+slug))return `<img class="pi" src="media/soon-${slug}.webp" alt="">`;return `<span class="pi sh">${SVGW(`<path d="${SOONP[slug]}" fill="currentColor"/>`)}</span>`;}
/* ----- new ships: shapes in the garage and in the run, and their own volleys ----- */
const NEWSHIPS=[{id:'drift',n:'Drift',t:'Wide fan on every shot',p:200,c:'#ffb020',ic:'M12 3l9 16-9-4-9 4z'},{id:'lancer',n:'Lancer',t:'A piercing lance every 2nd shot',p:240,c:'#ff5a3d',ic:'M2 11h16l4 1-4 1H2z'},{id:'nova',n:'Nova',t:'A ring burst every 3rd shot',p:280,c:'#c08aff',ic:'M12 2l2 7 7-2-5 5 5 5-7-2-2 7-2-7-7 2 5-5-5-5 7 2z'}];
for(const s of NEWSHIPS)SHIPS.push({id:s.id,n:s.n,t:s.t,p:s.p,ic:s.ic});
const SHIPSHAPE={drift:[1,1.35,'#ffb020'],lancer:[1.4,.65,'#ff5a3d'],nova:[1.05,1.05,'#c08aff']};
function shipPortrait(it){if(ART.shipN.includes(it.id)||ART.isReal('ship-'+it.id))return `<img class="shp" src="media/ship-${it.id}.webp" alt="" decoding="async">`;
  const ns=NEWSHIPS.find(s=>s.id===it.id),c=ns?ns.c:'#8c86b8';return `<span class="shp sh" style="color:${c}">${SVGW(`<path d="${it.ic}" fill="currentColor"/>`)}</span>`;}
{const v0=SH.volley;SH.volley=function(x,y,pf){v0.call(this,x,y,pf);const s=this.ship;if(s!=='drift'&&s!=='lancer'&&s!=='nova')return;const n=SH._vn=(SH._vn||0)+1,dm=.55*(typeof tpDmg==='function'?tpDmg():1);
  if(s==='drift'){for(const a of[-280,-140,140,280])G.pb.push({x,y,vx:880,vy:a,dm,pf:0});}
  else if(s==='lancer'){if(n%2===0)G.pb.push({x:x+6,y,vx:820,vy:0,dm:4.2*(typeof tpDmg==='function'?tpDmg():1),pf,big:1,rad:9,px:new Set(),pn:2,col:'#ff5a3d',len:52,th:7});}
  else if(s==='nova'){if(n%3===0)for(let i=0;i<8;i++){const a=i*Math.PI/4;G.pb.push({x,y,vx:Math.cos(a)*620,vy:Math.sin(a)*620,dm:dm*.9,pf:0,big:0});}}};}
/* ----- boss chest: after every district boss, three face-down cards, pick one ----- */
const chestEl=document.createElement('div');chestEl.id='chest';chestEl.className='ov solid';chestEl.hidden=true;stage.appendChild(chestEl);
const CHEST_ON=()=>load('mnr_chest',1)!==0&&(!navigator.webdriver||/[?&]chest=1/.test(location.search));
const CHR=[{n:'+1 HULL',t:'Max hull +1 and repaired',c:'#3dffb0',d:'M12 21s-8-5.5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.5-8 11-8 11z',f:()=>{P.max++;P.hp=P.max;}},
  {n:'NEON CACHE',t:'+250 Neon for the pit stop',c:'#19e3ff',d:NEON_D,f:()=>{SH.neon+=250;}},{n:'SHIELD',t:'One extra shield',c:'#19e3ff',d:'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z',f:()=>{SH.sh++;}},
  {n:'EMP PACK',t:'+2 EMP',c:'#ffb020',d:'M13 2L4 14h6l-1 8 9-12h-6z',f:()=>{P.emp=Math.min(9,P.emp+2);}},{n:'REVIVE',t:'Come back once',c:'#ff2d95',d:'M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v4h4v2h-4v4h-2v-4H7v-2h4V7z',f:()=>{TP.revLeft++;}},
  {n:'UPGRADE',t:'A random pit-stop upgrade',c:'#ff2d95',d:'M12 2l3 7 7 .8-5.3 4.7 1.6 7.2L12 18l-6.3 3.7 1.6-7.2L2 9.8 9 9z',f:()=>{const ids=Object.keys(UBY).filter(id=>UBY[id].max>1&&SH.n(id)<UBY[id].max&&!UBY[id].ok);if(ids.length)SH.add(ids[Math.floor(Math.random()*ids.length)]);}}];
function chestShow(done){G.chestT=true;const pool=CHR.slice().sort(()=>Math.random()-.5).slice(0,3);let picked=-1,fin=false;
  const art=ART.isReal('chest-closed')?`<img src="media/chest-closed.webp" alt="" class="cz" id="chImg">`:`<span class="cz sh" style="color:#ffe14d">${SVGW('<path d="M3 10a9 7 0 0118 0v3H3z" fill="currentColor" opacity=".85"/><rect x="3" y="12" width="18" height="9" rx="1.5" fill="currentColor" opacity=".55"/><rect x="10.5" y="11" width="3" height="5" fill="#120a1f"/>')}</span>`;
  const back=ART.isReal('card-back')?'<img src="media/card-back.webp" alt="">':'<span class="cb">?</span>';
  chestEl.innerHTML=`<div class="in" style="align-items:center;text-align:center"><div class="eyebrow">Boss down</div><h1>BOSS <span>CHEST</span></h1>${art}<div class="lede" id="chMsg">Pick one card</div><div class="chc" id="chC"></div><div class="row" style="justify-content:center"><button class="go" id="chGo" type="button" hidden>CONTINUE</button></div></div>`;
  const box=chestEl.querySelector('#chC');
  pool.forEach((r,i)=>{const b=document.createElement('button');b.type='button';b.className='chk';b.dataset.i=i;b.innerHTML=`<div class="f"><div class="bk">${back}</div><div class="fr${ART.isReal('card-frame')?' pf':''}" style="--c:${r.c}">${SVGW(`<path d="${r.d}" fill="${r.c}"/>`)}<b>${r.n}</b><small>${r.t}</small></div></div>`;
    b.addEventListener('click',()=>{if(picked>=0)return;picked=i;r.f();if(ART.isReal('chest-open')){const ci=$('chImg');if(ci)ci.src='media/chest-open.webp';}AU.sfx('up');box.querySelectorAll('.chk').forEach((q,k)=>q.classList.add(k===i?'win':'lose','flip'));$('chMsg').textContent=r.n+'!';$('chGo').hidden=false;$('chGo').focus();});box.append(b);});
  const end=()=>{if(fin)return;fin=true;chestEl.hidden=true;done();};$('chGo').onclick=end;chestEl.hidden=false;
  setTimeout(()=>{if(!fin&&picked<0){const q=box.querySelector('.chk:nth-child(2)');if(q)q.click();}},14000);}
{const p0=SH.pit;SH.pit=function(cb){if(running&&G&&G.bossDone&&!G.chestT&&CHEST_ON()){chestShow(()=>p0.call(SH,cb));return;}return p0.call(this,cb);};}
{const ed=enterDistrict;enterDistrict=function(i){G.chestT=false;return ed.apply(this,arguments);};}
NR.on('runStart',()=>{G.chestT=false;});
{const st=document.createElement('style');st.textContent=`
.db{display:inline-flex;vertical-align:-.2em;width:1.2em;height:1.2em;margin-right:.35em}.db svg,img.db{width:100%;height:100%;object-fit:contain}
.md{display:block;height:72px;width:72px;margin-top:8px}.md svg{height:100%;width:100%}
.pg .card .pi{height:clamp(34px,calc(var(--u)*10),52px);width:clamp(34px,calc(var(--u)*10),52px);flex:0 0 auto}.pg .card .pi.sh svg,.pg .card .shp.sh svg{width:100%;height:100%;color:var(--c)}
.pg .card .shp.sh{display:inline-block;height:clamp(40px,calc(var(--u)*13),84px);width:clamp(40px,calc(var(--u)*13),84px);flex:0 0 auto}
#chest .cz{display:block;width:clamp(70px,18vmin,150px);height:clamp(70px,18vmin,150px);margin:0 auto}#chest .cz svg{width:100%;height:100%}
#chest .chc{display:flex;gap:clamp(8px,2vmin,18px);justify-content:center;width:100%}
#chest .chk{background:none;border:0;padding:0;width:clamp(86px,24vmin,170px);aspect-ratio:3/4;perspective:700px;cursor:pointer}
#chest .f{position:relative;width:100%;height:100%;transition:transform .5s;transform-style:preserve-3d}#chest .chk.flip .f{transform:rotateY(180deg)}
#chest .bk,#chest .fr{position:absolute;inset:0;border-radius:10px;border:2px solid #ffe14d;backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:6px;background:#140c26}
#chest .bk img{width:100%;height:100%;object-fit:contain}#chest .cb{font:700 clamp(30px,10vmin,64px) var(--display);color:#ffe14d}
#chest .fr{transform:rotateY(180deg);border-color:var(--c)}#chest .fr svg{width:34%}#chest .fr b{font-size:clamp(11px,2.6vmin,17px);color:#fff}#chest .fr small{font-size:clamp(9px,2vmin,13px);color:#cfc9f2;line-height:1.1}
#chest .chk.lose{opacity:.45}#chest .chk.win .f{filter:drop-shadow(0 0 10px #ffe14d)}
`;document.head.appendChild(st);}
/* ----- painted surfaces: garage / pit stop, pause and settings (the dark wash stays on top so the text stays readable); decoded once at start ----- */
ART.keep=[];for(const n of['garage','garage-phone','pause','chest-open','card-frame']){const im=new Image();im.decoding='async';im.src=ART.base+n+'.webp';ART.keep.push(im);if(im.decode)im.decode().catch(()=>{});}
{const st=document.createElement('style');st.textContent=`
#garage.ov.pg{background:linear-gradient(#05030cc4,#05030ce0),url(media/garage.webp) center/cover no-repeat #05030c}
@media (orientation:portrait){#garage.ov.pg{background:linear-gradient(#05030cc4,#05030ce0),url(media/garage-phone.webp) center/cover no-repeat #05030c}}
#pausem.ov.solid,#setm.ov.solid{background:linear-gradient(#05030cc8,#05030cdc),url(media/pause.webp) center/cover no-repeat #05030c}
.pg .card img.pi{opacity:.9}
#chest .fr.pf{background:#140c26 url(media/card-frame.webp) center/100% 100% no-repeat;border-color:transparent;padding:14% 10%}
`;document.head.appendChild(st);}
setTimeout(()=>{if(window.diffDraw)window.diffDraw();},0);
