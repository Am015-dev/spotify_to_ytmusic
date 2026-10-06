// ---------- Board-first UI: the valley is the screen. Tap glowing squares, tap the tile to turn it, tap glowing spots for followers. ----------
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PCOL=['#c8372d','#2d62b8','#e2ae22','#3b8a45','#34323b','#a064c0'];
const MINC=30,MAXC=118;// cell size in screen pixels
const FIGICON={f:'meeple',big:'champ',bld:'mason',pig:'hog'};
Object.assign(UI,{rot:0,deg:0,turn:-1,stepKey:'',user:false,hint:null,aiT:0,tl:{},mp:{},fxSeen:0,view:{s:.4,x:0,y:0},camp:null,first:false,moved:false,
  legal:[],rots:[],figs:[],ov:[],setup:{rivals:1,lv:'normal',river:false,ic:false,tb:false},tween:0,overT:0,lastKey:null,humanTurns:0});
try{UI.first=localStorage.getItem('rv_seen')!=='1';UI.speed=localStorage.getItem('rv_fast')==='1'?3:1}catch(e){}
const human=()=>G&&G.pl.some(p=>p.human);
const myTurn=step=>{if(!G||G.over||!G.cur)return false;const s=sideToAct();return s>=0&&P(s).human&&(!step||G.step===step)};
const seatName=p=>p.human&&G.pl.filter(q=>q.human).length===1?'You':p.nm;
function say(t){const el=$('#status');el.textContent=t;el.classList.toggle('mine',myTurn())}
// ---------- view: world units are 100 per tile; the world div is translated and scaled ----------
const boardEl=()=>$('#board');
function measure(){const r=boardEl().getBoundingClientRect();return {W:r.width,H:r.height,L:r.left,T:r.top}}
function setView(v){UI.view=v;applyView()}
function applyView(){const v=UI.view,w=$('#world');w.style.transform=`translate(${v.x}px,${v.y}px) scale(${v.s})`;boardEl().style.setProperty('--sc',v.s);placeOverlay()}
function toScreen(wx,wy){return [wx*UI.view.s+UI.view.x,wy*UI.view.s+UI.view.y]}
function tweenView(to,ms){cancelAnimationFrame(UI.tween);UI.tw=false;const a=Object.assign({},UI.view);if(!ms||UI.reduce){setView(to);return}UI.tw=true;const t0=performance.now();
  const step=t=>{const k=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-k,3);setView({s:a.s+(to.s-a.s)*e,x:a.x+(to.x-a.x)*e,y:a.y+(to.y-a.y)*e});if(k<1)UI.tween=requestAnimationFrame(step);else UI.tw=false};UI.tween=requestAnimationFrame(step)}
function focusView(cx,cy,cell){const m=measure(),s=cell/100;return {s,x:m.W/2-cx*100*s,y:m.H/2+16-cy*100*s}}
function fitCells(cells,m){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of cells){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  const w=x1-x0+1,h=y1-y0+1,aw=m.W-14,ah=m.H-52,c0=Math.min(aw/w,ah/h);return {c:Math.max(MINC,Math.min(MAXC,c0)),fits:c0>=MINC,cx:(x0+x1+1)/2,cy:(y0+y1+1)/2}}
function viewFor(f,m){const s=f.c/100;return {s,x:m.W/2-f.cx*100*s,y:m.H/2+16-f.cy*100*s}}
function fitTarget(){const m=measure();if(!G.order.length)return {s:.4,x:0,y:0};const last=unkey(G.cur&&G.cur.k||G.order[G.order.length-1]);
  const gl=UI.legal.map(g=>[g.x,g.y]);let f=fitCells(G.order.map(unkey).concat(gl),m);if(f.fits)return viewFor(f,m);
  f=fitCells(gl.concat([last]),m);return viewFor(f,m)}
