// ---------- Board-first UI: the valley is the screen. Tap glowing squares, tap the tile to turn it, tap glowing spots for followers. ----------
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PCOL=['#c8372d','#2d62b8','#e2ae22','#3b8a45','#34323b','#a064c0'];
const MINC=30,MAXC=118;// cell size in screen pixels
const FIGICON={f:'meeple',big:'champ',bld:'mason',pig:'hog'};
AIDELAY=Math.max(AIDELAY,950);   // rival steps are shown one at a time with a caption; tap the board to speed up
Object.assign(UI,{rot:0,deg:0,turn:-1,stepKey:'',user:false,hint:null,aiT:0,tl:{},mp:{},fxSeen:0,view:{s:.4,x:0,y:0},camp:null,first:false,moved:false,
  legal:[],rots:[],figs:[],ov:[],setup:{rivals:1,lv:'normal',river:false,ic:false,tb:false},tween:0,overT:0,lastKey:null,humanTurns:0});
try{UI.first=localStorage.getItem('rv_seen')!=='1';UI.speed=localStorage.getItem('rv_fast')==='1'?3:1}catch(e){}
const human=()=>G&&G.pl.some(p=>p.human);
// Addendum 7: PLAY is clean; HINTS (top-bar toggle, off by default) turns on previews, badges, ratings and the bulb; the coached game always teaches
function hintsOn(){return !!(UI.coach||UI.tut||UI.hints)}
function setHints(on){UI.hints=!!on;try{localStorage.setItem('rv_hints',on?'1':'0')}catch(e){}document.documentElement.classList.toggle('hints',hintsOn());const b=$('#hintsbtn');if(b){b.setAttribute('aria-pressed',String(!!on));b.querySelector('span').textContent=on?'Hints on':'Hints'}if(G){UI.pvc={};render()}}
const myTurn=step=>{if(!G||G.over||!G.cur)return false;const s=sideToAct();return s>=0&&P(s).human&&(!step||G.step===step)};
const seatName=p=>p.human&&G.pl.filter(q=>q.human).length===1?'You':p.nm;
function say(t,tn,rc){const el=$('#status');const p=G&&G.cur&&!G.over?P(G.cur.p):null;el.style.setProperty('--c',p?PCOL[p.i]:'#e0a83a');
  el.innerHTML=(tn?`<b class="tn"><i class="tdot"></i>${esc(tn)}</b>`:'')+`<span class="ins">${esc(t)}</span>`+(rc?`<span class="rc">${esc(rc)}</span>`:'');el.classList.toggle('mine',myTurn());{const sr=$('#srlive'),tx=(tn?tn+'. ':'')+t;if(sr&&sr.textContent!==tx)sr.textContent=tx}if(G)try{spreadFigs();keepPops();layoutTags();layoutFlabs()}catch(e){}}
// rival steps: a short caption per step (what it drew, where it put it, what it claimed, what it scored), shown ~1.4 s each
function lastFig(){for(const e of G.log.slice(0,8)){const m=e.t.match(/^(.+?) (?:sets|puts) a .*on the (\w+)\.$/);if(m)return {nm:m[1],ty:m[2],p:G.pl.findIndex(p=>p.nm===m[1])}}return null}
function readMs(t){return 4000+Math.ceil(String(t).split(/\s+/).length/10)*1000}
function capSet(t,ms,score,intro,step){UI.capQ=UI.capQ||[];ms=step?Math.round((ms||1500)/(UI.speed||1)):Math.max(readMs(t),ms||0);UI.capQ.push({t,ms,score:!!score,intro:!!intro});if(!UI.capCur)capNext()}
function capNext(){const n=(UI.capQ||[]).shift();clearTimeout(UI.capT);if(!n){UI.cap=null;UI.capCur=0;if(G)try{renderStatus()}catch(e){}return}
  UI.cap={t:n.t,score:n.score,intro:n.intro,until:Date.now()+n.ms};UI.capCur=1;if(G&&G.cur)try{renderStatus()}catch(e){}UI.capT=setTimeout(capNext,n.ms)}
function capRemain(){if(!UI.capCur)return 0;return Math.max(0,(UI.cap?UI.cap.until-Date.now():0)+(UI.capQ||[]).reduce((a,q)=>a+q.ms,0))}
function capNow(){return UI.cap&&Date.now()<UI.cap.until?UI.cap.t:''}
const FEATW={C:'town',R:'road',M:'priory',F:'field'};
function scoreCap(d,final){const F=G.fd[d.r];const ty=F?FEATW[F.ty]:'feature',n=F&&F.ty!=='M'?(F.tiles||[]).length:0;
  const who=(d.win&&d.win.length?d.win:[d.by||0]).map(i=>seatName(P(i))).join(' & ');
  const why=F&&F.ty==='F'?`field, ${d.pts/3|0} town${(d.pts/3|0)===1?'':'s'}`:F&&F.ty==='M'?(d.pts>=9?'priory with 8 tiles around it':'unfinished priory'):`${final?'unfinished ':'finished '}${ty}, ${n} tile${n===1?'':'s'}`;
  return `${who} +${d.pts}: ${why}`}
// ---------- view: world units are 100 per tile; the world div is translated and scaled ----------
const boardEl=()=>$('#board');
function measure(){const r=boardEl().getBoundingClientRect();return {W:r.width,H:r.height,L:r.left,T:r.top}}
function setView(v){UI.view=v;applyView()}
function applyView(){const v=UI.view,w=$('#world');w.style.transform=`translate(${v.x}px,${v.y}px) scale(${v.s})`;boardEl().style.setProperty('--sc',v.s);placeOverlay()}
function toScreen(wx,wy){return [wx*UI.view.s+UI.view.x,wy*UI.view.s+UI.view.y]}
function tweenView(to,ms){cancelAnimationFrame(UI.tween);UI.tw=false;UI.twTo=to;const a=Object.assign({},UI.view);if(!ms||UI.reduce){setView(to);return}UI.tw=true;const t0=performance.now();
  const step=t=>{const k=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-k,3);setView({s:a.s+(to.s-a.s)*e,x:a.x+(to.x-a.x)*e,y:a.y+(to.y-a.y)*e});if(k<1)UI.tween=requestAnimationFrame(step);else{UI.tw=false;UI.twTo=null;ensureGlowVisible();figShow()}};UI.tween=requestAnimationFrame(step)}
