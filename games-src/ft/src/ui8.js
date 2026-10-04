// ---------- phone: board first, tap to play, pop-ups and one card at a time (html.ph) ----------
// Rules, engine, AI and the online protocol are untouched. Everything here is layout + presentation: it clones/rebuilds
// what the dock shows (same data-mv / data-plando / data-dc handlers) into a control strip (#ps), a pop-up (#ppop) and a card (#pc).
var PHONE={on:false,land:false,pop:null,hideAuto:'',e:1.5,mx:.7,ins:{t:0,r:0,b:0,l:0},tips:{},chDone:'',overDone:'',pawn:1.5};
try{PHONE.tips=JSON.parse(localStorage.getItem('soq_ph_tips')||'{}')||{}}catch(e){PHONE.tips={}}
function phDetect(){try{const q=new URLSearchParams(location.search).get('phone');if(q==='1')return true;if(q==='0')return false;
  const s=Math.min(innerWidth,innerHeight);return s<=500||(!!window.matchMedia&&matchMedia('(pointer:coarse)').matches&&s<=600)}catch(e){return false}}
function phInsets(){try{const P=new URLSearchParams(location.search);if(P.has('safe')){const a=P.get('safe').split(',').map(Number);return {t:a[0]||0,r:a[1]||0,b:a[2]||0,l:a[3]||0}}
  let p=document.getElementById('phprobe');if(!p){p=document.createElement('div');p.id='phprobe';p.setAttribute('aria-hidden','true');p.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(p)}
  const c=getComputedStyle(p);return {t:parseFloat(c.paddingTop)||0,r:parseFloat(c.paddingRight)||0,b:parseFloat(c.paddingBottom)||0,l:parseFloat(c.paddingLeft)||0}}catch(e){return {t:0,r:0,b:0,l:0}}}
// board height / width of the framed bazaar (tiles + a small margin) seen from the phone camera
function phAspect(){const W=(typeof G!=='undefined'&&G&&G.W)||6,H=(typeof G!=='undefined'&&G&&G.H)||5,e=PHONE.e,u=2.2+.12;return ((H*u+PHONE.mx)*Math.sin(e)+1.2*Math.cos(e))/(W*u+PHONE.mx)}
function phApply(){const R=document.documentElement,was=PHONE.on;PHONE.on=phDetect();R.classList.toggle('ph',PHONE.on);
  const vars=['--bw','--bh','--sat','--sar','--sab','--sal'];
  if(!PHONE.on){R.classList.remove('ph-l','ph-p');for(const k of vars)R.style.removeProperty(k);if(V3&&V3.on)V3.pawnScale=1;return was}
  const w=innerWidth,h=innerHeight,I=phInsets(),bar=44;PHONE.land=w>h;PHONE.ins=I;const ar=phAspect();
  const aw=w-I.l-I.r,ah=h-I.b;let bw,bh;
  if(PHONE.land){bh=ah;bw=bh/ar;const mx=aw-280;if(bw>mx){bw=mx;bh=bw*ar}}
  else{bw=aw;bh=bw*ar;const mx=ah-bar-I.t-250;if(bh>mx){bh=mx;bw=bh/ar}}
  R.classList.toggle('ph-l',PHONE.land);R.classList.toggle('ph-p',!PHONE.land);
  R.style.setProperty('--bw',Math.floor(bw)+'px');R.style.setProperty('--bh',Math.floor(bh)+'px');R.style.setProperty('--sat',I.t+'px');R.style.setProperty('--sar',I.r+'px');R.style.setProperty('--sab',I.b+'px');R.style.setProperty('--sal',I.l+'px');
  for(const [s,l] of [['.adv-btn','Advise me'],['[data-gx=logd]','Log'],['[data-gx=menud]','Menu'],['#pausebtn','Pause']]){const b=document.querySelector('.gx-bar '+s);if(b&&!b.getAttribute('aria-label'))b.setAttribute('aria-label',l)}
  if(V3&&V3.on){V3.pawnScale=PHONE.pawn;V3.zoom=1;V3.orbit.e=PHONE.e;V3.orbit.a=0;try{resize3D(true);if(G)sync3D()}catch(e){}}
  return true}
