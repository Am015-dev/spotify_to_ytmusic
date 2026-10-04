// ---------- Sunglaze engine: G is plain JSON; every change goes through validMoves/performMove ----------
var ANIM=1,AIDELAY=650,DEFSEED=null;const SAVE='sgz_save1';
let G=null;const UI={pause:false,speed:1,sel:null,pick:[],fx:[],sim:0};
function rnd(n){let t=(G.rng+=0x6D2B79F5);t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return Math.floor(((t^t>>>14)>>>0)/4294967296*n)}
function setSeed(s){DEFSEED=s>>>0;if(G)G.rng=s>>>0}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function lg(t,c){G.logN=(G.logN||0)+1;G.log.unshift({t,r:G.round,c:c||'',i:G.logN});if(G.log.length>600)G.log.length=600}
function fx(t,x){if(UI.sim)return;UI.fxN=(UI.fxN||0)+1;UI.fx.push({t,x,n:UI.fxN});if(UI.fx.length>60)UI.fx.shift()}
const P=i=>G.pl[i];
const cap=r=>r+1;
const eff=v=>v<0?-1:v<5?v:v>=10&&v<15?v-10:-1;         // colour a wall cell counts as for the no-repeat rules
function lineColour(L){for(const t of L)if(t<5)return t;return -1}
function srcName(src){return src<0?'the courtyard':'kiln '+(src+1)}
function tn(c,n){return n+' '+TNAME[c]+(n===1?' tile':' tiles')}
// ---------- setup ----------
function newGame(o){o=o||{};const seed=DEFSEED!=null?DEFSEED:Math.floor(Math.random()*2**31);const np=Math.max(2,Math.min(4,o.np||(o.seats?o.seats.length:2)));
  const ex=Object.assign({gray:false,prism:false},o.ex||{});
  G={v:1,rng:seed,seed,np,ex,round:0,phase:'offer',log:[],logN:0,over:null,winner:null,winText:'',turn:0,cur:0,first:0,markerIn:'ctr',
    pl:[],fac:[],ctr:[],bag:[],lid:[],wt:null,total:0,counts:[0,0,0,0,0,0],stats:{takes:0,centre:0,floorTiles:0,lidOver:0,refills:0,short:0,prismTakes:0,wallChoices:0,blocked:0,rows:0,cols:0,colours:0,maxChain:0}};
  for(let i=0;i<np;i++)G.pl.push({i,nm:(o.names&&o.names[i])||PNAMES[i],human:o.seats?o.seats[i]==='human':(o.mode==='hot'||(o.mode!=='ai'&&i===0)),lv:(o.lv&&o.lv[i])||'normal',
    score:0,lines:[[],[],[],[],[]],wall:[0,1,2,3,4].map(()=>[-1,-1,-1,-1,-1]),floor:[],st:{place:0,floor:0,rows:0,cols:0,colours:0},last:null});
  const bag=[];const rm=ex.prism?PRISMSET[np].remove:0;for(let c=0;c<NC;c++)for(let k=0;k<PER_COLOUR-rm;k++)bag.push(c);if(ex.prism)for(let k=0;k<PRISMSET[np].add;k++)bag.push(PRISM);
  G.total=bag.length;for(const t of bag)G.counts[t]++;G.bag=shuffle(bag);G.first=rnd(np);
  lg(`A new atelier opens for ${np} glaziers${ex.gray?' on unmarked mosaics':''}${ex.prism?' with prism tiles':''}. ${P(G.first).nm} holds the Sun token.`,'big');
  newRound();if(typeof refresh==='function')refresh()}