function focusView(cx,cy,cell){const m=measure(),s=cell/100,top=topSafe(),bot=botSafe();return {s,x:m.W/2-cx*100*s,y:top+(m.H-top-bot)/2-cy*100*s}}
function fitCells(cells,m){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of cells){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  const w=x1-x0+1,h=y1-y0+1,aw=m.W-14,ah=m.H-52,c0=Math.min(aw/w,ah/h);return {c:Math.max(MINC,Math.min(innerWidth>=1024?190:MAXC,c0)),fits:c0>=MINC,cx:(x0+x1+1)/2,cy:(y0+y1+1)/2}}
function viewFor(f,m){const s=f.c/100;return {s,x:m.W/2-f.cx*100*s,y:m.H/2+16-f.cy*100*s}}
function fitTarget(){const m=measure();if(!G.order.length)return {s:.4,x:0,y:0};const last=unkey(G.cur&&G.cur.k||G.order[G.order.length-1]);
  const gl=UI.legal.map(g=>[g.x,g.y]);let f=fitCells(G.order.map(unkey).concat(gl),m);if(f.fits)return viewFor(f,m);
  f=fitCells(gl.concat([last]),m);return viewFor(f,m)}
function ensureGlowVisible(){if(!myTurn('place')||UI.tw||UI.user)return;if([...document.querySelectorAll('#world .glow')].some(g=>g.style.visibility!=='hidden'))return;
  const g=UI.legal.filter(q=>q.r===UI.rot);if(!g.length)return;const last=unkey(G.order[G.order.length-1]);g.sort((a,b)=>Math.hypot(a.x-last[0],a.y-last[1])-Math.hypot(b.x-last[0],b.y-last[1]));
  const m=measure();tweenView(viewFor({c:Math.max(MINC,UI.view.s*100),cx:g[0].x+.5,cy:g[0].y+.5},m),300)}
function refit(anim){if(!G||!G.order.length)return;UI.user=false;tweenView(fitTarget(),anim?420:0)}
function zoomTile(k,anim){const m=measure(),[x,y]=unkey(k),ph=PHONE(),c=Math.max(UI.view.s*100,Math.min(m.W*(ph?.44:.2),(m.H-topSafe()-botSafe())*.4,ph?170:220));tweenView(focusView(x+.5,y+.5,c),anim?380:0)}
// ---------- camera follow (W426): frame the spots near the last tile, zoom in on the chosen spot, ease back out, follow the rival ----------
const PHONE=()=>innerWidth<700;
function topSafe(){const s=$('#status'),b=boardEl();if(!s||!b||!s.offsetHeight)return 40;return Math.max(40,s.getBoundingClientRect().bottom-b.getBoundingClientRect().top+8)}
function botSafe(){const h=$('#hand');if(!h||getComputedStyle(h).position!=='absolute')return 0;return h.offsetHeight+18}
function frameCells(cells,cmin,cmax){const m=measure();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of cells){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  const top=topSafe(),bot=botSafe(),aw=m.W-24,ah=m.H-top-bot-12,c=Math.max(cmin,Math.min(cmax,Math.min(aw/(x1-x0+1),ah/(y1-y0+1)))),s=c/100;return {s,x:m.W/2-(x0+x1+1)/2*100*s,y:top+ah/2-(y0+y1+1)/2*100*s}}
function aimCells(){const last=unkey(G.order[G.order.length-1]);const g=UI.legal.filter(q=>q.r===UI.rot).map(q=>{let rk=0;try{rk=pvRank(prevCalc(q.x,q.y,UI.rot))}catch(e){}return {q,rk,d:Math.hypot(q.x-last[0],q.y-last[1])}}).sort((a,b)=>a.d-b.d);
  if(!g.length)return [last];let best=g[0];for(const e of g)if(e.rk>best.rk)best=e;const set=g.filter(e=>e.d<=2.3).slice(0,6);if(!set.length)set.push(g[0]);if(best.rk>0&&!set.includes(best))set.push(best);
  return set.map(e=>[e.q.x,e.q.y]).concat([last])}
function fitsAt(cells,c){const m=measure();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of cells){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}return (x1-x0+1)*c<=m.W-24&&(y1-y0+1)*c<=m.H-topSafe()-botSafe()-12}
// the camera keeps the whole valley in view when the tiles stay readable; otherwise the biggest readable patch around the newest tile
const CAMMIN=()=>PHONE()?54:64,CAMMAX=()=>PHONE()?104:(innerWidth>=1024?200:MAXC);
function valleyCells(extra,around){const all=G.order.map(unkey).concat(extra||[]);const cmin=CAMMIN();if(fitsAt(all,cmin))return all;
  const c=around||unkey(G.order[G.order.length-1]);const by=all.slice().sort((a,b)=>Math.hypot(a[0]-c[0],a[1]-c[1])-Math.hypot(b[0]-c[0],b[1]-c[1]));const out=[];
  for(const q of by){out.push(q);if(!fitsAt(out,cmin)){out.pop();if(out.length>=4)break}}return out.length?out:[c]}
function camValley(extra,around,ms){if(!G||!G.order.length)return;tweenView(frameCells(valleyCells(extra,around),CAMMIN(),CAMMAX()),ms==null?600:ms)}
function camAim(ms){if(!G||!myTurn('place')||UI.user||!G.order.length)return;const gl=UI.legal.filter(q=>q.r===UI.rot).map(q=>[q.x,q.y]);
  const near=aimCells();const cells=valleyCells(gl);if(!near.slice(0,-1).some(q=>cells.some(c=>c[0]===q[0]&&c[1]===q[1]))){camValley(near,near[0],ms==null?600:ms);return}tweenView(frameCells(cells,CAMMIN(),CAMMAX()),ms==null?600:ms)}
function camSpot(x,y,ms){const m=measure(),c=UI.view.s*100,sx=(x+.5)*c+UI.view.x,sy=(y+.5)*c+UI.view.y,top=topSafe(),bot=botSafe();if(sx>c&&sx<m.W-c&&sy>top+c*.8&&sy<m.H-bot-c*.8)return;tweenView(focusView(x+.5,y+.5,Math.max(c,CAMMIN())),ms==null?420:ms)}
function camArea(k,ms){if(UI.user||!G)return;camValley(null,unkey(k),ms)}
function recentre(){UI.user=false;if(!G||!G.order.length||G.over){if(G&&G.order.length)refit(true);return}sfx('click');if(myTurn('place')){if(UI.sel)camSpot(UI.sel.x,UI.sel.y);else camAim()}else if(myTurn('fig'))zoomTile(G.cur.k,true);else if(G.cur&&G.cur.k&&G.tiles[G.cur.k])camArea(G.cur.k);else camArea(G.order[G.order.length-1])}
function selSpot(x,y){UI.sel={x,y,r:UI.rot};sfx('click');UI.user=false;renderGlows();renderHand();if(hintsOn())try{pvHighlight(prevCalc(x,y,UI.rot).hl)}catch(e){}renderStatus();camSpot(x,y)}
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
    if(UI.hint&&UI.hint.x===g.x&&UI.hint.y===g.y&&UI.hint.r===UI.rot)b.classList.add('hintspot');if(UI.sel&&UI.sel.x===g.x&&UI.sel.y===g.y)b.classList.add('sel');
    try{const pv=prevCalc(g.x,g.y,UI.rot);if(pv.badge&&hintsOn()){b.insertAdjacentHTML('beforeend',`<span class="pvb ${pv.kind||''}">${esc(pv.badge)}</span>`);b._rk=pvRank(pv)}}catch(e){}
    const gx=g.x,gy=g.y;b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&hintsOn())pvShow(b,gx,gy)});b.addEventListener('pointerdown',()=>{if(hintsOn())pvShow(b,gx,gy)});
    b.addEventListener('pointerleave',()=>pvHide());b.addEventListener('pointercancel',()=>pvHide());
    b.addEventListener('click',()=>onGlow(g.x,g.y));w.appendChild(b)}layoutTags()}
