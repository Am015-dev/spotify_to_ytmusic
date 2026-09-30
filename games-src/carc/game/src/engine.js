// ---------- Rampart & Vine engine: G is plain JSON; every change goes through validMoves/performMove ----------
// Feature graph: every town/road/field/priory piece of every placed tile is a "segment"; segments are merged with
// union-find across matching tile edges (towns/roads by edge, fields by half-edge). Each root keeps the feature summary.
var ANIM=1,AIDELAY=650,DEFSEED=null;const SAVE='rv_save1';
let G=null;const UI={pause:false,speed:1,fx:[],sim:0};
function rnd(n){let t=(G.rng+=0x6D2B79F5);t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return Math.floor(((t^t>>>14)>>>0)/4294967296*n)}
function setSeed(s){DEFSEED=s>>>0;if(G)G.rng=s>>>0}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function lg(t,c){G.logN=(G.logN||0)+1;G.log.unshift({t,n:G.turn,c:c||'',i:G.logN});if(G.log.length>600)G.log.length=600}
function fx(t,x){if(UI.sim)return;UI.fx.push({t,x});if(UI.fx.length>60)UI.fx.shift()}
const P=i=>G.pl[i];
const PNAMES=['Garnet','Cobalt','Amber','Olive','Sable','Lilac'];
const DX=[0,1,0,-1],DY=[-1,0,1,0],OPP=s=>(s+2)%4,SIDE=['north','east','south','west'];
const key=(x,y)=>x+','+y;const unkey=k=>k.split(',').map(Number);
const TSEG=TT.map((_,t)=>tileSegs(t));
// local lookup: which town/road segment owns a side, which field owns a half-edge
const SIDESEG=TT.map((d,t)=>{const o=[-1,-1,-1,-1];TSEG[t].forEach((s,i)=>{if(s.ty==='C'||s.ty==='R')for(const e of s.e)o[e]=i});return o});
const HALFSEG=TT.map((d,t)=>{const o=Array(8).fill(-1);TSEG[t].forEach((s,i)=>{if(s.ty==='F')for(const h of s.h)o[h]=i});return o});
const edgeT=(t,r,s)=>TT[t].e[(s-r+4)%4];
const isRiver=t=>TT[t].V.length>0;
const FIGN={f:'follower',big:'champion',bld:'mason',pig:'hog'};
const ROLE={C:'warden',R:'wayfarer',M:'brother',F:'farmer'};
const FEAT={C:'town',R:'road',M:'priory',F:'field'};
const SETN={base:'Base game',river:'The Riverlands',ic:'Taverns & Basilicas',tb:'Merchants & Masons'};
const GOODS=['wine','grain','cloth'];
// ---------- setup ----------
function newGame(o){o=o||{};const seed=DEFSEED!=null?DEFSEED:Math.floor(Math.random()*2**31);const ex=Object.assign({river:false,ic:false,tb:false},o.ex||{});
  let np=o.np||(o.seats?o.seats.length:2);if(np>5&&!ex.ic)np=5;
  G={v:1,rng:seed,seed,np,ex,turn:0,pl:[],log:[],logN:0,over:null,winner:null,winText:'',tiles:{},order:[],frontier:{},sk:[],sl:[],par:[],fd:{},figs:[],
    stack:[],rstack:[],lake:null,disc:[],rv:null,cur:null,step:null,total:0,halfway:false,stats:{placed:0,discards:0,bonus:0,scored:{}},story:[]};
  for(let i=0;i<np;i++){const seat=o.seats?o.seats[i]:(o.mode==='hot'||(o.mode!=='ai'&&i===0))?'human':'ai';
    G.pl.push({i,nm:(o.names&&o.names[i])||PNAMES[i],human:seat==='human',lv:(o.lv&&o.lv[i])||'normal',score:0,
      sup:{f:7,big:ex.ic?1:0,bld:ex.tb?1:0,pig:ex.tb?1:0},goods:{wine:0,grain:0,cloth:0},sc:{road:0,town:0,priory:0,field:0,goods:0},end:{road:0,town:0,priory:0,field:0,goods:0}})}
  G.figTotal=G.pl.map(p=>Object.assign({},p.sup));
  const main=[];let start=-1,spring=-1,lake=-1;const river=[];
  TT.forEach((d,t)=>{if(d.set==='base'||(d.set==='ic'&&ex.ic)||(d.set==='tb'&&ex.tb)){for(let c=0;c<d.c;c++){if(d.start&&!ex.river&&start<0){start=t;continue}main.push(t)}}
    if(d.set==='river'&&ex.river){if(d.spring)spring=t;else if(d.lake)lake=t;else for(let c=0;c<d.c;c++)river.push(t)}});
  G.stack=shuffle(main);G.total=main.length+(ex.river?river.length+2:1);
  if(ex.river){G.rstack=shuffle(river);G.lake=lake;place(spring,0,0,0);G.rv={x:0,y:0,d:1,lt:0};lg('The river rises at its spring. River tiles come first; each must carry the river on, and it may not turn the same way twice in a row.','big')}
  else place(start,0,0,0);
  G.cur={p:G.np-1};lg(`A new valley waits for ${np} settlers${exList()}.`,'big');nextPlayer(true);if(typeof refresh==='function')refresh()}
