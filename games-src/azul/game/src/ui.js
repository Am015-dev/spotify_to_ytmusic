// ---------- UI: the table fills the screen; the dock says what to do now (and coaches); everything else is a popup ----------
const $=s=>document.querySelector(s);const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
UI.sel=null;UI.tgt=null;UI.adv=null;UI.recap=[];UI.fxSeen=0;UI.hover=null;UI.lastHuman=null;UI.hl={};UI.story=false;
try{UI.coach=localStorage.getItem('sgz_coach')!=='0'}catch(e){UI.coach=true}
const CHAPTERS=['The king’s first commission: the north wall','Morning light on the fountain court','The king inspects the east wall','Dust and glaze in the south arcade','The west wall catches the sunset','The whole court gathers to watch','Lanterns over the throne-room gallery','One last wall before the feast'];
const chapter=r=>`Round ${r}: ${CHAPTERS[Math.min(r,CHAPTERS.length)-1]}`;
function refresh(){if(G&&!NET.on){try{if(!G.over&&G.pl.some(p=>p.human))localStorage.setItem(SAVE,JSON.stringify(G));else if(G.over)localStorage.removeItem(SAVE)}catch(e){}}
  if(!G){render();return}const h=me();if(h&&UI.lastHuman!==h.i){UI.lastHuman=h.i;if(V3.on)relayout()}
  playFx();computeHL();render();try{sync3D();camFocus()}catch(e){console.error(e)}schedule();netAfter()}
const me=()=>{if(!G||G.over)return null;const s=sideToAct();if(NET.on&&s!==NET.mySeat)return null;return s>=0&&P(s).human?P(s):null};
// online: is seat i this page's player? offline: the only human seat
const isYou=i=>G&&(NET.on?i===NET.mySeat:G.pl.filter(q=>q.human).length===1&&!!P(i).human);
const human=()=>G&&G.pl.some(p=>p.human);
function pname(i){return `<span class="pc" style="color:${PCOL[i]};font-weight:800">${esc(P(i).nm)}</span>`}
function playFx(){for(const f of UI.fx.slice(UI.fxSeen)){const x=f.x;try{V3fx(f)}catch(e){}try{phFx(f)}catch(e){}
    if(f.t==='take'){const p=P(x.p);UI.recap.unshift(`<b style="color:${PCOL[x.p]}">${esc(p.nm)}</b> took ${x.c===PRISM?x.n+' Prism':(x.n-x.nj)+' '+TNAME[x.c]+(x.nj?' + '+x.nj+' Prism':'')} from ${srcName(x.src)} → ${x.line<5?'rack '+(x.line+1):'breakage'}${x.br&&x.line<5?` (${x.br} broke)`:''}${x.sun?' · took the Sun token':''}`);if(UI.recap.length>4)UI.recap.length=4;sfx('take')}
    else if(f.t==='wall')sfx('wall',x.pts);else if(f.t==='floor')sfx('floor');else if(f.t==='sun')sfx('sun');else if(f.t==='round'){sfx('round');if(G.round>1&&G.rsum)UI.recap.unshift(`Mosaics set: ${G.pl.map(q=>`<b style="color:${PCOL[q.i]}">${esc(q.nm)}</b> +${G.rsum[q.i].place}${G.rsum[q.i].floor?' '+G.rsum[q.i].floor+' breakage':''}`).join(' · ')}`);UI.recap.unshift(`<i>${esc(chapter(G.round))}</i>`);UI.recap.length=Math.min(UI.recap.length,4)}else if(f.t==='refill')sfx('refill');else if(f.t==='win')sfx('win')}
  UI.fxSeen=UI.fx.length;if(UI.fx.length>40){UI.fx.splice(0,30);UI.fxSeen=UI.fx.length}}
// ---------- what glows ----------
function selTiles(sel){if(!sel)return[];const a=sel.src<0?G.ctr:G.fac[sel.src];if(!a)return[];const o=[];a.forEach((t,k)=>{if(t===sel.c||(t===PRISM&&(sel.j||sel.c===PRISM)))o.push(sel.src<0?`c_${k}`:`f${sel.src}_${k}`)});return o}
function movesFor(sel){if(!sel)return[];const p=me();if(!p)return[];return validMoves(p.i).filter(m=>m.src===sel.src&&m.c===sel.c&&m.j===sel.j)}
function preview(m,seat){const S=cloneS(G);const p0=G.pl[seat];const f0=p0.floor.length;const L0=p0.lines[m.line<5?m.line:0].length;const info=applyTake(S,seat,m);const p1=S.pl[seat];const ghost=[];
  if(m.line<5)for(let k=L0;k<p1.lines[m.line].length;k++)ghost.push({sl:`l${seat}_${m.line}_${k}`,k:p1.lines[m.line][k]});
  for(let k=f0;k<p1.floor.length;k++)if(p1.floor[k]!==SUN)ghost.push({sl:`x${seat}_${k}`,k:p1.floor[k],bad:1});
  const pen=floorPenalty(p1.floor.length)-floorPenalty(f0);let full=false,pts=null;if(m.line<5&&p1.lines[m.line].length===cap(m.line)){full=true;const b=bestCell(S,p1,m.line,lineColour(p1.lines[m.line]));pts=b.c>=0?adjPts2(p1.wall,m.line,b.c):null}
  return {info,ghost,pen,full,pts,cnt:p1.lines[m.line<5?m.line:0].length}}
function computeHL(){const H={};UI.pick=[];const p=me();
  if(p&&G.phase==='offer'){if(!UI.sel){H.src=[];G.fac.forEach((a,i)=>{if(a.length)H.src.push({src:i})});if(G.ctr.length)H.src.push({src:-1});
      if(UI.hover&&UI.hover.k==='tile'){const s=slotSel(UI.hover.sl);if(s)H.tiles=selTiles(s)}}
    else{H.tiles=selTiles(UI.sel);const ms=movesFor(UI.sel);H.lines=[...new Set(ms.map(m=>m.line))].map(r=>({p:p.i,r,col:r===UI.tgt?0xffffff:r===5?0xff8a5a:0xffd24a}));
      if(UI.tgt!=null){const m=ms.find(m=>m.line===UI.tgt);if(m)H.ghost=preview(m,p.i).ghost}}}
  if(p&&G.phase==='wall'&&G.wt.q){const q=G.wt.q;H.cells=q.cells.map(c=>({p:p.i,r:q.r,c,col:UI.adv&&UI.adv.m.c===c?0xffffff:0xffd24a}))}
  UI.hl=H}
