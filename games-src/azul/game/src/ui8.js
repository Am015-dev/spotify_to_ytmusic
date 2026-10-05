// ===================== part 8: phone layout (factories first, tap to play, pop-ups and one card at a time) =====================
// Only active when html.ph is set (short side <= 500 px, or a touch screen <= 600 px; ?phone=1 / ?phone=0 force it). Desktop and tablets never run this code.
const PHN={on:false,land:false,src:null,board:null,more:false,sum:null,endHide:null,walls:[],seen:{},gk:'',h:{st:'',pop:'',card:''},bs:0,mode:''};
const PH_X='<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const PH_DOTS='<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5.5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18.5" cy="12" r="1.6" fill="currentColor"/></svg>';
// size of the layout viewport, measured from a fixed full-screen probe: iOS Safari fires resize/orientationchange while innerWidth/innerHeight still hold the OLD size
function vpDims(){try{let p=document.getElementById('vpprobe');if(!p){p=document.createElement('div');p.id='vpprobe';p.setAttribute('aria-hidden','true');p.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;visibility:hidden;pointer-events:none';document.body.appendChild(p)}
  const w=p.offsetWidth,h=p.offsetHeight;if(w>0&&h>0)return {w,h}}catch(e){}return {w:innerWidth,h:innerHeight}}
function phDetect(){try{const q=new URLSearchParams(location.search);if(q.has('phone'))return q.get('phone')!=='0'}catch(e){}
  const V=vpDims(),s=Math.min(V.w,V.h);if(s<=500)return true;let c=false;try{c=matchMedia('(pointer:coarse)').matches}catch(e){}return c&&s<=600}
function phInsets(){try{const q=new URLSearchParams(location.search);if(q.has('safe')){const a=q.get('safe').split(',').map(Number);return {t:a[0]||0,r:a[1]||0,b:a[2]||0,l:a[3]||0}}
  let p=document.getElementById('phprobe');if(!p){p=document.createElement('div');p.id='phprobe';p.setAttribute('aria-hidden','true');p.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(p)}
  const c=getComputedStyle(p);return {t:parseFloat(c.paddingTop)||0,r:parseFloat(c.paddingRight)||0,b:parseFloat(c.paddingBottom)||0,l:parseFloat(c.paddingLeft)||0}}catch(e){return {t:0,r:0,b:0,l:0}}}
function phApply(){const R=document.documentElement;const was=PHN.on,wasL=PHN.land;PHN.on=phDetect();R.classList.toggle('ph',PHN.on);
  if(!PHN.on){R.classList.remove('ph-l','ph-p');for(const k of['--bs','--sat','--sar','--sab','--sal'])R.style.removeProperty(k);if(was){phChrome();try{if(V3.on)relayout()}catch(e){}}return}
  const V=vpDims(),w=V.w,h=V.h,I=phInsets(),bar=44;PHN.land=w>h;const W=w-I.l-I.r,H=h-I.t-I.b;
  const bs=PHN.land?Math.max(Math.min(H,W-280),Math.min(H,Math.ceil(H*.86))):Math.min(W,Math.max(Math.ceil(W*.82),H-bar-340));
  R.classList.toggle('ph-l',PHN.land);R.classList.toggle('ph-p',!PHN.land);PHN.bs=Math.max(200,Math.floor(bs));
  R.style.setProperty('--bs',PHN.bs+'px');R.style.setProperty('--sat',I.t+'px');R.style.setProperty('--sar',I.r+'px');R.style.setProperty('--sab',I.b+'px');R.style.setProperty('--sal',I.l+'px');
  if(!was||wasL!==PHN.land){phChrome();try{if(V3.on)relayout()}catch(e){}}}
// bar chip + "more" button, plaques hidden on phones
function phChrome(){const bar=document.querySelector('.gx-bar');if(!bar)return;
  if(PHN.on&&!document.getElementById('ph-chip')){const c=document.createElement('span');c.id='ph-chip';c.setAttribute('role','status');bar.insertBefore(c,bar.querySelector('.gx-sp'));
    const m=document.createElement('button');m.className='gx-ibtn';m.id='ph-more';m.dataset.ph='more';m.setAttribute('aria-label','More: guide, tile list, music, graphics, new game');m.innerHTML=PH_DOTS;bar.appendChild(m)}
  if(PHN.on)for(const [k,l] of [['plrd','Boards and scores'],['logd','Log of every move'],['rulesd','How to play']]){const b=bar.querySelector(`[data-gx="${k}"]`);if(b&&!b.getAttribute('aria-label'))b.setAttribute('aria-label',l)}
  try{if(V3.bagLbl)V3.bagLbl.visible=!PHN.on;if(V3.lidLbl)V3.lidLbl.visible=!PHN.on;V3.dirty=3}catch(e){}}
// one debounced, size-keyed re-layout for every rotation signal; re-measured after the iOS rotation animation settles (it often reports stale sizes at first)
const VPS={k:'',raf:0,tm:[]};
function vpApply(force){const V=vpDims(),I=phInsets(),k=V.w+'x'+V.h+'/'+I.t+','+I.r+','+I.b+','+I.l;if(!force&&k===VPS.k)return;VPS.k=k;
  try{phApply()}catch(e){console.error(e)}try{if(typeof bfResize==='function')bfResize()}catch(e){console.error(e)}}
function vpSchedule(){cancelAnimationFrame(VPS.raf);VPS.raf=requestAnimationFrame(()=>vpApply());VPS.tm.forEach(clearTimeout);VPS.tm=[120,350,800,1500].map(d=>setTimeout(()=>vpApply(),d))}
addEventListener('resize',vpSchedule);addEventListener('orientationchange',vpSchedule);addEventListener('pageshow',vpSchedule);
try{if(window.visualViewport)visualViewport.addEventListener('resize',vpSchedule);if(screen.orientation)screen.orientation.addEventListener('change',vpSchedule)}catch(e){}
try{new ResizeObserver(()=>vpSchedule()).observe(document.documentElement)}catch(e){}
try{phApply();VPS.k=''}catch(e){console.error(e)}
function phReset(){PHN.src=null;PHN.board=null;PHN.more=false;PHN.sum=null;PHN.endHide=null;PHN.walls=[];PHN.seen={}}
// ---------- events from the engine: the round summary is built from the wall fx ----------
function phFx(f){if(!PHN.on||!G)return;const x=f.x;
  if(f.t==='wall')PHN.walls.push({p:x.p,r:x.r,c:x.c,pts:x.pts,why:phPtsWhy(x.run)});
  else if(f.t==='take')PHN.lastTake=Object.assign({},x);
  else if(f.t==='round'&&G.round>1&&G.rsum&&G.pl.some(p=>p.human)){PHN.sum={last:PHN.lastTake,round:G.round-1,final:false,walls:PHN.walls.slice(),rs:G.rsum.map(r=>Object.assign({},r)),sc:G.pl.map(p=>p.score),first:G.first};PHN.walls=[]}
  else if(f.t==='round')PHN.walls=[];
  else if(f.t==='win'&&PHN.walls.length&&G.pl.some(p=>p.human)){PHN.sum={round:G.round,final:true,walls:PHN.walls.slice(),rs:(G.rsum||[]).map(r=>Object.assign({},r)),sc:G.pl.map(p=>p.score-p.st.rows-p.st.cols-p.st.colours),first:-1};PHN.walls=[]}}
const phHold=()=>(PHN.on&&!NET.on&&!!PHN.sum)||(typeof bfHold==='function'&&bfHold());
// ---------- small SVG pieces ----------
// racks + mosaic + breakage in one picture (viewBox 1076 x 624); used by the strip and the board pop-up
function phBoardSVG(p,o){o=o||{};const U=100,X0=44,XW=X0+5*U+36;let s='';
  for(let r=0;r<5;r++){const y=r*U;s+=`<text x="20" y="${y+66}" font-size="46" font-weight="800" fill="#7a3d14" text-anchor="middle">${r+1}</text>`;
    for(let k=0;k<cap(r);k++){const x=X0+(4-k)*U;const t=p.lines[r][k];s+=`<rect x="${x+3}" y="${y+3}" width="94" height="94" rx="12" fill="#d8c6a2" stroke="#9a7a4e" stroke-width="4"/>`;if(t!=null)s+=tileSVG(t,x+5,y+5,90)}
    s+=`<path d="M${X0+5*U+8} ${y+30}L${X0+5*U+30} ${y+50}L${X0+5*U+8} ${y+70}Z" fill="#8a5a2b" opacity=".6"/>`;
    for(let c=0;c<5;c++){const x=XW+c*U,v=p.wall[r][c];s+=G.ex.gray?`<rect x="${x+3}" y="${y+3}" width="94" height="94" rx="12" fill="#b9b2a6" stroke="#8e877a" stroke-width="3"/>`:`<rect x="${x+3}" y="${y+3}" width="94" height="94" rx="12" fill="#fff" stroke="#c9b99a" stroke-width="3"/>${tileSVG(WALLC(r,c),x+14,y+14,72,' opacity=".13"')}`;
      if(v>=0)s+=tileSVG(v<5?v:PRISM,x+5,y+5,90)}}
  const fy=5*U+26;for(let k=0;k<7;k++){const x=X0+k*U,t=p.floor[k];s+=`<rect x="${x+3}" y="${fy+3}" width="94" height="94" rx="12" fill="#e3cfc4" stroke="#a0493a" stroke-width="4"/>`;
    if(t!=null)s+=tileSVG(t,x+5,fy+5,90);else s+=`<text x="${x+50}" y="${fy+66}" font-size="48" font-weight="800" fill="#a0302a" text-anchor="middle">${FLOOR[k]}</text>`}
  s+=`<text x="${X0+7*U+34}" y="${fy+66}" font-size="44" font-style="italic" fill="#6b4a2a">breakage</text>`;
  return `<svg viewBox="0 0 ${XW+5*U+4} ${fy+U+4}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(p.nm)}'s racks, mosaic and breakage">${s}</svg>`}
// the 5x5 mosaic alone, big: candidate spaces (tap), advised space, newly set tiles with their points
function phWallSVG(p,o){o=o||{};const U=100;let s='';const cand={};for(const c of o.cells||[])cand[c.r+','+c.c]=c;const mk={};for(const m of o.marks||[])mk[m.r+','+m.c]=m;
  for(let r=0;r<5;r++){if(o.row===r)s+=`<rect x="-8" y="${r*U-6}" width="${5*U+16}" height="${U+12}" rx="14" fill="#ffd24a" opacity=".28"/>`;
    for(let c=0;c<5;c++){const x=c*U,y=r*U,v=p.wall[r][c],k=r+','+c;const cd=cand[k],m=mk[k];
      s+=`<g ${cd?`data-cell="${k}" class="hit" role="button" aria-label="Row ${r+1}, column ${c+1}${cd.pts!=null?', plus '+cd.pts:''}"`:''}>`;
      s+=G.ex.gray?`<rect x="${x+3}" y="${y+3}" width="94" height="94" rx="12" fill="#b9b2a6" stroke="#8e877a" stroke-width="3"/>`:`<rect x="${x+3}" y="${y+3}" width="94" height="94" rx="12" fill="#fff" stroke="#c9b99a" stroke-width="3"/>${tileSVG(WALLC(r,c),x+14,y+14,72,' opacity=".15"')}`;
      if(v>=0)s+=tileSVG(v<5?v:PRISM,x+5,y+5,90);
      if(m)s+=`<rect x="${x+1}" y="${y+1}" width="98" height="98" rx="13" fill="none" stroke="#2f7d46" stroke-width="7"/><circle cx="${x+78}" cy="${y+22}" r="24" fill="#2f7d46"/><text x="${x+78}" y="${y+33}" font-size="32" font-weight="800" fill="#fff" text-anchor="middle">+${m.pts}</text>`;
      if(cd){const adv=o.adv===cd.c;s+=`<rect x="${x+2}" y="${y+2}" width="96" height="96" rx="13" fill="${adv?'#fff':'#ffd24a'}" fill-opacity="${adv?.35:.22}" stroke="${adv?'#fff':'#ffb400'}" stroke-width="8"><animate attributeName="stroke-opacity" values="1;.4;1" dur="1.2s" repeatCount="indefinite"/></rect>`;
        if(cd.pts!=null)s+=`<text x="${x+50}" y="${y+66}" font-size="44" font-weight="800" fill="#1d4a2a" stroke="#fff" stroke-width="7" paint-order="stroke" text-anchor="middle">+${cd.pts}</text>`}
      s+='</g>'}}
  return `<svg viewBox="-6 -6 ${5*U+12} ${5*U+12}" preserveAspectRatio="xMidYMid meet" role="group" aria-label="${esc(p.nm)}'s mosaic">${s}</svg>`}
// a rack (or the breakage line) as it would look after the take, for the choice buttons
function phRackMini(p,m,pv){const n=m.line<5?cap(m.line):7;const L=m.line<5?p.lines[m.line]:p.floor;const add={};
  for(const g of pv.ghost){if(m.line<5&&g.sl.startsWith('l'))add[+g.sl.split('_')[2]]=g.k;else if(m.line===5&&g.sl.startsWith('x'))add[+g.sl.split('_')[1]]=g.k}
  let s='';const cw=m.line<5?100:84;for(let k=0;k<n;k++){const x=k*(cw+8);const t=L[k];const a=add[k];
    s+=`<rect x="${x}" y="0" width="${cw}" height="${cw}" rx="12" fill="#d8c6a2" stroke="#9a7a4e" stroke-width="4"/>`;if(t!=null)s+=tileSVG(t,x+3,3,cw-6);else if(a!=null)s+=tileSVG(a,x+3,3,cw-6)+`<rect x="${x+1}" y="1" width="${cw-2}" height="${cw-2}" rx="12" fill="none" stroke="#2f7d46" stroke-width="9"/>`}
  return `<svg class="ph-rm" viewBox="0 0 ${n*(cw+8)-8} ${cw}" aria-hidden="true">${s}</svg>`}
// ---------- the pop-up for taking tiles ----------
function phReason(p,r,c){const L=p.lines[r];if(L.length>=cap(r))return 'full';const lc=lineColour(L);if(c<NC&&lc>=0&&lc!==c)return 'holds '+TNAME[lc];const Y=c<NC?c:lc;if(Y>=0&&rowHas(p,r,Y))return 'mosaic row '+(r+1)+' has '+TNAME[Y];return 'no space'}
// what a take does right now: the points a filled rack scores, minus the tiles of its own that break (the Sun token is shown apart: it comes with every courtyard take)
function phNow(m,seat){const pv=preview(m,seat);const f0=P(seat).floor.length;const sp=pv.info.sun?floorPenalty(f0+1)-floorPenalty(f0):0;const tp=pv.pen-sp;
  return {m,pv,sp,tp,n:pv.info.fl+pv.info.lid-(pv.info.sun&&f0>=7?1:0),net:(pv.full&&pv.pts!=null?pv.pts:0)+tp}}
// the starred rack: best right now; ties go to a filled rack, then more tiles kept, then the computer's look-ahead
function phRec(ms,seat){if(!ms.length)return null;const R=ms.map(m=>phNow(m,seat));PHN.alt=null;const top=Math.max(...R.map(x=>x.net));let c=R.filter(x=>x.net===top);
  const f=Math.max(...c.map(x=>x.pv.full?1:0));c=c.filter(x=>(x.pv.full?1:0)===f);const k=Math.max(...c.map(x=>x.pv.info.line));c=c.filter(x=>x.pv.info.line===k);
  const pick=x=>{const safe=R.filter(y=>y.m.line<5&&!y.tp&&y!==x).sort((a,b)=>b.net-a.net)[0];PHN.alt=x.tp&&safe?safe:null;PHN.only=R.every(y=>y.m.line===5);return x};
  if(c.length>1){try{const near=endNear(G),nx=(seat+1)%G.np;let bv=-1e9,b=c[0];for(const x of c){const S=cloneS(G);applyTake(S,seat,x.m);const v=gainOf(G,seat,x.m,near)-.55*(emptyS(S)?0:bestGain(S,nx,near));if(v>bv){bv=v;b=x}}return pick(b)}catch(e){}}return pick(c[0])}
function phWhy(x){const m=x.m,pv=x.pv,n=x.n;const brk=x.tp?`, ${n} break (${x.tp})`:', nothing breaks';
  if(m.line===5)return PHN.only?`No rack can take this glaze (each holds another glaze, or its mosaic row has it), so all of it breaks${x.tp?' ('+x.tp+')':''}. Late in a round, leave yourself a rack that can.`:`Breakage: every rack costs more${x.tp?' ('+x.tp+')':''}.`;
  const alt=PHN.alt?` Still better than rack ${PHN.alt.m.line+1} (${PHN.alt.pv.full?'+'+PHN.alt.pv.pts:'scores nothing yet'}, nothing breaks).`:'';const last=phLast()&&!pv.full?' Last round: a rack that isn’t full scores nothing.':'';
  const ends=pv.full&&P(focusSeat()).wall[m.line].filter(v=>v>=0).length===4?` It completes mosaic row ${m.line+1}: the game ends after this round.`:'';
  if(pv.full)return `Rack ${m.line+1} fills: +${pv.pts} at round end${brk}.${ends}${alt}`;
  return `Rack ${m.line+1}: ${pv.cnt} of ${cap(m.line)} so far${brk}.${last||' Fill it later to score.'}${alt}`}
function phLast(){for(const p of G.pl)for(let r=0;r<5;r++){const n=p.wall[r].filter(v=>v>=0).length;if(n>=5||(n===4&&p.lines[r].length===cap(r)))return true}return false}
function phPtsWhy(run){if(!run)return '';const [h,v]=run;if(h===1&&v===1)return 'alone';const b=[];if(h>1)b.push(h+' across');if(v>1)b.push(v+' down');return '= '+b.join(' + ')}
// how the game is won and how close the end is (any complete mosaic row ends the game after that round)
function phBonus(p){const b=endBonus(p);return b.rows*BONUS.row+b.cols*BONUS.col+b.colours*BONUS.colour}
function phBonusWhy(p){const b=endBonus(p),o=[];if(b.rows)o.push(b.rows+' row'+(b.rows>1?'s':''));if(b.cols)o.push(b.cols+' column'+(b.cols>1?'s':''));if(b.colours)o.push(b.colours+' full glaze'+(b.colours>1?'s':''));return o.join(', ')}
function phGoalHTML(){let best=null;for(const p of G.pl)for(let r=0;r<5;r++){const n=p.wall[r].filter(v=>v>=0).length;const ready=p.lines[r].length===cap(r)&&!rowHas(p,r,lineColour(p.lines[r]))?1:0;
    if(!best||n+ready>best.n+best.ready||(n+ready===best.n+best.ready&&ready>best.ready))best={p,r,n,ready}}
  const warn=best&&best.n+best.ready>=5?`<b class="bad">Last round: ${esc(best.p.nm)}${isYou(best.p.i)?' (you)':''} will complete mosaic row ${best.r+1}.</b>`:best&&best.n>=4?`<b>${esc(best.p.nm)}${isYou(best.p.i)?' (you)':''} has 4 of 5 in mosaic row ${best.r+1}.</b>`:'';
  const left=G.ctr.filter(t=>t!==SUN).length+G.fac.reduce((a,f)=>a+f.length,0);const late=G.phase==='offer'&&left>0&&left<=8?`<b>Only ${left} tile${left===1?'':'s'} left this round: every tile must be taken, and what fits no rack breaks.</b>`:'';
  return `<div class="ph-goal">${IC('trophy')}<span${warn||late?' class="wq"':''}><span class="gl">Most ★ wins. The game ends after a round in which someone completes a mosaic row. Then: full row +2, full column +7, all 5 of a glaze +10.</span><span class="gs">Most ★ wins · ends after a mosaic row is full · end bonus: row +2, column +7, glaze +10</span> ${warn||late}${(()=>{const o=G.pl.filter(q=>q.i!==focusSeat()&&phBonus(q));return o.length?` <b class="ph-bn">End bonus so far: ${o.map(q=>esc(q.nm)+' +'+phBonus(q)+' ('+phBonusWhy(q)+')').join(', ')}.</b>`:''})()}</span></div>`}
function phTakeHTML(hp){const sel=UI.sel,src=sel?sel.src:PHN.src;const a=src<0?G.ctr:G.fac[src];if(!a||!a.length)return '';
  const cnt={};for(const t of a)cnt[t]=(cnt[t]||0)+1;const keys=Object.keys(cnt).map(Number).sort((x,y)=>x-y);const nj=cnt[PRISM]||0;
  const chips=keys.map(c=>{const on=sel&&sel.c===c;return `<button class="ph-g${on?' on':''}" data-ph="pick" data-pick='${JSON.stringify({src,c,j:c===PRISM?1:0})}' aria-pressed="${!!on}" aria-label="${cnt[c]} ${TNAME[c]}">${tileChip(c,cnt[c])}<span>${TNAME[c]}</span></button>`}).join('');
  let title,body='',tgS='';
  if(!sel){title=`<b>${src<0?'Courtyard':'Kiln '+(src+1)}${src<0&&G.markerIn==='ctr'?' ☀':''}</b> <small>choose a glaze to take</small>`;body=`<div class="ph-note">All tiles of the glaze you choose come with you.${src<0&&G.markerIn==='ctr'?' The first courtyard take also gets the Sun token (−1, you start next round).':''}</div>`}
  else{const n=cnt[sel.c]||0;const withJ=sel.c<NC&&sel.j;const tot=sel.c===PRISM?nj:n+(withJ?nj:0);
    title=`<b>${tileChip(sel.c,null)} take ${tot} ${sel.c===PRISM?'Prism':TNAME[sel.c]}${withJ?' + '+nj+' Prism':''}</b> <small>from ${srcName(src)}${src<0&&G.markerIn==='ctr'?' + ☀ Sun token':''}</small>`;
    const ms=movesFor(sel);const by={};for(const m of ms)by[m.line]=m;const RX=phRec(ms,hp.i);const rec=RX&&ms.length>1?RX.m.line:-1;
    const tg=sel.c<NC&&nj?`<button class="ph-tg${sel.j?' on':''}" data-ui="prism" aria-pressed="${!!sel.j}" aria-label="Also take the ${nj} Prism tile${nj>1?'s':''}">${sel.j?'☑':'☐'} + ${nj} Prism${nj>1?'s':''}</button>`:'';tgS=tg;
    let grid='';for(let r=0;r<6;r++){const m=by[r];const lab=r<5?'Rack '+(r+1):'Breakage';
      if(!m){grid+=`<button class="ph-o dis" disabled aria-label="${lab}: not allowed, ${esc(phReason(hp,r,sel.c))}"><span class="ph-r">${lab}</span><span class="ph-v muted">${esc(phReason(hp,r,sel.c))}</span></button>`;continue}
      const X=phNow(m,hp.i),pv=X.pv;const over=X.n;let v;
      if(r===5)v=`<span class="ph-v bad">${pv.info.n} tile${pv.info.n>1?'s':''} ${X.tp||''}</span>`;
      else{const good=pv.full?`<span class="good">fills${pv.pts!=null?' +'+pv.pts:''}</span>`:`<span>${pv.cnt}/${cap(r)}</span>`;v=`<span class="ph-v">${good}${over>0?` <span class="bad">· ${over}✗ ${X.tp}</span>`:''}</span>`}
      const aria=`${lab}: ${r<5?(pv.full?'fills it':pv.cnt+' of '+cap(r)):'all to breakage'}${over>0&&r<5?', '+over+' break':''}${X.tp?', '+X.tp+' points':''}`;
      grid+=`<button class="ph-o${rec===r?' rec':''}${over||r===5?' ov':''}" data-mv='${esc(JSON.stringify(m))}' aria-label="${esc(aria)}"><span class="ph-r">${lab}${rec===r?' <i>★ best</i>':''}</span>${phRackMini(hp,m,pv)}${v}</button>`}
    const sun=sel.src<0&&G.markerIn==='ctr';const f0=hp.floor.length;const sp=floorPenalty(f0+1)-floorPenalty(f0);
    body=`<div class="ph-grid">${grid}</div>`+(sun?`<div class="ph-sun">☀ First courtyard take: you also get the Sun token: it takes your next breakage space (${String(sp||0).replace('-','−')}) whichever rack you choose, and you start next round.</div>`:'')
      +(RX?`<div class="ph-why">${UI.adv&&UI.adv.m.act==='take'?IC('bulb')+' Suggested glaze. ':''}${rec>=0?'<b>★</b> ':''}${esc(phWhy(RX))}</div>`:'')
      +(UI.coach?`<div class="ph-teach">Rack N holds N tiles of one glaze. Full racks score at round end; extra tiles break.</div>`:'')}
  if(!sel)body+=`<div class="ph-teach">Tap a glaze: you take <b>every</b> tile of it here. The rest of a kiln slides to the courtyard.</div>`;
  return `<div class="ph-head"><span class="ph-t">${title}</span><button class="ph-ib" data-ph="boards" aria-label="See the boards">${IC('players')}</button><button class="ph-ib" data-ph="close" aria-label="Close">${PH_X}</button></div>${keys.length>1||!sel||tgS?`<div class="ph-chips${keys.length>4?' many':''}">${keys.length>1||!sel?chips:''}${tgS}</div>`:''}${body}`}
// ---------- the board pop-up (yours or a rival's, bigger) ----------
function phBoardHTML(){const i=PHN.board;const p=P(i);if(!p)return '';const fr=fullRows(p);
  const tabs=G.pl.map(q=>`<button class="ph-tab${q.i===i?' on':''}" style="--pc:${PCOL[q.i]}" data-ph="board" data-i="${q.i}" aria-pressed="${q.i===i}"><span class="tn">${esc(q.nm)}</span> ★${q.score}</button>`).join('');
  return `<div class="ph-head"><div class="ph-tabs">${tabs}</div><button class="ph-ib" data-ph="close" aria-label="Close">${PH_X}</button></div>
   <div class="ph-bsvg">${phBoardSVG(p)}</div>
   <div class="ph-note">${G.markerIn===i?'☀ holds the Sun token · ':''}${p.human?(isYou(i)||!NET.on?'player':'online player'):p.lv+' computer'} · tiles set ${p.st.place} · breakage ${p.st.floor} · complete rows ${fr}<br>End of game: row +${BONUS.row} · column +${BONUS.col} · full glaze +${BONUS.colour}</div>`}
// ---------- the strip: your racks and mosaic, the rivals, what just happened ----------
function phStripHTML(){const f=focusSeat(),fp=P(f),hp=me(),s=sideToAct();const pn=i=>`<span style="color:${PCOL[i]};font-weight:800">${esc(P(i).nm)}</span>`;
  let a='',left='',right='';
  if(G.over){left=`<b>Game over</b> <small>${esc(G.winText)}</small>`;right=`<button class="ph-b" data-ph="result">Result</button><button class="ph-b" data-a="new">${IC('new')}New</button>`}
  else if(hp){left=`<b>${G.pl.filter(q=>q.human).length>1&&!NET.on?esc(hp.nm)+', your turn':'Your turn'}</b> <small>${UI.coach?'tap a kiln or the courtyard':'pick a kiln'}</small>`;right=`<button class="ph-b" data-ui="advise" aria-label="Suggest a move">${IC('bulb')}<span>Suggest</span></button>`}
  else{left=s>=0?`${pn(s)} ${NET.on&&P(s).human?'is deciding':'is choosing'}…`:'The mosaics are being set…';if(!human())right=`<button class="ph-b" data-a="pause" aria-label="${UI.pause?'Resume':'Pause'}">${IC(UI.pause?'play':'pause')}</button>`}
  a=`<div class="ph-a"><span class="ph-msg">${left}</span>${right}</div>`;
  const net=NET.on?netDockHtml():'';
  const sack='';
  const mine=`<button class="ph-mine" data-ph="board" data-i="${f}" style="--pc:${PCOL[f]}" aria-label="Open ${esc(fp.nm)}'s board"><span class="ph-mh"><i></i><b>${esc(fp.nm)}${isYou(f)?' (you)':''}</b><b class="ph-sc">★${fp.score}</b>${phBonus(fp)?`<small class="ph-bn" title="End bonus earned so far">+${phBonus(fp)} end bonus</small>`:''}${G.markerIn===f?'<span title="Sun token">☀</span>':''}${sack}</span><span class="ph-ms">${phBoardSVG(fp)}</span></button>`;
  const rivals=G.pl.filter(q=>q.i!==f).map(q=>`<button class="ph-rv${q.i===s?' cur':''}" data-ph="board" data-i="${q.i}" style="--pc:${PCOL[q.i]}" aria-label="Open ${esc(q.nm)}'s board, ${q.score} points"><i></i><b>${esc(q.nm)}</b><span>★${q.score}</span>${G.markerIn===q.i?'<span>☀</span>':''}${q.floor.length?`<small>✗${q.floor.filter(t=>t!==SUN).length}</small>`:''}</button>`).join('');
  const rc=UI.recap.length&&!G.over?`<div class="ph-recap" aria-label="Recent moves">${UI.recap.slice(0,hp?Math.max(1,G.np-1):3).map(t=>`<div>${t}</div>`).join('')}</div>`:'';
  return net+a+(G.over?'':phGoalHTML())+mine+rc+`<div class="ph-rvs">${rivals}</div>`}
// ---------- cards: one at a time, always with Continue ----------
function phSumHTML(S){const f=focusSeat();const mine=S.walls.filter(w=>w.p===f);
  const rows=G.pl.map(p=>{const r=S.rs[p.i]||{place:0,floor:0};return `<div class="ph-sr" style="--pc:${PCOL[p.i]}"><i></i><b>${esc(p.nm)}</b><span class="good">+${r.place}</span><span class="${r.floor?'bad':'muted'}">${r.floor?r.floor:'0'}</span><b>★${S.sc[p.i]}</b></div>`}).join('');
  const nxt=!S.final&&S.first>=0?`<div class="ph-note">☀ ${esc(P(S.first).nm)} starts round ${S.round+1}.</div>`:'';
  return `<div class="ph-head"><span class="ph-t"><b>${S.final?'The last mosaics are set':'Round '+S.round+': mosaics set'}</b></span></div>
   <div class="ph-sum"><div class="ph-wall">${phWallSVG(P(f),{marks:mine})}</div><div class="ph-sl"><div class="ph-sh"><span></span><span>tiles</span><span>broken</span><span>score</span></div>${rows}${nxt}
   <div class="ph-exp">${S.last?`<div class="muted">Last move: ${esc(P(S.last.p).nm)} took ${S.last.n} ${S.last.c===PRISM?'Prism':TNAME[S.last.c]} → ${S.last.line<5?'rack '+(S.last.line+1):'breakage'}.</div>`:''}${mine.map(w=>`<div class="ph-pts" data-pts="${w.pts}">Row ${w.r+1}: <span class="good">+${w.pts}</span> ${esc(w.why||'')}</div>`).join('')}${(S.rs[f]||{}).floor?(R=>`<div class="ph-pts" data-pts="${R.floor}">Breakage (${R.nb||'?'} space${R.nb===1?'':'s'}${R.sun?', incl. ☀ Sun token':''}): <span class="bad">${R.floor}</span>${R.pen!=null&&R.floor>R.pen?` <small>(${R.pen} due, but a score can’t go below 0)</small>`:''}</div>`)(S.rs[f]):''}${G.pl.filter(q=>q.i!==f).map(q=>{const w=S.walls.filter(x=>x.p===q.i);const r=S.rs[q.i]||{};return w.length||r.floor?`<div class="muted">${esc(q.nm)}: ${w.length} tile${w.length===1?'':'s'} +${r.place}${w.length?' (best +'+Math.max(...w.map(x=>x.pts))+')':''}${r.floor?', breakage '+r.floor:''}</div>`:''}).join('')}${!mine.length&&!(S.rs[f]||{}).floor?'<div>No full rack: nothing scored.</div>':''}${UI.coach&&S.round<=2?'<div class="ph-teach">A tile scores 1 for each tile in the lines it joins.</div>':''}</div></div></div>
   <div class="ph-cont"><button class="ph-go" data-ph="continue">Continue</button></div>`}
function phWallQHTML(hp){const q=G.wt.q;const L=hp.lines[q.r];const lc=lineColour(L);const isP=L.includes(PRISM);
  const cells=q.cells.map(c=>({r:q.r,c,pts:adjPts2(hp.wall,q.r,c)}));
  return `<div class="ph-head"><span class="ph-t"><b>${tileChip(isP?PRISM:lc,null)} Set your ${isP?'Prism':TNAME[lc]} tile</b> <small>from rack ${q.r+1}</small></span><button class="ph-ib" data-ui="advise" aria-label="Suggest a space">${IC('bulb')}</button></div>
   <div class="ph-sum wq"><div class="ph-wall">${phWallSVG(hp,{cells,row:q.r,adv:UI.adv&&UI.adv.m.act==='wall'?UI.adv.m.c:-1})}</div><div class="ph-sl"><div class="ph-note big">Tap a glowing space in row ${q.r+1}. The number is what it scores now.</div>${UI.adv&&UI.adv.m.act==='wall'?`<div class="ph-note adv">${IC('bulb')} ${UI.adv.why}</div>`:''}${G.ex.gray?'<div class="ph-note">Unmarked mosaic: no glaze twice in a row or column.</div>':'<div class="ph-note">A rack of only prisms may go to any empty space in its row.</div>'}</div></div>`}
function phMoreHTML(){const nh=!human();
  const b=(ic,lab,attr,on)=>`<button class="ph-m${on?' on':''}" ${attr}>${ic}<span>${lab}</span></button>`;
  return `<div class="ph-head"><span class="ph-t"><b>Menu</b></span><button class="ph-ib" data-ph="close" aria-label="Close">${PH_X}</button></div><div class="ph-menu">
   ${b(IC('guide'),'Guide: '+(UI.coach?'on':'off'),'data-a="coach"',UI.coach)}${b(IC('tiles'),'Tile list','data-gx="refd"')}
   ${b(IC(SND.music?'music':'nomusic'),'Music: '+(SND.music?'on':'off'),'data-a="mus"')}${b(IC('gfx'),typeof gfxLabel==='function'?gfxLabel():'Graphics','data-a="gfx"')}
   ${nh?b(IC('speed'),'Speed: '+({0.5:'slow',1:'normal',3:'fast'}[UI.speed]||'normal'),'data-a="speed"'):''}${nh?b(IC(UI.pause?'play':'pause'),UI.pause?'Resume':'Pause','data-a="pause"'):''}
   ${b(IC('new'),'New game','data-a="new"')}</div>`}
function phCoachHTML(){return `<div class="ph-head"><span class="ph-t"><b>${IC('guide')} Your first game</b></span></div><div class="ph-coach"><p><b>Win:</b> have the most ★. The game ends after a round in which someone completes a row of their mosaic.</p><p><b>Your turn:</b> tap a kiln, take <b>every</b> tile of one glaze, put them on one rack. The rest slides to the courtyard.</p><p><b>Round end:</b> each full rack sets one tile in your mosaic and scores; racks not yet full wait for the next round. A mosaic row never holds a glaze twice. Tiles that don’t fit break and cost points.</p><p><b>Sun token:</b> the first to take from the courtyard gets it: −1, but they start next round.</p><p><b>Tip:</b> full columns pay +7 each at the end, full rows only +2.</p></div><div class="ph-cont"><button class="ph-go" data-ph="continue">Got it</button></div>`}
function phEndHTML(){const pr=$('#dockbody .prompt');if(!pr)return '';
  return `<div class="ph-end">${pr.outerHTML}</div><div class="ph-cont three"><button class="ph-go" data-a="new">New game</button><button class="ph-go ghost" data-ph="endboards">Mosaics</button><button class="ph-go ghost" data-ph="continue">Close</button></div>`}
// ---------- which view is up (one at a time) ----------
function phPlan(){if(!G)return {k:'none'};const hp=me();const gk=G.seed+':'+(G.gid||'');if(gk!==PHN.gk){PHN.gk=gk;phReset()}
  if(!hp||G.phase!=='offer'){PHN.src=null}
  if(PHN.sum)return {k:'sum'};
  if(G.over&&PHN.endHide!==gk)return {k:'end'};
  if(hp&&G.phase==='wall'&&G.wt&&G.wt.q)return {k:'wallq'};
  if(PHN.more)return {k:'more'};
  if(hp&&G.phase==='offer'&&UI.coach&&!PHN.seen.p1&&!UI.sel&&PHN.src==null&&PHN.board==null&&$('#dockbody .coach'))return {k:'coach'};
  if(PHN.board!=null&&P(PHN.board))return {k:'board'};
  if(hp&&G.phase==='offer'&&(UI.sel||PHN.src!=null))return {k:'take'};
  return {k:'strip'}}
function phChip(){const el=document.getElementById('ph-chip');if(!el||!G)return;const s=sideToAct(),hp=me();
  const t=G.over?'Judgement':`R${G.round} · ${G.phase==='wall'?'mosaics':hp?'You':s>=0?esc(P(s).nm):''}`;
  const lbl=G.over?'The king’s judgement':`${chapter(G.round)} · ${G.phase==='wall'?'setting the mosaics':hp?'your turn':s>=0?P(s).nm+' to play':''}`;
  const h=`<i style="background:${s>=0&&!G.over?PCOL[s]:'#e0a53a'}"></i>${t}`;if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h;el.setAttribute('aria-label',lbl)}}