function exList(){const l=Object.keys(G.ex).filter(k=>G.ex[k]).map(k=>SETN[k]);return l.length?' with '+l.join(', '):''}
// ---------- union-find over segments ----------
function find(a){let r=a;while(G.par[r]!==r)r=G.par[r];while(G.par[a]!==r){const n=G.par[a];G.par[a]=r;a=n}return r}
function segWorld(t,r,i){const s=TSEG[t][i];return s.e?s.e.map(e=>(e+r)%4):null}
function initFd(t,r,i,x,y){const s=TSEG[t][i],k=key(x,y);
  if(s.ty==='C'){const g={wine:0,grain:0,cloth:0};if(s.g)g[s.g]++;return {ty:'C',tiles:[k],oe:segWorld(t,r,i).map(e=>k+','+e),pen:s.p,gd:g,cat:s.cat,done:0}}
  if(s.ty==='R')return {ty:'R',tiles:[k],oe:segWorld(t,r,i).map(e=>k+','+e),inn:s.inn,done:0};
  if(s.ty==='F')return {ty:'F',tiles:[k],ct:[]};
  return {ty:'M',x,y,done:0}}
function merge(a,b){const ra=find(a),rb=find(b);if(ra===rb)return ra;const A=G.fd[ra],B=G.fd[rb];
  for(const k of B.tiles)if(!A.tiles.includes(k))A.tiles.push(k);
  if(A.ty==='C'){A.oe=A.oe.concat(B.oe);A.pen+=B.pen;for(const g of GOODS)A.gd[g]+=B.gd[g];A.cat=A.cat||B.cat}
  else if(A.ty==='R'){A.oe=A.oe.concat(B.oe);A.inn=A.inn||B.inn}
  else if(A.ty==='F')A.ct=A.ct.concat(B.ct);
  delete G.fd[rb];G.par[rb]=ra;return ra}
function place(t,r,x,y){const k=key(x,y),s0=G.sk.length;G.tiles[k]={t,r,s0,n:G.order.length};G.order.push(k);delete G.frontier[k];
  TSEG[t].forEach((s,i)=>{G.sk.push(k);G.sl.push(i);G.par.push(s0+i);G.fd[s0+i]=initFd(t,r,i,x,y)});
  TSEG[t].forEach((s,i)=>{if(s.ty==='F')for(const c of s.ac)G.fd[s0+i].ct.push(s0+c)});
  for(let s=0;s<4;s++){const nk=key(x+DX[s],y+DY[s]),N=G.tiles[nk];if(!N){if(!G.frontier[nk])G.frontier[nk]=1;continue}
    const ty=edgeT(t,r,s);
    if(ty==='C'||ty==='R'){const a=s0+SIDESEG[t][(s-r+4)%4],b=N.s0+SIDESEG[N.t][(OPP(s)-N.r+4)%4];const root=merge(a,b);const e1=k+','+s,e2=nk+','+OPP(s);G.fd[root].oe=G.fd[root].oe.filter(e=>e!==e1&&e!==e2)}
    for(const [hh,nh] of [[2*s,2*OPP(s)+1],[2*s+1,2*OPP(s)]]){const a=HALFSEG[t][(hh-2*r+8)%8],b=HALFSEG[N.t][(nh-2*N.r+8)%8];if(a>=0&&b>=0)merge(s0+a,N.s0+b)}}
  G.stats.placed++}