function slotSel(sl){const p=me();if(!p||G.phase!=='offer')return null;let src,k;if(sl[0]==='f'){const a=sl.slice(1).split('_');src=+a[0];k=+a[1]}else if(sl[0]==='c'){src=-1;k=+sl.split('_')[1]}else return null;
  const arr=src<0?G.ctr:G.fac[src];const t=arr&&arr[k];if(t==null)return null;if(t===PRISM)return {src,c:PRISM,j:1};return {src,c:t,j:0}}
// ---------- render ----------
function render(){renderModal();if(!G){try{phRender()}catch(e){console.error(e)}return}renderDock();renderPopups();renderMap2D();try{phRender()}catch(e){console.error(e)}
  const pb=$('#pausebtn');if(pb){pb.hidden=human();const h=IC(UI.pause?'play':'pause');if(pb.dataset.h!==h){pb.innerHTML=h;pb.dataset.h=h}}const sb=$('#speedbtn');if(sb){const h=IC('speed')+'<span>'+({0.5:'slow',1:'normal',3:'fast'}[UI.speed]||'normal')+'</span>';if(sb.dataset.h!==h){sb.innerHTML=h;sb.dataset.h=h}}
  const cb=$('#coachbtn');if(cb)cb.classList.toggle('on',!!UI.coach);
  const ch=$('#chip');if(ch){const s=sideToAct();ch.textContent=G.over?'The king’s judgement':`${innerWidth<700?'Round '+G.round:chapter(G.round)} · ${G.phase==='wall'?'setting the mosaics':s>=0?P(s).nm+' to play':''}`}}
function scoresHtml(){const s=sideToAct();return `<div class="scores">${G.pl.map(p=>`<span class="sc ${p.i===s?'cur':''}" style="--pc:${PCOL[p.i]}"><i></i>${esc(p.nm)}${NET.on&&p.i===NET.mySeat?' (you)':''} ★${p.score}${G.markerIn===p.i?' ☀':''}</span>`).join('')}</div>`}
function thumbsHtml(){const f=focusSeat();const narrow=V3.on?(V3.L&&V3.L.name==='focus'):innerWidth<700;if(!narrow)return '';
  return `<div class="thumbs">${G.pl.filter(p=>p.i!==f).map(p=>`<button class="thumb" data-gx="plrd" style="--pc:${PCOL[p.i]}" aria-label="Open ${esc(p.nm)}'s board">${esc(p.nm)} ★${p.score}<svg viewBox="0 0 1240 940">${boardG(p,{})}</svg></button>`).join('')}</div>`}