// the camera: near top-down, the tile grid (not the carved frame) fills the board
function phFit(){const cam=V3.cam,a=cam.aspect,e=PHONE.e,u=2.2+.12,W=BW()*u+PHONE.mx,D=BH()*u+PHONE.mx;const vf=cam.fov*Math.PI/180,hf=2*Math.atan(Math.tan(vf/2)*a);
  const needH=(D*Math.sin(e)+1.2*Math.cos(e))/2,needW=W/2;V3.orbit.d=Math.max(needH/Math.tan(vf/2),needW/Math.tan(hf/2))*1.01;V3.orbit.e=e;V3.orbit.a=0;V3.pawnScale=PHONE.pawn}
(function(){let t=null;const f=()=>{clearTimeout(t);t=setTimeout(()=>{phApply();if(G)phRender()},60)};addEventListener('resize',f);addEventListener('orientationchange',f);phApply()})();

// ---------- helpers ----------
const phSig=()=>G?(me()?[G.logN,G.step,G.phase,G.move?G.move.hand.length+':'+G.move.path.length:-1,!!G.q,UI.pendDj?1:0].join():'w'):'';
function phMine(){if(!G)return null;const p=online()?mySeatP():me()||G.pl.find(q=>q.human);return p||null}
function phWho(){if(!G)return '';const s=sideToAct();if(G.over)return 'Game over';if(G.phase==='bid')return s>=0&&me()?'Your bid':'bidding';return s>=0?(me()?'Your move':P(s).nm):''}
function phStep(){if(!G||G.over)return '';if(G.phase==='bid')return 'bid for turn order';return {move:G.move?'drop them':'pick a tile',tribe:'tribe action',tile:'tile action',sell:'sell goods'}[G.step]||''}
function phChip(){const c=$('#pchip');if(!c||!G)return;const s=sideToAct();const who=G.over?'Game over':me()?'You':s>=0?P(s).nm:'';
  const t=G.over?'Game over':`R${G.round} · ${who}${G.phase==='bid'?' · bid':G.phase==='turn'&&G.step&&me()?' · '+({move:'move',tribe:'tribe',tile:'tile',sell:'sell'}[G.step]||''):''}`;
  if(c.textContent!==t)c.textContent=t;c.setAttribute('aria-label',`Round ${G.round}, ${who}${G.phase==='bid'?', bidding':''}${online()?', online':''}`)}
function phPanel(el,o){if(!el)return;if(!o){if(!el.hidden){el.hidden=true;el.dataset.h=''}return}
  const h=`<div class="pp-h"><h3>${o.title}</h3>${o.x?`<button class="pp-x" data-ph="close" aria-label="Close">×</button>`:''}</div><div class="pp-b">${o.body}</div>${o.foot?`<div class="pp-f">${o.foot}</div>`:''}`;
  el.hidden=false;if(el.dataset.h!==h){const sc=el.querySelector('.pp-b'),top=sc&&el.dataset.k===o.key?sc.scrollTop:0;el.innerHTML=h;el.dataset.h=h;el.dataset.k=o.key||'';const b=el.querySelector('.pp-b');if(b)b.scrollTop=top}}
// take a prompt from the (hidden) dock, drop the long coach text
function phDock(sel){const b=$('#dockbody');return b?b.querySelector(sel):null}
function phClean(n,keepP){if(!n)return '';const c=n.cloneNode(true);for(const e of c.querySelectorAll('.coach,details,.muted.small'))e.remove();if(!keepP)for(const e of c.querySelectorAll('p:not(.small):not(.flav)'))e.remove();return c.innerHTML}