// ---------- placement rules ----------
function canPlace(t,r,x,y){const k=key(x,y);if(G.tiles[k])return false;let nb=0;
  for(let s=0;s<4;s++){const N=G.tiles[key(x+DX[s],y+DY[s])];if(!N)continue;nb++;if(edgeT(t,r,s)!==edgeT(N.t,N.r,OPP(s)))return false}
  if(!nb)return false;
  if(isRiver(t)){const rv=G.rv;if(!rv)return false;if(x!==rv.x+DX[rv.d]||y!==rv.y+DY[rv.d])return false;const ws=TT[t].V[0].map(e=>(e+r)%4);if(!ws.includes(OPP(rv.d)))return false;
    if(ws.length===2){const nd=ws.find(e=>e!==OPP(rv.d));const turn=(nd-rv.d+4)%4;if(turn===2)return false;const lt=turn===1?1:turn===3?-1:0;if(lt&&lt===rv.lt)return false}}
  return true}
function riverTurn(t,r){const rv=G.rv;const ws=TT[t].V[0].map(e=>(e+r)%4);if(ws.length<2)return {nd:null,lt:0};const nd=ws.find(e=>e!==OPP(rv.d));const turn=(nd-rv.d+4)%4;return {nd,lt:turn===1?1:turn===3?-1:0}}
function legalPlacements(t){const o=[];const sym=symRots(t);for(const k in G.frontier){const [x,y]=unkey(k);for(const r of sym)if(canPlace(t,r,x,y))o.push({x,y,r})}return o}
// rotations that give a different tile (a straight road looks the same turned twice); all four for river tiles (the U-turn rule cares)
const SYMR=TT.map((d,t)=>{const seen=new Set(),o=[];for(let r=0;r<4;r++){const sig=JSON.stringify(TSEG[t].map(s=>s.e?s.e.map(e=>(e+r)%4).sort():s.h?s.h.map(h=>(h+2*r)%8).sort():'M'))+JSON.stringify([0,1,2,3].map(s=>edgeT(t,r,s)));if(d.V.length||!seen.has(sig)){seen.add(sig);o.push(r)}}return o});
function symRots(t){return SYMR[t]}
// ---------- turns ----------
function drawNext(){if(G.rstack.length)return G.rstack.shift();if(G.lake!=null){const t=G.lake;G.lake=null;return t}if(G.stack.length)return G.stack.shift();return null}
function tilesLeft(){return G.stack.length+G.rstack.length+(G.lake!=null?1:0)}
function nextPlayer(first){const p=first?0:(G.cur.p+1)%G.np;startTurn(p,false)}
function startTurn(p,bonus){if(G.over)return;let t;
  while(true){t=drawNext();if(t==null){finish();return}
    if(legalPlacements(t).length)break;
    if(isRiver(t)&&G.rstack.length&&G.rstack.some(x=>x!==t)){G.rstack.push(t);lg(`The river tile “${TT[t].n}” fits nowhere yet; it goes back under the river pile.`);continue}
    G.disc.push(t);G.stats.discards++;lg(`No legal place for “${TT[t].n}”: it is set aside and a new tile is drawn.`,'bad');fx('discard')}
  G.turn++;G.cur={p,t,bonus:!!bonus,k:null,bonusEarned:false,figPlaced:null,scored:[]};G.step='place';
  if(!G.halfway&&tilesLeft()<=Math.floor(G.total/2)){G.halfway=true;storyBeat('half')}
  lg(`— ${P(p).nm}${bonus?' (mason’s extra turn)':''} draws “${TT[t].n}” —`,'turn');fx('turn',p)}