function btn(m,label,cls,extra){return `<button class="btn ${cls||''}" data-mv='${esc(JSON.stringify(m))}'${extra||''}>${label}</button>`}
function renderDock(){const el=$('#dockbody');if(!el)return;const s=sideToAct();const p=s>=0?P(s):null;const hp=me();let h='';
  const dt=$('#dockt');if(dt)dt.textContent=G.over?'The king’s judgement':hp?(G.pl.filter(q=>q.human).length>1&&!NET.on?`${hp.nm}, your turn`:'Your turn'):p?(NET.on&&p.human?`Waiting for ${p.nm}…`:`${p.nm} is choosing…`):G.phase==='wall'?'Setting the mosaics':'';
  h+=netDockHtml()+`<div class="chapter">${esc(G.over?'The unveiling':chapter(G.round))}</div>`+scoresHtml()+thumbsHtml();
  if(G.over){h+=endHtml();el.innerHTML=h;return}
  if(UI.recap.length)h+=`<div class="recap" aria-label="Recent moves">${UI.recap.slice(0,3).map(t=>`<div>${t}</div>`).join('')}</div>`;
  if(!hp){h+=`<p class="muted">${p?(NET.on&&p.human?`Waiting for ${esc(p.nm)}…`:`${esc(p.nm)} is choosing tiles…`):'The mosaics are being set…'}</p>`;if(UI.coach)h+=`<div class="coach"><span class="x">Watch the table: each glazier takes every tile of one glaze from one kiln or from the courtyard. When the kilns and courtyard are empty, full racks move one tile into the mosaic.</span></div>`;
    h+=`<ol class="mini">${G.log.slice(0,3).map(l=>`<li class="${l.c}">${esc(l.t)}</li>`).join('')}</ol>${infoHtml()}`;el.innerHTML=h;return}
  GX.showDock();
  if(G.phase==='wall'){const q=G.wt.q;const L=hp.lines[q.r];const lc=lineColour(L);const isP=L.includes(PRISM);
    if(UI.coach)h+=`<div class="coach"><b class="st">Set a tile in mosaic row ${q.r+1}</b><span class="x">${G.ex.gray?'On the unmarked mosaic you choose the space: a glaze may not repeat in any row or column.':'A rack of only prisms may go to any empty space in its row.'} Tap a glowing space, or pick below. The number is what it scores now.</span></div>`;
    h+=`<div class="prompt"><h3>Your ${isP?'Prism':TNAME[lc]} tile from rack ${q.r+1}</h3><div class="opts">${q.cells.map(c=>btn({act:'wall',r:q.r,c},`Row ${q.r+1}, column ${c+1}<span class="pv good">+${adjPts2(hp.wall,q.r,c)}</span>`,UI.adv&&UI.adv.m.c===c?'on':'')).join('')}</div></div>`+advHtml()+infoHtml();el.innerHTML=h;return}
  // the offer
  const sel=UI.sel;const ms=movesFor(sel);
  if(UI.coach){const st=!sel?1:UI.tgt==null?2:3;h+=`<div class="coach"><b class="st">Step ${st} of 3 · ${['Pick a glaze','Choose a rack','Check and place'][st-1]}</b><span class="x">${
    st===1?`${G.round===2&&G.turn-G.lastSumTurn<G.np?'<b>New round.</b> Last round every full rack sent one tile into its mosaic and scored; racks that were not full kept their tiles. ':''}Take <b>all</b> tiles of <b>one</b> glaze from <b>one</b> kiln, or from the courtyard in the middle. Tap a tile on a glowing kiln (or use the buttons below). Other glazes on that kiln slide to the courtyard.${G.markerIn==='ctr'?' The first to take from the courtyard also takes the Sun token: −1 point, but you start next round.':''}`
    :st===2?`Rack 1 holds 1 tile, rack 5 holds 5, one glaze per rack. The glowing racks can take this glaze. Tiles that don’t fit break (−1, −1, −2 …). A full rack sets a tile into your mosaic at round end and scores.`
    :`The ghost tiles show where they will land; red rings are breakage. Press <b>Place</b> (or tap the rack again), or pick another rack.`}</span></div>`}
  if(!sel){h+=`<div class="prompt"><h3>Pick tiles</h3>${sourcesHtml()}</div>`}
  else{const a=sel.src<0?G.ctr:G.fac[sel.src];const n=a.filter(t=>t===sel.c).length,nj=a.filter(t=>t===PRISM).length;
    h+=`<div class="prompt"><h3>${sel.c===PRISM?tileChip(PRISM,nj)+' Prism':tileChip(sel.c,n)+' '+TNAME[sel.c]}${sel.j&&sel.c!==PRISM?' + '+tileChip(PRISM,nj):''} <small class="muted">from ${srcName(sel.src)}</small></h3>`;
    if(sel.c<NC&&nj)h+=`<button class="btn sm ${sel.j?'on':''}" data-ui="prism">${sel.j?'☑':'☐'} also take the ${nj} prism tile${nj>1?'s':''}</button>`;
    if(sel.c===PRISM){const cols=[...new Set(a.filter(t=>t<NC))];if(cols.length)h+=`<div class="acts"><span class="small muted">Add one glaze from here:</span>${cols.map(c=>`<button class="pk" data-pick='${JSON.stringify({src:sel.src,c,j:1})}'>${tileChip(c,a.filter(t=>t===c).length)}</button>`).join('')}</div>`}
    if(UI.tgt!=null){const m=ms.find(x=>x.line===UI.tgt);if(m){const pv=preview(m,hp.i);h+=`<div class="pvbox">${pv.info.line?`${pv.info.line} tile${pv.info.line>1?'s':''} onto rack ${m.line+1}${pv.full?' — it will be full and score'+(pv.pts!=null?' about +'+pv.pts:'')+' at round end':''}. `:''}${pv.info.fl+pv.info.lid?`${pv.info.fl+pv.info.lid} break${pv.info.lid?` (${pv.info.lid} into the shard box)`:''}. `:''}${pv.info.sun?'You take the Sun token (a breakage space) and start next round. ':''}${pv.pen?`Breakage now costs ${pv.pen}.`:'No breakage.'}</div>
      <div class="acts">${btn(m,'✔ Place','go')}<button class="btn ghost" data-ui="unsel">✕ Choose again</button></div>`}}
    else h+=`<div class="acts"><button class="btn ghost sm" data-ui="unsel">✕ Choose another glaze</button></div>`;
    h+=`<div class="opts">${ms.map(m=>{const pv=preview(m,hp.i);const lab=m.line<5?`Rack ${m.line+1} <small class="muted">(${pv.cnt}/${cap(m.line)})</small>`:'Straight to breakage';
        const note=(pv.full?`<span class="pv good">fills it${pv.pts!=null?' · +'+pv.pts:''}</span>`:'')+(pv.pen?`<span class="pv bad" style="margin-left:${pv.full?'8px':'auto'}">${pv.pen}</span>`:pv.full?'':`<span class="pv">no breakage</span>`);
        return `<button class="btn ${UI.tgt===m.line?'on':''}" data-line="${m.line}">${lab}${note}</button>`}).join('')}</div>`;
    h+=`</div>`}
  h+=advHtml()+infoHtml();el.innerHTML=h}
function sourcesHtml(){const one=(src,a)=>{const cnt={};for(const t of a)cnt[t]=(cnt[t]||0)+1;return `<div class="src ${src<0?'ctr':''}"><b>${src<0?'Courtyard'+(G.markerIn==='ctr'?' ☀':''):'Kiln '+(src+1)}</b><div class="row">${Object.keys(cnt).map(Number).sort((x,y)=>x-y).map(c=>`<button class="pk" data-pick='${JSON.stringify({src,c,j:c===PRISM?1:0})}' aria-label="${cnt[c]} ${TNAME[c]} from ${src<0?'the courtyard':'kiln '+(src+1)}">${tileChip(c,cnt[c])}</button>`).join('')}</div></div>`};
  let h='<div class="srcs">';G.fac.forEach((a,i)=>{if(a.length)h+=one(i,a)});if(G.ctr.length)h+=one(-1,G.ctr);return h+'</div>'}
function infoHtml(){return `<div class="info">Clay sack ${G.bag.length} · shard box ${G.lid.length}${G.ex.gray?' · unmarked mosaics':''}${G.ex.prism?' · prism tiles':''}</div>`}
function advHtml(){const hp=me();if(!hp)return '';if(!UI.adv)return `<div class="acts"><button class="btn sm cob" data-ui="advise">${IC('bulb')} Suggest a move</button></div>`;
  return `<div class="adv"><b>${IC('bulb')} Advice</b><p>${UI.adv.why}</p><div class="acts">${btn(UI.adv.m,'Do it','go')}<button class="btn ghost sm" data-ui="noadv">Dismiss</button></div></div>`}
