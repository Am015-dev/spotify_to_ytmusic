// part 12: the rival's board stays on the table (a compact mirror beside the kilns), with what she needs, what your pick leaves her,
// and a cheer when your pick forces her tiles to the floor. Only reads G / BF.disp; every change still goes through performMove.
function rvSeat(){const S=BF.disp||G;if(!S||S.np<2)return -1;const f=bfFocus();return ((S.pl[f]?f:0)+1)%S.np}
const rvCol=c=>c===PRISM?'prism':TNAME[c].toLowerCase();
// started racks waiting for more of one colour
function rvNeeds(S,p){const o=[];for(let r=0;r<5;r++){const L=p.lines[r];if(!L.length||L.length>=cap(r))continue;const c=lineColour(L);if(c>=0)o.push({r,c,n:cap(r)-L.length})}return o}
// most tiles of colour c that p could put on one rack (and which rack)
function rvRoom(S,p,c){let n=0,r0=-1;for(let r=0;r<5;r++){if(!lineOk(S,p,r,c))continue;const k=cap(r)-p.lines[r].length;if(k>n){n=k;r0=r}}return {n,r:r0}}
function rvCount(S,c){let n=0;for(const a of S.fac)for(const t of a)if(t===c)n++;for(const t of S.ctr)if(t===c)n++;return n}
// the colour you are pointing at (picked, or under the mouse)
function rvColour(){if(UI.sel&&UI.sel.c<NC)return UI.sel.c;return BF.hov!=null?BF.hov:-1}
// the two lines under her board: what she needs of this colour, and what your pick leaves her
function rvSay(S,p){const nm=esc(p.nm);if(!G||G.over||G.phase!=='offer'||BF.busy)return {a:BF.busy&&BF.actor===p.i?`${nm} is moving`:`${nm}'s board`,b:''};
  const c=rvColour();const nd=rvNeeds(S,p);
  if(c<0){if(!nd.length)return {a:`${nm} has no rack started`,b:(BF.mouse?'Point at':'Tap')+' a colour to compare'};
    return {a:`${nm} needs ${nd[0].n} ${rvCol(nd[0].c)} for rack ${nd[0].r+1}`,b:nd[1]?`and ${nd[1].n} ${rvCol(nd[1].c)} for rack ${nd[1].r+1}`:(BF.mouse?'Point at':'Tap')+' a colour to compare'}}
  const want=nd.find(x=>x.c===c);const room=rvRoom(S,p,c);
  const a=want?`${nm} needs ${rvCol(c)} for rack ${want.r+1}`:room.n?`${nm} could start ${rvCol(c)} on rack ${room.r+1}`:`${nm} can't use ${rvCol(c)}`;
  let b='';const hp=me();const sel=UI.sel;
  if(sel&&hp){try{const S2=cloneS(G);applyTake(S2,hp.i,{act:'take',src:sel.src,c:sel.c,j:sel.j,line:5});const q=S2.pl[p.i];
      if(want&&rvCount(S2,c)<want.n)b=`Your take leaves her rack ${want.r+1} short`;
      if(!b&&sel.src>=0){const rest=G.fac[sel.src].filter(t=>t!==sel.c&&!(t===PRISM&&sel.j)&&t<NC);let g=-1,gn=0;for(const t of new Set(rest)){const n=S2.ctr.filter(x=>x===t).length;if(n>gn){gn=n;g=t}}
        if(g>=0){const rm=rvRoom(S2,q,g);const fl=q.floor.length;const pen=floorPenalty(Math.min(7,fl+Math.max(0,gn-rm.n)))-floorPenalty(fl);
          b=`Leaves ${gn} ${rvCol(g)}: `+(!rm.n?`${nm} can't use them`+(pen?` (${String(pen).replace('-','−')})`:''):gn>rm.n?`too many for ${nm} (${String(pen).replace('-','−')})`:gn===rm.n&&q.lines[rm.r].length?`fills ${nm}'s rack ${rm.r+1}`:`${nm} can use them`)}}
      if(!b)b=want?`${rvCount(S2,c)} ${rvCol(c)} left for her after this`:'Your take changes little for her'}catch(e){}}
  else if(!sel)b=want?'Take them before she does':'';
  return {a,b}}
function bfRivHTML(S){const i=rvSeat();if(i<0)return '';const p=S.pl[i];const c=rvColour();const nd=rvNeeds(S,p);const live=!BF.busy;
  const pc=typeof sgPicOf==='function'&&sgPicOf(p.nm);let rows='';
  for(let r=0;r<5;r++){const L=p.lines[r];let rk='';for(let col=0;col<5;col++){const k=4-col;if(k>=cap(r)){rk+='<b class="rv-c no"></b>';continue}const key=`l${i}_${r}_${k}`;const t=L[k];rk+=`<b class="rv-c" data-s="${key}">${t!=null?bfTile(t,key):''}</b>`}
    let wl='';for(let col=0;col<5;col++){const key=`w${i}_${r}_${col}`;const v=p.wall[r][col];wl+=`<b class="rv-c w" data-s="${key}"${v<0&&!S.ex.gray?` style="--wc:${TCSS[WALLC(r,col)]}"`:''}>${v>=0?bfTile(v<5?v:PRISM,key):''}</b>`}
    const need=live&&c>=0&&nd.some(x=>x.r===r&&x.c===c),could=live&&c>=0&&!need&&!nd.some(x=>x.c===c)&&rvRoom(S,p,c).r===r;
    rows+=`<div class="rv-row${need?' need':could?' could':''}"><div class="rv-rk">${rk}</div><div class="rv-wl">${wl}</div></div>`}
  let fl='';for(let k=0;k<7;k++){const key=`x${i}_${k}`;const t=p.floor[k];fl+=`<b class="rv-c f" data-s="${key}">${t!=null?bfTile(t,key):''}</b>`}
  const pen=floorPenalty(Math.min(7,p.floor.length));const s=rvSay(S,p);
  return `<div class="rv-hd" style="--pc:${PCOL[i]}">${pc?`<i class="pic" style="background-image:url(media/${pc})"></i>`:'<i></i>'}<b>${esc(p.nm)}</b><span>${p.score}</span>${S.markerIn===i?`<em>${bfSun()}</em>`:''}</div>
    <div class="rv-bd" title="${esc(p.nm)}'s board: racks on the left, wall on the right">${rows}<div class="rv-fl">${fl}${pen?`<span class="rv-pen">${String(pen).replace('-','−')}</span>`:''}</div></div>
    <div class="rv-say"><b>${s.a}</b>${s.b?`<span>${esc(s.b)}</span>`:''}</div>`}