function draw(){if(!G.bag.length){if(!G.lid.length)return -1;G.bag=shuffle(G.lid);G.lid=[];G.stats.refills++;lg('The clay sack is empty: every tile in the shard box goes back into the sack.','bad');fx('refill')}return G.bag.pop()}
function newRound(){G.round++;G.markerIn='ctr';G.ctr=[];G.fac=[];let short=false;
  for(let f=0;f<FACTORIES[G.np];f++){const a=[];for(let k=0;k<PER_FACTORY;k++){const t=draw();if(t<0){short=true;break}a.push(t)}G.fac.push(a)}
  if(short){G.stats.short++;lg('The sack and the shard box have run dry: some kilns stay short this round.','bad')}
  G.cur=G.first;G.phase='offer';G.wt=null;G.lastSumTurn=G.turn;
  if(G.fac.every(a=>!a.length)){lg('No tiles are left anywhere to hand out: the atelier closes.','big');return finish()}
  lg(`— Round ${G.round}: the kilns are loaded. ${P(G.first).nm} starts. —`,'round');fx('round')}
// ---------- the offer: take one glaze from one kiln or the courtyard ----------
// the take sets at a place: {src,c,j}: c a glaze (j=1 also takes the prisms there), or c=PRISM for the prisms alone
function takeSets(S){const o=[];const srcs=S.fac.map((a,i)=>[i,a]).concat([[-1,S.ctr]]);
  for(const [src,a] of srcs){if(!a.length)continue;const has=[0,0,0,0,0,0];for(const t of a)has[t]++;
    for(let c=0;c<NC;c++)if(has[c]){o.push({src,c,j:0});if(has[PRISM])o.push({src,c,j:1})}if(has[PRISM])o.push({src,c:PRISM,j:1})}return o}
function rowHas(p,r,col){return p.wall[r].some(v=>eff(v)===col)}
// can these tiles (glaze c or prisms only) go on rack r of player p?
function lineOk(S,p,r,c){const L=p.lines[r];if(L.length>=cap(r))return false;const lc=lineColour(L);const X=c<NC?c:-1;
  if(X>=0&&lc>=0&&lc!==X)return false;const Y=X>=0?X:lc;if(Y>=0&&rowHas(p,r,Y))return false;if(Y<0&&!p.wall[r].some(v=>v<0))return false;return true}
function legalTakes(S,seat){const p=S.pl[seat];const o=[];for(const s of takeSets(S)){for(let r=0;r<5;r++)if(lineOk(S,p,r,s.c))o.push({act:'take',src:s.src,c:s.c,j:s.j,line:r});o.push({act:'take',src:s.src,c:s.c,j:s.j,line:5})}return o}
function placeFloor(S,p,t,info){if(p.floor.length<7){p.floor.push(t);if(info)info.fl++}else{S.lid.push(t);if(info)info.lid++}}
// apply a take to state S (also used by the computer on copies); returns what happened
function applyTake(S,seat,m){const p=S.pl[seat];const a=m.src<0?S.ctr:S.fac[m.src];const got=[],rest=[];
  for(const t of a){if(t===m.c||(t===PRISM&&(m.j||m.c===PRISM)))got.push(t);else rest.push(t)}
  const info={n:got.length,nj:got.filter(t=>t===PRISM).length,line:0,fl:0,lid:0,sun:false};
  if(m.src<0){S.ctr=rest;if(S.markerIn==='ctr'){S.markerIn=seat;info.sun=true;if(p.floor.length>=7){S.lid.push(p.floor.pop());info.lid++}p.floor.push(SUN)}}
  else{S.fac[m.src]=[];S.ctr=S.ctr.concat(rest)}
  got.sort((x,y)=>x-y);// glazes before prisms: if not everything fits, prisms overflow first
  for(const t of got){if(m.line<5&&p.lines[m.line].length<cap(m.line)){p.lines[m.line].push(t);info.line++}else placeFloor(S,p,t,info)}
  return info}
