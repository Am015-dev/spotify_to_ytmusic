// ---------- computer glaziers ----------
// easy: greedy on the immediate gain, with frequent slips
// normal: greedy with the breakage cost and a look at the best take left for the next player
// hard: two-ply lookahead (me, the next rival's best replies, my follow-up), which also rewards denial
const LVL={easy:{slip:.3,top:4},normal:{alpha:.55},hard:{alpha:.6,K:10,roll:2}};
function aRand(n){return Math.floor(Math.random()*n)}
function endNear(S){// will the game end after this round? (someone has a row one tile short with that rack complete or nearly)
  return S.pl.some(p=>p.wall.some((row,r)=>row.filter(v=>v>=0).length===4&&p.lines[r].length>=cap(r)-1))}
// value of a tile landing on (r,c): chain points plus a little for the end bonuses it builds toward
function cellValue(S,p,r,c,col){const pts=adjPts2(p.wall,r,c);let rowN=0,colN=0,glN=0;for(let x=0;x<5;x++){if(p.wall[r][x]>=0)rowN++;if(p.wall[x][c]>=0)colN++}
  if(col>=0)for(let y=0;y<5;y++)for(let x=0;x<5;x++)if(p.wall[y][x]===col)glN++;
  const late=Math.min(1,.35+S.round*.13);return pts+late*(rowN*.35+(rowN===4?1.2:0)+colN*.9+(colN===4?3:0)+(col>=0?glN*1.1+(glN===4?4:0):0))}
function adjPts2(wall,r,c){const saved=wall[r][c];wall[r][c]=99;const v=adjPts(wall,r,c);wall[r][c]=saved;return v}
function bestCell(S,p,r,col){// best legal space for glaze col (or prisms only) in row r, on the current mosaic
  let best=-1,bv=-1e9;for(let c=0;c<5;c++){if(p.wall[r][c]>=0)continue;
    if(!S.ex.gray){if(col>=0&&c!==WALLCOL(col,r))continue}
    else if(col>=0&&p.wall.some(row=>eff(row[c])===col))continue;
    let v=cellValue(S,p,r,c,col);if(S.ex.gray&&col>=0)v+=(c===WALLCOL(col,r)?.6:0)+colFreedom(p,c,col)*.15;if(v>bv){bv=v;best=c}}return {c:best,v:bv}}
function colFreedom(p,c,col){let f=0;for(let k=0;k<5;k++)if(k!==col&&!p.wall.some(row=>eff(row[c])===k))f++;return f}
function lineTerm(S,p,r,L,near){const n=L.length;if(!n)return 0;const lc=lineColour(L);const b=bestCell(S,p,r,lc);
  if(b.c<0)return -2*n;const k=cap(r);if(n===k)return b.v;if(near)return -.2*n;
  const need=k-n;let avail=0;if(lc>=0){for(const a of S.fac)for(const t of a)if(t===lc||t===PRISM)avail++;for(const t of S.ctr)if(t===lc||t===PRISM)avail++}
  const w=avail>=need?.72:.45;return b.v*w*(n/k)+.25*n-.12*need}
function gainOf(S,seat,m,near){const p=S.pl[seat];const a=m.src<0?S.ctr:S.fac[m.src];let n=0,nj=0;for(const t of a){if(t===m.c&&m.c<NC)n++;else if(t===PRISM&&(m.j||m.c===PRISM))nj++}
  let fl=p.floor.length;let v=0;const sun=m.src<0&&S.markerIn==='ctr';if(sun){fl++;v+=near?0:.9}
  let over=n+nj;if(m.line<5){const L=p.lines[m.line];const room=cap(m.line)-L.length;const put=Math.min(room,over);const nl=L.slice();const add=[];for(let i=0;i<n;i++)add.push(m.c);for(let i=0;i<nj;i++)add.push(PRISM);
    nl.push(...add.slice(0,put));over-=put;v+=lineTerm(S,p,m.line,nl,near)-lineTerm(S,p,m.line,L,near)}
  const f0=p.floor.length;v+=floorPenalty(fl+over)-floorPenalty(f0);if(nj&&m.line<5)v-=.4*nj;
  const K=(AIWS&&AIWS[seat])||AIW;if(K.flex&&m.line<5){let left=0;for(const a of S.fac)left+=a.length;left+=S.ctr.length;left-=n+nj;
    if(left>0){const L=p.lines[m.line];const nl=L.concat(Array(Math.min(cap(m.line)-L.length,n+nj)).fill(m.c<NC?m.c:PRISM));v+=K.flex*Math.min(1,left/12)*(flexOf(p,m.line,nl)-flexOf(p,m.line,L))}}
  return v}