function phSet(id,h,show){const el=document.getElementById(id);if(!el)return;const k=id.slice(3);if(PHN.h[k]!==h){PHN.h[k]=h;el.innerHTML=h}el.hidden=!show}
function phRender(){if(!PHN.on){return}const z=document.getElementById('ph-z');if(!z)return;
  if(!G){phSet('ph-st','',false);phSet('ph-pop','',false);phSet('ph-card','',false);return}
  phChip();const pl=phPlan();const hp=me();let card='',pop='',st='';
  if(pl.k==='sum')card=phSumHTML(PHN.sum);else if(pl.k==='end')card=phEndHTML();else if(pl.k==='wallq')card=phWallQHTML(hp);else if(pl.k==='more')card=phMoreHTML();else if(pl.k==='coach')card=phCoachHTML();
  else if(pl.k==='board')pop=phBoardHTML();else if(pl.k==='take')pop=phTakeHTML(hp);
  if(pl.k==='strip'||(pl.k==='take'&&!pop)||(pl.k==='board'&&!pop))st=phStripHTML();
  PHN.mode=pl.k;z.dataset.mode=pl.k;
  phSet('ph-st',st,!!st);phSet('ph-pop',pop,!!pop);phSet('ph-card',card,!!card)}
// ---------- input ----------
function phClose(){UI.sel=null;UI.tgt=null;UI.adv=null;UI.hover=null;PHN.src=null;PHN.board=null;PHN.more=false;upd()}
function phSources(src){const a=src<0?G.ctr:G.fac[src];if(!a||!a.length)return [];const keys=[...new Set(a)].sort((x,y)=>x-y);return keys}
// a tap on the table (a tile, a kiln, the courtyard, or empty space)
function phPick(h){const p=me();if(!G||G.over)return;
  if(PHN.sum||PHN.more&&false)return;
  if(!p){return}
  if(PHN.board!=null){PHN.board=null}
  if(h&&h.k==='tile'&&(h.sl[0]==='f'||h.sl[0]==='c')){const s=slotSel(h.sl);if(s){PHN.src=s.src;if(UI.sel&&UI.sel.src===s.src&&UI.sel.c===s.c)return upd();return pickSel(s)}return}
  if(h&&(h.k==='kiln'||h.k==='ctr')){const src=h.k==='ctr'?-1:h.i;const a=src<0?G.ctr:G.fac[src];if(!a||!a.length)return toast(src<0?'The courtyard is empty.':'That kiln is empty.');
    PHN.src=src;if(UI.sel&&UI.sel.src!==src){UI.sel=null;UI.tgt=null}
    if(!UI.sel){const ks=phSources(src);const glz=ks.filter(c=>c<NC);if(glz.length===1)return pickSel({src,c:glz[0],j:0});if(!glz.length)return pickSel({src,c:PRISM,j:1})}
    return upd()}
  // empty table: close what is open
  if(UI.sel||PHN.src!=null)return phClose()}
