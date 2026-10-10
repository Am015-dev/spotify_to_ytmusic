// ---------- computer players ----------
// easy: random legal placement with a bias toward points; normal: greedy value of placement + follower incl. completion odds;
// hard: adds field/majority weighting and a one-ply look at the tiles still in the bag (can each open side still be filled?).
let AIPLAN=null;var HARDK={a:2,b:4,f:0,top:3,types:6,w:.6,cap:36};
const LVL={easy:{opp:.3,slots:false},normal:{opp:.8,slots:false},hard:{opp:.9,slots:true}};
function lvOf(s){return LVL[P(s).lv]?P(s).lv:'normal'}
// ---- what is still in the bag (public: anyone can count the tiles) ----
let FITC={key:'',m:{}};
function poolCounts(){const c={};for(const t of G.stack)c[t]=(c[t]||0)+1;for(const t of G.rstack)c[t]=(c[t]||0)+1;if(G.lake!=null)c[G.lake]=(c[G.lake]||0)+1;return c}
function fitCount(cx,cy,virt){const ck=G.turn+':'+tilesLeft();if(FITC.key!==ck){FITC={key:ck,m:{},pool:poolCounts()}}
  const need=[];for(let s=0;s<4;s++){const nx=cx+DX[s],ny=cy+DY[s];if(virt&&virt.x===nx&&virt.y===ny)need.push(edgeT(virt.t,virt.r,OPP(s)));else{const N=G.tiles[key(nx,ny)];need.push(N?edgeT(N.t,N.r,OPP(s)):'-')}}
  const sig=need.join('');if(FITC.m[sig]!=null)return FITC.m[sig];let n=0;
  for(const t in FITC.pool){const tt=+t;if(isRiver(tt))continue;for(let r=0;r<4;r++){let ok=true;for(let s=0;s<4;s++)if(need[s]!=='-'&&edgeT(tt,r,s)!==need[s]){ok=false;break}if(ok){n+=FITC.pool[t];break}}}
  return FITC.m[sig]=n}
// chance that a road/town with these open edges gets finished
function pDone(oe,lv,virt){if(!oe.length)return 1;const left=tilesLeft();if(left<=0)return 0;const cells=[...new Set(oe.map(e=>{const [x,y,s]=e.split(',').map(Number);return key(x+DX[s],y+DY[s])}))];
  const m=cells.length;const base=Math.max(.03,Math.pow(.78,m)*Math.min(1,left/(4*m+2)));
  if(LVL[lv].slots){// one-ply look at the bag: can each open side still be filled by some tile that is left?
    let q=1;for(const c of cells){const [x,y]=unkey(c);const f=fitCount(x,y,virt);if(!f)return 0.02;q*=Math.min(1,.55+f/left*3)}return base*q}
  return base}
// summary of a feature for valuing: from a board root or a probe group
function descRoot(r,lv){const F=G.fd[r];if(F.ty==='C'||F.ty==='R')return {ty:F.ty,tiles:F.tiles.length,oe:F.oe,pen:F.pen||0,cat:F.cat,inn:F.inn,done:F.done,p:F.done?1:pDone(F.oe,lv)};
  if(F.ty==='M'){const nb=nbrCount(F.x,F.y);return {ty:'M',nb,done:F.done}}
  const cs=[];const seen=new Set();for(const c of F.ct){const q=find(c);if(seen.has(q))continue;seen.add(q);const C=G.fd[q];cs.push(C.done?1:pDone(C.oe,lv))}return {ty:'F',cities:cs}}
function descGroup(g,pr,lv,virt){if(g.ty==='C'||g.ty==='R')return {ty:g.ty,tiles:g.tiles,oe:g.oe,pen:g.pen||0,cat:g.cat,inn:g.inn,done:g.done,p:g.done?1:pDone(g.oe,lv,virt)};
  if(g.ty==='M')return {ty:'M',nb:g.nb,done:g.done};
  // field: its towns after this placement (a town joined by this tile is looked up in its new group)
  const rootToG={};pr.groups.forEach((q,j)=>{if(q.ty==='C')for(const r of q.roots)rootToG[r]=j});const seen=new Set();const cs=[];
  const addG=j=>{if(seen.has('g'+j))return;seen.add('g'+j);const q=pr.groups[j];cs.push(q.done?1:pDone(q.oe,lv,virt))};
  for(const r of g.cityRoots){if(rootToG[r]!=null)addG(rootToG[r]);else if(!seen.has(r)){seen.add(r);const C=G.fd[r];cs.push(C.done?1:pDone(C.oe,lv))}}
  for(const c of g.localCities)addG(pr.segGroup[c]);return {ty:'F',cities:cs}}