// ---------- overlay: followers on the map, follower spots, ghost finger, pops (screen-sized items that follow the map) ----------
function addOv(el,wx,wy,o){o=o||{};el._o={wx,wy,dx:o.dx||0,dy:o.dy||0};$('#ov').appendChild(el);return el}
// follower spots stay hidden while the camera moves, so a button never slides away under a finger
function figShow(){for(const e of document.querySelectorAll('#ov .fglow.wait'))e.classList.remove('wait')}
function spreadFigs(){const f=[...$('#ov').children].filter(e=>e.classList.contains('fglow')&&e._o);if(f.length<2)return;const P=f.map(e=>{const [x,y]=toScreen(e._o.wx,e._o.wy);return {e,x:x+e._o.dx,y:y+e._o.dy,ox:0,oy:0}}),D=46;
  for(let it=0;it<24;it++){let moved=false;for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];let dx=(b.x+b.ox)-(a.x+a.ox),dy=(b.y+b.oy)-(a.y+a.oy),d=Math.hypot(dx,dy);if(d>=D)continue;if(d<.01){dx=0;dy=1;d=1}const k=(D-d)/2/d;a.ox-=dx*k;a.oy-=dy*k;b.ox+=dx*k;b.oy+=dy*k;moved=true}if(!moved)break}
  for(const q of P)q.e.style.transform=`translate(${q.x+q.ox}px,${q.y+q.oy}px) translate(-50%,-50%)`}
function placeOverlay(){placeGhost();const m=measure(),pad=14;const cell=UI.view.s*100;const ms=Math.max(24,Math.min(48,cell*.4));$('#ov').style.setProperty('--ms',ms+'px');
  for(const el of $('#ov').children){const o=el._o;if(!o)continue;const [sx,sy]=toScreen(o.wx,o.wy);el.style.transform=`translate(${sx+o.dx}px,${sy+o.dy}px) translate(-50%,-50%)`;
    if(o.cull){const r=o.r||0;const vis=sx>pad+r&&sx<m.W-pad-r&&sy>pad+r+28&&sy<m.H-pad-r;el.style.visibility=vis?'':'hidden'}}
  // glows must lie fully inside the board so none is half cut off or under the bars
  const c=UI.view.s*100;for(const g of $('#world').querySelectorAll('.glow')){const x=+g.dataset.x*c+UI.view.x,y=+g.dataset.y*c+UI.view.y;g.style.visibility=(x>=0&&y>=34&&x+c<=m.W&&y+c<=m.H-botSafe())?'':'hidden'}spreadFigs();keepPops();layoutTags();layoutFlabs()}
function spotWorld(k,l){const T=G.tiles[k],[x,y]=unkey(k),sp=rotP(buildGeo(T.t).spots[l],T.r);return [x*100+sp[0],y*100+sp[1]]}
function renderMeeples(){const live={};
  for(const f of G.figs){const id=f.s+f.k+f.p;live[id]=f;if(UI.mp[id])continue;const k=G.sk[f.s],l=G.sl[f.s],[wx,wy]=spotWorld(k,l);
    const e=document.createElement('div');e.className='mp';e.style.setProperty('--c',PCOL[f.p]);e.innerHTML=pcHtml(FIGICON[f.k],f.p);
    addOv(e,wx,wy,{dx:f.k==='bld'||f.k==='pig'?10:0,dy:f.k==='bld'||f.k==='pig'?-8:0});UI.mp[id]=e}
  for(const id in UI.mp)if(!live[id]){const e=UI.mp[id];delete UI.mp[id];e.classList.add('gone');setTimeout(()=>e.remove(),520)}
  placeOverlay()}
function renderFigSpots(){for(const e of [...$('#ov').children])if(e.classList.contains('fglow'))e.remove();
  UI.figs=[];if(!myTurn('fig'))return;const p=sideToAct(),T=G.tiles[G.cur.k],moves=figMoves(p).filter(m=>m.act==='fig');
  const byL={};for(const m of moves)(byL[m.l]=byL[m.l]||[]).push(m);
  for(const l in byL){const [wx,wy]=spotWorld(G.cur.k,+l),ms=byL[l];
    ms.forEach((m,i)=>{const b=document.createElement('button');b.className='fglow';b.style.setProperty('--c',PCOL[p]);b.innerHTML=pcHtml(FIGICON[m.k],p);
      b.setAttribute('aria-label',`Place ${FIGN[m.k]} here`);{let nm='';try{nm=hintsOn()?prevFig(l):(FEATW[G.fd[find(T.s0+ +l)].ty]||'')}catch(e){const sg=TSEG[T.t][+l];nm=sg?FEATW[sg.ty]:''}if(nm&&ms.length===1||nm&&i===0){const lb=document.createElement('span');lb.className='flab';lb.textContent=nm;b.appendChild(lb)}}b.addEventListener('click',()=>onFig(m));
      addOv(b,wx,wy,{dx:ms.length>1?(i-(ms.length-1)/2)*50:0});b._m=m;if(UI.tw&&!UI.sim)b.classList.add('wait');UI.figs.push(b)})}
  clearTimeout(UI.figT);UI.figT=setTimeout(figShow,700);
  placeOverlay()}
// ---------- ghost finger (first game, and chapters that give hints): points at the move the computer would pick ----------
function hintOn(){return false}   // no advice on its own: the lightbulb (hlp.js) gives it on demand, coach bubbles only the first time
function showGhost(wx,wy,vx,vy,dx){const old=$('#ghost');if(old)old.remove();if(wx==null&&vx==null)return;
  const g=document.createElement('div');g.id='ghost';g.innerHTML='<svg viewBox="0 0 48 48" width="44" height="44"><path d="M19 4c2 0 3.5 1.4 3.5 3.3V19l1.8-.8c1.3-.5 2.8.2 3.2 1.5l.3.9 2.2-.7c1.4-.4 2.8.4 3.2 1.8l.4 1.1c1.8-.4 3.4.7 3.7 2.4.8 4.4.5 8.4-1.1 11.6-1.5 3-4.2 5-8.3 5H24c-3.3 0-5.6-1.3-7.6-4.2L10.2 28c-.7-1.2-.3-2.8.9-3.5 1.1-.6 2.5-.4 3.3.6l1.1 1.3V7.3C15.5 5.4 17 4 19 4z" fill="#fff" stroke="#3a2610" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  g.style.cssText='position:fixed;left:0;top:0;z-index:20;pointer-events:none';
  if(vx!=null)g.style.transform=`translate(${vx}px,${vy}px)`;else g._w={wx,wy,dx:10+(dx||0),dy:16};
  document.body.appendChild(g);placeGhost()}