function ensureGlowVisible(){if(!myTurn('place')||UI.tw||UI.user)return;if([...document.querySelectorAll('#world .glow')].some(g=>g.style.visibility!=='hidden'))return;
  const g=UI.legal.filter(q=>q.r===UI.rot);if(!g.length)return;const last=unkey(G.order[G.order.length-1]);g.sort((a,b)=>Math.hypot(a.x-last[0],a.y-last[1])-Math.hypot(b.x-last[0],b.y-last[1]));
  const m=measure();tweenView(viewFor({c:Math.max(MINC,UI.view.s*100),cx:g[0].x+.5,cy:g[0].y+.5},m),300)}
function refit(anim){if(!G||!G.order.length)return;UI.user=false;tweenView(fitTarget(),anim?420:0)}
function zoomTile(k,anim){const m=measure(),[x,y]=unkey(k);const c=Math.min(m.W*.62,m.H*.62,190);tweenView(focusView(x+.5,y+.5,c),anim?420:0)}
// ---------- drawing a tile (rotated by its placement) ----------
const tileInner=(t,r)=>`<g transform="rotate(${r*90} 50 50)">${tileSVG(t)}</g>`;
function tileSvg(t,r){return `<svg viewBox="0 0 100 100" aria-hidden="true">${tileInner(t,r)}</svg>`}
// ---------- world: tiles, glowing placement spots ----------
function renderTiles(){const w=$('#world');
  for(const k in UI.tl)if(!G.tiles[k]){UI.tl[k].remove();delete UI.tl[k]}
  const lastK=G.step==='fig'&&G.cur?G.cur.k:G.order[G.order.length-1];
  for(const k of G.order){const T=G.tiles[k];let e=UI.tl[k];const [x,y]=unkey(k);
    if(!e){e=document.createElement('div');e.className='tl';e.style.left=x*100+'px';e.style.top=y*100+'px';e.innerHTML=tileSvg(T.t,T.r);if(G.order.length>1&&G.cur)e.style.setProperty('--pc',PCOL[G.cur.p]);if(UI.seenInit)e.classList.add('drop');w.appendChild(e);UI.tl[k]=e}
    e.classList.toggle('last',k===lastK&&G.order.length>1)}
  UI.seenInit=true}
function renderGlows(){const w=$('#world');for(const e of w.querySelectorAll('.glow'))e.remove();
  document.getElementById('gp').innerHTML='';
  if(!myTurn('place'))return;const t=G.cur.t;document.getElementById('gp').innerHTML=tileInner(t,UI.rot);
  for(const g of UI.legal){if(g.r!==UI.rot)continue;const b=document.createElement('button');b.className='glow';b.style.left=g.x*100+'px';b.style.top=g.y*100+'px';b.setAttribute('aria-label','Place tile here');
    b.dataset.x=g.x;b.dataset.y=g.y;b.innerHTML='<svg viewBox="0 0 100 100"><use href="#gp"/></svg>';
    if(UI.hint&&UI.hint.x===g.x&&UI.hint.y===g.y&&UI.hint.r===UI.rot)b.classList.add('hintspot');
    b.addEventListener('click',()=>onGlow(g.x,g.y));w.appendChild(b)}}
// ---------- overlay: followers on the map, follower spots, ghost finger, pops (screen-sized items that follow the map) ----------
function addOv(el,wx,wy,o){o=o||{};el._o={wx,wy,dx:o.dx||0,dy:o.dy||0};$('#ov').appendChild(el);return el}
function placeOverlay(){const m=measure(),pad=14;const cell=UI.view.s*100;const ms=Math.max(16,Math.min(34,cell*.3));$('#ov').style.setProperty('--ms',ms+'px');
  for(const el of $('#ov').children){const o=el._o;if(!o)continue;const [sx,sy]=toScreen(o.wx,o.wy);el.style.transform=`translate(${sx+o.dx}px,${sy+o.dy}px) translate(-50%,-50%)`;
    if(o.cull){const r=o.r||0;const vis=sx>pad+r&&sx<m.W-pad-r&&sy>pad+r+28&&sy<m.H-pad-r;el.style.visibility=vis?'':'hidden'}}
  // glows must lie fully inside the board so none is half cut off or under the bars
  const c=UI.view.s*100;for(const g of $('#world').querySelectorAll('.glow')){const x=+g.dataset.x*c+UI.view.x,y=+g.dataset.y*c+UI.view.y;g.style.visibility=(x>=0&&y>=34&&x+c<=m.W&&y+c<=m.H)?'':'hidden'}}