function doPlace(m){const c=G.cur,p=P(c.p),t=c.t;const wasRv=isRiver(t)&&G.rv?riverTurn(t,m.r):null;
  place(t,m.r,m.x,m.y);c.k=key(m.x,m.y);G.step='fig';
  if(wasRv){if(TT[t].V[0].length===1)G.rv=null;else G.rv={x:m.x,y:m.y,d:wasRv.nd,lt:wasRv.lt||G.rv.lt}}
  if(TT[t].lake){lg('The river reaches its pond. Now the ordinary tiles begin.','big')}
  lg(`${p.nm} places “${TT[t].n}”.`);fx('place',c.k);
  // mason: does this tile extend the road/town that holds my mason?
  if(G.ex.tb&&!c.bonus){const b=G.figs.find(f=>f.p===c.p&&f.k==='bld');if(b){const T=G.tiles[c.k];const br=find(b.s);if(TSEG[t].some((s,i)=>(s.ty==='C'||s.ty==='R')&&find(T.s0+i)===br)){c.bonusEarned=true;lg(`🔨 ${p.nm}’s mason works on: an extra turn after this one.`,'good')}}}
  if(!figMoves(c.p).some(x=>x.act==='fig')){finishTurn()}}
function figMoves(pi){const c=G.cur,p=P(pi),T=G.tiles[c.k],o=[{act:'skip'}];if(!T)return o;
  TSEG[T.t].forEach((s,i)=>{const root=find(T.s0+i),fs=figsIn(root);
    if(!fs.length){if(p.sup.f>0)o.push({act:'fig',k:'f',l:i});if(p.sup.big>0)o.push({act:'fig',k:'big',l:i})}
    const mine=fs.some(f=>f.p===pi&&(f.k==='f'||f.k==='big'));
    if(mine&&(s.ty==='C'||s.ty==='R')&&p.sup.bld>0)o.push({act:'fig',k:'bld',l:i});
    if(mine&&s.ty==='F'&&p.sup.pig>0)o.push({act:'fig',k:'pig',l:i})});
  return o}
function figsIn(root){return G.figs.filter(f=>find(f.s)===root)}
function doFig(m){const c=G.cur,p=P(c.p),T=G.tiles[c.k];const s=TSEG[T.t][m.l];p.sup[m.k]--;G.figs.push({p:c.p,k:m.k,s:T.s0+m.l});c.figPlaced={k:m.k,l:m.l};
  lg(`${p.nm} sets a ${m.k==='f'?ROLE[s.ty]:FIGN[m.k]+(m.k==='big'?' ('+ROLE[s.ty]+')':'')} on the ${FEAT[s.ty]}.`);fx('fig',c.k);finishTurn()}
function finishTurn(){const c=G.cur;scoreAfter();G.step=null;
  if(c.bonusEarned&&tilesLeft()>0){G.stats.bonus++;startTurn(c.p,true);return}
  nextPlayer(false)}
// ---------- scoring ----------
function nbrCount(x,y){let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(G.tiles[key(x+dx,y+dy)])n++;return n}
function strength(fs){const s={};for(const f of fs){const v=f.k==='f'?1:f.k==='big'?2:0;if(v)s[f.p]=(s[f.p]||0)+v}return s}
function majority(fs){const s=strength(fs);const top=Math.max(0,...Object.values(s));return top>0?Object.keys(s).filter(k=>s[k]===top).map(Number):[]}
function featPoints(F,complete){if(F.ty==='C'){const n=F.tiles.length;if(complete)return F.cat?3*(n+F.pen):2*(n+F.pen);return F.cat?0:n+F.pen}
  if(F.ty==='R'){const n=F.tiles.length;if(complete)return F.inn?2*n:n;return F.inn?0:n}
  if(F.ty==='M')return complete?9:nbrCount(F.x,F.y);return 0}