function placeGhost(){const g=$('#ghost');if(!g||!g._w)return;const b=boardEl().getBoundingClientRect(),[sx,sy]=toScreen(g._w.wx,g._w.wy);g.style.transform=`translate(${b.left+sx+g._w.dx}px,${b.top+sy+g._w.dy}px) translate(-50%,-50%)`}
function updateGhost(){const old=$('#ghost');if(old)old.remove();if(!hintOn()||!G||G.over||!myTurn())return;
  if(G.step==='place'&&UI.hint){if(UI.rot===UI.hint.r)showGhost(UI.hint.x*100+50,UI.hint.y*100+50);else{const r=$('#htile').getBoundingClientRect(),b=boardEl().getBoundingClientRect();
      // finger on the tile itself (turn it): hand is outside the board, so keep it in the board's coordinate space
      showGhost(null,null,r.left+r.width/2+10,r.top+r.height/2+10)}}
  else if(G.step==='fig'&&UI.hintFig){if(UI.hintFig.act==='skip'){const r=$('#hskip');if(r){const rb=r.getBoundingClientRect(),b=boardEl().getBoundingClientRect();r.classList.add('hintspot');showGhost(null,null,rb.left+rb.width/2+10,rb.top+rb.height/2+10)}}
    else{const [wx,wy]=spotWorld(G.cur.k,UI.hintFig.l);const b=UI.figs.find(q=>q._m.k===UI.hintFig.k&&q._m.l===UI.hintFig.l);if(b)b.classList.add('hintspot');showGhost(wx,wy,null,null,b?b._o.dx:0)}}}
// ---------- top strip, hand, status ----------
function renderTop(){const el=$('#seats');el.innerHTML=G.pl.map(p=>{const s=p.sup,cur=!G.over&&sideToAct()===p.i;
    return `<div class="seat${cur?' cur':''}" style="--c:${PCOL[p.i]}" data-i="${p.i}"><i class="dot"></i><span class="nm">${esc(seatName(p))}</span><b>${p.score}</b><span class="fl" title="followers left">${fi('meeple',p.i)}${s.f}${s.big?`${fi('champ',p.i)}`:''}${s.bld?`${fi('mason',p.i)}`:''}${s.pig?`${fi('hog',p.i)}`:''}</span>${p.goods.wine+p.goods.grain+p.goods.cloth?`<span class="fl" title="goods">${ico('wine')}${p.goods.wine+p.goods.grain+p.goods.cloth}</span>`:''}</div>`}).join('');
  $('#left').innerHTML=`<i class="pile"></i><svg class="plain" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"/></svg><b>${tilesLeft()}</b><small>left</small>`}
