// ---------- UI: the valley fills the screen; the dock says what to do now; everything else is a popup ----------
const $=s=>document.querySelector(s);const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
Object.assign(UI,{cells:[],ghost:null,spotOpts:[],kind:'f',advice:null,recap:null,fxSeen:0,modal:null,guide:true,seen:{},storySeen:0,tt:null});
try{UI.guide=localStorage.getItem('rv_guide')!=='0';UI.seen=JSON.parse(localStorage.getItem('rv_seen')||'{}')||{}}catch(e){}
// ---------- inline SVG icons (one consistent line style instead of mixed emoji) ----------
const ICP={bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
  fit:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',players:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.6 3-5.5 6-5.5s5.4 1.9 6 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.2 14.6c2.6.1 4.3 1.8 4.9 4.9"/>',
  scroll:'<path d="M7 3.5h11v13.5a3 3 0 0 1-3 3H6.5A2.5 2.5 0 0 1 4 17.5V17h10v.5a2.5 2.5 0 0 0 2.5 2.5"/><path d="M7 3.5A2 2 0 0 0 5 5.5V7h2M9.5 8h5.5M9.5 11.5h5.5"/>',
  tile:'<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M12 20.5V15a2.5 2.5 0 0 0-2.5-2.5h-6"/><path d="M13.5 3.5c.5 3.2 3 5.6 7 5.8"/>',
  book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 21H20M8 7.5h8"/>',
  guide:'<path d="M2.5 9L12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.8c1.8 1.5 3.7 2.2 5.5 2.2s3.7-.7 5.5-2.2V11M21.5 9v5"/>',
  snd:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',sndoff:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/>',
  mus:'<path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',musoff:'<path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/><path d="M3 3l18 18"/>',
  ff:'<path d="M3.5 6.5l7 5.5-7 5.5zM12 6.5l7 5.5-7 5.5z" fill="currentColor"/>',pause:'<path d="M8.5 5v14M15.5 5v14"/>',play:'<path d="M7.5 5l11 7-11 7z" fill="currentColor"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/>',
  vert:'<path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4"/>',hide:'<path d="M4 12h11M11 7l5 5-5 5M20 5v14"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  meeple:'<path d="M12 17.4Q13.02 20.8 14.04 22.5Q16.42 22.5 18.46 22.5Q19.65 22.5 19.14 21.14Q18.29 17.4 16.42 15.02Q17.61 13.83 19.82 13.49Q21.52 12.81 20.5 11.54Q18.12 10.43 15.06 10.6Q13.96 10.6 13.87 9.75A2.64 2.64 0 1 0 10.13 9.75Q10.04 10.6 8.94 10.6Q5.88 10.43 3.5 11.54Q2.48 12.81 4.18 13.49Q6.39 13.83 7.58 15.02Q5.71 17.4 4.86 21.14Q4.35 22.5 5.54 22.5Q7.58 22.5 9.96 22.5Q10.98 20.8 12 17.4Z" fill="currentColor" stroke="none"/>',
  champ:'<path d="M12 16.1Q13.14 19.9 14.28 21.8Q16.94 21.8 19.22 21.8Q20.55 21.8 19.98 20.28Q19.03 16.1 16.94 13.44Q18.27 12.11 20.74 11.73Q22.64 10.97 21.5 9.54Q18.84 8.31 15.42 8.5Q14.19 8.5 14.09 7.55A2.96 2.96 0 1 0 9.91 7.55Q9.81 8.5 8.58 8.5Q5.16 8.31 2.5 9.54Q1.36 10.97 3.26 11.73Q5.73 12.11 7.06 13.44Q4.97 16.1 4.02 20.28Q3.45 21.8 4.78 21.8Q7.06 21.8 9.72 21.8Q10.86 19.9 12 16.1Z" fill="currentColor" stroke="none"/><path d="M12 9.6l.85 1.7 1.9.28-1.37 1.33.32 1.88L12 13.9l-1.7.89.32-1.88-1.37-1.33 1.9-.28z" fill="#fff" fill-opacity=".85" stroke="none"/>',
  mason:'<path d="M13.5 3.5l6.5 6.5-2.6 2.6-6.5-6.5z" fill="currentColor"/><path d="M12.6 8.6l-8 8a1.9 1.9 0 0 0 2.7 2.7l8-8"/>',
  hog:'<path d="M4.6 10.2c1-3 4-4.6 7.7-4.6 1.3 0 2.5.2 3.5.6l1.9-1.7.3 3c1 .8 1.6 1.7 1.9 2.7h1.9v3h-2c-.5 1.3-1.4 2.3-2.7 3V19h-2.6v-2.1c-.8.2-1.6.3-2.5.3s-1.8-.1-2.6-.3V19H6.8v-3.1c-1.3-1-2.1-2.4-2.2-4l-1.8.8-.5-1.6z" fill="currentColor" stroke="none"/>',
  wine:'<g fill="currentColor" stroke="none"><circle cx="9" cy="10" r="2.4"/><circle cx="14" cy="10" r="2.4"/><circle cx="11.5" cy="14.2" r="2.4"/><circle cx="16.3" cy="14.2" r="2.1"/><circle cx="13.6" cy="18.3" r="2.2"/></g><path d="M12 7.2c0-2 1.4-3.6 3.6-4"/>',
  grain:'<path d="M12 21.5V8"/><path d="M12 8c-2-1-3-3-3-5 2 .6 3 2.3 3 5zM12 8c2-1 3-3 3-5-2 .6-3 2.3-3 5zM12 12.8c-2-1-3.4-2.6-3.6-4.6 2 .4 3.3 2 3.6 4.6zM12 12.8c2-1 3.4-2.6 3.6-4.6-2 .4-3.3 2-3.6 4.6zM12 17.6c-2-1-3.4-2.6-3.6-4.6 2 .4 3.3 2 3.6 4.6zM12 17.6c2-1 3.4-2.6 3.6-4.6-2 .4-3.3 2-3.6 4.6z" fill="currentColor"/>',
  cloth:'<path d="M5.5 4h13M5.5 20h13"/><rect x="8" y="6" width="8" height="12" rx="1.2"/><path d="M8 9.5h8M8 13h8M16 16.5l3 3"/>',
  talk:'<path d="M4 5h16v10.5H10L5 19.5v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/>',trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20.5h7M9.5 17h5"/>',
  person:'<circle cx="12" cy="8" r="3.6"/><path d="M5 20.5c.8-4 3.6-6.2 7-6.2s6.2 2.2 7 6.2"/>',robot:'<rect x="5" y="7.5" width="14" height="11" rx="3"/><path d="M12 7.5V4.5M9.2 12.4h.01M14.8 12.4h.01M9.5 15.6h5M3 12v2.5M21 12v2.5"/>',
  join:'<path d="M5 12h14M12 5v14"/>',clash:'<path d="M5 5l14 14M19 5L5 19M4 8V4h4M20 8V4h-4"/>'};