function spotWorld(k,l){const T=G.tiles[k],[x,y]=unkey(k),sp=rotP(buildGeo(T.t).spots[l],T.r);return [x*100+sp[0],y*100+sp[1]]}
function renderMeeples(){const live={};
  for(const f of G.figs){const id=f.s+f.k+f.p;live[id]=f;if(UI.mp[id])continue;const k=G.sk[f.s],l=G.sl[f.s],[wx,wy]=spotWorld(k,l);
    const e=document.createElement('div');e.className='mp';e.style.setProperty('--c',PCOL[f.p]);e.innerHTML=ico(FIGICON[f.k]);
    addOv(e,wx,wy,{dx:f.k==='bld'||f.k==='pig'?10:0,dy:f.k==='bld'||f.k==='pig'?-8:0});UI.mp[id]=e}
  for(const id in UI.mp)if(!live[id]){const e=UI.mp[id];delete UI.mp[id];e.classList.add('gone');setTimeout(()=>e.remove(),520)}
  placeOverlay()}
function renderFigSpots(){for(const e of [...$('#ov').children])if(e.classList.contains('fglow')||e.id==='ghost')e.remove();
  UI.figs=[];if(!myTurn('fig'))return;const p=sideToAct(),T=G.tiles[G.cur.k],moves=figMoves(p).filter(m=>m.act==='fig');
  const byL={};for(const m of moves)(byL[m.l]=byL[m.l]||[]).push(m);
  for(const l in byL){const [wx,wy]=spotWorld(G.cur.k,+l),ms=byL[l];
    ms.forEach((m,i)=>{const b=document.createElement('button');b.className='fglow';b.style.setProperty('--c',PCOL[p]);b.innerHTML=ico(FIGICON[m.k]);
      b.setAttribute('aria-label',`Place ${FIGN[m.k]} here`);b.addEventListener('click',()=>onFig(m));
      addOv(b,wx,wy,{dx:ms.length>1?(i-(ms.length-1)/2)*50:0});b._m=m;UI.figs.push(b)})}
  placeOverlay()}
// ---------- ghost finger (first game, and chapters that give hints): points at the move the computer would pick ----------
function hintOn(){return !!(UI.camp?UI.camp.hints:(UI.first&&UI.humanTurns<2))}
function showGhost(wx,wy,sx,sy){const old=$('#ghost');if(old)old.remove();if(wx==null&&sx==null)return;
  const g=document.createElement('div');g.id='ghost';g.innerHTML='<svg viewBox="0 0 48 48" width="44" height="44"><path d="M19 4c2 0 3.5 1.4 3.5 3.3V19l1.8-.8c1.3-.5 2.8.2 3.2 1.5l.3.9 2.2-.7c1.4-.4 2.8.4 3.2 1.8l.4 1.1c1.8-.4 3.4.7 3.7 2.4.8 4.4.5 8.4-1.1 11.6-1.5 3-4.2 5-8.3 5H24c-3.3 0-5.600-1.3-7.600-4.200L10.200 28c-.7-1.200-.3-2.800.9-3.500 1.100-.600 2.500-.4 3.300.600l1.100 1.300V7.300C15.500 5.400 17 4 19 4z" fill="#fff" stroke="#3a2610" stroke-width="2.200" stroke-linejoin="round"/></svg>';
  if(sx!=null){g.style.transform=`translate(${sx}px,${sy}px)`;$('#ov').appendChild(g)}else addOv(g,wx,wy,{dx:10,dy:16});placeOverlay()}