function bumpSeat(i){const e=document.querySelector(`.seat[data-i="${i}"]`);if(e){e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump')}}
function hname(t,p){const mine=P(p).human;return `<div class="hname"><b>${mine?'Your tile':esc(P(p).nm)+'’s tile'}</b><span>${esc(TT[t].n)}</span></div>`}
function renderHand(){const h=$('#hand');const p=G.over?null:G.cur&&G.cur.p;
  if(G.over||!G.cur){h.innerHTML=`<div id="hinfo"><span class="big">Valley complete</span></div>`;return}
  const mine=myTurn(),c=PCOL[G.cur.p];
  if(G.step==='place'){const t=G.cur.t;
    if(!UI.handKey||UI.handKey!==G.turn){UI.handKey=G.turn;UI.deg=UI.rot*90;h.innerHTML=`<button id="htile" style="--c:${c}" aria-label="Turn the tile"><div class="spin">${tileSvg(t,0)}</div><span class="rot" aria-hidden="true"></span></button>${hname(t,G.cur.p)}`;$('#htile').classList.add('nospin');$('#htile').addEventListener('click',()=>{if(myTurn('place'))rotate()});setTimeout(()=>$('#htile')&&$('#htile').classList.remove('nospin'),30)}
    const b=$('#htile');b.disabled=!myTurn('place');b.classList.toggle('mine',myTurn('place'));b.style.setProperty('--c',c);b.querySelector('.rot').hidden=!(myTurn('place')&&UI.rots.length>1);
    b.querySelector('.spin').style.transform=`rotate(${UI.deg}deg)`;let hp=$('#hplace');const want=!!(UI.sel&&myTurn('place'));h.classList.toggle('hassel',want);
    if(want&&!hp){hp=document.createElement('button');hp.id='hplace';hp.type='button';hp.textContent='Place here';hp.addEventListener('click',()=>{if(UI.sel)placeAt(UI.sel.x,UI.sel.y)});h.appendChild(hp)}else if(!want&&hp)hp.remove()}
  else if(G.step==='fig'){UI.handKey=null;
    if(myTurn()){h.innerHTML=`<button id="hskip">Skip</button>`;$('#hskip').addEventListener('click',()=>onSkip())}
    else h.innerHTML=`<button id="htile" disabled style="--c:${c}">${tileSvg(G.tiles[G.cur.k].t,G.tiles[G.cur.k].r)}</button>${hname(G.tiles[G.cur.k].t,G.cur.p)}`}}
function renderStatus(){let t='',tn='';const c=capNow(),sc=c&&UI.cap.score;
  if(sc){tn='Scoring';t=c}
  else if(G.over){tn='Game over';t='The valley is full. Counting the points…'}
  else if(G.cur){const me=myTurn();const p=P(G.cur.p);tn=me?'Your turn':`${p.nm}’s turn`;
    if(me&&c&&UI.cap.intro&&G.step==='place')t=c;
    else if(me&&G.step==='place'&&UI.prev)t=UI.prev.t;
    else if(me&&G.step==='place'&&UI.sel){let l='';try{l=prevCalc(UI.sel.x,UI.sel.y,UI.sel.r).line}catch(e){}t=(hintsOn()&&l&&!/^Nothing/.test(l)?l+' ':'')+'Tap again to place.'}
    else if(me&&G.step==='place')t=G.cur.bonus?'Extra turn! Place your tile.':isRiver(G.cur.t)?'Continue the river: tap a glowing square.':(UI.rots&&UI.rots.length>1?'Turn your tile, then tap a glowing square.':'Tap a glowing square to place your tile.');
    else if(me)t='Add a follower, or Skip.';
    else t=(c&&!UI.cap.intro?c:'')||`Watch ${p.nm} play a tile.`}
  say(t,tn,'')}
// ---------- turn bookkeeping ----------
function syncTurn(){if(!G||G.over||!G.cur)return;const key=G.turn+':'+G.step;if(key===UI.stepKey)return;UI.stepKey=key;
  if(myTurn('place')){UI.legal=legalPlacements(G.cur.t);UI.rots=[...new Set(UI.legal.map(g=>g.r))].sort();UI.hint=null;
    const cnt=r=>UI.legal.filter(g=>g.r===r).length;let best=UI.rots[0];for(const r of UI.rots)if(cnt(r)>cnt(best))best=r;UI.rot=best;
    if(hintOn()){try{const plan=aiPlan(G.cur.p,'normal');UI.hint={x:plan.place.x,y:plan.place.y,r:plan.place.r};UI.rot=plan.place.r;UI.hintFig=null}catch(e){UI.hint=null}}
    UI.deg=UI.rot*90;UI.user=false;UI.sel=null;camAim()}
  else if(myTurn('fig')){UI.legal=[];UI.hintFig=hintOn()?bestFigNow(G.cur.p,'normal'):null;if(!UI.user)zoomTile(G.cur.k,true)}
  else{UI.legal=[];UI.hint=null;UI.hintFig=null;UI.sel=null}}
// ---------- the main render ----------
function render(){if(!G)return;syncTurn();renderTop();renderTiles();renderGlows();renderMeeples();renderFigSpots();renderHand();renderStatus();renderSheet();updateGhost();placeOverlay();ensureGlowVisible();setTimeout(ensureGlowVisible,500);hlpAfter()}
function save(){if(UI.tut||UI.coach)return;try{if(G&&!G.over&&G.pl.some(p=>p.human)&&!UI.camp)localStorage.setItem(SAVE,JSON.stringify(G));else localStorage.removeItem(SAVE)}catch(e){}}
function refresh(){if(UI.sim||!G)return;render();save();playFx();if(UI.coach)try{coachTick()}catch(e){console.error(e)}if(G.over)finishUp();else schedAI()}
// ---------- actions ----------
function rotate(){if(!myTurn('place')||UI.rots.length<2){return}if(!tutGate({what:'rotate'}))return;const i=UI.rots.indexOf(UI.rot),n=UI.rots[(i+1)%UI.rots.length];UI.deg+=((n-UI.rot+4)%4||4)*90;UI.rot=n;sfx('click');if(UI.sel){if(UI.legal.some(g=>g.r===n&&g.x===UI.sel.x&&g.y===UI.sel.y))UI.sel.r=n;else UI.sel=null}renderGlows();renderHand();renderStatus();if(UI.sel){try{pvHighlight(prevCalc(UI.sel.x,UI.sel.y,n).hl)}catch(e){}}else{pvHighlight(null);camAim(350)}updateGhost();placeOverlay();ensureGlowVisible();const b=$('#htile');if(b)b.querySelector('.spin').style.transform=`rotate(${UI.deg}deg)`}
function onGlow(x,y){if(UI.moved||!myTurn('place'))return;if(!isLegal({act:'place',x,y,r:UI.rot},sideToAct()))return;
  if((UI.lastPT==='touch'||UI.lastPT==='pen')&&!UI.tut&&!(UI.sel&&UI.sel.x===x&&UI.sel.y===y&&UI.sel.r===UI.rot)){selSpot(x,y);return}placeAt(x,y)}
function placeAt(x,y){if(!myTurn('place'))return;{const gc=$('#goal');if(gc)gc.remove()}const m={act:'place',x,y,r:UI.rot};if(!isLegal(m,sideToAct()))return;if(!tutGate({what:'place',x,y}))return;UI.sel=null;UI.hint=null;UI.humanTurns++;pvHide();buzz(14);ratingBegin(x,y,UI.rot);performMove(m,sideToAct())}
function onFig(m){if(UI.moved||!myTurn('fig'))return;if(!tutGate({what:'fig',k:m.k,l:m.l}))return;UI.hintFig=null;ratingFig(m);buzz(10);const k=G.cur.k;performMove(m,sideToAct());ratingEnd();markSeen();camArea(k)}
function onSkip(){if(!myTurn('fig'))return;if(!tutGate({what:'skip'}))return;UI.hintFig=null;ratingFig(null);const k=G.cur.k;performMove({act:'skip'},sideToAct());ratingEnd();markSeen();camArea(k)}
function buzz(ms){try{if(navigator.vibrate&&!UI.sim)navigator.vibrate(ms)}catch(e){}}
function markSeen(){if(UI.first&&UI.humanTurns>=2){UI.first=false;try{localStorage.setItem('rv_seen','1')}catch(e){}}}
// ---------- computer turns: show its tile, then place, then the follower, each about half a second ----------
function aiAct(){UI.aiT=0;if(!G||G.over||UI.aiFly)return;const s=sideToAct();if(s<0||P(s).human)return;const m=aiMove(s);if(!m)return;
  if(m.act==='place'&&!UI.sim&&!UI.reduce&&ANIM&&UI.speed<8){aiFly(m,s);return}
  const r=performMove(m,s);if(!r.success)console.error('ai move failed',r.error)}
// the rival's tile, step by step: it lifts out of the bag (top bar), flies to its spot, turns to its final angle, then lands
function aiFly(m,s){const sp=1/(UI.speed||1),w=$('#world'),t=G.cur.t;UI.aiFly=true;if(!UI.user)camValley([[m.x,m.y]],[m.x,m.y],Math.round(450*sp));
  const go=()=>{const bag=$('#left'),b=boardEl().getBoundingClientRect();let bx=m.x*100,by=(m.y-3)*100;if(bag){const r=bag.getBoundingClientRect();bx=(r.left+r.width/2-b.left-UI.view.x)/UI.view.s-50;by=(r.top+r.height/2-b.top-UI.view.y)/UI.view.s-50}
    const f=document.createElement('div');f.className='tl fly';f.style.left=m.x*100+'px';f.style.top=m.y*100+'px';f.style.setProperty('--pc',PCOL[s]);f.innerHTML=tileSvg(t,0);
    const r0=(m.r+3)*90,r1=r0+90,dx=bx-m.x*100,dy=by-m.y*100;f.style.transform=`translate(${dx}px,${dy}px) rotate(${r0}deg) scale(.45)`;f.style.opacity='0';w.appendChild(f);sfx('turn');
    const T=(ms,fn)=>setTimeout(()=>{if(!G||G.over||!f.isConnected){UI.aiFly=false;f.remove();return}fn()},Math.round(ms*sp));
    requestAnimationFrame(()=>{f.style.transition=`transform ${Math.round(900*sp)}ms cubic-bezier(.3,.7,.3,1),opacity ${Math.round(250*sp)}ms`;f.style.opacity='1';f.style.transform=`translate(0,0) rotate(${r0}deg) scale(1.14)`});
    T(1000,()=>{f.style.transition=`transform ${Math.round(420*sp)}ms ease-in-out`;f.style.transform=`rotate(${r1}deg) scale(1.14)`;sfx('click')});
    T(1550,()=>{f.style.transition=`transform ${Math.round(180*sp)}ms ease-in`;f.style.transform=`rotate(${r1}deg) scale(1)`});
    T(1760,()=>{f.remove();UI.aiFly=false;if(sideToAct()!==s||!G.cur||G.cur.t!==t)return;const r=performMove(m,s);if(!r.success)console.error('ai move failed',r.error)})};
  setTimeout(go,Math.round(480*sp))}
function schedAI(){if(UI.aiT||!G||G.over)return;const s=sideToAct();if(s<0||P(s).human)return;UI.aiT=setTimeout(aiAct,Math.max((G.step==='place'?AIDELAY:AIDELAY*1.1)/UI.speed,capRemain()))}
function aiNow(){if(UI.capQ&&UI.capQ.length)UI.capQ.length=0;if(UI.aiT){clearTimeout(UI.aiT);aiAct()}}
// ---------- effects: scores light up the feature and fly to the seat chip ----------
function playFx(){const list=UI.fx.slice(UI.fxSeen);UI.fxSeen=UI.fx.length;let n=0;
  for(const f of list){if(UI.coach)try{coachFx(f)}catch(e){console.error(e)}if(f.t==='fig'){const lf=lastFig();if(lf&&lf.p>=0&&!P(lf.p).human)UI.recap=`${lf.nm} took a ${lf.ty}.`}else if(f.t==='turn'&&!P(f.x).human)UI.recap=''}

  for(const f of list){if(f.t==='place')sfx('place');else if(f.t==='fig')sfx('fig');else if(f.t==='home')sfx('home');else if(f.t==='goods')sfx('goods');else if(f.t==='discard')sfx('bad');else if(f.t==='turn'&&!P(f.x).human)sfx('turn');
    else if(f.t==='score'){const d=f.x,delay=n++*520;try{capSet(scoreCap(d,false),1500,true)}catch(e){}setTimeout(()=>scorePop(d),delay)}}}
function featCells(r){const F=G.fd[r];if(!F)return [];if(F.ty==='M')return [[F.x,F.y]];return (F.tiles||[]).map(unkey)}
function scorePop(d,final){if(!G)return;const cells=featCells(d.r);if(!cells.length)return;sfx('score');
  for(const [x,y] of cells){const e=UI.tl[key(x,y)];if(e){e.classList.remove('lit');void e.offsetWidth;e.classList.add('lit')}}
  const cx=cells.reduce((a,c)=>a+c[0],0)/cells.length+.5,cy=cells.reduce((a,c)=>a+c[1],0)/cells.length+.5;
  const w=d.win.length?d.win:[d.by||0];
  w.forEach((i,j)=>{const e=document.createElement('div');e.className='pop';e.style.setProperty('--c',PCOL[i]);{const F=G.fd[d.r];e.innerHTML='+'+d.pts+'<small>'+(F?FEATW[F.ty]:'')+'</small>'}let dy=-j*30;{const [px,py]=toScreen(cx*100,cy*100);for(let k=0;k<8;k++){const hit=[...$('#ov').querySelectorAll('.pop')].some(o=>{if(!o._o)return false;const [ox,oy]=toScreen(o._o.wx,o._o.wy);return Math.abs(ox+o._o.dx-px)<70&&Math.abs(oy+o._o.dy-(py+dy))<44});if(!hit)break;dy-=46}}addOv(e,cx*100,cy*100,{dy});placeOverlay();
    const chip=document.querySelector(`.seat[data-i="${i}"]`),b=boardEl().getBoundingClientRect();
    setTimeout(()=>{const o=e._o;if(chip&&!PHONE()){const c=chip.getBoundingClientRect();const [sx,sy]=toScreen(o.wx,o.wy);e.style.transform=`translate(${c.left+c.width/2-b.left}px,${c.top+c.height/2-b.top}px) translate(-50%,-50%) scale(.6)`;e.style.opacity='.1';e._o=null}else e.style.opacity='0';bumpSeat(i)},final?900:700);
    setTimeout(()=>{e.remove();try{placeOverlay()}catch(x){}},final?1900:1700)})}
// ---------- the end: unfinished features score one by one, then the result ----------
function finalPops(){const fs=finalScores();let n=0;const dets=fs.det.filter(d=>d.ty==='F'?d.n:true).slice(0,10);
  for(const d of dets){const pts=d.ty==='F'?d.n*(G.figs.some(f=>f.k==='pig'&&find(f.s)===d.r&&d.win.includes(f.p))?4:3):d.pts;if(!pts)continue;setTimeout(()=>scorePop({r:d.r,pts,win:d.win},true),400+n*700);n++}
  return n}
function tutFinalPops(){if(UI.tut)finalPops()}
function finishUp(){if(UI.endShown)return;UI.endShown=true;UI.aiT&&clearTimeout(UI.aiT);UI.aiT=0;if(UI.coach){const n=finalPops();setTimeout(()=>{try{coachEnd()}catch(e){console.error(e)}},Math.min(8000,1400+n*700));return}if(UI.tut)return;sfx('win');
  const n=finalPops();
  const wait=Math.min(8000,900+n*700+1400);
  setTimeout(()=>{if(!G||!G.over)return;if(UI.camp&&typeof campFinish==='function'){campFinish();return}showResult()},UI.reduce?300:wait)}
function showResult(){const win=G.over.win,me=G.pl.find(p=>p.human);const iWon=me&&win.includes(me.i)&&win.length===1;
  const title=!human()?G.winText:win.length>1?'A tie!':iWon?'You win!':P(win[0]).nm+' wins';
  const rv=G.pl.find(p=>!p.human),line=UI.camp||typeof STORY==='undefined'||!me?'':(win.length>1?STORY.quickTie:iWon?STORY.quickWin:STORY.quickLose(rv?rv.nm:'The rival'));
  $('#modal').innerHTML=`<div class="scrim"><div class="card" role="dialog" aria-label="Result"><h2>${esc(title)}</h2>${line?`<p class="sub">${esc(line)}</p>`:''}<div class="rescore">${G.pl.map(p=>`<span style="--c:${PCOL[p.i]}"><i></i>${esc(seatName(p))} ${p.score}</span>`).join('')}</div><button class="btn big" data-a="again">Play again</button><button class="btn alt" data-a="menu">Menu</button></div></div>`;
  $('#modal').querySelector('[data-a=again]').onclick=()=>beginGame(UI.lastOpts);$('#modal').querySelector('[data-a=menu]').onclick=()=>showStart()}
// ---------- start screen, menu, rules ----------
function savedGame(){try{const g=JSON.parse(localStorage.getItem(SAVE));return g&&g.v===1&&!g.over?g:null}catch(e){return null}}
function showStart(){closeMenu();UI.endShown=false;const o=UI.setup,sv=savedGame();
  const chips=(k,vals)=>vals.map(v=>`<button class="opt" data-k="${k}" data-v="${v[0]}" aria-pressed="${o[k]===v[0]}">${v[1]}</button>`).join('');
  const tg=(k,t)=>`<button class="opt" data-t="${k}" aria-pressed="${!!o[k]}">${t}</button>`;
  $('#modal').innerHTML=`<div class="scrim"><div class="card" role="dialog" aria-label="Start"><h1>Rampart &amp; Vine</h1><p class="sub">${STORY.quickTitle}</p>${tutFirst()?tutBtn('btn alt'):''}<button class="btn big" data-a="play">Play vs computer</button>
    <button class="btn alt" data-a="story">Story</button>${sv?`<button class="btn alt" data-a="cont">Continue game</button>`:''}${tutFirst()?'':tutBtn('btn alt')}
    <div class="opts">${chips('rivals',[[1,'1 rival'],[2,'2 rivals'],[3,'3 rivals']])}</div><div class="opts">${chips('lv',[['easy','Easy'],['normal','Normal'],['hard','Hard']])}</div>
    <div class="opts">${tg('river','River')}${tg('ic','Taverns')}${tg('tb','Merchants')}</div></div></div>`;
  const m=$('#modal');m.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(b.dataset.k)o[b.dataset.k]=isNaN(+b.dataset.v)?b.dataset.v:+b.dataset.v;else o[b.dataset.t]=!o[b.dataset.t];showStart()});
  m.querySelector('[data-a=play]').onclick=()=>{if(tutOffer())showOffer();else beginGame()};m.querySelector('[data-a=story]').onclick=()=>{if(typeof campOpen==='function')campOpen()};
  const c=m.querySelector('[data-a=cont]');if(c)c.onclick=loadSaved}