function scoreAfter(){const c=G.cur,T=G.tiles[c.k];const [x,y]=unkey(c.k);const roots=new Set();
  TSEG[T.t].forEach((s,i)=>{if(s.ty==='C'||s.ty==='R')roots.add(find(T.s0+i))});
  for(const r of roots){const F=G.fd[r];if(!F.done&&F.oe.length===0)complete(r)}
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const N=G.tiles[key(x+dx,y+dy)];if(!N||!TT[N.t].mon)continue;const mi=TSEG[N.t].findIndex(s=>s.ty==='M');const r=find(N.s0+mi);if(!G.fd[r].done&&nbrCount(x+dx,y+dy)===9)complete(r)}}
function complete(r){const F=G.fd[r];F.done=1;const fs=figsIn(r),win=majority(fs),pts=featPoints(F,true);const c=G.cur;
  const cat=F.ty==='C'?'town':F.ty==='R'?'road':'priory';G.stats.scored[cat+(F.cat?'+basilica':F.inn?'+tavern':'')]=(G.stats.scored[cat+(F.cat?'+basilica':F.inn?'+tavern':'')]||0)+1;
  const what=F.ty==='C'?`town of ${F.tiles.length} tile${F.tiles.length>1?'s':''}${F.pen?` and ${F.pen} banner${F.pen>1?'s':''}`:''}${F.cat?' with a basilica':''}`:F.ty==='R'?`road of ${F.tiles.length} tile${F.tiles.length>1?'s':''}${F.inn?' with a tavern':''}`:'priory';
  for(const w of win){P(w).score+=pts;P(w).sc[cat==='priory'?'priory':cat]+=pts}
  if(win.length){lg(`✔ The ${what} is finished: ${win.map(w=>P(w).nm).join(' and ')} score${win.length>1?'':'s'} ${pts}.`,'good');fx('score',{r,pts,win})}
  else if(F.ty!=='M')lg(`The ${what} is finished, but nobody stands in it.`);
  if(F.ty==='C'&&win.length&&pts>=16)storyBeat('bigtown',{win,pts});
  // merchants: whoever closes a town takes its goods
  if(F.ty==='C'&&G.ex.tb){const got=GOODS.filter(g=>F.gd[g]);if(got.length){const p=P(c.p);for(const g of GOODS)p.goods[g]+=F.gd[g];lg(`🧺 ${p.nm} closed it and takes ${got.map(g=>F.gd[g]+' '+g).join(', ')}.`,'good');fx('goods',c.p)}}
  // everyone standing in it goes home (masons too)
  for(const f of fs){P(f.p).sup[f.k]++;G.figs.splice(G.figs.indexOf(f),1)}
  if(fs.length)fx('home',r);c.scored.push({r,pts,win,ty:F.ty})}
function storyBeat(kind,d){let t='';
  if(kind==='half')t='Half the tiles are down. Smoke rises from new hearths, and the valley is starting to look like a country.';
  if(kind==='bigtown')t=`The walls of the great town close: ${d.win.map(w=>P(w).nm).join(' and ')}’s wardens claim ${d.pts} points.`;
  G.story.push({t,n:G.turn});lg('📜 '+t,'story');fx('story',t)}
// ---------- final scoring ----------
function fieldCities(F){const s=new Set();for(const c of F.ct){const r=find(c);if(G.fd[r].done)s.add(r)}return s}
function finalScores(){// returns {per player breakdown} without changing G
  const add={};for(const p of G.pl)add[p.i]={road:0,town:0,priory:0,field:0,goods:0};const det=[];
  for(const r in G.fd){const F=G.fd[r];const root=+r;if(F.done)continue;const fs=figsIn(root);if(!fs.length)continue;const win=majority(fs);if(!win.length)continue;
    if(F.ty==='F'){const n=fieldCities(F).size;if(!n)continue;for(const w of win){const pig=fs.some(f=>f.p===w&&f.k==='pig');add[w].field+=n*(pig?4:3)}det.push({ty:'F',r:root,n,win});continue}
    const pts=featPoints(F,false);const cat=F.ty==='C'?'town':F.ty==='R'?'road':'priory';for(const w of win)add[w][cat]+=pts;det.push({ty:F.ty,r:root,pts,win})}
  if(G.ex.tb)for(const g of GOODS){const top=Math.max(...G.pl.map(p=>p.goods[g]));if(top>0)for(const p of G.pl)if(p.goods[g]===top)add[p.i].goods+=10}
  return {add,det}}
