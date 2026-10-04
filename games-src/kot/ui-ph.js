// ===== Phone layout module (html.ph, see phboot.js + phone.css) =====
// The board is the city. Under it (portrait) or beside it (landscape) sits ONE control zone: the dock, restyled by CSS:
// status row, monster chips, dice (the real #dice buttons, 52+ px), Roll / Done, or the shop tiles in the buy step.
// Pop-ups (shop, monster info, the result line) and the existing cards (#choice, #coach, #advice) show one at a time over
// the control zone, never over the city.
const PHN={pop:null,arg:null,key:''};
const $ph=id=>document.getElementById(id);
function phOn(){return !!(window.PHONE&&PHONE.on)}
// ---- phone camera: flat-ish, framed to the seats, Downtown and (with 5-6 monsters) the Harbor; no dice tray, no name plates ----
window.phFit=function(asp){if(!phOn()||typeof V3==="undefined"||!V3.cam)return false;
  const cam=V3.cam,T=THREE,n=G&&G.pl?G.pl.length:4,pts=[];
  for(let k=0;k<n;k++){const v=seatPos(k,n);for(const dx of [-3.3,3.3]){pts.push(new T.Vector3(v.x+dx,.2,v.z+1.8),new T.Vector3(v.x+dx,6.2,v.z-1.2))}}
  pts.push(new T.Vector3(-2.8,10.4,-4.2),new T.Vector3(2.8,10.4,-4.2));
  for(let k=0;k<12;k++){const a=k/12*Math.PI*2;pts.push(new T.Vector3(Math.cos(a)*4.6,.2,Math.sin(a)*4.6),new T.Vector3(Math.cos(a)*3.2,6.2,Math.sin(a)*3.2))}
  if(n>=5)for(const [x,z] of [[16.4,-10.6],[16.4,-2.2],[8.2,-10.6],[8.2,-2.2]])pts.push(new T.Vector3(x,.3,z));
  let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9;for(const p of pts){mnx=Math.min(mnx,p.x);mxx=Math.max(mxx,p.x);mnz=Math.min(mnz,p.z);mxz=Math.max(mxz,p.z)}
  cam.fov=asp<1?34:30;cam.aspect=asp;cam.updateProjectionMatrix();
  const el=Math.max(0,Math.min(1,(1.25-asp)/.45));/* portrait looks down more */
  const off=V3.camOff=new T.Vector3(0,17+el*3,10.5-el*2.5);V3.look.set((mnx+mxx)/2,1.2,(mnz+mxz)/2+.4);
  const mx=.95,my=.93,v=new T.Vector3();
  const ok=()=>{cam.lookAt(V3.look);cam.updateMatrixWorld();for(const p of pts){v.copy(p).project(cam);if(Math.abs(v.x)>mx||Math.abs(v.y)>my||v.z>1)return false}return true};
  const fits=k=>{for(const sw of [.9,-.9]){cam.position.copy(V3.look).addScaledVector(off,k);cam.position.x+=sw;if(!ok())return false}return true};
  let lo=.3,hi=5;for(let i=0;i<22;i++){const m=(lo+hi)/2;if(fits(m))hi=m;else lo=m}V3.camK=hi;
  const d=off.length()*hi;V3.scene.fog.near=Math.max(34,d+4);V3.scene.fog.far=Math.max(105,d+72);return true};
// the tap finder for monsters: nearest monster within 44 px of the finger when the ray misses every mesh
window.phNearMon=function(ev){if(!V3.cam||!V3.mons)return -1;const r=ev.target.getBoundingClientRect();let best=-1,bd=44;
  V3.mons.forEach((o,k)=>{const v=o.g.position.clone().add(new THREE.Vector3(0,2.2,0)).project(V3.cam);const x=r.left+(v.x+1)/2*r.width,y=r.top+(1-v.y)/2*r.height;const d=Math.hypot(ev.clientX-x,ev.clientY-y);if(d<bd){bd=d;best=k}});return best};
// ---- small helpers ----
const phAria={'dr-market':'Cards for sale','dr-mine':'Your cards','dr-mons':'All monsters','dr-log':'Chronicle: what happened','dr-menu':'Menu: rules, sound, speed, new game'};
function phLabels(){for(const b of document.querySelectorAll('header.gx-bar [data-gx]'))b.setAttribute('aria-label',phAria[b.dataset.gx]||b.title||'Menu');
  const p=$ph('pausebtn');if(p){p.setAttribute('aria-label',UI.paused?'Resume the computer':'Pause the computer');p.classList.toggle('paused',!!UI.paused)}
  const a=$ph('advbtn');if(a)a.setAttribute('aria-label','What should I do now, and why?');
  const k=document.querySelector('.gx-dock-head [data-gx="dock"]');if(k)k.setAttribute('aria-label','Hide panel')}
