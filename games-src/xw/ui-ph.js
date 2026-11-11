// ---------- phone layer (interface only, no rules): board-first layout, top-down camera with zoom/focus, tap a ship -> pop-up in the free zone ----------
// html.ph is set on a short side <= 500 px (or a touch screen <= 600 px); ?phone=1 / ?phone=0 force it. Every CSS rule for it starts with html.ph (see phone.css).
var PHN={on:false,land:false,bs:0,pop:null,popSig:'',armed:null,ctx:'',focusOn:false,fkey:'',briefSeen:null,cardKey:''};
(function(){
const R=document.documentElement;
const SVG=d=>`<svg class="ico" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const IC={focus:SVG('<circle cx="10" cy="10" r="3.2"/><circle cx="10" cy="10" r="7.2"/><path d="M10 1.5v3M10 15.5v3M1.5 10h3M15.5 10h3"/>'),plus:SVG('<path d="M10 4v12M4 10h12"/>'),minus:SVG('<path d="M4 10h12"/>'),fit:SVG('<path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4"/>')};
const forced=()=>{const m=/[?&]phone=([01])/.exec(location.search||'');return m?m[1]==='1':null};
// inside the shelf's full-screen iframe the shelf already pads by the insets (and env() reads 0 there): count them exactly once
const framed=()=>{try{return window.self!==window.top}catch(e){return true}};
function insets(){if(framed()&&!/[?&]safe=/.test(location.search||''))return {t:0,r:0,b:0,l:0};const m=/[?&]safe=([\d.]+),([\d.]+),([\d.]+),([\d.]+)/.exec(location.search||'');if(m)return {t:+m[1],r:+m[2],b:+m[3],l:+m[4]};
  try{const d=document.createElement('div');d.style.cssText='position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(d);const c=getComputedStyle(d);const r={t:parseFloat(c.paddingTop)||0,r:parseFloat(c.paddingRight)||0,b:parseFloat(c.paddingBottom)||0,l:parseFloat(c.paddingLeft)||0};d.remove();return r}catch(e){return {t:0,r:0,b:0,l:0}}}
function apply(){const w=innerWidth,h=innerHeight,short=Math.min(w,h);let coarse=false;try{coarse=matchMedia('(pointer:coarse)').matches}catch(e){}
  const f=forced();const on=f!=null?f:(short<=500||(coarse&&short<=600));const land=w>h;const was=PHN.on;
  R.classList.toggle('ph',on);R.classList.toggle('ph-l',on&&land);R.classList.toggle('ph-p',on&&!land);PHN.on=on;PHN.land=land;
  if(on){const sf=insets();const BAR=44,BARV=48,ROW=46,PANEL=210;const aw=w-sf.l-sf.r;let bs=land?Math.min(h-sf.t-sf.b,aw-BARV-300):Math.min(aw,h-sf.t-sf.b-BAR-ROW-PANEL);
    if(!land)bs=Math.max(bs,Math.round(aw*.75));bs=Math.max(200,Math.floor(bs));PHN.bs=bs;
    const st=R.style;st.setProperty('--bs',bs+'px');st.setProperty('--sat',sf.t+'px');st.setProperty('--sar',sf.r+'px');st.setProperty('--sab',sf.b+'px');st.setProperty('--sal',sf.l+'px')}
  else{['--bs','--sat','--sar','--sab','--sal'].forEach(k=>R.style.removeProperty(k))}
  if(on&&!was)PHN.build();if(on)PHN.placeCtl();
  if(typeof V3!=='undefined'&&V3.on){V3.w=0;try{resize3D()}catch(e){}if(on!==was||true){PHN.focusOn=false;try{camView('top')}catch(e){}}}
  try{if(typeof render==='function'&&G)render()}catch(e){}}
PHN.placeCtl=function(){const c=$('phctl');if(!c)return;const port=R.classList.contains('ph-p');const to=port?document.querySelector('.gx-board'):document.querySelector('.gx-dock-head');if(!to)return;
  if(port&&c.parentNode!==to)to.appendChild(c);else if(!port&&c.parentNode!==to)to.insertBefore(c,to.firstChild)};
PHN.apply=apply;
let rz=0;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(apply,60)});window.addEventListener('orientationchange',()=>setTimeout(apply,120));
// ---- one-time DOM: zoom controls in the dock head, status chip in the bar, strip + pop-up + card in the dock ----
PHN.build=function(){if(PHN.built)return;PHN.built=true;
  const head=document.querySelector('.gx-dock-head');if(head&&!$('phctl')){const c=document.createElement('div');c.id='phctl';c.className='ph-ctl';c.setAttribute('role','group');c.setAttribute('aria-label','Camera');
    c.innerHTML=`<button class="gx-ibtn" id="ph-focus" data-ph="focus" aria-pressed="false" aria-label="Focus on the active ship">${IC.focus}</button><button class="gx-ibtn" data-ph="zin" aria-label="Zoom in">${IC.plus}</button><button class="gx-ibtn" data-ph="zout" aria-label="Zoom out">${IC.minus}</button><button class="gx-ibtn" data-ph="fit" aria-label="Show the whole mat">${IC.fit}</button>`;head.insertBefore(c,head.firstChild);PHN.placeCtl()}
  {const bar=document.querySelector('.gx-bar'),sp=bar&&bar.querySelector('.gx-sp');if(sp&&!$('phcam')){const b=document.createElement('button');b.id='phcam';b.type='button';b.className='btn gx-tb ph-cam';b.setAttribute('aria-label','Camera: focus, zoom, whole mat');b.setAttribute('aria-expanded','false');b.innerHTML=IC.focus;bar.insertBefore(b,sp);
    let t=0;const R=document.documentElement;const close=()=>{R.classList.remove('camopen');b.setAttribute('aria-expanded','false')};const arm=()=>{clearTimeout(t);t=setTimeout(close,10000)};
    b.addEventListener('click',()=>{if(R.classList.toggle('camopen')){const r=bar.getBoundingClientRect();R.style.setProperty('--cam-top',(r.bottom+4)+'px');b.setAttribute('aria-expanded','true');arm()}else close()});
    document.addEventListener('pointerdown',e=>{if(!R.classList.contains('camopen'))return;if(e.target.closest('#phctl')){arm();return}if(e.target.closest('#phcam'))return;close()},true)}}
  const bar=document.querySelector('.gx-bar');if(bar&&!$('phchip')){const c=document.createElement('div');c.id='phchip';c.className='ph-chip';c.setAttribute('role','status');bar.insertBefore(c,bar.firstChild)}
  const dock=document.querySelector('.gx-dock');if(dock){const top=dock.querySelector('.gx-dock-top');
    if(!$('ps')){const e=document.createElement('div');e.id='ps';e.hidden=true;top.after(e)}
    if(!$('ppop')){const e=document.createElement('div');e.id='ppop';e.hidden=true;e.setAttribute('role','dialog');dock.appendChild(e)}
    if(!$('pc')){const e=document.createElement('div');e.id='pc';e.hidden=true;e.setAttribute('role','dialog');dock.appendChild(e)}}
  [['sndbtn','Sound'],['pausebtn','Pause the computer'],['musbtn','Music'],['hintbtn','Hints'],['speedbtn','Speed']].forEach(([id,l])=>{const b=$(id);if(b)b.setAttribute('data-phl',l)});
  document.querySelectorAll('.gx-bar .btn,.gx-gear').forEach(b=>{if(!b.getAttribute('aria-label')){const t=(b.getAttribute('title')||b.textContent||'').trim();if(t)b.setAttribute('aria-label',t.replace(/^[^\w]+/,''))}})};
// ---- camera: zoom, focus, clamp (the camera is top-down on phones; one finger pans, two fingers pinch) ----
PHN.clamp=function(){if(typeof V3==='undefined'||!V3.camera)return;const C=V3.cam;const hv=C.dist*Math.tan(V3.camera.fov*Math.PI/360);const off=Math.max(0,45.7+2-hv);C.tx=Math.max(45.7-off,Math.min(45.7+off,C.tx));C.tz=Math.max(45.7-off,Math.min(45.7+off,C.tz))};
function ease(from){if(typeof ANIM!=='undefined'&&ANIM&&!reduceMotion())V3.ez={from,t0:performance.now(),dur:420};else V3.ez=null}
function frame(pts,margin){if(!pts.length||typeof V3==='undefined'||!V3.on||!V3.camera)return;const C=V3.cam,cam=V3.camera;const from=Object.assign({},C);let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const p of pts){a=Math.min(a,p.x);b=Math.max(b,p.x);c=Math.min(c,p.z);d=Math.max(d,p.z)}
  C.tx=(a+b)/2;C.tz=(c+d)/2;const ext=Math.max(b-a,d-c,30)/2+margin;C.dist=ext/Math.tan(cam.fov*Math.PI/360);
  for(let i=0;i<10;i++){placeCam();cam.updateMatrixWorld();let m=0;for(const p of pts){const q=p.clone().project(cam);m=Math.max(m,Math.abs(q.x),Math.abs(q.y))}if(!m)break;const k=(m+ (margin/ext)*.5)/.86;C.dist*=Math.pow(k,.9);if(Math.abs(k-1)<.02)break}
  C.dist=Math.max(36,Math.min(V3.fitDist||122,C.dist));PHN.clamp();ease(from)}
function actingShip(){if(!G||G.winner)return null;if(PHN.pop&&PHN.pop.id&&ship(PHN.pop.id)&&PHN.pop.kind!=='atk')return ship(PHN.pop.id);
  if(G.phase==='plan'){const ps=planSide();const my=alive().filter(s=>s.side===ps);return ps>=0?((UI.sel&&my.find(s=>s.id===UI.sel))||my.find(s=>UI.draft[s.id]==null)||my[0]):null}
  return G.cur&&ship(G.cur)||null}
function focusPts(){const s=actingShip();if(!s)return [];const pts=[];const around=(x,y,r)=>{for(const [dx,dy] of [[-r,-r],[r,-r],[r,r],[-r,r]])pts.push(W(x+dx,y+dy,0))};const rb=B(s);around(s.x,s.y,rb*1.4);
  try{if(G.phase==='plan'&&planSide()>=0&&s.side===planSide()){const pk=UI.draft[s.id];dialOf(s).forEach((m,i)=>{if(pk!=null?i!==pk:m.s>3)return;const p=finalPose(s,rb,m);around(p.x,p.y,rb*.9)})}
    else if(G.phase==='action'&&G.cur===s.id)actionsFor(s).forEach(a=>(a.opts||[]).forEach(o=>o.p&&around(o.p.x,o.p.y,rb*.9)));
    else if(G.phase==='target'&&G.cur===s.id)weaponsFor(s).forEach(w=>w.targets.forEach(t=>{around(t.p.x,t.p.y,rb*.9)}))}catch(e){}
  if(pts.length===4){const f=fwd(s.h);around(s.x+f.x*RANGE*1.3,s.y+f.y*RANGE*1.3,rb*.9)}return pts}
PHN.focus=function(on,quiet){if(typeof V3==='undefined'||!V3.on)return;if(on==null)on=!PHN.focusOn;PHN.focusOn=on;PHN.fkey='';
  if(on){PHN.fkey=fkey();frame(focusPts(),8)}else{camView('top')}if(!quiet)syncCtl()};
function fkey(){return G?[G.round,G.phase,G.cur,UI.sel,PHN.pop&&PHN.pop.id,UI.draft&&UI.sel&&UI.draft[UI.sel]].join('|'):''}
PHN.zoom=function(k){if(typeof V3==='undefined'||!V3.on)return;const C=V3.cam,from=Object.assign({},C);C.dist=Math.max(36,Math.min(V3.fitDist||122,C.dist*k));PHN.clamp();ease(from)};
function syncCtl(){const b=$('ph-focus');if(b){b.setAttribute('aria-pressed',String(PHN.focusOn));b.classList.toggle('on',PHN.focusOn)}}
// ---- tapping the board: the nearest ship within a thumb-sized radius, else the setup spot / nothing ----
function shipPx(s){const c=V3.r.domElement,r=c.getBoundingClientRect();V3.camera.updateMatrixWorld();const pr=q=>{const v=W(q.x,q.y,0).project(V3.camera);return [(v.x+1)/2*r.width,(1-v.y)/2*r.height]};const k=corners(s,B(s)).map(pr);return Math.max(8,Math.hypot(k[0][0]-k[2][0],k[0][1]-k[2][1])*.7)}
function pickShip(x,y){let best=null,bd=1e9;V3.camera.updateMatrixWorld();const c=V3.r.domElement,r=c.getBoundingClientRect();
  for(const s of G.ships){if(!s.alive)continue;const v=W(s.x,s.y,1.2).project(V3.camera);const px=(v.x+1)/2*r.width,py=(1-v.y)/2*r.height;const d=Math.hypot(px-x,py-y);const rad=Math.max(26,shipPx(s)*.9);if(d<=rad&&d<bd){bd=d;best=s}}return best}
PHN.tap=function(e){if(!G||typeof V3==='undefined'||!V3.on)return false;const r=V3.r.domElement.getBoundingClientRect();const s=pickShip(e.clientX-r.left,e.clientY-r.top);
  if(s){PHN.shipTap(s.id);return true}if(PHN.pop){PHN.closePop();return true}return false};
PHN.shipTap=function(id){const s=ship(id);if(!s||!s.alive)return;
  if(G.phase==='plan'&&planSide()>=0&&s.side===planSide()&&!sumPending()&&!UI.info&&!UI.hold){UI.sel=s.id;PHN.openPop('dial',s.id);return}
  if(G.phase==='target'&&humanTurn()&&G.cur&&validTarget(s)){PHN.openPop('atk',s.id);return}
  PHN.openPop('info',s.id)};
function validTarget(d){const a=ship(G.cur);return !!a&&d.side!==a.side&&weaponsFor(a).some(w=>w.targets.some(t=>t.id===d.id))}
const sigNow=()=>G?[G.round,G.phase,G.cur,G.q&&G.q.kid,G.atk&&G.atk.step,planSide()].join('|'):'';
PHN.openPop=function(kind,id){PHN.pop={kind,id};PHN.popSig=sigNow();if(typeof sfx==='function')sfx('click');render()};
PHN.closePop=function(){if(!PHN.pop)return;PHN.pop=null;if(typeof V3!=='undefined')UI.hoverDial=null;render()};
// ---- pop-ups (live in the dock zone: under the board in portrait, in the right rail in landscape; they never cover the mat) ----
const COLSX=[['T',-1,'↰'],['B',-1,'↖'],['S',0,'↑'],['B',1,'↗'],['T',1,'↱'],['K',0,'⤺']];
function dialPopHTML(s){const d=dialOf(s),sug=UI.hints?suggestDial(s):-1,pick=UI.draft[s.id];const my=alive().filter(x=>x.side===s.side);const idx=my.indexOf(s);
  let g='';for(let sp=5;sp>=1;sp--){const cells=COLSX.map(([t,dd,ic])=>{const i=d.findIndex(m=>m.s===sp&&m.t===t&&(m.d||0)===dd);if(i<0)return '<span class="pm-e"></span>';const m=exColor(s,d[i]);const bad=m.c==='r'&&s.stress;const rk=rockHits(s,d[i]);
      return `<button class="mv pm ${m.c} ${pick===i?'on':''} ${sug===i?'sugg':''}" data-pd="${i}" ${bad?'disabled':''} aria-pressed="${pick===i}" aria-label="${mvWords(d[i])}, ${m.c==='r'?'red':m.c==='g'?'green':'white'}${sug===i?', recommended':''}${rk?', asteroid danger':''}${bad?', blocked while stressed':''}">${ic}${sug===i?'<em class="rs">★</em>':''}${rk?'<em class="rk">!</em>':''}</button>`}).join('');
    if(cells.includes('data-pd'))g+=`<span class="pm-sp">${sp}</span>${cells}`}
  const read=pick!=null?moveRead(s,pick):`<span class="muted">Tap a maneuver: the ghost on the mat shows where ${nm(s)} ends. Rows are speed, arrows the direction.${sug>=0?` ★ is recommended.`:''}</span>`;
  return `<div class="pp-h"><b>${nm(s)} · set the dial</b><span class="pp-n">${my.length>1?`ship ${idx+1}/${my.length}`:''}</span><button class="gx-x" data-ph="x" aria-label="Close">×</button></div>
  <div class="pp-b"><div class="pm-grid" role="group" aria-label="Maneuver dial">${g}</div><div class="pm-leg"><span class="sw g"></span>easy <span class="sw w"></span>normal <span class="sw r"></span>hard (stress)${sug>=0?' · ★ suggested':''}${d.some(m=>rockHits(s,m))?' · <b class="rkl">!</b> hits an asteroid':''}${s.stress?' · <span class="warn">stressed: red is blocked</span>':''}</div><p class="pm-read">${read}</p></div>
  <div class="pp-f">${sug>=0&&pick!==sug?`<button class="btn" data-ph="rec">★ Use suggested</button>`:''}<button class="btn primary" data-ph="set" ${pick==null?'disabled':''}>Set</button></div>`}
function atkPopHTML(d){const s=ship(G.cur);const rows=[];for(const w of weaponsFor(s))for(const t of w.targets)if(t.id===d.id){const sd=shotDice(s,w,t,d);rows.push({w,t,sd,e:expDmg(sd.atk,sd.def,s.focus>0||s.tl===d.id,d.focus>0)})}
  const best=rows.slice().sort((a,b)=>b.e-a.e)[0];const t0=rows[0];const tl=s.tl===d.id||s.tl2===d.id;
  const mods=[s.focus?'◉ your focus token turns focus results into hits':'',tl?'⌖ target lock: you may reroll dice':'',t0&&t0.t.rg===1?'range 1: +1 attack die':'',t0&&t0.t.rg===3?'range 3: +1 defence die':'',t0&&t0.t.obstructed?'a rock is in the way: +1 defence die':'',d.focus?'defender holds a focus token':'',d.evade?'defender holds an evade token':''].filter(Boolean);
  return `<div class="pp-h"><b>Shoot ${nm(d)}?</b><button class="gx-x" data-ph="x" aria-label="Close">×</button></div>
  <div class="pp-b"><p class="pp-l"><b>Range ${t0.t.rg}</b> · inside your ${s.arc==='T'?'turret':'front'} arc · ${esc(SHIPS[d.type].n)} · hull ${d.hull-hullDmg(d)}/${d.hull}${d.shMax?` · shields ${d.sh}/${d.shMax}`:''}</p>
  ${rows.map(o=>`<div class="pp-r${o===best?' rec':''}"><div class="dice-n"><b>${o.sd.atk}</b> attack dice <span class="vs">vs</span> <b>${o.sd.def}</b> defence</div><div class="small muted">${o.w.k==='P'?'Primary weapon':esc(o.w.n)} · expected ≈${o.e.toFixed(1)} damage</div></div>`).join('')}
  <ul class="pp-m">${mods.map(m=>`<li>${m}</li>`).join('')||'<li class="muted">No modifiers right now.</li>'}</ul></div>
  <div class="pp-f">${rows.map(o=>`<button class="btn ${o===best?'primary':''}" data-act="fire" data-w="${o.w.k}" data-t="${d.id}">🎯 Fire${o.w.k!=='P'?' '+esc(o.w.n):''}<small>${o.sd.atk} dice, range ${o.t.rg}</small></button>`).join('')}</div>`}
function infoPopHTML(s){const T=SHIPS[s.type],P=PILOTS[s.pilot];const hp=s.hull-hullDmg(s);const col=FACTIONS[G.fac[s.side]].col;const tok=s.alive?shipTokens(s):'destroyed';
  const crits=s.dmg.filter(x=>x.up).map(x=>`<li><b>${esc(DAMAGE[x.c].n)}</b>: ${esc(critPlain(x.c,s))}</li>`).join('');
  let extra='';if(G.phase==='target'&&humanTurn()&&G.cur&&s.side!==ship(G.cur).side&&!validTarget(s))extra=`<p class="warn small">Can't shoot it: ${esc(whyNot(ship(G.cur),s))}.</p>`;
  return `<div class="pp-h"><b style="color:var(--c${col})">${nm(s)}</b><span class="pp-n">${esc(T.n)}</span><button class="gx-x" data-ph="x" aria-label="Close">×</button></div>
  <div class="pp-b"><div class="stats big">${statSpans(s)}</div>
  <div class="pp-bars"><div>Hull ${hp}/${s.hull}<span class="bar h">${'<i></i>'.repeat(Math.max(0,hp))}${'<i class="x"></i>'.repeat(Math.max(0,s.hull-hp))}</span></div>${s.shMax?`<div>Shields ${s.sh}/${s.shMax}<span class="bar s">${'<i></i>'.repeat(s.sh)}${'<i class="x"></i>'.repeat(Math.max(0,s.shMax-s.sh))}</span></div>`:''}</div>
  <p class="small">${s.stress?'':'<b>Stress:</b> 0 · '}${tok||'no tokens'}</p>${P.t?`<p class="small"><b>Pilot:</b> ${esc(P.t)}</p>`:''}
  ${s.ups.length?`<p class="small"><b>Upgrades:</b> ${s.ups.map(u=>`<span class="${u.gone?'gone':''}">${esc(UPGRADES[u.id].n)}</span>`).join(', ')}</p>`:''}${crits?`<ul class="small pp-c">${crits}</ul>`:''}${extra}</div>
  <div class="pp-f">${typeof V3!=='undefined'&&V3.on?`<button class="btn" data-ph="zoomto" data-id="${s.id}">${IC.focus} Zoom to it</button>`:''}<button class="btn primary" data-ph="x">Close</button></div>`}
// ---- strip (planning): which ships still need a dial, recommended-for-all, lock ----
function stripHTML(){const ps=planSide();const my=alive().filter(s=>s.side===ps);const nset=my.filter(s=>UI.draft[s.id]!=null).length,all=nset===my.length;const g=guided();
  const chips=my.map(s=>{const i=UI.draft[s.id];const set=i!=null;const m=set?dialOf(s)[i]:null;return `<button class="ps-chip ${set?'set':'need'} ${UI.sel===s.id?'on':''}" data-ph="ship" data-id="${s.id}" aria-label="${esc(s.name)}: ${set?'dial set, '+mvWords(m):'needs a dial'}"><b>${esc(shortName(s))}</b><span>${set?'✓ '+esc(mvWords(m)):'needs a dial'}</span></button>`}).join('');
  return raceHTML()+`<p class="ps-t">${all?'All dials set. Lock them in.':g?`Tap ${my.length>1?'a ship':'your ship'} (on the board or below) to open its dial. A ghost shows where it would end.`:`Tap ${my.length>1?'a ship':'your ship'} to set its dial.`} <span class="muted">${all?'':`${my.length-nset} still need${my.length-nset>1?'':'s'} a maneuver.`}</span></p>
  <div class="ps-chips">${chips}</div><div class="ps-btns"><button class="btn" data-a="autodial">★ Recommended${my.length>1?' for all':''}</button><button class="btn primary" data-a="lock" ${all?'':'disabled'}>Lock in dials</button></div>`}
// ---- the render hook ----
function stage(){if(!G)return 'none';if(UI.info)return 'start';return 'game'}
function chipHTML(){if(!G)return 'Nebula Aces';const st=G.winner?'Over':G.round===0?'Setup':['','Plan','Move','Fire','End'][stepShown()]||'';const r=G.round===0||G.winner?'':'R'+roundShown();
  const who=G.winner?'':(planSide()>=0||humanTurn())?'<i class="you">you</i>':'';return `${r?`<b>${r}</b>`:''}<span>${st}</span>${who}`}
function cardHTML(){if(UI.advOpen){const a=advice();return {key:'adv',h:`<div class="pc-b"><div class="adv2"><b>🧭 ${a.say}</b> ${a.why}</div></div><div class="pp-f"><button class="btn primary" data-a="advise">Got it</button></div>`}}
  if(G&&G.round===0&&!G.winner&&PHN.briefSeen!==G.seed&&(isHuman(0)||isHuman(1))&&typeof briefingHTML==='function')return {key:'brief'+G.seed,h:`<div class="pc-b">${briefingHTML()}</div><div class="pp-f"><button class="btn primary" data-ph="briefok">Continue ▶</button></div>`};
  return null}
function phRender(){if(!PHN.on)return;PHN.build();const dock=document.querySelector('.gx-dock');if(!dock)return;
  const chip=$('phchip');if(chip){const h=chipHTML();if(chip.innerHTML!==h)chip.innerHTML=h;chip.setAttribute('aria-label',G?`Round ${roundShown()}, ${['','planning','activation','combat','end'][stepShown()]||'setup'}`:'Nebula Aces')}
  const play=!!G&&!UI.info&&UI.build==null&&!UI.rules&&!UI.stats;R.classList.toggle('ph-play',play);
  const ps=$('ps'),pp=$('ppop'),pc=$('pc');
  // pop-ups close when the situation they were about changes
  if(PHN.pop){const s=ship(PHN.pop.id);const k=PHN.pop.kind;let ok=!!G&&!!s&&s.alive&&play;
    if(ok&&k==='dial')ok=G.phase==='plan'&&planSide()>=0&&s.side===planSide()&&!sumPending()&&!UI.hold;
    else if(ok&&k==='atk')ok=G.phase==='target'&&humanTurn()&&validTarget(s);
    else if(ok&&k==='info')ok=PHN.popSig===sigNow();
    if(!ok)PHN.pop=null}
  // dice steps: if the dice, result and buttons don't fit, shrink the mat (never below 3/4) so nothing sits below the fold (testers got stuck with Done off-screen)
  {const dz=!!(play&&(['amod','dmod','damod'].includes(G.phase)||(G.phase==='ask'&&G.atk&&humanTurn())));
    if(!dz){if(R.classList.contains('ph-dice')){R.classList.remove('ph-dice');if(typeof resize3D==='function')requestAnimationFrame(()=>{try{resize3D()}catch(e){}})}}
    else if(!R.classList.contains('ph-dice')&&!PHN.diceChk){PHN.diceChk=1;requestAnimationFrame(()=>{PHN.diceChk=0;const dk=document.querySelector('.gx-dock');if(dk&&dk.scrollHeight>dk.clientHeight+4&&!PHN.land){R.classList.add('ph-dice');if(typeof resize3D==='function')requestAnimationFrame(()=>{try{resize3D()}catch(e){}})}})}}
  const strip=play&&G.phase==='plan'&&planSide()>=0&&!sumPending()&&!UI.hold;R.classList.toggle('ph-ps',strip);
  if(ps){ps.hidden=!strip;if(strip){const h=stripHTML();if(ps._h!==h){ps._h=h;ps.innerHTML=h}}else if(ps._h){ps._h=null;ps.innerHTML=''}}
  const card=play?cardHTML():null;
  R.classList.toggle('ph-card',!!card);if(card||PHN.pop){const dk=document.querySelector('.gx-dock');if(dk&&dk.scrollTop)dk.scrollTop=0}
  if(pc){pc.hidden=!card;if(card){if(pc._k!==card.key||pc._h!==card.h){pc._k=card.key;pc._h=card.h;pc.innerHTML=card.h;pc.scrollTop=0}}else pc._k=null}
  if(pp){const open=!!PHN.pop&&!card;pp.hidden=!open;R.classList.toggle('ph-pop',open);
    if(open){const s=ship(PHN.pop.id);const k=PHN.pop.kind;if(k==='dial'){UI.sel=s.id;UI.hoverDial=null}
      const h=k==='dial'?dialPopHTML(s):k==='atk'?atkPopHTML(s):infoPopHTML(s);const keep=pp.querySelector('.pp-b');const sc=keep?keep.scrollTop:0;
      if(pp._h!==h){pp._h=h;pp.innerHTML=h;pp.className='pp pp-'+k;const nb=pp.querySelector('.pp-b');if(nb)nb.scrollTop=sc}}
    else if(pp._h){pp._h=null;pp.innerHTML=''}}
  // the action step: say what the move did; barrel-roll / boost options preview before they are confirmed
  const pr=$('prompt');if(pr&&G&&G.phase==='action'&&humanTurn()&&!UI.hold&&!sumPending()){const s=ship(G.cur);if(s&&!pr.querySelector('.ph-move')){const rv=s.rev;const c=rv?exColor(s,rv).c:'w';const hd=pr.querySelector('.head');
      if(hd)hd.insertAdjacentHTML('afterend',`<div class="ph-move"><b>${nm(s)}</b> flew <b>${rv?mvWords(rv):'its move'}</b>${rv?` <span class="cw ${c}">${c==='g'?'green':c==='r'?'red':'white'}</span>`:''}${s.stress?` · <span class="warn">stress ${s.stress}</span>`:''}</div>`)}}
  const ctx=G?[G.round,G.phase,G.cur].join('|'):'';if(ctx!==PHN.ctx){PHN.ctx=ctx;PHN.armed=null;if(UI.hoverAct){UI.hoverAct=null}}
  if(PHN.armed&&!UI.hoverAct&&G&&G.phase==='action'){const q=PHN.armed.split(':');UI.hoverAct={a:q[0],i:+q[1]};try{if(V3.on)drawGuides();else render2D()}catch(e){}}
  if(PHN.armed){const b=document.querySelector(`#prompt [data-hov="${PHN.armed}"]`);if(b)b.classList.add('armed')}
  // focus follows the decision while it is on; it returns to the whole mat when you are not deciding any more
  if(PHN.focusOn){if(!G||G.winner||!(planSide()>=0||humanTurn())){PHN.focus(false,true)}else{const k=fkey();if(k!==PHN.fkey){PHN.fkey=k;frame(focusPts(),8)}}}
  syncCtl();const v=typeof V3!=='undefined'&&V3.on;R.classList.toggle('ph-3d',v)}
const _render=render;render=function(){_render();try{phRender()}catch(e){console.error(e)}};
// ---- events (capture phase, so they run before the game's own delegated handlers) ----
document.addEventListener('click',e=>{if(!PHN.on)return;const t=e.target.closest('[data-ph],[data-pd]');
  if(t&&t.dataset.pd!=null){e.stopImmediatePropagation();e.preventDefault();const s=PHN.pop&&ship(PHN.pop.id);if(!s)return;UI.draft[s.id]=+t.dataset.pd;UI.sel=s.id;UI.hoverDial=null;sfx('click');render();if(PHN.focusOn){/* keep the frame */}return}
  if(t&&t.dataset.ph){let a=t.dataset.ph;e.stopImmediatePropagation();e.preventDefault();
    if(a==='x'){PHN.closePop();return}
    if(a==='ship'){const s=ship(t.dataset.id);if(s){UI.sel=s.id;PHN.openPop('dial',s.id)}return}
    if(a==='rec'){const s=PHN.pop&&ship(PHN.pop.id);if(!s)return;UI.draft[s.id]=suggestDial(s);a='set'}// one tap: pick the suggestion and move on to the next ship

    if(a==='set'){const s=PHN.pop&&ship(PHN.pop.id);if(!s||UI.draft[s.id]==null)return;sfx('token');const my=alive().filter(x=>x.side===s.side);const nxt=my.find(x=>UI.draft[x.id]==null);PHN.pop=null;if(nxt){UI.sel=nxt.id;PHN.pop={kind:'dial',id:nxt.id};PHN.popSig=sigNow()}render();return}
    if(a==='focus'){PHN.focus();return}if(a==='zin'){PHN.zoom(.72);return}if(a==='zout'){PHN.zoom(1.38);return}if(a==='fit'){PHN.focus(false);return}
    if(a==='zoomto'){const s=ship(t.dataset.id);if(s){PHN.focusOn=true;PHN.fkey=fkey();frame([W(s.x,s.y,0),W(s.x+fwd(s.h).x*RANGE,s.y+fwd(s.h).y*RANGE,0)],8);syncCtl();PHN.closePop()}return}
    if(a==='briefok'){PHN.briefSeen=G.seed;render();return}return}
  // barrel roll / boost: first tap previews the ghost on the mat, the second tap confirms
  const b=e.target.closest('#prompt [data-hov]');if(b&&b.dataset.act==='action'&&PHN.armed!==b.dataset.hov){e.stopImmediatePropagation();e.preventDefault();PHN.armed=b.dataset.hov;const p=b.dataset.hov.split(':');UI.hoverAct={a:p[0],i:+p[1]};document.querySelectorAll('#prompt .armed').forEach(x=>x.classList.remove('armed'));b.classList.add('armed');try{if(V3.on)drawGuides();else render2D()}catch(e2){}}
  // 2D fallback: a tap on a ship opens the pop-up too
  const sg=e.target.closest('#map [data-ship]');if(sg&&!(typeof V3!=='undefined'&&V3.on)){e.stopImmediatePropagation();e.preventDefault();PHN.shipTap(sg.dataset.ship)}},true);
document.addEventListener('keydown',e=>{if(PHN.on&&e.key==='Escape'&&PHN.pop){PHN.closePop();e.stopImmediatePropagation()}},true);
apply();
if(typeof V3!=='undefined'&&V3.on)apply();else window.addEventListener('load',()=>setTimeout(apply,0));
PHN.guided=()=>typeof guided==='function'&&guided();
})();