function finish(){if(G.over)return;G.step=null;const {add,det}=finalScores();
  for(const d of det){if(d.ty==='F'){if(!d.n)continue;G.stats.scored['field']=(G.stats.scored['field']||0)+1;if(G.figs.some(f=>f.k==='pig'&&find(f.s)===d.r&&d.win.includes(f.p)))G.stats.scored['field+hog']=(G.stats.scored['field+hog']||0)+1}
    else{const F=G.fd[d.r];const k='end-'+(d.ty==='C'?'town':d.ty==='R'?'road':'priory');G.stats.scored[k]=(G.stats.scored[k]||0)+1;if(F.cat||F.inn)G.stats.scored[k+'-zero']=(G.stats.scored[k+'-zero']||0)+1}}
  if(G.ex.tb&&G.pl.some(p=>GOODS.some(g=>p.goods[g])))G.stats.scored['goods-majority']=1;
  for(const p of G.pl){const a=add[p.i];p.end=a;for(const k in a)p.score+=a[k]}
  lg('The last tile is down. Unfinished roads, towns and priories score, then the farmers are counted.','big');
  for(const p of G.pl){const a=p.end;const bits=Object.entries(a).filter(([k,v])=>v).map(([k,v])=>`${k} ${v}`);lg(`${p.nm}: ${bits.length?bits.join(', '):'nothing more'} → ${p.score}.`)}
  const top=Math.max(...G.pl.map(p=>p.score));const w=G.pl.filter(p=>p.score===top);
  G.over={win:w.map(p=>p.i),scores:G.pl.map(p=>p.score)};G.winner=w.map(p=>p.nm).join(' & ');G.winText=`${G.winner} ${w.length>1?'share the valley':'wins'} with ${top} points.`;lg('🏆 '+G.winText,'big');fx('win')}
// ---------- probe: what a placement would do, without changing anything (for the computer, previews and tests) ----------
function probe(t,r,x,y){const k=key(x,y),segs=TSEG[t],n=segs.length;const par=[];const node={};let nn=n;for(let i=0;i<n;i++)par.push(i);
  const nodeOf=root=>{if(node[root]==null){node[root]=nn++;par.push(node[root])}return node[root]};
  const f=a=>{while(par[a]!==a)a=par[a]=par[par[a]];return a};const link=(a,b)=>{a=f(a);b=f(b);if(a!==b)par[b]=a};const cut=new Set();
  for(let s=0;s<4;s++){const nk=key(x+DX[s],y+DY[s]),N=G.tiles[nk];if(!N)continue;const ty=edgeT(t,r,s);
    if(ty==='C'||ty==='R'){const a=SIDESEG[t][(s-r+4)%4],b=find(N.s0+SIDESEG[N.t][(OPP(s)-N.r+4)%4]);link(a,nodeOf(b));cut.add(k+','+s);cut.add(nk+','+OPP(s))}
    for(const [hh,nh] of [[2*s,2*OPP(s)+1],[2*s+1,2*OPP(s)]]){const a=HALFSEG[t][(hh-2*r+8)%8],b=HALFSEG[N.t][(nh-2*N.r+8)%8];if(a>=0&&b>=0)link(a,nodeOf(find(N.s0+b)))}}
  const roots=Object.keys(node).map(Number);const grp={};
  const gOf=i=>{const g=f(i);if(!grp[g])grp[g]={id:g,segs:[],roots:[],ty:null};return grp[g]};
  for(let i=0;i<n;i++){const g=gOf(i);g.segs.push(i);g.ty=segs[i].ty}
  for(const rt of roots){const g=gOf(node[rt]);g.roots.push(rt)}
  const nb=nbrCount(x,y)+1;const out=[];
  for(const id in grp){const g=grp[id];if(!g.segs.length)continue;const ty=g.ty;
    if(ty==='C'||ty==='R'){const tiles=new Set([k]);let oe=[],pen=0,inn=0,cat=0;const gd={wine:0,grain:0,cloth:0};
      for(const rt of g.roots){const F=G.fd[rt];for(const q of F.tiles)tiles.add(q);oe=oe.concat(F.oe);if(ty==='C'){pen+=F.pen;cat=cat||F.cat;for(const q of GOODS)gd[q]+=F.gd[q]}else inn=inn||F.inn}
      for(const i of g.segs){const s=segs[i];for(const e of s.e)oe.push(k+','+((e+r)%4));if(ty==='C'){pen+=s.p;cat=cat||s.cat;if(s.g)gd[s.g]++}else inn=inn||s.inn}
      oe=oe.filter(e=>!cut.has(e));g.tiles=tiles.size;g.oe=oe;g.pen=pen;g.cat=cat;g.inn=inn;g.gd=gd;g.done=oe.length===0}
    else if(ty==='F'){const cs=new Set();for(const rt of g.roots)for(const c of G.fd[rt].ct)cs.add(find(c));g.cityRoots=[...cs];g.localCities=[];for(const i of g.segs)for(const c of segs[i].ac)g.localCities.push(c)}
    else{g.nb=nb;g.done=nb===9}
    g.figs=[];for(const rt of g.roots)for(const q of figsIn(rt))g.figs.push(q);out.push(g)}
  const segGroup=[];for(let i=0;i<n;i++){const g=f(i);segGroup[i]=out.findIndex(q=>q.id===g)}
  // neighbouring priories this tile would complete
  const mons=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const N=G.tiles[key(x+dx,y+dy)];if(!N||!TT[N.t].mon)continue;const mi=TSEG[N.t].findIndex(s=>s.ty==='M');const rt=find(N.s0+mi);if(!G.fd[rt].done&&nbrCount(x+dx,y+dy)===8)mons.push(rt)}
  return {groups:out,segGroup,mons}}