function ico(n,cls){const p=ICP[n];return p?`<i class="ic${cls?' '+cls:''}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg></i>`:''}
const EMO={'🔨':'mason','🐖':'hog','♟':'meeple','♜':'champ','🍷':'wine','🌾':'grain','🧵':'cloth','💡':'bulb','⤢':'fit','🗣':'talk','🎓':'guide','🂠':'tile','📜':'scroll','🏆':'trophy','🙂':'person','🤖':'robot','🧩':'tile','👥':'players','📖':'book','➕':'join','⚔':'clash'};
const EMO_RE=new RegExp(Object.keys(EMO).join('|'),'g');
function iconize(h){return String(h).replace(EMO_RE,m=>ico(EMO[m]))}
function paintIcons(root){for(const el of (root||document).querySelectorAll('i[data-ic]'))if(!el.firstChild)el.outerHTML=ico(el.dataset.ic)}
function saveSeen(){try{localStorage.setItem('rv_seen',JSON.stringify(UI.seen))}catch(e){}}
const me=()=>{if(!G||G.over)return null;const s=sideToAct();if(NET.on&&(s!==NET.mySeat||netWaiting()||NET.hostGone))return null;return s>=0&&P(s).human?P(s):null};
const human=()=>G&&G.pl.some(p=>p.human);
function refresh(){if(G&&!NET.on){try{if(!G.over&&human())localStorage.setItem(SAVE,JSON.stringify(G));else if(G.over)localStorage.removeItem(SAVE)}catch(e){}}
  if(!G){render();return}computeUI();playFx();netTurnCue();render();try{sync3D();autoFit()}catch(e){console.error(e)}schedule()}
// at the start of a human placement, make sure every glowing square is on screen
function autoFit(){if(!V3.on||!me()||G.step!=='place'||UI.fitTurn===G.turn)return;UI.fitTurn=G.turn;const R=V3.r.domElement;const off=(PHN.on&&PHN.tilePx()<PHN.MIN*.9)||(PHN.on?UI.cells.every:UI.cells.some).call(UI.cells,k=>{const [x,y]=unkey(k);const v=screenOf(cellWorld(x,y));return !v.in||v.x<50||v.y<50||v.x>R.clientWidth-50||v.y>R.clientHeight-50});if(off)fitAll(false)}
// what glows for the human now
function computeUI(){const p=me();UI.cells=[];UI.spotOpts=[];
  if(!p){UI.ghost=null;UI.advice=null;return}
  if(UI.advice&&UI.advice.turn!==G.turn+':'+G.step)UI.advice=null;
  if(G.step==='place'){const L=legalPlacements(G.cur.t);UI.cells=[...new Set(L.map(q=>key(q.x,q.y)))];
    if(UI.ghost&&(UI.ghost.t!==G.cur.t||UI.ghost.turn!==G.turn||!UI.cells.includes(UI.ghost.k)))UI.ghost=null;if(UI.ghost)UI.ghost.rots=L.filter(q=>key(q.x,q.y)===UI.ghost.k).map(q=>q.r)}
  else UI.ghost=null;
  if(G.step==='fig'){const ms=figMoves(p.i).filter(m=>m.act==='fig');const kinds=[...new Set(ms.map(m=>m.k))];if(!kinds.includes(UI.kind))UI.kind=kinds[0]||'f';
    UI.spotOpts=ms.filter(m=>m.k===UI.kind).map(m=>({l:m.l,k:m.k,adv:UI.advice&&same(UI.advice.fig,m)}))}}
// ---------- sound + animation cues ----------
function playFx(){for(const f of UI.fx.slice(UI.fxSeen)){if(PHN.on)PHN.fx(f);if(f.t==='turn'&&NET.on&&f.x===NET.mySeat)continue;if(typeof sfx==='function')sfx({place:'place',fig:'fig',score:'score',home:'home',goods:'goods',story:'story',win:'win',turn:'turn',discard:'bad'}[f.t]||'');
    if(f.t==='score'&&V3.on&&f.x&&G.fd[f.x.r]){const F=G.fd[f.x.r];let pos;if(F.ty==='M')pos=cellWorld(F.x,F.y);else{let sx=0,sz=0;for(const k of F.tiles){const [x,y]=unkey(k);sx+=x;sz+=y}pos=cellWorld(sx/F.tiles.length,sz/F.tiles.length)}scorePop('+'+f.x.pts,PCOL[f.x.win[0]],pos)}}
  UI.fxSeen=UI.fx.length;if(UI.fx.length>40){UI.fx.splice(0,30);UI.fxSeen=UI.fx.length}}
// ---------- words ----------
function pChip(p){return `<span class="pc" style="--pc:${PCOL[p.i]}"><i></i>${esc(p.nm)}</span>`}
function lower1(s){return s.charAt(0).toLowerCase()+s.slice(1)}
function tileWords(t){return lower1(TT[t].n).replace(/^starting tile: /,'')}
function figIcons(p){const s=p.sup;return `<span title="followers left">♟${s.f}</span>${G.ex.ic?` <span title="champion (counts as 2)" class="${s.big?'':'off'}">♜</span>`:''}${G.ex.tb?` <span title="mason" class="${s.bld?'':'off'}">🔨</span> <span title="hog" class="${s.pig?'':'off'}">🐖</span>`:''}`}
function goodsIcons(p){return G.ex.tb?` <span title="wine, grain, cloth">🍷${p.goods.wine} 🌾${p.goods.grain} 🧵${p.goods.cloth}</span>`:''}
function statRow(p){const cur=sideToAct()===p.i;return `<div class="stat ${cur?'cur':''}" style="--pc:${PCOL[p.i]}"><b>${esc(p.nm)}</b>${NET.on&&p.i===NET.mySeat?' <small class="you">(you)</small>':''}${p.human?'':`<small class="muted">${p.away?'away · computer':p.lv}</small>`} ${figIcons(p)}${goodsIcons(p)} <span class="tot" title="points">★ ${p.score}</span></div>`}
function tileCard(t,r,big){const th=big&&typeof tileThumb==="function"&&tileThumb(t);if(th)return `<img class="tcard tthumb" alt="" src="${th}" style="transform:rotate(${(r||0)*90}deg)">`;return `<svg class="tcard" viewBox="-4 -4 108 108" aria-hidden="true"><rect x="-4" y="-4" width="108" height="108" rx="8" fill="#6b4f35"/><g transform="rotate(${(r||0)*90} 50 50)">${tileSVG(t)}</g></svg>`}
function featLine(ty,F,figs,forMe){// preview: points if finished now, points at the end, who holds it
  const n=F.tiles?F.tiles.length:0;let now='',end='';
  if(ty==='C'){now=F.cat?3*(n+F.pen):2*(n+F.pen);end=F.cat?0:n+F.pen}else if(ty==='R'){now=F.inn?2*n:n;end=F.inn?0:n}else if(ty==='M'){now=9;end=nbrCount(F.x,F.y)}
  else{const c=fieldCities(F).size;const pig=figs.some(f=>f.k==='pig'&&f.p===forMe);end=c*(pig?4:3);now=null}
  const s=strength(figs);const top=Math.max(0,...Object.values(s));const lead=top?Object.keys(s).filter(k=>s[k]===top).map(Number):[];
  const who=!lead.length?'nobody there yet':lead.length===1?(lead[0]===forMe?'you hold it':P(lead[0]).nm+' holds it'):'shared: '+lead.map(i=>i===forMe?'you':P(i).nm).join(' & ');
  const size=ty==='C'?`${n} tile${n>1?'s':''}${F.pen?`, ${F.pen} banner${F.pen>1?'s':''}`:''}${F.cat?', basilica':''}, ${F.oe.length} open side${F.oe.length===1?'':'s'}`:ty==='R'?`${n} tile${n>1?'s':''}${F.inn?', tavern':''}, ${F.oe.length} open end${F.oe.length===1?'':'s'}`:ty==='M'?`${nbrCount(F.x,F.y)-1} of 8 neighbours`:`${fieldCities(F).size} finished town${fieldCities(F).size===1?'':'s'} beside it`;
  return {size,now,end,who}}