function offerEmpty(){return !G.ctr.length&&G.fac.every(a=>!a.length)}
function doTake(m,seat){const p=P(seat);const info=applyTake(G,seat,m);G.turn++;G.stats.takes++;if(m.src<0)G.stats.centre++;G.stats.floorTiles+=info.fl;G.stats.lidOver+=info.lid;if(info.nj)G.stats.prismTakes++;
  const what=m.c===PRISM?tn(PRISM,info.n):info.nj&&m.c<NC?`${tn(m.c,info.n-info.nj)} and ${tn(PRISM,info.nj)}`:tn(m.c,info.n);
  lg(`${p.nm} takes ${what} from ${srcName(m.src)}${m.line<5?` onto rack ${m.line+1}`:' straight to breakage'}${m.line<5&&(info.fl||info.lid)?` (${info.fl+info.lid} overflow to breakage)`:''}${info.sun?'; takes the Sun token (−1 slot)':''}${info.lid?`; ${info.lid} into the shard box`:''}.`,info.fl||info.lid||m.line===5?'bad':'');
  p.last={src:m.src,c:m.c,line:m.line};fx('take',{p:seat,src:m.src,c:m.c,line:m.line,n:info.n,nj:info.nj,br:info.fl+info.lid,sun:info.sun});if(info.fl||info.lid)fx('floor',seat);if(info.sun)fx('sun',seat);
  if(offerEmpty()){beginWall();return}G.cur=(G.cur+1)%G.np}
// ---------- wall-tiling ----------
function wallCells(p,r){const L=p.lines[r];const lc=lineColour(L);const o=[];
  if(!G.ex.gray){if(lc>=0){const c=WALLCOL(lc,r);if(p.wall[r][c]<0)o.push(c)}else for(let c=0;c<5;c++)if(p.wall[r][c]<0)o.push(c);return o}
  for(let c=0;c<5;c++){if(p.wall[r][c]>=0)continue;if(lc>=0&&(rowHas(p,r,lc)||p.wall.some(row=>eff(row[c])===lc)))continue;o.push(c)}return o}
// the row and column lines a set tile joins, for explaining its points
function runsAt(w,r,c){let h=1,v=1;for(let x=c-1;x>=0&&w[r][x]>=0;x--)h++;for(let x=c+1;x<5&&w[r][x]>=0;x++)h++;for(let y=r-1;y>=0&&w[y][c]>=0;y--)v++;for(let y=r+1;y<5&&w[y][c]>=0;y++)v++;return [h,v]}
function adjPts(wall,r,c){let h=1,v=1;for(let x=c-1;x>=0&&wall[r][x]>=0;x--)h++;for(let x=c+1;x<5&&wall[r][x]>=0;x++)h++;for(let y=r-1;y>=0&&wall[y][c]>=0;y--)v++;for(let y=r+1;y<5&&wall[y][c]>=0;y++)v++;
  if(h===1&&v===1)return 1;return (h>1?h:0)+(v>1?v:0)}
function beginWall(){G.phase='wall';const order=[];for(let k=0;k<G.np;k++)order.push((G.first+k)%G.np);G.wt={order,k:0,r:0,q:null};G.rsum=G.pl.map(()=>({place:0,floor:0,n:0}));lg('— The offer is empty: tiles move to the mosaics. —','round');fx('wallphase');runWall()}
function runWall(){const W=G.wt;while(W.k<W.order.length){const p=P(W.order[W.k]);
    while(W.r<5){const r=W.r;if(p.lines[r].length===cap(r)){const cells=wallCells(p,r);
        if(!cells.length){lineToFloor(p,r);W.r++;continue}
        if(cells.length===1){placeWall(p,r,cells[0]);W.r++;continue}
        W.q={p:p.i,r,cells};G.stats.wallChoices++;return}W.r++}
    W.k++;W.r=0}
  W.q=null;scoreFloors();endRound()}
function lineToFloor(p,r){const L=p.lines[r];p.lines[r]=[];const info={fl:0,lid:0};for(const t of L)placeFloor(G,p,t,info);G.stats.blocked++;
  lg(`${p.nm}'s rack ${r+1} has no legal space on the unmarked mosaic: all ${L.length} tiles drop to breakage.`,'bad');fx('floor',p.i)}