function phBuild(){const dk=document.querySelector('.gx-dock');if(!dk||$ph('pchips'))return;
  const mk=(id,tag,cls)=>{const e=document.createElement(tag||'div');e.id=id;if(cls)e.className=cls;dk.appendChild(e);return e};
  mk('pchips');mk('pshop');const pc=mk('pcx','section','box');pc.setAttribute('role','dialog');pc.setAttribute('aria-label','Details');
  pc.innerHTML='<div class="pcx-h"><b id="pcxt"></b><span id="pcxa"></span><button class="gx-x" data-ph="close" aria-label="Close">×</button></div><div class="pcx-b" id="pcxb"></div>';
  phLabels()}
// ---- monster chips ----
function phChips(){const el=$ph('pchips');if(!el)return;if(!G){el.innerHTML='';return}
  const n=G.pl.length,dk=document.querySelector('.gx-dock');const w=(dk?dk.clientWidth:PHONE.aw)-16;const maxc=Math.max(2,Math.floor((w+5)/(innerHeight<640&&innerHeight>innerWidth?86:93)));const rows=Math.ceil(n/maxc);el.style.setProperty('--cc',Math.ceil(n/rows));
  el.innerHTML=G.pl.map(p=>{const me=(G.mode==='solo'&&p.human)||(NET.on&&p.i===NET.mySeat);const c=inCity(p.i),b=G.bay===p.i;const nm=esc(mname(p));
    const lab=`${mname(p)}${me?' (you)':''}: ${p.alive?`${p.hp} hearts, ${p.vp} stars, ${p.en} energy, ${p.cards.length} power cards${c?', in Downtown':b?', in the Harbor':''}`:'knocked out'}. ${p.i===G.active&&!G.winner?'Its turn. ':''}Tap for details.`;
    return `<button class="pchip ${me?'me':''} ${p.cards.length?'hasn':''} ${p.i===G.active&&!G.winner?'on':''} ${p.alive?'':'ko'} ${c?'city':''}" data-pm="${p.i}" style="--mc:${MONS[p.m].c}" aria-label="${esc(lab)}"><b>${c?'👑':b?'⚓':''}${nm}</b>${p.alive?`<span><em class="h">♥${p.hp}</em><em class="v">★${p.vp}</em><em class="e">⚡${p.en}</em></span>${p.cards.length?`<i class="pn" aria-hidden="true">🃏${p.cards.length}</i>`:''}`:'<span>K.O.</span>'}${me?'<u aria-hidden="true">YOU</u>':''}</button>`}).join('')}
// ---- the shop: three tiles in the buy step, a pop-up with enlarged cards ----
function phShopOK(){return !!(G&&!G.winner&&humanTurn()&&G.phase==='buy')}
function phTiles(){const el=$ph('pshop');if(!el)return;if(!phShopOK()||!G.market.length){el.innerHTML='';return}
  const p=cur(),sg=suggestCard(p);
  el.innerHTML=G.market.map((id,k)=>{const C=CARDS[base(id)],c=costOf(p,id),ok=canBuy(p,k);return `<button class="ptile ${k===sg?'sugg':''} ${ok?'ok':'no'}" data-shop="${k}" aria-label="${esc(C.n)}, costs ${c} energy${k===sg?', recommended':''}${ok?'':', not affordable'}. Tap to open the shop."><span class="cost">${c}</span><b>${esc(C.n)}</b>${k===sg?'<i class="star">★</i>':''}</button>`}).join('')}
function phShopBody(){const me=meSeat();const buyPh=phShopOK();const pl=buyPh||me<0?cur():G.pl[me];const sg=buyPh?suggestCard(pl):-1;
  const adv=buyPh&&sg>=0?advise():null;
  let h=`<p class="pcx-sub">${buyPh?`You have <b>${pl.en} ⚡</b>. ${sg>=0?'The starred card is our pick.':'Nothing here is a great buy: saving ⚡ is fine.'}`:`${G.deck.length} cards in the deck. You can buy in step 4 of your turn.`}</p>`;
  h+=G.market.map((id,k)=>{const C=CARDS[base(id)],c=costOf(pl,id),ok=buyPh&&canBuy(pl,k);
    return `<div class="pcard ${C.t} ${k===sg?'sugg':''}"><div class="pcc"><span class="cost" aria-label="costs ${c} energy">${c}</span><span class="art" aria-hidden="true">${cardIcon(id)}</span></div><div class="pct"><b>${k===sg?'<em class="rec">★ Recommended</em> ':''}${esc(C.n)}</b><span class="ty">${chipOf(C)}${C.kw?' · '+esc(C.kw.toUpperCase()):''}</span><p>${esc(C.x)}</p>${k===sg&&adv?`<p class="why"><b>Why:</b> ${esc(adv.w.replace(C.x,'').trim()||adv.w)}</p>`:''}</div>${buyPh?`<button class="btn buy ${ok?'primary':''}" data-card="${k}" ${ok?'':'disabled'} aria-label="${ok?'Buy':'Cannot buy'} ${esc(C.n)}">${esc(buyLabel(pl,k))}</button>`:''}</div>`}).join('');return h}