function updateGhost(){const old=$('#ghost');if(old)old.remove();if(!hintOn()||!G||G.over||!myTurn())return;
  if(G.step==='place'&&UI.hint){if(UI.rot===UI.hint.r)showGhost(UI.hint.x*100+50,UI.hint.y*100+50);else{const r=$('#htile').getBoundingClientRect(),b=boardEl().getBoundingClientRect();
      // finger on the tile itself (turn it): hand is outside the board, so keep it in the board's coordinate space
      showGhost(null,null,r.left-b.left+r.width/2+10,r.top-b.top+r.height/2+10)}}
  else if(G.step==='fig'&&UI.hintFig){if(UI.hintFig.act==='skip'){const r=$('#hskip');if(r){const rb=r.getBoundingClientRect(),b=boardEl().getBoundingClientRect();r.classList.add('hintspot');showGhost(null,null,rb.left-b.left+rb.width/2+10,rb.top-b.top+rb.height/2+10)}}
    else{const [wx,wy]=spotWorld(G.cur.k,UI.hintFig.l);const b=UI.figs.find(q=>q._m.k===UI.hintFig.k&&q._m.l===UI.hintFig.l);if(b)b.classList.add('hintspot');showGhost(wx,wy)}}}
// ---------- top strip, hand, status ----------
function renderTop(){const el=$('#seats');el.innerHTML=G.pl.map(p=>{const s=p.sup,cur=!G.over&&sideToAct()===p.i;
    return `<div class="seat${cur?' cur':''}" style="--c:${PCOL[p.i]}" data-i="${p.i}"><i class="dot">${p.human?'':'&#9881;'}</i><span class="nm">${esc(seatName(p))}</span><b>${p.score}</b><span class="fl" title="followers left">${ico('meeple')}${s.f}${G.ex.ic&&G.figTotal[p.i].big?`${ico('champ')}${s.big}`:''}${G.ex.tb?`${ico('mason')}${s.bld}${ico('hog')}${s.pig}`:''}</span>${G.ex.tb?`<span class="fl" title="wine, grain, cloth">${ico('wine')}${p.goods.wine+p.goods.grain+p.goods.cloth}</span>`:''}</div>`}).join('');
  $('#left').innerHTML=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"/></svg><b>${tilesLeft()}</b>`}
function bumpSeat(i){const e=document.querySelector(`.seat[data-i="${i}"]`);if(e){e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump')}}
function renderHand(){const h=$('#hand');const p=G.over?null:G.cur&&G.cur.p;
  if(G.over||!G.cur){h.innerHTML=`<div id="hinfo"><span class="big">Valley complete</span></div>`;return}
  const mine=myTurn(),c=PCOL[G.cur.p];
  if(G.step==='place'){const t=G.cur.t;
    if(!UI.handKey||UI.handKey!==G.turn){UI.handKey=G.turn;UI.deg=UI.rot*90;h.innerHTML=`<button id="htile" style="--c:${c}" aria-label="Turn the tile"><div class="spin">${tileSvg(t,0)}</div><span class="rot">&#8635;</span></button>`;$('#htile').classList.add('nospin');$('#htile').addEventListener('click',()=>{if(myTurn('place'))rotate()});setTimeout(()=>$('#htile')&&$('#htile').classList.remove('nospin'),30)}
    const b=$('#htile');b.disabled=!myTurn('place');b.classList.toggle('mine',myTurn('place'));b.style.setProperty('--c',c);b.querySelector('.rot').hidden=!(myTurn('place')&&UI.rots.length>1);
    b.querySelector('.spin').style.transform=`rotate(${UI.deg}deg)`}
  else if(G.step==='fig'){UI.handKey=null;
    if(myTurn()){h.innerHTML=`<button id="hskip">Skip</button>`;$('#hskip').addEventListener('click',()=>onSkip())}
    else h.innerHTML=`<button id="htile" disabled style="--c:${c}">${tileSvg(G.tiles[G.cur.k].t,G.tiles[G.cur.k].r)}</button>`}}
function renderStatus(){let t='';
  if(G.over)t='Game over';
  else if(myTurn('place'))t=G.cur.bonus?'Extra turn! Place your tile':isRiver(G.cur.t)?'Carry the river on':'Place your tile';
  else if(myTurn('fig'))t='Place a follower, or skip';
  else if(G.cur)t=`${seatName(P(G.cur.p))==='You'?'You':P(G.cur.p).nm} ${G.step==='fig'?'sets a follower':'plays a tile'}`;
  say(t)}
// ---------- turn bookkeeping ----------
function syncTurn(){if(!G||G.over||!G.cur)return;const key=G.turn+':'+G.step;if(key===UI.stepKey)return;UI.stepKey=key;
  if(myTurn('place')){UI.legal=legalPlacements(G.cur.t);UI.rots=[...new Set(UI.legal.map(g=>g.r))].sort();UI.hint=null;
    const cnt=r=>UI.legal.filter(g=>g.r===r).length;let best=UI.rots[0];for(const r of UI.rots)if(cnt(r)>cnt(best))best=r;UI.rot=best;
    if(hintOn()){try{const plan=aiPlan(G.cur.p,'normal');UI.hint={x:plan.place.x,y:plan.place.y,r:plan.place.r};UI.rot=plan.place.r;UI.hintFig=null}catch(e){UI.hint=null}}
    UI.deg=UI.rot*90;UI.user=false;refit(true)}
  else if(myTurn('fig')){UI.legal=[];UI.hintFig=hintOn()?bestFigNow(G.cur.p,'normal'):null;if(!UI.user)zoomTile(G.cur.k,true)}
  else{UI.legal=[];UI.hint=null;UI.hintFig=null;if(G.step==='place'){UI.user=false;refit(true)}}}
// ---------- the main render ----------
function render(){if(!G)return;syncTurn();renderTop();renderTiles();renderGlows();renderMeeples();renderFigSpots();renderHand();renderStatus();updateGhost();placeOverlay();ensureGlowVisible()}
function save(){try{if(G&&!G.over&&G.pl.some(p=>p.human)&&!UI.camp)localStorage.setItem(SAVE,JSON.stringify(G));else localStorage.removeItem(SAVE)}catch(e){}}
function refresh(){if(UI.sim||!G)return;render();save();playFx();if(G.over)finishUp();else schedAI()}
// ---------- actions ----------
function rotate(){if(!myTurn('place')||UI.rots.length<2){return}const i=UI.rots.indexOf(UI.rot),n=UI.rots[(i+1)%UI.rots.length];UI.deg+=((n-UI.rot+4)%4||4)*90;UI.rot=n;sfx('click');renderGlows();updateGhost();placeOverlay();ensureGlowVisible();const b=$('#htile');if(b)b.querySelector('.spin').style.transform=`rotate(${UI.deg}deg)`}
function onGlow(x,y){if(UI.moved||!myTurn('place'))return;const m={act:'place',x,y,r:UI.rot};if(!isLegal(m,sideToAct()))return;UI.hint=null;UI.humanTurns++;performMove(m,sideToAct())}
function onFig(m){if(UI.moved||!myTurn('fig'))return;UI.hintFig=null;performMove(m,sideToAct());markSeen()}
function onSkip(){if(!myTurn('fig'))return;UI.hintFig=null;performMove({act:'skip'},sideToAct());markSeen()}
function markSeen(){if(UI.first&&UI.humanTurns>=2){UI.first=false;try{localStorage.setItem('rv_seen','1')}catch(e){}}}
// ---------- computer turns: show its tile, then place, then the follower, each about half a second ----------
function aiAct(){UI.aiT=0;if(!G||G.over)return;const s=sideToAct();if(s<0||P(s).human)return;const m=aiMove(s);if(!m)return;const r=performMove(m,s);if(!r.success)console.error('ai move failed',r.error)}
function schedAI(){if(UI.aiT||!G||G.over)return;const s=sideToAct();if(s<0||P(s).human)return;UI.aiT=setTimeout(aiAct,(G.step==='place'?AIDELAY:AIDELAY*.7)/UI.speed)}
function aiNow(){if(UI.aiT){clearTimeout(UI.aiT);aiAct()}}
// ---------- effects: scores light up the feature and fly to the seat chip ----------
function playFx(){const list=UI.fx.slice(UI.fxSeen);UI.fxSeen=UI.fx.length;let n=0;
  for(const f of list){if(f.t==='place')sfx('place');else if(f.t==='fig')sfx('fig');else if(f.t==='home')sfx('home');else if(f.t==='goods')sfx('goods');else if(f.t==='discard')sfx('bad');else if(f.t==='turn'&&!P(f.x).human)sfx('turn');
    else if(f.t==='score'){const d=f.x,delay=n++*520;setTimeout(()=>scorePop(d),delay)}}}
function featCells(r){const F=G.fd[r];if(!F)return [];if(F.ty==='M')return [[F.x,F.y]];return (F.tiles||[]).map(unkey)}
function scorePop(d,final){if(!G)return;const cells=featCells(d.r);if(!cells.length)return;sfx('score');
  for(const [x,y] of cells){const e=UI.tl[key(x,y)];if(e){e.classList.remove('lit');void e.offsetWidth;e.classList.add('lit')}}
  const cx=cells.reduce((a,c)=>a+c[0],0)/cells.length+.5,cy=cells.reduce((a,c)=>a+c[1],0)/cells.length+.5;
  const w=d.win.length?d.win:[d.by||0];
  w.forEach((i,j)=>{const e=document.createElement('div');e.className='pop';e.style.setProperty('--c',PCOL[i]);e.textContent='+'+d.pts;addOv(e,cx*100,cy*100,{dy:-j*26});placeOverlay();
    const chip=document.querySelector(`.seat[data-i="${i}"]`),b=boardEl().getBoundingClientRect();
    setTimeout(()=>{const o=e._o;if(chip){const c=chip.getBoundingClientRect();const [sx,sy]=toScreen(o.wx,o.wy);e.style.transform=`translate(${c.left+c.width/2-b.left}px,${c.top+c.height/2-b.top}px) translate(-50%,-50%) scale(.6)`;e.style.opacity='.1';e._o=null}else e.style.opacity='0';bumpSeat(i)},final?900:700);
    setTimeout(()=>e.remove(),final?1900:1700)})}
// ---------- the end: unfinished features score one by one, then the result ----------
function finishUp(){if(UI.endShown)return;UI.endShown=true;UI.aiT&&clearTimeout(UI.aiT);UI.aiT=0;sfx('win');
  const fs=finalScores();let n=0;const dets=fs.det.filter(d=>d.ty==='F'?d.n:true).slice(0,10);
  for(const d of dets){const pts=d.ty==='F'?d.n*(G.figs.some(f=>f.k==='pig'&&find(f.s)===d.r&&d.win.includes(f.p))?4:3):d.pts;if(!pts)continue;setTimeout(()=>scorePop({r:d.r,pts,win:d.win},true),400+n*380);n++}
  const wait=Math.min(4200,900+n*380+900);
  setTimeout(()=>{if(!G||!G.over)return;if(UI.camp&&typeof campFinish==='function'){campFinish();return}showResult()},UI.reduce?300:wait)}
function showResult(){const win=G.over.win,me=G.pl.find(p=>p.human);const iWon=me&&win.includes(me.i)&&win.length===1;
  const title=!human()?G.winText:win.length>1?'A tie!':iWon?'You win!':P(win[0]).nm+' wins';
  $('#modal').innerHTML=`<div class="scrim"><div class="card" role="dialog" aria-label="Result"><h2>${esc(title)}</h2><div class="rescore">${G.pl.map(p=>`<span style="--c:${PCOL[p.i]}"><i></i>${p.score}</span>`).join('')}</div><button class="btn big" data-a="again">Play again</button><button class="btn alt" data-a="menu">Menu</button></div></div>`;
  $('#modal').querySelector('[data-a=again]').onclick=()=>beginGame(UI.lastOpts);$('#modal').querySelector('[data-a=menu]').onclick=()=>showStart()}
// ---------- start screen, menu, rules ----------
function savedGame(){try{const g=JSON.parse(localStorage.getItem(SAVE));return g&&g.v===1&&!g.over?g:null}catch(e){return null}}
function showStart(){closeMenu();UI.endShown=false;const o=UI.setup,sv=savedGame();
  const chips=(k,vals)=>vals.map(v=>`<button class="opt" data-k="${k}" data-v="${v[0]}" aria-pressed="${o[k]===v[0]}">${v[1]}</button>`).join('');
  const tg=(k,t)=>`<button class="opt" data-t="${k}" aria-pressed="${!!o[k]}">${t}</button>`;
  $('#modal').innerHTML=`<div class="scrim"><div class="card" role="dialog" aria-label="Start"><h1>Rampart &amp; Vine</h1><p class="sub">Build the valley. Claim it.</p><button class="btn big" data-a="play">Play vs computer</button>
    <button class="btn alt" data-a="story">Story</button>${sv?`<button class="btn alt" data-a="cont">Continue game</button>`:''}
    <div class="opts">${chips('rivals',[[1,'1 rival'],[2,'2 rivals'],[3,'3 rivals']])}</div><div class="opts">${chips('lv',[['easy','Easy'],['normal','Normal'],['hard','Hard']])}</div>
    <div class="opts">${tg('river','River')}${tg('ic','Taverns')}${tg('tb','Merchants')}</div></div></div>`;
  const m=$('#modal');m.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(b.dataset.k)o[b.dataset.k]=isNaN(+b.dataset.v)?b.dataset.v:+b.dataset.v;else o[b.dataset.t]=!o[b.dataset.t];showStart()});
  m.querySelector('[data-a=play]').onclick=()=>beginGame();m.querySelector('[data-a=story]').onclick=()=>{if(typeof campOpen==='function')campOpen()};
  const c=m.querySelector('[data-a=cont]');if(c)c.onclick=loadSaved}
function openMenu(){if($('#menu'))return closeMenu();const d=document.createElement('div');d.id='menu';d.className='menu';d.setAttribute('role','dialog');
  d.innerHTML=`<button data-a="fit">Show the whole valley</button><button data-a="rules">How to play</button><button data-a="snd">Sound: ${SND.on?'on':'off'}</button><button data-a="mus">Music: ${SND.music?'on':'off'}</button><button data-a="spd">Computer speed: ${UI.speed>1?'fast':'normal'}</button><button data-a="story">Story</button><button data-a="new">New game</button>`;
  document.body.appendChild(d);d.onclick=e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;closeMenu();
    if(a==='fit')refit(true);else if(a==='rules')showRules();else if(a==='snd')toggleSound();else if(a==='mus')toggleMusic();else if(a==='spd'){UI.speed=UI.speed>1?1:3;try{localStorage.setItem('rv_fast',UI.speed>1?'1':'0')}catch(e){}}
    else if(a==='story'&&typeof campOpen==='function')campOpen();else if(a==='new'){UI.camp=null;showStart()}};
  setTimeout(()=>document.addEventListener('pointerdown',menuAway,true),0)}