function endHtml(){const rows=G.over.scores;const L=[['place','Tiles set'],['floor','Breakage'],['rows','Rows +2'],['cols','Columns +7'],['colours','Full glazes +10'],['total','★ Total'],['fr','Complete rows (tie-break)']];
  if(UI.guideNote==null){let note='';if(UI.coach&&human()){let seen=null;try{seen=localStorage.getItem('sgz_guided')}catch(e){}if(!seen){try{localStorage.setItem('sgz_guided','1');localStorage.setItem('sgz_coach','0')}catch(e){}note='<p class="small muted">That was your guided first game: next time the guide starts switched off. The Guide button brings it back at any time.</p>'}}UI.guideNote=note}const note=UI.guideNote;
  return `<div class="prompt"><h3>${IC('trophy')} ${esc(G.winText)}</h3><p class="muted">The king walks the courtyard in the evening light and names ${esc(G.winner)}’s mosaic the finest in the palace.</p><div class="tw"><table><tr><th></th>${rows.map(r=>`<th style="color:${PCOL[r.p]}">${esc(P(r.p).nm)}</th>`).join('')}</tr>${L.map(([k,n])=>`<tr class="${k==='total'?'tot':''}"><td>${n}</td>${rows.map(r=>`<td>${r.s[k]}</td>`).join('')}</tr>`).join('')}</table></div>${note}</div><div class="acts">${isClient()?'<span class="small muted">The host can start another game.</span>':'<button class="btn go" data-ui="new">New game</button>'}<button class="btn" data-gx="plrd">See the mosaics</button></div>`}
// ---------- the board as SVG (2D view, drawers, thumbnails); units: 100 = one tile pitch ----------
function boardG(p,o){o=o||{};const X=v=>(v+6.2)*100,Z=v=>(v+4.7)*100;const pi=p.i;let s=`<rect x="4" y="4" width="1232" height="932" rx="18" fill="#efe3c8" stroke="#8a5a2b" stroke-width="8"/><rect x="24" y="24" width="1192" height="92" rx="8" fill="${PCOL[pi]}"/>
  <text x="50" y="86" font-size="56" font-weight="700" fill="#fff8ea" font-family="Georgia,serif">${esc(p.nm)}${p.human?(NET.on&&G&&isYou(pi)?' (you)':''):' · '+p.lv}</text><text x="1190" y="88" text-anchor="end" font-size="62" font-weight="700" fill="#fff8ea" font-family="Georgia,serif">★ ${p.score}</text>`;
  const hl=o.hl||{};const ghost={};for(const g of hl.ghost||[])ghost[g.sl]=g;
  for(let r=0;r<5;r++){const zc=Z(-3.2+.54+r*CP);const lineHl=(hl.lines||[]).find(l=>l.r===r);
    s+=`<g ${o.act?`data-line="${r}" class="hit"`:''}>`;for(let k=0;k<cap(r);k++){const xc=X(-.45-.54-k*CP);const t=p.lines[r][k];const sl=`l${pi}_${r}_${k}`;s+=`<rect x="${xc-46}" y="${zc-46}" width="92" height="92" rx="10" fill="#d8c6a2" stroke="#9a7a4e" stroke-width="4"/>`;
      if(t!=null)s+=tileSVG(t,xc-45,zc-45,90);else if(ghost[sl])s+=tileSVG(ghost[sl].k,xc-45,zc-45,90,' opacity=".5"')}
    if(lineHl)s+=`<rect x="${X(-.45-cap(r)*CP)-6}" y="${zc-58}" width="${cap(r)*CP*100+12}" height="116" rx="14" fill="none" stroke="${lineHl.col===0xffffff?'#fff':'#ffb400'}" stroke-width="10"><animate attributeName="stroke-opacity" values="1;.35;1" dur="1.2s" repeatCount="indefinite"/></rect>`;
    s+=`<text x="${X(-.02)}" y="${zc-8}" text-anchor="middle" font-size="34" font-weight="700" fill="#8a5a2b">${r+1}</text><path d="M${X(-.26)} ${zc+6}L${X(.22)} ${zc+20}L${X(-.26)} ${zc+34}Z" fill="#8a5a2b" opacity=".55"/></g>`;
    for(let c=0;c<5;c++){const xc=X(.45+.54+c*CP);const v=p.wall[r][c];const cellHl=(hl.cells||[]).find(x=>x.r===r&&x.c===c);s+=`<g ${o.act?`data-cell="${r},${c}" class="hit"`:''}>`;
      s+=G.ex.gray?`<rect x="${xc-47}" y="${zc-47}" width="94" height="94" rx="10" fill="#b9b2a6" stroke="#8e877a" stroke-width="3"/>`:`<rect x="${xc-48}" y="${zc-48}" width="96" height="96" fill="#fff"/>${tileSVG(WALLC(r,c),xc-47,zc-47,94,' opacity=".3"')}`;
      if(v>=0)s+=tileSVG(v<5?v:PRISM,xc-46,zc-46,92);if(cellHl)s+=`<rect x="${xc-54}" y="${zc-54}" width="108" height="108" rx="12" fill="none" stroke="#ffb400" stroke-width="10"><animate attributeName="stroke-opacity" values="1;.35;1" dur="1.2s" repeatCount="indefinite"/></rect>`;s+='</g>'}}
  const fz=Z(3.09);const flHl=(hl.lines||[]).find(l=>l.r===5);s+=`<g ${o.act?'data-line="5" class="hit"':''}><text x="${X(-5.85)}" y="${fz-62}" font-size="28" font-style="italic" fill="#6b4a2a">breakage</text>`;
  for(let k=0;k<7;k++){const xc=X(-5.31+k*CP);const t=p.floor[k];const sl=`x${pi}_${k}`;s+=`<rect x="${xc-46}" y="${fz-46}" width="92" height="92" rx="10" fill="#e3cfc4" stroke="#a0493a" stroke-width="4"/><text x="${xc}" y="${fz+84}" text-anchor="middle" font-size="36" font-weight="700" fill="#a0302a">${FLOOR[k]}</text>`;
    if(t!=null)s+=tileSVG(t,xc-44,fz-44,88);else if(ghost[sl])s+=tileSVG(ghost[sl].k,xc-44,fz-44,88,' opacity=".5"')+`<rect x="${xc-50}" y="${fz-50}" width="100" height="100" rx="12" fill="none" stroke="#e33" stroke-width="6"/>`}
  if(flHl)s+=`<rect x="${X(-5.85)-6}" y="${fz-58}" width="${7*CP*100+12}" height="116" rx="14" fill="none" stroke="${flHl.col===0xffffff?'#fff':'#ff7a3a'}" stroke-width="10"><animate attributeName="stroke-opacity" values="1;.35;1" dur="1.2s" repeatCount="indefinite"/></rect>`;
  s+=`</g><text x="${X(1.9)}" y="${fz-18}" font-size="23" fill="#6b4a2a">extra tiles: shard box, no penalty</text><text x="${X(1.9)}" y="${fz+30}" font-size="23" font-weight="700" fill="#6b4a2a">end: row +2 · col +7 · glaze +10</text>`;return s}