// ---------- cards: one at a time, in priority order ----------
function phCard(hp){
  if(G.over){if(PHONE.overDone===G.seed+':'+G.round)return null;const pr=phDock('.prompt');return {key:'over',title:'Result',x:false,body:pr?pr.innerHTML:'',foot:`<button class="btn go" data-ph="cont" data-k="over">Continue</button>${btn({ui:'new'},'New game')}`}}
  if(hp&&G.q){const pr=phDock('.prompt');return {key:'q',title:'Your choice',x:false,body:pr?phClean(pr,1):''}}
  const adv=hp&&UI.adv?phDock('.adv'):null;if(adv)return {key:'adv',title:'💡 Advisor',x:false,body:adv.innerHTML.replace(/^\s*<b>💡 Advisor<\/b>/,'')}
  if(PHONE.chapter&&PHONE.chapter.key!==PHONE.chDone&&!UI.modal&&G.phase==='bid'){const c=PHONE.chapter;return {key:'chapter',title:`Round ${c.round}`,x:false,body:`<h3 class="chapt">${esc(c.title)}</h3><p>${c.line}</p>`,foot:`<button class="btn go" data-ph="cont" data-k="chapter">Continue</button>`}}
  if(hp&&UI.coach){const tip=G.phase==='bid'?'bid':G.step==='move'&&!G.move?'move':G.step==='move'&&G.move?'hand':null;
    const T={bid:['Turn order','Pay coins to choose <b>when</b> you play this round. Dearer spots go first and get the best moves; free spots go last. Coins also count as points, so spend them only when a great move is at stake. The bulb in the top bar gives advice.'],
      move:['Your turn','You lift everyone off one tile and lead them across the land, leaving one person on each tile you pass. The last one lands where its own tribe already stands: you collect that tribe and put it to work. Tap a glowing tile to start, or choose a ready-made plan.'],
      hand:['Leaving people behind','Pick which colour to leave, then tap a glowing tile next to you. The last person must land on a tile that already has their colour.']};
    if(tip&&!PHONE.tips[tip])return {key:'tip-'+tip,title:T[tip][0],x:false,body:`<p>${T[tip][1]}</p>`,foot:`<button class="btn go" data-ph="cont" data-k="tip-${tip}">Continue</button>`}}
  if(hp&&G.phase==='bid'){const pr=phDock('.prompt');if(!pr)return null;const c=pr.cloneNode(true);const rec=c.querySelector('.sp.rec .btn');const ro=c.querySelector('.sp.rec');
    const top=rec&&ro?`<button class="btn go bidrec" data-mv='${esc(rec.dataset.mv)}'>★ Suggested: ${esc(ro.querySelector('.ord').textContent)} spot · ${ro.querySelector('b').textContent}</button>`:'';
    const worth=[...c.querySelectorAll('p.small')].map(e=>e.textContent).find(t=>/best move/i.test(t));
    for(const e of c.querySelectorAll('.coach,details,h3,p'))e.remove();
    return {key:'bid',title:'Bid for turn order',x:false,body:`<p class="small">Higher spots play earlier; coins are points too.${worth?' '+esc(worth):''}</p>${top}`+c.innerHTML}}
  return null}

// ---------- pop-ups (tap a chip or a tile) ----------
const phMeeples=t=>{const n={};for(const c of t.m||[])n[c]=(n[c]||0)+1;return Object.keys(n).map(c=>`<span class="phm">${mdot(c,1)} <b>${n[c]}</b> ${n[c]>1?MPLUR[c]:MNAME[c]}</span>`).join('')||'<span class="muted">nobody here</span>'};
function phInfo(i){const t=G.board[i],o=owner(t);const d=TILEDEF[t.k]||{n:t.k,x:''};
  return {key:'info',title:esc(tileName(t)),x:true,body:`<div class="phm-row">${phMeeples(t)}</div>
   <p>${esc(d.x||'')}</p><p class="small">${t.blue?'Blue tile (Masons count it).':'Red tile.'}${t.v?` Worth ${t.v} points.`:''}${t.block?' Blocked.':''}</p>
   <p>${o!=null?`Held by ${pChip(P(o))}${t.palm?' · 🌴 ×'+t.palm:''}${t.pal?' · 🏰 ×'+t.pal:''}`:'<span class="muted">Nobody holds this tile yet.</span>'}${t.tent!=null?' ⛺':''}</p>`}}
function phMarket(hp){const t=G.step==='tile'&&hp&&G.act?G.board[G.act.tile]:null;const hl=t&&t.k==='small'?3:t&&t.k==='large'?6:0;let buy='';
  if(hl){const vm=validMoves(hp.i);buy=`<div class="opts">${tileButtons(hp,vm,t)}</div>`}
  return {key:'market',title:'Market',x:true,body:`<div class="phg">${G.market.map((r,j)=>`<div class="phc ${hl&&j<hl?'hl':''}"><span class="ico">${RICON[r]}</span><b>${esc(RNAME[r])}</b><small>${j+1}</small></div>`).join('')||'<p class="muted">The market is empty.</p>'}</div>
   <p class="small">${esc(TILEDEF.small?TILEDEF.small.x:'')} ${esc(TILEDEF.large?TILEDEF.large.x:'')}</p>${buy}`}}