function optLabel(m,p){const T=G.tiles[G.cur.k];const s=TSEG[T.t][m.l];const r=find(T.s0+m.l);const F=G.fd[r];const figs=figsIn(r);const fl=featLine(s.ty,F,figs,p.i);
  const role=m.k==='f'?ROLE[s.ty]:FIGN[m.k];const where=segWhere(G.cur.k,m.l);const head=m.k==='bld'?`🔨 Mason on your ${where}${FEAT[s.ty]}`:m.k==='pig'?`🐖 Hog beside your farmer (${where}field)`:`${m.k==='big'?'♜ Champion':'♟ '+role.charAt(0).toUpperCase()+role.slice(1)} on the ${where}${FEAT[s.ty]}`;
  let pts;if(m.k==='bld')pts='each later tile that extends it gives you an extra turn';else if(m.k==='pig')pts=`+1 per finished town at the end (now ${fieldCities(F).size})`;
  else pts=s.ty==='F'?`at the end: ${fl.end} now (3 per finished town${openTowns(F)?`; ${openTowns(F)} unfinished town${openTowns(F)>1?'s':''} beside it could add ${3*openTowns(F)}`:''})`:`finished now: ${fl.now} · at the end: ${fl.end}`;
  return `<b>${head}</b><small>${fl.size} · ${pts} · ${fl.who}</small>`}
// what a placement would do (shown before it is confirmed)
function openTowns(F){const s=new Set();for(const c of F.ct){const r=find(c);if(!G.fd[r].done)s.add(r)}return s.size}
function segWhere(k,l){const T=G.tiles[k];const segs=TSEG[T.t];const ty=segs[l].ty;if(ty==='M'||segs.filter(s=>s.ty===ty).length<2)return '';const sp=rotP(buildGeo(T.t).spots[l],T.r);const dx=sp[0]-50,dy=sp[1]-50;if(Math.hypot(dx,dy)<10)return 'middle ';
  const a=Math.round(Math.atan2(dx,-dy)/(Math.PI/4));return ['north','north-east','east','south-east','south','south-west','west','north-west','north'][(a+8)%8]+' '}
function placementPreview(t,r,x,y,pi){const pr=probe(t,r,x,y);const out=[];const nm=i=>i===pi?'you':P(i).nm;
  for(const g of pr.groups){if(g.ty==='F')continue;const own=[...new Set(g.figs.map(f=>f.p))];
    if(g.done&&g.ty!=='M'){const pts=g.ty==='C'?(g.cat?3:2)*(g.tiles+g.pen):(g.inn?2:1)*g.tiles;const win=majority(g.figs);out.push(`✔ Finishes a ${FEAT[g.ty]} worth ${pts}${win.length?': '+win.map(nm).join(' & ')+' score':' (nobody in it)'}`);continue}
    if(g.roots.length&&own.length)out.push(`➕ Extends ${own.map(i=>i===pi?'your':P(i).nm+'’s').join(' & ')} ${FEAT[g.ty]}${g.ty!=='M'?` (${g.tiles} tiles, ${g.oe.length} open)`:''}`);
    if(g.roots.length>1&&own.length>1)out.push(`⚔ Joins two occupied ${FEAT[g.ty]}s: the most followers takes it`)}
  for(const r2 of pr.mons){const fs=figsIn(r2);if(fs.length)out.push(`✔ Surrounds a priory: ${majority(fs).map(nm).join(' & ')} score 9`)}
  if(G.ex.tb&&!G.cur.bonus){const b=G.figs.find(f=>f.p===pi&&f.k==='bld');if(b){const br=find(b.s);if(pr.groups.some(g=>g.roots.includes(br)))out.push('🔨 Extends your mason’s feature: extra turn')}}
  return out}
// ---------- rendering ----------
function render(){renderModal();if(!G)return;renderDock();renderPopups();renderMap2D();renderBar();if(PHN.on)PHN.render()}
function renderBar(){const pb=$('#pausebtn');if(pb){pb.hidden=!G||human()||!!G.over;pb.innerHTML=ico(UI.pause?'play':'pause')}const sb=$('#speedbtn');if(sb)sb.innerHTML=ico('ff')+' '+({0.5:'slow',1:'normal',3:'fast'}[UI.speed]||'normal');
  const gb=$('#guidebtn');if(gb){gb.classList.toggle('on',UI.guide);gb.setAttribute('aria-pressed',UI.guide?'true':'false')}
  const ab=$('#advbtn');if(ab)ab.disabled=!me();
  const ch=$('#chip');if(ch){const s=sideToAct();const ns=NET.on&&!NET.inLobby?`<span class="netst${NET.hostGone?' bad':''}">🌐 ${esc(netStatus())}</span> · `:'';ch.innerHTML=(G.over?ns+'Game over':ns+iconize(`🂠 <b>${tilesLeft()}</b> tiles left · ${s>=0?`<span style="color:${PCOL[s]}">●</span> ${esc(P(s).nm)}${NET.on&&s===NET.mySeat?' (you)':''}`:''}`))}}