function menuAway(e){if(!e.target.closest('#menu,#menubtn'))closeMenu()}
function closeMenu(){const d=$('#menu');if(d)d.remove();document.removeEventListener('pointerdown',menuAway,true)}
function showRules(){$('#modal').innerHTML=`<div class="scrim"><div class="card drawer" role="dialog" aria-label="How to play"><h2>How to play</h2><ul><li>Draw a tile. Turn it, then lay it so every edge matches.</li><li>Then stand a follower on a road, town, priory or field, or skip.</li><li>Finish a road or town: its owner scores, the follower comes home.</li><li>A priory ringed by eight tiles scores 9.</li><li>At the end, farmers score 3 for each finished town beside their field.</li><li>Most points wins.</li></ul><button class="btn" data-a="x">Got it</button></div></div>`;$('#modal [data-a=x]').onclick=()=>{$('#modal').innerHTML=''}}
// ---------- new game / continue ----------
function beginGame(o){UI.camp=o&&o.camp?o.camp:null;if(o&&!o.camp||!o)o=o||setupOpts();UI.lastOpts=o;resetUI();DEFSEED=o.seed!=null?o.seed:null;newGame(o);$('#modal').innerHTML='';UI.humanTurns=0;refit(false)}
function setupOpts(){const s=UI.setup,np=1+s.rivals,seats=[];for(let i=0;i<np;i++)seats.push(i?'ai':'human');return {np,seats,lv:seats.map(()=>s.lv),ex:{river:s.river,ic:s.ic,tb:s.tb}}}
function resetUI(){UI.fx.length=0;UI.fxSeen=0;UI.turn=-1;UI.stepKey='';UI.endShown=false;UI.handKey=null;UI.aiT&&clearTimeout(UI.aiT);UI.aiT=0;for(const k in UI.tl)UI.tl[k].remove();UI.tl={};for(const k in UI.mp)UI.mp[k].remove();UI.mp={};$('#ov').innerHTML='';UI.seenInit=false;UI.legal=[];UI.hint=null;UI.hintFig=null;closeMenu()}
function loadSaved(){const g=savedGame();if(!g)return;resetUI();G=g;UI.camp=null;UI.fxSeen=0;UI.fx.length=0;$('#modal').innerHTML='';UI.lastOpts=setupOpts();render();refit(false);schedAI()}
// ---------- gestures: drag to move, pinch / wheel to zoom, tap during a computer turn to speed it up ----------
function initGestures(){const b=boardEl(),pt=new Map();let last=null;
  const dist=()=>{const a=[...pt.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};
  const mid=()=>{const a=[...pt.values()];return {x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2}};
  function zoomAt(px,py,k){const v=UI.view,m=measure();let s=v.s*k;s=Math.max(MINC/100*.6,Math.min(2.4,s));k=s/v.s;setView({s,x:px-(px-v.x)*k,y:py-(py-v.y)*k})}
  b.addEventListener('pointerdown',e=>{const r=b.getBoundingClientRect();pt.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top});UI.moved=false;UI.down={x:e.clientX,y:e.clientY};cancelAnimationFrame(UI.tween);UI.tw=false;
    if(pt.size===2)last={d:dist(),m:mid()};
    if(!e.target.closest('button'))aiNow()});
  b.addEventListener('pointermove',e=>{if(!pt.has(e.pointerId))return;const r=b.getBoundingClientRect(),p=pt.get(e.pointerId),nx=e.clientX-r.left,ny=e.clientY-r.top;
    if(UI.down&&Math.hypot(e.clientX-UI.down.x,e.clientY-UI.down.y)>9)UI.moved=true;
    if(pt.size===1){if(UI.moved){const v=UI.view;setView({s:v.s,x:v.x+nx-p.x,y:v.y+ny-p.y});UI.user=true}pt.set(e.pointerId,{x:nx,y:ny})}
    else if(pt.size===2){pt.set(e.pointerId,{x:nx,y:ny});const d=dist(),m=mid();if(last){zoomAt(m.x,m.y,d/last.d);const v=UI.view;setView({s:v.s,x:v.x+m.x-last.m.x,y:v.y+m.y-last.m.y})}last={d,m};UI.moved=true;UI.user=true}});
  const up=e=>{pt.delete(e.pointerId);last=null;if(!pt.size)setTimeout(()=>{UI.moved=false},60)};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')up(e)});
  b.addEventListener('wheel',e=>{e.preventDefault();const r=b.getBoundingClientRect();zoomAt(e.clientX-r.left,e.clientY-r.top,Math.exp(-e.deltaY*.0015));UI.user=true},{passive:false})}
// ---------- boot ----------
function boot(){UI.reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;initGestures();$('#menubtn').addEventListener('click',openMenu);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();if((e.key==='r'||e.key==='R')&&myTurn('place'))rotate()});
  GXV.watch(()=>{if(!G||!G.order.length)return;if(myTurn('fig')&&!UI.user)zoomTile(G.cur.k,false);else if(!UI.user)refit(false);else placeOverlay();updateGhost()});
  showStart()}
boot();