// ---- one pop-up at a time: shop, monster info, the result line ----
function phPop(kind,arg){PHN.pop=kind;PHN.arg=arg;phRender();const b=$ph('pcxb');if(b)b.scrollTop=0}
function phClose(){if(!PHN.pop)return false;PHN.pop=null;phRender();return true}
function phPopHTML(){if(!G||UI.info){PHN.pop=null;return null}
  if(PHN.pop==='shop'){const buyPh=phShopOK();return {t:'🃏 Shop',a:buyPh?`<button class="btn sweep" data-act="sweep" ${cur().en<2?'disabled':''}>New cards · 2 ⚡</button>`:'',b:phShopBody()}}
  if(PHN.pop==='mon'){const p=G.pl[PHN.arg];if(!p){PHN.pop=null;return null}
    let h=monDetail(p).replace(/ id="mon-\d+"/,'');
    {const tmp=document.createElement('div');tmp.innerHTML=h;const hands=[...tmp.querySelectorAll('.mc.hand')];hands.forEach(e=>e.dataset.owner=String(p.i));
     // hot-seat: only the monster whose turn it is may see its hand (the device is shared)
     if(G.mode==='hot'&&p.i!==G.active&&hands.length&&p.hand.length){hands.forEach((e,j)=>{if(j)e.remove()});const e0=hands[0];e0.innerHTML=`<b>🧬 ${p.hand.length} evolution card${p.hand.length===1?'':'s'} in hand</b> <i>hidden</i>`}
     h=tmp.innerHTML}
    return {t:`${MONS[p.m].n}${p.i===G.active&&!G.winner?' · its turn':''}`,a:'',b:`<div class="monwrap">${h}</div>`}}
  if(PHN.pop==='banner'){return {t:'What just happened',a:'',b:`<div class="banwrap">${UI.banner||''}</div>`}}
  return null}
function phSeatInfo(k){if(!G||UI.info)return;if(UI.choice)return;phPop('mon',k)}
// ---- who is on top: choice > tip > advice > pop-up (CSS shows only the matching one) ----
function phCard(){const dk=document.querySelector('.gx-dock');if(!dk)return;
  const vis=id=>{const e=$ph(id);return e&&!e.classList.contains('hidden')};
  let k='';if(vis('choice'))k='choice';else if(vis('coach'))k='coach';else if(vis('advice'))k='advice';
  if(k)PHN.pop=null;
  const pop=!k&&PHN.pop?phPopHTML():null;if(!k&&pop)k='pop';
  if(pop){$ph('pcxt').textContent=pop.t;$ph('pcxa').innerHTML=pop.a;const key=PHN.pop+':'+PHN.arg;const b=$ph('pcxb');const st=b.scrollTop;b.innerHTML=pop.b;if(PHN.key===key)b.scrollTop=st;else if(PHN.pop==='shop'&&b.scrollHeight>b.clientHeight+4){const sg=b.querySelector('.pcard.sugg');if(sg)b.scrollTop=Math.max(0,sg.offsetTop-b.offsetTop-8)}PHN.key=key}
  else PHN.key='';
  dk.dataset.card=k}