function renderDock(){const el=$('#dockbody');if(!el)return;const s=sideToAct();const p=s>=0?P(s):null;const hp=me();let h='';
  const dt=$('#dockt');if(dt)dt.textContent=G.over?'Game over':NET.on&&NET.hostGone?'The host left':hp?`${hp.nm}: ${G.step==='place'?'place your tile':'place a follower?'}${G.cur.bonus?' (extra turn)':''}`:p?`${p.nm} is playing…`:'';
  // story beats from the last turns
  const st=G.story.filter(x=>x.n>=G.turn-G.np);if(st.length)h+=`<div class="story">📜 ${esc(st[st.length-1].t)}</div>`;
  h+=`<div class="stats">${G.pl.map(statRow).join('')}</div>`;
  if(G.over){h+=scoreTable()+`<div class="acts"><button class="btn go" data-ui="new">New game</button><button class="btn" data-a="fit">⤢ See the whole valley</button></div>`;el.innerHTML=iconize(h);return}
  if(NET.on&&NET.hostGone){h=`<div class="prompt"><h3>The host left. The game is over.</h3><p class="small">The game ran on the host’s page, so it cannot go on without it.</p><div class="acts"><button class="btn go" data-net="leave">Back to the start</button></div></div>`+h;el.innerHTML=iconize(h);return}
  const t=G.cur.t;
  if(!hp){const wait=NET.on&&p.human?(p.i===NET.mySeat?'<p class="small wait">Sending your move to the host…</p>':`<p class="small wait">Waiting for ${esc(p.nm)}…</p>`):'';
    h+=`<div class="prompt"><div class="trow">${tileCard(t,0)}<div><h3>${esc(p.nm)} ${G.step==='place'?'is placing':'placed'} ${esc(tileWords(t))}</h3><p class="muted small">${tilesLeft()} tiles left in the bag</p></div></div>${wait}</div>`;
    if(UI.recap)h+=`<div class="recap">🗣 ${UI.recap.html}</div>`;h+=lastLog(4);el.innerHTML=iconize(h);return}
  if(UI.mine&&UI.mine.p===hp.i)h+=`<div class="recap mine">✔ ${UI.mine.html}</div>`;
  if(UI.recap&&UI.recap.n>=G.turn-G.np)h+=`<div class="recap">🗣 ${UI.recap.html}</div>`;
  if(G.step==='place'){const gh=UI.ghost;h+=`<div class="prompt"><div class="trow">${tileCard(t,gh?gh.r:0,1)}<div><h3>Your tile: ${esc(tileWords(t))}</h3><p class="muted small">${tilesLeft()} tiles left after this one${G.cur.bonus?' · 🔨 mason’s extra turn':''}</p></div></div>`;
    if(UI.guide)h+=coach(gh?'ghost':'place');
    if(!gh)h+=`<p>Tap a <b class="gl">glowing square</b> on the map to try your tile there (${UI.cells.length} square${UI.cells.length===1?'':'s'} fit).</p>`;
    else{const pv=placementPreview(t,gh.r,...unkey(gh.k),hp.i);h+=`<p>${gh.rots.length>1?`It fits here ${gh.rots.length} ways: turn it with ⟳ or tap the square again.`:'It fits here one way.'}</p>${pv.length?`<ul class="pv">${pv.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
      <div class="acts">${gh.rots.length>1?`<button class="btn" data-ui="rotl" aria-label="Turn left">⟲</button><button class="btn" data-ui="rotr" aria-label="Turn right">⟳ Turn</button>`:''}<button class="btn go" data-ui="confirm">✓ Place here</button><button class="btn ghost" data-ui="cancel">✕</button></div>`}
    h+=adviceBox()+`<div class="acts"><button class="btn sm" data-a="adv">💡 What would you do?</button><button class="btn sm ghost" data-a="fit">⤢ Fit all</button></div></div>`}
  else if(G.step==='fig'){const ms=figMoves(hp.i).filter(m=>m.act==='fig');const kinds=[...new Set(ms.map(m=>m.k))];
    h+=`<div class="prompt"><h3>Place a follower? <small class="muted">(${hp.sup.f} left)</small></h3>`;if(UI.guide)h+=coach('fig',ms);
    if(kinds.length>1)h+=`<div class="kinds">${kinds.map(k=>`<button class="hc ${UI.kind===k?'on':''}" data-kind="${k}">${{f:'♟ Follower',big:'♜ Champion',bld:'🔨 Mason',pig:'🐖 Hog'}[k]}</button>`).join('')}</div>`;
    h+=`<p class="small">Tap a <b class="gl">glowing ring</b> on the new tile, or choose:</p><div class="opts">${ms.filter(m=>m.k===UI.kind).map(m=>`<button class="btn opt ${UI.advice&&same(UI.advice.fig,m)?'adv':''}" data-mv='${esc(JSON.stringify(m))}'>${optLabel(m,hp)}</button>`).join('')}
      <button class="btn go" data-mv='${esc(JSON.stringify({act:'skip'}))}'>No follower — end my turn</button></div>${adviceBox()}<div class="acts"><button class="btn sm" data-a="adv">💡 What would you do?</button></div></div>`}
  h+=lastLog(3);el.innerHTML=iconize(h);const sig=G.turn+':'+G.step;if(UI.dsig!==sig){UI.dsig=sig;el.scrollTop=0}GX.showDock()}
function adviceBox(){const a=UI.advice;if(!a)return '';return `<div class="advice"><b>💡 Advice:</b> ${esc(a.text)} <button class="btn sm go" data-ui="apply">Do it</button></div>`}
function lastLog(n){return `<ol class="mini">${G.log.slice(0,n).map(l=>`<li class="${l.c}">${esc(l.t)}</li>`).join('')}</ol>`}
// guided first game: plain words for each step, and one-time notes when something new shows up
function coach(step,ms){let t='';const once=(k,txt)=>{if(!UI.seen[k]){UI.seen[k]=G.turn;saveSeen()}return UI.seen[k]>=G.turn-1?txt:''};
  if(step==='place')t+=`Tap a glowing square to try your tile there. Edges must match: town to town, road to road, field to field${G.rv?', river to river':''}.`+once('pan',' Drag to move the map, pinch or scroll to zoom.');
  const hp0=me();if(hp0&&hp0.sup.f===0&&(step==='place'||step==='fig'))t+=once('nof'+G.turn,' <br><b>No followers left.</b> They come home when their road, town or priory is finished (farmers never do), so try to finish what you started.');
  else if(hp0&&hp0.sup.f<=2&&step==='fig')t+=once('few',' You have only '+hp0.sup.f+' follower'+(hp0.sup.f>1?'':'')+' left: keep one for a road or town you can finish soon.');
  if(step==='ghost')t='The tile hovers over the square. Turn it with ⟳ if you like, check the list below, then press ✓ Place here.';
  if(step==='fig'){t+=' You may put ONE follower on this tile, only where nobody stands yet. It scores and comes home when its road, town or priory is finished.';
    if(ms&&ms.some(m=>m.act==='fig'&&TSEG[G.tiles[G.cur.k].t][m.l].ty==='F'))t+=once('farm',' <br><b>Farmers</b> never come home. At the end a field pays 3 per finished town it touches to whoever has most farmers there.');
    if(ms&&ms.some(m=>m.k==='big'))t+=once('big',' <br><b>Champion:</b> counts as two followers.');
    if(ms&&ms.some(m=>m.k==='bld'))t+=once('bld',' <br><b>Mason:</b> goes where you already have a follower; extend that road or town later for an extra turn.');
    if(ms&&ms.some(m=>m.k==='pig'))t+=once('pig',' <br><b>Hog:</b> joins your farmer; the field pays 4 per town instead of 3.')}
  return t?`<div class="coach">🎓 ${t}</div>`:''}
function scoreTable(){const rows=[['Roads (finished)',p=>p.sc.road],['Towns (finished)',p=>p.sc.town],['Priories (finished)',p=>p.sc.priory],['Unfinished roads',p=>p.end.road],['Unfinished towns',p=>p.end.town],['Unfinished priories',p=>p.end.priory],['Farmers',p=>p.end.field]];if(G.ex.tb)rows.push(['Goods majorities',p=>p.end.goods]);rows.push(['★ Total',p=>p.score]);
  return `<div class="prompt"><h3>🏆 ${esc(G.winText)}</h3><div class="tw"><table><tr><th></th>${G.pl.map(p=>`<th>${pChip(p)}</th>`).join('')}</tr>${rows.map(([n,f],i)=>`<tr class="${i===rows.length-1?'tot':''}"><td>${n}</td>${G.pl.map(p=>`<td>${f(p)}</td>`).join('')}</tr>`).join('')}</table></div></div>`}
// ---------- popups ----------
function renderPopups(){if(GX.open==='logd')$('#logbody').innerHTML=iconize(`<ol class="log">${G.log.slice(0,400).map(l=>`<li class="${l.c}"><small>${l.n}</small> ${esc(l.t)}</li>`).join('')}</ol>`);
  if(GX.open==='plrd')$('#plrbody').innerHTML=iconize(playersHtml())}
function playersHtml(){const fs=finalScores();return G.pl.map(p=>{const a=fs.add[p.i];const endNow=Object.values(a).reduce((x,y)=>x+y,0);
  return `<section class="sheet" style="--pc:${PCOL[p.i]}"><h3>${pChip(p)} ${p.human?'':'<small>(computer, '+p.lv+')</small>'} <span class="tot">★ ${p.score}</span></h3>
  <div>${figIcons(p)}${goodsIcons(p)}</div>
  <div class="small">Scored so far: roads ${p.sc.road}, towns ${p.sc.town}, priories ${p.sc.priory}${G.over?`; at the end: roads ${p.end.road}, towns ${p.end.town}, priories ${p.end.priory}, farmers ${p.end.field}${G.ex.tb?', goods '+p.end.goods:''}`:''}.</div>
  ${G.over?'':`<div class="small muted">If the game ended now: +${endNow} (roads ${a.road}, towns ${a.town}, priories ${a.priory}, farmers ${a.field}${G.ex.tb?', goods '+a.goods:''}) → ${p.score+endNow}.</div>`}
  <div class="small"><b>On the map:</b> ${G.figs.filter(f=>f.p===p.i).map(f=>`${f.k==='f'?ROLE[G.fd[find(f.s)].ty]:FIGN[f.k]} (${FEAT[G.fd[find(f.s)].ty]})`).join(', ')||'nobody'}</div></section>`}).join('')}
// ---------- start screen, story, tile list ----------
UI.setup={np:2,seats:['human','ai','ai','ai','ai','ai'],lv:['normal','normal','normal','normal','normal','normal'],ex:{river:false,ic:false,tb:false}};
function renderModal(){const m=$('#modal');if(!m)return;if(UI.modal==='lobby'&&!NET.on)UI.modal=G?null:'start';const h=UI.modal==='start'?startHtml():UI.modal==='story'?storyHtml():UI.modal==='lobby'?lobbyHtml():'';m.hidden=!h;
  if(m.dataset.h!==h){const ae=document.activeElement,aid=ae&&m.contains(ae)&&ae.id,sel=aid&&ae.selectionStart;m.innerHTML=iconize(h);m.dataset.h=h;if(aid){const n=document.getElementById(aid);if(n){n.focus({preventScroll:true});try{n.setSelectionRange(sel,sel)}catch(e){}}}}}
function startHtml(){const o=UI.setup;let saved=null;try{saved=localStorage.getItem(SAVE)}catch(e){}
  return `<div class="mbox"><h2>Rampart &amp; Vine</h2><p class="lede">Lay tiles to grow a sunny southern valley — walled towns, winding roads, quiet priories and fields of lavender. Send your followers to claim what you build. Most points wins.</p>
   ${saved?`<div class="acts"><button class="btn go" data-ui="continue">Continue the saved game</button></div>`:''}
   <h3>Players</h3><div class="seg">${[2,3,4,5,6].map(n=>`<button class="${o.np===n?'on':''}" data-np="${n}" ${n===6&&!o.ex.ic?'title="Six players need Taverns &amp; Basilicas"':''}>${n}</button>`).join('')}</div>
   <div class="seats">${Array.from({length:o.np},(_,i)=>`<div class="seat" style="--pc:${PCOL[i]}"><i></i><b>${PNAMES[i]}</b><button class="btn sm" data-seat="${i}">${o.seats[i]==='human'?'🙂 a person':'🤖 computer'}</button>${o.seats[i]==='ai'?`<button class="btn sm ghost" data-lv="${i}" title="Computer strength">${o.lv[i]}</button>`:''}</div>`).join('')}</div>
   <h3>Expansions</h3><div class="exs">${[['river','The Riverlands','12 river tiles laid first, from the spring to the pond'],['ic','Taverns & Basilicas','18 tiles: taverns double a road, basilicas triple a town (0 if unfinished); a champion counting as two; a 6th player'],['tb','Merchants & Masons','24 tiles: wine, grain and cloth for whoever closes a town; the mason (extra turns) and the hog (better farms)']].map(([k,n,x])=>`<label class="chk"><input type="checkbox" data-ex="${k}" ${o.ex[k]?'checked':''}> <b>${n}</b> <small>${x}</small></label>`).join('')}
   <label class="chk"><input type="checkbox" data-guide="1" ${UI.guide?'checked':''}> <b>🎓 Guided game</b> <small>the panel coaches each step in plain words</small></label></div>
   <div class="acts"><button class="btn go" data-ui="start">Begin ▶</button><button class="btn" data-gx="rulesd">How to play</button><button class="btn" data-gx="refd">Tile list</button></div>${onlineBlock()}</div>`}
function storyArt(){return `<svg viewBox="0 0 320 150" class="art" role="img" aria-label="A walled hill town above a valley at sunset"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb9d2"/><stop offset=".6" stop-color="#f6d7a5"/><stop offset="1" stop-color="#eeb57a"/></linearGradient></defs>
  <rect width="320" height="150" fill="url(#sk)"/><circle cx="250" cy="62" r="18" fill="#fff0c4" opacity=".9"/>
  <path d="M0 96 Q60 70 120 88 T240 80 T320 86 V150 H0Z" fill="#b8b06c"/><path d="M0 112 Q80 92 170 108 T320 102 V150 H0Z" fill="#9ea55a"/>
  <g stroke="#8a73b8" stroke-width="3" stroke-linecap="round" opacity=".9">${[0,1,2,3,4].map(i=>`<path d="M${20+i*4} ${128+i*4} L${120+i*6} ${120+i*5}"/>`).join('')}</g>
  <path d="M170 150 C190 130 150 118 175 104 S210 92 200 86" stroke="#ead7a8" stroke-width="7" fill="none"/>
  <path d="M96 84 L96 64 L206 64 L206 84 Z" fill="#d9bd8e"/><path d="M92 86 V62 h6 v-5 h6 v5 h8 v-5 h6 v5 h8 v-5 h6 v5 h8 v-5 h6 v5 h8 v-5 h6 v5 h8 v-5 h6 v5 h8 v-5 h6 v5 h8 v-5 h6 v5 h4 V86Z" fill="#cfb68a" stroke="#8a5a33" stroke-width="1.2"/>
  ${[[110,52],[128,48],[146,44],[166,50],[184,46]].map(([x,y],i)=>`<rect x="${x}" y="${y}" width="14" height="12" fill="#efe0c2"/><path d="M${x-2} ${y}L${x+7} ${y-7}L${x+16} ${y}Z" fill="${['#c4623a','#b5532f','#d0743f','#a94a2c','#c96b45'][i]}"/>`).join('')}
  <rect x="150" y="26" width="10" height="30" fill="#e6d8bb"/><path d="M148 26L155 16L162 26Z" fill="#a94a2c"/>
  ${[[40,96],[54,100],[262,92],[278,98],[292,94]].map(([x,y])=>`<path d="M${x} ${y}c-4-10 -1-26 3-30c4 4 7 20 3 30z" fill="#2f4a26"/>`).join('')}
  <g transform="translate(212 118)"><rect x="-3" y="-2" width="6" height="12" rx="2" fill="#c8372d"/><circle cy="-6" r="4" fill="#c8372d"/></g><g transform="translate(226 121)"><rect x="-3" y="-2" width="6" height="12" rx="2" fill="#2d62b8"/><circle cy="-6" r="4" fill="#2d62b8"/></g></svg>`}
function storyHtml(){return `<div class="mbox story-box">${storyArt()}<h2>The empty valley</h2><p>The old lord’s lands lie quiet between the hills and the sea. Nobody has built here for a hundred years.</p><p>Now settlers come with carts of stone and seed: ${G.pl.map(p=>`<b style="color:${PCOL[p.i]}">${esc(p.nm)}</b>`).join(', ')}.</p><p>One tile at a time you will lay roads, raise town walls and found priories — and send your followers to claim them.</p><p>Whoever builds the valley best will be remembered.</p><div class="acts"><button class="btn go" data-ui="storyok">Lay the first tile ▶</button></div></div>`}
function tileFacts(t){const d=TT[t],b=[];const tw=d.C.map(c=>`town ${c.e.length===4?'(all four sides)':c.e.length+' side'+(c.e.length>1?'s':'')}${c.p?', banner':''}${c.cat?', basilica':''}${c.g?', '+c.g:''}`);if(tw.length)b.push(tw.join(' + '));
  const rd=d.R.map(r=>r.e.length===2?(Math.abs(r.e[0]-r.e[1])===2?'straight road':'road bend'):'road end');if(rd.length)b.push(rd.join(' + ')+(d.R.some(r=>r.inn)?' (tavern)':''));if(d.mon)b.push('priory');if(d.V.length)b.push(d.spring?'river spring':d.lake?'river pond':'river');
  b.push(d.F.length+' field'+(d.F.length===1?'':'s'));return b.join(' · ')}
function refHtml(){const sets=[['base','Base game: 72 tiles (one is the starting tile)'],['river','The Riverlands: 12 river tiles'],['ic','Taverns & Basilicas: 18 tiles'],['tb','Merchants & Masons: 24 tiles']];
  let h=`<p class="muted small">Every tile in the box, drawn as it looks in the game. The count is how many copies there are.${G?` In this game: ${tilesLeft()} tiles still in the bag.`:''}</p>`;
  for(const [k,n] of sets){h+=`<h3>${n}</h3><div class="tgrid">${TT.map((d,t)=>d.set!==k?'':`<div class="tcell">${tileCard(t,0)}<div><b>${esc(d.n)}</b> <small>×${d.c}</small><br><small>${tileFacts(t)}</small></div></div>`).join('')}</div>`}
  h+=`<h3>Figures (each colour)</h3><div class="cgrid">${[['♟ Follower','7','Placed on a road, town, priory or field (then called a farmer) of the tile you just laid. Comes home when its feature is finished; farmers stay.'],['♜ Champion','1 (Taverns & Basilicas)','A follower that counts as two when deciding who holds a feature. Scores the same as one follower.'],['🔨 Mason','1 (Merchants & Masons)','Goes on a road or town where you already have a follower. Whenever a later tile of yours extends that feature, you take one extra turn at once (never two in a row). Comes home with the feature.'],['🐖 Hog','1 (Merchants & Masons)','Goes in a field where you already have a farmer. If you hold that field at the end, it pays 4 per finished town instead of 3.']].map(([n,c,x])=>`<div class="card"><h4>${n} <small>×${c}</small></h4><p>${x}</p></div>`).join('')}</div>`;
  h+=`<h3>Goods tokens (Merchants & Masons)</h3><div class="cgrid">${[['🍷 Wine',9],['🌾 Grain',6],['🧵 Cloth',5]].map(([n,c])=>`<div class="card"><h4>${n} <small>×${c}</small></h4><p>One per symbol in a town. Whoever lays the tile that finishes the town takes them, even with no follower there. At the end, the most of each kind scores 10 (ties: all score 10).</p></div>`).join('')}</div>`;
  h+=`<h3>Scoring</h3><div class="tw"><table class="st"><tr><th>Feature</th><th>Finished (at once)</th><th>Unfinished (at the end)</th></tr>
   <tr><td>Road</td><td>1 per tile</td><td>1 per tile</td></tr><tr><td>Road with a tavern</td><td>2 per tile</td><td>0</td></tr>
   <tr><td>Town</td><td>2 per tile + 2 per banner</td><td>1 per tile + 1 per banner</td></tr><tr><td>Town with a basilica</td><td>3 per tile + 3 per banner</td><td>0</td></tr>
   <tr><td>Priory</td><td>9 (the tile and all 8 around it)</td><td>1 + 1 per tile around it</td></tr><tr><td>Field (farmers)</td><td>—</td><td>3 per finished town it touches (4 with your hog)</td></tr>
   <tr><td>Goods</td><td>—</td><td>10 for the most wine, grain, cloth each</td></tr></table></div><p class="small muted">Whoever has the most followers in a feature scores all of it; tied players each score all of it.</p>`;
  return h}
// ---------- 2D board (used when there is no WebGL, e.g. old devices and the automated click tests) ----------
function renderMap2D(){const el=$('#map2d');if(!el)return;if(V3.on){el.hidden=true;return}el.hidden=false;const b=boardBounds();const S=100,x0=(b.x0-1)*S,y0=(b.y0-1)*S,W=(b.x1-b.x0+3)*S,H=(b.y1-b.y0+3)*S;
  const used=new Set(G.order.map(k=>G.tiles[k].t));if(G.cur&&G.cur.t!=null)used.add(G.cur.t);
  let s=`<svg viewBox="${x0} ${y0} ${W} ${H}" role="img" aria-label="The valley"><defs>${[...used].map(t=>`<symbol id="tt${t}" viewBox="0 0 100 100">${tileSVG(t)}</symbol>`).join('')}</defs>`;
  for(const k of G.order){const T=G.tiles[k],[x,y]=unkey(k);s+=`<g transform="translate(${x*S-50} ${y*S-50}) rotate(${T.r*90} 50 50)"><use href="#tt${T.t}" width="100" height="100"/></g>`}
  for(const f of G.figs){const p=spot2(G.sk[f.s],G.sl[f.s]);s+=`<circle cx="${p[0]}" cy="${p[1]}" r="${f.k==='big'?9:6.5}" fill="${PCOL[f.p]}" stroke="#fff" stroke-width="2"/>${f.k==='bld'?`<text x="${p[0]+8}" y="${p[1]-6}" font-size="12">🔨</text>`:f.k==='pig'?`<text x="${p[0]+8}" y="${p[1]-6}" font-size="12">🐖</text>`:''}`}
  for(const k of UI.cells){if(UI.ghost&&UI.ghost.k===k)continue;const [x,y]=unkey(k);s+=`<rect class="lc" data-cell="${k}" x="${x*S-46}" y="${y*S-46}" width="92" height="92" rx="6"/>`}
  if(UI.ghost){const [x,y]=unkey(UI.ghost.k);s+=`<g data-cell="${UI.ghost.k}" class="gh" transform="translate(${x*S-50} ${y*S-50}) rotate(${UI.ghost.r*90} 50 50)"><use href="#tt${G.cur.t}" width="100" height="100"/><rect width="100" height="100" fill="none" stroke="#ffe066" stroke-width="5"/></g>`}
  if(UI.spotOpts.length)for(const o of UI.spotOpts){const p=spot2(G.cur.k,o.l);s+=`<circle class="sp" data-spot="${o.l}" cx="${p[0]}" cy="${p[1]}" r="11"/>`}
  el.innerHTML=s+'</svg>'}
function spot2(k,l){const T=G.tiles[k],[x,y]=unkey(k);const sp=rotP(buildGeo(T.t).spots[l],T.r);return [x*100-50+sp[0],y*100-50+sp[1]]}
// ---------- input ----------
function on3DTap(k,w){if(PHN.on&&PHN.tap(k,w))return;const p=me();if(!p)return;
  if(G.step==='place'){if(!k||!UI.cells.includes(k)){if(k&&!G.tiles[k])toast('Your tile can’t go there — pick a glowing square.');return}
    const L=legalPlacements(G.cur.t).filter(q=>key(q.x,q.y)===k).map(q=>q.r);
    if(UI.ghost&&UI.ghost.k===k){rotGhost(1);return}
    let r=L[0];const adv=UI.advice&&UI.advice.place;if(adv&&key(adv.x,adv.y)===k)r=adv.r;else if(UI.ghost&&L.includes(UI.ghost.r))r=UI.ghost.r;else if(PHN.on&&L.includes(PHN.rot))r=PHN.rot;
    UI.ghost={k,r,rots:L,t:G.cur.t,turn:G.turn};sfx&&sfx('click');refreshUI();return}
  if(G.step==='fig'&&w&&UI.spotOpts.length){let best=null,bd=.45;for(const o of UI.spotOpts){const q=spotWorld(G.cur.k,o.l);const d=Math.hypot(q.x-w.x,q.z-w.z);if(d<bd){bd=d;best=o}}
    if(best)return go({act:'fig',k:best.k,l:best.l});toast('Tap one of the glowing rings on your new tile, or use the buttons.')}}
function rotGhost(d){const g=UI.ghost;if(!g||!g.rots.length)return;let i=g.rots.indexOf(g.r);i=(i+d+g.rots.length)%g.rots.length;g.r=g.rots[i];sfx&&sfx('click');refreshUI()}
function refreshUI(){computeUI();render();try{sync3D()}catch(e){console.error(e)}}
function go(m){if(NET.on){if(isClient()){if(!me())return;sfx&&sfx('click');netSend(m);return}const s0=sideToAct();if(s0>=0&&P(s0).human&&!me())return}const s=sideToAct();const r=performMove(m,s);if(!r.success){toast('That move isn’t allowed now.');console.error(r.error)}}
function toast(t){if(PHN.on){PHN.toast(t);return}const el=$('#dockmsg');if(!el)return;el.textContent=t;el.hidden=false;GX.showDock();clearTimeout(UI.tt);UI.tt=setTimeout(()=>el.hidden=true,3200)}
function advise(){const p=me();if(!p)return;if(G.step==='place'){const plan=aiPlan(p.i,'normal');UI.advice={turn:G.turn+':'+G.step,place:plan.place,fig:plan.fig,text:adviceText(plan,p.i)};const k=key(plan.place.x,plan.place.y);
    UI.ghost={k,r:plan.place.r,rots:legalPlacements(G.cur.t).filter(q=>key(q.x,q.y)===k).map(q=>q.r),t:G.cur.t,turn:G.turn};focusCell(k)}
  else if(G.step==='fig'){const m=bestFigNow(p.i,'normal');const text=figAdviceText(m,p.i);
    UI.kind=m.k||UI.kind;UI.advice={turn:G.turn+':'+G.step,fig:m,text}}
  sfx&&sfx('click');refreshUI()}
// the follower advice in the same numbers the buttons show
function figAdviceText(m,pi){if(m.act==='skip')return 'Keep your followers: nothing here is worth one right now.';const T=G.tiles[G.cur.k];const s=TSEG[T.t][m.l];const r=find(T.s0+m.l);const fl=featLine(s.ty,G.fd[r],figsIn(r),pi);
  if(m.k==='bld')return `Put your mason on the ${FEAT[s.ty]}: extra turns whenever you extend it.`;if(m.k==='pig')return 'Put your hog beside your farmer for +1 per finished town.';
  if(s.ty==='F')return `A farmer here pays +${fl.end} at the end as things stand (3 per finished town beside this field), more as nearby towns get finished.`;
  const who=m.k==='big'?'champion':'follower';if(G.fd[r].done)return `A ${who} scores the finished ${FEAT[s.ty]} at once (+${fl.now}) and comes straight home.`;
  return `A ${who} on the ${FEAT[s.ty]}: +${fl.now} if you finish it as it is, more as it grows; you get the ${who} back when it is finished.`}
function applyAdvice(){const a=UI.advice;if(!a)return;if(G.step==='place'&&a.place){const fig=a.fig;go(a.place);if(me()&&G.step==='fig'&&fig&&isLegal(fig,sideToAct()))go(fig)}else if(G.step==='fig'&&a.fig)go(a.fig);UI.advice=null}
document.addEventListener('click',e=>{const b=e.target.closest('button,[data-cell],[data-spot],input[type=checkbox]');if(!b)return;const d=b.dataset;
  if(d.mv){const m=JSON.parse(d.mv);sfx&&sfx('click');return go(m)}
  if(d.cell!=null&&b.tagName!=='BUTTON')return on3DTap(d.cell,null);
  if(d.spot!=null){const o=UI.spotOpts.find(o=>o.l===+d.spot);if(o)go({act:'fig',k:o.k,l:o.l});return}
  if(d.kind){UI.kind=d.kind;refreshUI();return}
  if(d.np){UI.setup.np=+d.np;if(UI.setup.np===6)UI.setup.ex.ic=true;render();return}
  if(d.seat!=null){const i=+d.seat;UI.setup.seats[i]=UI.setup.seats[i]==='human'?'ai':'human';render();return}
  if(d.lv!=null){const i=+d.lv;const L=['easy','normal','hard'];UI.setup.lv[i]=L[(L.indexOf(UI.setup.lv[i])+1)%3];render();return}
  if(d.ex&&b.type==='checkbox'){UI.setup.ex[d.ex]=b.checked;if(d.ex==='ic'&&!b.checked&&UI.setup.np===6)UI.setup.np=5;render();return}
  if(d.guide&&b.type==='checkbox'){setGuide(b.checked);return}
  if(d.gfx){if(typeof setGfx==='function')setGfx(d.gfx);renderSettings();return}
  if(d.ui)return uiAct(d.ui);
  switch(d.a){case 'snd':toggleSound();return;case 'mus':toggleMusic();return;case 'speed':UI.speed=UI.speed===1?3:UI.speed===3?.5:1;render();return;case 'pause':UI.pause=!UI.pause;render();schedule();return;case 'new':openStart();return;
    case 'fit':fitAll(false);return;case 'adv':advise();return;case 'guide':setGuide(!UI.guide);if(G)render();toast(UI.guide?'Guide on: the panel explains each step.':'Guide off.');return}});
function setGuide(on){UI.guide=on;try{localStorage.setItem('rv_guide',on?'1':'0')}catch(e){}if(on){UI.seen={};saveSeen()}}
function uiAct(a){switch(a){case 'start':beginGame();return;case 'continue':loadSaved();return;case 'new':openStart();return;case 'storyok':UI.modal=null;render();schedule();return;
  case 'rotl':rotGhost(-1);return;case 'rotr':rotGhost(1);return;case 'cancel':UI.ghost=null;UI.advice=null;refreshUI();return;
  case 'confirm':{const g=UI.ghost;if(!g)return;const [x,y]=unkey(g.k);UI.ghost=null;go({act:'place',x,y,r:g.r});return}
  case 'apply':applyAdvice();return}}
document.addEventListener('keydown',e=>{if(!me()||UI.modal||GX.open)return;if(e.key==='r'||e.key==='R')rotGhost(1);else if(e.key==='Enter'&&UI.ghost&&G.step==='place'){e.preventDefault();uiAct('confirm')}else if(e.key==='Escape'&&UI.ghost){UI.ghost=null;refreshUI()}});
function openStart(){UI.modal='start';render()}
function beginGame(){if(NET.on)netLeave(true);const o=UI.setup;UI.fx.length=0;UI.fxSeen=0;UI.recap=null;UI.advice=null;UI.ghost=null;const seats=o.seats.slice(0,o.np);
  newGame({np:o.np,seats,lv:o.lv.slice(0,o.np),ex:Object.assign({},o.ex,o.np===6?{ic:true}:{})});resetScene();UI.modal=human()&&ANIM&&UI.guide?'story':null;refresh();fitAll(true)}
function loadSaved(){if(NET.on)netLeave(true);try{const g=JSON.parse(localStorage.getItem(SAVE));if(!g||!g.v)throw 0;G=g;UI.modal=null;resetScene();refresh();fitAll(true)}catch(e){openStart()}}
// after each move: recap computer turns in one line and show where they played
function onMoveDone(m,s,before){if(UI.sim)return;const p=P(before.p);const mineP=p.human&&(!NET.on||p.i===NET.mySeat);if(m.act==='place'&&!mineP&&V3.on){const [x,y]=[m.x,m.y];const sp=screenOf(cellWorld(x,y));const R=V3.r.domElement;if(!sp.in||sp.x<R.clientWidth*.12||sp.x>R.clientWidth*.88||sp.y<R.clientHeight*.12||sp.y>R.clientHeight*.88){if(human())focusCell(key(x,y));else fitAll(false)}}
  if(G.cur!==before){const R=moveRecaps(before);if(mineP)UI.mine=R.mine;else UI.recap=R.recap;if(NET.on)netMoveDone(before,R)}}
// the same turn in two voices: to the player who made it, and to everyone else
function moveRecaps(before){const p=P(before.p);const sc=before.scored.filter(x=>x.win.length);
  const mine=sc.length?{p:p.i,html:'Your last turn: '+sc.map(x=>`${FEAT[x.ty]} finished, ${x.win.map(i=>i===p.i?'you':P(i).nm).join(' & ')} +${x.pts}`).join('; ')+(sc.some(x=>x.win.includes(p.i))?'. Your followers there came home.':'.')}:null;
  const f=before.figPlaced;const T=G.tiles[before.k];let t=`<b style="color:${PCOL[p.i]}">${esc(p.nm)}</b> placed ${esc(tileWords(before.t))}`;
  if(f){const ty=TSEG[T.t][f.l].ty;t+=` and set a ${f.k==='f'?ROLE[ty]:FIGN[f.k]} on the ${FEAT[ty]}`}else t+=' and kept its followers';
  if(sc.length)t+='. '+sc.map(x=>`${x.win.map(i=>P(i).nm).join(' & ')} +${x.pts} (${FEAT[x.ty]})`).join(', ');
  if(before.bonusEarned)t+='. Its mason earns an extra turn';
  let sh=`<b style="color:${PCOL[p.i]}">${esc(p.nm)}</b> `+(f?`put a ${f.k==='f'?(TSEG[T.t][f.l].ty==='F'?'farmer in a field':'follower on a '+FEAT[TSEG[T.t][f.l].ty]):FIGN[f.k]}`:'laid a tile, no follower');if(sc.length)sh+=': '+sc.map(x=>`${x.win.map(i=>P(i).nm).join(' & ')} +${x.pts}`).join(', ');
  return {mine,recap:{html:t+'.',short:sh+'.',n:G.turn}}}
// ---------- the computer ----------
let aiTimer=null;function schedule(){if(aiTimer||!G||G.over||UI.pause||PHN.blocking()||(UI.modal&&!(isHost()&&UI.modal!=='story'))||isClient())return;const s=sideToAct();if(s<0||P(s).human)return;
  aiTimer=setTimeout(()=>{aiTimer=null;if(!G||G.over||(UI.modal&&!isHost())||isClient())return;if(PHN.blocking()){return}const s2=sideToAct();if(s2<0||P(s2).human)return;const m=aiMove(s2);if(!m){console.error('AI has no move in '+G.step);return}go(m)},Math.max(0,AIDELAY/(UI.speed||1)*(G.step==='fig'?.7:1)))}
// ---------- settings popup: graphics quality ----------
function renderSettings(){const el=$('#setbody');if(!el)return;const has=typeof V3!=='undefined';const pref=has?V3.pref:'auto';const now=has&&V3.on?GFX[V3.q].nm:'2D map';
  const opt=[['auto','Auto','picks for this screen'],['high','High','bloom, soft 2k shadows, full sharpness'],['med','Medium','soft shadows, no post-processing'],['low','Low','no shadows or effects; lightest on the battery']];
  el.innerHTML=`<div class="setgrp"><h3>${ico('gear')} Graphics quality</h3><div class="qopts" role="radiogroup" aria-label="Graphics quality">${opt.map(([v,n,d])=>`<button class="btn opt ${pref===v?'on':''}" data-gfx="${v}" role="radio" aria-checked="${pref===v}"><span>${n}</span><small>${d}</small></button>`).join('')}</div>
    <p class="small muted">Showing: <b>${now}</b>${pref==='auto'&&has&&V3.on?' (chosen automatically)':''}. On Auto, if the picture stutters for a few seconds, the game steps down one level by itself. Saved on this device.</p>
    ${typeof PerfHUD!=='undefined'?`<div class="qopts spd">${PerfHUD.buttonsHTML('btn')}</div><p class="small muted">Show speed: a frame-rate overlay (also F9). Test speed: tries each level for 2 s and suggests one.</p>`:''}</div>`}
const CREDITS_HTML=`<section class="credits-audio"><h3>Credits</h3><p>Names, card text and art are original.</p><h4>Audio</h4><p>With thanks to these public-domain (CC0) creators:</p><ul><li>Music: &ldquo;Medieval: Harvest Season&rdquo; by RandomMind (<a target="_blank" rel="noopener" href="https://opengameart.org/content/medieval-harvest-season">OpenGameArt</a>, CC0)</li><li>Sound effects: Impact Sounds, Interface Sounds, Music Jingles, RPG Audio, UI Audio by <a target="_blank" rel="noopener" href="https://kenney.nl">Kenney</a> (CC0)</li></ul><p><small>All sounds were trimmed, loudness-normalised and converted to MP3 for this game.</small></p></section>`;
function onGfxChange(){if(typeof GX!=='undefined'&&GX.open==='setd')renderSettings()}
function boot(){GX.init({key:'rv'});paintIcons();phApply();PHN.init();GX.onShow=id=>{if(id==='rulesd')$('#rulesbody').innerHTML=iconize(RULES_HTML)+CREDITS_HTML;if(id==='refd')$('#refbody').innerHTML=iconize(refHtml());if(id==='setd')renderSettings();if(G)render()};try{init3D()}catch(e){console.error(e)}soundBtns();openStart();netInit()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