function phDjinns(hp){let pw='';if(hp){const vm=validMoves(hp.i);const l=[...vm.filter(m=>m.act==='djinn'),...vm.filter(m=>m.act==='item')];if(l.length)pw=`<h4>Use now</h4><div class="opts">${powerButtons(hp,l)}</div>`}
  const card=k=>`<div class="card dj"><h4>${esc(DJ[k].n)} <small>${DJ[k].vp} pts</small></h4>${cardArt('djinn',DJ[k].n)}<p>${esc(DJ[k].x)}</p></div>`;
  const th=G.ex.thieves&&G.thRow.length?`<h4>Cutpurses</h4><div class="cgrid">${G.thRow.map(k=>`<div class="card"><h4>${esc(THIEVES[k].n)}</h4><p>${esc(THIEVES[k].x)}</p></div>`).join('')}</div>`:'';
  return {key:'djinns',title:'Djinns',x:true,body:`${pw}<p class="small">Summon one at a Shrine with 2 Sages (or 1 Sage + 1 Mystic).</p><div class="cgrid">${G.djRow.map(card).join('')||'<p class="muted">None on offer.</p>'}</div>${th}`}}
function phMineP(){const p=phMine();if(!p)return {key:'mine',title:'You',x:true,body:'<p class="muted">No player here.</p>'};
  const hp=me();const items=hp&&hp.i===p.i?validMoves(p.i).filter(m=>m.act==='item'||m.act==='djinn'):[];
  return {key:'mine',title:'Your things',x:true,body:`${playerSheet(p)}${items.length?`<h4>Use now</h4><div class="opts">${powerButtons(p,items)}</div>`:''}`}}
function phPlayers(){return {key:'players',title:'Players',x:true,body:`<div class="stats">${G.pl.map(statusHtml).join('')}${standing()}</div>`}}
function phPlansP(hp){if(!hp)return null;const all=curPlans(hp);const n=UI.morePlans?12:5;return {key:'plans',title:'Plans',x:true,body:`<p class="small">A plan is a whole move. Tap Show to see its path, Do this to play it.</p><div class="plans">${all.slice(0,n).map((o,i)=>planHtml(hp,o,i)).join('')}</div>${all.length>n?`<div class="acts"><button class="btn sm ghost" data-ui="moreplans">Show more plans (${all.length})</button></div>`:UI.morePlans?`<div class="acts"><button class="btn sm ghost" data-ui="moreplans">Show fewer</button></div>`:''}`}}
function phPowers(hp){const pr=phDock('.powers');return {key:'powers',title:'Powers',x:true,body:pr?pr.innerHTML.replace(/<h4>.*?<\/h4>/,''):'<p class="muted">Nothing to use now.</p>'}}
function phPop(k,hp){switch(k.kind){case 'info':return phInfo(k.i);case 'market':return phMarket(hp);case 'djinns':return phDjinns(hp);case 'mine':return phMineP();case 'players':return phPlayers();case 'plans':return phPlansP(hp);case 'powers':return phPowers(hp)}return null}
// the decision pop-ups that open by themselves
function phHandPop(hp){const mv=G.move,vm=validMoves(hp.i),by=a=>vm.filter(m=>m.act===a),steps=by('step');const cols=[...new Set(mv.hand)];
  if(!UI.dropColor||!mv.hand.includes(UI.dropColor))UI.dropColor=cols[0];
  const next=[...new Set(steps.map(m=>m.tile))];const path=mv.path.map(i=>esc(tileName(G.board[i])));
  const undo=by('undo').map(m=>btn(m,'↶ Put them back','ghost')).join('')+(!by('undo').length&&UI.moveSnap&&!UI.autoPlan?'<button class="btn ghost" data-ui="undodrop">↶ Undo last drop</button>':'');
  const here=mv.path[0];const plans=mv.path.length===1&&UI.plans?UI.plans.map((o,i)=>({o,i})).filter(x=>x.o.s===here).slice(0,2):[];
  const ds=next.map(i=>{const ok=steps.filter(m=>m.tile===i);const m=ok.find(x=>x.c===UI.dropColor)||ok[0];return `<button class="btn drop" data-ph="drop" data-i="${i}" title="leave ${MNAME[m.c]}">⬇ ${esc(tileName(G.board[i]))} ${mdot(m.c)}</button>`}).join('');
  return {key:'hand',title:`${mv.hand.length} in hand`,x:false,body:`<div class="hand">${cols.map(c=>`<button class="hc ${UI.dropColor===c?'on':''}" data-dc="${c}" ${steps.some(m=>m.c===c)?'':'disabled'}>${mdot(c,1)}${MNAME[c]} ×${mv.hand.filter(x=>x===c).length}</button>`).join('')}</div>
   <p class="small">${UI.autoPlan?'Following your plan…':mv.hand.length===1?'<b>Last one:</b> it must land on a tile with its own colour.':'Tap a glowing tile (or one below) to leave the chosen colour.'}</p>
   ${UI.autoPlan?'':`<div class="drops">${ds}</div>`}
   <p class="small path">${path.join(' → ')}</p>
   ${plans.length?`<h4>Plans from here</h4><div class="acts">${plans.map(x=>`<button class="btn sm" data-plando="${x.i}">▶ ${esc(MNAME[x.o.c])} → ${esc(tileName(G.board[x.o.e]))} · +${Math.max(0,Math.round(x.o.v))}★</button>`).join('')}</div>`:''}
   <div class="acts">${undo}</div>`}}