function openMenu(){if($('#menu'))return closeMenu();const d=document.createElement('div');d.id='menu';d.className='menu';d.setAttribute('role','dialog');
  d.innerHTML=`${UI.coach?'<button data-a="leave">Leave tutorial</button>':''}<button data-a="fit">Show the whole valley</button><button data-a="rules">How to play</button><button data-a="snd">Sound: ${SND.on?'on':'off'}</button><button data-a="mus">Music: ${SND.music?'on':'off'}</button><button data-a="musicp">Choose music</button><button data-a="paint">Pictures: ${PAINT_ON?'painted':'simple'}</button><button data-a="spd">Computer speed: ${UI.speed>1?'fast':'normal'}</button><button data-a="story">Story</button>${tutBtn('')}<button data-a="new">New game</button>${typeof GXH!=='undefined'?GXH.settingsHTML({rowClass:'srow',btnClass:'opt'}):''}`;
  document.body.appendChild(d);d.onclick=e=>{const b=e.target.closest('button');if(!b||b.dataset.gxh||b.hasAttribute('data-gxt-open'))return;const a=b.dataset.a;closeMenu();
    if(a==='leave')coachLeave();else if(a==='fit')refit(true);else if(a==='rules')showRules();else if(a==='snd')toggleSound();else if(a==='mus')toggleMusic();else if(a==='musicp')musicOpen();else if(a==='paint')paintToggle();else if(a==='spd'){UI.speed=UI.speed>1?1:3;try{localStorage.setItem('rv_fast',UI.speed>1?'1':'0')}catch(e){}}
    else if(a==='story'&&typeof campOpen==='function')campOpen();else if(a==='new'){UI.camp=null;showStart()}};
  setTimeout(()=>document.addEventListener('pointerdown',menuAway,true),0)}