function boardSVG(p,o){return `<svg viewBox="0 0 1240 940" role="img" aria-label="${esc(p.nm)}'s board">${boardG(p,o)}</svg>`}
function ringSVG(cx,cy){const n=G.fac.length;const rg=ringGeom(n);let s=`<circle data-ctr="1" class="hit" cx="${cx}" cy="${cy}" r="${rg.cr*100+10}" fill="#d9b98a" stroke="#a0703e" stroke-width="6"/>`;const H=UI.hl||{};const lifted=new Set(H.tiles||[]);const srcHl=new Set((H.src||[]).map(x=>x.src));
  const tile=(t,x,y,sz,sl,src)=>{const sel=lifted.has(sl);return `<g data-slot="${sl}" class="hit">${tileSVG(t,x-sz/2,y-sz/2-(sel?10:0),sz)}${sel?`<rect x="${x-sz/2-5}" y="${y-sz/2-15}" width="${sz+10}" height="${sz+10}" rx="10" fill="none" stroke="#fff" stroke-width="6"/>`:''}</g>`};
  G.fac.forEach((a,i)=>{const ang=-Math.PI/2+i*2*Math.PI/n;const x=cx+Math.cos(ang)*rg.RR*100,y=cy+Math.sin(ang)*rg.RR*100;s+=`<circle data-kiln="${i}" class="hit" cx="${x}" cy="${y}" r="${KR*100}" fill="#f4ead6" stroke="${srcHl.has(i)?'#ffb400':'#2f6f8a'}" stroke-width="${srcHl.has(i)?14:10}"/><text x="${x}" y="${y-KR*100+34}" text-anchor="middle" font-size="30" font-weight="700" fill="#1f4f66">${i+1}</text>`;
    a.forEach((t,k)=>{s+=tile(t,x+(k%2?50:-50),y+(k<2?-50:50),88,`f${i}_${k}`,i)})});
  const cnt=G.ctr.length;const cols=Math.max(3,Math.ceil(Math.sqrt(cnt+1)));const pitch=Math.min(105,rg.cr*138/cols);const rows=Math.ceil((cnt+1)/cols);
  G.ctr.forEach((t,k)=>{s+=tile(t,cx+(k%cols-(cols-1)/2)*pitch,cy+(Math.floor(k/cols)-(rows-1)/2)*pitch+pitch*.5,pitch*.9,`c_${k}`,-1)});
  if(G.markerIn==='ctr'){const k=cnt;s+=tileSVG(SUN,cx+(k%cols-(cols-1)/2)*pitch-40,cy+(Math.floor(k/cols)-(rows-1)/2)*pitch+pitch*.5-40,80)}
  if(srcHl.has(-1))s+=`<circle cx="${cx}" cy="${cy}" r="${rg.cr*100+14}" fill="none" stroke="#ffb400" stroke-width="10"/>`;return s}