// ---- buttons: Roll / Done, and the layout of the dice ----
function phActs(){if(!G)return;const pa=$ph('pacts');if(!pa)return;
  const set=(sel,html,al)=>{const b=pa.querySelector(sel);if(!b)return;b.innerHTML=html;if(al)b.setAttribute('aria-label',al)};
  if(humanTurn()&&G.phase==='roll'){const nk=G.dice.filter(d=>!d.k).length;
    set('[data-act="reroll"]',`<span class="bl">🎲 Roll</span><small>${nk} ${nk===1?'die':'dice'} · ${G.rolls} left</small>`,`Roll the ${nk} unkept ${nk===1?'die':'dice'} again, ${G.rolls} rerolls left`);
    set('[data-act="resolve"]','<span class="bl">✔ Done</span><small>use these dice</small>','Done: resolve these dice');
    set('[data-act="hint"]','<span aria-hidden="true">💡</span>','Keep the suggested dice')}
  if(humanTurn()&&G.phase==='buy')set('[data-act="end"]',`<span class="bl">✔ ${G.bug?'Finish turn':'End turn'}</span>`,G.bug?'Finish the borrowed turn':'End your turn');
  if(PHONE.land&&!pa.querySelector('[data-a="advise"]')){const ab=document.createElement('button');ab.className='btn';ab.dataset.a='advise';ab.setAttribute('aria-label','What should I do now, and why?');ab.setAttribute('aria-expanded',UI.adv?'true':'false');ab.innerHTML='<span aria-hidden="true">🧭</span>';const hb=pa.querySelector('[data-act="hint"]')||pa.querySelector('[data-act="resolve"]')||pa.querySelector('[data-act="end"]');if(hb)hb.after(ab);else pa.prepend(ab)}
  const dk=document.querySelector('.gx-dock');if(!dk)return;
  const n=G.dice.length,land=document.documentElement.classList.contains('ph-l');const railW=dk.clientWidth-16;
  let dc,dw,side=false;
  if(land&&n<=6){side=true;dc=3;dw=Math.max(52,Math.min(60,Math.floor((railW-6-104-12)/3)))}
  else{dc=n>6?4:Math.max(1,n);dw=Math.max(52,Math.min(64,Math.floor((railW-(dc-1)*6)/dc)))}
  dk.style.setProperty('--dc',dc);dk.style.setProperty('--dw',dw+'px');dk.dataset.ps=side?'side':'stack';
  dk.dataset.pp=(!G.winner&&humanTurn()?G.phase:'watch')}
function phNote(){const c=$ph('choice');if(c&&!c.classList.contains('hidden')){const li=c.querySelector('.intro ul li');if(li&&/glowing plate/.test(li.textContent))li.innerHTML='The <b>chips</b> under the board show every monster\'s ♥ ★ ⚡ and cards. The highlighted one is whose turn it is. Tap a chip or a monster for details.'}}
function phRender(){if(!phOn())return;phBuild();phLabels();phChips();phTiles();phActs();phNote();phCard();
  const bn=$ph('banner');if(bn){bn.setAttribute('role','button');bn.tabIndex=bn.textContent.trim()?0:-1}
  // the camera needs a refit when the Harbor appears (5-6 monsters)
  const key=(G?G.pl.length:0)+':'+(PHONE.land?1:0);if(PHN.fit!==key){PHN.fit=key;try{if(typeof V3!=="undefined"&&V3.on&&window.resize3D)resize3D()}catch(e){}}}
function phLayout(){document.querySelectorAll('.gx-app.gx-dock-min').forEach(a=>{if(phOn())a.classList.remove('gx-dock-min')});try{if(typeof V3!=="undefined"&&V3.on)resize3D()}catch(e){}phRender()}
// ---- wiring ----
{const _rp=renderPanel;renderPanel=function(){_rp.apply(this,arguments);phRender()};
 const _ra=renderAdvice;renderAdvice=function(){_ra.apply(this,arguments);if(phOn())phCard()};
 const _rt=renderTour;renderTour=function(){_rt.apply(this,arguments);if(phOn())phCard()};
 const _rm=renderModal;renderModal=function(){_rm.apply(this,arguments);if(phOn()){phNote();phCard()}};
 const _si=seatInfo;seatInfo=function(k){if(phOn())return phSeatInfo(k);return _si.apply(this,arguments)}}
document.addEventListener('click',e=>{if(!phOn())return;const t=e.target;
  const ch=t.closest&&t.closest('[data-pm]');if(ch){e.stopPropagation();phSeatInfo(+ch.dataset.pm);return}
  const sh=t.closest&&t.closest('[data-shop]');if(sh){e.stopPropagation();phPop('shop');return}
  const mk=t.closest&&t.closest('[data-gx="dr-market"]');if(mk&&G&&!UI.info){e.stopPropagation();e.preventDefault();if(GX.open)GX.close();if(PHN.pop==='shop')phClose();else phPop('shop');return}
  const bn=t.closest&&t.closest('#banner');if(bn&&bn.textContent.trim()&&!UI.choice){e.stopPropagation();phPop('banner');return}
  if(t.closest&&t.closest('[data-ph="close"]')){e.stopPropagation();phClose();return}
  // a tap outside the pop-up closes it (the tap itself still works)
  if(PHN.pop&&!(t.closest&&t.closest('#pcx'))){phClose()}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&phOn()&&PHN.pop&&!GX.open){phClose();e.stopImmediatePropagation()}},true);
// a closed pop-up never survives a new game or a drawer
{const _gx=GX.onShow;GX.onShow=function(id){if(PHN.pop)phClose();return _gx&&_gx.apply(this,arguments)}}
phLayout();