function phGainPop(hp){const pr=phDock('.prompt');if(!pr)return null;let log=G.log.slice(0,2).map(l=>`<li class="${l.c}">${esc(l.t)}</li>`).join('');
  const pw=phDock('.powers');return {key:'gain',title:G.step==='tribe'?'Tribe action':G.step==='tile'?'Tile action':G.step==='sell'?'End of turn':'Your choice',x:false,body:`${phClean(pr,1)}${log?`<ol class="mini">${log}</ol>`:''}${pw?`<div class="powers">${pw.innerHTML}</div>`:''}`}}
function phAuto(hp){if(!hp||G.over||G.q||G.phase!=='turn')return null;if(G.step==='move'&&G.move&&G.move.hand&&G.move.hand.length)return phHandPop(hp);if(G.step==='tribe'||G.step==='tile'||G.step==='sell')return phGainPop(hp);return null}

// ---------- the control strip ----------
function phStrip(hp,pop,card){const m=phMine();const s=sideToAct();let msg='',acts='';
  if(G.over){msg='<b>Game over</b>';acts=`<button class="btn go" data-ph="reopen">Result</button>${btn({ui:'new'},'New game')}`}
  else if(!hp){const p=s>=0?P(s):null;msg=p?`${pChip(p)} ${online()&&p.human?'is deciding…':G.phase==='bid'?'is bidding…':'is playing…'}`:'';}
  else if(UI.pendDj){msg=`Tap a glowing tile for <b>${esc(DJ[UI.pendDj.k].n)}</b>`;acts=`<button class="btn sm" data-ui="cancelpw">Cancel</button>`}
  else if(G.phase==='bid'){msg='<b>Bid for turn order</b>'}
  else if(G.step==='move'&&!G.move){msg='<b>Your move.</b> Tap a glowing tile.';const pl=curPlans(hp);if(pl&&pl[0])acts=`<button class="btn go" data-plando="0">Best plan ▶ <small>+${Math.max(0,Math.round(pl[0].v))}★</small></button><button class="btn" data-ph="open" data-k="plans">Plans</button>`}
  else if(G.step==='move'&&G.move){msg=`<b>${G.move.hand.length} in hand.</b> Tap a glowing tile.`;if(!pop)acts=`<button class="btn go" data-ph="reopen">Open</button>`}
  else {msg=`<b>${phStep()}</b>`;if(!pop&&!card)acts=`<button class="btn go" data-ph="reopen">Open</button>`}
  const chips=[];
  if(m)chips.push(`<button class="pk wide" data-ph="open" data-k="mine" aria-label="Your things"><span class="pkn">${esc(m.nm)}</span><span class="pkv">★ <b>${shownTotal(m)}</b> · 🪙 <b>${m.coins}</b> · 🐪 <b>${m.camels}</b></span><span class="pks">🧺 ${m.res.length} · ${mdot('vizier')}${m.vz} · ${mdot('elder')}${m.el}${m.fk?' · 🔮 '+m.fk:''}</span></button>`);
  chips.push(`<button class="pk" data-ph="open" data-k="players" aria-label="Players and scores"><span class="pkn">Players</span><span class="pkv">${G.pl.map(p=>`<i class="pd" style="--pc:${PCOL[p.i]}"></i>${shownTotal(p)}`).join(' ')}</span></button>`);
  chips.push(`<button class="pk" data-ph="open" data-k="market" aria-label="Market"><span class="pkn">🛒 Market</span><span class="pkv">${G.market.map(r=>RICON[r]).join('')||'–'}</span></button>`);
  chips.push(`<button class="pk" data-ph="open" data-k="djinns" aria-label="Djinns on offer"><span class="pkn">🧞 Djinns</span><span class="pkv">${G.djRow.length} on offer</span></button>`);
  if(hp&&phDock('.powers'))chips.push(`<button class="pk" data-ph="open" data-k="powers"><span class="pkn">✨ Powers</span><span class="pkv">use now</span></button>`);
  const last=!hp&&!G.over&&G.log[0]?`<p class="ps-log">${esc(G.log[0].t)}</p>`:'';
  return `<div class="ps-main"><div class="ps-msg">${msg}</div><div class="ps-ctl">${acts}</div></div>${last}<div class="ps-chips">${chips.join('')}</div>`}