function renderMap2D(){const el=$('#map2d');if(!el)return;if(V3.on){el.hidden=true;return}el.hidden=false;const rg=ringGeom(G.fac.length);const R=(rg.out+.4)*100;const f=focusSeat();const others=G.pl.filter(p=>p.i!==f);
  const W=Math.max(2*R,1240*2+60),top=2*R+30;const H=top+940*(1+Math.ceil(others.length/2)*0.62)+40;
  if(PHN.on){el.innerHTML=`<svg viewBox="${W/2-R-20} 0 ${2*R+40} ${2*R+40}" role="img" aria-label="The kilns and courtyard">${ringSVG(W/2,R+20)}</svg>`;return}
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="The table">${ringSVG(W/2,R)}<g transform="translate(${W/2-620},${top})">${boardG(P(f),{act:!!me(),hl:me()?UI.hl:{}})}</g>`;
  others.forEach((p,k)=>{s+=`<g transform="translate(${(k%2)*(W/2)+20},${top+960+Math.floor(k/2)*600}) scale(.6)">${boardG(p,{})}</g>`});el.innerHTML=s+'</svg>'}
// ---------- popups ----------
function renderPopups(){if(GX.open==='logd')$('#logbody').innerHTML=`<ol class="log">${G.log.slice(0,400).map(l=>`<li class="${l.c}"><small>R${l.r}</small> ${esc(l.t)}</li>`).join('')}</ol>`;
  if(GX.open==='plrd')$('#plrbody').innerHTML=G.pl.map(p=>`<section class="sheet" style="--pc:${PCOL[p.i]}"><h3><span style="color:${PCOL[p.i]}">${esc(p.nm)}</span> <small class="muted">${p.human?(NET.on?(p.i===NET.mySeat?'you':'online player'):'player'):p.lv+' computer'+(p.away?' (player away)':'')}</small>${G.markerIn===p.i?' ☀':''}<span class="tot">★ ${p.score}</span></h3>${boardSVG(p,{})}
    <div class="small muted">Tiles set ${p.st.place} · breakage ${p.st.floor}${G.over?` · rows +${p.st.rows} · columns +${p.st.cols} · glazes +${p.st.colours}`:''} · complete rows ${fullRows(p)}</div></section>`).join('')}
// ---------- modal: start screen and the opening story ----------
UI.setup={np:2,seats:['human','ai','ai','ai'],lv:['normal','normal','normal','normal'],ex:{gray:false,prism:false}};
function renderModal(){const m=$('#modal');if(!m)return;const h=UI.modal==='start'?startHtml():UI.modal==='story'?storyHtml():UI.modal==='lobby'&&NET.on?lobbyHTML():'';m.hidden=!h;if(m.dataset.h!==h){m.innerHTML=h;m.dataset.h=h}}
function startHtml(){const o=UI.setup;let saved=null;try{saved=localStorage.getItem(SAVE)}catch(e){}
  return `<div class="mbox"><h2>Sunglaze</h2><p class="lede">Draft glazed tiles from the kilns, dry them on your racks and set them into the palace mosaic. Tiles score by what they touch; finished rows, columns and glazes pay at the end.</p>
   ${saved&&!NET.on?`<div class="acts"><button class="btn go" data-ui="continue">Continue the saved game</button></div>`:''}
   <h3>Glaziers</h3><div class="seg">${[2,3,4].map(n=>`<button class="${o.np===n?'on':''}" data-np="${n}">${n}</button>`).join('')}</div>
   <div class="seats">${NET.on?'<p class="small muted">Online: players take the seats in the order they joined; the computer plays the rest at the levels set here.</p>':''}${Array.from({length:o.np},(_,i)=>`<div class="seat" style="--pc:${PCOL[i]}"><i></i><b>${PNAMES[i]}</b>${NET.on?'':`<button class="btn sm" data-seat="${i}">${o.seats[i]==='human'?IC('person')+' you / a friend':IC('cpu')+' computer'}</button>`}${o.seats[i]==='ai'||NET.on?`<button class="btn sm ghost" data-lv="${i}" title="easy · normal · hard">${o.lv[i]}</button>`:''}</div>`).join('')}</div>
   <h3>Variants</h3><div class="exs"><label class="chk"><input type="checkbox" data-ex="gray" ${o.ex.gray?'checked':''}> <b>Unmarked mosaic</b> <small>choose where each tile goes; no glaze twice in a row or column</small></label>
   <label class="chk"><input type="checkbox" data-ex="prism" ${o.ex.prism?'checked':''}> <b>Prism tiles</b> <small>wild tiles (promo): ${o.np===2?5:10} in the game</small></label>
   <label class="chk"><input type="checkbox" data-coach="1" ${UI.coach?'checked':''}> <b>Guided game</b> <small>the panel explains each step</small></label></div>
   ${onlineBlock()}<div class="acts">${NET.on?'<button class="btn go" data-a="netopen">Back to the online lobby</button>':'<button class="btn go" data-ui="start">Begin ▶</button>'}<button class="btn" data-gx="rulesd">How to play</button><button class="btn" data-gx="refd">Tile list</button></div></div>`}
function storyPic(){const tiles=[];for(let i=0;i<14;i++)tiles.push(tileSVG(i%5,40+i*38,152,32));const arch=(x)=>`<path d="M${x} 300V210a55 55 0 0 1 110 0V300Z" fill="#5a3a2a" opacity=".85"/><path d="M${x+8} 300V212a47 47 0 0 1 94 0V300Z" fill="url(#shade)"/>`;
  return `<svg viewBox="0 0 600 330" role="img" aria-label="A palace courtyard at sunrise with tiled arches"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7c77c"/><stop offset="1" stop-color="#fde9c4"/></linearGradient><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3f6e"/><stop offset="1" stop-color="#6e4b3a"/></linearGradient></defs>
  <rect width="600" height="330" fill="url(#sky)"/><circle cx="470" cy="70" r="40" fill="#fff1b8"/><circle cx="470" cy="70" r="28" fill="#ffd66b"/><rect x="0" y="120" width="600" height="190" fill="#e9c99a"/><rect x="0" y="120" width="600" height="14" fill="#c98e5a"/>
  ${tiles.join('')}${arch(40)}${arch(245)}${arch(450)}<rect x="0" y="300" width="600" height="30" fill="#c9794a"/><ellipse cx="300" cy="306" rx="80" ry="12" fill="#2f6f8a"/><path d="M300 300q-8-40 0-60q8 20 0 60" fill="#9fd3e6" opacity=".8"/>
  <rect x="190" y="248" width="16" height="52" fill="#7a4a2a"/><circle cx="198" cy="238" r="12" fill="#e0674a"/><rect x="204" y="262" width="30" height="8" rx="2" fill="#1d4aa3"/></svg>`}
function storyHtml(){const names=G?G.pl.filter(p=>p.human).map(p=>p.nm):[];return `<div class="mbox story">${storyPic()}<p class="q">The Sun King has come home to his summer palace, and its courtyard walls stand bare.</p>
  <p>He has summoned the finest glaziers${names.length?`, ${esc(names.join(' and '))} among them,`:''} to dress the walls in tile. Every morning the kilns are opened and you draft your glazes.</p>
  <p>Dry them on your racks, set them into your mosaic so each new tile touches the others, and waste nothing: every broken tile costs you.</p><p>When the first mosaic row is finished, the king will walk the courtyard and judge.</p>
  <div class="acts"><button class="btn go" data-ui="story-ok">Enter the courtyard ▶</button></div></div>`}
// ---------- input ----------
function on3DPick(h){const p=me();if(!p||!G||G.over)return;if(!h&&!PHN.on)return;
  if(G.phase==='wall'){if(h&&h.k==='cell'&&h.p===p.i){const m=validMoves(p.i).find(m=>m.r===h.r&&m.c===h.c);if(m)return go(m);return toast('That space is not allowed.')}return toast('Tap a glowing mosaic space.')}
  if(PHN.on)return phPick(h);
  if(h.k==='tile'){const sl=h.sl;if(sl[0]==='l'||sl[0]==='x'){const a=sl.slice(1).split('_');if(+a[0]===p.i)return pickLine(sl[0]==='x'?5:+a[1]);return}if(sl[0]==='w'){const a=sl.slice(1).split('_');if(+a[0]===p.i&&UI.sel)return pickLine(+a[1]);return}
    const s=slotSel(sl);if(s)return pickSel(s);return}
  if(h.k==='line'&&h.p===p.i)return pickLine(h.r);if(h.k==='cell'&&h.p===p.i&&UI.sel)return pickLine(h.r);
  if(h.k==='kiln'||h.k==='ctr'){const a=h.k==='ctr'?G.ctr:G.fac[h.i];if(!a||!a.length)return toast('That kiln is empty.');return toast('Tap one of the tiles to take every tile of its glaze.')}}
function onHover(h){if(!me()||UI.sel||G.phase!=='offer')return;UI.hover=h&&h.k==='tile'?h:null;computeHL();if(V3.on)syncHighlights()}
function hoverable(h){if(!me())return false;if(h.k==='tile')return h.sl[0]==='f'||h.sl[0]==='c'||(UI.sel&&h.sl.startsWith('l'+me().i));return h.k==='line'||h.k==='cell'}
function pickSel(s){const p=me();if(!p||G.phase!=='offer')return;if(UI.sel&&UI.sel.src===s.src&&UI.sel.c===s.c&&UI.sel.j===s.j){UI.sel=null;UI.tgt=null}else{UI.sel=s;UI.tgt=null;const ms=movesFor(s);if(ms.length===1)UI.tgt=ms[0].line}
  if(UI.adv&&!(UI.sel&&UI.adv.m.src===UI.sel.src&&UI.adv.m.c===UI.sel.c))UI.adv=null;sfx('select');upd()}
function pickLine(r){if(!UI.sel)return toast('First tap a tile on a kiln or in the courtyard.');const m=movesFor(UI.sel).find(m=>m.line===r);if(!m)return toast(r<5?`Rack ${r+1} can’t take ${TNAME[UI.sel.c]} now.`:'');if(UI.tgt===r)return go(m);UI.tgt=r;sfx('click');upd()}
function upd(){computeHL();render();if(V3.on){syncHighlights();camFocus()}}
// narrow screens: zoom onto your own board while you choose a rack or a mosaic space
function camFocus(){if(!V3.on||!V3.L||PHN.on)return;const p=me();const z=p&&(UI.sel||(G.phase==='wall'&&G.wt&&G.wt.q))?{p:p.i}:null;const k=JSON.stringify(z);if(k!==V3.zk){V3.zk=k;V3.zoomBoard=z;fitCam()}}
function go(m){const s=sideToAct();if(PHN.on)PHN.src=null;if(NET.on&&(s<0||s!==NET.mySeat)&&P(s)&&P(s).human)return;
  if(isClient()){if(!me())return;if(NET.pend&&NET.pend.k===G.logN&&Date.now()-NET.pend.t<2500)return;NET.pend={k:G.logN,t:Date.now()};UI.sel=null;UI.tgt=null;UI.adv=null;UI.hover=null;netSend(Object.assign({},m));sfx('place');upd();return}
  const keep=[UI.sel,UI.tgt,UI.adv];UI.sel=null;UI.tgt=null;UI.adv=null;UI.hover=null;const r=performMove(m,s);if(!r.success){[UI.sel,UI.tgt,UI.adv]=keep;toast('That move isn’t allowed now.');console.error(r.error);return}sfx('place')}
function toast(t){if(!t)return;const el=$('#dockmsg');if(!el)return;el.textContent=t;el.hidden=false;GX.showDock();clearTimeout(UI.tt);UI.tt=setTimeout(()=>el.hidden=true,3000)}
// the advisor: the move the normal computer would make, with a reason in plain words
function advise(){const p=me();if(!p)return;if(isClient()){if(!UI.advWait){UI.advWait=true;netSend({act:'advise'})}return}const a=adviceFor(p.i);if(a)showAdvice(a)}
function showAdvice(a){const m=a.m;if(m.act==='take'){UI.sel={src:m.src,c:m.c,j:m.j};UI.tgt=m.line}UI.adv={m,why:esc(a.why)};upd()}
// the advice for a seat (the host computes it for its online players too)
function adviceFor(seat){const p=P(seat);const lv=p.lv;p.lv='normal';let m;try{m=aiMove(p.i)}finally{p.lv=lv}if(!m)return null;let why='';
  if(m.act==='wall'){why=`Put it in column ${m.c+1}: it scores +${adjPts2(p.wall,m.r,m.c)} now${G.ex.gray?' and keeps your other racks placeable':''}.`}
  else{const a=m.src<0?G.ctr:G.fac[m.src];const n=a.filter(t=>t===m.c).length,nj=a.filter(t=>t===PRISM).length;const pv=preview(m,p.i);
    const what=m.c===PRISM?`the ${nj} prism${nj>1?'s':''}`:`the ${n} ${TNAME[m.c]}${m.j&&nj?` and ${nj} prism${nj>1?'s':''}`:''}`;
    why=`Take ${what} from ${srcName(m.src)}${m.line<5?` onto rack ${m.line+1}`:' straight to breakage'}: `;const bits=[];
    if(m.line<5&&pv.full)bits.push(`it fills rack ${m.line+1}${pv.pts!=null?`, which should score about +${pv.pts}`:''}`);else if(m.line<5)bits.push(`rack ${m.line+1} gets to ${pv.cnt} of ${cap(m.line)}`);else bits.push('every other choice would cost more');
    bits.push(pv.pen?`${pv.info.fl+pv.info.lid||''}${pv.info.fl+pv.info.lid?' break, ':''}costing ${pv.pen}`:'nothing breaks');if(pv.info.sun)bits.push('you also take the Sun token and start next round');
    if(G.np>1){const nx=(p.i+1)%G.np;const near=endNear(G);const b0=bestGain(G,nx,near);const S=cloneS(G);applyTake(S,p.i,m);const b1=emptyS(S)?0:bestGain(S,nx,near);if(b1<=.3)bits.push(`and it leaves ${P(nx).nm} nothing useful`);else if(b0-b1>=1.5)bits.push(`and it takes away ${P(nx).nm}’s best pick`)}
    why+=bits.join(', ')+'.'}
  return {m,why}}
document.addEventListener('click',e=>{const b=e.target.closest('button,[data-slot],[data-kiln],[data-ctr],[data-line],[data-cell],input[type=checkbox]');if(!b)return;const d=b.dataset;
  if(d.mv){const m=JSON.parse(d.mv);sfx('click');return go(m)}
  if(d.pick){return pickSel(JSON.parse(d.pick))}
  if(d.line!=null){return pickLine(+d.line)}
  if(d.cell!=null){const [r,c]=d.cell.split(',').map(Number);return on3DPick({k:'cell',p:me()?me().i:-1,r,c})}
  if(d.slot){return on3DPick({k:'tile',sl:d.slot})}
  if(d.kiln!=null)return on3DPick({k:'kiln',i:+d.kiln});if(d.ctr!=null)return on3DPick({k:'ctr'});
  if(d.np){UI.setup.np=+d.np;render();return}if(d.seat!=null){const i=+d.seat;UI.setup.seats[i]=UI.setup.seats[i]==='human'?'ai':'human';render();return}
  if(d.lv!=null){const i=+d.lv;const L=['easy','normal','hard'];UI.setup.lv[i]=L[(L.indexOf(UI.setup.lv[i])+1)%3];render();return}
  if(d.ex&&b.type==='checkbox'){UI.setup.ex[d.ex]=b.checked;return}if(d.coach&&b.type==='checkbox'){setCoach(b.checked);return}
  if(d.ui)return uiAct(d.ui);
  if(d.a&&d.a.startsWith('net')&&netClick(d.a))return;
  if(d.a==='new'&&NET.on){if(GX.open)GX.close();UI.modal='lobby';render();return}
  switch(d.a){case 'snd':toggleSound();return;case 'mus':toggleMusic();return;case 'speed':UI.speed=UI.speed===1?3:UI.speed===3?.5:1;render();return;case 'pause':UI.pause=!UI.pause;render();schedule();return;case 'new':openStart();return;case 'coach':setCoach(!UI.coach);if(G)render();return;case 'gfx':gfxCycle();return}});
function gfxBtn(){const b=$('#gfxbtn');if(!b)return;const h=IC('gfx')+'<span>'+(typeof gfxLabel==='function'?gfxLabel():'Graphics')+'</span>';if(b.dataset.h!==h){b.innerHTML=h;b.dataset.h=h}b.title='Graphics quality: '+(typeof gfxLabel==='function'?gfxLabel():'')+' (Auto picks by device and steps down if frames stutter)'}
function setCoach(v){UI.coach=!!v;try{localStorage.setItem('sgz_coach',v?'1':'0')}catch(e){}const cb=$('#coachbtn');if(cb)cb.classList.toggle('on',UI.coach)}
function uiAct(a){switch(a){case 'start':beginGame();return;case 'continue':loadSaved();return;case 'new':if(NET.on){UI.modal='lobby';render();return}openStart();return;case 'story-ok':UI.modal=null;render();schedule();return;
  case 'unsel':UI.sel=null;UI.tgt=null;UI.adv=null;upd();return;case 'prism':if(UI.sel){UI.sel={src:UI.sel.src,c:UI.sel.c,j:UI.sel.j?0:1};const ms=movesFor(UI.sel);if(!ms.some(m=>m.line===UI.tgt))UI.tgt=null;upd()}return;
  case 'advise':advise();return;case 'noadv':UI.adv=null;upd();return}}
document.addEventListener('keydown',e=>{if(GX.open||UI.modal||!me())return;if(e.key==='Escape'&&UI.sel){UI.sel=null;UI.tgt=null;upd()}else if(e.key==='Enter'&&UI.sel&&UI.tgt!=null){const m=movesFor(UI.sel).find(m=>m.line===UI.tgt);if(m){e.preventDefault();go(m)}}});
function openStart(){UI.modal='start';render()}
function beginGame(){const o=UI.setup;UI.guideNote=null;UI.fx.length=0;UI.fxSeen=0;UI.recap=[];UI.sel=null;UI.tgt=null;UI.adv=null;UI.lastHuman=null;const seats=o.seats.slice(0,o.np);
  UI.modal=null;newGame({np:o.np,seats,lv:o.lv.slice(0,o.np),ex:Object.assign({},o.ex),mode:seats.every(s=>s==='ai')?'ai':'x'});UI.modal='story';resetScene();refresh()}
function loadSaved(){try{const g=JSON.parse(localStorage.getItem(SAVE));if(!g||!g.v)throw 0;G=g;UI.modal=null;UI.recap=[];resetScene();refresh()}catch(e){openStart()}}
function resetScene(){if(!V3.on)return;for(const k in V3.tiles)V3.scene.remove(V3.tiles[k].m);V3.tiles={};V3.lkey='';relayout()}
// ---------- the computer ----------
let aiTimer=null;function schedule(){if(aiTimer||!G||G.over||UI.pause||(UI.modal&&!NET.on)||phHold()||isClient())return;const s=sideToAct();if(s<0||P(s).human)return;const wait=G.phase==='offer'&&G.fac.every(a=>a.length===PER_FACTORY)&&G.turn>0?2.2:1;
  aiTimer=setTimeout(()=>{aiTimer=null;if(!G||G.over||(UI.modal&&!NET.on)||phHold()||isClient())return;const s2=sideToAct();if(s2<0||P(s2).human)return;const m=aiMove(s2);if(!m){console.error('AI has no move in '+G.phase);return}go(m)},Math.max(0,AIDELAY/(UI.speed||1)*wait))}
function boot(){$('#defs').innerHTML=glazeDefs();GX.init({key:'sgz'});GX.onShow=id=>{if(id==='rulesd')$('#rulesbody').innerHTML=RULES_HTML;if(id==='refd')$('#refbody').innerHTML=refHtml();if(G)render()};
  try{init3D()}catch(e){console.error(e)}if(!V3.on){V3.qPref=gfxLoadPref();V3.q=V3.qPref==='auto'?gfxAuto():V3.qPref}gfxBtn();soundBtns();setCoach(UI.coach);netInit();openStart()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