// expected final points of a feature for whoever holds the majority there
function worth(d,lv){const left=tilesLeft(),prog=1-left/Math.max(1,G.total);
  if(d.ty==='C'){const n=d.tiles,pen=d.pen,m=d.oe.length;if(d.done)return (d.cat?3:2)*(n+pen);return d.p*((d.cat?3:2)*(n+pen+m*.6))+(1-d.p)*(d.cat?0:n+pen)}
  if(d.ty==='R'){const n=d.tiles;if(d.done)return d.inn?2*n:n;return d.p*(d.inn?2:1)*(n+.8)+(1-d.p)*(d.inn?0:n)}
  if(d.ty==='M'){if(d.done)return 9;return d.nb+(9-d.nb)*Math.min(.9,left/(G.np*6))}
  let v=0;for(const p of d.cities)v+=p>=1?3:(lv==='hard'?3*p:1.2)*(lv==='hard'?1:.8+prog*.4);return v}
function shares(figs,extra){const s=strength(figs);if(extra){for(const k in extra)s[k]=(s[k]||0)+extra[k]}const top=Math.max(0,...Object.values(s));const o={};if(top>0)for(const k in s)if(s[k]===top)o[k]=1;return o}
function valueMap(d,figs,lv,extra){const sh=shares(figs,extra);const w=worth(d,lv);const o={};for(const k in sh)o[k]=w;return o}
// value of one candidate placement for seat s (without the follower)
function placeValue(pr,s,lv,virt){const dl={};for(const p of G.pl)dl[p.i]=0;const why=[];
  pr.groups.forEach(g=>{if(g.ty==='F'&&lv==='easy')return;const after=valueMap(descGroup(g,pr,lv,virt),g.figs,lv);let before={};
    for(const r of g.roots){const b=valueMap(descRoot(r,lv),figsIn(r),lv);for(const k in b)before[k]=(before[k]||0)+b[k]}
    for(const p of G.pl){const d=(after[p.i]||0)-(before[p.i]||0);dl[p.i]+=d}
    if(g.done&&g.figs.length){const mine=g.figs.filter(f=>f.p===s).length;dl[s]+=mine*1.2;const win=Object.keys(shares(g.figs));why.push({k:'close',ty:g.ty,pts:worth(descGroup(g,pr,lv,virt),lv),win:win.map(Number),mine})}
    else if(!g.done&&g.roots.length&&(after[s]||0)-(before[s]||0)>.4)why.push({k:'grow',ty:g.ty,g});
    else if(g.roots.length&&G.pl.some(p=>p.i!==s&&(after[p.i]||0)-(before[p.i]||0)<-.8))why.push({k:'hurt',ty:g.ty,who:G.pl.filter(p=>p.i!==s&&(after[p.i]||0)-(before[p.i]||0)<-.8).map(p=>p.i)})});
  for(const r of pr.mons){const F=G.fd[r];const fs=figsIn(r);const sh=shares(fs);for(const k in sh)dl[k]+=9-nbrCount(F.x,F.y)-0;if(sh[s])why.push({k:'priory'})}
  const o=LVL[lv].opp;let worst=0;for(const p of G.pl)if(p.i!==s){const lead=p.score>=Math.max(...G.pl.map(q=>q.score))&&lv==='hard'?1.2:1;worst=Math.max(worst,dl[p.i]*lead)}
  return {v:dl[s]-o*worst,why,dl}}