function placeWall(p,r,c){const L=p.lines[r];const lc=lineColour(L);const k=L.indexOf(PRISM);let v;
  if(k>=0){L.splice(k,1);v=lc>=0?10+lc:G.ex.gray?15:10+WALLC(r,c)}else{L.pop();v=lc}
  p.wall[r][c]=v;G.lid.push(...L);p.lines[r]=[];const pts=adjPts(p.wall,r,c);p.score+=pts;p.st.place+=pts;if(G.rsum){G.rsum[p.i].place+=pts;G.rsum[p.i].n++}if(pts>G.stats.maxChain)G.stats.maxChain=pts;
  lg(`${p.nm} sets a ${k>=0?'Prism':TNAME[lc]} tile in mosaic row ${r+1}${G.ex.gray||lc<0?', column '+(c+1):''}: +${pts}.`,'good');fx('wall',{p:p.i,r,c,pts,run:runsAt(p.wall,r,c)})}
function floorPenalty(n){let s=0;for(let i=0;i<Math.min(7,n);i++)s+=FLOOR[i];return s}
function scoreFloors(){for(const p of G.pl){if(!p.floor.length)continue;const pen=floorPenalty(p.floor.length);const loss=Math.min(p.score,-pen);p.score-=loss;p.st.floor-=loss;if(G.rsum)G.rsum[p.i].floor-=loss;
    if(p.floor.includes(SUN))G.first=p.i;const tiles=p.floor.filter(t=>t!==SUN);G.lid.push(...tiles);
    lg(`${p.nm} loses ${-pen} for breakage${loss<-pen?` (only ${loss}: a score never drops below 0)`:''}.`,'bad');p.floor=[]}
  if(G.markerIn!=='ctr')G.markerIn='ctr'}
function fullRows(p){return p.wall.filter(row=>row.every(v=>v>=0)).length}
function endRound(){if(G.pl.some(p=>fullRows(p)>0)){lg('A mosaic row is complete: the atelier closes after this round.','big');return finish()}newRound()}
// ---------- end of game ----------
function endBonus(p){let rows=0,cols=0,colours=0;for(let r=0;r<5;r++)if(p.wall[r].every(v=>v>=0))rows++;for(let c=0;c<5;c++)if(p.wall.every(row=>row[c]>=0))cols++;
  for(let k=0;k<NC;k++)if(p.wall.reduce((a,row)=>a+row.filter(v=>v===k).length,0)===5)colours++;return {rows,cols,colours}}
function finish(){if(G.over)return;for(const p of G.pl){const b=endBonus(p);p.st.rows=b.rows*BONUS.row;p.st.cols=b.cols*BONUS.col;p.st.colours=b.colours*BONUS.colour;p.score+=p.st.rows+p.st.cols+p.st.colours;p.fr=b.rows;
    G.stats.rows+=b.rows;G.stats.cols+=b.cols;G.stats.colours+=b.colours;
    if(b.rows+b.cols+b.colours)lg(`${p.nm} earns end bonuses: ${b.rows} row${b.rows===1?'':'s'} (+${p.st.rows}), ${b.cols} column${b.cols===1?'':'s'} (+${p.st.cols}), ${b.colours} full glaze${b.colours===1?'':'s'} (+${p.st.colours}).`,'good')}
  const sc=G.pl.slice().sort((a,b)=>b.score-a.score||b.fr-a.fr);const top=sc[0];const winners=sc.filter(p=>p.score===top.score&&p.fr===top.fr);
  G.over={scores:sc.map(p=>({p:p.i,s:Object.assign({total:p.score,fr:p.fr},p.st)})),win:winners.map(w=>w.i),tie:sc.filter(p=>p.score===top.score).length>1};G.winner=winners.map(w=>w.nm).join(' & ');
  G.winText=`${G.winner} ${winners.length>1?'share the win':'wins'} with ${top.score} points${G.over.tie&&winners.length===1?' (more finished rows breaks the tie)':''}.`;G.phase='over';G.wt=null;lg('🏆 '+G.winText,'big');fx('win')}