// ---------- render ----------
function phRender(){const ps=$('#ps'),pp=$('#ppop'),pc=$('#pc');if(!ps)return;
  if(!PHONE.on||!G){for(const e of [ps,pp,pc])if(e)e.hidden=true;return}
  const bk=G.W+'x'+G.H;if(PHONE.k!==bk){PHONE.k=bk;phApply()}
  const hp=me(),sig=phSig();if(PHONE.pop&&PHONE.pop.sig!==sig)PHONE.pop=null;if(PHONE.hideAuto&&PHONE.hideAuto!==sig)PHONE.hideAuto='';
  phChip();let card=null,pop=null;
  try{card=phCard(hp);pop=PHONE.pop?phPop(PHONE.pop,hp):PHONE.hideAuto?null:phAuto(hp);if(PHONE.pop&&!pop)PHONE.pop=null}catch(e){console.error(e)}
  ps.hidden=false;const h=phStrip(hp,pop,card);if(ps.dataset.h!==h){ps.innerHTML=h;ps.dataset.h=h}
  phPanel(pp,pop);phPanel(pc,card);document.documentElement.classList.toggle('ph-pop',!!pop&&!card);document.documentElement.classList.toggle('ph-card',!!card)}

// ---------- input ----------
const phBoardTap=on3DTile;
on3DTile=function(i){if(!PHONE.on||!G)return phBoardTap(i);const p=me();PHONE.pop=null;
  if(p&&!G.q&&(UI.pick||[]).includes(i)&&!(PHONE.chapter&&0))return phBoardTap(i);
  PHONE.pop={kind:'info',i,sig:phSig()};phRender()};
const phShowChapter=showChapter;
showChapter=function(){if(!PHONE.on)return phShowChapter();const key=G.round+'_'+G.seed;if(UI.chapterShown===key)return;UI.chapterShown=key;
  const sc=G.pl.map(p=>({p,t:scoreOf(p).total})).sort((x,y)=>y.t-x.t);const low=G.pl.filter(p=>p.camels<=3);
  PHONE.chapter={key,round:G.round,title:chapterTitle(G.round),line:G.round===1?'Bid for turn order, then each player takes their turn.':`${esc(sc[0].p.nm)} leads with ${sc[0].t} points.`+(low.length?` Only ${Math.min(...low.map(p=>p.camels))} camels left for ${esc(low[0].nm)}: the end is near.`:'')}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ph]');if(!b||!PHONE.on)return;const a=b.dataset.ph,d=b.dataset;
  if(a==='open'){PHONE.pop={kind:d.k,sig:phSig()};phRender()}
  else if(a==='close'){if(PHONE.pop)PHONE.pop=null;else PHONE.hideAuto=phSig();phRender()}
  else if(a==='reopen'){PHONE.pop=null;PHONE.hideAuto='';if(G&&G.over)PHONE.overDone='';phRender()}
  else if(a==='drop'){PHONE.pop=null;on3DTile(+d.i)}
  else if(a==='cont'){if(d.k==='chapter')PHONE.chDone=PHONE.chapter&&PHONE.chapter.key;else if(d.k==='over')PHONE.overDone=G.seed+':'+G.round;else if(/^tip-/.test(d.k)){PHONE.tips[d.k.slice(4)]=1;try{localStorage.setItem('soq_ph_tips',JSON.stringify(PHONE.tips))}catch(x){}}
    phRender()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&PHONE.on&&PHONE.pop&&!GX.open){PHONE.pop=null;phRender();e.stopImmediatePropagation()}},true);
// a new game: forget what the last one hid
const phBegin=beginGame;beginGame=function(){PHONE.pop=null;PHONE.hideAuto='';PHONE.chapter=null;PHONE.chDone='';PHONE.overDone='';return phBegin.apply(this,arguments)};
document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('#ppop,#pc,#ps'))UI.dockTouch=Date.now()},true);