// value of putting a figure on group/root desc d (already holding figs)
function figValue(k,d,figs,s,lv){const p=P(s),left=tilesLeft(),prog=1-left/Math.max(1,G.total);
  if(k==='f'||k==='big'){const w=k==='big'?2:1;const mine=valueMap(d,figs,lv,{[s]:w})[s]||0;if(d.done)return mine+.5;
    let cost=.9+(p.sup.f<=1?3:p.sup.f<=3?1.2:0);
    if(lv==='hard'&&d.ty!=='F'){const fv=(HARDK.a+HARDK.b*(1-prog))*(p.sup.f<=2?1.6:1);const pc=d.ty==='M'?Math.min(.9,left/(G.np*6)):d.p;cost=.3+(1-pc)*fv}
    if(d.ty==='F')cost=2+7*(1-prog)+(lv==='hard'?HARDK.f:0);if(k==='big')cost+=1.5+(1-prog)*2;
    if(d.ty==='R'&&d.oe&&d.oe.length&&d.p<.2)cost+=2;return mine-cost}
  if(k==='bld'){if(d.done||left<G.np*2)return -1;return (d.p<.05?.5:3.2)*Math.min(1,left/20)+.3}
  if(k==='pig'){const sh=shares(figs);if(!sh[s])return -1;return d.cities.reduce((a,q)=>a+(q>=1?1:q*.6),0)-.3}
  return 0}
function figOptionsFromProbe(pr,s){const p=P(s),o=[];pr.groups.forEach(g=>{const i=g.segs[0];
    if(!g.figs.length){if(p.sup.f>0)o.push({k:'f',l:i,g});if(p.sup.big>0)o.push({k:'big',l:i,g})}
    const mine=g.figs.some(f=>f.p===s&&(f.k==='f'||f.k==='big'));if(mine&&(g.ty==='C'||g.ty==='R')&&p.sup.bld>0)o.push({k:'bld',l:i,g});if(mine&&g.ty==='F'&&p.sup.pig>0)o.push({k:'pig',l:i,g})});return o}
// the full plan: best placement + follower
function aiPlan(s,lvIn){const lv=lvIn||lvOf(s),t=G.cur.t,places=legalPlacements(t);let best=null;const all=[];
  for(const q of places){const virt={x:q.x,y:q.y,t,r:q.r};const pr=probe(t,q.r,q.x,q.y);const pv=placeValue(pr,s,lv,virt);
    let bonus=0;if(G.ex.tb&&!G.cur.bonus){const b=G.figs.find(f=>f.p===s&&f.k==='bld');if(b){const br=find(b.s);if(pr.groups.some(g=>(g.ty==='C'||g.ty==='R')&&g.roots.includes(br)))bonus=G.stack.length>1?4:0}}
    let bf=null,bfv=0;for(const op of figOptionsFromProbe(pr,s)){const d=descGroup(op.g,pr,lv,virt);const v=figValue(op.k,d,op.g.figs,s,lv);if(v>bfv){bfv=v;bf=op}}
    const tot=pv.v+bonus+bfv;const c={q,v:tot,pv,bf,bfv,bonus,pr};all.push(c);if(!best||tot>best.v)best=c}
  if(lv==='hard'&&all.length>1&&tilesLeft()>1)best=lookAhead(s,all)||best;
  if(lv==='easy'&&all.length){// mostly random, nudged toward points
    const r=rnd(100);if(r<45){all.sort((a,b)=>b.pv.dl[s]-a.pv.dl[s]);best=all[rnd(Math.min(3,all.length))]}else best=all[rnd(all.length)];
    if(best.bf&&rnd(100)<40)best.bf=null;if(!best.bf&&rnd(100)<35){const ops=figOptionsFromProbe(best.pr,s).filter(o=>o.k==='f');if(ops.length)best.bf=ops[rnd(ops.length)]}}
  const place={act:'place',x:best.q.x,y:best.q.y,r:best.q.r};const fig=best.bf?{act:'fig',k:best.bf.k,l:best.bf.l}:{act:'skip'};
  return {place,fig,why:best.pv.why,bonus:best.bonus,figOpt:best.bf,v:best.v,pr:best.pr}}