function phAct(a,d){switch(a){
  case 'close':phClose();return;
  case 'more':PHN.more=!PHN.more;if(PHN.more){UI.sel=null;UI.tgt=null;PHN.src=null}upd();return;
  case 'board':PHN.board=+d.i;PHN.more=false;upd();return;
  case 'boards':PHN.board=focusSeat();upd();return;
  case 'pick':{const s=JSON.parse(d.pick);if(UI.sel&&UI.sel.src===s.src&&UI.sel.c===s.c)return;pickSel(s);return}
  case 'continue':if(PHN.sum){PHN.sum=null}else if(G&&G.over)PHN.endHide=PHN.gk;else PHN.seen.p1=1;upd();schedule();return;
  case 'result':PHN.endHide=null;upd();return;
  case 'endboards':PHN.endHide=PHN.gk;PHN.board=focusSeat();upd();return}}
document.addEventListener('click',e=>{if(!PHN.on)return;const b=e.target.closest('[data-ph]');
  if(b){e.preventDefault();e.stopImmediatePropagation();phAct(b.dataset.ph,b.dataset);return}
  const pl=e.target.closest('[data-gx="plrd"]');if(pl){e.stopImmediatePropagation();e.preventDefault();if(G)phAct('boards',{});return}
  if(e.target.closest('#ph-card [data-a="new"],#ph-st [data-a="new"]')){PHN.more=false}
  else if(e.target.closest('#ph-card [data-a],#ph-card [data-gx]'))setTimeout(()=>{try{phRender()}catch(x){}},30)},true);
document.addEventListener('keydown',e=>{if(!PHN.on||e.key!=='Escape'||GX.open||UI.modal)return;if(PHN.more||PHN.board!=null||UI.sel||PHN.src!=null){e.stopImmediatePropagation();phClose()}},true);
// tap on the free zone around a pop-up closes it
document.addEventListener('pointerdown',e=>{if(!PHN.on||!G)return;const z=e.target&&e.target.id==='ph-z'?e.target:null;if(z&&(PHN.mode==='take'||PHN.mode==='board'||PHN.mode==='more')){e.preventDefault();phClose()}},true);
