// ===================== phone layout (board first, tap to play, pop-ups, one card at a time) =====================
// Only active when html.ph is set (short side <= 500 px, or a touch screen <= 600 px; ?phone=1 / ?phone=0 force it).
// Desktop and tablets never run any of this. It only re-arranges and re-presents the existing dock HTML (cloned, so every data-a handler still works).
const PHO={on:false,land:false,pop:null,popSig:'',zoom:false,tmr:0,st:''};
(function(){
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function detect(){try{const P=new URLSearchParams(location.search);if(P.has('phone'))return P.get('phone')!=='0'}catch(e){}
  const s=Math.min(innerWidth,innerHeight);if(s<=500)return true;let c=false;try{c=matchMedia('(pointer:coarse)').matches}catch(e){}return c&&s<=600}
function insets(){try{const P=new URLSearchParams(location.search);if(P.has('safe')){const a=P.get('safe').split(',').map(Number);return {t:a[0]||0,r:a[1]||0,b:a[2]||0,l:a[3]||0}}
  let p=document.getElementById('phprobe');if(!p){p=document.createElement('div');p.id='phprobe';p.setAttribute('aria-hidden','true');p.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(p)}
  const c=getComputedStyle(p);return {t:parseFloat(c.paddingTop)||0,r:parseFloat(c.paddingRight)||0,b:parseFloat(c.paddingBottom)||0,l:parseFloat(c.paddingLeft)||0}}catch(e){return {t:0,r:0,b:0,l:0}}}
const BAR=44,VIEW=44;
PHO.boot=function(){PHO.apply();let t=0;const f=()=>{clearTimeout(t);t=setTimeout(()=>{PHO.apply();PHO.sync()},60)};addEventListener('resize',f);addEventListener('orientationchange',f);
  document.addEventListener('click',e=>{PHO._pawn=!!(e.target.closest&&e.target.closest('#ps [data-pawn],#ppop [data-pawn]'))},true);document.addEventListener('click',onClick);document.addEventListener('keydown',e=>{if(!PHO.on||e.key!=='Escape')return;if(PHO.zoom){closeZoom();e.stopImmediatePropagation();return}if(PHO.pop){PHO.closePop();e.stopImmediatePropagation()}},true)};
PHO.apply=function(){const R=document.documentElement;const was=PHO.on,wasL=PHO.land;PHO.on=detect();R.classList.toggle('ph',PHO.on);
  const app=q('.gx-app');
  if(!PHO.on){R.classList.remove('ph-l','ph-p');for(const k of['--bw','--bh','--bhs','--rail','--sat','--sar','--sab','--sal'])R.style.removeProperty(k);
    if(typeof V3!=='undefined'){V3.ph=false;if(was&&V3.on&&V3.rad){V3.orbit.e=1.12;fitDist();placeCam()}}if(was){const c=q('#phchip');if(c)c.hidden=true;const v=q('#phview');if(v)v.hidden=true}return was}
  const w=innerWidth,h=innerHeight,I=insets();PHO.land=w>h;const aw=w-I.l-I.r;
  let bw,bh,rail=0;
  if(PHO.land){rail=w>=800?300:280;bw=aw-rail;bh=h-I.t-I.b}else{bw=aw;bh=Math.round(Math.max(aw*.75,Math.min(aw*.95,h-I.t-I.b-BAR-VIEW-296)))}
  R.classList.toggle('ph-l',PHO.land);R.classList.toggle('ph-p',!PHO.land);
  const set=(k,v)=>R.style.setProperty(k,v+'px');set('--bw',Math.floor(bw));set('--bh',Math.max(200,Math.floor(bh)));set('--bhs',Math.max(170,Math.min(Math.floor(bh),Math.round(aw*.56))));set('--rail',rail);set('--sat',I.t);set('--sar',I.r);set('--sab',I.b);set('--sal',I.l);
  if(app)app.classList.remove('gx-dock-min','gx-sheet-full');
  // the chip sits in the bar (portrait) or in the view row under the bar (landscape rail)
  const chip=q('#phchip'),bar=q('.gx-bar'),pv=q('#phview');
  if(chip&&bar&&pv){if(PHO.land){if(chip.parentNode!==pv)pv.insertBefore(chip,pv.firstChild)}else if(chip.parentNode!==bar){const sp=bar.querySelector('.gx-sp');bar.insertBefore(chip,sp?sp.nextSibling:bar.firstChild)}}
  if(typeof V3!=='undefined'){const first=!V3.ph;V3.ph=true;V3.phFill=.97;V3.phE=1.4;if(V3.on&&V3.rad&&(first||wasL!==PHO.land||!was)){V3.orbit.e=1.4;fitDist()}}
  return !was};
// ---------- what the dock shows ----------
function state(){if(!G||typeof UI==='undefined')return 'none';if(UI.modal==='start')return 'start';
  if(typeof NET!=='undefined'&&(NET.gone||(NET.on&&NET.inLobby)))return 'none';
  if(G.over&&!UI.overSeen&&!storyActive())return 'over';if(storyActive())return 'story';
  if(planOpen()&&!allAI())return pstep()===2?'plan2':'plan';return 'wait'}
function lowLife(){let m=99;for(const c of G.chars){if(c.npc&&G.scen!=='stranded')continue;if(c.dead)continue;m=Math.min(m,CHARS[c.k].die-c.w)}return m===99?0:m}
function chipHtml(){let o={};withView(()=>{const need=eatersNeed(),have=food();o={d:G.round,r:G.rounds,f:have,need,w:G.res.wood,fur:G.res.fur,low:lowLife(),roof:G.camp.roof,pal:G.camp.pal,wp:G.weapon,sh:hasShelter()}});
  const bad=(c,t)=>`<i class="${c?'bad':''}">${t}</i>`;
  return {h:`<b>D${o.d}</b>${bad(o.f<o.need,'🍖'+o.f)}${bad(false,'🪵'+o.w)}${bad(o.low<=3,'♥'+o.low)}<i class="c-x">☂${o.roof}</i>`,
    a:`Day ${o.d} of ${o.r}. Food ${o.f} (${o.need} needed tonight), wood ${o.w}, fur ${o.fur}. Lowest life ${o.low}. Roof ${o.roof}, palisade ${o.pal}, weapon ${o.wp}, ${o.sh?'shelter built':'no shelter'}. Tap for details.`,warn:o.f<o.need||o.low<=3}}
// the goal, short enough for the bar under the island
function goalShort(){const s=G.sc||{};switch(G.scen){case 'marooned':return `fire ${has('fire')?'✓':'✗'} · pile ${s.pile||0}/15`;case 'hexed':return `crosses ${(s.crosses||[]).length}/5`;
  case 'stranded':return `raft ${has('jraft')?'✓':'✗'} · Ada ${s.rescued?'safe':'waiting'} · boat ${has('lifeboat')?'✓':'✗'}`;case 'settlers':return `home ${[hasShelter(),G.camp.roof>=1,G.camp.pal>=1,G.weapon>=1].filter(Boolean).length}/4 · tools ${(s.goals||[]).filter(has).length}/${(s.goals||[]).length}`}return ''}
function phaseLabel(){let t='';withView(()=>{const f=flowNow();const ph=f&&PHI(f.k)>=0?PH7[PHI(f.k)].n:'';t=`🎯 ${goalShort()}`});return t}
PHO.sync=function(){if(!PHO.on)return;const dock=q('.gx-dock'),app=q('.gx-app');if(!dock)return;const st=state();PHO.st=st;dock.dataset.phs=st;if(app){app.dataset.phs=st;app.dataset.dec=(st==='plan'||st==='plan2'||PHO.pop&&PHO.pop.k!=='status'||st==='story'&&typeof humanQ==='function'&&humanQ()&&storyIdx()>=UI.beats.length-1)?'1':''}
  const pv=q('#phview'),chip=q('#phchip');const show=!!G&&st!=='none'&&st!=='start';if(pv)pv.hidden=!show;if(chip)chip.hidden=!show;
  if(show){try{const c=chipHtml();if(chip.dataset.h!==c.h){chip.dataset.h=c.h;chip.innerHTML=c.h}chip.setAttribute('aria-label',c.a);chip.classList.toggle('warn',c.warn);
    const lb=q('#phlabel');if(lb)lb.textContent=phaseLabel();const cm=q('#phcamp');if(cm){const on=typeof V3!=='undefined'&&V3.phMode==='camp';cm.setAttribute('aria-label',on?'Show the whole island':'Centre on camp');cm.setAttribute('aria-pressed',on?'true':'false')}}catch(e){console.error(e)}}
  // the game-over report and the setup screen are cards in the free zone
  const m=q('#modal');if(m){m.classList.toggle('phcard',st==='over');const r=dock.getBoundingClientRect();const R=document.documentElement;R.style.setProperty('--dz-t',Math.round(r.top)+'px');R.style.setProperty('--dz-l',Math.round(r.left)+'px');R.style.setProperty('--dz-w',Math.round(r.width)+'px');R.style.setProperty('--dz-h',Math.round(r.height)+'px')}
  buildStrip();
  if(PHO.pop){if((PHO.pop.k==='pawn'||PHO.pop.k==='tile')&&(st!=='plan2'||PHO.popSig!==planSig()))PHO.closePop(true);else if(PHO.pop.k==='status'&&(st==='none'||st==='start'))PHO.closePop(true)}
  renderPop();
  // a new plan step / a new card starts at the top
  const key=st+':'+(st==='plan'?pstep():'')+':'+(st==='story'?UI.beats.length+':'+(UI.seenBeat||''):'');if(PHO.key!==key){PHO.key=key;const b=q('.gx-dock-body');if(b)b.scrollTop=0}};
// ---------- the strip: the pawns of the plan (step 2), one row of big buttons ----------
function buildStrip(){const ps=q('#ps');if(!ps)return;if(PHO.st!=='plan2'){ps.hidden=true;if(ps.innerHTML){ps.innerHTML='';ps.dataset.h=''}return}
  const wz=q('#panel .wz');if(!wz){ps.hidden=true;return}
  const row=wz.querySelector('.pawnrow'),done=wz.querySelector('.alldone'),net=wz.querySelector('.netbar,.netturn,.netwait');const cur=curPawn();
  const plan=G.plan.acts.length?`<div class="plan">${G.plan.acts.map(a=>planLine(a)).join('')}</div>`:'';
  const nm=cur?pawnNice(cur):'';
  const hint=cur?`<button class="btn go ps-go" data-ph="pawn">Give ${E(pawnLabel(cur).split(' ')[0])} a job</button><p class="ps-hint">Or tap a place on the island.</p>`:`<p class="ps-hint">Every pawn has a job. Tap a pawn to change its job, or press Next.</p>`;
  const h=`${typeof guideTip==='function'?guideTip('plan2'):''}<div class="ps-h"><b>Plan day ${G.round}</b><span>pawn ${cur?wizPawns().findIndex(p=>p.id===cur.id)+1:wizPawns().length} of ${wizPawns().length}</span></div>${net?net.outerHTML:''}${hint}${row?row.outerHTML:''}${plan?`<h4 class="ps-t">The plan so far</h4>${plan}`:''}`;
  ps.hidden=false;if(ps.dataset.h!==h){const t=ps.scrollTop;ps.innerHTML=h;ps.dataset.h=h;ps.scrollTop=t}}
// ---------- pop-ups (in the free zone, never over the island) ----------
function jobLine(r,rec){const key=encodeURIComponent(JSON.stringify({type:r.type,tgt:r.tgt,alt:r.alt}));const planned=findActAny(r.type,r.tgt,r.alt);const sel=UI.sel;const pw=sel&&!r.why?placeWhy(sel,r.type,r.tgt,r.alt):null;
  const isRec=rec&&rec.type===r.type&&JSON.stringify(rec.tgt)===JSON.stringify(r.tgt)&&(rec.alt||0)===(r.alt||0);
  return `<div class="job ${r.why?'no':''} ${planned?'has':''} ${isRec?'rec1':''}" ${posAttr({type:r.type,tgt:r.tgt})}><div class="jt"><b>${isRec?'<u class="star">Recommended</u> ':''}${E(r.title)}</b><span>${E(r.sub)}${r.why?` <em>(${E(r.why)})</em>`:''}</span></div>${r.why?'':`<button class="btn add" data-place="${key}" ${pw?'aria-disabled="true"':''} aria-label="Give ${E(sel?pawnLabel(pawnInfo(sel)):'a pawn')} this job: ${E(r.title)}" title="${E(pw||'Give this job')}">+</button>`}</div>`}
function tileRows(id){const out=[];const cats=id===G.camp.pos?['build','camp','hunt','threat','special']:['gather','explore','build','special'];
  for(const k of cats){let rows=[];try{rows=catRows(k)}catch(e){}for(const r of rows){const onTile=(r.type==='gather'&&r.tgt&&r.tgt.pos===id)||(r.type==='explore'&&r.tgt===id)||(r.type==='build'&&r.tgt&&r.tgt.cross===id)||(r.type==='special'&&id===G.sc.temple&&r.tgt==='temple')||(id===G.camp.pos&&k!=='gather'&&k!=='explore'&&!(r.type==='build'&&r.tgt&&r.tgt.cross!=null));if(onTile)out.push(r)}}return out}
function tileInfo(id){const t=tileAt(id),m=G.map[id];if(!t){if(m.down)return `<div class="ti"><b>A cut-off place</b><p>This place has broken away and can’t be used.</p></div>`;const reach=MAP[id].adj.some(p=>tileAt(p));
    return `<div class="ti"><b>Unexplored place ${id+1}${m.fog?' · 🌫 fog':''}</b><p>${reach?'You can send a pawn to explore it. It turns over a new island tile.':'Too far to explore yet: explore the places next to the land you know first.'}</p></div>`}
  const toks=Object.keys(m.tok||{}).filter(k=>m.tok[k]).map(k=>({time:'slow going (+1 pawn)',beast:'animal tracks: danger without a weapon',food:'extra food (parrots)'}[k]||k));
  return `<div class="ti"><b>Place ${id+1}: ${E(t.terr)}${id===G.camp.pos?' · 🏕 camp':''}</b><p>${t.src.length?'Sources: '+t.src.map((s,i)=>E(s)+(m.exh[i]?' (used up)':'')).join(', '):'No sources here.'}${t.shelter?' · natural shelter':''}${t.totem?' · 🗿 totem':''}${m.fog?' · 🌫 fog':''}${m.waste?' · barren':''}${toks.length?' · '+toks.join(' · '):''}</p></div>`}
function pawnPickRow(){const wz=q('#panel .wz');const row=wz&&wz.querySelector('.pawnrow');return row?row.outerHTML:''}
function popContent(){const p=PHO.pop;if(!p||!G)return null;
  if(p.k==='status')return {title:'Camp status',cls:'st'};
  if(p.k==='pawn'){const wz=q('#panel .wz');if(!wz)return null;const c=wz.cloneNode(true);for(const s of['.gtip','.wz-steps','.wz-t','.pawnrow','.sofar','.alldone','.hint','.netbar','.netturn','.netwait'])c.querySelectorAll(s).forEach(e=>e.remove());
    const cur=curPawn();return {title:cur?'A job for '+pawnNice(cur):'Jobs',html:c.innerHTML,cls:'pawn'}}
  if(p.k==='tile'){const id=p.id;let h=tileInfo(id);const plan=PHO.st==='plan2';
    if(plan){const cur=curPawn();const rec=cur?recPlan().map[cur.id]:null;const rows=tileRows(id);const ok=rows.filter(r=>!r.why),no=rows.filter(r=>r.why);
      h+=`<div class="tp-for">${cur?'Tap <b>+</b> to give <b>'+E(pawnNice(cur))+'</b> a job here:':'Every pawn has a job. Tap a pawn below to change its job.'}</div>`;
      h+=ok.length?`<div class="tjobs">${ok.map(r=>jobLine(r,rec)).join('')}</div>`:`<p class="muted">No job possible here right now.</p>`;
      if(wizPawns().length>1)h+=`<div class="tp-for">${cur?'Or give the job to another pawn first:':''}</div>${pawnPickRow()}`;
      if(no.length)h+=`<details class="later"><summary>Not possible yet (${no.length})</summary>${no.map(r=>jobLine(r,rec)).join('')}</details>`}
    const t=tileAt(id);return {title:t?`Place ${id+1} · ${t.terr}`:`Place ${id+1}`,html:h,cls:'tile'}}
  return null}
PHO.openPop=function(p){PHO.pop=p;PHO.popSig=G?planSig():'';PHO.popOpen=true;renderPop();const b=q('#ppop .pp-b');if(b)b.scrollTop=0};
PHO.closePop=function(quiet){const was=PHO.pop;PHO.pop=null;const hud=q('#hud');if(hud&&hud.parentNode&&hud.parentNode.classList.contains('pp-b')){const body=q('.gx-dock-body');if(body)body.insertBefore(hud,body.firstChild)}
  if(typeof V3!=='undefined')V3.hover=null;const pp=q('#ppop');if(pp){pp.hidden=true;pp.innerHTML='';pp.dataset.h=''}if(was&&was.k==='tile'&&!quiet){UI.tileSel=null;if(typeof render==='function')render()}};
function renderPop(){const pp=q('#ppop');if(!pp)return;if(!PHO.pop){if(!pp.hidden){pp.hidden=true;pp.innerHTML=''}return}
  const c=popContent();if(!c){PHO.closePop(true);return}
  if(PHO.pop.k==='status'){if(!pp.querySelector('.pp-b')||pp.dataset.k!=='status'){pp.innerHTML=`<div class="pp-h"><b>${E(c.title)}</b><button class="gx-ibtn pp-x" data-ph="close" aria-label="Close">×</button></div><div class="pp-b"></div>`;pp.dataset.k='status'}
    const b=pp.querySelector('.pp-b'),hud=q('#hud');if(hud&&hud.parentNode!==b){b.appendChild(hud)}
    if(!b.querySelector('.pp-camp')){b.insertAdjacentHTML('beforeend',`<div class="pp-camp"><button class="btn" data-gx="campd">Castaways, skills and items</button></div>`)}
    pp.hidden=false;pp.className='st';return}
  const html=`<div class="pp-h"><b>${E(c.title)}</b><button class="gx-ibtn pp-x" data-ph="close" aria-label="Close">×</button></div><div class="pp-b">${c.html}</div>`;
  const hs=pp.dataset.k+'|'+html;pp.hidden=false;pp.className=c.cls||'';
  if(pp.dataset.h!==html){const old=pp.querySelector('.pp-b'),sc=old&&pp.dataset.k===PHO.pop.k?old.scrollTop:0;pp.innerHTML=html;pp.dataset.h=html;pp.dataset.k=PHO.pop.k;const nb=pp.querySelector('.pp-b');if(nb)nb.scrollTop=sc}}
// a tile was tapped on the island
PHO.tile=function(id){if(!PHO.on)return;if(id==null){if(PHO.pop&&(PHO.pop.k==='tile'||PHO.pop.k==='pawn'))PHO.closePop();return}
  if(!G||PHO.st==='none'||PHO.st==='start')return;
  PHO.openPop({k:'tile',id});if(typeof V3!=='undefined')V3.hover=id};
// ---------- view buttons, pop-up buttons, enlarged cards ----------
function closeZoom(){PHO.zoom=false;const z=q('#pzoom');if(z){z.hidden=true;z.innerHTML=''}}
function openZoom(el){const z=q('#pzoom');if(!z)return;const c=el.cloneNode(true);c.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));c.removeAttribute('data-pos');
  z.innerHTML=`<div class="zc" role="document"><button class="gx-ibtn zc-x" data-ph="zclose" aria-label="Close the card">×</button><div class="zc-b ${[...el.classList].join(' ')}">${c.innerHTML}</div></div>`;z.hidden=false;PHO.zoom=true}