// hard: one ply ahead. For the best few plans, play them on a copy of the state and ask what the next rival could
// gain with any tile still in the bag (weighted by how many are left; the hidden order of the bag is never used).
function lookAhead(s,all){all.sort((a,b)=>b.v-a.v);const top=all.slice(0,HARDK.top);const pool=poolCounts();
  const types=Object.keys(pool).map(Number).filter(t=>!isRiver(t)).sort((a,b)=>pool[b]-pool[a]).slice(0,HARDK.types);if(!types.length)return null;
  const snap=JSON.stringify(G),sim=UI.sim;UI.sim=1;let best=null;
  try{for(const c of top){G=JSON.parse(snap);FITC.key='';const m=c.q;doPlace({act:'place',x:m.x,y:m.y,r:m.r});
      if(G.step==='fig'&&G.cur.p===s){if(c.bf)doFig({act:'fig',k:c.bf.k,l:c.bf.l});else finishTurn()}
      c.threat=0;if(!G.over&&G.cur.p!==s){const o=G.cur.p;let E=0,W=0;for(const t of types){const L=legalPlacements(t);let bv=0;const step=Math.max(1,Math.floor(L.length/HARDK.cap));
          for(let i=0;i<L.length;i+=step){const q=L[i];const pv=placeValue(probe(t,q.r,q.x,q.y),o,'normal',{x:q.x,y:q.y,t,r:q.r});const v=pv.dl[o]-pv.dl[s];if(v>bv)bv=v}E+=pool[t]*bv;W+=pool[t]}c.threat=W?E/W:0}
      c.v2=c.v-HARDK.w*c.threat;if(!best||c.v2>best.v2)best=c}}
  finally{G=JSON.parse(snap);UI.sim=sim;FITC.key=''}
  return best}
function aiMove(s){if(s==null)s=sideToAct();if(s<0)return null;
  if(G.step==='place'){const plan=aiPlan(s);AIPLAN={turn:G.turn,p:s,bonus:G.cur.bonus,plan};return plan.place}
  if(G.step==='fig'){if(AIPLAN&&AIPLAN.turn===G.turn&&AIPLAN.p===s&&isLegal(AIPLAN.plan.fig,s))return AIPLAN.plan.fig;return bestFigNow(s)}
  return null}
// follower choice on an already placed tile (used when no plan exists, e.g. a human asks the advisor after placing)
function bestFigNow(s,lvIn){const lv=lvIn||lvOf(s);const T=G.tiles[G.cur.k];let best={act:'skip'},bv=0;
  for(const m of figMoves(s)){if(m.act!=='fig')continue;const r=find(T.s0+m.l);const v=figValue(m.k,descRoot(r,lv),figsIn(r),s,lv);if(v>bv){bv=v;best=m}}return best}
// ---------- the advisor: the normal computer's choice, in plain words ----------
function adviceText(plan,s){const bits=[];const nm=i=>P(i).nm;
  for(const w of plan.why){if(w.k==='close'){const others=w.win.filter(i=>i!==s);bits.push(`closes the ${FEAT[w.ty]} for ${Math.round(w.pts)} points${w.win.includes(s)?'':' (for '+others.map(nm).join(' & ')+')'}${w.mine?` and frees your follower${w.mine>1?'s':''}`:''}`)}
    else if(w.k==='grow'){const g=w.g;bits.push(`grows the ${FEAT[w.ty]} you already hold${g.tiles?` to ${g.tiles} tiles`:''}${g.oe&&g.oe.length?` (${g.oe.length} open side${g.oe.length>1?'s':''} left)`:''}`)}
    else if(w.k==='hurt')bits.push(`makes ${w.who.map(nm).join(' & ')}’s ${FEAT[w.ty]} harder to finish`);
    else if(w.k==='priory')bits.push('surrounds your priory for 9 points')}
  if(plan.bonus)bits.push('your mason earns an extra turn');
  const f=plan.figOpt;if(f){const g=f.g;const role=f.k==='f'?ROLE[g.ty]:FIGN[f.k];
    if(f.k==='bld')bits.push(`puts your mason on the ${FEAT[g.ty]}: each later tile that extends it gives you an extra turn`);
    else if(f.k==='pig')bits.push('puts your hog with your farmer: +1 per finished town at the end');
    else{const d=descGroup(g,plan.pr,'normal');const w=Math.round(worth(d,'normal'));
      bits.push(g.done?`scores at once with a ${role} (${w} points) and gets it back`:g.ty==='F'?`sends a farmer into the field (it pays 3 per finished town beside it at the end)`:`sets a ${role} on the ${FEAT[g.ty]} (about ${w} points once it is finished)`)}}
  if(!bits.length)bits.push('a quiet spot that gives nothing away');const t=bits.join('; ');return t.charAt(0).toUpperCase()+t.slice(1)+'.'}