// ---------- the move list ----------
function sideToAct(){if(!G||G.over||!G.cur)return -1;return G.cur.p}
function validMoves(s){if(!G||G.over)return[];if(s===undefined)s=sideToAct();if(s!==sideToAct()||s<0)return[];
  if(G.step==='place')return legalPlacements(G.cur.t).map(q=>({act:'place',x:q.x,y:q.y,r:q.r}));
  if(G.step==='fig')return figMoves(s);return[]}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function isLegal(m,s){if(m.act==='place')return G.step==='place'&&TT[G.cur.t]&&symRots(G.cur.t).includes(m.r)&&canPlace(G.cur.t,m.r,m.x,m.y);return validMoves(s).some(x=>same(x,m))}
function performMove(m,s){if(s===undefined)s=sideToAct();if(!G||G.over||s!==sideToAct()||!m||!isLegal(m,s))return {success:false,error:'illegal move '+JSON.stringify(m)};
  const before=G.cur;
  switch(m.act){case 'place':doPlace(m);break;case 'fig':doFig(m);break;case 'skip':finishTurn();break}
  if(typeof onMoveDone==='function')onMoveDone(m,s,before);
  if(typeof refresh==='function'&&!UI.sim)refresh();return {success:true}}
// ---------- invariants and test hooks ----------
function checkInvariants(){const v=[];if(!G)return v;
  // every tile counted exactly once
  const inHand=G.cur&&G.step==='place'?1:0;const n=G.stack.length+G.rstack.length+(G.lake!=null?1:0)+G.order.length+G.disc.length+inHand;if(n!==G.total)v.push(`tiles ${n} != ${G.total}`);
  // every figure counted exactly once
  for(const p of G.pl)for(const k in G.figTotal[p.i]){const on=G.figs.filter(f=>f.p===p.i&&f.k===k).length;if(p.sup[k]+on!==G.figTotal[p.i][k])v.push(`${p.nm} ${k}: ${p.sup[k]}+${on}`);if(p.sup[k]<0)v.push('negative supply')}
  for(const f of G.figs){const r=find(f.s),F=G.fd[r];if(!F)v.push('figure on a dead root');else{if(F.done)v.push(`figure left in a finished ${F.ty}`);
    if(f.k==='bld'&&!figsIn(r).some(q=>q.p===f.p&&(q.k==='f'||q.k==='big')))v.push('mason without its owner');if(f.k==='pig'&&!figsIn(r).some(q=>q.p===f.p&&(q.k==='f'||q.k==='big')))v.push('hog without its farmer');
    if((f.k==='bld'&&F.ty!=='C'&&F.ty!=='R')||(f.k==='pig'&&F.ty!=='F'))v.push('special figure on the wrong feature')}}
  for(const k of G.order){const T=G.tiles[k],[x,y]=unkey(k);for(let s=0;s<4;s++){const N=G.tiles[key(x+DX[s],y+DY[s])];if(N&&edgeT(T.t,T.r,s)!==edgeT(N.t,N.r,OPP(s)))v.push('edge mismatch at '+k)}}
  for(const r in G.fd){const F=G.fd[r];if(G.par[r]!=+r)v.push('fd on non-root');if(F.oe)for(const e of F.oe){const [x,y,s]=e.split(',').map(Number);if(G.tiles[key(x+DX[s],y+DY[s])])v.push('open edge faces a tile '+e)}if((F.ty==='C'||F.ty==='R')&&!F.oe.length&&!F.done&&!(G.step==='fig'&&F.tiles.includes(G.cur.k)))v.push('closed but unscored '+F.ty)}
  for(const p of G.pl){const s=Object.values(p.sc).reduce((a,b)=>a+b,0)+Object.values(p.end).reduce((a,b)=>a+b,0);if(s!==p.score)v.push(`${p.nm} score ${p.score} != parts ${s}`)}
  if(G.ex.tb){const held=G.pl.reduce((a,p)=>a+GOODS.reduce((b,g)=>b+p.goods[g],0),0);let inDone=0;for(const r in G.fd){const F=G.fd[r];if(F.ty==='C'&&F.done)inDone+=GOODS.reduce((b,g)=>b+F.gd[g],0)}if(held!==inDone)v.push(`goods ${held} != ${inDone} in closed towns`)}
  if(!G.over&&sideToAct()<0)v.push('stuck');if(!G.over&&!validMoves().length)v.push('no legal move in '+G.step);return v}