function bfRivDraw(){if(!BF.rvp||!BF.disp)return;const h0=bfRivHTML(BF.disp);const D=document.documentElement;
  // short phone screens and phone landscape: no strip (the kilns need the height); her mini board sits inside her name chip instead
  if(h0&&(D.classList.contains('bf-land')?!D.classList.contains('bf-wide'):D.classList.contains('bf-short'))){BF.rvp.hidden=true;BF.rvp.__h='';BF.root.classList.remove('hasrv');const ch=bfQ(`[data-bfchip="${rvSeat()}"]`);if(!ch)return;
    const t=document.createElement('div');t.innerHTML=h0;const bd=t.querySelector('.rv-bd');if(!bd)return;const f=bd.querySelector('.rv-fl');if(f)f.remove();bd.classList.add('rv-mini');const old=ch.querySelector('.rv-bd');
    if(old){if(old.innerHTML!==bd.innerHTML)old.replaceWith(bd)}else{const b=ch.querySelector('b');if(b)b.replaceWith(bd);else ch.appendChild(bd)}return}
  const h=h0;if(BF.rvp.__h!==h){BF.rvp.innerHTML=h;BF.rvp.__h=h}BF.rvp.hidden=!h;BF.root.classList.toggle('hasrv',!!h)}
// mouse: pointing at a colour on the table shows what she needs of it (no click needed)
function rvHover(e){if(e.pointerType==='touch')return;BF.mouse=1;const t=e.target.closest&&e.target.closest('.bf-table .bf-t[role=button]');let c=null;
  if(t){const k=t.dataset.k;const s=k&&typeof slotSel==='function'?slotSel(k):null;c=s&&s.c<NC?s.c:null}
  if(c!==BF.hov){BF.hov=c;bfRivDraw()}}
// tap help for the red ✗ marks: say why, in words
function rvWhyX(t){const tile=t.closest('.bf-table .bf-t.nofit');if(tile)return 'Red ✗: none of your racks takes this colour';
  const bd=t.closest('.bf-bd.bad');if(bd&&bd.textContent==='✗'&&UI.sel){const row=bd.closest('[data-bfrow]');const hp=me();if(row&&hp){const r=+row.dataset.bfrow;const w=phReason(hp,r,UI.sel.c);
    return `Red ✗: `+(w==='full'?`rack ${r+1} is full`:w.startsWith('holds')?`rack ${r+1} holds ${w.slice(6).toLowerCase()}`:w.startsWith('wall')?`wall row ${r+1} has ${rvCol(UI.sel.c)}`:'no space')}}
  return ''}
// a cheer when your leftovers break on her floor, or your take leaves her rack short (called around bfTake in ui9.js)
function rvPre(x){const S=BF.disp;if(!S||!G)return null;const pl=P(x.p);const q={pl,rv:!!pl&&!pl.human&&!NET.on&&G.pl.some(z=>z.human),f0:S.pl[x.p]?S.pl[x.p].floor.length:0,
    sunIn:x.src<0&&S.markerIn==='ctr',left0:x.src>=0?(S.fac[x.src]||[]).filter(t=>t!==x.c&&t<NC):[],deny:null};
  if(!q.rv&&pl&&pl.human&&S.np===2){const o=S.pl[(x.p+1)%2];const w=rvNeeds(S,o).find(n=>n.c===x.c);if(w){const S2=cloneS(S);applyTake(S2,x.p,{act:'take',src:x.src,c:x.c,j:x.nj||x.c===PRISM?1:0,line:x.line});if(rvCount(S2,x.c)<w.n)q.deny={nm:o.nm,r:w.r}}}
  return q}
function rvPost(x,q){const p=BF.disp.pl[x.p];const brk=p.floor.length-q.f0-(q.sunIn?1:0);
  if(q.rv&&brk>=1&&(x.src<0||(BF.lastLeft||[]).includes(x.c))){const pen=floorPenalty(p.floor.length)-floorPenalty(q.f0);bfBanner(`You forced ${brk} tile${brk>1?'s':''} to ${q.pl.nm}'s floor: ${String(pen).replace('-','−')}`,'Denial pays off');sfx('wall',3)}
  if(q.pl&&q.pl.human){BF.lastLeft=q.left0;if(q.deny){bfBanner(`You blocked ${q.deny.nm}'s rack ${q.deny.r+1}!`,'She needed that colour');sfx('wall',2)}}}
function rvTip(t){BF.tip=t;bfHintSet();clearTimeout(BF.tipT);BF.tipT=setTimeout(()=>{BF.tip=null;bfHintSet()},bfReadMs(t))}