var AIW={flex:.6},AIWS=null;
// how many more tiles of each glaze my racks could still take (capped), a measure of room to avoid forced breakage
function flexOf(p,rr,LL){let f=0;for(let k=0;k<NC;k++){let room=0;for(let r=0;r<5;r++){const L=r===rr?LL:p.lines[r];const lc=lineColour(L);if(L.length>=cap(r))continue;if(lc>=0&&lc!==k)continue;if(lc<0&&rowHas(p,r,k))continue;room+=cap(r)-L.length}f+=Math.min(room,4)}return f}
function candidates(S,seat,near){const ms=legalTakes(S,seat);for(const m of ms)m.g=gainOf(S,seat,m,near);ms.sort((a,b)=>b.g-a.g);return ms}
function cloneS(S){return {ex:S.ex,np:S.np,round:S.round,markerIn:S.markerIn,fac:S.fac.map(a=>a.slice()),ctr:S.ctr.slice(),lid:S.lid.slice(),pl:S.pl.map(p=>({i:p.i,score:p.score,wall:p.wall,lines:p.lines.map(l=>l.slice()),floor:p.floor.slice()}))}}
function emptyS(S){return !S.ctr.length&&S.fac.every(a=>!a.length)}
function bestGain(S,seat,near){if(emptyS(S))return 0;let b=-1e9;for(const m of legalTakes(S,seat)){const g=gainOf(S,seat,m,near);if(g>b)b=g}return b}
const strip=m=>({act:'take',src:m.src,c:m.c,j:m.j,line:m.line});
function aiTake(seat){const p=P(seat);const near=endNear(G);const lv=p.lv||'normal';const ms=candidates(G,seat,near);if(!ms.length)return null;
  if(lv==='easy'){const L=LVL.easy;if(Math.random()<L.slip){const pool=Math.random()<.35?ms:ms.slice(0,L.top);return strip(pool[aRand(pool.length)])}return strip(ms[0])}
  const nx=(seat+1)%G.np;
  if(lv==='normal'){const a=LVL.normal.alpha;let best=null,bv=-1e9;for(const m of ms.slice(0,14)){const S=cloneS(G);applyTake(S,seat,m);const v=m.g-a*bestGain(S,nx,near)+(Math.random()*.05);if(v>bv){bv=v;best=m}}return strip(best)}
  const H=LVL.hard;let best=null,bv=-1e9;const base=endValues(G,near);
  for(const m of ms.slice(0,H.K)){let tot=0;for(let k=0;k<H.roll;k++){const S=cloneS(G);applyTake(S,seat,m);rollout(S,nx,near,k);const ev=endValues(S,near);
      let opp=-1e9;for(let q=0;q<G.np;q++)if(q!==seat)opp=Math.max(opp,ev[q]-base[q]);tot+=(ev[seat]-base[seat])-H.alpha*opp}
    const v=tot/H.roll+Math.random()*.03;if(v>bv){bv=v;best=m}}
  return strip(best)}
function aiWall(seat){const q=G.wt.q;const p=P(seat);const L=p.lines[q.r];const lc=lineColour(L);
  if(p.lv==='easy'&&Math.random()<.4)return {act:'wall',r:q.r,c:q.cells[aRand(q.cells.length)]};
  let best=q.cells[0],bv=-1e9;for(const c of q.cells){let v=cellValue(G,p,q.r,c,lc);if(G.ex.gray&&lc>=0)v+=(c===WALLCOL(lc,q.r)?.6:0)+colFreedom(p,c,lc)*.15;
    // keep later racks placeable: count how many of my other full/nearly-full racks still fit after this
    if(G.ex.gray)for(let r=q.r+1;r<5;r++){const lr=lineColour(p.lines[r]);if(lr<0)continue;const saved=p.wall[q.r][c];p.wall[q.r][c]=lc>=0?lc:15;const ok=wallCells(p,r).length;p.wall[q.r][c]=saved;if(!ok)v-=3*p.lines[r].length}
    if(v>bv){bv=v;best=c}}return {act:'wall',r:q.r,c:best}}
function aiMove(seat){if(seat===undefined)seat=sideToAct();if(seat<0)return null;if(G.phase==='wall')return aiWall(seat);return aiTake(seat)}
// hard: play out the rest of the round greedily for everyone, then value each player's racks, mosaic gains and breakage
function rollout(S,seat,near,noise){let n=0;while(!emptyS(S)&&n++<80){const ms=legalTakes(S,seat);let b=null,bv=-1e9;for(const m of ms){const v=gainOf(S,seat,m,near)+(noise?Math.random()*.6:0);if(v>bv){bv=v;b=m}}applyTake(S,seat,b);seat=(seat+1)%S.np}}
function endValues(S,near){return S.pl.map(p=>{let v=floorPenalty(p.floor.length);const saved=[];
  for(let r=0;r<5;r++){const L=p.lines[r];if(L.length===cap(r)){const b=bestCell(S,p,r,lineColour(L));if(b.c<0){v-=2*L.length;continue}v+=b.v;saved.push([r,b.c]);p.wall[r][b.c]=99}else v+=near?0:lineTerm(S,p,r,L,near)*.8}
  for(const [r,c] of saved)p.wall[r][c]=-1;return v})}