// ---------- the API ----------
function sideToAct(){if(!G||G.over)return -1;if(G.phase==='offer')return G.cur;if(G.phase==='wall'&&G.wt&&G.wt.q)return G.wt.q.p;return -1}
function validMoves(s){if(!G||G.over)return[];if(s===undefined)s=sideToAct();if(s<0||s!==sideToAct())return[];
  if(G.phase==='offer')return legalTakes(G,s);if(G.phase==='wall')return G.wt.q.cells.map(c=>({act:'wall',r:G.wt.q.r,c}));return[]}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function performMove(m,s){if(s===undefined)s=sideToAct();if(!m||!validMoves(s).some(x=>same(x,m)))return {success:false,error:'illegal move '+JSON.stringify(m)};
  if(m.act==='take')doTake(m,s);else if(m.act==='wall'){const p=P(s);placeWall(p,m.r,m.c);G.wt.q=null;G.wt.r++;runWall()}
  if(typeof refresh==='function'&&!UI.sim)refresh();return {success:true}}
function scoreOf(p){return {total:p.score}}
// ---------- invariants and test hooks ----------
function checkInvariants(){const v=[];if(!G)return v;const cnt=[0,0,0,0,0,0];let sun=0;const add=t=>{if(t===SUN){sun++;return}if(t>=0&&t<6)cnt[t]++;else v.push('bad tile '+t)};
  G.bag.forEach(add);G.lid.forEach(add);G.fac.forEach(a=>a.forEach(add));G.ctr.forEach(add);
  for(const p of G.pl){p.lines.forEach((L,r)=>{L.forEach(add);if(L.length>cap(r))v.push(p.nm+' rack '+(r+1)+' overfull');const cs=new Set(L.filter(t=>t<5));if(cs.size>1)v.push(p.nm+' rack '+(r+1)+' mixes glazes');
      const lc=lineColour(L);if(lc>=0&&rowHas(p,r,lc)&&!(G.phase==='wall'))v.push(p.nm+' rack '+(r+1)+' holds a glaze its row already has');});
    p.floor.forEach(add);if(p.floor.length>7)v.push(p.nm+' breakage over 7');if(p.score<0)v.push(p.nm+' score negative');
    for(let r=0;r<5;r++)for(let c=0;c<5;c++){const x=p.wall[r][c];if(x<0)continue;if(x<5)cnt[x]++;else if(x>=10&&x<=15)cnt[PRISM]++;else v.push('bad wall value '+x);
      if(!G.ex.gray&&x<5&&WALLC(r,c)!==x)v.push(p.nm+' glaze on the wrong mosaic space');if(!G.ex.gray&&x>=10&&x<15&&x-10!==WALLC(r,c))v.push(p.nm+' prism colour mismatch')}
    for(let k=0;k<5;k++){const e=[0,0,0,0,0].map((_,i)=>eff(p.wall[k][i])).filter(x=>x>=0);if(new Set(e).size!==e.length)v.push(p.nm+' repeats a glaze in row '+(k+1));
      const f=[0,0,0,0,0].map((_,i)=>eff(p.wall[i][k])).filter(x=>x>=0);if(new Set(f).size!==f.length)v.push(p.nm+' repeats a glaze in column '+(k+1))}}
  for(let t=0;t<6;t++)if(cnt[t]!==G.counts[t])v.push(`${TNAME[t]} tiles ${cnt[t]} != ${G.counts[t]}`);
  const sunWant=G.markerIn==='ctr'?0:1;if(sun!==sunWant)v.push('sun token count '+sun+' (marker '+G.markerIn+')');
  if(G.markerIn!=='ctr'&&!P(G.markerIn).floor.includes(SUN))v.push('sun token not with its holder');
  if(!G.over&&sideToAct()<0)v.push('stuck in '+G.phase);if(!G.over&&!validMoves().length)v.push('no legal move in '+G.phase);
  if(G.phase==='offer'&&offerEmpty())v.push('offer empty but still in offer');return v}
function render_game_to_text(){if(!G)return '{}';return JSON.stringify({round:G.round,phase:G.phase,cur:sideToAct(),fac:G.fac,ctr:G.ctr,sun:G.markerIn,bag:G.bag.length,lid:G.lid.length,
  pl:G.pl.map(p=>({nm:p.nm,score:p.score,lines:p.lines,wall:p.wall,floor:p.floor})),q:G.wt&&G.wt.q,log:G.log.slice(0,5).map(l=>l.t),over:G.winText||null})}