// rebuild the whole feature graph from the placed tiles and compare (slow; used by the tests)
function rebuildCheck(){const save=G;const v=[];const H=JSON.parse(JSON.stringify(G));G=Object.assign({},H,{tiles:{},order:[],frontier:{},sk:[],sl:[],par:[],fd:{},stats:{placed:0,scored:{}}});
  for(const k of save.order){const T=save.tiles[k];const [x,y]=unkey(k);place(T.t,T.r,x,y)}
  const sig=g=>{const o=[];for(const r in g.fd){const F=g.fd[r];if(F.ty==='M')continue;const members=[];for(let i=0;i<g.par.length;i++){let a=i;while(g.par[a]!==a)a=g.par[a];if(a===+r)members.push(i)}o.push(F.ty+':'+members.sort((a,b)=>a-b).join('.')+':'+(F.tiles||[]).length+':'+(F.oe?F.oe.slice().sort().join('|'):'')+':'+(F.pen||0)+':'+(F.ct?[...new Set(F.ct)].length:0))}return o.sort().join('\n')};
  const a=sig(G),b=sig(save);G=save;if(a!==b)v.push('rebuilt graph differs');return v}
function render_game_to_text(){if(!G)return '{}';return JSON.stringify({turn:G.turn,step:G.step,cur:G.cur&&{p:G.cur.p,tile:TT[G.cur.t]&&TT[G.cur.t].n,bonus:G.cur.bonus},tilesLeft:tilesLeft(),placed:G.order.length,
  pl:G.pl.map(p=>({nm:p.nm,score:p.score,sup:p.sup,goods:p.goods})),figs:G.figs.map(f=>({p:f.p,k:f.k,on:FEAT[G.fd[find(f.s)].ty]})),log:G.log.slice(0,5).map(l=>l.t),over:G.over&&G.winText})}