function menuAway(e){if(!e.target.closest('#menu,#menubtn'))closeMenu()}
function closeMenu(){const d=$('#menu');if(d)d.remove();document.removeEventListener('pointerdown',menuAway,true);if(d)hlpAfter()}
function showRules(){$('#modal').innerHTML=`<div class="scrim"><div class="card drawer" role="dialog" aria-label="How to play"><h2>How to play</h2><p class="raim">Score the most points by finishing roads and towns.</p><ul><li>Draw a tile. Turn it and lay it so edges match.</li><li>Then put a follower on a road, town, priory or field.</li><li>Or skip and keep your follower.</li><li>Finish a road or town. Its owner scores and the follower goes home.</li><li>A priory with eight tiles around it scores 9.</li><li>At the end, a farmer scores 3 per finished town.</li><li>Most points wins.</li></ul><button class="btn" data-a="x">Got it</button></div></div>`;$('#modal [data-a=x]').onclick=()=>{$('#modal').innerHTML=''}}
// ---------- new game / continue ----------
function beginGame(o){UI.camp=o&&o.camp?o.camp:null;if(o&&!o.camp||!o)o=o||setupOpts();UI.lastOpts=o;resetUI();DEFSEED=o.seed!=null?o.seed:null;newGame(o);$('#modal').innerHTML='';UI.humanTurns=0;refit(false);showGoal();}
function showGoal(){const o=$('#goal');if(o)o.remove();if(UI.coach||UI.tut||UI.sim||!G||!human()||/[?&]scn=/.test(location.search))return;const d=document.createElement('section');d.id='goal';d.setAttribute('aria-label','Goal');
  d.innerHTML='<h2>How you win</h2><p class="gwin">Have the most points when the last tile is laid.</p><ul><li>Put a follower on a road, town or priory.</li><li>Finish it, and you score. Towns pay double.</li><li>Farmers in fields score at the very end.</li></ul><button type="button" id="goalok">Got it, start</button>';
  $('#app').appendChild(d);$('#goalok').addEventListener('click',()=>d.remove())}