function onClick(e){if(!PHO.on)return;const t=e.target;if(!t.closest)return;
  if(t.closest('#phlabel')&&G){PHO.pop&&PHO.pop.k==='status'?PHO.closePop():PHO.openPop({k:'status'});return}
  const b=t.closest('[data-ph]');
  if(b){const a=b.dataset.ph;
    if(a==='in'||a==='out'){if(typeof V3!=='undefined')phView(a);PHO.sync();return}
    if(a==='camp'){if(typeof V3!=='undefined')phView(V3.phMode==='camp'?'fit':'camp');PHO.sync();return}
    if(a==='status'){if(PHO.pop&&PHO.pop.k==='status')PHO.closePop();else PHO.openPop({k:'status'});return}
    if(a==='pawn'){PHO.openPop({k:'pawn'});return}
    if(a==='close'){PHO.closePop();return}
    if(a==='zclose'){closeZoom();return}return}
  if(PHO.zoom){if(t.closest('#pzoom button,#pzoom input')){setTimeout(closeZoom,0);return}if(!t.closest('.zc')){closeZoom();return}return}
  if(PHO._pawn&&PHO.st==='plan2'){if(!PHO.pop||PHO.pop.k==='status')PHO.openPop({k:'pawn'});else if(PHO.pop.k==='pawn'||PHO.pop.k==='tile'){PHO.popSig=planSig()}return}
  if(t.closest('[data-gx]')&&PHO.pop&&PHO.pop.k==='status'){PHO.closePop();return}
  if(t.closest('button,input,summary,a,label,select'))return;
  const card=t.closest('#ppop .job,#campbody .row:not(.empty),#panel .thr,#panel .prio,#cardsbody .card,#panel .rv,#story .card');if(card)openZoom(card)}
})();