function setupOpts(){const s=UI.setup,np=1+s.rivals,seats=[];for(let i=0;i<np;i++)seats.push(i?'ai':'human');return {np,seats,lv:seats.map(()=>s.lv),ex:{river:s.river,ic:s.ic,tb:s.tb}}}
function resetUI(){UI.recap="";UI.capQ=[];UI.cap=null;UI.capCur=0;clearTimeout(UI.capT);UI.fx.length=0;UI.fxSeen=0;UI.turn=-1;UI.stepKey='';UI.endShown=false;UI.handKey=null;UI.aiT&&clearTimeout(UI.aiT);UI.aiT=0;for(const k in UI.tl)UI.tl[k].remove();UI.tl={};for(const k in UI.mp)UI.mp[k].remove();UI.mp={};$('#ov').innerHTML='';UI.seenInit=false;UI.legal=[];UI.hint=null;UI.hintFig=null;closeMenu()}
function loadSaved(){const g=savedGame();if(!g)return;resetUI();G=g;UI.camp=null;UI.fxSeen=0;UI.fx.length=0;$('#modal').innerHTML='';UI.lastOpts=setupOpts();render();refit(false);schedAI()}
// ---------- gestures: drag to move, pinch / wheel to zoom, tap during a computer turn to speed it up ----------
function initGestures(){const b=boardEl(),pt=new Map();let last=null;
  const dist=()=>{const a=[...pt.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};
  const mid=()=>{const a=[...pt.values()];return {x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2}};
  function zoomAt(px,py,k){const v=UI.view,m=measure();let s=v.s*k;s=Math.max(MINC/100*.6,Math.min(2.4,s));k=s/v.s;setView({s,x:px-(px-v.x)*k,y:py-(py-v.y)*k})}
  b.addEventListener('pointerdown',e=>{UI.lastPT=e.pointerType;const r=b.getBoundingClientRect();pt.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top});UI.moved=false;UI.down={x:e.clientX,y:e.clientY};UI.twPaused=UI.tw?UI.twTo:null;cancelAnimationFrame(UI.tween);UI.tw=false;
    if(pt.size===2)last={d:dist(),m:mid()};
    if(!e.target.closest('button'))aiNow()});
  b.addEventListener('pointermove',e=>{if(!pt.has(e.pointerId))return;const r=b.getBoundingClientRect(),p=pt.get(e.pointerId),nx=e.clientX-r.left,ny=e.clientY-r.top;
    if(UI.down&&Math.hypot(e.clientX-UI.down.x,e.clientY-UI.down.y)>9)UI.moved=true;
    if(pt.size===1){if(UI.moved){const v=UI.view;setView({s:v.s,x:v.x+nx-p.x,y:v.y+ny-p.y});UI.user=true}pt.set(e.pointerId,{x:nx,y:ny})}
    else if(pt.size===2){pt.set(e.pointerId,{x:nx,y:ny});const d=dist(),m=mid();if(last){zoomAt(m.x,m.y,d/last.d);const v=UI.view;setView({s:v.s,x:v.x+m.x-last.m.x,y:v.y+m.y-last.m.y})}last={d,m};UI.moved=true;UI.user=true}});
  const up=e=>{pt.delete(e.pointerId);last=null;if(!pt.size){const tp=UI.twPaused;UI.twPaused=null;if(tp&&!UI.moved&&!UI.user)tweenView(tp,220);else if(!UI.moved)setTimeout(ensureGlowVisible,0)}if(!pt.size)setTimeout(()=>{UI.moved=false},60)};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')up(e)});
  b.addEventListener('wheel',e=>{e.preventDefault();const r=b.getBoundingClientRect();zoomAt(e.clientX-r.left,e.clientY-r.top,Math.exp(-e.deltaY*.0015));UI.user=true},{passive:false})}
// ---------- label layout (W426): no label ever overlaps another label, the turn strip or the Recentre button ----------
function rectHit(a,b,g){g=g||0;return a.left<b.right+g&&b.left<a.right+g&&a.top<b.bottom+g&&b.top<a.bottom+g}
function fixedRects(){const out=[];for(const s of ['#status','#recentre','#coach .cbub:not([hidden])','.gxh-bub']){const e=$(s);if(e&&e.offsetParent&&getComputedStyle(e).visibility!=='hidden')out.push(e.getBoundingClientRect())}for(const e of document.querySelectorAll('#ov .pop'))out.push(e.getBoundingClientRect());return out}
// placement tags: on phones at most 3 (the best), the chosen spot's always; lower-ranked tags that would collide are dropped
function layoutTags(){const gl=[...document.querySelectorAll('#world .glow')];if(!gl.length)return;const lim=PHONE()?3:6,taken=fixedRects();
  const list=gl.map(g=>({g,t:g.querySelector('.pvb'),rk:(g.classList.contains('sel')?1e4:0)+(g._rk||0)})).filter(o=>o.t);for(const o of list)o.t.classList.remove('off');
  list.sort((a,b)=>b.rk-a.rk);let n=0;for(const o of list){const vis=o.g.style.visibility!=='hidden';const r=o.t.getBoundingClientRect();
    if(!vis||(n>=lim&&!o.g.classList.contains('sel'))||taken.some(q=>rectHit(r,q,3))){o.t.classList.add('off');continue}taken.push(r);n++}}
// follower-spot labels: below, above, left or right of the spot, whichever is free; else the lower-priority label is dropped
function layoutFlabs(){const fl=[...document.querySelectorAll('#ov .fglow')];if(!fl.length)return;const fixed=fixedRects(),spots=fl.map(f=>[f,f.getBoundingClientRect()]).concat([...document.querySelectorAll('#ov .mp')].map(m=>[m,m.getBoundingClientRect()])),taken=[];const pr=f=>{const t=(f.querySelector('.flab')||{}).textContent||'';return /now/.test(t)?4:/^(town|road)/.test(t)?3:/priory/.test(t)?2:1};
  const bw=boardEl().getBoundingClientRect();for(const f of fl.sort((a,b)=>pr(b)-pr(a))){const lb=f.querySelector('.flab');if(!lb)continue;lb.classList.remove('off');let ok=false;
    for(const pos of ['b','t','r','l']){lb.dataset.pos=pos;const r=lb.getBoundingClientRect();if(r.left<bw.left+4||r.right>bw.right-4||r.bottom>bw.bottom-4||r.top<bw.top+4)continue;if(fixed.some(q=>rectHit(r,q,2))||taken.some(q=>rectHit(r,q,2))||spots.some(([o,q])=>o!==f&&rectHit(r,q,0)))continue;taken.push(r);ok=true;break}
    if(!ok){lb.dataset.pos='b';lb.classList.add('off')}}}
// score pops never sit on the turn strip
function keepPops(){const st=$('#status');if(!st||!st.offsetHeight)return;const sb0=st.getBoundingClientRect().bottom-boardEl().getBoundingClientRect().top+6;for(const e of $('#ov').querySelectorAll('.pop')){const o=e._o;if(!o)continue;const sb=sb0+e.offsetHeight/2,hw=e.offsetWidth/2+6,W=boardEl().clientWidth;const [sx,sy]=toScreen(o.wx,o.wy);const x=Math.max(hw,Math.min(W-hw,sx+o.dx)),y=Math.max(sb,sy+o.dy);if(x!==sx+o.dx||y!==sy+o.dy)e.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`}}
// ---------- boot ----------
function boot(){UI.reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;initGestures();$('#menubtn').addEventListener('click',openMenu);{let h=false;try{h=localStorage.getItem('rv_hints')==='1'}catch(e){}const hb=document.createElement('button');hb.id='hintsbtn';hb.type='button';hb.className='gx-ibtn';hb.innerHTML='<span>Hints</span>';hb.addEventListener('click',()=>setHints(!UI.hints));$('#top').insertBefore(hb,$('#bulbbtn'));setHints(h)}{const rc=document.createElement('button');rc.id='recentre';rc.type='button';rc.setAttribute('aria-label','Recentre the view');rc.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4" stroke="currentColor" stroke-width="2.4"/></svg><span>Recentre</span>';rc.addEventListener('click',recentre);boardEl().appendChild(rc)}
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();if((e.key==='r'||e.key==='R')&&myTurn('place'))rotate()});
  GXV.watch(()=>{if(!G||!G.order.length)return;if(myTurn('fig')&&!UI.user)zoomTile(G.cur.k,false);else if(myTurn('place')&&!UI.user){if(UI.sel)camSpot(UI.sel.x,UI.sel.y,0);else camAim(0)}else if(!UI.user)refit(false);else placeOverlay();updateGhost()});
  showStart()}
boot();
